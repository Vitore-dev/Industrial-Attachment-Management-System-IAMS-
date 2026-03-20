function StatusBanner({ status }) {
  if (!status?.message) {
    return null;
  }

  return (
    <div role="status" className={`status-banner ${status.type || 'info'}`}>
      {status.message}
    </div>
  );
}

export default StatusBanner;
