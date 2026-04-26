import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api, PLATFORMS } from '../services/api'
import Breadcrumb from '../components/Breadcrumb'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

export default function VideoPlayer() {
  const { platformId, batchId, videoId } = useParams()
  const [searchParams] = useSearchParams()
  const [video, setVideo] = useState(null)
  const [playUrl, setPlayUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const platform = PLATFORMS.find(p => p.id === platformId)

  useEffect(() => {
    loadVideo()
  }, [platformId, batchId, videoId])

  async function loadVideo() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchVideoDetails(platformId, batchId, videoId)
      setVideo(data)
      if (data.playUrl) setPlayUrl(data.playUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchVideoDetails(pid, bid, vid) {
    // Padhle
    if (pid === 'padhle') {
      const data = await api.padhle.videoDetails(bid, vid)
      const v = data.data || data
      let url = v.video_player_url || ''

      if (url) {
        try {
          const playData = await api.padhle.play(url)
          if (playData.url || playData.data) {
            url = playData.url || playData.data || url
          }
        } catch (_) {
          // use original url
        }
      }

      return {
        title: v.Title || v.title || v.name || 'Video',
        type: v.material_type || 'VIDEO',
        playUrl: url,
        token: v.video_player_token || '',
        pdfLink: v.pdf_link || '',
        pdfKey: v.pdf_encryption_key || '',
        duration: v.duration || '',
      }
    }

    // ScienceAndFun
    if (pid === 'scienceandfun') {
      const data = await api.scienceandfun.videoDetails(bid, vid)
      const v = data.data || data
      let url = v.video_player_url || ''

      if (url) {
        try {
          const playData = await api.scienceandfun.play(url)
          if (playData.url || playData.data) {
            url = playData.url || playData.data || url
          }
        } catch (_) {}
      }

      return {
        title: v.Title || v.title || 'Video',
        playUrl: url,
        pdfLink: v.pdf_link || '',
        duration: v.duration || '',
      }
    }

    // Vibrant
    if (pid === 'vibrant') {
      const data = await api.vibrant.videoDetails(bid, vid)
      const v = data.data || data
      let url = v.video_player_url || ''

      if (url) {
        try {
          const playData = await api.vibrant.play(url)
          if (playData.url || playData.data) {
            url = playData.url || playData.data || url
          }
        } catch (_) {}
      }

      return {
        title: v.Title || v.title || 'Video',
        playUrl: url,
        pdfLink: v.pdf_link || '',
        duration: v.duration || '',
      }
    }

    // KGS: video URL passed via query param or direct YouTube embed
    if (pid === 'kgs') {
      const videoUrl = searchParams.get('url') || ''
      return {
        title: searchParams.get('name') || 'KGS Video',
        playUrl: videoUrl,
        isEmbed: videoUrl.includes('youtube.com/embed'),
      }
    }

    // NextToppers: DRM video
    if (pid === 'nexttoppers') {
      try {
        const data = await api.nexttoppers.videoDrm(vid)
        const v = data.data || data
        return {
          title: v.title || 'Video',
          playUrl: v.file_url || v.url || '',
          isDrm: v.is_drm || false,
          thumbnail: v.thumbnail || '',
        }
      } catch (_) {
        return { title: 'Video', playUrl: '', error: 'Could not load DRM video details' }
      }
    }

    // PW
    if (pid === 'pw') {
      const childId = searchParams.get('childId') || vid
      try {
        const data = await api.pw.getUrl({ childId, batchId: bid })
        return {
          title: data.name || data.title || 'PW Video',
          playUrl: data.url || data.videoUrl || '',
          isDrm: true,
        }
      } catch (_) {
        return { title: 'PW Video', playUrl: '', error: 'Could not load video URL' }
      }
    }

    return { title: 'Video', playUrl: '' }
  }

  function renderPlayer() {
    if (!video) return null

    const url = playUrl || video.playUrl || ''

    if (!url) {
      return (
        <div className="video-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 0, height: 400 }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '3rem', marginBottom: 12 }}>🎬</p>
            <p>Video URL not available</p>
            {video.error && <p style={{ color: 'var(--danger)', marginTop: 8 }}>{video.error}</p>}
          </div>
        </div>
      )
    }

    // YouTube embed
    if (url.includes('youtube.com/embed') || url.includes('youtu.be')) {
      const embedUrl = url.includes('embed') ? url : `https://www.youtube.com/embed/${url.split('/').pop()}`
      return (
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }

    // M3U8/HLS or MPD/DASH
    if (url.includes('.m3u8') || url.includes('.mpd')) {
      return (
        <div className="video-wrapper">
          <video controls autoPlay src={url} />
        </div>
      )
    }

    // Generic iframe for other URLs
    if (url.startsWith('http')) {
      return (
        <div className="video-wrapper">
          <iframe src={url} title={video.title} allowFullScreen />
        </div>
      )
    }

    return (
      <div className="video-wrapper">
        <video controls autoPlay src={url} />
      </div>
    )
  }

  if (!platform) return <ErrorState message="Platform not found" />

  return (
    <>
      <Breadcrumb items={[
        { label: platform.name, to: `/platform/${platformId}` },
        { label: `Batch ${batchId}`, to: `/platform/${platformId}/batch/${batchId}` },
        { label: video?.title || 'Video' },
      ]} />

      {loading ? (
        <Loading message="Loading video..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadVideo} />
      ) : (
        <div className="video-container">
          {renderPlayer()}

          <div className="video-info">
            <h1>{video?.title || 'Video'}</h1>
            <div className="video-meta">
              {video?.duration && <span>⏱️ {video.duration}</span>}
              <span>📺 {platform.name}</span>
            </div>
          </div>

          {/* PDF Attachments */}
          {video?.pdfLink && (
            <div className="video-attachments">
              <h3>📎 Attachments</h3>
              <div
                className="attachment-item"
                onClick={() => window.open(video.pdfLink, '_blank')}
              >
                <span>📄</span>
                <span>Download Notes / PDF</span>
                <span style={{ marginLeft: 'auto', color: 'var(--accent-light)' }}>📥</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
