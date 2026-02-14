# Frontend Integration Guide - Express Backend

This guide helps update your React frontend to work with the new Express.js backend.

## Quick Start

### 1. Update API Base URL

Find your API client configuration (usually in `src/api.js` or `src/services/api.js`):

**Before (FastAPI):**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**After (Express):**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Update Token Handling

The token format remains the same. Ensure your auth logic does:

```javascript
// Get token from login response
const { access_token, user } = response.data;

// Store token
localStorage.setItem('token', access_token);

// Add to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. File Upload Changes

**Before (FastAPI):**
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('note', note);

const response = await api.post('/triage/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

**After (Express):**
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('note', note);

// Same code - Express/Multer handles FormData the same way
const response = await api.post('/triage/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

## API Endpoints Reference

### Authentication Endpoints

#### Sign Up
```javascript
POST /auth/signup

Request:
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "doctor"
}

Response (201):
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "doctor",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Login
```javascript
POST /auth/login

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "doctor",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Forgot Password
```javascript
POST /auth/forgot

Request:
{
  "email": "user@example.com"
}

Response (202):
{
  "message": "If the account exists, a reset link will be sent."
}
```

### Triage Endpoints

#### Upload Case
```javascript
POST /triage/upload

Request: FormData
- image: File (image file)
- note: string (optional)

Response (201):
{
  "id": "507f1f77bcf86cd799439011",
  "filename": "image.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 102400,
  "note": "Suspicious lesion",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### List Cases
```javascript
GET /triage/cases?limit=20&skip=0

Response (200):
[
  {
    "id": "507f1f77bcf86cd799439011",
    "filename": "image.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 102400,
    "note": "Suspicious lesion",
    "created_at": "2024-01-15T10:30:00Z"
  },
  ...
]
```

#### Get Single Case
```javascript
GET /triage/cases/507f1f77bcf86cd799439011

Response (200):
{
  "id": "507f1f77bcf86cd799439011",
  "filename": "image.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 102400,
  "note": "Suspicious lesion",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Example React Component

Here's an example of how to use the API in a React component:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default function UploadCase() {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('note', note);

      const response = await api.post('/triage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful:', response.data);
      // Handle success...
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add notes (optional)"
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## Common Errors and Fixes

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Ensure the frontend URL is in the CORS whitelist in `server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
```

### 401 Unauthorized
```
Error: Invalid or expired token
```

**Solutions:**
- Check token is being sent in Authorization header
- Verify token format: `Bearer <token>`
- Check token hasn't expired (default: 7 days)
- Try logging in again

### 422 Validation Error
```json
{ "detail": "Invalid email format" }
```

**Solutions:**
- Ensure email is valid format
- Ensure password is at least 8 characters
- Check all required fields are provided

### File Upload Errors

**413 - File too large:**
- Maximum file size is 10MB
- Reduce file size

**415 - Unsupported media type:**
- Only image files are accepted
- Use PNG, JPG, GIF, etc.

## Environment Configuration

If testing on different ports, update `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Then in your app:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

## Vite Proxy Setup (Optional)

If you want to use API proxy in Vite:

**vite.config.js:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

**Then use:**
```javascript
const api = axios.create({
  baseURL: '/api',
});
```

## Testing the Connection

Run this in your browser console to test the API:

```javascript
// Test health check
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(d => console.log('Health:', d))
  .catch(e => console.error('Error:', e));

// Test signup
fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }),
})
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e));
```

## Performance Tips

1. **Cache tokens safely:** Use localStorage but consider HTTPOnly cookies for production
2. **Handle errors gracefully:** Show user-friendly error messages
3. **Implement request debouncing:** Avoid rapid duplicate requests
4. **Monitor token expiration:** Refresh tokens before they expire (optional enhancement)
5. **Use lazy loading:** Load cases only when needed

## Production Deployment

When deploying to production, update the API base URL:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.yourdomain.com',
});
```

Set the environment variable on your server:
```
REACT_APP_API_URL=https://api.yourdomain.com
```

## Support

For issues:
1. Check browser console for error messages
2. Verify backend is running: `http://localhost:3000/health`
3. Check API response in Network tab
4. Review backend logs for detailed errors
