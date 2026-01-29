import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaShieldAlt, FaPaperPlane, FaArrowLeft, FaEnvelopeOpenText } from 'react-icons/fa'

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
      setError('Please enter the 6-digit code')
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.verifyEmail(email, otp)

      if (response.success) {
        login(response.token)
        localStorage.removeItem('pendingVerificationEmail')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your code.')
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
        setMessage('A fresh code has been dispatched!')
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Dynamic background bubbles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

      <div className="w-full max-w-xl">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[48px] shadow-2xl p-8 sm:p-14 transition-all duration-500 relative">

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-5 bg-indigo-600 rounded-[24px] shadow-xl shadow-indigo-600/30 text-white text-center">
            <FaShieldAlt size={32} />
          </div>

          <div className="text-center mb-12 mt-4">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
              Secure Access
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">
              Verifying identity for:
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <FaEnvelopeOpenText size={14} />
              {email}
            </div>
          </div>

          {error && (
            <div className="mb-8 p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
              {error}
            </div>
          )}

          {message && (
            <div className="mb-8 p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-4 block text-center">Enter Secret Code</label>
              <div className="relative max-w-sm mx-auto">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  maxLength={6}
                  className="
                    w-full rounded-[32px] bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent 
                    focus:border-indigo-500 outline-none font-black text-slate-800 dark:text-slate-100 
                    text-center text-4xl tracking-[0.5em] py-6 transition-all shadow-inner
                  "
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[32px] font-black uppercase tracking-[6px] text-sm hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Authorize Entry <FaPaperPlane size={14} /></>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group disabled:opacity-50"
                >
                  {resending ? 'Dispatched...' : (
                    <>
                      Didn't get it? <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline">Resend Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                >
                  <FaArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Identity
                </button>
              </div>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-slate-400/60 max-w-[280px] mx-auto leading-relaxed">
              For your protection, this code will expire in 10 minutes. Please ensure you are using the most recent one.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
