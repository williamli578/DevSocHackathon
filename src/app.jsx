// App root + tweaks integration

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "palette": "coastal",
  "fonts": "serif-sans",
  "density": "comfy",
  "showStats": true,
  "mapStyle": "nautical"
}/*EDITMODE-END*/;

function App() {
  const [authed, setAuthed] = React.useState(false);
  const [route, setRoute] = React.useState("feed");
  const [openId, setOpenId] = React.useState(null);
  const [likes, setLikes] = React.useState({ c_4: true });
  const tweaks = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const t = tweaks[0];
  const setTweak = tweaks[1];

  // Apply tweaks to root
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", t.theme);
    html.setAttribute("data-palette", t.palette);
    html.setAttribute("data-fonts", t.fonts);
    html.setAttribute("data-density", t.density);
  }, [t.theme, t.palette, t.fonts, t.density]);

  const onLike = (id) => setLikes({ ...likes, [id]: !likes[id] });
  const viewer = window.DATA.userById("u_you");
  const unread = window.DATA.NOTIFICATIONS.filter(n => n.unread).length;

  if (!authed) {
    return (
      <React.Fragment>
        <Auth onComplete={() => setAuthed(true)} />
        <TweaksControls t={t} setTweak={setTweak} />
      </React.Fragment>
    );
  }

  let content;
  if (route === "feed") {
    content = <Feed density={t.density} showStats={t.showStats} onOpen={setOpenId} likes={likes} onLike={onLike} onSetRoute={setRoute} />;
  } else if (route === "map") {
    content = <MapView mapStyle={t.mapStyle} onOpen={setOpenId} />;
  } else if (route === "log") {
    content = <LogCatch onClose={() => setRoute("feed")} onSubmit={() => setRoute("feed")} />;
  } else if (route === "profile") {
    content = <Profile onOpen={setOpenId} showStats={t.showStats} density={t.density} />;
  } else if (route === "leaderboard") {
    content = <Leaderboard />;
  } else if (route === "badges") {
    content = <Badges />;
  } else if (route === "notifications") {
    content = <Notifications onOpen={setOpenId} onSetRoute={setRoute} />;
  } else if (route === "search") {
    content = <Search onOpen={setOpenId} onSetRoute={setRoute} />;
  } else if (route === "communities") {
    content = <Communities onOpen={setOpenId} density={t.density} showStats={t.showStats} likes={likes} onLike={onLike} onSetRoute={setRoute} />;
  } else if (route === "messages") {
    content = <Messages onOpen={setOpenId} />;
  }

  return (
    <React.Fragment>
      <div className="app-shell">
        <Sidebar
          route={route}
          setRoute={setRoute}
          onLog={() => setRoute("log")}
          unread={unread}
          viewer={viewer}
        />
        <main className="main-canvas">{content}</main>
      </div>
      {openId ? (
        <Detail
          catchId={openId}
          onClose={() => setOpenId(null)}
          liked={!!likes[openId]}
          onLike={onLike}
        />
      ) : null}
      <TweaksControls t={t} setTweak={setTweak} authed={authed} setAuthed={setAuthed} />
    </React.Fragment>
  );
}

const PALETTES = {
  coastal: ["#0d4651", "#c8633f", "#efe7d5"],
  reef:    ["#2d5e3a", "#d97757", "#e8efe6"],
  dusk:    ["#5b3754", "#c89a44", "#ece5dd"],
  abyss:   ["#14334d", "#d9844a", "#e3e7eb"],
};
const PALETTE_NAMES = Object.keys(PALETTES);

function TweaksControls({ t, setTweak, authed, setAuthed }) {
  if (!window.TweaksPanel) return null;
  const { TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakToggle, TweakColor, TweakButton } = window;
  const paletteOptions = PALETTE_NAMES.map((k) => PALETTES[k]);
  const currentPalette = PALETTES[t.palette] || paletteOptions[0];
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <TweakRadio
        label="Mode"
        value={t.theme}
        options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
        onChange={(v) => setTweak("theme", v)}
      />
      <TweakColor
        label="Palette"
        value={currentPalette}
        options={paletteOptions}
        onChange={(arr) => {
          const name = PALETTE_NAMES.find((k) => JSON.stringify(PALETTES[k]) === JSON.stringify(arr));
          if (name) setTweak("palette", name);
        }}
      />

      <TweakSection label="Type" />
      <TweakSelect
        label="Pairing"
        value={t.fonts}
        options={[
          { value: "serif-sans", label: "Instrument Serif + Geist" },
          { value: "all-sans", label: "Geist only" },
          { value: "editorial", label: "DM Serif + Libre Caslon" },
          { value: "modern", label: "Funnel Display + Sans" },
        ]}
        onChange={(v) => setTweak("fonts", v)}
      />

      <TweakSection label="Layout" />
      <TweakRadio
        label="Density"
        value={t.density}
        options={[
          { value: "compact", label: "Compact" },
          { value: "comfy", label: "Comfy" },
          { value: "spacious", label: "Spacious" },
        ]}
        onChange={(v) => setTweak("density", v)}
      />
      <TweakToggle
        label="Show stats on cards"
        value={t.showStats}
        onChange={(v) => setTweak("showStats", v)}
      />

      <TweakSection label="Map" />
      <TweakSelect
        label="Style"
        value={t.mapStyle}
        options={[
          { value: "nautical", label: "Nautical chart" },
          { value: "satellite", label: "Satellite" },
          { value: "minimal", label: "Minimal grid" },
        ]}
        onChange={(v) => setTweak("mapStyle", v)}
      />

      <TweakSection label="Demo" />
      <TweakButton
        label={authed ? "Show auth screen" : "Sign in"}
        onClick={() => setAuthed && setAuthed(!authed)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
