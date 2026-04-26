import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api, PLATFORMS } from '../services/api'
import Breadcrumb from '../components/Breadcrumb'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import ImageWithFallback from '../components/ImageWithFallback'

export default function LiveClasses() {
  const { platformId, batchId } = useParams()
  const [activeTab, setActiveTab] = useState('live')
  const [liveClasses, setLiveClasses] = useState([])
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [previousClasses, setPreviousClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const platform = PLATFORMS.find(p => p.id === platformId)

  useEffect(() => {
    loadLiveClasses()
  }, [platformId, batchId])

  async function loadLiveClasses() {
    setLoading(true)
    setError(null)
    try {
      await fetchLiveData(platformId, batchId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLiveData(pid, bid) {
    // Padhle
    if (pid === 'padhle' && bid) {
      const [liveData, prevData] = await Promise.all([
        api.padhle.live(bid).catch(() => ({ data: { upcoming: [], live: [] } })),
        api.padhle.previousLive(bid).catch(() => ({ data: [] })),
      ])

      const live = liveData.data?.live || []
      const upcoming = liveData.data?.upcoming || []
      const previous = prevData.data || []

      setLiveClasses(live.map(parseLiveItem))
      setUpcomingClasses(upcoming.map(parseLiveItem))
      setPreviousClasses(previous.map(parseLiveItem))
      return
    }

    // ScienceAndFun
    if (pid === 'scienceandfun' && bid) {
      const [liveData, prevData] = await Promise.all([
        api.scienceandfun.live(bid).catch(() => ({ data: { upcoming: [], live: [] } })),
        api.scienceandfun.previousLive(bid).catch(() => ({ data: [] })),
      ])

      const live = liveData.data?.live || []
      const upcoming = liveData.data?.upcoming || []
      const previous = prevData.data || []

      setLiveClasses(live.map(parseLiveItem))
      setUpcomingClasses(upcoming.map(parseLiveItem))
      setPreviousClasses(previous.map(parseLiveItem))
      return
    }

    // Vibrant
    if (pid === 'vibrant' && bid) {
      const [liveData, prevData] = await Promise.all([
        api.vibrant.live(bid).catch(() => ({ data: { upcoming: [], live: [] } })),
        api.vibrant.previousLive(bid).catch(() => ({ data: [] })),
      ])

      const live = liveData.data?.live || []
      const upcoming = liveData.data?.upcoming || []
      const previous = prevData.data || []

      setLiveClasses(live.map(parseLiveItem))
      setUpcomingClasses(upcoming.map(parseLiveItem))
      setPreviousClasses(previous.map(parseLiveItem))
      return
    }

    // MissionJeet
    if (pid === 'missionjeet') {
      const data = await api.missionjeet.live()
      const items = data.data || []
      setLiveClasses(items.filter(i => i.is_live).map(parseLiveItem))
      setUpcomingClasses(items.filter(i => !i.is_live).map(parseLiveItem))
      return
    }

    // NextToppers
    if (pid === 'nexttoppers') {
      const data = await api.nexttoppers.live()
      const items = data.data || []
      setLiveClasses(items.filter(i => i.is_live).map(parseLiveItem))
      setUpcomingClasses(items.filter(i => !i.is_live).map(parseLiveItem))
      return
    }

    // PW
    if (pid === 'pw' && bid) {
      const data = await api.pw.live(bid)
      if (data.data && typeof data.data === 'string') {
        setLiveClasses([])
        setUpcomingClasses([{ id: 'encrypted', title: 'Live class data is encrypted', isLive: false }])
        return
      }
      const items = data.data || []
      if (Array.isArray(items)) {
        setLiveClasses(items.filter(i => i.isLive || i.is_live).map(parseLiveItem))
        setUpcomingClasses(items.filter(i => !i.isLive && !i.is_live).map(parseLiveItem))
      }
      return
    }

    setLiveClasses([])
    setUpcomingClasses([])
    setPreviousClasses([])
  }

  function parseLiveItem(item) {
    return {
      id: item.id || item._id || Math.random().toString(36).substr(2),
      title: item.Title || item.title || item.name || 'Untitled',
      isLive: item.is_live || item.isLive || item.live_status === 1,
      thumbnail: item.thumbnail || item.image || '',
      videoUrl: item.file_url || item.video_player_url || item.url || '',
      date: item.event_date || item.date || item.startTime || '',
      duration: item.duration || '',
      type: item.material_type || item.content_type || 'VIDEO',
      pdfLink: item.pdf_link || '',
    }
  }

  function handlePlay(cls) {
    if (cls.videoUrl) {
      window.open(cls.videoUrl, '_blank')
    }
  }

  function renderClassList(classes, emptyMsg) {
    if (classes.length === 0) {
      return (
        <div className="empty-state" style={{ padding: '30px 20px' }}>
          <div className="empty-icon">📭</div>
          <p>{emptyMsg}</p>
        </div>
      )
    }

    return classes.map(cls => (
      <div
        key={cls.id}
        className={`live-card ${cls.isLive ? 'is-live' : ''}`}
        onClick={() => handlePlay(cls)}
      >
        {cls.thumbnail ? (
          <ImageWithFallback
            src={cls.thumbnail}
            alt={cls.title}
            className="lesson-thumb"
          />
        ) : (
          <div className="lesson-thumb-placeholder">
            {cls.isLive ? '🔴' : '📹'}
          </div>
        )}
        <div className="lesson-info">
          <h3>
            {cls.isLive && <span className="live-badge" style={{ marginRight: 8 }}>LIVE</span>}
            {cls.title}
          </h3>
          {cls.date && <p>📅 {new Date(cls.date).toLocaleString()}</p>}
          {cls.duration && <p>⏱️ {cls.duration}</p>}
        </div>
        <div className="lesson-actions">
          {cls.videoUrl && (
            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handlePlay(cls) }}>
              {cls.isLive ? '🔴 Watch' : '▶️ Play'}
            </button>
          )}
          {cls.pdfLink && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); window.open(cls.pdfLink, '_blank') }}
            >
              📄 PDF
            </button>
          )}
        </div>
      </div>
    ))
  }

  if (!platform) return <ErrorState message="Platform not found" />

  const totalLive = liveClasses.length
  const totalUpcoming = upcomingClasses.length
  const totalPrevious = previousClasses.length

  return (
    <>
      <Breadcrumb items={[
        { label: platform.name, to: `/platform/${platformId}` },
        ...(batchId ? [{ label: `Batch ${batchId}`, to: `/platform/${platformId}/batch/${batchId}` }] : []),
        { label: 'Live Classes' },
      ]} />

      <div className="page-header">
        <h1>🔴 Live Classes</h1>
        <p>{platform.name} {batchId ? `- Batch #${batchId}` : ''}</p>
      </div>

      {loading ? (
        <Loading message="Loading live classes..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadLiveClasses} />
      ) : (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              🔴 Live Now ({totalLive})
            </button>
            <button
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              📅 Upcoming ({totalUpcoming})
            </button>
            <button
              className={`tab ${activeTab === 'previous' ? 'active' : ''}`}
              onClick={() => setActiveTab('previous')}
            >
              📹 Completed ({totalPrevious})
            </button>
          </div>

          {activeTab === 'live' && (
            <div className="live-section">
              <h2>🔴 Currently Live</h2>
              {renderClassList(liveClasses, 'No live classes right now')}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="live-section">
              <h2>📅 Upcoming Classes</h2>
              {renderClassList(upcomingClasses, 'No upcoming classes scheduled')}
            </div>
          )}

          {activeTab === 'previous' && (
            <div className="live-section">
              <h2>📹 Completed / Recorded Classes</h2>
              {renderClassList(previousClasses, 'No recorded classes available')}
            </div>
          )}
        </>
      )}
    </>
  )
}
