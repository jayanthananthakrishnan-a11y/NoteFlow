# NoteFlow Authentication Implementation Guide

This document provides a comprehensive guide to the authentication system implemented for NoteFlow.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Setup](#backend-setup)
4. [Frontend Integration](#frontend-integration)
5. [API Endpoints](#api-endpoints)
6. [Testing](#testing)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## Overview

NoteFlow now includes a complete user authentication system with:

- **User Registration**: Sign up as Creator or Viewer
- **User Login**: JWT-based authentication
- **User Logout**: Secure session termination
- **Role-Based Access**: Different dashboards for Creators and Viewers
- **Password Security**: Bcrypt hashing with salt rounds
- **Protected Routes**: Authentication middleware

## Architecture

### Technology Stack

**Backend:**
- Node.js + Express
- JWT for token-based authentication
- bcryptjs for password hashing
- express-validator for input validation
- CORS for cross-origin requests

**Frontend:**
- React
- React Router for navigation
- Fetch API for HTTP requests
- LocalStorage for token persistence

### Authentication Flow

```
┌─────────┐           ┌─────────┐           ┌──────────┐
│ Client  │           │ Backend │           │ Storage  │
└────┬────┘           └────┬────┘           └────┬─────┘
     │                     │                     │
     │  1. Signup/Login    │                     │
     ├────────────────────>│                     │
     │                     │                     │
     │                     │  2. Validate        │
     │                     │     Hash Password   │
     │                     │     Create User     │
     │                     │                     │
     │  3. Return JWT      │                     │
     │<────────────────────┤                     │
     │                     │                     │
     │  4. Store Token     │                     │
     ├─────────────────────┼────────────────────>│
     │                     │                     │
     │  5. Protected Request with Token          │
     ├────────────────────>│                     │
     │                     │                     │
     │                     │  6. Verify Token    │
     │                     │                     │
     │  7. Return Data     │                     │
     │<────────────────────┤                     │
     │                     │                     │
```

## Backend Setup

### 1. Install Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**⚠️ Important:** Change `JWT_SECRET` to a strong, random string in production!

### 3. Start the Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start at `http://localhost:5000`

### 4. Verify Server is Running

Visit `http://localhost:5000/api/health` or run:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "NoteFlow API is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## Frontend Integration

### 1. Configure API URL

Create a `.env` file in the root directory (if using environment variables):

```env
VITE_API_URL=http://localhost:5000/api
```

Or the API service will default to `http://localhost:5000/api`

### 2. Frontend Files Structure

```
src/
├── services/
│   └── api.js              # API service for backend communication
├── utils/
│   └── auth.js             # Authentication utility functions
├── pages/
│   ├── SignUp.jsx          # Updated with backend integration
│   └── Login.jsx           # Updated with backend integration
└── components/
    └── NavBar.jsx          # Updated with backend logout
```

### 3. Using the API Service

The API service is already integrated into the SignUp and Login pages. Here's how it works:

**Sign Up:**
```javascript
import { authAPI } from '../services/api'
import { setAuthData, getRedirectPath } from '../utils/auth'

const response = await authAPI.signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  userType: 'viewer'
})

// Store token and user data
setAuthData(response.data.token, response.data.user)

// Redirect based on user type
navigate(getRedirectPath(response.data.user.userType))
```

**Login:**
```javascript
const response = await authAPI.login({
  email: 'john@example.com',
  password: 'password123'
})

setAuthData(response.data.token, response.data.user)
navigate(getRedirectPath(response.data.user.userType))
```

**Logout:**
```javascript
import { authAPI } from '../services/api'
import { clearAuthData } from '../utils/auth'

await authAPI.logout()
clearAuthData()
navigate('/')
```

## API Endpoints

### POST /api/auth/signup

Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "userType": "viewer"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "viewer",
      "createdAt": "2024-01-20T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login

Login with credentials.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/logout

Logout current user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

### GET /api/auth/current-user

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": { ... }
  }
}
```

For complete API documentation, see [`backend/README.md`](backend/README.md)

## Testing

### Testing with cURL

**Sign Up:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "userType": "viewer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User (replace TOKEN):**
```bash
curl -X GET http://localhost:5000/api/auth/current-user \
  -H "Authorization: Bearer TOKEN"
```

### Testing with Frontend

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

3. Navigate to `http://localhost:5173` and test:
   - Sign up as a new user
   - Login with created credentials
   - Access the appropriate dashboard
   - Logout

## Security Considerations

### ✅ Implemented Security Features

1. **Password Hashing**
   - Passwords are hashed using bcrypt with 10 salt rounds
   - Original passwords are never stored

2. **JWT Tokens**
   - Signed with secret key
   - Include expiration time (7 days default)
   - Include user ID and role for authorization

3. **Input Validation**
   - Email format validation
   - Password minimum length (6 characters)
   - Password confirmation matching
   - User type validation (creator/viewer only)

4. **CORS Protection**
   - Configured to accept requests only from frontend URL

5. **Authentication Middleware**
   - Protects sensitive endpoints
   - Verifies token validity
   - Checks token expiration

### 🔒 Production Security Recommendations

1. **Environment Variables**
   - Use strong, random JWT_SECRET (32+ characters)
   - Never commit `.env` files
   - Use different secrets for dev/staging/production

2. **HTTPS**
   - Use HTTPS in production
   - Secure cookies with `httpOnly` and `secure` flags

3. **Token Management**
   - Implement refresh tokens for better security
   - Store tokens in httpOnly cookies instead of localStorage
   - Implement token blacklist for logout

4. **Rate Limiting**
   - Add rate limiting to prevent brute force attacks
   - Use packages like `express-rate-limit`

5. **Database**
   - Replace in-memory storage with a real database
   - Use connection pooling
   - Implement proper error handling

6. **Additional Security Headers**
   - Use `helmet` middleware for security headers
   - Implement CSP (Content Security Policy)

7. **Password Requirements**
   - Enforce stronger password policies
   - Require uppercase, lowercase, numbers, special chars
   - Implement password strength meter

8. **Account Security**
   - Add email verification
   - Implement password reset functionality
   - Add two-factor authentication (2FA)

## Troubleshooting

### Backend won't start

**Problem:** Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Change the port in `.env` or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### CORS errors

**Problem:** 
```
Access to fetch at 'http://localhost:5000/api/auth/signup' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** Verify `CLIENT_URL` in backend `.env` matches your frontend URL

### Token errors

**Problem:** "Invalid token" or "Token expired"

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Login again to get a new token
3. Check JWT_SECRET matches between restarts

### Database/User not found

**Problem:** In-memory storage loses data on server restart

**Solution:** This is expected behavior. Users are stored in memory and will be lost when server restarts. For production, implement a real database (MongoDB, PostgreSQL, etc.)

### Frontend not connecting to backend

**Problem:** Network request fails

**Solution:**
1. Verify backend is running: `http://localhost:5000/api/health`
2. Check API URL in [`src/services/api.js`](src/services/api.js:3)
3. Ensure no firewall blocking connections

## Next Steps

### Immediate Enhancements

- [ ] Add database integration (MongoDB/PostgreSQL)
- [ ] Implement password reset via email
- [ ] Add email verification for new accounts
- [ ] Create protected route components
- [ ] Add loading states and better error handling

### Future Features

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Remember me functionality
- [ ] Session management dashboard
- [ ] Account settings page
- [ ] Profile picture upload to cloud storage

## Support

For issues or questions:
- Check the [Backend README](backend/README.md)
- Review error messages in browser console (F12)
- Check backend logs in terminal
- Verify all dependencies are installed

---

**Last Updated:** 2024-01-20
**Version:** 1.0.0
