import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { videosAPI, photosAPI } from '../services/api'
import { FaEdit, FaTrash, FaCloudUploadAlt, FaFileVideo, FaCheckCircle, FaExclamationTriangle, FaChevronLeft, FaPlay, FaVideo, FaHdd, FaArrowRight, FaShieldAlt, FaUserAlt, FaImage } from 'react-icons/fa'

function MyVideos() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'admin'

  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)

  const [videos, setVideos] = useState([])
  const [photos, setPhotos] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [activeTab, setActiveTab] = useState('videos')

  const fetchUserContent = async () => {
    setError('')
    try {
      if (activeTab === 'videos') {
        const res = await videosAPI.getUserVideos()
        setVideos(res.videos || [])
      } else {
        // Since we don't have a specific getUserPhotos, we fetch all and filter or use list (which might be heavy but okay for now)
        // Optimally we should add getUserPhotos to API. 
        // Let's rely on list() and filter for now as done in UserProfile, or better yet, assume backend filtered it?
        // No, list() returns all. 
        // Let's just fetch all and filter by current user ID.
        const res = await photosAPI.list()

        // If admin, show all photos. If normal user, filter by ownership.
        const myPhotos = (res.photos || []).filter(p => {
          if (isAdmin) return true

          // Check if uploadedBy object or string matches user.id
          const uId = p.uploadedBy?._id || p.uploadedBy
          return uId === user?.id
        })
        setPhotos(myPhotos)
      }
    } catch (e) {
      setError(e.message || 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    fetchUserContent()

    // Event listeners
    const es = videosAPI.createEventsSource()
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        if (data?.type === 'videosUpdated' && activeTab === 'videos') {
          fetchUserContent()
        }
      } catch {
        // ignore
      }
    }

    es.onerror = () => es.close()
    return () => es.close()
  }, [token, navigate, activeTab]) // Refetch on tab change

  const sortedVideos = useMemo(() => videos, [videos])
  const sortedPhotos = useMemo(() => photos, [photos])

  const handleUpload = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError(activeTab === 'videos' ? 'Please provide a title' : 'Please provide a caption')
      return
    }

    if (!file) {
      setError(activeTab === 'videos' ? 'Please choose a video file' : 'Please choose a photo')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      if (activeTab === 'videos') {
        await videosAPI.upload({
          title: title.trim(),
          file,
          onProgress: (progress) => {
            setUploadProgress(progress)
          }
        })
      } else {
        await photosAPI.upload({
          caption: title.trim(),
          file,
          onProgress: (progress) => {
            setUploadProgress(progress)
          }
        })
      }

      setTitle('')
      setFile(null)
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      setUploadProgress(0)
      await fetchUserContent()
    } catch (err) {
      setError(err.message || 'Upload failed')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    setError('')
    setDeletingId(itemToDelete.id)
    try {
      if (activeTab === 'videos') {
        await videosAPI.remove(itemToDelete.id)
      } else {
        await photosAPI.remove(itemToDelete.id)
      }
      setItemToDelete(null)
      await fetchUserContent()
    } catch (err) {
      setError(err.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditTitle(activeTab === 'videos' ? item.title : item.caption)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    setError('')
    if (!editTitle.trim()) {
      setError(activeTab === 'videos' ? 'Please provide a title' : 'Please provide a caption')
      return
    }

    try {
      if (activeTab === 'videos') {
        await videosAPI.updateTitle(editingId, editTitle.trim())
      } else {
        await photosAPI.updateCaption(editingId, editTitle.trim())
      }
      setShowEditModal(false)
      setEditingId(null)
      setEditTitle('')
      await fetchUserContent()
    } catch (err) {
      setError(err.message || 'Update failed')
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24">
      {/* Header Section */}
      <div className="mb-12 pt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                {isAdmin ? 'Master Admin Studio' : 'Creator Studio'}
              </h1>
              {isAdmin && (
                <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-indigo-600/30">
                  Superpower Active
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">
              {isAdmin ? 'Global content management & system control' : 'Manage and upload your masterpiece collection'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'videos' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600'}`}>
                {activeTab === 'videos' ? <FaVideo /> : <FaImage />}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {activeTab === 'videos' ? videos.length : photos.length}
                </p>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">
                  {activeTab === 'videos' ? 'Videos' : 'Photos'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex justify-center sm:justify-start gap-4 mb-8">
        <button
          onClick={() => { setActiveTab('videos'); setTitle(''); setFile(null); setError('') }}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'videos'
            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
            : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
        >
          Videos
        </button>
        <button
          onClick={() => { setActiveTab('photos'); setTitle(''); setFile(null); setError('') }}
          className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'photos'
            ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20'
            : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
        >
          Photos
        </button>
      </div>

      {error && !uploading && (
        <div className="mb-8 p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-4">
          <FaExclamationTriangle className="shrink-0" />
          {error}
        </div>
      )}

      {/* Upload Pod */}
      <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[40px] shadow-2xl p-8 sm:p-12 mb-16 transition-all duration-500 overflow-hidden relative group`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2 ${activeTab === 'videos' ? 'bg-indigo-500/5' : 'bg-purple-500/5'}`}></div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4">
          <FaCloudUploadAlt className={activeTab === 'videos' ? 'text-indigo-600' : 'text-purple-600'} />
          {activeTab === 'videos' ? 'Dispatch New Video' : 'Upload New Photo'}
        </h3>

        <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-5 group/input">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">
              {activeTab === 'videos' ? 'Content Master Title' : 'Photo Caption'}
            </label>
            <div className="relative">
              <FaEdit className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={activeTab === 'videos' ? "Enter unique title" : "Enter photo caption"}
                className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="lg:col-span-4 relative group/file">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">
              {activeTab === 'videos' ? 'Raw Video Source' : 'Photo Source'}
            </label>
            <div className="relative overflow-hidden cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700/50 hover:border-indigo-600 rounded-3xl transition-all">
              <input
                type="file"
                accept={activeTab === 'videos' ? "video/*" : "image/*"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center gap-4 px-6 py-4 transition-colors">
                {activeTab === 'videos' ? <FaFileVideo size={20} className={file ? 'text-green-500' : 'text-slate-400'} /> : <FaImage size={20} className={file ? 'text-green-500' : 'text-slate-400'} />}
                <span className="text-sm font-black text-slate-600 dark:text-slate-300 truncate tracking-wide">
                  {file ? file.name : (activeTab === 'videos' ? 'Choose Video File' : 'Choose Photo')}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-5 text-white rounded-[28px] font-black uppercase tracking-[4px] text-xs shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${activeTab === 'videos'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                }`}
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Initialize Upload <FaArrowRight size={12} /></>
              )}
            </button>
          </div>
        </form>

        {uploading && (
          <div className="mt-12 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'videos' ? 'bg-indigo-600' : 'bg-purple-600'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {uploadProgress < 90 ? 'Synchronizing Bits...' : uploadProgress < 100 ? 'Finalizing Metadata...' : 'Payload Secure'}
                </span>
              </div>
              <span className={`text-2xl font-black ${activeTab === 'videos' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}`}>
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)] ${activeTab === 'videos' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'}`}
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="space-y-10">
        <h2 className="text-[10px] font-black uppercase tracking-[6px] text-slate-400 flex items-center gap-4">
          <FaHdd size={14} /> {isAdmin ? 'Global Production Grid' : 'Personal Inventory'}
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
        </h2>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6">
            <div className={`w-12 h-12 border-4 rounded-full animate-spin ${activeTab === 'videos' ? 'border-indigo-600/20 border-t-indigo-600' : 'border-purple-600/20 border-t-purple-600'}`}></div>
            <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Scanning Grid...</p>
          </div>
        ) : (activeTab === 'videos' ? videos.length === 0 : photos.length === 0) ? (
          <div className="py-32 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center px-10">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-300 dark:text-slate-600 mb-8">
              {activeTab === 'videos' ? <FaVideo size={40} /> : <FaImage size={40} />}
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Inventory Empty</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for your first payload</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {activeTab === 'videos' ? sortedVideos.map((v) => (
              <div key={v.id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-50 dark:border-slate-800/50 relative">
                {isAdmin && v.uploadedBy?._id !== user?.id && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-purple-600/90 backdrop-blur-md rounded-full text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                    <FaShieldAlt /> System Control
                  </div>
                )}

                <div
                  className="aspect-video bg-slate-100 dark:bg-slate-800 transition-colors relative cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/video/${v.id}`)}
                >
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                    <div className="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                      <FaPlay size={24} className="text-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="font-black text-xl text-slate-800 dark:text-slate-100 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">{v.title}</h4>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-5 h-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-[8px] text-indigo-600">
                      <FaUserAlt />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {v.uploaderName || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                    </p>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(v)}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(v)}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-3xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1"
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )) : sortedPhotos.map((p) => (
              <div key={p.id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-50 dark:border-slate-800/50 relative">
                <div
                  className="aspect-square bg-slate-100 dark:bg-slate-800 transition-colors relative cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/photo/${p.id}`)}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.caption}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                    <div className="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                      {/* View icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="font-black text-xl text-slate-800 dark:text-slate-100 line-clamp-1 mb-2 group-hover:text-purple-600 transition-colors">{p.caption}</h4>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-5 h-5 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-[8px] text-purple-600">
                      <FaUserAlt />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {p.uploaderName || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                    </p>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all transform hover:-translate-y-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(p)}
                      className="flex-1 flex items-center justify-center gap-2 p-4 rounded-3xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1"
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 z-[1000] animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-white/20 dark:border-slate-800 p-10 transform animate-in slide-in-from-bottom-8 duration-500">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-4 text-center">Refine {activeTab === 'videos' ? 'Title' : 'Caption'}</h3>
            <p className="text-[10px] font-black text-slate-400 tracking-[4px] uppercase text-center mb-10">Updating existing payload metadata</p>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">New Identity</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-8 py-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleCancelEdit} className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={handleSaveEdit} className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 z-[1000] animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-red-100 dark:border-red-900/30 p-12 text-center transform animate-in zoom-in-95 duration-500">
            <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-[32px] flex items-center justify-center text-red-600 mb-8 border border-red-100 dark:border-red-800">
              <FaTrash size={32} />
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-4">Decommission Asset?</h3>
            <p className="text-slate-400 font-bold text-sm mb-10 leading-relaxed uppercase tracking-widest">
              Confirming final removal of <br /><span className="text-red-600">"{itemToDelete.title || itemToDelete.caption}"</span><br /> This cannot be reversed.
            </p>

            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Hold Back</button>
              <button onClick={handleDelete} className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest bg-red-600 text-white shadow-xl shadow-red-600/30">Destroy Payload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyVideos
