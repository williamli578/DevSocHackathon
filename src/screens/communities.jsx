// Communities — list + detail (catchment areas)

function Communities({ onOpen, density, showStats, likes, onLike, onSetRoute }) {
  const D = window.DATA;
  const [openId, setOpenId] = React.useState(null);
  const [tab, setTab] = React.useState("joined");
  const tabs = [
    { id: "joined", label: "Your communities" },
    { id: "discover", label: "Discover" },
    { id: "nearby", label: "Nearby" },
  ];

  let list = D.COMMUNITIES;
  if (tab === "joined") list = D.COMMUNITIES.filter((c) => c.joined);
  if (tab === "nearby") list = D.COMMUNITIES.filter((c) => c.region.includes("NSW"));

  if (openId) {
    return <CommunityDetail id={openId} onBack={() => setOpenId(null)} onOpen={onOpen} likes={likes} onLike={onLike} density={density} showStats={showStats} onSetRoute={onSetRoute} />;
  }

  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">Communities</h1>
          <div className="page-sub">Catchments, bays and river systems · {D.COMMUNITIES.length} active</div>
        </div>
        <div className="tab-row">
          {tabs.map((t) => (
            <button key={t.id} className={"tab " + (tab === t.id ? "active" : "")} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="page-body single">
        <div>
          {tab === "discover" && (
            <div className="rail-card dark" style={{ marginBottom: "var(--gap-4)" }}>
              <h4>What is a community?</h4>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 24, lineHeight: 1.2, maxWidth: 540 }}>
                Catchment-based groups. People who fish the same water — same river, same bay, same headland.
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 12 }}>
                Share local intel, swap conditions, find a fishing partner.
              </div>
            </div>
          )}
          <div className="community-grid">
            {list.map((co) => (
              <CommunityCard key={co.id} community={co} onClick={() => setOpenId(co.id)} />
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function CommunityCard({ community, onClick }) {
  const co = community;
  const D = window.DATA;
  return (
    <article className="community-card" onClick={onClick}>
      <div className="community-cover" style={{ "--cover-c": co.pinColor }}>
        <span className="kind">{co.kind}</span>
        <span className="live"><span className="pulse" /> {co.activeNow} active</span>
      </div>
      <div className="community-body">
        <h3 className="name">{co.name}</h3>
        <div className="region">{co.region} · {formatNum(co.members)} members</div>
        <p className="blurb">{co.blurb}</p>
        <div className="community-meta-row">
          <div className="stat">
            <div className="lbl">Members</div>
            <div className="val">{formatNum(co.members)}</div>
          </div>
          <div className="stat">
            <div className="lbl">Posts</div>
            <div className="val">{co.posts}</div>
          </div>
          <span className="spacer" />
          <button className={"btn-pill " + (co.joined ? "following" : "")}
            onClick={(e) => { e.stopPropagation(); }}>
            {co.joined ? "Joined" : "Join"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CommunityDetail({ id, onBack, onOpen, likes, onLike, density, showStats, onSetRoute }) {
  const D = window.DATA;
  const co = D.communityById(id);
  if (!co) return null;
  const [tab, setTab] = React.useState("feed");
  // posts: filter catches to ones whose species match top species (mock)
  const posts = D.CATCHES.filter((c) => co.topSpecies.includes(c.speciesId)).slice(0, 4);
  const allCatches = D.CATCHES.slice(0, 6);
  const moderators = co.moderators.map((id) => D.userById(id)).filter(Boolean);
  const members = D.USERS.filter((u) => u.id !== "u_you").slice(0, 6);

  return (
    <React.Fragment>
      <div className="community-hero" style={{ "--cover-c": co.pinColor }}>
        <div className="crumb">
          <button onClick={onBack}>← Communities</button>
          <span>/</span>
          <span>{co.kind} · {co.region}</span>
        </div>
        <h1>{co.name}</h1>
        <div className="sub">{co.blurb}</div>
        <div className="hero-stats">
          <div className="stat">
            <div className="lbl">Members</div>
            <div className="val">{formatNum(co.members)}</div>
          </div>
          <div className="stat">
            <div className="lbl">Posts</div>
            <div className="val">{co.posts}</div>
          </div>
          <div className="stat">
            <div className="lbl">Active now</div>
            <div className="val">{co.activeNow}</div>
          </div>
          <div className="stat">
            <div className="lbl">Top species</div>
            <div className="val" style={{ fontSize: 22 }}>{D.speciesById(co.topSpecies[0]).name}</div>
          </div>
        </div>
        <div className="actions">
          <button className="btn solid">{co.joined ? "Joined ✓" : "Join community"}</button>
          <button className="btn">Notify</button>
        </div>
      </div>

      <div className="page-header" style={{ position: "static" }}>
        <div className="tab-row">
          {[
            { id: "feed", label: "Feed" },
            { id: "catches", label: "Recent catches" },
            { id: "members", label: "Members" },
            { id: "about", label: "About" },
          ].map((t) => (
            <button key={t.id} className={"tab " + (tab === t.id ? "active" : "")} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        <div>
          {tab === "feed" && (
            <div className="feed-col" style={{ marginLeft: 0 }}>
              {posts.map((c) => (
                <CatchCard
                  key={c.id}
                  c={c}
                  density={density}
                  showStats={showStats}
                  onOpen={onOpen}
                  liked={likes[c.id]}
                  onLike={onLike}
                />
              ))}
            </div>
          )}
          {tab === "catches" && (
            <div className="profile-grid">
              {allCatches.map((c) => {
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
          )}
          {tab === "members" && (
            <div className="rail-card">
              <h4>Members ({formatNum(co.members)})</h4>
              {members.map((u) => <FollowRow key={u.id} user={u} onClick={() => onSetRoute && onSetRoute("profile")} />)}
            </div>
          )}
          {tab === "about" && (
            <div className="rail-card">
              <h4>About this community</h4>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, lineHeight: 1.4, marginBottom: 16 }}>
                {co.blurb}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 20px", fontSize: 13 }}>
                <span className="mono-tag">Region</span><span>{co.region}</span>
                <span className="mono-tag">Type</span><span>{co.kind}</span>
                <span className="mono-tag">Founded</span><span>March 2024</span>
                <span className="mono-tag">Rules</span><span>Catch & release encouraged · No bait drop spots in main thread · Be kind</span>
              </div>
            </div>
          )}
        </div>
        <div className="right-rail">
          <div className="rail-card">
            <h4>Moderators</h4>
            {moderators.map((u) => <FollowRow key={u.id} user={u} onClick={() => onSetRoute && onSetRoute("profile")} />)}
          </div>
          <div className="rail-card">
            <h4>Top species this month</h4>
            {co.topSpecies.map((sid, i) => {
              const s = D.speciesById(sid);
              return (
                <div className="trend-row" key={sid}>
                  <div className="rank">{String(i + 1).padStart(2, "0")}</div>
                  <div className="body">
                    <div className="ttl">{s.name}</div>
                    <div className="meta">{s.latin}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rail-card dark">
            <h4>Conditions</h4>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 28, lineHeight: 1, marginBottom: 8 }}>
              Fishing well
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Reports up 24% this week. Best window: Sat AM run-out.
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { Communities, CommunityCard, CommunityDetail });
