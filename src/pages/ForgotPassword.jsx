import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successEmail, setSuccessEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessEmail('')

    try {
      const userEmail = email.trim()
      const response = await authAPI.forgotPassword(userEmail)
      
      // In development, log the reset token for testing
      if (response.resetToken) {
        console.log('Reset token for testing:', response.resetToken)
      }
      
      // Show success message with the email
      setSuccessEmail(userEmail)
      
      // Clear the email field after successful submission
      setEmail('')
    } catch (err) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100 transition-colors">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400 transition-colors">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
            </div>
          )}

          {successEmail && (
            <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
              <div className="text-sm text-green-600 dark:text-green-300">
                Password Reset Link Sent To This Email: {successEmail}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword
