function StatusBanner({ status }) {
  return <div className={`status-banner ${status.type}`}>{status.message}</div>;
}

export default StatusBanner;
