import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { reviewsAPI } from '../services/api'

const Reviews = ({ videoId }) => {
  const { user, token } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editComment, setEditComment] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (videoId) {
      fetchReviews()
    }
  }, [videoId])

  const fetchReviews = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await reviewsAPI.getVideoReviews(videoId)
      setReviews(res.reviews || [])
    } catch (e) {
      setError(e.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim() || !token) return

    setSubmitting(true)
    try {
      const res = await reviewsAPI.createReview(videoId, comment.trim())
      setReviews([res.review, ...reviews])
      setComment('')
    } catch (error) {
      alert(error.message || 'Failed to post review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (review) => {
    setEditingId(review.id)
    setEditComment(review.comment)
  }

  const handleUpdate = async (reviewId) => {
    if (!editComment.trim()) return

    setSubmitting(true)
    try {
      const res = await reviewsAPI.updateReview(reviewId, editComment.trim())
      setReviews(reviews.map(r => r.id === reviewId ? res.review : r))
      setEditingId(null)
      setEditComment('')
    } catch (error) {
      alert(error.message || 'Failed to update review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    setDeletingId(reviewId)
    try {
      await reviewsAPI.deleteReview(reviewId)
      setReviews(reviews.filter(r => r.id !== reviewId))
    } catch (error) {
      alert(error.message || 'Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLikeReview = async (reviewId) => {
    if (!token) {
      alert('Please login to like reviews')
      return
    }

    try {
      const res = await reviewsAPI.likeReview(reviewId)
      setReviews(reviews.map(r => r.id === reviewId ? res.review : r))
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  const isReviewLiked = (review) => {
    if (!user || !review.likes) return false
    const userId = user.id || user._id
    return review.likes.some(likeId => likeId === userId || likeId.toString() === userId?.toString())
  }

  const isReviewOwner = (review) => {
    if (!user) return false
    const userId = user.id || user._id
    const reviewUserId = review.user?.id || review.user?._id
    return userId === reviewUserId || userId?.toString() === reviewUserId?.toString()
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
        Reviews ({reviews.length})
      </h3>

      {/* Add review form */}
      {token ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a review..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
          />
          <button
            type="submit"
            disabled={!comment.trim() || submitting}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-gray-600 dark:text-slate-400">
          Please login to post a review
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 text-sm transition-colors">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-600 dark:text-slate-400 py-8">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-slate-400 py-8">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                {review.user?.photo ? (
                  <img
                    src={review.user.photo}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle size={40} className="text-gray-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-800 dark:text-slate-100">
                      {review.user?.name || 'Anonymous'}
                    </p>
                    {isReviewOwner(review) && (
                      <div className="flex items-center gap-2">
                        {editingId === review.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdate(review.id)}
                              disabled={submitting}
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null)
                                setEditComment('')
                              }}
                              className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEdit(review)}
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(review.id)}
                              disabled={deletingId === review.id}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingId === review.id ? (
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleLikeReview(review.id)}
                      disabled={!token}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        isReviewLiked(review)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                      } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isReviewLiked(review) ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                      <span>{review.likesCount || 0}</span>
                    </button>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(review.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews
