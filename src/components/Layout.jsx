import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span>TopperHub</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Platforms
          </Link>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
