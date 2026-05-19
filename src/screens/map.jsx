// Map screen — Leaflet interactive map

function MapView({ mapStyle, onOpen, refreshKey }) {
  const D = window.DATA;
  const mapRef = React.useRef(null);
  const lMap = React.useRef(null);
  const markersLayer = React.useRef(null);
  const [catches, setCatches] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [filter, setFilter] = React.useState("all");

  // Build species list dynamically from loaded catches
  const speciesOptions = React.useMemo(() => {
    const seen = new Map();
    catches.forEach(c => {
      if (c.speciesId && !seen.has(c.speciesId)) {
        seen.set(c.speciesId, resolveSpecies(c).name);
      }
    });
    const sorted = [...seen.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return [{ id: 'all', name: 'All species' }, ...sorted];
  }, [catches]);

  const tileUrls = {
    nautical:  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    minimal:   'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  };

  // Load catches from API + mock data
  const loadCatches = React.useCallback(() => {
    const mock = D.CATCHES.filter(c => c.location?.latitude && c.location?.longitude);
    if (!window.API) { setCatches(mock); return; }
    window.API.getCatches(100).then(data => {
      if (data?.items) {
        const apiIds = new Set(data.items.map(c => c.id));
        setCatches([
          ...data.items.filter(c => c.location?.latitude && c.location?.longitude),
          ...mock.filter(c => !apiIds.has(c.id)),
        ]);
      } else {
        setCatches(mock);
      }
    }).catch(() => setCatches(mock));
  }, []);

  // Reload when refreshKey changes (new catch logged) and auto-refresh every 30s
  React.useEffect(() => { loadCatches(); }, [refreshKey]);
  React.useEffect(() => {
    const id = setInterval(loadCatches, 30000);
    return () => clearInterval(id);
  }, [loadCatches]);

  // (Re-)initialize Leaflet map when mapStyle changes
  React.useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [-33.5, 151.5],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(tileUrls[mapStyle] || tileUrls.nautical, { maxZoom: 19 }).addTo(map);
    markersLayer.current = L.layerGroup().addTo(map);
    lMap.current = map;

    // Force Leaflet to recalculate container size after paint
    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      map.remove();
      lMap.current = null;
      markersLayer.current = null;
    };
  }, [mapStyle]);

  // Rebuild markers when catches, filter, or mapStyle changes
  React.useEffect(() => {
    const L = window.L;
    const layer = markersLayer.current;
    if (!L || !layer) return;

    layer.clearLayers();

    const visible = catches.filter(c => filter === "all" || c.speciesId === filter);

    visible.forEach(c => {
      const { latitude: lat, longitude: lng } = c.location;
      const label = c.trophy ? '★' : (c.lengthCm || '?');
      const size = c.trophy ? 40 : 30;
      const bg = c.trophy ? '#0d4651' : '#c8633f';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${bg};color:#fff;
          display:flex;align-items:center;justify-content:center;
          border:2.5px solid #fff;
          font-family:monospace;font-size:${c.trophy ? 15 : 11}px;font-weight:700;
          box-shadow:0 3px 8px rgba(0,0,0,0.35);position:relative;cursor:pointer">
          ${label}
          <div style="position:absolute;bottom:-7px;left:50%;
            transform:translateX(-50%) rotate(45deg);
            width:10px;height:10px;background:${bg};
            border-right:2px solid #fff;border-bottom:2px solid #fff;z-index:-1"></div>
        </div>`,
        iconAnchor: [size / 2, size + 7],
        iconSize: [size, size + 7],
      });

      L.marker([lat, lng], { icon })
        .on('click', () => setSelectedId(c.id))
        .addTo(layer);
    });
  }, [catches, filter, mapStyle]);

  // Pan to selected catch
  React.useEffect(() => {
    if (!lMap.current) return;
    const c = catches.find(x => x.id === selectedId);
    if (c?.location?.latitude) {
      lMap.current.panTo([c.location.latitude, c.location.longitude], { animate: true });
    }
  }, [selectedId]);

  const visible = catches.filter(c => filter === "all" || c.speciesId === filter);

  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">The <em>map</em></h1>
          <div className="page-sub">{visible.length} catches · Public only · Live</div>
        </div>
        <select
          className="select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 180 }}
        >
          {speciesOptions.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div style={{ padding: "var(--gap-4) var(--gap-6) var(--gap-5)" }}>
        <div className="map-wrap">
          <div ref={mapRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />

          <div className="map-side-panel">
            <div className="hdr">
              <Ico.Pin width="14" height="14" />
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", flex: 1 }}>
                {visible.length} catches visible
              </div>
              <span className="pill solid">Live</span>
            </div>
            <div className="list">
              {visible.map(c => {
                const u = resolveUser(c.userId);
                const s = resolveSpecies(c);
                return (
                  <div
                    key={c.id}
                    className={"map-list-item " + (selectedId === c.id ? "active" : "")}
                    onClick={() => setSelectedId(c.id)}
                    onDoubleClick={() => onOpen(c.id)}
                  >
                    <div className="thumb" />
                    <div className="info">
                      <div className="ttl">{s.name} · {c.lengthCm ? `${c.lengthCm}cm` : '?'}</div>
                      <div className="meta">@{u.handle} · {c.location?.name || ''}</div>
                    </div>
                    {c.trophy ? <span className="pill accent" style={{ fontSize: 9 }}>★</span> : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="map-controls">
            <button title="Zoom in" onClick={() => lMap.current?.zoomIn()}><Ico.ZoomIn width="16" height="16" /></button>
            <button title="Zoom out" onClick={() => lMap.current?.zoomOut()}><Ico.ZoomOut width="16" height="16" /></button>
            <button title="My location" onClick={() => lMap.current?.locate({ setView: true, maxZoom: 14 })}><Ico.Locate width="16" height="16" /></button>
            <button title="Refresh catches" onClick={loadCatches}><Ico.Layers width="16" height="16" /></button>
          </div>

          <div className="map-legend">
            <span><span className="swatch" style={{ background: "var(--c-accent)" }} /> Catch</span>
            <span><span className="swatch" style={{ background: "var(--c-brand)" }} /> Trophy</span>
            <span style={{ marginLeft: 8, opacity: 0.5 }}>© OpenStreetMap</span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { MapView });
