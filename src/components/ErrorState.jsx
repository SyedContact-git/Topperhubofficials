export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <h2>Something went wrong</h2>
      <p>{message || 'Failed to load data. Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}
