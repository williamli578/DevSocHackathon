// Messages — Instagram-style DMs

function Messages({ onOpen }) {
  const D = window.DATA;
  const [threads, setThreads] = React.useState(() =>
    D.THREADS.map(t => ({ ...t, messages: [...t.messages] }))
  );
  const [activeId, setActiveId] = React.useState(threads[0].id);
  const [query, setQuery] = React.useState("");
  const [draftMap, setDraftMap] = React.useState({});
  const [newMsgOpen, setNewMsgOpen] = React.useState(false);
  const [newMsgQuery, setNewMsgQuery] = React.useState("");

  const filtered = query.trim()
    ? threads.filter(t => {
        const names = t.userIds.map(id => D.userById(id).name).join(" ").toLowerCase();
        return names.includes(query.toLowerCase()) || (t.groupName || "").toLowerCase().includes(query.toLowerCase());
      })
    : threads;

  const active = threads.find(t => t.id === activeId);
  const draft = draftMap[activeId] || "";
  const setDraft = v => setDraftMap(prev => ({ ...prev, [activeId]: v }));

  // Mark thread as read when opened
  React.useEffect(() => {
    setThreads(prev => prev.map(t => t.id === activeId ? { ...t, unread: 0 } : t));
  }, [activeId]);

  const sendMessage = (threadId, text) => {
    if (!text.trim()) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    const timeStr = `Today ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setThreads(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, messages: [...t.messages, { from: "u_you", text, time: timeStr }] }
        : t
    ));
    setDraftMap(prev => ({ ...prev, [threadId]: "" }));
  };

  const startThread = user => {
    const existing = threads.find(t => t.userIds.length === 1 && t.userIds[0] === user.id);
    if (existing) {
      setActiveId(existing.id);
    } else {
      const newThread = { id: "t_new_" + user.id, userIds: [user.id], messages: [], unread: 0 };
      setThreads(prev => [newThread, ...prev]);
      setActiveId(newThread.id);
    }
    setNewMsgOpen(false);
    setNewMsgQuery("");
  };

  const threadTitle = t => t.groupName || t.userIds.map(id => D.userById(id).name.split(" ")[0]).join(", ");
  const shortTime = s => {
    if (!s) return "";
    const cleaned = s.replace(/\s+ago$/i, "").trim();
    const parts = cleaned.split(/\s+/);
    return parts[parts.length - 1];
  };
  const threadHandle = t => t.groupName ? `${t.userIds.length + 1} people` : "@" + D.userById(t.userIds[0]).handle;
  const lastMsg = t => {
    const m = t.messages[t.messages.length - 1];
    if (!m) return "No messages yet";
    if (m.catchId) return "Sent a catch";
    return m.text || "";
  };

  const groups = msgs => {
    const out = [];
    let cur = null;
    for (const m of msgs) {
      const day = m.time.split(" ")[0];
      if (!cur || cur.day !== day) { cur = { day, msgs: [] }; out.push(cur); }
      cur.msgs.push(m);
    }
    return out;
  };

  return (
    <div className="messages-shell">
      {newMsgOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setNewMsgOpen(false)}
        >
          <div
            style={{ background: "var(--c-bg)", borderRadius: "var(--r-lg)", padding: 24, width: 360, maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: 0 }}>New message</h3>
            <div className="search-box" style={{ padding: "6px 12px" }}>
              <Ico.Search width="14" height="14" style={{ color: "var(--c-muted)" }} />
              <input placeholder="Search users…" value={newMsgQuery} onChange={e => setNewMsgQuery(e.target.value)} autoFocus />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {D.USERS.filter(u => u.id !== "u_you" && (
                !newMsgQuery || u.name.toLowerCase().includes(newMsgQuery.toLowerCase()) || u.handle.toLowerCase().includes(newMsgQuery.toLowerCase())
              )).map(u => (
                <div key={u.id} className="follow-row" style={{ cursor: "pointer", padding: "6px 4px", borderRadius: "var(--r-sm)" }} onClick={() => startThread(u)}>
                  <Avatar user={u} />
                  <div className="who">
                    <div className="name">{u.name}</div>
                    <div className="meta">@{u.handle} · {u.region}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <aside className="thread-list">
        <div className="thread-list-hd">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>Messages</h2>
              <div className="sub">@{D.userById("u_you").handle}</div>
            </div>
            <button
              className="icon-btn"
              style={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--c-ink-2)" }}
              onClick={() => setNewMsgOpen(true)}
              title="New message"
            >
              <Ico.Plus2 width="20" height="20" />
            </button>
          </div>
        </div>
        <div className="thread-search">
          <div className="search-box" style={{ padding: "6px 12px" }}>
            <Ico.Search width="14" height="14" style={{ color: "var(--c-muted)" }} />
            <input placeholder="Search messages" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="threads">
          {filtered.map(t => {
            const isActive = t.id === activeId;
            const users = t.userIds.map(id => D.userById(id));
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
        <ThreadView
          thread={active}
          onOpen={onOpen}
          draft={draft}
          setDraft={setDraft}
          onSend={() => sendMessage(activeId, draft)}
          groups={groups(active.messages)}
        />
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

function ThreadView({ thread, onOpen, draft, setDraft, onSend, groups }) {
  const D = window.DATA;
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [thread.id, groups.length]);

  const partnerName = thread.groupName || thread.userIds.map(id => D.userById(id).name).join(", ");
  const partnerSub = thread.groupName
    ? `${thread.userIds.length + 1} members · ${thread.userIds.map(id => "@" + D.userById(id).handle).join(", ")}`
    : `@${D.userById(thread.userIds[0]).handle} · ${D.userById(thread.userIds[0]).region}`;

  const send = () => {
    if (!draft.trim()) return;
    onSend();
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
        {groups.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--c-muted)", fontSize: 13, marginTop: 40 }}>
            No messages yet. Say hello!
          </div>
        )}
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
            placeholder={`Message ${thread.groupName || D.userById(thread.userIds[0]).name.split(" ")[0]}…`}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
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
