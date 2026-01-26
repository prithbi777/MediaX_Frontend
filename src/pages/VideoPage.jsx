import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { videosAPI } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import { FaPlay, FaArrowRight, FaRocket } from 'react-icons/fa'

function VideoPage() {
    const { videoId } = useParams()
    const navigate = useNavigate()
    const [video, setVideo] = useState(null)
    const [recommended, setRecommended] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true)
            try {
                // Fetch primary video
                const res = await videosAPI.getVideo(videoId)
                if (res.success) {
                    setVideo(res.video)

                    // Fetch recommendations (list all and filter current)
                    const allRes = await videosAPI.list()
                    if (allRes.success) {
                        const others = allRes.videos.filter(v => v.id !== videoId).slice(0, 6)
                        setRecommended(others)
                    }
                } else {
                    setError('Enterprise Asset not found')
                }
            } catch (err) {
                console.error('Error fetching cinematic content:', err)
                setError(err.message || 'Transmission Interrupted')
            } finally {
                setLoading(false)
            }
        }

        if (videoId) {
            fetchContent()
        }

        // Scroll to top on video change
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [videoId])

    if (loading) {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[6px] text-slate-400 animate-pulse">Synchronizing Stream...</p>
            </div>
        )
    }

    if (error || !video) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-32 text-center">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-12 rounded-[48px] inline-block max-w-lg">
                    <h2 className="text-4xl font-black text-red-600 dark:text-red-400 mb-6 tracking-tighter">
                        {error || 'Target Offline'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">The requested cinematic payload is unavailable.</p>
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

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors pb-24">
            {/* The Main Stage */}
            <div className="w-full max-w-screen-2xl mx-auto">
                <VideoPlayer
                    video={video}
                    standalone={true}
                />
            </div>

            {/* Recommendations Section */}
            {recommended.length > 0 && (
                <div className="w-full max-w-7xl mx-auto px-4 mt-20 border-t border-slate-100 dark:border-slate-800 pt-20">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Expansion Pack</h2>
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Discover more cinematic creations</p>
                        </div>
                        <button onClick={() => navigate('/')} className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] text-indigo-600 hover:text-indigo-700 transition-all">
                            Browse All <FaArrowRight />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {recommended.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => navigate(`/video/${v.id}`)}
                                className="group text-left bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={v.thumbnailUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={v.title} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-all duration-500">
                                            <FaPlay className="text-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h4 className="font-black text-xl text-slate-800 dark:text-white line-clamp-1 mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{v.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{v.uploaderName || 'Creator'}</span>
                                        <FaRocket className="text-slate-200 group-hover:text-indigo-600 group-hover:-translate-y-1 transition-all" size={14} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default VideoPage
