const formatNotificationTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function NotificationPanel({
  title = 'Notifications',
  subtitle = 'Latest updates from the system.',
  items = [],
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="view-section notification-panel">
      <div className="notification-panel-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="notification-count">{items.length}</span>
      </div>

      <div className="notification-list">
        {items.map((item, index) => (
          <article
            key={item.id || `${item.title || 'notification'}-${index}`}
            className={`notification-card ${item.level || 'info'}`}
          >
            <div className="notification-meta">
              <span className={`notification-badge ${item.status || item.level || 'info'}`}>
                {item.status_label || 'Update'}
              </span>
              {item.timestamp && (
                <time className="notification-time">
                  {formatNotificationTime(item.timestamp)}
                </time>
              )}
            </div>
            <h4>{item.title}</h4>
            <p>{item.message}</p>
            {item.detail && <p className="notification-detail">{item.detail}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
