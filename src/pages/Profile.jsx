import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')

  const navigate = useNavigate()
  const { logout, setUser: setAuthUser } = useAuth()

  const dobValue = useMemo(() => {
    if (!user?.dob) return ''
    const d = new Date(user.dob)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  }, [user])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await userAPI.getMe()
        setUser(res.user)
        setAuthUser(res.user)
      } catch (e) {
        setError(e?.message || 'Failed to load profile')
        if (e?.response?.message === 'Invalid or expired token') {
          logout()
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [logout, navigate])

  const startEdit = () => {
    setIsEditing(true)
    setName(user?.name || '')
    setDob(dobValue)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setName('')
    setDob('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await userAPI.updateMe({
        name,
        dob: dob ? dob : null,
      })
      setUser(res.user)
      setAuthUser(res.user)
      setIsEditing(false)
    } catch (e) {
      setError(e?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    setError('')

    try {
      const res = await userAPI.uploadMyPhoto(file)
      setUser(res.user)
      setAuthUser(res.user)
    } catch (err) {
      setError(err?.message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  const handleDeleteAccount = async () => {
    const ok = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (!ok) return

    setDeleting(true)
    setError('')

    try {
      await userAPI.deleteMe()
      logout()
      navigate('/login')
    } catch (e) {
      setError(e?.message || 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 transition-colors">
        <div className="rounded-xl bg-white dark:bg-slate-900 px-6 py-4 shadow-md transition-colors">
          <p className="text-gray-600 dark:text-slate-300 transition-colors text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-start justify-center bg-slate-100 dark:bg-slate-950 px-4 overflow-x-hidden transition-colors">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 shadow-lg p-5 sm:p-8 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors">
            {(user?.photo || '').trim() ? (
              <img
                src={(user?.photo || '').trim()}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <span className="text-slate-400 text-sm font-semibold">No Photo</span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 transition-colors">Profile</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors">Manage your account details</p>
          </div>

          <button
            type="button"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 py-2"
            onClick={() => navigate('/dashboard')}
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300 transition-colors">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">Email</label>
            <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 transition-colors">
              {user?.email}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">Name</label>
            {isEditing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                placeholder="Your name"
              />
            ) : (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 transition-colors">
                {user?.name}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
              />
            ) : (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 transition-colors">
                {dobValue || '—'}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">Profile photo</label>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingPhoto}
                  onChange={handlePhotoChange}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm transition-colors"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors whitespace-nowrap">
                  {uploadingPhoto ? 'Uploading...' : ''}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 transition-colors">
                {(user?.photo || '').trim() ? 'Photo set' : '—'}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-3 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelEdit}
                  className="w-full sm:w-auto rounded-md border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEdit}
                className="w-full sm:w-auto rounded-md bg-slate-900 dark:bg-indigo-600 px-4 py-3 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors"
              >
                Edit account
              </button>
            )}

            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto sm:ml-auto rounded-md bg-red-500 px-4 py-3 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete account'}
            </button>

            <Link
              to="/forgot-password"
              className="w-full sm:w-auto rounded-md bg-indigo-600 px-4 py-3 text-white text-sm font-medium hover:bg-indigo-700 text-center inline-block"
            >
              Reset Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
