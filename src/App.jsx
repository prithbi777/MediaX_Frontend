import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import VerifyEmail from './pages/VerifyEmail'
import Profile from './pages/Profile'
import Home from './pages/Home'
import ManageMedia from './pages/ManageMedia'
import MyVideos from './pages/MyVideos'
import UserProfile from './pages/UserProfile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Navbar from './components/Navbar'
import { getStoredToken } from './services/api'
import { useAuth } from './context/AuthContext'
import Footer from './components/Footer';


/* -------- Route Guards -------- */

const ProtectedRoute = ({ children }) => {
  const token = getStoredToken()
  return token ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const token = getStoredToken()
  return token ? <Navigate to="/dashboard" replace /> : children
}

const AdminRoute = ({ children }) => {
  const token = getStoredToken()
  const { user } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (!user) return null
  return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col overflow-x-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
        {/* Navbar always visible */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 flex items-start justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-slate-900 dark:text-slate-100 transition-colors">
          <Routes>
            {/* Landing Page */}
            <Route
              path="/"
              element={
                <Home />
              }
            />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-videos"
              element={
                <ProtectedRoute>
                  <MyVideos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/:userId"
              element={<UserProfile />}
            />

            <Route
              path="/manage-media"
              element={
                <AdminRoute>
                  <ManageMedia />
                </AdminRoute>
              }
            />
          </Routes>
        </main>


        {/* Footer always visible */}
        <Footer />
      </div>
    </Router>
  )
}

export default App
