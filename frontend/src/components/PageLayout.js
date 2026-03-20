import RouteNav from './RouteNav';
import SessionPanel from './SessionPanel';
import StatusBanner from './StatusBanner';

function PageLayout({ children, currentUser, isLoadingUser, route, status }) {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-stack">
          <p className="eyebrow">Industrial Attachment Management System</p>
          <h1>Accounts</h1>
        </div>

        <RouteNav route={route} />
      </section>

      <section className="auth-panel">
        <StatusBanner status={status} />
        {children}
        <SessionPanel currentUser={currentUser} isLoadingUser={isLoadingUser} />
      </section>
    </main>
  );
}

export default PageLayout;
