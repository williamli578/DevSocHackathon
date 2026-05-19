// Feed screen + CatchCard

// Resolves a user object from mock data, falling back to a synthetic object for API users
function resolveUser(userId) {
  const D = window.DATA;
  const mock = D.userById(userId);
  if (mock) return mock;
  const cached = window._userCache && window._userCache[userId];
  if (cached) return {
    id: cached.id,
    name: cached.username,
    handle: cached.username,
    initial: (cached.username || '?')[0].toUpperCase(),
    region: '',
    bio: cached.bio || '',
  };
  return { id: userId, name: 'Angler', handle: userId, initial: userId[0]?.toUpperCase() || 'A', region: '' };
}

// Resolves a species object from mock data, falling back to speciesName for API catches
function resolveSpecies(c) {
  const D = window.DATA;
  const mock = D.speciesById(c.speciesId);
  if (mock) return mock;
  return { id: c.speciesId || 'unknown', name: c.speciesName || 'Unknown', latin: '', region: '', typical: '' };
}

function CatchCard({ c, density, showStats, onOpen, liked, onLike }) {
  const user = resolveUser(c.userId);
  const species = resolveSpecies(c);
  const compact = density === "compact";

  if (!c.location) return null;

  const photoLabel = `${species.name.toUpperCase()} · ${c.location.name}`;

  return (
    <article className={"catch-card " + (compact ? "compact" : "")} onClick={() => onOpen(c.id)}>
      <header className="cc-head">
        <Avatar user={user} />
        <div className="who">
          <div className="name">{user.name}</div>
          <div className="meta">
            <span>@{user.handle}</span>
            <span>·</span>
            <span><Ico.Pin width="9" height="9" style={{ verticalAlign: "-1px" }} /> {c.location.name}</span>
            <span>·</span>
            <span>{timeAgo(c.caughtAt || c.createdAt)}</span>
          </div>
        </div>
        <button className="ellipsis" onClick={(e) => e.stopPropagation()}>
          <Ico.Ellipsis width="16" height="16" />
        </button>
      </header>
      <div className="cc-photo">
        <PhotoPlaceholder label={photoLabel} seed={c.id.charCodeAt(2)} />
        <div className="cc-overlay">
          <span className="cc-tag species">{species.name}</span>
          {c.trophy ? <span className="cc-tag" style={{ background: "var(--c-accent)" }}>TROPHY</span> : null}
        </div>
      </div>
      <div className="cc-body">
        <div className="cc-actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onLike(c.id)} className={liked ? "liked" : ""}>
            {liked ? <Ico.Heart width="18" height="18" /> : <Ico.HeartO width="18" height="18" />}
            <span>{formatNum((c.likeCount || 0) + (liked ? 1 : 0))}</span>
          </button>
          <button onClick={() => onOpen(c.id)}>
            <Ico.Comment width="18" height="18" />
            <span>{c.commentCount || 0}</span>
          </button>
          <button>
            <Ico.Share width="18" height="18" />
          </button>
          <span className="spacer" />
          <button>
            <Ico.Bookmark width="18" height="18" />
          </button>
        </div>
        <div className="cc-caption">
          <b>{user.name}</b> {c.description}
        </div>
        {showStats ? (
          <div className="cc-stats">
            <div className="stat">
              <div className="lbl">Length</div>
              <div className="val">{c.lengthCm}<span style={{ fontSize: 12, fontStyle: "normal", fontFamily: "var(--f-mono)", color: "var(--c-muted)", marginLeft: 2 }}>cm</span></div>
            </div>
            <div className="stat">
              <div className="lbl">Weight</div>
              <div className="val">{c.weightKg}<span style={{ fontSize: 12, fontStyle: "normal", fontFamily: "var(--f-mono)", color: "var(--c-muted)", marginLeft: 2 }}>kg</span></div>
            </div>
            <div className="stat">
              <div className="lbl">Tide</div>
              <div className="val" style={{ fontSize: 16 }}>{c.conditions?.tide || "—"}</div>
            </div>
            <div className="stat">
              <div className="lbl">Water</div>
              <div className="val" style={{ fontSize: 16 }}>{c.conditions?.water || "—"}</div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Feed({ density, showStats, onOpen, likes, onLike, onSetRoute }) {
  const [tab, setTab] = React.useState("global");
  const [apiCatches, setApiCatches] = React.useState([]);
  const D = window.DATA;

  const tabs = [
    { id: "following", label: "Following" },
    { id: "global", label: "Global" },
    { id: "local", label: "Nearby" },
    { id: "trending", label: "Trending" },
  ];

  React.useEffect(() => {
    if (!window.API) return;
    // Preload current user into cache so API catches render with real username
    window.API.getMe().then(me => {
      if (me) {
        window._userCache = window._userCache || {};
        window._userCache[me.id] = me;
      }
    }).catch(() => {});

    window.API.getCatches(20).then(data => {
      if (data && data.items) setApiCatches(data.items);
    }).catch(() => {});
  }, []);

  // Merge: API catches first, then mock catches not already in API results, sorted newest first
  const apiIds = new Set(apiCatches.map(c => c.id));
  const allCatches = [...apiCatches, ...D.CATCHES.filter(c => !apiIds.has(c.id))]
    .sort((a, b) => new Date(b.caughtAt || b.createdAt) - new Date(a.caughtAt || a.createdAt));

  let list = allCatches;
  if (tab === "trending") list = [...allCatches].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  if (tab === "following") list = allCatches.filter(c => ["u_marlo", "u_finn", "u_priya"].includes(c.userId));
  if (tab === "local") list = allCatches.filter(c => ["u_marlo", "u_lena", "u_sage"].includes(c.userId));

  const suggested = D.USERS.filter(u => u.id !== "u_you").slice(0, 4);
  const trending = [...allCatches].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)).slice(0, 4);

  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feed <em></em></h1>
          <div className="page-sub">Public catches · Updated just now</div>
        </div>
        <div className="tab-row">
          {tabs.map(t => (
            <button
              key={t.id}
              className={"tab " + (tab === t.id ? "active" : "")}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="page-body">
        <div className="feed-col">
          {list.filter(c => c.location).map(c => (
            <CatchCard
              key={c.id}
              c={c}
              density={density}
              showStats={showStats}
              onOpen={onOpen}
              liked={likes[c.id]}
              onLike={onLike} />
          ))}
        </div>
        <div className="right-rail">
          <div className="rail-card dark">
            <h4>Tide & Conditions</h4>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 32, lineHeight: 1, marginBottom: 8 }}>
              Run-out
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>
              Cronulla · Next low 14:22 · Moon waxing 78%
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Water</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22 }}>19.4°C</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Wind</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22 }}>S 8kts</div>
              </div>
            </div>
          </div>
          <div className="rail-card">
            <h4>Who to follow</h4>
            {suggested.map(u => (
              <FollowRow key={u.id} user={u} onClick={() => onSetRoute("profile")} />
            ))}
          </div>
          <div className="rail-card">
            <h4>Trending this week</h4>
            {trending.filter(c => c.location).map((c, i) => {
              const u = resolveUser(c.userId);
              const s = resolveSpecies(c);
              return (
                <div className="trend-row" key={c.id} onClick={() => onOpen(c.id)} style={{ cursor: "pointer" }}>
                  <div className="rank">{String(i + 1).padStart(2, "0")}</div>
                  <div className="body">
                    <div className="ttl">{s.name} · {c.lengthCm}cm</div>
                    <div className="meta">@{u.handle} · {formatNum(c.likeCount || 0)} likes</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function FollowRow({ user, onClick }) {
  const [following, setFollowing] = React.useState(false);
  const toggle = (e) => {
    e.stopPropagation();
    if (window.API) {
      const action = following ? window.API.unfollow(user.id) : window.API.follow(user.id);
      action.then(() => setFollowing(!following)).catch(() => setFollowing(!following));
    } else {
      setFollowing(!following);
    }
  };
  return (
    <div className="follow-row" onClick={onClick}>
      <Avatar user={user} size="sm" />
      <div className="who">
        <div className="name">{user.name}</div>
        <div className="meta">@{user.handle} · {formatNum(user.followers || 0)} followers</div>
      </div>
      <button className={"btn-pill " + (following ? "following" : "")} onClick={toggle}>
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}

Object.assign(window, { Feed, CatchCard, FollowRow, resolveUser, resolveSpecies });
