import { Link, useNavigate, useLocation } from "react-router-dom"
import { FaBars, FaMoon, FaSun, FaTimes, FaUserCircle, FaSearch, FaUser, FaPlayCircle, FaBell } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import { useTheme } from "../context/ThemeContext"
import { notificationsAPI } from "../services/api"

const Navbar = () => {
  const { token, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsMobileMenuOpen(false)
    }
  }

  const fetchUnreadCount = async () => {
    if (!token) return
    try {
      const data = await notificationsAPI.list()
      if (data.success) {
        const unread = data.notifications.filter(n => !n.read).length
        setUnreadCount(unread)
      }
    } catch (err) {
      console.error("Failed to fetch unread count", err)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [token, location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo - Back to clickable Link */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity"
        >
          MediaX
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-10">
          <form onSubmit={handleSearch} className="w-full relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators & videos..."
              className="w-full px-6 py-3 pl-12 rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          </form>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all active:scale-95"
          >
            {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>

          {token && (
            <Link
              to="/notifications"
              className={`relative p-2.5 rounded-xl transition-all active:scale-95 ${isActive('/notifications')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110'
                }`}
            >
              <FaBell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {token ? (
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-black uppercase tracking-widest transition-all ${isActive('/')
                  ? 'text-indigo-600 shadow-[0_2px_0_0_currentColor]'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                  }`}
              >
                Home
              </Link>

              <Link
                to="/profile"
                className={`text-sm font-black uppercase tracking-widest transition-all ${isActive('/profile')
                  ? 'text-indigo-600 shadow-[0_2px_0_0_currentColor]'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                  }`}
              >
                Profile
              </Link>

              <Link
                to="/my-videos"
                className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${isActive('/my-videos')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                  }`}
              >
                Studio
              </Link>

              {/* Avatar Indicator - Unclickable */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 transition-all shadow-sm">
                {user?.photo ? (
                  <img src={user.photo} className="h-8 w-8 rounded-lg object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm" alt="Me" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><FaUser size={14} /></div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-4 py-2 text-sm font-black text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all">Login</Link>
              <Link to="/signup" className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all">Signup</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleTheme} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 transition-all">
            {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
          {token && (
            <Link
              to="/notifications"
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative p-3 rounded-xl bg-slate-100 dark:bg-slate-800 transition-all"
            >
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden p-4 space-y-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-full duration-300">
          <form onSubmit={handleSearch} className="relative mb-6">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none font-bold" placeholder="Search..." />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-sm text-slate-600 dark:text-slate-300">Home</Link>
            {token ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl font-black text-sm text-indigo-600">Profile</Link>
                <Link to="/my-videos" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-sm text-slate-600">Studio</Link>
                <button onClick={handleLogout} className="col-span-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl font-black text-sm text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-sm text-slate-600">Login</Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 bg-indigo-600 rounded-2xl font-black text-sm text-white">Signup</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
