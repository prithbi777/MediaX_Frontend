import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminPasskey: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAdminPasskey, setShowAdminPasskey] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.signup(
        formData.name,
        formData.email,
        formData.password,
        formData.adminPasskey
      )

      if (response.success) {
        navigate('/verify-email', { state: { email: formData.email } })
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-start justify-center bg-slate-100 dark:bg-slate-950 px-4 overflow-x-hidden transition-colors">

      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 shadow-lg p-6 sm:p-8 transition-colors">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-slate-100 transition-colors mb-6">
          Create Account
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 text-sm transition-colors">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              *Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

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
                minLength={6}
                placeholder="Minimum 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              *Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Re-enter password"
                className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 pr-10 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                👁
              </button>
            </div>
          </div>

          {/* Admin Passkey (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              Admin Passkey(Only for Admin)
            </label>
            <div className="relative">
              <input
                type={showAdminPasskey ? 'text' : 'password'}
                name="adminPasskey"
                value={formData.adminPasskey}
                onChange={handleChange}
                placeholder=""
                className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 pr-10 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowAdminPasskey(!showAdminPasskey)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                👁
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 text-white font-medium
                       hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-300 transition-colors">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
