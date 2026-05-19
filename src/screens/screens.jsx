// Leaderboard, Badges, Notifications, Search, Auth

function Leaderboard() {
  const D = window.DATA;
  const [type, setType] = React.useState("points");
  const [period, setPeriod] = React.useState("weekly");
  const types = [
    { id: "points", label: "Points" },
    { id: "catches", label: "Catches" },
    { id: "species", label: "Species" },
    { id: "badges", label: "Badges" },
  ];
  const periods = [
    { id: "weekly", label: "This week" },
    { id: "monthly", label: "This month" },
    { id: "yearly", label: "This year" },
    { id: "all_time", label: "All time" },
  ];
  const metricFor = (u) =>
    type === "points" ? u.points :
    type === "catches" ? u.catches :
    type === "species" ? u.species :
    u.badges;
  const sorted = [...D.USERS].sort((a, b) => metricFor(b) - metricFor(a));
  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">The <em>leaderboard</em></h1>
          <div className="page-sub">{periods.find(p => p.id === period).label} · {types.find(t => t.id === type).label.toLowerCase()}</div>
        </div>
        <div className="tab-row">
          {periods.map((p) => (
            <button key={p.id} className={"tab " + (period === p.id ? "active" : "")} onClick={() => setPeriod(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="page-body">
        <div>
          <div className="tab-row" style={{ marginBottom: "var(--gap-4)" }}>
            {types.map((t) => (
              <button key={t.id} className={"tab " + (type === t.id ? "active" : "")} onClick={() => setType(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="leaderboard-table">
            {sorted.map((u, i) => (
              <div key={u.id} className={"leaderboard-row " + (i < 3 ? "top " : "") + (u.id === "u_you" ? "you" : "")}>
                <div className="rank">{String(i + 1).padStart(2, "0")}</div>
                <div className="who">
                  <Avatar user={u} />
                  <div>
                    <div className="name">{u.name}{u.id === "u_you" ? " (you)" : ""}</div>
                    <div className="meta">@{u.handle} · {u.region}</div>
                  </div>
                </div>
                <div className="metric">{types.find(t => t.id === type).label}</div>
                <div className="score">{formatNum(metricFor(u))}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="right-rail">
          <div className="rail-card dark">
            <h4>Your standing</h4>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 64, lineHeight: 0.95 }}>
              #{sorted.findIndex(u => u.id === "u_you") + 1}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
              of {sorted.length} anglers
            </div>
            <div className="divider" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>This week</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22 }}>+12</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Streak</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22 }}>3 days</div>
              </div>
            </div>
          </div>
          <div className="rail-card">
            <h4>Scoring</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["New catch", "+10"],
                ["New species", "+50"],
                ["Badge unlock", "+100"],
                ["Trophy (>1m)", "+250"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px dashed var(--c-line)" }}>
                  <span>{k}</span>
                  <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-brand)", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function Badges() {
  const D = window.DATA;
  const [tab, setTab] = React.useState("all");
  const list = tab === "earned" ? D.BADGES.filter(b => b.earned) : tab === "locked" ? D.BADGES.filter(b => !b.earned) : D.BADGES;
  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your <em>badges</em></h1>
          <div className="page-sub">{D.BADGES.filter(b => b.earned).length} of {D.BADGES.length} earned · Auto-unlocks after each catch</div>
        </div>
        <div className="tab-row">
          {["all", "earned", "locked"].map((t) => (
            <button key={t} className={"tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="page-body single">
        <div className="badge-grid">
          {list.map((b) => <BadgeCard key={b.id} badge={b} />)}
        </div>
      </div>
    </React.Fragment>
  );
}

function Notifications({ onOpen, onSetRoute }) {
  const D = window.DATA;
  const [items, setItems] = React.useState(D.NOTIFICATIONS);
  const markAll = () => setItems(items.map(n => ({ ...n, unread: false })));
  const onClick = (n) => {
    setItems(items.map(x => x.id === n.id ? { ...x, unread: false } : x));
    if (n.catchId) onOpen(n.catchId);
    else if (n.type === "follow") onSetRoute("profile");
    else if (n.type === "badge") onSetRoute("badges");
    else if (n.type === "leaderboard") onSetRoute("leaderboard");
  };
  const groups = {
    today: items.filter(n => n.time.endsWith("m") || n.time.endsWith("h")),
    earlier: items.filter(n => n.time.endsWith("d")),
  };
  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title"><em>Notifications</em></h1>
          <div className="page-sub">{items.filter(n => n.unread).length} unread</div>
        </div>
        <button className="btn btn-ghost" onClick={markAll}>Mark all read</button>
      </div>
      <div className="page-body single">
        <div style={{ maxWidth: 720 }}>
          {Object.entries(groups).map(([k, list]) => list.length === 0 ? null : (
            <div key={k} style={{ marginBottom: "var(--gap-5)" }}>
              <h4 style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--c-muted)", margin: "0 0 var(--gap-3)" }}>
                {k === "today" ? "Today" : "Earlier"}
              </h4>
              <div className="notif-list">
                {list.map((n) => {
                  const u = n.userId ? D.userById(n.userId) : null;
                  return (
                    <div key={n.id} className={"notif-row " + (n.unread ? "unread" : "")} onClick={() => onClick(n)}>
                      {n.unread ? <span className="dot" /> : <span style={{ width: 8 }} />}
                      {u ? <Avatar user={u} /> :
                        <div className="avatar" style={{ background: n.type === "badge" ? "var(--c-accent)" : "var(--c-brand-2)" }}>
                          {n.type === "badge" ? "★" : n.type === "leaderboard" ? "#" : "F"}
                        </div>
                      }
                      <div className="body">
                        {u ? <React.Fragment><b>{u.name}</b> {n.text}</React.Fragment> : n.text}
                        <div className="meta" style={{ marginTop: 4 }}>{n.time} ago</div>
                      </div>
                      {n.catchId ? <div className="thumb" /> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function Search({ onOpen, onSetRoute }) {
  const D = window.DATA;
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("all");
  const types = ["all", "users", "species", "catches"];
  const ql = q.toLowerCase().trim();
  const users = ql ? D.USERS.filter(u => u.name.toLowerCase().includes(ql) || u.handle.toLowerCase().includes(ql)) : D.USERS.slice(0, 5);
  const species = ql ? D.SPECIES.filter(s => s.name.toLowerCase().includes(ql)) : D.SPECIES.slice(0, 6);
  const catches = ql ? D.CATCHES.filter(c => (D.speciesById(c.speciesId).name + " " + c.location.name).toLowerCase().includes(ql)) : D.CATCHES.slice(0, 4);
  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title"><em>Search</em></h1>
          <div className="page-sub">Users, species, places, catches</div>
        </div>
        <div className="tab-row">
          {types.map((t) => (
            <button key={t} className={"tab " + (type === t ? "active" : "")} onClick={() => setType(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="page-body single">
        <div style={{ maxWidth: 720 }}>
          <div className="search-box">
            <Ico.Search width="18" height="18" style={{ color: "var(--c-muted)" }} />
            <input placeholder="Try 'flathead', 'cronulla', or '@diego'" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          </div>
          <div className="search-results">
            {(type === "all" || type === "users") && users.length > 0 && (
              <div className="search-section">
                <div className="rail-card" style={{ padding: 0, overflow: "hidden" }}>
                  <h4 style={{ padding: "12px 16px 0", margin: 0 }}>Anglers</h4>
                  <div style={{ padding: "8px 16px 12px" }}>
                    {users.slice(0, 5).map((u) => (
                      <div className="follow-row" key={u.id} onClick={() => onSetRoute("profile")} style={{ cursor: "pointer" }}>
                        <Avatar user={u} />
                        <div className="who">
                          <div className="name">{u.name}</div>
                          <div className="meta">@{u.handle} · {formatNum(u.followers)} followers · {u.catches} catches</div>
                        </div>
                        <button className="btn-pill">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {(type === "all" || type === "species") && species.length > 0 && (
              <div className="search-section">
                <div className="rail-card">
                  <h4>Species</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {species.slice(0, 6).map((s) => (
                      <div key={s.id} style={{ padding: 10, border: "1px solid var(--c-line)", borderRadius: "var(--r-md)", cursor: "pointer" }}>
                        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, lineHeight: 1 }}>{s.name}</div>
                        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 11, color: "var(--c-muted)", marginTop: 2 }}>{s.latin}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 6 }}>
                          {s.region} · {s.typical}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {(type === "all" || type === "catches") && catches.length > 0 && (
              <div className="search-section">
                <div className="rail-card">
                  <h4>Catches</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {catches.slice(0, 5).map((c) => {
                      const u = D.userById(c.userId);
                      const s = D.speciesById(c.speciesId);
                      return (
                        <div key={c.id} className="map-list-item" onClick={() => onOpen(c.id)}>
                          <div className="thumb" />
                          <div className="info">
                            <div className="ttl">{s.name} · {c.lengthCm}cm</div>
                            <div className="meta">@{u.handle} · {c.location.name}</div>
                          </div>
                          {c.trophy ? <span className="pill accent" style={{ fontSize: 9 }}>★</span> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function Auth({ onComplete }) {
  const [mode, setMode] = React.useState("login");
  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="brand">
          <div className="brand-mark" style={{ background: "var(--c-bg)", color: "var(--c-brand)" }}>F</div>
          <div className="brand-name" style={{ color: "var(--c-bg)" }}>Fishstagram</div>
        </div>
        <div>
          <div className="word">Catch.<br/>Map.<br/>Share.</div>
          <div className="quote" style={{ marginTop: 28, opacity: 0.85 }}>
            "A bad day fishing is still better than a good day at the desk."
          </div>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          12,480 anglers · 84,219 catches logged
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <h2>{mode === "login" ? "Welcome back." : "Get hooked."}</h2>
          <p className="lead">
            {mode === "login" ? "Log in to keep tracking your catches." : "Create an account in 30 seconds."}
          </p>

          {mode === "register" && (
            <div className="field">
              <label>Username</label>
              <input className="input" defaultValue="fishmaster" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" defaultValue="hello@fishstagram.app" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" defaultValue="•••••••••" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={onComplete}>
            {mode === "login" ? "Log in" : "Create account"}
          </button>
          <div className="divider" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--c-muted)" }}>
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: "var(--c-brand)" }}>
              {mode === "login" ? "Create an account" : "I already have one"}
            </button>
            <a href="#" style={{ color: "var(--c-muted)" }}>Forgot password</a>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Leaderboard, Badges, Notifications, Search, Auth });
