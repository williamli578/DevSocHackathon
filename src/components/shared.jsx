// Shared primitives + icons

const Ico = {
  Feed: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7h18M3 12h18M3 17h12"/></svg>,
  Map: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z M9 4v14 M15 6v14"/></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  User: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/></svg>,
  Trophy: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 4h10v5a5 5 0 01-10 0V4z M5 5H3a3 3 0 003 3 M19 5h2a3 3 0 01-3 3 M9 19h6 M12 14v5"/></svg>,
  Badge: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="10" r="5"/><path d="M9 14l-2 7 5-3 5 3-2-7"/></svg>,
  Bell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2z M10 20a2 2 0 004 0"/></svg>,
  Search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  Heart: (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20s-7-4.5-9-9.5C1.7 6.3 4.5 3 8 3c1.8 0 3.2 1 4 2 .8-1 2.2-2 4-2 3.5 0 6.3 3.3 5 7.5-2 5-9 9.5-9 9.5z"/></svg>,
  HeartO: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20s-7-4.5-9-9.5C1.7 6.3 4.5 3 8 3c1.8 0 3.2 1 4 2 .8-1 2.2-2 4-2 3.5 0 6.3 3.3 5 7.5-2 5-9 9.5-9 9.5z"/></svg>,
  Comment: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5h16v11H8l-4 4V5z"/></svg>,
  Share: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12v7h16v-7 M16 6l-4-3-4 3 M12 3v13"/></svg>,
  Bookmark: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 4h12v17l-6-4-6 4V4z"/></svg>,
  Ellipsis: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>,
  Close: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  Pin: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Camera: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 8h3l2-3h6l2 3h3v12H4V8z"/><circle cx="12" cy="13" r="4"/></svg>,
  Eye: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3l18 18 M10.5 6.3A10 10 0 0112 6c6.5 0 10 7 10 7a16 16 0 01-3.4 4.3 M6.4 8.4A16 16 0 002 12s3.5 7 10 7c1.6 0 3-.3 4.3-.8 M9.5 9.5a3 3 0 004 4"/></svg>,
  Friends: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="9" r="3"/><circle cx="17" cy="11" r="2.5"/><path d="M3 19c1-3 3.5-5 6-5s5 2 6 5 M14 19c1-2 2-3 3-3s2.5 1 3 3"/></svg>,
  Fish: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12c2-4 6-6 10-6 4 0 6 2 8 6-2 4-4 6-8 6-4 0-8-2-10-6z M19 8l3-2v12l-3-2 M9 12h.01"/></svg>,
  Plus2: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Send: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l18-8-7 18-3-7-8-3z"/></svg>,
  Message: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a8 8 0 01-12.5 6.6L3 20l1.4-5.5A8 8 0 1121 12z"/></svg>,
  Community: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c1-3.5 3.5-5.5 6-5.5s5 2 6 5.5 M14 19c.6-2 1.8-3 3-3s2.5 1 3 3"/></svg>,
  Info: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7.5h.01 M11 11h1v6h1"/></svg>,
  Phone: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/></svg>,
  Image: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M3 17l5-5 5 5 3-3 5 5"/></svg>,
  Smile: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01 M8 14a5 5 0 008 0"/></svg>,
  ZoomIn: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M5 12h14M12 5v14"/></svg>,
  ZoomOut: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M5 12h14"/></svg>,
  Layers: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5 M3 17l9 5 9-5"/></svg>,
  Locate: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>,
};

// Generated placeholder image (striped) with a label
function PhotoPlaceholder({ label, seed = 0, dark = false }) {
  const hues = [196, 205, 188, 32, 18, 145];
  const h = hues[seed % hues.length];
  const bg1 = `hsl(${h} 18% ${dark ? 22 : 78}%)`;
  const bg2 = `hsl(${h} 22% ${dark ? 16 : 70}%)`;
  return (
    <div
      className="placeholder"
      style={{
        background: `repeating-linear-gradient(135deg, ${bg1} 0 14px, ${bg2} 14px 28px)`,
      }}
    >
      <span>{label}</span>
    </div>
  );
}

function Avatar({ user, size = "md" }) {
  if (!user) return null;
  const cls = size === "lg" ? "avatar lg" : size === "xl" ? "avatar xl" : size === "sm" ? "avatar sm" : "avatar";
  const initial = user.initial || (user.username || user.name || '?')[0]?.toUpperCase() || '?';
  return <div className={cls}>{initial}</div>;
}

function VisibilityIcon({ visibility }) {
  if (visibility === "private") return <Ico.EyeOff width="12" height="12" />;
  if (visibility === "friends") return <Ico.Friends width="12" height="12" />;
  return <Ico.Eye width="12" height="12" />;
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return n.toString();
}

Object.assign(window, { Ico, PhotoPlaceholder, Avatar, VisibilityIcon, timeAgo, formatNum });
