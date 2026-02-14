# DermSight API - Node.js/Express Backend

This is the Node.js/Express backend for the DermSight application, replacing the previous FastAPI implementation.

## Prerequisites

- Node.js 16+ 
- MongoDB 4.0+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and secret key:
```env
MONGODB_URI=mongodb://your_connection_string
MONGODB_DB=dermsight
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_DAYS=7
PORT=3000
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Project Structure

```
server/
├── config/
│   ├── auth.js          # JWT and password utilities
│   └── db.js            # MongoDB connection
├── middleware/
│   └── auth.js          # Authentication middleware
├── models/
│   ├── User.js          # User schema
│   ├── TriageCase.js    # Triage case schema
│   └── PasswordReset.js # Password reset token schema
├── routes/
│   ├── auth.js          # Authentication endpoints
│   └── triage.js        # Triage case endpoints
├── server.js            # Main application
├── package.json         # Dependencies
└── .env                 # Environment variables (not in version control)
```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/forgot` - Request password reset

### Triage (`/triage`)
- `POST /triage/upload` - Upload an image for triage
- `GET /triage/cases` - List all triage cases
- `GET /triage/cases/:case_id` - Get a specific case

### Health Check
- `GET /health` - Server health check

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `MONGODB_DB` | Database name | `dermsight` |
| `SECRET_KEY` | JWT secret key | Required |
| `ACCESS_TOKEN_EXPIRE_DAYS` | Token expiration in days | `7` |
| `PORT` | Server port | `3000` |
| `UPLOAD_DIR` | Directory for file uploads | `./uploads` |

## Frontend Integration

The frontend should be updated to use the following:

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

### CORS
The API accepts requests from:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Update the CORS origins in `server.js` if your frontend runs on a different port.

### Authentication Header
Include JWT token in requests:
```javascript
Authorization: Bearer <access_token>
```

## Key Differences from FastAPI Version

1. **Async/Await**: Uses Node.js Promise-based async/await instead of Python async syntax
2. **Database**: Mongoose ODM for MongoDB instead of Motor (Motor was async driver)
3. **Password Hashing**: bcryptjs instead of passlib
4. **JWT**: jsonwebtoken instead of python-jose
5. **File Upload**: Multer instead of FastAPI's UploadFile
6. **Validation**: Express request handlers instead of Pydantic models
7. **Error Handling**: Express error middleware instead of FastAPI exceptions

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation/verification
- **dotenv** - Environment variable management
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **express-async-errors** - Async error handling

## Development

For development with auto-reload, use:
```bash
npm run dev
```

This requires nodemon to be installed (included in devDependencies).

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` is correct
- Verify network connectivity to MongoDB server

### Port Already in Use
Change the `PORT` in `.env` or run:
```bash
PORT=3001 npm start
```

### CORS Issues
Update the `origin` array in `server.js` to match your frontend URL

## Migration Notes

This backend maintains API compatibility with the previous FastAPI version. All endpoints return the same response formats to ensure seamless frontend integration.
