# 🚀 Quick Start Guide - NoteFlow Authentication

Get NoteFlow authentication up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Two terminal windows

## Step 1: Install Backend Dependencies

Open Terminal 1:

```bash
cd backend
npm install
```

## Step 2: Start Backend Server

In Terminal 1 (still in backend directory):

```bash
npm run dev
```

You should see:
```
==================================================
🚀 NoteFlow API Server
📡 Server running on port 5000
🌐 URL: http://localhost:5000
🏥 Health check: http://localhost:5000/api/health
🔐 Auth endpoints available at /api/auth
==================================================
```

## Step 3: Start Frontend

Open Terminal 2 (from project root):

```bash
npm run dev
```

The frontend is already running from your existing setup.

## Step 4: Test Authentication

1. **Open Browser**: Navigate to `http://localhost:5173`

2. **Sign Up**:
   - Click "Sign Up" button in navbar
   - Fill in the form:
     - Name: Test User
     - Email: test@example.com
     - Password: password123
     - Confirm Password: password123
     - User Type: Select Viewer or Creator
   - Click "Create Account"
   - You'll be redirected to the appropriate dashboard

3. **Test Logout**:
   - Click on your name in the navbar
   - Click "Log Out"
   - You'll be redirected to home page

4. **Login**:
   - Click "Log In" button
   - Enter credentials:
     - Email: test@example.com
     - Password: password123
   - Click "Log In"
   - You'll be redirected to your dashboard

## API Endpoints Available

- **POST** `/api/auth/signup` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/logout` - Logout user (requires auth)
- **GET** `/api/auth/current-user` - Get current user (requires auth)
- **GET** `/api/auth/verify-token` - Verify token validity (requires auth)
- **GET** `/api/health` - Health check

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "userType": "viewer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Project Structure

```
NoteFlow_RooCode/
├── backend/                    # Backend API Server
│   ├── models/
│   │   └── User.js            # User model & repository
│   ├── routes/
│   │   └── auth.js            # Authentication routes
│   ├── middleware/
│   │   └── auth.js            # Auth middleware
│   ├── server.js              # Express server
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   └── README.md              # Backend documentation
│
├── src/                        # Frontend React App
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── utils/
│   │   └── auth.js            # Auth utilities
│   ├── pages/
│   │   ├── SignUp.jsx         # Updated with backend
│   │   └── Login.jsx          # Updated with backend
│   └── components/
│       └── NavBar.jsx         # Updated with logout
│
├── AUTHENTICATION_GUIDE.md     # Complete auth guide
└── QUICK_START.md             # This file
```

## Environment Variables

Backend (`.env` already created in `backend/` directory):
```env
PORT=5000
JWT_SECRET=noteflow-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## User Types

### Viewer
- Can browse and view notes
- Can create flashcards and take quizzes
- Redirects to `/dashboard` after login

### Creator
- All Viewer permissions
- Can upload notes
- Has access to creator dashboard
- Redirects to `/creator-dashboard` after login

## Features Implemented

✅ User Registration (Sign Up)
- Email and password validation
- Password confirmation
- Role selection (Creator/Viewer)
- Password hashing with bcrypt

✅ User Login
- Email and password authentication
- JWT token generation
- Automatic redirect based on role

✅ User Logout
- Token invalidation
- Local storage cleanup
- Redirect to home

✅ Protected Routes
- JWT verification middleware
- Role-based authorization
- Token expiration handling

✅ Security
- Password hashing (bcrypt with 10 rounds)
- JWT tokens with expiration
- CORS protection
- Input validation

## Common Issues

### Backend won't start
- Make sure port 5000 is not in use
- Check that you're in the `backend` directory
- Run `npm install` first

### Frontend can't connect
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS settings in backend

### "User already exists"
- Backend stores users in memory
- Users persist until server restart
- Use a different email or restart backend

### Token errors
- Clear browser localStorage: `localStorage.clear()`
- Refresh the page and login again

## Next Steps

📖 Read the complete guide: [`AUTHENTICATION_GUIDE.md`](AUTHENTICATION_GUIDE.md)
📖 Backend API docs: [`backend/README.md`](backend/README.md)

## Need Help?

1. Check the error message in:
   - Browser console (F12)
   - Backend terminal logs
   
2. Common solutions:
   - Clear localStorage and try again
   - Restart backend server
   - Check all terminals are running

3. Review documentation:
   - Authentication Guide for detailed explanations
   - Backend README for API reference

---

**Happy Coding! 🎉**
