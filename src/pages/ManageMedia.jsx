import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { videosAPI, photosAPI } from '../services/api'

function ManageMedia() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('') // Used for Video Title or Photo Caption
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
  const [itemToDelete, setItemToDelete] = useState(null) // State for confirmation modal

  const [activeTab, setActiveTab] = useState('videos') // 'videos' or 'photos'

  const fetchContent = async () => {
    setError('')
    try {
      if (activeTab === 'videos') {
        const res = await videosAPI.list()
        setVideos(res.videos || [])
      } else {
        const res = await photosAPI.list()
        setPhotos(res.photos || [])
      }
    } catch (e) {
      setError(e.message || 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    fetchContent()

    // Event listeners could be added here for real-time updates if supported for photos too
    // For now, retaining video event source logic but only if activeTab is videos could be an optimization
    // but simplified to just use manual refresh on action for now or keep existing video listener logic.
    const es = videosAPI.createEventsSource()
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        if (data?.type === 'videosUpdated' && activeTab === 'videos') {
          fetchContent()
        }
      } catch {
        // ignore
      }
    }
    es.onerror = () => es.close()
    return () => es.close()
  }, [activeTab]) // Re-fetch when tab changes

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
      // Reset file input manually if needed using ref, but state reset is okay for now if we rely on controlled/uncontrolled mix or just re-render
      // Simple generic reset:
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''

      setUploadProgress(0)
      await fetchContent()
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
      await fetchContent()
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
        // We probably need a photo update API. Check if it exists?
        // Photos usually don't have update title endpoint in our basic impl, let's assume we can't edit caption yet OR we use a hypothetical one.
        // Wait, I didn't add update caption to photosAPI or backend.
        // Let's Skip editing for Photos for now or add it? User didn't explicitly ask for editing logic, just upload.
        // I will disable Edit button for photos for now or implement it later.
        // Actually, let's just show error "Not implemented" for photos or hide the button.
        throw new Error("Editing photo caption is not supported yet.")
      }

      setShowEditModal(false)
      setEditingId(null)
      setEditTitle('')
      await fetchContent()
    } catch (err) {
      setError(err.message || 'Update failed')
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingId(null)
    setEditTitle('')
  }

  if (user && user.role !== 'admin') {
    return null
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 transition-colors">Manage Media</h2>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => { setActiveTab('videos'); setTitle(''); setFile(null); setError('') }}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'videos'
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          Videos
        </button>
        <button
          onClick={() => { setActiveTab('photos'); setTitle(''); setFile(null); setError('') }}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'photos'
            ? 'border-purple-600 text-purple-600 dark:text-purple-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          Photos
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 text-sm transition-colors">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-slate-900 shadow-md p-4 sm:p-5 mb-6 transition-colors">
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              {activeTab === 'videos' ? 'Title' : 'Caption'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeTab === 'videos' ? "Enter video title" : "Enter photo caption"}
              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">
              {activeTab === 'videos' ? 'Video File' : 'Photo File'}
            </label>
            <input
              id="file-upload"
              type="file"
              accept={activeTab === 'videos' ? "video/*" : "image/*"}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-700 dark:text-slate-200 transition-colors"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              disabled={uploading}
              className={`w-full rounded-md py-3 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'videos' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                {uploadProgress < 90 ? 'Uploading in progress...' : uploadProgress < 100 ? 'Saving metadata...' : 'Upload complete!'}
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-1 ${activeTab === 'videos' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'
                  }`}
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress > 10 && (
                  <span className="text-[10px] text-white font-medium">
                    {Math.round(uploadProgress)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 px-6 py-4 shadow-md text-center text-gray-600 dark:text-slate-300 transition-colors">
          Loading media...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'videos' ? sortedVideos.map((v) => (
            <div key={v.id} className="group rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-800">
              <div
                className="aspect-video bg-slate-100 dark:bg-slate-800 transition-colors relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/video/${v.id}`)}
              >
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-800 dark:text-slate-100 transition-colors line-clamp-1 text-lg mb-1">{v.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mb-4">
                  {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(v)}
                    disabled={deletingId === v.id}
                    className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(v)}
                    disabled={deletingId === v.id}
                    className="flex-1 rounded-xl bg-red-50 dark:bg-red-950/30 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === v.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )) : sortedPhotos.map((p) => (
            <div key={p.id} className="group rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-800">
              <div
                className="aspect-square bg-slate-100 dark:bg-slate-800 transition-colors relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/photo/${p.id}`)}
              >
                <img
                  src={p.imageUrl}
                  alt={p.caption}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 p-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {/* Eye or generic icon for viewing */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-800 dark:text-slate-100 transition-colors line-clamp-1 text-lg mb-1">{p.caption || 'Untitled'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mb-4">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    // Edit not yet implemented for photos
                    onClick={() => { alert("Editing photo captions is coming soon!") }}
                    className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(p)}
                    disabled={deletingId === p.id}
                    className="flex-1 rounded-xl bg-red-50 dark:bg-red-950/30 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === p.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xl transition-colors">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 transition-colors">
              <p className="font-semibold text-gray-800 dark:text-slate-100 transition-colors">Edit Video Title</p>
              <button
                type="button"
                className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">Video Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-2 text-sm transition-colors">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 rounded-md bg-indigo-600 py-2.5 text-sm text-white hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xl transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/30 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Media?</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-slate-200">"{itemToDelete.title || itemToDelete.caption}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletingId === itemToDelete.id}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {deletingId === itemToDelete.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageMedia
