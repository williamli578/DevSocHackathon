// Profile screen

function Profile({ viewer, userId, onOpen, showStats, density }) {
  const D = window.DATA;
  const [tab, setTab] = React.useState("catches");
  const [apiUser, setApiUser] = React.useState(null);
  const [apiBadges, setApiBadges] = React.useState(null);
  const isOwnProfile = !userId || userId === viewer?.id || userId === (window.API && window.API.getUserId());

  const isMockUser = userId && userId.startsWith("u_");

  React.useEffect(() => {
    setTab("catches");
    setApiUser(null);
    setApiBadges(null);
    if (!window.API) return;
    if (isOwnProfile) {
      window.API.getMe().then(u => {
        setApiUser(u);
        return window.API.getUserBadges(u.id || window.API.getUserId());
      }).then(data => {
        setApiBadges(data && data.items ? data.items : []);
      }).catch(() => { setApiBadges([]); });
    } else if (!isMockUser) {
      window.API.getUser(userId).then(u => {
        setApiUser(u);
        return window.API.getUserBadges(userId);
      }).then(data => {
        setApiBadges(data && data.items ? data.items : []);
      }).catch(() => { setApiBadges([]); });
    }
  }, [userId]);

  // When API user exists, use only API data — never fall back to mock stats
  const user = React.useMemo(() => {
    if (apiUser) {
      const handle = apiUser.username || apiUser.name || "angler";
      return {
        id: apiUser.id || userId,
        name: apiUser.username || apiUser.name || "Angler",
        handle,
        initial: handle[0].toUpperCase(),
        bio: apiUser.bio || "",
        region: apiUser.region || "",
        catches: apiUser.catchCount ?? 0,
        species: apiUser.speciesCount ?? 0,
        badges: apiUser.badgeCount ?? 0,
        followers: apiUser.followerCount ?? 0,
        points: apiUser.points ?? 0,
      };
    }
    return (userId ? D.userById(userId) : null) || viewer || D.userById("u_you");
  }, [apiUser, viewer, userId]);

  const userCatches = D.CATCHES.filter((c) => c.userId === user.id);
  const badges = apiBadges !== null
    ? D.BADGES.map(b => {
        const earned = apiBadges.some(ab => ab.id === b.id || ab.name === b.name);
        return earned ? { ...b, earned: true } : { ...b, earned: false, progress: 0 };
      })
    : apiUser
      ? D.BADGES.map(b => ({ ...b, earned: false, progress: 0 }))
      : D.BADGES;
  const userBadges = badges.filter((b) => b.earned);

  return (
    <React.Fragment>
      <div className="profile-hero">
        <Avatar user={user} size="xl" />
        <div className="profile-info">
          <div className="username">@{user.handle} · {user.region}</div>
          <h1 className="name">{user.name}</h1>
          <p className="bio">{user.bio}</p>
          <div className="profile-stats">
            <div className="stat">
              <div className="lbl">Catches</div>
              <div className="val">{user.catches}</div>
            </div>
            <div className="stat">
              <div className="lbl">Species</div>
              <div className="val">{user.species}</div>
            </div>
            <div className="stat">
              <div className="lbl">Badges</div>
              <div className="val">{user.badges}</div>
            </div>
            <div className="stat">
              <div className="lbl">Followers</div>
              <div className="val">{formatNum(user.followers)}</div>
            </div>
            <div className="stat">
              <div className="lbl">Points</div>
              <div className="val">{formatNum(user.points)}</div>
            </div>
          </div>
          <div className="profile-actions">
            {isOwnProfile
              ? <button className="btn btn-primary">Edit Profile</button>
              : <button className="btn btn-primary" onClick={() => window.API && window.API.follow(user.id).catch(() => {})}>Follow</button>
            }
            <button className="btn btn-ghost" style={{ background: "var(--c-surface)" }}>Share</button>
          </div>
        </div>
      </div>

      <div className="page-header" style={{ borderBottom: "1px solid var(--c-line)", paddingTop: "var(--gap-4)" }}>
        <div className="tab-row">
          {["catches", "trophies", "badges", "map"].map((t) => (
            <button key={t} className={"tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="page-sub" style={{ marginTop: 0 }}>
          {tab === "catches" && `${user.catches} catches logged`}
          {tab === "trophies" && `${userCatches.filter(c=>c.trophy).length} trophies`}
          {tab === "badges" && `${userBadges.length} earned · ${badges.length - userBadges.length} locked`}
          {tab === "map" && "All public catches"}
        </div>
      </div>

      <div className="page-body single">
        {(tab === "catches" || tab === "trophies") && (() => {
          const items = tab === "trophies" ? userCatches.filter(c => c.trophy) : userCatches;
          if (items.length === 0) {
            return (
              <div style={{ textAlign: "center", padding: "var(--gap-6) 0", color: "var(--c-muted)" }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, marginBottom: 8 }}>
                  {tab === "trophies" ? "No trophies yet" : "No catches logged yet"}
                </div>
                <div style={{ fontSize: 13 }}>
                  {tab === "trophies" ? "Catch something over 1m to earn a trophy." : "Head out and log your first catch!"}
                </div>
              </div>
            );
          }
          return (
            <div className="profile-grid">
              {items.map((c) => {
                const s = D.speciesById(c.speciesId);
                return (
                  <div key={c.id} className="tile" onClick={() => onOpen(c.id)}>
                    <PhotoPlaceholder label={s.name} seed={c.id.charCodeAt(2)} />
                    <div className="tag">
                      <span>{s.name}</span>
                      <span>{c.lengthCm}cm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        {tab === "badges" && (
          <div className="badge-grid">
            {badges.map((b) => <BadgeCard key={b.id} badge={b} />)}
          </div>
        )}
        {tab === "map" && (
          <div style={{
            height: 500,
            background: "linear-gradient(180deg,#b9d4d3,#a9c8c9)",
            backgroundImage: "radial-gradient(ellipse at 40% 50%, rgba(193,162,109,0.6), transparent 35%), radial-gradient(ellipse at 70% 60%, rgba(193,162,109,0.55), transparent 28%)",
            borderRadius: "var(--r-lg)",
            position: "relative",
            border: "1px solid var(--c-line)"
          }}>
            {userCatches.slice(0, 6).map((c, i) => (
              <button key={c.id} className="pin" style={{ left: (20 + i * 12) + "%", top: (30 + (i % 3) * 18) + "%" }} onClick={() => onOpen(c.id)}>
                <div className="pin-dot">{c.lengthCm}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

function BadgeCard({ badge }) {
  const locked = !badge.earned;
  return (
    <div className={"badge-card " + (locked ? "locked" : "")}>
      <div className={"badge-medal " + (badge.kind || "")}>{badge.glyph}</div>
      <div className="ttl">{badge.name}</div>
      <div className="desc">{badge.desc}</div>
      {locked && badge.target ? (
        <React.Fragment>
          <div className="progress"><div className="fill" style={{ width: ((badge.progress / badge.target) * 100) + "%" }} /></div>
          <div className="progress-text">{badge.progress}/{badge.target}</div>
        </React.Fragment>
      ) : (
        <div className="progress-text">{locked ? "Locked" : "Earned"}</div>
      )}
    </div>
  );
}

Object.assign(window, { Profile, BadgeCard });
