import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user', // Add role field
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(
        formData.email,
        formData.password,
        formData.role // Pass role to API for validation
      )

      if (response.success) {
        login(response.token) // 🔥 triggers Navbar update
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.response && err.response.requiresVerification) {
        navigate('/verify-email', {
          state: { email: formData.email },
        })
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-start justify-center bg-slate-100 dark:bg-slate-950 px-4 overflow-x-hidden transition-colors">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 shadow-lg p-6 sm:p-8 transition-colors">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 transition-colors text-center mb-6">
          Login
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 px-4 py-2 text-sm text-red-600 dark:text-red-300 transition-colors">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              *Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              *Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 pr-10 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                👁
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              Account Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-slate-200 transition-colors">Normal User</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-slate-200 transition-colors">Admin</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 text-white font-medium
                       hover:bg-indigo-700 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-300 transition-colors">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-indigo-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
