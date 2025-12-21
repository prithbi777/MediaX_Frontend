import { Link, useNavigate } from "react-router-dom"
import { FaBars, FaMoon, FaSun, FaTimes, FaUserCircle } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "../context/ThemeContext"

const Navbar = () => {
  const { token, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const profileMenuRef = useRef(null)

  const handleLogout = () => {
    logout()          // 🔥 updates context
    navigate("/")     // optional
  }

  const handleMobileLogout = () => {
    logout()
    navigate("/")
  }

  useEffect(() => {
    if (!isProfileMenuOpen) return

    const handleDocMouseDown = (e) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleDocMouseDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleDocMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isProfileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    setIsProfileMenuOpen(false)

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [user?.photo])

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
  }

  return (
    <nav className="w-full bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeAllMenus}
            className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 transition-colors"
          >
            MediaX
          </Link>

          {/* Center (desktop only) */}
          {/* <div className="hidden lg:block text-gray-700 dark:text-slate-200 font-extrabold text-xl xl:text-2xl transition-colors">
            Welcome to MediaX
          </div> */}

          {/* Right (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {token && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus()
                  navigate('/my-videos')
                }}
                className="text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                My Videos
              </button>
            )}

            {token && user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus()
                  navigate('/manage-media')
                }}
                className="text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Manage Media
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center h-11 w-11 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>

            {token ? (
              <>
                <div className="relative" ref={profileMenuRef}>
                  {(user?.photo || "").trim() && !avatarLoadFailed ? (
                    <img
                      src={(user?.photo || "").trim()}
                      alt="Profile"
                      className="h-9 w-9 rounded-full object-cover cursor-pointer border border-slate-200 dark:border-slate-700"
                      onClick={() => setIsProfileMenuOpen((v) => !v)}
                      onError={(e) => {
                        setAvatarLoadFailed(true)
                      }}
                    />
                  ) : (
                    <FaUserCircle
                      size={34}
                      className="text-indigo-600 dark:text-indigo-400 cursor-pointer"
                      onClick={() => setIsProfileMenuOpen((v) => !v)}
                    />
                  )}

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => {
                          closeAllMenus()
                          navigate("/profile")
                        }}
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => {
                          closeAllMenus()
                          navigate("/dashboard")
                        }}
                      >
                        Dashboard
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4 text-base font-semibold">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 transition-colors"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center h-11 w-11 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex items-center justify-center h-11 w-11 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
            <div className="flex flex-col">
              <Link
                to="/"
                onClick={closeAllMenus}
                className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Home
              </Link>

              {token ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeAllMenus}
                    className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={closeAllMenus}
                    className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-videos"
                    onClick={closeAllMenus}
                    className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    My Videos
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/manage-media"
                      onClick={closeAllMenus}
                      className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Manage Media
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      closeAllMenus()
                      handleMobileLogout()
                    }}
                    className="text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeAllMenus}
                    className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeAllMenus}
                    className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
