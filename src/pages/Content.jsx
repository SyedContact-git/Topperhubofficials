import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api, PLATFORMS } from '../services/api'
import Breadcrumb from '../components/Breadcrumb'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import ImageWithFallback from '../components/ImageWithFallback'

export default function Content() {
  const { platformId, batchId, parentId } = useParams()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const platform = PLATFORMS.find(p => p.id === platformId)

  useEffect(() => {
    loadContent()
  }, [platformId, batchId, parentId])

  async function loadContent() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchContent(platformId, batchId, parentId)
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchContent(pid, bid, pid2) {
    // KGS: lessons for a subject
    if (pid === 'kgs') {
      const data = await api.kgs.lessons(pid2)
      const lessons = data.lessons || data.data || []
      return lessons.map((l, i) => ({
        id: l.id || i,
        name: l.name || l.title,
        type: 'video',
        videoUrl: l.video_url || l.hd_video_url || '',
        thumbnail: l.thumb || '',
        date: l.published_at || '',
        pdfTitle: l.pdfs?.title || '',
        pdfUrl: l.pdfs?.url || '',
      }))
    }

    // Padhle, ScienceAndFun, Vibrant: subfolder content
    if (['padhle', 'scienceandfun', 'vibrant'].includes(pid)) {
      const apiObj = api[pid]
      const data = await apiObj.content(bid, pid2)
      const contentItems = data.data || []
      return contentItems.map(item => ({
        id: item.id,
        name: item.Title || item.name || item.title,
        type: (item.material_type || 'FOLDER').toUpperCase(),
        videos: parseInt(item.videos_count) || 0,
        notes: parseInt(item.files_count) || 0,
        tests: parseInt(item.tests_count) || 0,
        image: item.image || item.thumbnail || '',
        pdfLink: item.pdf_link || '',
        videoUrl: item.video_player_url || '',
        duration: item.duration || '',
        liveStatus: item.live_status,
        eventDate: item.event_date || '',
      }))
    }

    // RWA: subjects detail (limited API)
    if (pid === 'rwa') {
      return [{ id: 'info', name: 'Detailed content not available for RWA. Only subjects are shown at batch level.', type: 'INFO' }]
    }

    // PW: topics for a subject
    if (pid === 'pw') {
      const slug = searchParams.get('slug') || ''
      const data = await api.pw.topics(bid, pid2)
      if (data.data && typeof data.data === 'string' && data.data.includes(':')) {
        return [{ id: 'encrypted', name: 'Topics data is encrypted', type: 'INFO' }]
      }
      const topics = data.data || data.topics || []
      if (!Array.isArray(topics)) return []
      return topics.map(t => ({
        id: t._id || t.id || t.topicId,
        name: t.topic || t.name || t.topicName,
        type: 'FOLDER',
        slug: t.slug || '',
        image: t.image || '',
      }))
    }

    return []
  }

  function getItemIcon(type) {
    switch (type) {
      case 'FOLDER': return '📁'
      case 'VIDEO': return '🎬'
      case 'PDF': return '📄'
      case 'LINK': return '🔗'
      case 'video': return '🎬'
      case 'INFO': return 'ℹ️'
      default: return '📁'
    }
  }

  function getItemLink(item) {
    if (item.type === 'INFO') return null
    if (item.type === 'FOLDER' || item.type === 'folder') {
      if (platformId === 'pw' && item.slug) {
        return `/platform/${platformId}/batch/${batchId}/content/${item.id}?slug=${item.slug}`
      }
      return `/platform/${platformId}/batch/${batchId}/content/${item.id}`
    }
    if (item.type === 'VIDEO' || item.type === 'video') {
      return `/platform/${platformId}/batch/${batchId}/video/${item.id}`
    }
    return null
  }

  function handlePdfDownload(url, name) {
    if (url) {
      window.open(url, '_blank')
    }
  }

  if (!platform) return <ErrorState message="Platform not found" />

  return (
    <>
      <Breadcrumb items={[
        { label: platform.name, to: `/platform/${platformId}` },
        { label: `Batch ${batchId}`, to: `/platform/${platformId}/batch/${batchId}` },
        { label: parentId ? `Content` : 'Root' },
      ]} />

      <div className="page-header">
        <h1>Content Explorer</h1>
        <p>{platform.name} - Batch #{batchId}</p>
      </div>

      {loading ? (
        <Loading message="Loading content..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadContent} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No content found in this folder</p>
        </div>
      ) : (
        <>
          {/* Show KGS lessons as a list */}
          {platformId === 'kgs' ? (
            <div className="lessons-list">
              {items.map(item => (
                <div key={item.id} className="lesson-item">
                  {item.thumbnail ? (
                    <ImageWithFallback src={item.thumbnail} alt={item.name} className="lesson-thumb" />
                  ) : (
                    <div className="lesson-thumb-placeholder">🎬</div>
                  )}
                  <div className="lesson-info">
                    <h3>{item.name}</h3>
                    {item.date && <p>📅 {new Date(item.date).toLocaleDateString()}</p>}
                    {item.duration && <p>⏱️ {item.duration}</p>}
                  </div>
                  <div className="lesson-actions">
                    {item.videoUrl && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        ▶️ Play
                      </a>
                    )}
                    {item.pdfUrl && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handlePdfDownload(item.pdfUrl, item.pdfTitle)}
                      >
                        📄 PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="content-grid">
              {items.map(item => {
                const link = getItemLink(item)
                const icon = getItemIcon(item.type)

                const cardContent = (
                  <div className="card">
                    {item.image ? (
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="card-image"
                        style={{ height: 120 }}
                      />
                    ) : (
                      <div className="card-image-placeholder" style={{ height: 80 }}>
                        {icon}
                      </div>
                    )}
                    <div className="card-body">
                      <div className="card-title">{item.name}</div>
                      <div className="card-meta">
                        {item.type === 'FOLDER' && item.videos > 0 && (
                          <span className="meta-badge videos">▶️ {item.videos}</span>
                        )}
                        {item.type === 'FOLDER' && item.notes > 0 && (
                          <span className="meta-badge notes">📝 {item.notes}</span>
                        )}
                        {item.type === 'FOLDER' && item.tests > 0 && (
                          <span className="meta-badge">📊 {item.tests}</span>
                        )}
                        {item.type === 'VIDEO' && <span className="meta-badge videos">▶️ Video</span>}
                        {item.type === 'PDF' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => { e.preventDefault(); handlePdfDownload(item.pdfLink, item.name) }}
                          >
                            📥 Download
                          </button>
                        )}
                        {item.duration && <span className="meta-badge">⏱️ {item.duration}</span>}
                        {item.eventDate && (
                          <span className="meta-badge">📅 {new Date(item.eventDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )

                if (link) {
                  return (
                    <Link key={item.id} to={link} style={{ textDecoration: 'none' }}>
                      {cardContent}
                    </Link>
                  )
                }

                return <div key={item.id}>{cardContent}</div>
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
