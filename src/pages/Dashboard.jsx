import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, videosAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState([])
  const [videosError, setVideosError] = useState('')
  const [activeVideo, setActiveVideo] = useState(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const { token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await authAPI.verify()
        if (response.success) {
          setUser(response.user)
        } else {
          logout()
          navigate('/login')
        }
      } catch {
        logout()
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    verifyUser()
  }, [token, logout, navigate])

  const fetchVideos = async () => {
    setVideosError('')
    try {
      const res = await videosAPI.list()
      setVideos(res.videos || [])
    } catch (e) {
      setVideosError(e.message || 'Failed to load videos')
    }
  }

  useEffect(() => {
    fetchVideos()

    const es = videosAPI.createEventsSource()
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        if (data?.type === 'videosUpdated') {
          fetchVideos()
        }
      } catch {
        // ignore
      }
    }
    es.onerror = () => {
      es.close()
    }

    return () => {
      es.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')

    const update = () => {
      setIsSmallScreen(mq.matches)
    }

    update()
    if (mq.addEventListener) {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }
    mq.addListener(update)
    return () => mq.removeListener(update)
  }, [])

  const handleLogout = () => {
    logout()          // 🔥 updates context → Navbar re-renders
    navigate('/login')
  }

  /* ---------------- Loading State ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 transition-colors">
        <div className="rounded-xl bg-white dark:bg-slate-900 px-6 py-4 shadow-md transition-colors">
          <p className="text-gray-600 dark:text-slate-300 transition-colors text-sm font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  /* ---------------- Main Dashboard ---------------- */
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="w-full rounded-xl bg-white dark:bg-slate-900 shadow-lg p-4 sm:p-6 transition-colors">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 transition-colors text-center mb-6">
          Dashboard
        </h2>

        {user && (
          <div className="mb-6 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 sm:p-5 space-y-2 transition-colors">
            <p className="text-sm text-gray-700 dark:text-slate-200 transition-colors">
              <span className="font-medium">Name:</span> {user.name}
            </p>
            <p className="text-sm text-gray-700 dark:text-slate-200 transition-colors">
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 transition-colors mb-3">Latest Videos</h3>

          {videosError && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 text-sm transition-colors">
              {videosError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => navigate(`/video/${v.id}`)}
                className="group text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 transition-colors relative overflow-hidden">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="font-bold text-gray-800 dark:text-slate-100 transition-colors line-clamp-2 min-h-[3rem] text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {v.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mt-3">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 rounded-xl bg-red-500 py-3 text-white font-bold
                     hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20
                     focus:outline-none focus:ring-4 focus:ring-red-500/30"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Dashboard
