import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaBell, FaHeart, FaComment, FaCloudUploadAlt, FaCheck, FaTrash, FaCircle, FaUserPlus } from "react-icons/fa"
import { notificationsAPI } from "../services/api"
import { formatDistanceToNow } from "date-fns"

const Notifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const data = await notificationsAPI.list()
            if (data.success) {
                setNotifications(data.notifications)
            }
        } catch (err) {
            setError("Failed to load notifications")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkRead = async (id) => {
        try {
            await notificationsAPI.markRead(id)
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n))
        } catch (err) {
            console.error("Failed to mark notification as read", err)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead()
            setNotifications(notifications.map(n => ({ ...n, read: true })))
        } catch (err) {
            console.error("Failed to mark all as read", err)
        }
    }

    const handleDelete = async (id, e) => {
        e.stopPropagation()
        try {
            await notificationsAPI.remove(id)
            setNotifications(notifications.filter(n => n._id !== id))
        } catch (err) {
            console.error("Failed to delete notification", err)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'video_like': return <FaHeart className="text-pink-500" />
            case 'video_comment': return <FaComment className="text-blue-500" />
            case 'photo_like': return <FaHeart className="text-purple-500" />
            case 'photo_comment': return <FaComment className="text-purple-500" />
            case 'comment_like': return <FaHeart className="text-rose-500" size={12} />
            case 'following_upload': return <FaCloudUploadAlt className="text-indigo-500" />
            case 'new_follower': return <FaUserPlus className="text-emerald-500" />
            default: return <FaBell className="text-slate-400" />
        }
    }

    const getMessage = (notification) => {
        const senderName = notification.sender?.name || "Someone"
        switch (notification.type) {
            case 'video_like': return <span><b>{senderName}</b> liked your video</span>
            case 'video_comment': return <span><b>{senderName}</b> commented on your video</span>
            case 'photo_like': return <span><b>{senderName}</b> liked your photo</span>
            case 'photo_comment': return <span><b>{senderName}</b> commented on your photo</span>
            case 'comment_like': return <span><b>{senderName}</b> liked your comment</span>
            case 'following_upload': return <span><b>{senderName}</b> uploaded a new media</span>
            case 'new_follower': return <span><b>{senderName}</b> started following you</span>
            default: return <span>New interaction from <b>{senderName}</b></span>
        }
    }

    const handleNotificationClick = (notification) => {
        handleMarkRead(notification._id)
        if (notification.video) {
            navigate(`/video/${notification.video._id || notification.video}`)
        } else if (notification.photo) {
            navigate(`/photo/${notification.photo._id || notification.photo}`)
        } else if (notification.type === 'new_follower' && notification.sender) {
            navigate(`/user/${notification.sender._id || notification.sender}`)
        }
    }

    return (
        <div className="max-w-3xl mx-auto w-full py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <FaBell className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Notifications</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Stay updated with your community</p>
                    </div>
                </div>

                {notifications.length > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-all"
                    >
                        <FaCheck size={12} />
                        Mark all read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-bold">Loading your feed...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
                    <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                    <button onClick={fetchNotifications} className="mt-4 text-indigo-600 font-bold underline">Try again</button>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                    <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FaBell className="text-slate-300 dark:text-slate-600 text-3xl" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No notifications yet</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">When people like your videos or follow you, you'll see them here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`group relative flex items-center gap-4 p-5 rounded-[2rem] transition-all cursor-pointer border ${notification.read
                                ? 'bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 grayscale-[0.5] opacity-80'
                                : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/30 shadow-lg shadow-indigo-600/5 scale-[1.02]'
                                } hover:scale-[1.01] hover:border-indigo-300 dark:hover:border-indigo-700`}
                        >
                            <div className="relative">
                                {notification.sender?.photo ? (
                                    <img src={notification.sender.photo} alt="" className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <FaBell size={20} />
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-lg ring-2 ring-slate-50 dark:ring-slate-800">
                                    {getIcon(notification.type)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className={`text-sm md:text-base leading-snug ${notification.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}>
                                        {getMessage(notification)}
                                    </p>
                                    {!notification.read && <FaCircle className="text-indigo-600 text-[8px] animate-pulse" />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                    {notification.comment && (
                                        <span className="text-xs text-slate-400 truncate max-w-[150px italic]">
                                            "{notification.comment.comment}"
                                        </span>
                                    )}
                                </div>
                            </div>

                            {notification.video?.thumbnailUrl && (
                                <div className="hidden sm:block w-20 h-14 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
                                    <img src={notification.video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {notification.photo?.imageUrl && (
                                <div className="hidden sm:block w-20 h-14 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
                                    <img src={notification.photo.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <button
                                onClick={(e) => handleDelete(notification._id, e)}
                                className="opacity-0 group-hover:opacity-100 p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Notifications
