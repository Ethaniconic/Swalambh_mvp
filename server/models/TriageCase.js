import mongoose from 'mongoose';

const triageCaseSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    content_type: {
      type: String,
      required: true,
    },
    size_bytes: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: null,
    },
    file_path: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'triage_cases',
  }
);

// Create indexes
triageCaseSchema.index({ createdAt: -1 });

export const TriageCase = mongoose.model('TriageCase', triageCaseSchema);
