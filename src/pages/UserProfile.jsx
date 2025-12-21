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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((v) => (
              <div key={v.id} className="rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden transition-colors">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 transition-colors">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-800 dark:text-slate-100 transition-colors truncate">{v.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mt-1">
                    {v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
