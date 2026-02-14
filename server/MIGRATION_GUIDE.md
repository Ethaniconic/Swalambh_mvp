# FastAPI to Express Migration Guide

This document outlines the conversion from FastAPI (Python) to Express (Node.js) backend.

## Why This Migration?

The main issue was the dependency conflict between PyTorch and FastAPI - different packages had conflicting Python version requirements. Migrating to Node.js/Express eliminates this problem entirely since PyTorch bindings aren't required in the backend.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

This will install all required packages listed in `package.json`.

### 2. Configure Environment Variables

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Then update `.env` with your MongoDB credentials:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dermsight
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_DAYS=7
PORT=3000
```

### 3. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will be available at `http://localhost:3000`

## API Compatibility

All existing endpoints remain the same:

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get token
- `POST /auth/forgot` - Request password reset

### Triage
- `POST /triage/upload` - Upload image
- `GET /triage/cases` - List cases
- `GET /triage/cases/:case_id` - Get specific case

### Health Check
- `GET /health` - Server status

## Key Changes Summary

| Aspect | FastAPI (Python) | Express (Node.js) |
|--------|------------------|-------------------|
| Framework | FastAPI | Express |
| Database Driver | Motor (async MongoDB) | Mongoose |
| ORM | Pydantic models | Mongoose schemas |
| Password Hashing | passlib + bcrypt | bcryptjs |
| JWT | python-jose | jsonwebtoken |
| File Upload | FastAPI's UploadFile | Multer |
| Validation | Pydantic | Express middleware |
| Runtime | Python 3.8+ | Node.js 16+ |

## File Structure Comparison

### Old FastAPI Structure
```
server/
├── __init__.py
├── main.py
├── auth.py
├── db.py
├── models.py
│   └── routes/
│       ├── __init__.py
│       ├── auth.py
│       └── triage.py
```

### New Express Structure
```
server/
├── config/
│   ├── auth.js
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── TriageCase.js
│   └── PasswordReset.js
├── routes/
│   ├── auth.js
│   └── triage.js
├── server.js
├── package.json
└── nodemon.json
```

## Important Notes

### Port Change
- **Old**: FastAPI runs on port 8000 by default
- **New**: Express runs on port 3000 by default

Update your frontend API calls if necessary, or change the PORT in `.env`.

### CORS Configuration
The server accepts requests from:
- `http://localhost:5173` (Vite default)
- `http://127.0.0.1:5173`

If your frontend runs on a different port, update the CORS origins in `server.js`.

### File Uploads
- Files are now stored in `./uploads` directory (configurable via `UPLOAD_DIR` in `.env`)
- File paths are stored in MongoDB
- Maximum file size is 10MB (same as before)

### Database
- MongoDB connection uses Mongoose (ODM)
- Schema definitions are in `models/` directory
- Automatic timestamps on collections
- TTL indexes for password resets (24-hour expiration)

### Authentication
- JWT tokens are still used for authentication
- Token format: `Authorization: Bearer <token>`
- Default expiration: 7 days (configurable via `ACCESS_TOKEN_EXPIRE_DAYS`)
- Access tokens include user ID (`sub` claim)

## Frontend Updates

### API Base URL
Update your frontend API client:

```javascript
// Before (FastAPI)
const api = axios.create({
  baseURL: 'http://localhost:8000'
});

// After (Express)
const api = axios.create({
  baseURL: 'http://localhost:3000'
});
```

### Vite Config (if applicable)
If you're proxying API calls, update:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Changed from 8000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

## Running Both Frontend & Backend

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

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB` | Database name | `dermsight` |
| `SECRET_KEY` | JWT signing key | Any random string |
| `ACCESS_TOKEN_EXPIRE_DAYS` | Token validity period | `7` |
| `PORT` | Server port | `3000` |
| `UPLOAD_DIR` | File upload location | `./uploads` |

## Troubleshooting

### MongoDB Connection Error
```
Error: MONGODB_URI is not set
```
- Ensure MongoDB is running
- Set `MONGODB_URI` in `.env`
- Check connection string format

### Port Already in Use
```
EADDRINUSE: address already in use :::3000
```
Change the port:
```bash
PORT=3001 npm start
```

### Module Not Found
```
Error: Cannot find module 'express'
```
Run: `npm install`

### CORS Errors
- Frontend and backend must be on same origin for cookies
- Check `origin` array in `server.js`
- Ensure `Authorization` header is properly set

## Differences in Behavior

### User Registration
- **FastAPI**: Used Pydantic validation
- **Express**: Uses basic validation in route handlers
- Response format remains identical

### File Uploads
- **FastAPI**: Handled via `UploadFile`
- **Express**: Handled via Multer
- File path is now stored in database

### Password Hashing
- **FastAPI**: Used passlib with bcrypt
- **Express**: Uses bcryptjs
- Both use bcrypt algorithm, fully compatible

### Error Responses
All error responses maintain the same format:
```json
{
  "detail": "Error message"
}
```

## Performance Considerations

### Node.js vs Python
- Node.js uses event-driven, non-blocking I/O
- Generally faster for I/O operations
- Less memory overhead per request
- Better scalability for concurrent connections

### Database Operations
- Mongoose adds a small overhead vs raw MongoDB driver
- Mongoose schemas provide better validation
- Indexes are automatically created (see `models/` files)

## Next Steps

1. Install dependencies: `npm install`
2. Create `.env` file with MongoDB credentials
3. Start the server: `npm run dev`
4. Update frontend API base URL to `http://localhost:3000`
5. Update any CORS origins if needed
6. Test all endpoints with your frontend

## Support

If you encounter any issues:
1. Check the console output for detailed error messages
2. Verify MongoDB is running and accessible
3. Check environment variables in `.env`
4. Review endpoint format in frontend API calls
5. Ensure Node.js version is 16 or higher: `node --version`

## Rollback (if needed)

If you need to go back to FastAPI:
1. The old Python files can be kept as backup
2. Ensure PyTorch/FastAPI dependencies are compatible
3. Switch Flask/FastAPI server back when ready

However, the Node.js version should eliminate the dependency conflict issue entirely.
