import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api, PLATFORMS } from '../services/api'
import Breadcrumb from '../components/Breadcrumb'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import ImageWithFallback from '../components/ImageWithFallback'

export default function Batch() {
  const { platformId, batchId } = useParams()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('content')

  const platform = PLATFORMS.find(p => p.id === platformId)

  useEffect(() => {
    loadSubjects()
  }, [platformId, batchId])

  async function loadSubjects() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBatchContent(platformId, batchId)
      setSubjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchBatchContent(pid, bid) {
    // KGS: course-details returns subjects
    if (pid === 'kgs') {
      const data = await api.kgs.courseDetails(bid)
      const subs = data.sub || data.subjects || data.data || []
      return subs.map(s => ({
        id: s.id,
        name: s.name,
        type: 'subject',
        videos: s.videos || 0,
        notes: s.notes || 0,
        dpp: s.dpp || 0,
        image: s.image || s.thumbnail || '',
      }))
    }

    // Padhle, ScienceAndFun, Vibrant: content root folder
    if (['padhle', 'scienceandfun', 'vibrant'].includes(pid)) {
      const apiObj = api[pid]
      const data = await apiObj.content(bid)
      const items = data.data || []
      return items.map(item => ({
        id: item.id,
        name: item.Title || item.name || item.title,
        type: item.material_type || 'FOLDER',
        videos: parseInt(item.videos_count) || 0,
        notes: parseInt(item.files_count) || 0,
        tests: parseInt(item.tests_count) || 0,
        image: item.image || item.thumbnail || '',
      }))
    }

    // RWA: subjects
    if (pid === 'rwa') {
      const data = await api.rwa.subjects(bid)
      const subs = data.data || []
      return subs.map(s => ({
        id: s.subjectid || s.id,
        name: s.subject_name || s.name,
        type: 'subject',
        image: s.subject_logo || s.image || '',
      }))
    }

    // PW: batch details returns subjects
    if (pid === 'pw') {
      const data = await api.pw.batchDetails(bid)
      if (data.data && typeof data.data === 'string' && data.data.includes(':')) {
        return [{ id: 'encrypted', name: 'Content is encrypted', type: 'info' }]
      }
      const subs = data.data?.subjects || data.subjects || data.data || []
      if (!Array.isArray(subs)) return []
      return subs.map(s => ({
        id: s.subjectId || s._id || s.id,
        name: s.subject || s.name || s.subjectName,
        type: 'subject',
        slug: s.slug || '',
        image: s.image || s.icon || '',
      }))
    }

    // MissionJeet, NextToppers: show batches info
    if (['missionjeet', 'nexttoppers'].includes(pid)) {
      return [{ id: 'info', name: 'This platform uses authenticated course content. Batches and live classes are available.', type: 'info' }]
    }

    return []
  }

  if (!platform) return <ErrorState message="Platform not found" />

  return (
    <>
      <Breadcrumb items={[
        { label: platform.name, to: `/platform/${platformId}` },
        { label: `Batch ${batchId}` },
      ]} />

      <div className="page-header">
        <h1>Batch Content</h1>
        <p>{platform.name} - Batch #{batchId}</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📚 Content
        </button>
        {platform.hasLive && (
          <button
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => navigate(`/platform/${platformId}/batch/${batchId}/live`)}
          >
            🔴 Live Classes
          </button>
        )}
      </div>

      {loading ? (
        <Loading message="Loading content..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadSubjects} />
      ) : (
        <>
          {subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No content available for this batch</p>
            </div>
          ) : (
            <div className="subjects-grid">
              {subjects.map(subject => {
                if (subject.type === 'info') {
                  return (
                    <div key={subject.id} className="card" style={{ cursor: 'default' }}>
                      <div className="card-body">
                        <div className="card-title">{subject.name}</div>
                      </div>
                    </div>
                  )
                }

                const isFolder = subject.type === 'FOLDER' || subject.type === 'folder'
                const isSubject = subject.type === 'subject'
                const isVideo = subject.type === 'VIDEO' || subject.type === 'video'
                const isPdf = subject.type === 'PDF' || subject.type === 'pdf'

                let link = '#'
                if (isFolder || isSubject) {
                  if (platformId === 'kgs') {
                    link = `/platform/${platformId}/batch/${batchId}/content/${subject.id}`
                  } else if (['padhle', 'scienceandfun', 'vibrant'].includes(platformId)) {
                    link = `/platform/${platformId}/batch/${batchId}/content/${subject.id}`
                  } else if (platformId === 'pw') {
                    link = `/platform/${platformId}/batch/${batchId}/content/${subject.id}${subject.slug ? `?slug=${subject.slug}` : ''}`
                  } else {
                    link = `/platform/${platformId}/batch/${batchId}/content/${subject.id}`
                  }
                } else if (isVideo) {
                  link = `/platform/${platformId}/batch/${batchId}/video/${subject.id}`
                }

                return (
                  <Link key={subject.id} to={link} style={{ textDecoration: 'none' }}>
                    <div className="card">
                      {subject.image ? (
                        <ImageWithFallback
                          src={subject.image}
                          alt={subject.name}
                          className="card-image"
                          style={{ height: 140 }}
                        />
                      ) : (
                        <div className="card-image-placeholder" style={{ height: 100 }}>
                          {isFolder ? '📁' : isVideo ? '🎬' : isPdf ? '📄' : '📚'}
                        </div>
                      )}
                      <div className="card-body">
                        <div className="card-title">{subject.name}</div>
                        <div className="card-meta">
                          {subject.videos > 0 && (
                            <span className="meta-badge videos">▶️ {subject.videos} videos</span>
                          )}
                          {subject.notes > 0 && (
                            <span className="meta-badge notes">📝 {subject.notes} notes</span>
                          )}
                          {subject.dpp > 0 && (
                            <span className="meta-badge">📋 {subject.dpp} DPP</span>
                          )}
                          {subject.tests > 0 && (
                            <span className="meta-badge">📊 {subject.tests} tests</span>
                          )}
                          {isFolder && <span className="meta-badge">📁 Folder</span>}
                          {isVideo && <span className="meta-badge videos">▶️ Video</span>}
                          {isPdf && <span className="meta-badge notes">📄 PDF</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
