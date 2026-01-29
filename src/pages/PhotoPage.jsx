import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { photosAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaHeart, FaRegHeart, FaComment, FaShare, FaUserPlus, FaUserCheck, FaChevronLeft, FaCamera } from 'react-icons/fa'
import Reviews from '../components/Reviews'

function PhotoPage() {
    const { photoId } = useParams()
    const navigate = useNavigate()
    const { user, token } = useAuth()

    const [photo, setPhoto] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Interaction states
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [likeLoading, setLikeLoading] = useState(false)

    // Follow states
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true)
            try {
                const res = await photosAPI.getPhoto(photoId)
                if (res.success) {
                    setPhoto(res.photo)
                    setLikesCount(res.photo.likesCount || 0)
                    setIsLiked(res.photo.isLiked)

                    // Check follow status if not own photo
                    if (token && res.photo.uploadedBy && user?.id !== res.photo.uploadedBy._id) {
                        try {
                            const followRes = await userAPI.getFollowStatus(res.photo.uploadedBy._id)
                            setIsFollowing(followRes.isFollowing)
                        } catch (err) {
                            console.error('Follow check failed', err)
                        }
                    }
                } else {
                    setError('Photo not found')
                }
            } catch (err) {
                console.error('Error fetching photo:', err)
                setError(err.message || 'Failed to load photo')
            } finally {
                setLoading(false)
            }
        }

        if (photoId) {
            fetchContent()
        }

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [photoId, token, user?.id])

    const handleLike = async () => {
        if (!token) {
            navigate('/login')
            return
        }

        setLikeLoading(true)
        try {
            const res = await photosAPI.like(photo.id)
            setIsLiked(res.isLiked)
            setLikesCount(res.likesCount)
        } catch (err) {
            console.error('Like failed', err)
        } finally {
            setLikeLoading(false)
        }
    }

    const handleFollowToggle = async () => {
        if (!token) {
            navigate('/login')
            return
        }
        setFollowLoading(true)
        try {
            if (isFollowing) {
                await userAPI.unfollowUser(photo.uploadedBy._id)
                setIsFollowing(false)
            } else {
                await userAPI.followUser(photo.uploadedBy._id)
                setIsFollowing(true)
            }
        } catch (err) {
            console.error('Follow toggle error:', err)
        } finally {
            setFollowLoading(false)
        }
    }

    const handleShare = async () => {
        const url = window.location.href
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'MediaX Photo',
                    text: photo.caption || 'Check out this photo!',
                    url: url
                })
            } catch (err) {
                // ignore abort
            }
        } else {
            navigator.clipboard.writeText(url)
            alert('Link copied!')
        }
    }

    if (loading) {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[6px] text-slate-400 animate-pulse">Loading Pixel Data...</p>
            </div>
        )
    }

    if (error || !photo) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-32 text-center">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-12 rounded-[48px] inline-block max-w-lg">
                    <h2 className="text-4xl font-black text-red-600 dark:text-red-400 mb-6 tracking-tighter">
                        {error || 'Photo unavailable'}
                    </h2>
                    <button
                        onClick={() => navigate('/')}
                        className="px-12 py-5 bg-indigo-600 text-white rounded-[32px] font-black uppercase text-xs tracking-[4px] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        )
    }

    const uploaderId = photo.uploadedBy?._id || photo.uploadedBy

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors pb-24">
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="mb-10">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[4px] text-slate-400 hover:text-purple-600 transition-colors">
                        <FaChevronLeft /> Return
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* LEFT COLUMN: Photo and Metadata */}
                    <div className="w-full lg:w-3/5 space-y-10">
                        {/* Photo Container */}
                        <div className="relative w-full rounded-[40px] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl">
                            <img
                                src={photo.imageUrl}
                                alt={photo.caption}
                                className="w-full h-auto object-contain max-h-[80vh]"
                            />
                        </div>

                        {/* Metadata Actions */}
                        <div className="flex flex-col gap-6 w-full">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[2px] border border-purple-100 dark:border-purple-800/50">
                                        <FaCamera className="inline mr-1" /> Snapshot
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">
                                        {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1]">
                                    {photo.caption || 'Untitled Photo'}
                                </h1>
                            </div>

                            {/* Uploader Card */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/user/${uploaderId}`)}>
                                    {photo.uploadedBy?.photo ? (
                                        <img src={photo.uploadedBy.photo} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800" alt={photo.uploaderName} />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-600/20">
                                            {photo.uploaderName?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-black text-slate-800 dark:text-white text-lg group-hover:text-purple-600 transition-colors uppercase tracking-tight">{photo.uploaderName || 'Unknown User'}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                            Creative Soul
                                        </p>
                                    </div>
                                </div>

                                {token && user?.id !== uploaderId && (
                                    <button
                                        type="button"
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all transform active:scale-95 flex items-center gap-3 shadow-xl ${isFollowing
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
                                            } disabled:opacity-50`}
                                    >
                                        {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
                                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                                    </button>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 w-full">
                                <button
                                    type="button"
                                    onClick={handleLike}
                                    disabled={likeLoading || !token}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl font-black uppercase tracking-[2px] text-xs transition-all ${isLiked
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-800/50 shadow-lg shadow-red-600/10'
                                        : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-red-500/30'
                                        } ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLiked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
                                    <span>{likesCount} Loves</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl bg-white dark:bg-slate-900 text-slate-500 font-black uppercase tracking-[2px] text-xs border border-slate-100 dark:border-slate-800 hover:border-purple-500/30 transition-all"
                                >
                                    <FaShare className="text-lg" />
                                    <span>Broadcast</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Comments */}
                    <div className="w-full lg:w-2/5 space-y-8 sticky top-28">
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                                <FaComment className="text-purple-600" /> Discussion
                            </h3>
                            <Reviews photoId={photo.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhotoPage
