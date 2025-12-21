import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { videosAPI } from '../services/api'
import MEME from '../assets/MEME.png'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeVideo, setActiveVideo] = useState(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const userName = (user?.name || '').trim()
  const isAuthLoading = Boolean(token) && !user

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

  const sorted = useMemo(() => videos, [videos])

  return (
    <div className="w-full max-w-7xl mb-36 mx-auto">
      <div className="mb-10 sm:mb-16">
        <div
          className={`text-center sm:text-lg font-extrabold transition-colors mb-10 mt-5 ${
            isAuthLoading
              ? 'text-slate-600 dark:text-slate-300 opacity-80 animate-pulse'
              : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {userName ? (
            <>
              <p className='text-2xl'>Welcome</p>
              <span className="text-indigo-600 dark:text-indigo-400 text-3xl transition-colors">{userName}</span>
            </>
          ) : (
            <>
                 <p className='text-2xl'>Welcome to MediaX</p>
            </>
            
          )}
        </div>
        <h2 className="text-center mb-24 text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-slate-100 transition-colors mt-2">
          Where Frames Move Your Soul!
        </h2>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 text-sm transition-colors">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 px-6 py-4 shadow-md text-center text-gray-600 dark:text-slate-300 transition-colors">
          Loading videos...
        </div>
      ) : ( !token ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <img 
            src={MEME} 
            alt="Login required" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mb-6 rounded-lg shadow-lg object-cover"
          />
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 text-center">
            Do Signup/Login to watch videos
          </p>
        </div>
        
      
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActiveVideo(v)}
              className="text-left rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden hover:shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                {v.uploadedBy ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      try {
                        const userId = v.uploadedBy?._id || (typeof v.uploadedBy === 'string' ? v.uploadedBy : null)
                        if (userId) {
                          navigate(`/user/${userId}`)
                        }
                      } catch (err) {
                        console.error('Error navigating to user profile:', err)
                      }
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors mt-1 text-left cursor-pointer inline-block"
                  >
                    Uploaded by {v.uploaderName || 'Unknown'}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-slate-400 transition-colors mt-1 text-left inline-block">
                    Uploaded by {v.uploaderName || 'Unknown'}
                  </span>
                )}
                <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors mt-1">
                  {v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      ))}

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

export default Home
