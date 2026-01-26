import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaMagic, FaArrowRight } from 'react-icons/fa'

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
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Dynamic background bubbles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

      <div className="w-full max-w-xl">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[48px] shadow-2xl p-8 sm:p-14 transition-all duration-500 relative">

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-5 bg-indigo-600 rounded-[24px] shadow-xl shadow-indigo-600/30 text-white text-center">
            <FaMagic size={32} />
          </div>

          <div className="text-center mb-12 mt-4">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
              Join the Hub
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">
              The future of creation starts here
            </p>
          </div>

          {error && (
            <div className="mb-8 p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">Full Identity</label>
                <div className="relative">
                  <FaUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="E.g. Elon Dusk"
                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">Email Channel</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="elon@mars.com"
                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">New Secret</label>
                <div className="relative">
                  <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 6 chars"
                    className="w-full pl-14 pr-12 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors">
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">Match Secret</label>
                <div className="relative">
                  <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repeat secret"
                    className="w-full pl-14 pr-12 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors">
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block text-center">Admin Key (Optional)</label>
              <div className="relative max-w-sm mx-auto">
                <FaShieldAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type={showAdminPasskey ? 'text' : 'password'}
                  name="adminPasskey"
                  value={formData.adminPasskey}
                  onChange={handleChange}
                  placeholder="Master Key"
                  className="w-full pl-14 pr-12 py-4 rounded-[28px] bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-purple-500 outline-none font-bold text-slate-800 dark:text-slate-100 text-center transition-all shadow-inner"
                />
                <button type="button" onClick={() => setShowAdminPasskey(!showAdminPasskey)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-purple-500 transition-colors">
                  {showAdminPasskey ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[32px] font-black uppercase tracking-[6px] text-sm hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Ready to Launch <FaArrowRight size={14} /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">
              In possession of a key?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-all border-b-2 border-indigo-500/30 pb-1">
                Identify Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
