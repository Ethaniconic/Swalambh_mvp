import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { TriageCase } from '../models/TriageCase.js';
import { asyncHandler } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const DEFAULT_UPLOAD_DIR = resolve(__dirname, '../uploads');
const UPLOAD_DIR = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are supported'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

/**
 * Helper to serialize triage case
 */
const serializeCase = (doc) => ({
  id: doc._id.toString(),
  filename: doc.filename,
  content_type: doc.content_type,
  size_bytes: doc.size_bytes,
  note: doc.note,
  created_at: doc.createdAt,
});

/**
 * Helper to save uploaded file
 */
const saveUpload = async (file) => {
  if (!file.mimetype.startsWith('image/')) {
    const error = new Error('Only image uploads are supported');
    error.status = 415;
    throw error;
  }

  const safeFileName = `${uuidv4()}_${file.originalname}`;
  const filePath = join(UPLOAD_DIR, safeFileName);

  // Write file from buffer
  fs.writeFileSync(filePath, file.buffer);

  return {
    path: filePath,
    size: file.size,
  };
};

/**
 * POST /triage/upload
 * Upload an image for triage case
 */
router.post(
  '/upload',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }

    const { note } = req.body;

    try {
      const { path: filePath, size } = await saveUpload(req.file);

      const triageCase = new TriageCase({
        filename: req.file.originalname,
        content_type: req.file.mimetype,
        size_bytes: size,
        note: note || null,
        file_path: filePath,
      });

      await triageCase.save();

      return res.status(201).json({
        id: triageCase._id.toString(),
        filename: triageCase.filename,
        content_type: triageCase.content_type,
        size_bytes: triageCase.size_bytes,
        note: triageCase.note,
        created_at: triageCase.createdAt,
      });
    } catch (error) {
      if (error.status === 415) {
        return res.status(415).json({ detail: error.message });
      }
      if (error.message.includes('File exceeds')) {
        return res.status(413).json({ detail: 'File exceeds 10MB limit' });
      }
      throw error;
    }
  })
);

/**
 * GET /triage/cases
 * List all triage cases with pagination
 */
router.get(
  '/cases',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);

    const cases = await TriageCase.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return res.status(200).json(cases.map(serializeCase));
  })
);

/**
 * GET /triage/cases/:case_id
 * Get a specific triage case
 */
router.get(
  '/cases/:case_id',
  asyncHandler(async (req, res) => {
    const { case_id } = req.params;

    // Validate ObjectId format
    if (!case_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ detail: 'Invalid case id' });
    }

    const triageCase = await TriageCase.findById(case_id);
    if (!triageCase) {
      return res.status(404).json({ detail: 'Case not found' });
    }

    return res.status(200).json(serializeCase(triageCase));
  })
);

export default router;
