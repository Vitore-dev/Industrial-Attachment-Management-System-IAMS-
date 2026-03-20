function ProtectedRoute({ currentUser, isLoadingUser, children }) {
  if (isLoadingUser) {
    return <p className="session-copy">Checking your session...</p>;
  }

  if (!currentUser) {
    return (
      <div className="protected-empty">
        <h2>Login required</h2>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
