// Messages — Instagram-style DMs

function Messages({ onOpen }) {
  const D = window.DATA;
  const [activeId, setActiveId] = React.useState(D.THREADS[0].id);
  const [query, setQuery] = React.useState("");
  const [draftMap, setDraftMap] = React.useState({});

  const threads = D.THREADS;
  const filtered = query.trim()
    ? threads.filter((t) => {
        const names = t.userIds.map((id) => D.userById(id).name).join(" ").toLowerCase();
        return names.includes(query.toLowerCase()) || (t.groupName || "").toLowerCase().includes(query.toLowerCase());
      })
    : threads;
  const active = D.threadById(activeId);

  const draft = draftMap[activeId] || "";
  const setDraft = (v) => setDraftMap({ ...draftMap, [activeId]: v });

  const threadTitle = (t) => t.groupName || t.userIds.map((id) => D.userById(id).name.split(" ")[0]).join(", ");
  // Shorter time format for the thread list — strip a trailing "ago",
  // then take the last meaningful token ("4:21pm", "Yesterday", "2d").
  const shortTime = (s) => {
    if (!s) return "";
    const cleaned = s.replace(/\s+ago$/i, "").trim();
    const parts = cleaned.split(/\s+/);
    return parts[parts.length - 1];
  };
  const threadHandle = (t) => t.groupName ? `${t.userIds.length + 1} people` : "@" + D.userById(t.userIds[0]).handle;
  const lastMsg = (t) => {
    const m = t.messages[t.messages.length - 1];
    if (!m) return "";
    if (m.catchId) return "Sent a catch";
    return m.text || "";
  };

  // group messages by day
  const groups = (msgs) => {
    const out = [];
    let cur = null;
    for (const m of msgs) {
      const day = m.time.split(" ")[0];
      if (!cur || cur.day !== day) {
        cur = { day, msgs: [] };
        out.push(cur);
      }
      cur.msgs.push(m);
    }
    return out;
  };

  return (
    <div className="messages-shell">
      <aside className="thread-list">
        <div className="thread-list-hd">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>Messages</h2>
              <div className="sub">@{D.userById("u_you").handle}</div>
            </div>
            <button className="icon-btn" style={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--c-ink-2)" }} title="New message">
              <Ico.Plus2 width="20" height="20" />
            </button>
          </div>
        </div>
        <div className="thread-search">
          <div className="search-box" style={{ padding: "6px 12px" }}>
            <Ico.Search width="14" height="14" style={{ color: "var(--c-muted)" }} />
            <input placeholder="Search messages" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="threads">
          {filtered.map((t) => {
            const isActive = t.id === activeId;
            const users = t.userIds.map((id) => D.userById(id));
            return (
              <div key={t.id} className={"thread-row " + (isActive ? "active " : "") + (t.unread ? "unread" : "")} onClick={() => setActiveId(t.id)}>
                {users.length === 1 ? (
                  <Avatar user={users[0]} />
                ) : (
                  <div className="avatar-stack">
                    <Avatar user={users[0]} size="sm" />
                    <Avatar user={users[1]} size="sm" />
                  </div>
                )}
                <div className="who">
                  <div className="name-row">
                    <span className="name">{threadTitle(t)}</span>
                    <span className="time">{shortTime(t.messages[t.messages.length - 1]?.time)}</span>
                  </div>
                  <div className="preview">{lastMsg(t)}</div>
                </div>
                {t.unread > 0 ? <span className="unread-dot" /> : null}
              </div>
            );
          })}
        </div>
      </aside>

      {active ? (
        <ThreadView thread={active} onOpen={onOpen} draft={draft} setDraft={setDraft} groups={groups(active.messages)} />
      ) : (
        <div className="thread-empty">
          <div>
            <div className="icon"><Ico.Message width="32" height="32" /></div>
            <h3>Your messages</h3>
            <p>Pick a thread or start a new one.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ThreadView({ thread, onOpen, draft, setDraft, groups }) {
  const D = window.DATA;
  const bodyRef = React.useRef(null);
  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [thread.id]);

  const partnerName = thread.groupName || thread.userIds.map((id) => D.userById(id).name).join(", ");
  const partnerSub = thread.groupName
    ? `${thread.userIds.length + 1} members · ${thread.userIds.map((id) => "@" + D.userById(id).handle).join(", ")}`
    : `@${D.userById(thread.userIds[0]).handle} · ${D.userById(thread.userIds[0]).region}`;

  const send = () => {
    if (!draft.trim()) return;
    // mock: just clear
    setDraft("");
  };

  return (
    <section className="thread-view">
      <header className="thread-hd">
        {thread.userIds.length === 1 ? (
          <Avatar user={D.userById(thread.userIds[0])} />
        ) : (
          <div className="avatar-stack">
            <Avatar user={D.userById(thread.userIds[0])} size="sm" />
            <Avatar user={D.userById(thread.userIds[1])} size="sm" />
          </div>
        )}
        <div className="who-info">
          <div className="name">{partnerName}</div>
          <div className="meta">{partnerSub}</div>
        </div>
        <button className="icon-btn" title="Call"><Ico.Phone width="18" height="18" /></button>
        <button className="icon-btn" title="Info"><Ico.Info width="18" height="18" /></button>
      </header>

      <div className="thread-body" ref={bodyRef}>
        {groups.map((g, gi) => (
          <React.Fragment key={gi}>
            <div className="day-divider">{g.day}</div>
            {g.msgs.map((m, mi) => <MessageBubble key={mi} msg={m} onOpen={onOpen} />)}
          </React.Fragment>
        ))}
      </div>

      <footer className="thread-composer">
        <div className="composer-input">
          <button className="ic" title="Photo"><Ico.Image width="18" height="18" /></button>
          <input
            placeholder={`Message ${thread.groupName || D.userById(thread.userIds[0]).name.split(" ")[0]}...`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) send(); }}
          />
          <button className="ic" title="Share catch"><Ico.Fish width="18" height="18" /></button>
        </div>
        <button className={"send " + (draft.trim() ? "on" : "")} disabled={!draft.trim()} onClick={send} title="Send">
          <Ico.Send width="16" height="16" />
        </button>
      </footer>
    </section>
  );
}

function MessageBubble({ msg, onOpen }) {
  const D = window.DATA;
  const mine = msg.from === "u_you";
  const user = D.userById(msg.from);
  const time = msg.time.split(" ").slice(-1)[0];

  // shared catch
  if (msg.catchId) {
    const c = D.catchById(msg.catchId);
    const s = D.speciesById(c.speciesId);
    return (
      <div className={"msg " + (mine ? "mine" : "")}>
        {!mine ? <Avatar user={user} size="sm" /> : null}
        <div className="group">
          <div className="shared-catch" onClick={() => onOpen(c.id)}>
            <div className="ph">{s.name.toUpperCase()} · {c.lengthCm}cm</div>
            <div className="info">
              <div className="ttl">{s.name}</div>
              <div className="sub">{c.location.name} · {c.lengthCm}cm · {c.weightKg}kg</div>
            </div>
          </div>
          {msg.text ? <div className="bubble">{msg.text}</div> : null}
          <div className="time">{time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={"msg " + (mine ? "mine" : "")}>
      {!mine ? <Avatar user={user} size="sm" /> : null}
      <div className="group">
        <div className="bubble">{msg.text}</div>
        <div className="time">{time}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Messages });
