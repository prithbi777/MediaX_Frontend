import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userAPI, videosAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaEdit, FaSignOutAlt, FaTrash, FaKey, FaChevronLeft } from 'react-icons/fa'

function Profile() {
  const { logout, refreshUser, setUser: setAuthUser } = useAuth()
  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('videos') // 'videos', 'followers', 'following', 'settings'

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDob, setEditDob] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const navigate = useNavigate()

  const fetchMyData = async () => {
    try {
      const res = await userAPI.getMe()
      setUser(res.user)
      setAuthUser(res.user)

      // Fetch my videos
      const videosRes = await videosAPI.getUserVideos()
      setVideos(videosRes.videos || [])

      // Update local user state with the precise personal count from the same request
      if (res.user) {
        setUser({ ...res.user, videoCount: videosRes.personalVideoCount || 0 })
      }

      setLoading(false)
    } catch (e) {
      setError(e?.message || 'Failed to load profile')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyData()
  }, [])

  const dobValue = useMemo(() => {
    if (!user?.dob) return ''
    const d = new Date(user.dob)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await userAPI.updateMe({
        name: editName,
        dob: editDob || null,
      })
      setUser(res.user)
      setAuthUser(res.user)
      setIsEditing(false)
    } catch (e) {
      setError(e?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const res = await userAPI.uploadMyPhoto(file)
      setUser(res.user)
      setAuthUser(res.user)
    } catch (err) {
      setError(err?.message || 'Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account forever? This cannot be undone.')) return
    setDeleting(true)
    try {
      await userAPI.deleteMe()
      logout()
      navigate('/login')
    } catch (e) {
      setError('Failed to delete account')
      setDeleting(false)
    }
  }

  const handleUnfollow = async (targetId) => {
    try {
      await userAPI.unfollowUser(targetId)
      await refreshUser()
      fetchMyData()
    } catch (err) {
      console.error('Unfollow error:', err)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const renderUserList = (users, type) => {
    if (!users || users.length === 0) {
      return (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xl font-bold text-slate-400">No {type} yet.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${u._id || u}`)}>
              {u.photo ? (
                <img src={u.photo} className="w-12 h-12 rounded-full object-cover" alt={u.name} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                  {u.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100">{u.name || 'Unknown'}</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">View Profile</span>
              </div>
            </div>
            {type === 'following' && (
              <button
                onClick={() => handleUnfollow(u._id || u)}
                className="px-4 py-1.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Unfollow
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 sm:p-10 shadow-2xl transition-all">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative group">
              {user?.photo ? (
                <img src={user.photo} className="w-32 h-32 sm:w-44 sm:h-44 rounded-full object-cover ring-8 ring-indigo-50 dark:ring-indigo-900/10 shadow-2xl transition-transform group-hover:scale-105 duration-500" alt={user.name} />
              ) : (
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-8 ring-indigo-50 dark:ring-indigo-900/10 shadow-2xl text-white text-6xl font-black">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-2 right-2 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform active:scale-95">
                <FaEdit className="text-indigo-600" size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={uploadingPhoto} />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5 mb-8">
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{user?.name}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditName(user.name);
                      setEditDob(dobValue);
                      setActiveTab('settings');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <FaEdit size={14} /> Edit
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-full font-black text-xs uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                  >
                    <FaSignOutAlt size={14} /> Logout
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-16 mb-8 px-2 sm:px-0">
                <button onClick={() => setActiveTab('videos')} className="flex flex-col items-center md:items-start group min-w-0">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{user?.videoCount || 0}</span>
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter sm:tracking-widest truncate w-full text-center md:text-left">Videos</span>
                </button>
                <button onClick={() => setActiveTab('followers')} className="flex flex-col items-center md:items-start group min-w-0">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{user?.followers?.length || 0}</span>
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter sm:tracking-widest truncate w-full text-center md:text-left">Followers</span>
                </button>
                <button onClick={() => setActiveTab('following')} className="flex flex-col items-center md:items-start group min-w-0">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{user?.following?.length || 0}</span>
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter sm:tracking-widest truncate w-full text-center md:text-left">Following</span>
                </button>
              </div>

              <p className="text-sm font-bold text-slate-400 tracking-wide uppercase">
                {user?.role === 'admin' ? '🔥 MediaX Administrator' : '✨ Verified Creator'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex justify-start sm:justify-center gap-6 sm:gap-10 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
          {['videos', 'followers', 'following', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-5 px-4 text-xs font-black uppercase tracking-[3px] transition-all relative ${activeTab === tab ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-full shadow-[0_-4px_15px_rgba(79,70,229,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'videos' && (
            videos.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xl font-black text-slate-300">You haven't uploaded any videos yet.</p>
                <Link to="/my-videos" className="inline-block mt-6 px-10 py-3 bg-indigo-600 text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-colors">Start Creating</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((v) => (
                  <button key={v.id} onClick={() => navigate(`/video/${v.id}`)} className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 dark:border-slate-800">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={v.thumbnailUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={v.title} loading="lazy" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-all duration-500">
                          <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="font-black text-xl text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 transition-colors">{v.title}</p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs font-black text-red-500 flex items-center gap-1">❤️ {v.likesCount || 0}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === 'followers' && renderUserList(user?.followers || [], 'followers')}
          {activeTab === 'following' && renderUserList(user?.following || [], 'following')}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-[32px] sm:rounded-[40px] shadow-xl border border-slate-50 dark:border-slate-800 transition-all">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-8 sm:mb-10 flex items-center gap-4">
                <FaEdit className="text-indigo-600" /> Account Settings
              </h3>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 font-bold border border-slate-100 dark:border-slate-700 break-all">{user?.email}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Display Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner text-sm sm:text-base" placeholder="Your Name" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Birth Date</label>
                  <input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner text-sm sm:text-base" />
                </div>

                <div className="pt-6 flex flex-col gap-4">
                  <button onClick={handleSaveProfile} disabled={saving} className="w-full py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[2px] sm:tracking-[3px] text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50">
                    {saving ? 'Synchronizing...' : 'Save Changes'}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-6">
                    <Link to="/forgot-password" title="Security Settings" className="flex items-center justify-center gap-3 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                      <FaKey /> Security
                    </Link>
                    <button onClick={handleDeleteAccount} disabled={deleting} className="flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                      <FaTrash /> Deletion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
