import { Link } from 'react-router-dom'
import { PLATFORMS } from '../services/api'
import { useState } from 'react'

export default function Home() {
  const [search, setSearch] = useState('')

  const filtered = PLATFORMS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <h1>Study Platforms</h1>
        <p>Access courses, live classes, notes and more from {PLATFORMS.length} top education platforms</p>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search platforms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="platforms-grid">
        {filtered.map(platform => (
          <Link key={platform.id} to={`/platform/${platform.id}`} style={{ textDecoration: 'none' }}>
            <div className="card platform-card">
              <div className="platform-color-bar" style={{ background: platform.color }} />
              <div className="card-body">
                <div className="platform-icon">{platform.icon}</div>
                <div className="card-title" style={{ fontSize: '1.2rem' }}>{platform.name}</div>
                <div className="card-subtitle">{platform.description}</div>
                <div className="card-meta">
                  {platform.hasContent && <span className="meta-badge">📚 Courses</span>}
                  {platform.hasLive && <span className="meta-badge live">🔴 Live Classes</span>}
                  <span className="meta-badge videos">▶️ Videos</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No platforms found matching "{search}"</p>
        </div>
      )}
    </>
  )
}
