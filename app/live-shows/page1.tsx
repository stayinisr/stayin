"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/LanguageContext";
import { useToast } from "../../components/ToastProvider";

// ── Types ─────────────────────────────────────────────────────────────────────
type Artist  = { id: string; name: string; name_he: string | null };
type Venue   = { id: string; name: string; city: string; city_he: string | null };
type Concert = {
  id: string;
  artist_id: string;
  venue_id: string;
  concert_date: string;
  concert_time: string | null;
  status: string;
};
type ConcertListing = {
  id: string;
  concert_id: string;
  price: number;
  type: string;
  quantity: number;
  status: string;
  expires_at: string | null;
  archived_at: string | null;
};

// ── Colors — same as WC/IL pages ─────────────────────────────────────────────
const C = {
  purple: "#8338ec",
  purpleSoft: "rgba(131,56,236,0.07)",
  purpleBorder: "rgba(131,56,236,0.18)",
  navy:   "#1a3a8f",
  red:    "#e63946",
  teal:   "#1abfb0",
  bg:     "#f8f9fc",
  white:  "#ffffff",
  border: "#e8edf5",
  text:   "#0d1b3e",
  muted:  "#64748b",
  hint:   "#94a3b8",
  faint:  "#cbd5e1",
} as const;

const ACCENTS = [C.purple, C.navy, C.red, C.teal];

const fHe   = "var(--font-he,'Heebo',sans-serif)";
const fEn   = "var(--font-dm,'DM Sans',sans-serif)";
const fSyne = "var(--font-syne,'Syne',sans-serif)";
function fBody(isHe: boolean) { return isHe ? fHe : fEn; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d: string, isHe: boolean) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(isHe ? "he-IL" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isActiveL(l: ConcertListing) {
  return l.status === "active" && !l.archived_at && (!l.expires_at || new Date(l.expires_at) > new Date());
}

// ── Card ──────────────────────────────────────────────────────────────────────
function ConcertCard({
  concert, artist, venue, sell, buy, priceRange, saved, onSave, isHe, idx,
}: {
  concert: Concert; artist: Artist | undefined; venue: Venue | undefined;
  sell: number; buy: number; priceRange: string | null;
  saved: boolean; onSave: (id: string) => void; isHe: boolean; idx: number;
}) {
  const [hov, setHov] = useState(false);
  const accent = ACCENTS[idx % ACCENTS.length];

  return (
    <Link
      href={`/live-shows/${concert.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          background: hov ? "rgba(248,249,252,0.9)" : "rgba(255,255,255,0.75)",
          transition: "background 120ms",
          position: "relative",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* Accent bar */}
        <div style={{ height: "2px", background: accent }} />

        <div style={{ padding: "20px" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.faint }}>
                {isHe ? "הופעה" : "Show"}
              </span>
              {sell + buy >= 5 && (
                <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px", background: "rgba(230,57,70,0.08)", color: C.red, border: "1px solid rgba(230,57,70,0.2)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                  🔥 Hot
                </span>
              )}
            </div>
            <button
              onClick={e => { e.preventDefault(); onSave(concert.id); }}
              style={{ width: "26px", height: "26px", border: `1px solid ${saved ? "rgba(230,57,70,0.35)" : C.border}`, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: saved ? C.red : C.faint, background: saved ? "rgba(230,57,70,0.06)" : "transparent", cursor: "pointer", transition: "all 150ms", flexShrink: 0 }}
            >
              {saved ? "♥" : "♡"}
            </button>
          </div>

          {/* Artist */}
          <div style={{ fontFamily: fSyne, fontSize: "17px", fontWeight: 800, letterSpacing: "-0.3px", color: C.text, marginBottom: "6px", lineHeight: 1.1 }}>
            {isHe ? (artist?.name_he || artist?.name) : artist?.name}
          </div>

          {/* Meta */}
          <div style={{ fontSize: "11px", color: C.hint, lineHeight: 1.7, marginBottom: "16px" }}>
            {venue?.name}{venue ? " · " : ""}{isHe ? venue?.city_he : venue?.city}
            <br />
            {formatDate(concert.concert_date, isHe)}{concert.concert_time ? ` · ${concert.concert_time.slice(0, 5)}` : ""}
          </div>

          {/* Footer */}
          {sell === 0 && buy === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 14px", border: `1px solid ${C.border}`, borderRadius: "3px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.purple }}>
              + {isHe ? "היה הראשון לפרסם" : "Be first to post"}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: fSyne, fontSize: "14px", fontWeight: 800, color: priceRange ? C.navy : C.faint, letterSpacing: "-0.2px" }}>
                {priceRange || "—"}
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                {sell > 0 && <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: C.purpleSoft, color: C.purple }}>{sell} {isHe ? "מכירה" : "sell"}</span>}
                {buy > 0 && <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#f1f5f9", color: C.hint }}>{buy} {isHe ? "קנייה" : "buy"}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LiveShowsPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const toast = useToast();

  const [artists,  setArtists]  = useState<Artist[]>([]);
  const [venues,   setVenues]   = useState<Venue[]>([]);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [listings, setListings] = useState<ConcertListing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saved,    setSaved]    = useState<Set<string>>(new Set());
  const [pulse,    setPulse]    = useState(false);

  const [query,      setQuery]      = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [venueFilter,  setVenueFilter]  = useState("");
  const [dateFilter,   setDateFilter]   = useState("");
  const [savedOnly,  setSavedOnly]  = useState(false);
  const [withListings, setWithListings] = useState(false);

  useEffect(() => {
    try { setSaved(new Set(JSON.parse(localStorage.getItem("saved_concerts") || "[]"))); } catch {}
    load();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setIsLoggedIn(!!s?.user));
    const ch = supabase.channel("concerts-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "concert_listings" }, () => {
        setPulse(true); setTimeout(() => setPulse(false), 1200);
        load();
      }).subscribe();
    return () => { subscription.unsubscribe(); ch.unsubscribe(); };
  }, []);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: a }, { data: v }, { data: c }, { data: l }] = await Promise.all([
      supabase.from("artists").select("id,name,name_he").order("name"),
      supabase.from("venues").select("id,name,city,city_he").order("name"),
      supabase.from("concerts").select("*").eq("status", "active").gte("concert_date", today).order("concert_date"),
      supabase.from("concert_listings").select("id,concert_id,price,type,quantity,status,expires_at,archived_at").eq("status", "active").is("archived_at", null),
    ]);
    setArtists((a || []) as Artist[]);
    setVenues((v || []) as Venue[]);
    setConcerts((c || []) as Concert[]);
    setListings((l || []) as ConcertListing[]);
    setLoading(false);
  }

  const toggleSave = useCallback((id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("saved_concerts", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const artistMap  = useMemo(() => Object.fromEntries(artists.map(a => [a.id, a])), [artists]);
  const venueMap   = useMemo(() => Object.fromEntries(venues.map(v => [v.id, v])), [venues]);

  function getSell(id: string)  { return listings.filter(l => l.concert_id === id && l.type === "sell" && isActiveL(l)).length; }
  function getBuy(id: string)   { return listings.filter(l => l.concert_id === id && l.type === "buy"  && isActiveL(l)).length; }
  function getPrice(id: string) {
    const prices = listings.filter(l => l.concert_id === id && l.type === "sell" && isActiveL(l)).map(l => Number(l.price)).filter(Boolean);
    if (!prices.length) return null;
    const mn = Math.min(...prices), mx = Math.max(...prices);
    return mn === mx ? `₪${mn}` : `₪${mn}–₪${mx}`;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return concerts.filter(c => {
      if (savedOnly && !saved.has(c.id)) return false;
      if (withListings && listings.filter(l => l.concert_id === c.id && isActiveL(l)).length === 0) return false;
      if (artistFilter && c.artist_id !== artistFilter) return false;
      if (venueFilter  && c.venue_id  !== venueFilter)  return false;
      if (dateFilter   && c.concert_date !== dateFilter) return false;
      if (q) {
        const a = artistMap[c.artist_id];
        const v = venueMap[c.venue_id];
        const text = [a?.name, a?.name_he, v?.name, v?.city, v?.city_he, c.concert_date].join(" ").toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [concerts, listings, query, artistFilter, venueFilter, dateFilter, savedOnly, withListings, saved, artistMap, venueMap]);

  const activeCount = listings.filter(isActiveL).length;
  const W: React.CSSProperties = { maxWidth: "1100px", margin: "0 auto", padding: "0 16px" };
  const smallCaps: React.CSSProperties = { fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.hint };

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: fBody(isHe) }}>
      <style>{`
        @keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}
        .sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:2px;}
        @media(max-width:640px){.hero-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Top bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.purple} 33.3%,${C.red} 33.3% 66.6%,${C.teal} 66.6%)` }} />

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(135deg,#f3eeff 0%,#fff0f8 50%,#edfff8 100%)", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        {[
          { w: 360, t: -100, r: -60,   c: "rgba(131,56,236,.08)" },
          { w: 280, b: -80,  l: -40,   c: "rgba(230,57,70,.06)"  },
          { w: 220, t: 30,   r: "28%", c: "rgba(26,191,176,.05)" },
        ].map((b, i) => (
          <div key={i} style={{ position: "absolute", width: b.w, height: b.w, borderRadius: "50%", background: `radial-gradient(circle,${b.c},transparent 70%)`, top: (b as any).t, bottom: (b as any).b, left: (b as any).l, right: (b as any).r, pointerEvents: "none" }} />
        ))}

        <div style={{ ...W, paddingTop: "44px", paddingBottom: "40px" }}>
          {/* Label */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "22px", ...smallCaps }}>
            <span style={{ display: "flex", gap: "4px" }}>
              {[C.purple, C.red, C.teal].map(c => <span key={c} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, display: "inline-block" }} />)}
            </span>
            {isHe ? "הופעות חיות · פסטיבלים · אמנים" : "Live Shows · Festivals · Artists"}
          </div>

          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center" }}>
            <div>
              {isHe ? (
                <h1 style={{ fontFamily: fHe, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.5px", marginBottom: "18px" }}>
                  <span style={{ color: C.purple }}>הופעות </span><span style={{ color: C.red }}>חיות.</span>
                  <br />
                  <span style={{ color: C.teal }}>ישירות </span><span style={{ color: C.purple }}>אליך.</span>
                </h1>
              ) : (
                <h1 style={{ fontFamily: fSyne, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em", marginBottom: "18px" }}>
                  <span style={{ color: C.purple }}>LIVE </span><span style={{ color: C.red }}>SHOWS.</span>
                  <br />
                  <span style={{ color: C.teal }}>DIRECT </span><span style={{ color: C.purple }}>TO YOU.</span>
                </h1>
              )}

              <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.8, maxWidth: "420px", marginBottom: "28px", fontFamily: fBody(isHe) }}>
                {isHe
                  ? "כרטיסים להופעות ופסטיבלים — ישירות בין מוכר לקונה. בלי עמלות, בלי תיווך."
                  : "Tickets to concerts and festivals — directly between buyer and seller. No fees, no middlemen."}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" as const }}>
                <a href="#shows" style={{ padding: "12px 24px", background: "transparent", color: C.purple, fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none", border: `2px solid ${C.purple}`, transition: "all 150ms" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.purple; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.purple; }}
                >
                  {isHe ? "צפה בהופעות ↓" : "Browse shows ↓"}
                </a>
                {isLoggedIn && (
                  <Link href="/post-listing?type=concert" style={{ padding: "12px 22px", border: `1px solid ${C.border}`, color: C.muted, fontSize: "13px", fontWeight: 500, borderRadius: "4px", textDecoration: "none", background: C.white, transition: "border-color 150ms,color 150ms" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.purple; (e.currentTarget as HTMLElement).style.color = C.purple; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; }}
                  >
                    {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                  </Link>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
              {[
                { val: loading ? "–" : String(concerts.length), lbl: isHe ? "הופעות" : "Shows",         color: C.purple },
                { val: loading ? "–" : String(activeCount),     lbl: isHe ? "מודעות פעילות" : "Live listings", color: C.text, live: true },
                { val: "WA",                                     lbl: isHe ? "קשר ישיר" : "Direct contact", color: C.teal },
              ].map((s, i) => (
                <div key={i} style={{ background: "transparent", padding: "18px 14px", textAlign: "center" as const }}>
                  <div style={{ fontFamily: fSyne, fontSize: "22px", fontWeight: 800, color: s.color, letterSpacing: "-0.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    {s.val}
                    {(s as any).live && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: pulse ? "#34d399" : "#22c55e", display: "inline-block", transition: "background 400ms" }} />}
                  </div>
                  <div style={{ ...smallCaps, marginTop: "4px" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div id="shows" style={{ ...W, paddingTop: "24px" }}>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.8)", borderRadius: "4px", marginBottom: "10px", backdropFilter: "blur(8px)" }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = C.purple)}
          onBlurCapture={e => (e.currentTarget.style.borderColor = C.border)}
        >
          <span style={{ padding: "0 14px", fontSize: "16px", color: C.faint }}>⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder={isHe ? "חיפוש אמן, מקום, עיר..." : "Search artist, venue, city..."}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "13px", padding: "12px 0", fontFamily: fBody(isHe) }}
          />
          {query && <button onClick={() => setQuery("")} style={{ padding: "0 14px", background: "none", border: "none", color: C.hint, cursor: "pointer", fontSize: "14px" }}>✕</button>}
        </div>

        {/* Dropdowns */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" as const }}>
          <select value={artistFilter} onChange={e => setArtistFilter(e.target.value)}
            style={{ padding: "7px 12px", border: `1px solid ${artistFilter ? C.purple : C.border}`, borderRadius: "4px", fontSize: "12px", background: C.white, color: artistFilter ? C.purple : C.muted, outline: "none", cursor: "pointer", fontFamily: fBody(isHe) }}
          >
            <option value="">{isHe ? "כל האמנים" : "All artists"}</option>
            {artists.map(a => <option key={a.id} value={a.id}>{isHe ? (a.name_he || a.name) : a.name}</option>)}
          </select>

          <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)}
            style={{ padding: "7px 12px", border: `1px solid ${venueFilter ? C.purple : C.border}`, borderRadius: "4px", fontSize: "12px", background: C.white, color: venueFilter ? C.purple : C.muted, outline: "none", cursor: "pointer", fontFamily: fBody(isHe) }}
          >
            <option value="">{isHe ? "כל המקומות" : "All venues"}</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name} · {isHe ? v.city_he : v.city}</option>)}
          </select>

          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            style={{ padding: "7px 12px", border: `1px solid ${dateFilter ? C.purple : C.border}`, borderRadius: "4px", fontSize: "12px", background: C.white, color: dateFilter ? C.purple : C.muted, outline: "none", cursor: "pointer" }}
          />

          {(artistFilter || venueFilter || dateFilter) && (
            <button onClick={() => { setArtistFilter(""); setVenueFilter(""); setDateFilter(""); }}
              style={{ padding: "0 12px", background: "none", border: `1px solid ${C.border}`, borderRadius: "4px", color: C.hint, cursor: "pointer", fontSize: "12px" }}>✕</button>
          )}
        </div>

        {/* Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", flexWrap: "wrap" as const }}>
          <button onClick={() => setSavedOnly(p => !p)}
            style={{ padding: "5px 14px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, border: `1px solid ${savedOnly ? "rgba(230,57,70,0.4)" : C.border}`, color: savedOnly ? C.red : C.hint, background: savedOnly ? "rgba(230,57,70,0.05)" : C.white, cursor: "pointer", borderRadius: "3px", transition: "all 150ms" }}>
            ♥ {isHe ? "שמורים" : "Saved"}{saved.size > 0 && ` (${saved.size})`}
          </button>

          <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", cursor: "pointer", userSelect: "none" as const }}>
            <span onClick={() => setWithListings(p => !p)} style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, border: `1.5px solid ${withListings ? C.purple : C.border}`, background: withListings ? C.purple : C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 150ms" }}>
              {withListings && <span style={{ color: "#fff", fontSize: "10px", fontWeight: 800, lineHeight: 1 }}>✓</span>}
            </span>
            <span onClick={() => setWithListings(p => !p)} style={{ fontSize: "11px", fontWeight: 600, color: withListings ? C.purple : C.hint, transition: "color 150ms", whiteSpace: "nowrap" as const }}>
              {isHe ? "רק עם מודעות" : "Only with listings"}
            </span>
          </label>

          <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.hint }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: pulse ? "#34d399" : "#22c55e", display: "inline-block", transition: "background 400ms" }} />
            {isHe ? "מתעדכן חי" : "Live updates"}
            {!loading && <span style={{ color: C.purple, fontWeight: 600 }}>· {filtered.length} {isHe ? "הופעות" : "shows"}</span>}
          </div>
        </div>

        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={smallCaps}>{isHe ? "הופעות" : "Shows"}</span>
          <span style={{ fontSize: "11px", color: C.purple, fontWeight: 600 }}>{activeCount} {isHe ? "מודעות פעילות" : "active listings"} ●</span>
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={W}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: C.white, padding: "20px" }}>
                <div style={{ height: "2px", background: ACCENTS[(i-1)%4], marginBottom: "16px", marginInline: "-20px", marginTop: "-20px" }} />
                {[60,120,80,50].map((w,j) => <div key={j} className="sk" style={{ height: "12px", width: `${w}%`, marginBottom: "12px" }} />)}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" as const, background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{savedOnly ? "♡" : "🎵"}</div>
            <p style={{ fontSize: "14px", color: C.muted, marginBottom: "4px" }}>
              {savedOnly ? (isHe ? "אין הופעות שמורות" : "No saved shows") : (isHe ? "לא נמצאו הופעות" : "No shows found")}
            </p>
            <p style={{ fontSize: "12px", color: C.hint }}>
              {savedOnly ? (isHe ? "לחץ על ♡ בכרטיס" : "Tap ♡ on any card") : (isHe ? "נסה לשנות פילטרים" : "Try changing filters")}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
            {filtered.map((concert, i) => (
              <ConcertCard key={concert.id} concert={concert} artist={artistMap[concert.artist_id]} venue={venueMap[concert.venue_id]}
                sell={getSell(concert.id)} buy={getBuy(concert.id)} priceRange={getPrice(concert.id)}
                saved={saved.has(concert.id)} onSave={toggleSave} isHe={isHe} idx={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── INFO STRIP ── */}
      <div style={{ ...W, marginTop: "28px", paddingBottom: "52px" }}>
        <div style={{ borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
          <div style={{ background: C.purple, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: fSyne, fontSize: "13px", fontWeight: 700, color: "#fff" }}>{isHe ? "הופעות חיות" : "Live Shows"}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", marginTop: "2px" }}>{isHe ? "כרטיסים ישירות בין אנשים · ללא עמלות" : "Tickets directly between people · No fees"}</div>
            </div>
            <Link href="/post-listing?type=concert" style={{ fontSize: "12px", fontWeight: 700, color: "#fff", background: "rgba(255,255,255,.15)", padding: "8px 16px", borderRadius: "4px", border: "1px solid rgba(255,255,255,.2)", textDecoration: "none", whiteSpace: "nowrap" as const }}>
              {isHe ? "+ פרסם מודעה" : "+ Post listing"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
