import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { FaEnvelope, FaArrowLeft, FaPaperPlane, FaKey } from 'react-icons/fa'

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

      if (response.resetToken) {
        console.log('Reset token for testing:', response.resetToken)
      }

      setSuccessEmail(userEmail)
      setEmail('')
    } catch (err) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Decorative background elements consistent with Login/Signup */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-lg">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[48px] shadow-2xl p-8 sm:p-12 transition-all duration-500 relative">

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-5 bg-indigo-600 rounded-[24px] shadow-xl shadow-indigo-600/30 text-white">
            <FaKey size={32} />
          </div>

          <div className="text-center mb-10 mt-4">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
              Lost Access?
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">
              We'll help you recover your portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0"></div>
                {error}
              </div>
            )}

            {successEmail && (
              <div className="p-5 rounded-3xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-green-600 dark:text-green-400 text-sm font-bold flex flex-col gap-2 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></div>
                  <span>Recovery Link Dispatched!</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest opacity-80 pl-5">Check: {successEmail}</p>
              </div>
            )}

            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">Registered Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="elon@mars.com"
                  className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[32px] font-black uppercase tracking-[6px] text-sm hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Send Reset Link <FaPaperPlane size={14} /></>
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <FaArrowLeft /> Back to identification
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
