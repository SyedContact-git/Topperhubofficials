import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api, PLATFORMS } from '../services/api'
import Breadcrumb from '../components/Breadcrumb'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import ImageWithFallback from '../components/ImageWithFallback'

export default function Platform() {
  const { platformId } = useParams()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const platform = PLATFORMS.find(p => p.id === platformId)

  useEffect(() => {
    loadBatches()
  }, [platformId])

  async function loadBatches() {
    setLoading(true)
    setError(null)
    try {
      const platformApi = api[platformId]
      if (!platformApi || !platformApi.batches) {
        throw new Error('Platform not supported')
      }
      const data = await platformApi.batches()
      const parsed = parseBatches(platformId, data)
      setBatches(parsed)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function parseBatches(pid, data) {
    if (!data) return []

    // KGS
    if (pid === 'kgs') {
      const arr = data.batches || data.data || data
      if (!Array.isArray(arr)) return []
      return arr.map(b => ({
        id: b.id || b.batch_id,
        name: b.name || b.batch_name || b.title,
        image: b.image || b.thumbnail || b.course_thumbnail || b.byName || '',
        subtitle: b.subtitle || b.description || '',
      }))
    }

    // Padhle, ScienceAndFun, Vibrant
    if (['padhle', 'scienceandfun', 'vibrant'].includes(pid)) {
      const arr = data.data || data.batches || data
      if (!Array.isArray(arr)) return []
      return arr.map(b => ({
        id: b.id || b.course_id,
        name: b.name || b.Title || b.course_name || b.title,
        image: b.image || b.thumbnail || b.course_thumbnail || b.previewImage || '',
        subtitle: b.subtitle || b.description || '',
      }))
    }

    // MissionJeet, NextToppers
    if (['missionjeet', 'nexttoppers'].includes(pid)) {
      const arr = data.data || data.batches || data
      if (!Array.isArray(arr)) return []
      return arr.map(b => ({
        id: b.id || b.course_id,
        name: b.name || b.title || b.course_name,
        image: b.image || b.thumbnail || b.course_thumbnail || '',
        subtitle: b.subtitle || b.description || '',
      }))
    }

    // RWA
    if (pid === 'rwa') {
      const arr = data.data || data
      if (!Array.isArray(arr)) return []
      return arr.map(b => ({
        id: b.id,
        name: b.name || b.title,
        image: b.course_thumbnail || b.image || '',
        subtitle: b.subtitle || '',
      }))
    }

    // PW
    if (pid === 'pw') {
      // PW returns encrypted data sometimes
      if (data.data && typeof data.data === 'string' && data.data.includes(':')) {
        // encrypted - show as is
        return [{ id: 'encrypted', name: 'PW Batches (Encrypted - Loading...)', image: '', subtitle: 'Data is encrypted' }]
      }
      const arr = data.data || data.batches || data
      if (!Array.isArray(arr)) return []
      return arr.map(b => ({
        id: b.batchId || b.id || b.slug,
        name: b.name || b.batchName || b.title,
        image: b.previewImage || b.image || b.thumbnail || '',
        subtitle: b.byName || b.subtitle || '',
      }))
    }

    // fallback
    const arr = data.data || data.batches || data
    if (!Array.isArray(arr)) return []
    return arr.map(b => ({
      id: b.id || b.course_id,
      name: b.name || b.title,
      image: b.image || b.thumbnail || '',
      subtitle: '',
    }))
  }

  const filtered = batches.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!platform) {
    return <ErrorState message="Platform not found" />
  }

  return (
    <>
      <Breadcrumb items={[{ label: platform.name }]} />

      <div className="page-header">
        <h1>{platform.icon} {platform.name}</h1>
        <p>{platform.description}</p>
      </div>

      {platform.hasLive && (
        <div style={{ marginBottom: 24 }}>
          <Link
            to={`/platform/${platformId}/live`}
            className="btn btn-danger"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'white' }}
          >
            🔴 View Live Classes
          </Link>
        </div>
      )}

      {loading ? (
        <Loading message="Loading batches..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatches} />
      ) : (
        <>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={`Search ${platform.name} batches...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="batches-grid">
            {filtered.map(batch => (
              <Link
                key={batch.id}
                to={`/platform/${platformId}/batch/${batch.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card">
                  <ImageWithFallback
                    src={batch.image}
                    alt={batch.name}
                    className="card-image"
                    fallback={
                      <div className="card-image-placeholder" style={{ background: platform.color + '33' }}>
                        {platform.icon}
                      </div>
                    }
                  />
                  <div className="card-body">
                    <div className="card-title">{batch.name}</div>
                    {batch.subtitle && <div className="card-subtitle">{batch.subtitle}</div>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>{search ? `No batches matching "${search}"` : 'No batches available'}</p>
            </div>
          )}
        </>
      )}
    </>
  )
}
