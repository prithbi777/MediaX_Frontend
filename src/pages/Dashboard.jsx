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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveVideo(v)}
                className="text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 transition-colors">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="font-semibold text-gray-800 dark:text-slate-100 transition-colors truncate">{v.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mt-1">
                    {v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-red-500 py-2 text-white font-medium
                     hover:bg-red-600 transition
                     focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Logout
        </button>
      </div>

      {activeVideo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xl transition-colors">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 transition-colors">
              <p className="font-semibold text-gray-800 dark:text-slate-100 transition-colors truncate pr-4">{activeVideo.title}</p>
              <button
                type="button"
                className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setActiveVideo(null)}
              >
                Close
              </button>
            </div>
            <div className="bg-black aspect-video">
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay={!isSmallScreen}
                playsInline
                preload="metadata"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
