function RouteNav({ route, routes }) {
  return (
    <nav className="route-nav" aria-label="Application sections">
      {routes.map((item) => (
        <button
          key={item.id}
          type="button"
          className={route === item.id ? 'route-chip active' : 'route-chip'}
          onClick={() => {
            window.location.hash = `#${item.id}`;
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default RouteNav;
