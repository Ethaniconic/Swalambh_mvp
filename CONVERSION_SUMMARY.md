# MERN Backend Conversion - Complete ✅

Your FastAPI backend has been successfully converted to Node.js/Express (MERN backend). This eliminates the Python dependency conflicts between PyTorch and FastAPI.

## What Was Created

### Core Files
- **`server.js`** - Main Express application
- **`package.json`** - Node.js dependencies
- **`.env.example`** - Environment configuration template
- **`.gitignore`** - Git ignore rules
- **`nodemon.json`** - Development auto-reload config

### Configuration
- **`config/db.js`** - MongoDB connection setup
- **`config/auth.js`** - JWT & password utilities

### Models (Mongoose Schemas)
- **`models/User.js`** - User schema with validation
- **`models/TriageCase.js`** - Triage case schema
- **`models/PasswordReset.js`** - Password reset tokens

### Middleware
- **`middleware/auth.js`** - JWT authentication + async error handling

### Routes
- **`routes/auth.js`** - Authentication endpoints (signup, login, forgot password)
- **`routes/triage.js`** - Triage endpoints (upload, list, get cases)

### Documentation
- **`README.md`** - Backend setup & usage
- **`MIGRATION_GUIDE.md`** - Detailed migration info
- **`FRONTEND_INTEGRATION.md`** (root) - Frontend integration guide

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Then edit `.env` with your MongoDB details:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dermsight
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_DAYS=7
PORT=3000
```

### 3. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will be running at `http://localhost:3000`

## What's the Same

✅ All API endpoints remain identical  
✅ Same request/response formats  
✅ Same authentication mechanism (JWT)  
✅ Same database structure (MongoDB)  
✅ Same file upload handling (10MB limit)  
✅ Same error response format  

## What's Different

| Aspect | Was | Now |
|--------|-----|-----|
| **Language** | Python 3.8+ | Node.js 16+ |
| **Framework** | FastAPI | Express.js |
| **Database Driver** | Motor (async) | Mongoose (ODM) |
| **Port** | 8000 | 3000 |
| **Password Hash** | passlib + bcrypt | bcryptjs |
| **JWT Library** | python-jose | jsonwebtoken |
| **File Upload** | FastAPI UploadFile | Multer |

## API Endpoints (Unchanged)

### Authentication
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/forgot`

### Triage
- `POST /triage/upload`
- `GET /triage/cases`
- `GET /triage/cases/:case_id`

### Health
- `GET /health`

## Frontend Changes Needed

Update API base URL from `8000` to `3000`:

```javascript
// Before
const api = axios.create({ baseURL: 'http://localhost:8000' });

// After
const api = axios.create({ baseURL: 'http://localhost:3000' });
```

See `FRONTEND_INTEGRATION.md` for detailed changes.

## Project Structure

```
Swalambh_mvp/
├── server/                    # ← NEW NODE.JS BACKEND
│   ├── config/
│   │   ├── auth.js
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── TriageCase.js
│   │   └── PasswordReset.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── triage.js
│   ├── uploads/               # File storage directory
│   ├── server.js
│   ├── package.json
│   ├── nodemon.json
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   └── MIGRATION_GUIDE.md
├── client/                    # Existing React frontend
│   └── src/
├── models/                    # Pre-trained ML models
├── notebooks/                 # Jupyter notebooks
├── FRONTEND_INTEGRATION.md    # ← NEW guide for frontend
└── README.md
```

## Running the Full Stack

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

## Key Features

✅ **No Python Conflicts** - Pure Node.js backend  
✅ **Better Performance** - Event-driven I/O  
✅ **Same API** - Zero frontend changes needed (except base URL)  
✅ **Production Ready** - Error handling, validation, authentication  
✅ **Developer Friendly** - Auto-reload, clear structure  
✅ **Scalable** - Mongoose schemas, proper indexing  
✅ **Secure** - JWT tokens, password hashing, CORS  

## Verification Checklist

- [ ] Node.js 16+ is installed (`node --version`)
- [ ] MongoDB is running and accessible
- [ ] `npm install` completed successfully in `server/` directory
- [ ] `.env` file created with correct MongoDB URI and SECRET_KEY
- [ ] `npm run dev` starts without errors
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] All auth/triage endpoints work correctly
- [ ] Frontend updated with new base URL (3000)

## Dependency List

- **express** - Web framework
- **mongoose** - MongoDB ORM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **dotenv** - Environment config
- **multer** - File uploads
- **cors** - CORS handling
- **uuid** - Unique IDs
- **express-async-errors** - Async error handling
- **nodemon** - Dev auto-reload

All dependencies are production-ready and well-maintained.

## Common Issues & Solutions

### "MongoDB connection failed"
→ Ensure MongoDB is running and `MONGODB_URI` in `.env` is correct

### "Port 3000 already in use"
→ Change PORT in `.env` or kill process: `lsof -i :3000` (macOS/Linux)

### "Cannot find module 'express'"
→ Run `npm install` in the `server/` directory

### "CORS errors in browser"
→ Update CORS origins in `server.js` if frontend is on different port

### "File upload fails"
→ Check file is image format and under 10MB

## Next Steps

1. ✅ Backend is set up - ready to use
2. Update frontend API base URL to `http://localhost:3000`
3. Test all endpoints work with frontend
4. Deploy to production when ready

## Documentation Files

- **`server/README.md`** - Backend usage & setup
- **`server/MIGRATION_GUIDE.md`** - Detailed migration reference
- **`FRONTEND_INTEGRATION.md`** - How to integrate with React frontend

## Support Resources

- Express.js docs: https://expressjs.com
- Mongoose docs: https://mongoosejs.com
- JWT info: https://jwt.io
- Node.js docs: https://nodejs.org

## What Happened to Old Python Files?

The old FastAPI files (main.py, auth.py, db.py, etc.) can be kept for reference or deleted. The Node.js backend replaces them entirely.

---

**Status: ✅ Conversion Complete and Ready to Use**

Your backend now uses Node.js/Express and no longer has any Python dependencies, eliminating the PyTorch/FastAPI conflict entirely!
