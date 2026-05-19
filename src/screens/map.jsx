// Map screen

function MapView({ mapStyle, onOpen }) {
  const D = window.DATA;
  const [selectedId, setSelectedId] = React.useState(D.CATCHES[0].id);
  const [filter, setFilter] = React.useState("all");
  // pin positions are pre-baked relative to a reference frame
  const positions = {
    c_1: { x: 72, y: 28 },
    c_2: { x: 58, y: 72 },
    c_3: { x: 35, y: 78 },
    c_4: { x: 48, y: 52 },
    c_5: { x: 52, y: 38 },
    c_6: { x: 43, y: 62 },
    c_7: { x: 80, y: 22 },
    c_8: { x: 38, y: 82 },
    c_9: { x: 25, y: 44 },
  };
  const filters = [
    { id: "all", label: "All species" },
    { id: "flathead", label: "Flathead" },
    { id: "snapper", label: "Snapper" },
    { id: "kingfish", label: "Kingfish" },
    { id: "trout", label: "Trout" },
  ];
  const list = D.CATCHES.filter((c) => filter === "all" || c.speciesId === filter);

  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">The <em>map</em></h1>
          <div className="page-sub">{list.length} catches · Public only · Last 30 days</div>
        </div>
        <div className="tab-row">
          {filters.map((f) => (
            <button key={f.id} className={"tab " + (filter === f.id ? "active" : "")} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "var(--gap-4) var(--gap-6) var(--gap-5)" }}>
        <div className="map-wrap">
          <div className={"map-tiles " + mapStyle} />
          <div className="map-grain" />

          {list.map((c) => {
            const p = positions[c.id];
            if (!p) return null;
            return (
              <button
                key={c.id}
                className={"pin " + (c.trophy ? "cluster" : "")}
                style={{ left: p.x + "%", top: p.y + "%" }}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="pin-dot">
                  {c.trophy ? "★" : c.lengthCm}
                </div>
              </button>
            );
          })}

          <div className="map-side-panel">
            <div className="hdr">
              <Ico.Pin width="14" height="14" />
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", flex: 1 }}>
                {list.length} catches visible
              </div>
              <span className="pill solid">Live</span>
            </div>
            <div className="list">
              {list.map((c) => {
                const u = D.userById(c.userId);
                const s = D.speciesById(c.speciesId);
                return (
                  <div
                    key={c.id}
                    className={"map-list-item " + (selectedId === c.id ? "active" : "")}
                    onClick={() => setSelectedId(c.id)}
                    onDoubleClick={() => onOpen(c.id)}
                  >
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

          <div className="map-controls">
            <button title="Zoom in"><Ico.ZoomIn width="16" height="16" /></button>
            <button title="Zoom out"><Ico.ZoomOut width="16" height="16" /></button>
            <button title="Locate"><Ico.Locate width="16" height="16" /></button>
            <button title="Layers"><Ico.Layers width="16" height="16" /></button>
          </div>

          <div className="map-legend">
            <span><span className="swatch" style={{ background: "var(--c-accent)" }} /> Catch</span>
            <span><span className="swatch" style={{ background: "var(--c-brand)" }} /> Trophy</span>
            <span style={{ marginLeft: 12 }}>Tiles: {mapStyle}</span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { MapView });
