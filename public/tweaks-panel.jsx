// Tweaks panel — floating settings UI + useTweaks hook
(function () {
  function useTweaks(defaults) {
    const [vals, setVals] = React.useState(() => {
      try {
        const saved = localStorage.getItem('fs_tweaks');
        return saved ? Object.assign({}, defaults, JSON.parse(saved)) : defaults;
      } catch (e) { return defaults; }
    });
    const setTweak = (k, v) => setVals(prev => {
      const next = Object.assign({}, prev, { [k]: v });
      localStorage.setItem('fs_tweaks', JSON.stringify(next));
      return next;
    });
    return [vals, setTweak];
  }

  function TweaksPanel({ title, children }) {
    const [open, setOpen] = React.useState(false);
    return (
      <React.Fragment>
        <button
          onClick={() => setOpen(o => !o)}
          title={title}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--c-brand)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: '38px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >⚙</button>
        {open && (
          <div style={{
            position: 'fixed', bottom: 68, right: 20, zIndex: 9999,
            width: 256, maxHeight: '72vh', overflowY: 'auto',
            background: 'var(--c-surface)', borderRadius: 12,
            boxShadow: '0 4px 28px rgba(0,0,0,0.18)',
            border: '1px solid var(--c-line)',
          }}>
            <div style={{ padding: '10px 14px 8px', fontWeight: 600, fontSize: 12,
              borderBottom: '1px solid var(--c-line)', fontFamily: 'var(--f-mono)',
              textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-muted)' }}>
              {title}
            </div>
            {children}
          </div>
        )}
      </React.Fragment>
    );
  }

  function TweakSection({ label }) {
    return (
      <div style={{ padding: '10px 14px 2px', fontFamily: 'var(--f-mono)', fontSize: 9,
        textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-muted)',
        borderTop: '1px solid var(--c-line)', marginTop: 2 }}>
        {label}
      </div>
    );
  }

  function TweakRow({ label, children }) {
    return (
      <div style={{ padding: '5px 14px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 8, fontSize: 12, color: 'var(--c-ink-2)' }}>
        <span style={{ flexShrink: 0 }}>{label}</span>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{children}</div>
      </div>
    );
  }

  function TweakRadio({ label, value, options, onChange }) {
    return (
      <TweakRow label={label}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '2px 8px', borderRadius: 99, fontSize: 11, cursor: 'pointer',
            background: value === o.value ? 'var(--c-brand)' : 'transparent',
            color: value === o.value ? '#fff' : 'var(--c-ink-2)',
            border: '1px solid ' + (value === o.value ? 'var(--c-brand)' : 'var(--c-line-strong)'),
          }}>{o.label}</button>
        ))}
      </TweakRow>
    );
  }

  function TweakSelect({ label, value, options, onChange }) {
    return (
      <TweakRow label={label}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{
          fontSize: 11, padding: '2px 4px', borderRadius: 4, maxWidth: 140,
          border: '1px solid var(--c-line-strong)', background: 'var(--c-surface)',
          color: 'var(--c-ink)', cursor: 'pointer',
        }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </TweakRow>
    );
  }

  function TweakToggle({ label, value, onChange }) {
    return (
      <TweakRow label={label}>
        <button onClick={() => onChange(!value)} style={{
          width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer',
          background: value ? 'var(--c-brand)' : 'var(--c-line-strong)',
          position: 'relative', transition: 'background 0.15s', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: 2, left: value ? 16 : 2,
            width: 14, height: 14, borderRadius: '50%',
            background: '#fff', transition: 'left 0.15s',
          }} />
        </button>
      </TweakRow>
    );
  }

  function TweakColor({ label, value, options, onChange }) {
    return (
      <TweakRow label={label}>
        {options.map((palette, i) => {
          const active = JSON.stringify(value) === JSON.stringify(palette);
          return (
            <button key={i} onClick={() => onChange(palette)} title={'Palette ' + (i + 1)} style={{
              width: 18, height: 18, borderRadius: '50%', border: active
                ? '2px solid var(--c-ink)'
                : '2px solid transparent',
              background: palette[0], cursor: 'pointer', padding: 0, outline: 'none',
            }} />
          );
        })}
      </TweakRow>
    );
  }

  function TweakButton({ label, onClick }) {
    return (
      <div style={{ padding: '4px 14px 6px' }}>
        <button onClick={onClick} style={{
          width: '100%', padding: '5px 0', borderRadius: 6, cursor: 'pointer',
          border: '1px solid var(--c-line-strong)', background: 'transparent',
          fontSize: 11, color: 'var(--c-ink-2)', fontFamily: 'var(--f-mono)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{label}</button>
      </div>
    );
  }

  Object.assign(window, {
    useTweaks, TweaksPanel, TweakSection,
    TweakRadio, TweakSelect, TweakToggle, TweakColor, TweakButton,
  });
})();
