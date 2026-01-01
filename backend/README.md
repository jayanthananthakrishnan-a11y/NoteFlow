# NoteFlow Backend API

Backend authentication system for NoteFlow application built with Node.js, Express, and JWT.

## 📋 Features

- **User Registration** (Sign Up)
  - Support for Creator and Viewer roles
  - Password hashing with bcryptjs
  - Email validation
  - Profile picture support
  
- **User Login**
  - JWT token-based authentication
  - Secure password verification
  - Role-based access control

- **User Management**
  - Get current user information
  - Token verification
  - Logout functionality

- **Security**
  - Password hashing with bcrypt (10 salt rounds)
  - JWT tokens with configurable expiration
  - Input validation with express-validator
  - CORS protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The server will start at `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check

#### GET /api/health
Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "NoteFlow API is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

### Authentication Routes

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "userType": "viewer",
  "profilePicture": "data:image/png;base64,..." // Optional
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `confirmPassword`: Required, must match password
- `userType`: Required, either "creator" or "viewer"

**Success Response (201):**
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
      "profilePicture": null,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "viewer",
      "profilePicture": null,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### POST /api/auth/logout
Logout current user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

---

#### GET /api/auth/current-user
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "viewer",
      "profilePicture": null,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

---

#### GET /api/auth/verify-token
Verify if the provided token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "viewer",
      "profilePicture": null,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

---

## 🔐 Authentication Flow

### 1. User Registration Flow

```
Client                          Server
  |                               |
  |-- POST /api/auth/signup ----->|
  |   {email, password, ...}      |
  |                               |
  |                       Validate input
  |                       Hash password
  |                       Create user
  |                       Generate JWT
  |                               |
  |<----- Return user + token ----|
  |                               |
  Store token in localStorage
  Redirect to dashboard
```

### 2. User Login Flow

```
Client                          Server
  |                               |
  |--- POST /api/auth/login ----->|
  |   {email, password}           |
  |                               |
  |                       Validate credentials
  |                       Verify password
  |                       Generate JWT
  |                               |
  |<----- Return user + token ----|
  |                               |
  Store token in localStorage
  Redirect based on userType
```

### 3. Protected Route Access

```
Client                          Server
  |                               |
  |-- GET /api/auth/current-user->|
  |   Authorization: Bearer token |
  |                               |
  |                       Verify token
  |                       Decode payload
  |                       Find user
  |                               |
  |<----- Return user data -------|
```

## 🛡️ Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use strong, random JWT secret in production
   - Change default secrets before deployment

2. **Password Security**
   - Passwords are hashed using bcrypt with 10 salt rounds
   - Passwords are never stored in plain text
   - Passwords are never returned in API responses

3. **JWT Token Security**
   - Tokens expire after 7 days (configurable)
   - Store tokens securely in client (localStorage/cookies)
   - Include token in Authorization header for protected routes
   - Consider implementing refresh tokens for production

4. **CORS Configuration**
   - Configure allowed origins in production
   - Use credentials: true for cookie-based auth

## 📦 Project Structure

```
backend/
├── models/
│   └── User.js              # User model and repository
├── routes/
│   └── auth.js              # Authentication routes
├── middleware/
│   └── auth.js              # Authentication middleware
├── server.js                # Express server setup
├── package.json             # Dependencies
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🔄 Integrating with Frontend

### Example: Signup Request (React)

```javascript
const handleSignup = async (formData) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      localStorage.setItem('noteflow:token', data.data.token);
      localStorage.setItem('noteflow:user', JSON.stringify(data.data.user));
      
      // Redirect based on user type
      if (data.data.user.userType === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Handle error
      setError(data.message);
    }
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

### Example: Login Request (React)

```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('noteflow:token', data.data.token);
      localStorage.setItem('noteflow:user', JSON.stringify(data.data.user));
      
      // Redirect based on user type
      if (data.data.user.userType === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Example: Protected API Request

```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('noteflow:token');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.data.user;
    }
  } catch (error) {
    console.error('Get user error:', error);
  }
};
```

### Example: Logout

```javascript
const handleLogout = async () => {
  const token = localStorage.getItem('noteflow:token');
  
  try {
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Clear local storage
    localStorage.removeItem('noteflow:token');
    localStorage.removeItem('noteflow:user');
    
    // Redirect to home
    navigate('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Refresh token mechanism
- [ ] Password reset functionality
- [ ] Email verification
- [ ] OAuth integration (Google, GitHub)
- [ ] Rate limiting
- [ ] Token blacklist for logout
- [ ] User profile updates
- [ ] Admin role and permissions
- [ ] Activity logging

## 🧪 Testing

To test the API endpoints, you can use tools like:
- **Postman** or **Insomnia** for manual testing
- **curl** for command-line testing
- **Thunder Client** (VS Code extension)

Example curl commands:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "userType": "viewer"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get current user (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/auth/current-user \
  -H "Authorization: Bearer TOKEN"
```

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@noteflow.com or open an issue in the repository.
