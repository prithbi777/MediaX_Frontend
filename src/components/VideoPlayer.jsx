import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart, FaComment, FaShare, FaUserPlus, FaUserCheck, FaChevronLeft, FaPlayCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { reviewsAPI, userAPI } from '../services/api'
import Reviews from './Reviews'
import { useNavigate } from 'react-router-dom'

const VideoPlayer = ({ video, onClose, isSmallScreen, standalone = false }) => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video.likesCount || 0)
  const [showReviews, setShowReviews] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const uploaderId = video.uploadedBy?._id || (typeof video.uploadedBy === 'string' ? video.uploadedBy : null)

  useEffect(() => {
    if (token && video?.id) {
      fetchLikeStatus()
      if (uploaderId && user?.id !== uploaderId) {
        fetchFollowStatus()
      }
    }
  }, [token, video?.id, uploaderId])

  const fetchFollowStatus = async () => {
    try {
      const res = await userAPI.getFollowStatus(uploaderId)
      setIsFollowing(res.isFollowing)
    } catch (error) {
      console.error('Error fetching follow status:', error)
    }
  }

  const handleFollowToggle = async (e) => {
    e.stopPropagation()
    if (!token) {
      navigate('/login')
      return
    }
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(uploaderId)
        setIsFollowing(false)
      } else {
        await userAPI.followUser(uploaderId)
        setIsFollowing(true)
      }
    } catch (err) {
      console.error('Follow toggle error:', err)
    } finally {
      setFollowLoading(false)
    }
  }

  const fetchLikeStatus = async () => {
    try {
      const res = await reviewsAPI.getVideoLikeStatus(video.id)
      setIsLiked(res.isLiked)
      setLikesCount(res.likesCount)
    } catch (error) {
      console.error('Error fetching like status:', error)
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!token) {
      alert('Please login to like videos')
      return
    }

    setLoading(true)
    try {
      const res = await reviewsAPI.likeVideo(video.id)
      setIsLiked(res.isLiked)
      setLikesCount(res.likesCount)
    } catch (error) {
      console.error('Error liking video:', error)
      alert(error.message || 'Failed to like video')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    const url = window.location.origin + `/video/${video.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this video: ${video.title}`,
          url: url,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url)
        }
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  const containerClasses = standalone
    ? "w-full flex flex-col lg:flex-row gap-8 items-start"
    : "w-full max-w-4xl rounded-[40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl transition-all max-h-[95vh] flex flex-col"

  const videoElement = (
    <div className={`relative w-full overflow-hidden bg-black shadow-2xl transition-all hover:shadow-indigo-500/10 ${standalone ? 'rounded-[40px]' : ''}`} style={{ aspectRatio: '16/9' }}>
      <video
        src={video.videoUrl}
        controls
        autoPlay={standalone || !isSmallScreen}
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain"
        poster={video.thumbnailUrl}
      />
    </div>
  )

  const metaData = (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[2px] border border-indigo-100 dark:border-indigo-800/50">
            <FaPlayCircle className="inline mr-1" /> Cinematic Hub
          </div>
          <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">
            {video.createdAt ? new Date(video.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1]">
          {video.title}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-[32px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 shadow-inner">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/user/${uploaderId}`)}>
          {video.uploaderAvatar ? (
            <img src={video.uploaderAvatar} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900" alt={video.uploaderName} />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-600/20">
              {video.uploaderName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-black text-slate-800 dark:text-white text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{video.uploaderName || 'Unknown User'}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Certified Creator
            </p>
          </div>
        </div>

        {uploaderId && user?.id !== uploaderId && (
          <button
            type="button"
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all transform active:scale-95 flex items-center gap-3 shadow-xl ${isFollowing
              ? 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30'
              } disabled:opacity-50`}
          >
            {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
            <span>{isFollowing ? 'Following' : 'Follow'}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full">
        <button
          type="button"
          onClick={handleLike}
          disabled={loading || !token}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl font-black uppercase tracking-[2px] text-xs transition-all ${isLiked
            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-800/50 shadow-lg shadow-red-600/10'
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 border border-transparent hover:border-red-500/30'
            } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLiked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
          <span>{likesCount} Encores</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-black uppercase tracking-[2px] text-xs border border-transparent hover:border-indigo-500/30 transition-all"
        >
          <FaShare className="text-lg" />
          <span>Broadcast</span>
        </button>
      </div>
    </div>
  )

  if (standalone) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[4px] text-slate-400 hover:text-indigo-600 transition-colors">
            <FaChevronLeft /> Return Hub
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-3/5 space-y-10">
            {videoElement}
            {metaData}
          </div>

          <div className="w-full lg:w-2/5 space-y-8 sticky top-28">
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                <FaComment className="text-indigo-600" /> Creators Feed
              </h3>
              <Reviews videoId={video.id} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 z-[2000] animate-in fade-in duration-300" onClick={onClose}>
      <div className={containerClasses} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Cinematic Overlay</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all transform active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar">
          {videoElement}
          <div className="p-8 sm:p-12">
            {metaData}
            <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <FaComment className="text-indigo-600" /> Discourse
              </h3>
              <Reviews videoId={video.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
