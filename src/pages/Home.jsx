import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { videosAPI } from '../services/api'
import MEME from '../assets/MEME.png'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'

function Home() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeVideo, setActiveVideo] = useState(null)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const userName = (user?.name || '').trim()
  const isAuthLoading = Boolean(token) && !user
  const searchQuery = searchParams.get('search') || ''

  const fetchVideos = async (search = '') => {
    setError('')
    setLoading(true)
    try {
      const res = await videosAPI.list(search)
      setVideos(res.videos || [])
    } catch (e) {
      setError(e.message || 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos(searchQuery)

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
  }, [searchQuery])

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
          className={`text-center sm:text-lg font-extrabold transition-colors mb-10 mt-5 ${isAuthLoading
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
      ) : (!token ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((v) => (
            <button
              key={v.id}
              type="button"
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
              <div className="p-4 sm:p-5">
                <p className="font-bold text-gray-800 dark:text-slate-100 transition-colors line-clamp-2 min-h-[3rem] text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {v.title}
                </p>
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
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors mt-2 text-left cursor-pointer font-medium block"
                  >
                    {v.uploaderName || 'Unknown'}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-slate-400 transition-colors mt-2 text-left block">
                    {v.uploaderName || 'Unknown'}
                  </span>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-slate-400">
                  <p>
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                  </p>
                  {v.likesCount > 0 && (
                    <p className="flex items-center gap-1 font-medium text-red-500">
                      ❤️ {v.likesCount}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div >
  )
}

export default Home
