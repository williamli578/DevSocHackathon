// Catch / Post detail overlay

function Detail({ catchId, onClose, liked, onLike }) {
  const D = window.DATA;
  const [c, setC] = React.useState(() => D.catchById(catchId));
  const [comments, setComments] = React.useState([]);
  const [commentText, setCommentText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Load catch from API if not found in mock data
  React.useEffect(() => {
    if (!c && window.API) {
      window.API.getCatch(catchId).then(data => setC(data)).catch(() => {});
    }
  }, [catchId]);

  // Load comments
  React.useEffect(() => {
    if (!c) return;
    if (c.postId && window.API) {
      window.API.getComments(c.postId).then(data => {
        if (data && data.items) setComments(data.items);
      }).catch(() => {});
    } else {
      setComments(D.COMMENTS[c.id] || []);
    }
  }, [c && c.id, c && c.postId]);

  // Escape key to close + lock body scroll
  React.useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!c) return (
    <div className="detail-overlay" onClick={onClose}>
      <button className="detail-close" onClick={onClose}><Ico.Close width="20" height="20" /></button>
      <div className="detail-modal" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: 40, color: "var(--c-muted)", fontFamily: "var(--f-mono)", fontSize: 12 }}>Loading…</div>
      </div>
    </div>
  );

  const user = resolveUser(c.userId);
  const species = resolveSpecies(c);

  const handleLike = () => {
    if (c.postId && window.API) {
      const action = liked ? window.API.unlikePost(c.postId) : window.API.likePost(c.postId);
      action.catch(() => {});
    }
    onLike(c.id);
  };

  const handlePostComment = async () => {
    const text = commentText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      if (c.postId && window.API) {
        const newComment = await window.API.postComment(c.postId, text);
        setComments(prev => [...prev, newComment]);
      } else {
        setComments(prev => [...prev, {
          id: 'local_' + Date.now(),
          userId: 'u_you',
          content: text,
          createdAt: new Date().toISOString(),
        }]);
      }
      setCommentText("");
    } catch (e) {
      console.error('Failed to post comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <button className="detail-close" onClick={onClose}><Ico.Close width="20" height="20" /></button>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-photo">
          {c.imageUrls && c.imageUrls.length > 0
            ? <img src={c.imageUrls[0]} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <PhotoPlaceholder label={`${species.name.toUpperCase()} · ${c.lengthCm || '?'}cm`} seed={c.id.charCodeAt(2)} />
          }
          {c.trophy ? (
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <span className="cc-tag" style={{ background: "var(--c-accent)" }}>TROPHY CATCH</span>
            </div>
          ) : null}
          <div style={{
            position: "absolute", bottom: 16, left: 16, right: 16,
            display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {c.location && <span className="cc-tag"><Ico.Pin width="9" height="9" /> {c.location.name}</span>}
              <span className="cc-tag">{new Date(c.caughtAt || c.createdAt).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>
        <div className="detail-side">
          <div className="detail-side-hd">
            <Avatar user={user} />
            <div className="who">
              <div className="name">{user.name}</div>
              <div className="meta">@{user.handle}{user.region ? " · " + user.region : ""}</div>
            </div>
            <button className="btn-pill" style={{ padding: "5px 12px", border: "1px solid var(--c-line-strong)", borderRadius: 999, fontFamily: "var(--f-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Follow
            </button>
          </div>

          <div className="detail-species">
            <div className="label">Species</div>
            <div className="name">{species.name}</div>
            <div className="latin">{species.latin}</div>
          </div>

          <div className="detail-stats">
            <div className="stat">
              <div className="lbl">Length</div>
              <div className="val">{c.lengthCm || "—"}<span style={{ fontSize: 13, fontStyle: "normal", fontFamily: "var(--f-mono)", color: "var(--c-muted)", marginLeft: 2 }}>cm</span></div>
            </div>
            <div className="stat">
              <div className="lbl">Weight</div>
              <div className="val">{c.weightKg || "—"}<span style={{ fontSize: 13, fontStyle: "normal", fontFamily: "var(--f-mono)", color: "var(--c-muted)", marginLeft: 2 }}>kg</span></div>
            </div>
            <div className="stat">
              <div className="lbl">Tide</div>
              <div className="val" style={{ fontSize: 18 }}>{c.conditions?.tide || "—"}</div>
            </div>
            <div className="stat">
              <div className="lbl">Water</div>
              <div className="val" style={{ fontSize: 18 }}>{c.conditions?.water || "—"}</div>
            </div>
            <div className="stat">
              <div className="lbl">Wind</div>
              <div className="val" style={{ fontSize: 18 }}>{c.conditions?.wind || "—"}</div>
            </div>
            <div className="stat">
              <div className="lbl">Moon</div>
              <div className="val" style={{ fontSize: 18 }}>{c.conditions?.moon || "—"}</div>
            </div>
          </div>

          <div className="detail-block">
            <h5>Story</h5>
            <p>{c.description || <em style={{ color: "var(--c-muted)" }}>No description.</em>}</p>
          </div>

          {c.gear && (
            <div className="detail-block">
              <h5>Gear</h5>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: 13 }}>
                <span style={{ color: "var(--c-muted)", fontFamily: "var(--f-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Rod</span>
                <span>{c.gear.rod}</span>
                <span style={{ color: "var(--c-muted)", fontFamily: "var(--f-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Lure</span>
                <span>{c.gear.lure}</span>
                <span style={{ color: "var(--c-muted)", fontFamily: "var(--f-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Line</span>
                <span>{c.gear.line}</span>
              </div>
            </div>
          )}

          {c.location && (
            <div className="detail-block">
              <h5>Location</h5>
              <div className="detail-loc">
                <div className="map-mini" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{c.location.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {c.location.latitude?.toFixed(3)}, {c.location.longitude?.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="detail-comments">
            <h5 style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--c-muted)", margin: "0 0 12px" }}>
              {comments.length} comments · {formatNum((c.likeCount || 0) + (liked ? 1 : 0))} likes
            </h5>
            {comments.length === 0 ? (
              <p style={{ color: "var(--c-muted)", fontSize: 13 }}>No comments yet. Be first.</p>
            ) : null}
            {comments.map(cm => {
              const u = D.userById(cm.userId) || resolveUser(cm.userId);
              const time = cm.createdAt && cm.createdAt.includes('T')
                ? timeAgo(cm.createdAt)
                : (cm.createdAt || '');
              return (
                <div className="comment" key={cm.id}>
                  <Avatar user={u} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div className="body">
                      <span className="name">{u.name}</span>
                      <span>{cm.content}</span>
                    </div>
                    <div className="meta">{time} · Like · Reply</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="detail-actions">
            <button onClick={handleLike} title="Like" style={{ display: "flex", alignItems: "center", gap: 4, color: liked ? "var(--c-accent)" : "var(--c-ink-2)" }}>
              {liked ? <Ico.Heart width="22" height="22" /> : <Ico.HeartO width="22" height="22" />}
            </button>
            <div className="comment-input">
              <input
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handlePostComment(); }}
              />
              <button
                disabled={!commentText.trim() || submitting}
                style={{ opacity: commentText.trim() && !submitting ? 1 : 0.4 }}
                onClick={handlePostComment}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Detail });
