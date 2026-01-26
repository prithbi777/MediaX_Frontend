import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEdit, FaTrash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { reviewsAPI } from '../services/api'
import Reviews from './Reviews'

const VideoPlayer = ({ video, onClose, isSmallScreen, standalone = false }) => {
  const { user, token } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video.likesCount || 0)
  const [showReviews, setShowReviews] = useState(standalone) // Default to showing reviews in standalone mode
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && video?.id) {
      fetchLikeStatus()
    }
  }, [token, video?.id])

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

  const toggleReviews = (e) => {
    e.stopPropagation()
    setShowReviews(!showReviews)
  }

  const containerClasses = standalone
    ? "w-full mx-auto max-w-6xl transition-colors flex flex-col"
    : "w-full max-w-4xl rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xl transition-colors max-h-[95vh] flex flex-col"

  const content = (
    <div className={containerClasses} onClick={e => e.stopPropagation()}>
      {!standalone && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 transition-colors">
          <p className="font-semibold text-gray-800 dark:text-slate-100 transition-colors truncate pr-4">{video.title}</p>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-colors"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-black relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
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

      <div className={`${standalone ? 'py-4' : 'p-4'} space-y-4`}>
        {standalone && (
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white line-clamp-2">
            {video.title}
          </h1>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Profile placeholder if needed, or just info */}
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {video.uploaderName || 'Unknown User'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
            <button
              type="button"
              onClick={handleLike}
              disabled={loading || !token}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLiked
                  ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
              <span className="font-medium">{likesCount}</span>
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>

            <button
              type="button"
              onClick={toggleReviews}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${showReviews
                  ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              <FaComment size={18} />
              <span className="font-medium">Comments</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <FaShare size={18} />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>

        {showReviews && (
          <div className={`border-t border-slate-200 dark:border-slate-800 pt-4 ${standalone ? '' : 'max-h-[40vh] overflow-y-auto'}`}>
            <Reviews videoId={video.id} />
          </div>
        )}
      </div>
    </div>
  )

  if (standalone) {
    return content
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      {content}
    </div>
  )
}

export default VideoPlayer
