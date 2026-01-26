import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { videosAPI } from '../services/api'
import MEME from '../assets/MEME.png'
import { useAuth } from '../context/AuthContext'
import { FaPlay, FaRocket, FaUserPlus, FaSignInAlt, FaMagic } from 'react-icons/fa'

function Home() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

    es.onerror = () => es.close()
    return () => es.close()
  }, [searchQuery])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsSmallScreen(mq.matches)
    update()
    if (mq.addEventListener) {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }
    mq.addListener(update)
    return () => mq.removeListener(update)
  }, [])

  const sorted = useMemo(() => videos, [videos])

  // --- LANDING PAGE RENDERING (!token) ---
  if (!token) {
    return (
      <div className="w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors pb-24">
        {/* Background Decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-40 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32">
          <div className="text-center space-y-8 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[3px] border border-indigo-100 dark:border-indigo-800/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FaMagic /> Welcome to the Future
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-6 duration-700">
              Where Frames Move <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Your Soul!</span>
            </h1>

            <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 font-bold text-lg sm:text-xl uppercase tracking-wider animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Join the elite circle of cinematic creators and storytellers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 animate-in fade-in slide-in-from-bottom-10 duration-[1200ms]">
              <Link
                to="/signup"
                className="group relative px-10 py-5 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-[4px] text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-600/40 flex items-center gap-3"
              >
                Join Global Hub <FaRocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-[32px] font-black uppercase tracking-[4px] text-sm hover:scale-105 active:scale-95 transition-all border-2 border-slate-100 dark:border-slate-800 flex items-center gap-3"
              >
                Identify <FaSignInAlt />
              </Link>
            </div>
          </div>

          {/* THE CAT SECTION - Premium Framing */}
          <div className="mt-32 relative flex justify-center animate-in zoom-in-95 duration-1000">
            <div className="relative p-2 rounded-[48px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_80px_rgba(79,70,229,0.3)] group">
              <div className="bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden p-4 sm:p-8 flex flex-col items-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] group-hover:bg-indigo-500/40 transition-colors"></div>
                  <img
                    src={MEME}
                    alt="Sad Cat Hub"
                    className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl object-cover relative ring-4 ring-slate-100 dark:ring-slate-800 shadow-2xl"
                  />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Don't be like him.</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[4px]">Sign up now to access full platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- LOGGED IN USER VIEW (token === true) ---
  return (
    <div className="w-full max-w-7xl mb-36 mx-auto px-4">
      <div className="mb-20 pt-10">
        <div
          className={`text-center sm:text-lg font-black transition-colors mb-4 ${isAuthLoading
            ? 'text-slate-600 dark:text-slate-300 opacity-80 animate-pulse'
            : 'text-slate-400 dark:text-slate-500'
            }`}
        >
          {userName ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-[6px] font-black">Logged in as</span>
              <span className="text-4xl sm:text-6xl text-slate-900 dark:text-white font-black tracking-tighter transition-colors">{userName}</span>
            </div>
          ) : (
            <p className='text-4xl font-black tracking-tighter'>Welcome to the Hub</p>
          )}
        </div>
        <h2 className="text-center text-xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-8">
          The Masterpiece Collections
        </h2>
      </div>

      {error && (
        <div className="mb-12 p-6 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm font-bold flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-6">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-[4px] text-slate-400">Calibrating Frames...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sorted.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => navigate(`/video/${v.id}`)}
              className="group text-left rounded-[32px] bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 transition-colors relative overflow-hidden">
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                  <div className="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-all duration-500">
                    <FaPlay className="text-white ml-1" size={24} />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="font-black text-xl text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {v.title}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  {v.uploaderAvatar ? (
                    <img src={v.uploaderAvatar} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] text-white">{(v.uploaderName || 'U').charAt(0)}</div>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{v.uploaderName || 'Unknown Creator'}</span>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                  </p>
                  {v.likesCount > 0 && (
                    <p className="flex items-center gap-1 font-black text-[10px] text-red-500 uppercase tracking-widest">
                      ❤️ {v.likesCount}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
