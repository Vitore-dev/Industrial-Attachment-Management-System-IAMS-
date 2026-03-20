import { formatRole } from '../data/mockData';
import RouteNav from './RouteNav';
import SessionPanel from './SessionPanel';
import StatusBanner from './StatusBanner';

function PageLayout({ children, currentRoute, currentUser, route, availableRoutes, status }) {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="brand-badge">IAMS</div>

        <div className="hero-stack">
          <p className="eyebrow">Industrial Attachment Management System</p>
          <h1>Sprint 1 Frontend Mechanics</h1>
          <p className="hero-copy">
            Registration, role-based access, preference capture, profile management, and the
            coordinator dashboard are all live in the frontend with local demo persistence.
          </p>
        </div>

        <div className="hero-badges">
          <span className="hero-badge">Frontend-only demo</span>
          <span className="hero-badge muted">
            {currentUser ? formatRole(currentUser.role) : 'Guest session'}
          </span>
          <span className="hero-badge muted">{currentRoute.label}</span>
        </div>

        <RouteNav route={route} routes={availableRoutes} />
      </section>

      <section className="auth-panel">
        <StatusBanner status={status} />
        {children}
        <SessionPanel currentUser={currentUser} />
      </section>
    </main>
  );
}

export default PageLayout;
