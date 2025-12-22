import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { videosAPI } from '../services/api'

function ManageMedia() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchVideos = async () => {
    setError('')
    try {
      const res = await videosAPI.list()
      setVideos(res.videos || [])
    } catch (e) {
      setError(e.message || 'Failed to load videos')
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

  const sorted = useMemo(() => videos, [videos])

  const handleUpload = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please provide a title')
      return
    }

    if (!file) {
      setError('Please choose a video file')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      await videosAPI.upload({ 
        title: title.trim(), 
        file,
        onProgress: (progress) => {
          setUploadProgress(progress)
        }
      })
      setTitle('')
      setFile(null)
      setUploadProgress(0)
      await fetchVideos()
    } catch (err) {
      setError(err.message || 'Upload failed')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    setDeletingId(id)
    try {
      await videosAPI.remove(id)
      await fetchVideos()
    } catch (err) {
      setError(err.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (video) => {
    setEditingId(video.id)
    setEditTitle(video.title)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    setError('')
    if (!editTitle.trim()) {
      setError('Please provide a title')
      return
    }

    try {
      await videosAPI.updateTitle(editingId, editTitle.trim())
      setShowEditModal(false)
      setEditingId(null)
      setEditTitle('')
      await fetchVideos()
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

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 text-sm transition-colors">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-slate-900 shadow-md p-4 sm:p-5 mb-6 transition-colors">
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors mb-1">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-700 dark:text-slate-200 transition-colors"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-md bg-indigo-600 py-3 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                {uploadProgress < 90 ? 'Uploading to Cloudinary...' : uploadProgress < 100 ? 'Saving metadata...' : 'Upload complete!'}
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-1"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((v) => (
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

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(v)}
                    disabled={deletingId === v.id}
                    className="flex-1 rounded-md bg-indigo-600 py-2.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="flex-1 rounded-md bg-red-500 py-2.5 text-sm text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === v.id ? 'Deleting...' : 'Delete'}
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
    </div>
  )
}

export default ManageMedia
