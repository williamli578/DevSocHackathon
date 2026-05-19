// Log a Catch — single scrollable form

function LogCatch({ onClose, onSubmit }) {
  const D = window.DATA;
  const [photos, setPhotos] = React.useState([null, null, null, null]);
  const fileRefs = [React.useRef(), React.useRef(), React.useRef(), React.useRef()];
  const [speciesId, setSpeciesId] = React.useState("flathead");
  const [length, setLength] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [date, setDate] = React.useState(() => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [description, setDescription] = React.useState("");
  const [locationName, setLocationName] = React.useState("");
  const [lat, setLat] = React.useState(-33.8688);
  const [lng, setLng] = React.useState(151.2093);
  const [visibility, setVisibility] = React.useState("public");
  const [shareFeed, setShareFeed] = React.useState(true);
  const logMapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const lMapRef = React.useRef(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const searchFocusedRef = React.useRef(false);

  const reverseGeocode = async (rlat, rlng) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${rlat}&lon=${rlng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const d = await r.json();
      const a = d.address || {};
      const name = [a.suburb || a.village || a.hamlet, a.city || a.town || a.county]
        .filter(Boolean).slice(0, 2).join(', ');
      return name || d.display_name?.split(',').slice(0, 2).join(',').trim() || '';
    } catch { return ''; }
  };

  React.useEffect(() => {
    if (!logMapRef.current || !window.L) return;
    const L = window.L;
    const initLat = -33.8688, initLng = 151.2093;

    const map = L.map(logMapRef.current, {
      center: [initLat, initLng],
      zoom: 11,
      attributionControl: false,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:#c8633f;color:#fff;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,0.35);position:relative">📍<div style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%) rotate(45deg);width:10px;height:10px;background:#c8633f;border-right:2px solid #fff;border-bottom:2px solid #fff;z-index:-1"></div></div>`,
      iconAnchor: [14, 35],
      iconSize: [28, 35],
    });

    const marker = L.marker([initLat, initLng], { icon, draggable: true }).addTo(map);
    markerRef.current = marker;
    lMapRef.current = map;

    const updatePos = async (newLat, newLng) => {
      setLat(newLat);
      setLng(newLng);
      const name = await reverseGeocode(newLat, newLng);
      if (name) { setLocationName(name); setSearchQuery(name); }
    };

    marker.on('dragend', () => {
      const p = marker.getLatLng();
      updatePos(p.lat, p.lng);
    });
    map.on('click', e => {
      marker.setLatLng(e.latlng);
      updatePos(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => map.invalidateSize(), 50);
    return () => { map.remove(); markerRef.current = null; lMapRef.current = null; };
  }, []);

  const onFileSelect = async (i, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotos(prev => { const c = [...prev]; c[i] = { previewUrl, url: null, uploading: true }; return c; });
    try {
      const data = window.API ? await window.API.uploadCatchImage(file) : { imageUrl: previewUrl };
      setPhotos(prev => { const c = [...prev]; c[i] = { previewUrl, url: data.imageUrl, uploading: false }; return c; });
    } catch {
      setPhotos(prev => { const c = [...prev]; URL.revokeObjectURL(previewUrl); c[i] = null; return c; });
    }
  };

  const removePhoto = (i) => {
    setPhotos(prev => {
      const c = [...prev];
      if (c[i]?.previewUrl) URL.revokeObjectURL(c[i].previewUrl);
      c[i] = null;
      const filled = c.filter(Boolean);
      while (filled.length < 4) filled.push(null);
      return filled;
    });
  };

  // Debounced location search — only fires when the user is actively typing in the input
  React.useEffect(() => {
    if (!searchFocusedRef.current || searchQuery.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await r.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const selectSuggestion = (s) => {
    const newLat = parseFloat(s.lat);
    const newLng = parseFloat(s.lon);
    setLat(newLat);
    setLng(newLng);
    const a = s.address || {};
    const name = [a.suburb || a.village || a.hamlet, a.city || a.town || a.county]
      .filter(Boolean).slice(0, 2).join(', ') || s.display_name.split(',').slice(0, 2).join(',').trim();
    setLocationName(name);
    setSearchQuery(name);
    setSuggestions([]);
    if (markerRef.current) markerRef.current.setLatLng([newLat, newLng]);
    if (lMapRef.current) lMapRef.current.setView([newLat, newLng], 13, { animate: true });
  };

  const togglePhoto = (i) => {
    const copy = [...photos];
    copy[i] = !copy[i];
    // shift filled photos to the front
    const filled = copy.filter(Boolean);
    const empty = copy.filter((x) => !x);
    setPhotos([...filled.map(() => true), ...empty.map(() => false)]);
  };

  const speciesOpt = D.SPECIES.find((s) => s.id === speciesId);

  return (
    <React.Fragment>
      <div className="page-header">
        <div>
          <h1 className="page-title">Log a <em>catch</em></h1>
          <div className="page-sub">Private by default · Switch visibility below</div>
        </div>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
      <div className="page-body single" style={{ padding: "var(--gap-5) var(--gap-6)" }}>
        <div className="log-form">

          {/* Photos */}
          <div className="log-section">
            <h3>Photos</h3>
            <div className="help">Up to 4 · Drop, paste, or pick from device</div>
            <div className="photo-uploader">
              {photos.map((photo, i) => (
                <div key={i} className={"photo-slot " + (photo ? "filled" : "")} style={{ position: "relative", overflow: "hidden" }} onClick={() => !photo && fileRefs[i].current.click()}>
                  <input ref={fileRefs[i]} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) onFileSelect(i, e.target.files[0]); e.target.value = ""; }} />
                  {photo ? (
                    <React.Fragment>
                      <img src={photo.previewUrl} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      {photo.uploading && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Uploading…</span>
                        </div>
                      )}
                      <span className="x" onClick={e => { e.stopPropagation(); removePhoto(i); }}>×</span>
                    </React.Fragment>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <Ico.Camera width="20" height="20" />
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>Add</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Species + measurements */}
          <div className="log-section">
            <h3>The fish</h3>
            <div className="help">Species and measurements</div>

            <div className="field">
              <label>Species</label>
              <select className="select" value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
                {D.SPECIES.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.latin}</option>)}
              </select>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
                Typical {speciesOpt.typical} · {speciesOpt.region}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Length</label>
                <div className="unit-input">
                  <input className="input" type="number" placeholder="48" value={length} onChange={(e) => setLength(e.target.value)} />
                  <span className="unit">cm</span>
                </div>
              </div>
              <div className="field">
                <label>Weight</label>
                <div className="unit-input">
                  <input className="input" type="number" placeholder="1.4" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  <span className="unit">kg</span>
                </div>
              </div>
              <div className="field">
                <label>Quantity</label>
                <input className="input" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Caught at</label>
              <input className="input" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div className="log-section">
            <h3>Where</h3>
            <div className="help">Search for a spot, or click the map to pin it exactly</div>

            {/* Search with autocomplete */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <div style={{ position: "relative" }}>
                <Ico.Search width="14" height="14" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--c-muted)", pointerEvents: "none" }} />
                <input
                  className="input"
                  style={{ paddingLeft: 32 }}
                  placeholder="Search for a fishing spot…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => { searchFocusedRef.current = true; }}
                  onBlur={() => { searchFocusedRef.current = false; setTimeout(() => setSuggestions([]), 150); }}
                />
                {searching && (
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--c-muted)" }}>
                    searching…
                  </span>
                )}
              </div>
              {suggestions.length > 0 && (
                <div style={{
                  position: "absolute", zIndex: 1100, top: "100%", left: 0, right: 0, marginTop: 4,
                  background: "var(--c-surface)", border: "1px solid var(--c-line-strong)",
                  borderRadius: "var(--r-md)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden"
                }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => selectSuggestion(s)}
                      style={{
                        display: "block", width: "100%", textAlign: "left", padding: "10px 14px",
                        background: "none", border: "none",
                        borderBottom: i < suggestions.length - 1 ? "1px solid var(--c-line)" : "none",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-ink)" }}>
                        {s.display_name.split(',')[0]}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--c-muted)", fontFamily: "var(--f-mono)", marginTop: 2 }}>
                        {s.display_name.split(',').slice(1, 3).join(',').trim()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div
              ref={logMapRef}
              style={{ height: 240, borderRadius: "var(--r-md)", border: "1px solid var(--c-line)", overflow: "hidden", marginBottom: 6 }}
            />
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
          </div>

          {/* Story */}
          <div className="log-section">
            <h3>Story</h3>
            <div className="help">Optional · Gear, conditions, how it went down</div>
            <textarea
              className="textarea"
              placeholder="Caught on a soft plastic at the colour change..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Visibility */}
          <div className="log-section">
            <h3>Privacy</h3>
            <div className="help">Who can see this catch?</div>
            <div className="visibility-group">
              {[
                { id: "private", icon: Ico.EyeOff, ttl: "Private", sub: "Only you. Stays in your log." },
                { id: "friends", icon: Ico.Friends, ttl: "Friends", sub: "People you follow back." },
                { id: "public", icon: Ico.Eye, ttl: "Public", sub: "On the map and in the feed." },
              ].map((v) => (
                <button
                  key={v.id}
                  className={"vis-option " + (visibility === v.id ? "active" : "")}
                  onClick={() => setVisibility(v.id)}
                >
                  <div className="ttl"><v.icon width="14" height="14" /> {v.ttl}</div>
                  <div className="sub">{v.sub}</div>
                </button>
              ))}
            </div>
            {visibility === "public" ? (
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={shareFeed} onChange={(e) => setShareFeed(e.target.checked)} />
                Also share to the feed as a post
              </label>
            ) : null}
          </div>

          <div className="log-submit">
            <button className="btn btn-ghost" onClick={onClose}>Save draft</button>
            <button className="btn btn-primary" onClick={async () => {
              if (!window.API) { onSubmit(); return; }
              const D = window.DATA;
              const speciesOpt = D.SPECIES.find(s => s.id === speciesId);
              try {
                await window.API.logCatch({
                  speciesId,
                  speciesName: speciesOpt?.name,
                  lengthCm: length ? Number(length) : null,
                  weightKg: weight ? Number(weight) : null,
                  quantity: Number(quantity) || 1,
                  caughtAt: date || new Date().toISOString(),
                  description,
                  imageUrls: photos.filter(p => p && p.url).map(p => p.url),
                  location: { latitude: lat, longitude: lng, name: locationName },
                  visibility,
                  shareToFeed: shareFeed && visibility === 'public',
                });
              } catch (e) {
                console.error('Failed to log catch:', e);
              }
              onSubmit();
            }}>
              <Ico.Plus2 width="14" height="14" />
              Log catch
            </button>
          </div>

        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { LogCatch });
