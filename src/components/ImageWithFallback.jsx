import { useState } from 'react'

export default function ImageWithFallback({ src, alt, fallback, className, style }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || error) {
    if (fallback) {
      return <div className={className} style={style}>{fallback}</div>
    }
    return (
      <div className={`${className || ''} card-image-placeholder`} style={style}>
        📄
      </div>
    )
  }

  return (
    <>
      {!loaded && (
        <div className={`${className || ''} card-image-placeholder`} style={style}>
          <div className="spinner" style={{ width: 24, height: 24 }} />
        </div>
      )}
      <img
        src={src}
        alt={alt || ''}
        className={className}
        style={{ ...style, display: loaded ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  )
}
