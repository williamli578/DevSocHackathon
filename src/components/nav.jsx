// Sidebar nav + composer for Fishstagram

function Sidebar({ route, setRoute, onLog, unread, viewer }) {
  const items = [
    { id: "feed", label: "Feed", icon: Ico.Feed },
    { id: "map", label: "Map", icon: Ico.Map },
    { id: "communities", label: "Communities", icon: Ico.Community },
    { id: "messages", label: "Messages", icon: Ico.Message },
    { id: "search", label: "Search", icon: Ico.Search },
    { id: "notifications", label: "Notifications", icon: Ico.Bell, badge: unread > 0 ? unread : null },
    { id: "leaderboard", label: "Leaderboard", icon: Ico.Trophy },
    { id: "badges", label: "Badges", icon: Ico.Badge },
    { id: "profile", label: "Profile", icon: Ico.User },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20 C4 20 8 14 14 12 C18 10.5 20 7 18 4 C16.5 2 13.5 2 12 4" />
            <path d="M12 4 C13 5.5 13 7 11 8" />
            <circle cx="19.5" cy="19.5" r="2" />
            <line x1="19.5" y1="17.5" x2="19.5" y2="12" />
          </svg>
        </div>
        <div className="brand-name">hookd</div>
      </div>
      <div className="nav-list">
        {items.map((it) => (
          <button
            key={it.id}
            className={"nav-btn " + (route === it.id ? "active" : "")}
            onClick={() => setRoute(it.id)}
          >
            <it.icon className="ico" />
            <span>{it.label}</span>
            {it.badge ? <span className="badge">{it.badge}</span> : null}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button className="log-cta" onClick={onLog}>
          <Ico.Plus2 width="16" height="16" />
          <span>Log a catch</span>
        </button>
        <button className="profile-card" onClick={() => setRoute("profile")}>
          <Avatar user={viewer} />
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{viewer.name}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>@{viewer.handle}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
