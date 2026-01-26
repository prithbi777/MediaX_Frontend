import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserCircle, FaUserShield, FaArrowRight } from 'react-icons/fa'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
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
        formData.role
      )

      if (response.success) {
        login(response.token)
        navigate('/')
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
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50 dark:bg-slate-950 transition-colors"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="w-full max-w-lg">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[40px] shadow-2xl p-8 sm:p-12 transition-all duration-500">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 animate-in slide-in-from-top-4 duration-500">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[4px] text-[10px] animate-in slide-in-from-top-4 duration-700">
              Unlock your creative world
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 animate-in zoom-in-95 duration-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-1 block">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-1 block">Secret Password</label>
                <div className="relative">
                  <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 block">Account Category</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`flex items-center justify-center gap-3 p-4 rounded-3xl border-2 transition-all font-black text-xs uppercase tracking-widest ${formData.role === 'user'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-500/50'
                    }`}
                >
                  <FaUserCircle size={16} /> User
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`flex items-center justify-center gap-3 p-4 rounded-3xl border-2 transition-all font-black text-xs uppercase tracking-widest ${formData.role === 'admin'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-500/50'
                    }`}
                >
                  <FaUserShield size={16} /> Admin
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end px-2">
              <Link to="/forgot-password" size={14} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">
                Lost access?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-[4px] text-sm hover:bg-indigo-700 shadow-2xl shadow-indigo-600/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Enter Portal <FaArrowRight /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500">
            First time?{' '}
            <Link
              to="/signup"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-2"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
