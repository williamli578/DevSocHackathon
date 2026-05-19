// Log a Catch — single scrollable form

function LogCatch({ onClose, onSubmit }) {
  const D = window.DATA;
  const [photos, setPhotos] = React.useState([true, false, false, false]);
  const [speciesId, setSpeciesId] = React.useState("flathead");
  const [length, setLength] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 16));
  const [description, setDescription] = React.useState("");
  const [locationName, setLocationName] = React.useState("Cronulla, Bate Bay");
  const [visibility, setVisibility] = React.useState("public");
  const [shareFeed, setShareFeed] = React.useState(true);

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
              {photos.map((filled, i) => (
                <div key={i} className={"photo-slot " + (filled ? "filled" : "")} onClick={() => togglePhoto(i)}>
                  {filled ? (
                    <span className="x" onClick={(e) => { e.stopPropagation(); togglePhoto(i); }}>×</span>
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
            <div className="help">Drop a pin or search a spot</div>
            <div className="field">
              <label>Location name</label>
              <input className="input" placeholder="Cronulla, Bate Bay" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
            </div>
            <div style={{
              height: 160,
              background: "linear-gradient(180deg,#b9d4d3,#a9c8c9)",
              backgroundImage: "radial-gradient(ellipse at 60% 50%, rgba(193,162,109,0.6), transparent 35%)",
              borderRadius: "var(--r-md)",
              position: "relative",
              border: "1px solid var(--c-line)"
            }}>
              <div className="pin" style={{ left: "55%", top: "50%" }}>
                <div className="pin-dot" style={{ width: 24, height: 24, fontSize: 10 }}>NEW</div>
              </div>
              <span style={{
                position: "absolute", bottom: 8, left: 10,
                fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--c-ink)", opacity: 0.7,
                textTransform: "uppercase", letterSpacing: "0.08em"
              }}>
                -34.052, 151.152 · Approximate
              </span>
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
                  location: { latitude: -34.052, longitude: 151.152, name: locationName },
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
