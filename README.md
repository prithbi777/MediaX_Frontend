# React Authentication App with Vite

A full-stack authentication application with React frontend and Express backend.

## Features

- User Signup with validation
- User Login with JWT authentication
- Protected Dashboard route
- Secure password hashing with bcrypt
- JWT token-based authentication
- Modern UI with gradient design

## Project Structure

```
checkingcursor/
├── backend/           # Express backend server
│   ├── routes/       # API routes
│   ├── data/         # User storage (in-memory)
│   └── server.js     # Main server file
├── src/
│   ├── pages/        # React pages (Login, Signup, Dashboard)
│   ├── services/     # API service functions
│   └── App.jsx       # Main app component with routing
└── package.json      # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Frontend dependencies** (already installed):
   ```bash
   npm install
   ```

2. **Backend dependencies** (already installed):
   ```bash
   cd backend
   npm install
   ```

### Running the Application

You need to run both the frontend and backend servers:

#### Terminal 1 - Backend Server
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

#### Terminal 2 - Frontend Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

### Usage

1. Open your browser and navigate to `http://localhost:5173`
2. You'll be redirected to the login page
3. Click "Sign up" to create a new account
4. After signing up or logging in, you'll be redirected to the dashboard
5. The dashboard displays your user information
6. Click "Logout" to sign out

## API Endpoints

### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### GET `/api/auth/verify`
Verify JWT token and get user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

## Security Notes

⚠️ **Important:** This is a development setup. For production:

1. Change the `JWT_SECRET` in `backend/.env` to a strong, random secret
2. Replace in-memory user storage with a proper database (MongoDB, PostgreSQL, etc.)
3. Add rate limiting to prevent brute force attacks
4. Use HTTPS in production
5. Add input validation and sanitization
6. Implement password strength requirements
7. Add email verification
8. Use environment variables for all sensitive configuration

## Technologies Used

### Frontend
- React 19
- React Router DOM
- Vite
- CSS3

### Backend
- Express.js
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- CORS (Cross-Origin Resource Sharing)

## License

MIT
