import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userAPI, videosAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function UserProfile() {
  const { userId } = useParams()
  const { user: currentUser, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('videos') // 'videos', 'followers', 'following'

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

      // Fetch follow status if logged in and not viewing own profile
      if (currentUser && currentUser.id !== userId) {
        const followRes = await userAPI.getFollowStatus(userId)
        setIsFollowing(followRes.isFollowing)
      }
    } catch (e) {
      setError(e.message || 'Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      setLoading(true)
      fetchUserProfile()
    }
  }, [userId, currentUser?.id]) // Re-fetch on ID change or login state change

  const handleFollow = async (targetId, isUpdateMainUser = true) => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    setFollowLoading(true)
    try {
      await userAPI.followUser(targetId)
      if (isUpdateMainUser) {
        setIsFollowing(true)
        setUser(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }))
      }
      // Re-fetch local auth user to sync follow buttons globally
      await refreshUser()
      // Re-fetch profile user data to update the lists
      fetchUserProfile()
    } catch (err) {
      console.error('Follow error:', err)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleUnfollow = async (targetId, isUpdateMainUser = true) => {
    setFollowLoading(true)
    try {
      await userAPI.unfollowUser(targetId)
      if (isUpdateMainUser) {
        setIsFollowing(false)
        setUser(prev => ({ ...prev, followersCount: Math.max(0, (prev.followersCount || 0) - 1) }))
      }
      // Re-fetch local auth user
      await refreshUser()
      // Re-fetch profile user data
      fetchUserProfile()
    } catch (err) {
      console.error('Unfollow error:', err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/30 p-8 rounded-2xl inline-block max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error || 'User not found'}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  const renderUserList = (users) => {
    if (!users || users.length === 0) {
      return (
        <div className="py-12 text-center text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-lg">No users found here yet.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
          >
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/user/${u._id}`)}
            >
              {u.photo ? (
                <img src={u.photo} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" alt={u.name} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                  {u.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{u.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-tight font-semibold">View Profile</span>
              </div>
            </div>

            {currentUser && currentUser.id !== u._id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const userFollowing = currentUser.following || []
                  const isUserFollowingThisOne = userFollowing.some(followedId => (followedId._id || followedId) === u._id)
                  if (isUserFollowingThisOne) {
                    handleUnfollow(u._id, u._id === userId)
                  } else {
                    handleFollow(u._id, u._id === userId)
                  }
                }}
                disabled={followLoading}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${(currentUser.following || []).some(id => (id._id || id) === u._id)
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
              >
                {(currentUser.following || []).some(id => (id._id || id) === u._id) ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-2xl">
                  <span className="text-5xl font-black text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-6">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.name}
                </h1>

                {currentUser && currentUser.id !== userId && (
                  <button
                    onClick={() => isFollowing ? handleUnfollow(userId) : handleFollow(userId)}
                    disabled={followLoading}
                    className={`min-w-[120px] px-8 py-2.5 rounded-full font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 shadow-lg ${isFollowing
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30'
                      } disabled:opacity-50`}
                  >
                    {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6 sm:gap-12 mb-8 px-4 sm:px-0">
                <button onClick={() => setActiveTab('videos')} className="flex flex-col items-center md:items-start group">
                  <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.videoCount || 0}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Videos</span>
                </button>
                <button onClick={() => setActiveTab('followers')} className="flex flex-col items-center md:items-start group">
                  <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.followersCount || 0}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Followers</span>
                </button>
                <button onClick={() => setActiveTab('following')} className="flex flex-col items-center md:items-start group">
                  <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.followingCount || 0}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Following</span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-bold">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                  {user.role === 'admin' ? 'Admin Creator' : 'Verified Creator'}
                </span>
                <span className="text-slate-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex justify-center gap-8 border-b border-slate-200 dark:border-slate-800">
          {['videos', 'followers', 'following'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_-2px_10px_rgba(79,70,229,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="pt-4">
          {activeTab === 'videos' && (
            videos.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xl font-bold text-slate-400">This creator hasn't posted any videos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => navigate(`/video/${v.id}`)}
                    className="group relative text-left bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="font-black text-lg text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{v.title}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-2">{new Date(v.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === 'followers' && renderUserList(user.followers)}
          {activeTab === 'following' && renderUserList(user.following)}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
