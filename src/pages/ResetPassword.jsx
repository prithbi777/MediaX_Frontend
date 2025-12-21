import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authAPI } from '../services/api'

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(null)

  useEffect(() => {
    // Basic token validation check
    if (!token || token.length < 10) {
      setTokenValid(false)
      setError('Invalid reset token')
    } else {
      setTokenValid(true)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.resetPassword(token, password)
      setMessage(response.message)
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-950 transition-colors">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Invalid Reset Link</h2>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              This password reset link is invalid or has expired.
            </p>
            <Link
              to="/forgot-password"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100 transition-colors">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400 transition-colors">
            Enter your new password below.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
            </div>
          )}
          
          {message && (
            <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
              <div className="text-sm text-green-600 dark:text-green-300">{message}</div>
              <div className="text-sm text-green-600 dark:text-green-300 mt-2">
                Redirecting to login page...
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Confirm new password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!message}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
