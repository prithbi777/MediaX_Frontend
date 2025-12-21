import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function VerifyEmail() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /* ---------------- Load email ---------------- */
  useEffect(() => {
    const emailFromState = location.state?.email
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail')

    if (emailFromState) {
      setEmail(emailFromState)
      localStorage.setItem('pendingVerificationEmail', emailFromState)
    } else if (emailFromStorage) {
      setEmail(emailFromStorage)
    } else {
      navigate('/signup')
    }
  }, [location, navigate])

  /* ---------------- OTP Change ---------------- */
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    setError('')
    setMessage('')
  }

  /* ---------------- Verify OTP ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.verifyEmail(email, otp)

      if (response.success) {
        login(response.token) // ✅ updates context + API immediately
        localStorage.removeItem('pendingVerificationEmail')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- Resend OTP ---------------- */
  const handleResendOTP = async () => {
    setError('')
    setMessage('')
    setResending(true)

    try {
      const response = await authAPI.sendOTP(email)
      if (response.success) {
        setMessage('OTP has been resent to your email.')
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-start justify-center bg-slate-100 dark:bg-slate-950 px-4 overflow-x-hidden transition-colors">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 shadow-lg p-6 sm:p-8 transition-colors">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 transition-colors text-center mb-2">
          Verify Your Email
        </h2>

        <p className="text-center text-sm text-gray-600 dark:text-slate-300 transition-colors mb-6">
          We’ve sent a 6-digit OTP to{' '}
          <span className="font-medium">{email}</span>
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 px-4 py-2 text-sm text-red-600 dark:text-red-300 transition-colors">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900 px-4 py-2 text-sm text-green-600 dark:text-green-300 transition-colors">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className="
                w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-3
                text-center text-2xl tracking-[0.4em] font-mono
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                transition-colors
              "
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="
              w-full rounded-md bg-indigo-600 py-2 text-white font-medium
              hover:bg-indigo-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn’t receive the OTP?
          </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resending}
            className="
              text-sm font-medium text-indigo-600 hover:underline
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>

        {/* Back */}
        <p className="mt-6 text-center text-sm text-gray-600">
          <button
            onClick={() => navigate('/signup')}
            className="text-indigo-600 hover:underline font-medium"
          >
            Back to Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail
