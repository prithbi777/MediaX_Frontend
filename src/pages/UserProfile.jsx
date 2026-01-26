import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userAPI, videosAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function UserProfile() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserProfile = async () => {
      setError('')
      try {
        // Fetch user profile
        const userRes = await userAPI.getUserProfile(userId)
        setUser(userRes.user)

        // Fetch user's videos
        const videosRes = await videosAPI.list()
        const userVideos = videosRes.videos.filter(v => {
          if (!v.uploadedBy) return false
          const uploadedById = v.uploadedBy._id || (typeof v.uploadedBy === 'string' ? v.uploadedBy : null)
          return uploadedById === userId
        })
        setVideos(userVideos)
      } catch (e) {
        setError(e.message || 'Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="rounded-xl bg-white dark:bg-slate-900 px-6 py-4 shadow-md text-center text-gray-600 dark:text-slate-300 transition-colors">
          Loading user profile...
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="rounded-xl bg-red-50 dark:bg-red-900 px-6 py-4 shadow-md text-center text-red-600 dark:text-red-300 transition-colors">
          {error || 'User not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
        >
          ← Back
        </button>

        <div className="rounded-xl bg-white dark:bg-slate-900 shadow-md p-6 transition-colors">
          <div className="flex items-center space-x-4">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 transition-colors">
                {user.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">
                {user.role === 'admin' ? 'Admin' : 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                {user.videoCount} video{user.videoCount !== 1 ? 's' : ''} uploaded
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4 transition-colors">
          Videos by {user.name}
        </h2>

        {videos.length === 0 ? (
          <div className="rounded-xl bg-white dark:bg-slate-900 px-6 py-12 shadow-md text-center text-gray-600 dark:text-slate-300 transition-colors">
            <p className="text-lg font-medium mb-2">No videos yet</p>
            <p className="text-sm">This user hasn't uploaded any videos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate(`/video/${v.id}`)}
                className="group text-left rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                <div className="p-4">
                  <p className="font-bold text-gray-800 dark:text-slate-100 transition-colors line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {v.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mt-2">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
