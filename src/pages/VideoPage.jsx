import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { videosAPI } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'

function VideoPage() {
    const { videoId } = useParams()
    const navigate = useNavigate()
    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchVideo = async () => {
            setLoading(true)
            try {
                const res = await videosAPI.getVideo(videoId)
                if (res.success) {
                    setVideo(res.video)
                } else {
                    setError('Video not found')
                }
            } catch (err) {
                console.error('Error fetching video:', err)
                setError(err.message || 'Failed to load video')
            } finally {
                setLoading(false)
            }
        }

        if (videoId) {
            fetchVideo()
        }
    }, [videoId])

    if (loading) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (error || !video) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {error || 'Video not found'}
                </h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                >
                    Go Back Home
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 transition-colors">
            <VideoPlayer
                video={video}
                standalone={true}
            />
        </div>
    )
}

export default VideoPage
