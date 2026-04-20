"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";
import { getTeamLogo } from "../../../lib/teamLogos";

// ── Types ─────────────────────────────────────────────────────────────────────
type Competition = "ligat_haal" | "state_cup";

type ILMatch = {
  id: string;
  competition: Competition;
  round: string;
  round_en: string;
  home_team: string;
  away_team: string;
  home_team_en: string;
  away_team_en: string;
  stadium: string | null;
  stadium_en: string | null;
  city: string | null;
  city_en: string | null;
  match_date: string;
  match_time: string | null;
  status: string;
};

type ListingItem = {
  id?: string;
  israeli_match_id: string;
  price: number;
  type: string;
  status?: string;
  expires_at?: string | null;
  archived_at?: string | null;
};

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  blue:   "#1a3a8f",
  green:  "#006847",
  teal:   "#1abfb0",
  bg:     "#f8f9fc",
  white:  "#ffffff",
  border: "#e8edf5",
  text:   "#0d1b3e",
  muted:  "#64748b",
  hint:   "#94a3b8",
  faint:  "#cbd5e1",
  red:    "#e63946",
} as const;

const ACCENTS = [C.blue, C.green, C.teal];

const TEAM_COLORS: Record<string, string> = {
  "מכבי תל אביב":       "#FDE400",
  "מכבי חיפה":          "#007B40",
  "הפועל תל אביב":      "#E63946",
  "הפועל באר שבע":      "#C0392B",
  'בית"ר ירושלים':      "#FFCE00",
  "הפועל ירושלים":      "#E67E22",
  "הפועל חיפה":         "#E63946",
  "הפועל פתח תקוה":     "#E63946",
  "מכבי נתניה":         "#F4C430",
  "בני סכנין":          "#006400",
  "מכבי בני ריינה":     "#FDE400",
  "מ.ס. אשדוד":         "#1a3a8f",
  "עירוני טבריה":       "#9B59B6",
  "עירוני קריית שמונה": "#6B2D8B",
  "בני יהודה תל אביב":  "#E63946",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function isActiveL(l: ListingItem) {
  return l.status === "active" && (!l.expires_at || new Date(l.expires_at) > new Date());
}

function useCountdown(date: string, time: string | null, isHe: boolean) {
  const [left, setLeft] = useState<string | null>(null);
  useEffect(() => {
    const t = (time || "20:00").slice(0, 5);
    const target = new Date(`${date}T${t}:00`);
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setLeft(null); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLeft(isHe
        ? (d > 0 ? `${d}י ${h}ש` : `${h}ש ${m}ד`)
        : (d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`));
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date, time, isHe]);
  return left;
}

function TeamLogo({ name, size = 24 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const src = getTeamLogo(name);
  const color = TEAM_COLORS[name] ?? C.hint;
  if (err || !src) {
    return (
      <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `${color}22`, border: `1.5px solid ${color}55`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color, fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
        {name.slice(0, 1)}
      </span>
    );
  }
  return <Image src={src} alt={name} width={size} height={size} style={{ objectFit: "contain", flexShrink: 0 }} onError={() => setErr(true)} />;
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, idx, sell, buy, priceRange, hot, saved, onSave, isHe }: {
  match: ILMatch; idx: number; sell: number; buy: number;
  priceRange: string | null; hot: boolean; saved: boolean;
  onSave: (id: string) => void; isHe: boolean;
}) {
  const accent   = ACCENTS[idx % 3];
  const countdown = useCountdown(match.match_date, match.match_time, isHe);
  const [hov, setHov] = useState(false);
  const isCup = match.competition === "state_cup";

  return (
    <div
      style={{ background: hov ? "rgba(248,249,252,0.9)" : "rgba(255,255,255,0.75)", transition: "background 120ms", position: "relative" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ height: "2px", background: accent }} />
      <div style={{ padding: "20px" }}>

        {/* Row 1: badges + save */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.faint }}>
              {isHe ? match.round : match.round_en}
            </span>
            {isCup && (
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: "3px", background: "rgba(212,160,23,0.1)", color: "#b8860b", border: "1px solid rgba(212,160,23,0.25)" }}>
                {isHe ? "גביע" : "Cup"}
              </span>
            )}
            {hot && (
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: "3px", background: "rgba(230,57,70,0.08)", color: C.red, border: "1px solid rgba(230,57,70,0.2)" }}>
                🔥 {isHe ? "חם" : "Hot"}
              </span>
            )}
            {countdown && (
              <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px", background: "rgba(26,58,143,0.07)", color: C.blue, border: "1px solid rgba(26,58,143,0.15)" }}>
                {countdown}
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onSave(match.id); }}
            style={{ width: "26px", height: "26px", border: `1px solid ${saved ? "rgba(230,57,70,0.35)" : C.border}`, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: saved ? C.red : C.faint, background: saved ? "rgba(230,57,70,0.06)" : "transparent", cursor: "pointer", transition: "all 150ms", flexShrink: 0 }}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>

        {/* Row 2: teams */}
        <Link href={`/sports/football-israel/${match.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "7px" }}>
          <div style={{ fontFamily: "var(--font-dm,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 600, letterSpacing: "-0.1px", color: C.text, lineHeight: 1.4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
              <TeamLogo name={match.home_team} size={20} />
              {isHe ? match.home_team : match.home_team_en}
            </span>
            <br />
            <span style={{ color: C.hint, fontWeight: 400, fontSize: "12px" }}>{isHe ? "נגד " : "vs "}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
              <TeamLogo name={match.away_team} size={20} />
              {isHe ? match.away_team : match.away_team_en}
            </span>
          </div>
        </Link>

        {/* Row 3: meta */}
        <div style={{ fontSize: "10px", color: C.hint, letterSpacing: "0.03em", marginBottom: "16px", lineHeight: 1.6 }}>
          {match.city || match.city_en ? `${isHe ? (match.city ?? match.city_en) : (match.city_en ?? match.city)} · ` : ""}
          {match.stadium || match.stadium_en ? `${isHe ? (match.stadium ?? match.stadium_en) : (match.stadium_en ?? match.stadium)} · ` : ""}
          {formatDate(match.match_date)}{match.match_time ? ` · ${match.match_time.slice(0,5)}` : ""}
        </div>

        {/* Row 4: listings */}
        {sell === 0 && buy === 0 ? (
          <Link
            href={`/post-listing?matchId=${match.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 14px", border: `1px solid ${C.border}`, borderRadius: "3px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.blue, textDecoration: "none", transition: "all 150ms" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(26,58,143,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = C.blue; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
          >
            + {isHe ? "היה הראשון לפרסם" : "Be first to post"}
          </Link>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "14px", fontWeight: 800, color: priceRange ? C.blue : C.faint, letterSpacing: "-0.2px" }}>
              {priceRange || "—"}
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "rgba(26,58,143,0.07)", color: C.blue }}>
                {sell} {isHe ? "מכירה" : "sell"}
              </span>
              <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#f1f5f9", color: C.hint }}>
                {buy} {isHe ? "קנייה" : "buy"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FootballIsraelPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  const [matches,    setMatches]    = useState<ILMatch[]>([]);
  const [listings,   setListings]   = useState<ListingItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saved,      setSaved]      = useState<Set<string>>(new Set());

  const [tab,       setTab]       = useState<Competition>("ligat_haal");
  const [query,     setQuery]     = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [minPrice,  setMinPrice]  = useState("");
  const [maxPrice,  setMaxPrice]  = useState("");

  useEffect(() => {
    try { setSaved(new Set(JSON.parse(localStorage.getItem("saved_il_matches") || "[]"))); } catch {}
    load();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setIsLoggedIn(!!s?.user));
    return () => subscription.unsubscribe();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: m }, { data: l }] = await Promise.all([
      supabase
        .from("israeli_matches")
        .select("*")
        .neq("status", "finished")           // ← הסתר משחקים שהסתיימו
        .order("match_date", { ascending: true }),
      supabase
        .from("listings")
        .select("id,israeli_match_id,price,type,status,expires_at,archived_at")
        .not("israeli_match_id", "is", null)
        .eq("status", "active")
        .is("archived_at", null),
    ]);
    setMatches((m || []) as ILMatch[]);
    setListings((l || []) as ListingItem[]);
    setLoading(false);
  }

  const toggleSave = useCallback((id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("saved_il_matches", JSON.stringify([...next]));
      return next;
    });
  }, []);

  function getSell(id: string)  { return listings.filter(l => l.israeli_match_id === id && l.type === "sell" && isActiveL(l)).length; }
  function getBuy(id: string)   { return listings.filter(l => l.israeli_match_id === id && l.type === "buy"  && isActiveL(l)).length; }
  function isHot(id: string)    { return listings.filter(l => l.israeli_match_id === id && isActiveL(l)).length >= 5; }
  function getPrice(id: string) {
    const prices = listings.filter(l => l.israeli_match_id === id && l.type === "sell" && isActiveL(l)).map(l => Number(l.price)).filter(Boolean);
    if (!prices.length) return null;
    const mn = Math.min(...prices), mx = Math.max(...prices);
    return mn === mx ? `₪${mn}` : `₪${mn}–₪${mx}`;
  }

  const filtered = useMemo(() => {
    const q  = query.trim().toLowerCase();
    const mn = minPrice ? Number(minPrice) : null;
    const mx = maxPrice ? Number(maxPrice) : null;
    return matches.filter(m => {
      if (m.competition !== tab) return false;
      if (savedOnly && !saved.has(m.id)) return false;
      const text = [m.home_team, m.away_team, m.home_team_en, m.away_team_en, m.round, m.round_en, m.city, m.city_en, m.stadium].join(" ").toLowerCase();
      if (q && !text.includes(q)) return false;
      if (mn !== null || mx !== null) {
        const prices = listings.filter(l => l.israeli_match_id === m.id && l.type === "sell" && isActiveL(l)).map(l => Number(l.price));
        if (!prices.length || !prices.some(p => (mn === null || p >= mn) && (mx === null || p <= mx))) return false;
      }
      return true;
    });
  }, [matches, listings, query, tab, savedOnly, saved, minPrice, maxPrice]);

  const activeCount = listings.filter(isActiveL).length;
  const ligatCount  = matches.filter(m => m.competition === "ligat_haal").length;
  const cupCount    = matches.filter(m => m.competition === "state_cup").length;

  const W        = { maxWidth: "1100px", margin: "0 auto", padding: "0 16px" } as const;
  const smallCaps: React.CSSProperties = { fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.hint };

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}
        .sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:2px;}
        .il-tab{padding:6px 14px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid transparent;transition:all 150ms;letter-spacing:0.04em;font-family:var(--font-dm,'DM Sans',sans-serif)}
        .il-tab.on{background:${C.blue};color:#fff;border-color:${C.blue}}
        .il-tab.off{background:transparent;color:${C.muted};border-color:${C.border}}
        .il-tab.off:hover{background:rgba(26,58,143,0.05);border-color:${C.blue};color:${C.blue}}
      `}</style>

      {/* 3px top bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.blue} 33.3%,${C.green} 33.3% 66.6%,${C.teal} 66.6%)` }} />

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...W, paddingTop: "44px", paddingBottom: "40px" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "22px", ...smallCaps }}>
            <span style={{ display: "flex", gap: "4px" }}>
              {[C.blue, C.green, C.teal].map(c => <span key={c} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, display: "inline-block" }} />)}
            </span>
            {isHe ? "כדורגל ישראלי · ליגת העל · גביע המדינה" : "Israeli Football · Ligat Ha'Al · State Cup"}
          </div>

          <h1 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(28px,5vw,42px)", fontWeight: 900, letterSpacing: "-1.5px", color: C.text, margin: "0 0 10px", lineHeight: 1 }}>
            {isHe ? <><span style={{ color: C.blue }}>כדורגל </span><span style={{ color: C.green }}>ישראלי</span></> : <><span style={{ color: C.blue }}>Israeli </span><span style={{ color: C.green }}>Football</span></>}
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: "0 0 28px", lineHeight: 1.6, maxWidth: "480px" }}>
            {isHe ? "כרטיסים לליגת העל וגביע המדינה — ישירות בין מוכר לקונה. אפס עמלות." : "Tickets for Ligat Ha'Al and the State Cup — directly between buyer and seller. Zero fees."}
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
            {([["ligat_haal", isHe ? "ליגת העל" : "Ligat Ha'Al", ligatCount], ["state_cup", isHe ? "גביע המדינה" : "State Cup", cupCount]] as [Competition, string, number][]).map(([id, label, count]) => (
              <button key={id} className={`il-tab ${tab === id ? "on" : "off"}`} onClick={() => setTab(id)}>
                {label}<span style={{ marginInlineStart: "6px", fontSize: "9px", opacity: 0.7 }}>({loading ? "–" : count})</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const, alignItems: "center" }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={isHe ? "חיפוש קבוצה, סיבוב..." : "Search team, round..."} style={{ padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "12px", background: C.white, color: C.text, outline: "none", width: "200px", fontFamily: "inherit" }} />
            <span style={{ fontSize: "10px", color: C.hint, fontWeight: 600 }}>₪</span>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder={isHe ? "מינ׳" : "min"} style={{ width: "60px", padding: "7px 8px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "11px", background: C.white, color: C.text, outline: "none" }} />
            <span style={{ fontSize: "10px", color: C.faint }}>—</span>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder={isHe ? "מקס׳" : "max"} style={{ width: "60px", padding: "7px 8px", border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "11px", background: C.white, color: C.text, outline: "none" }} />
            <button onClick={() => setSavedOnly(p => !p)} style={{ padding: "7px 12px", border: `1px solid ${savedOnly ? "rgba(230,57,70,0.35)" : C.border}`, borderRadius: "4px", fontSize: "11px", fontWeight: 700, background: savedOnly ? "rgba(230,57,70,0.06)" : "transparent", color: savedOnly ? C.red : C.muted, cursor: "pointer", transition: "all 150ms" }}>
              {savedOnly ? "♥" : "♡"} {isHe ? "שמורים" : "Saved"}
            </button>
            <Link href={isLoggedIn ? "/post-listing" : "/auth"} style={{ marginInlineStart: "auto", padding: "7px 18px", background: C.blue, color: "#fff", fontSize: "12px", fontWeight: 700, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" as const }}>
              + {isHe ? "פרסם מודעה" : "Post listing"}
            </Link>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ ...W, marginTop: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={smallCaps}>{isHe ? "משחקים" : "Matches"}</span>
          <span style={{ fontSize: "11px", color: C.blue, fontWeight: 600 }}>{activeCount} {isHe ? "מודעות פעילות" : "active listings"} ●</span>
        </div>
      </div>

      <div style={W}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: C.white, padding: "20px" }}>
                <div style={{ height: "2px", background: ACCENTS[(i-1)%3], marginBottom: "16px", marginInline: "-20px", marginTop: "-20px" }} />
                {[60,120,90,50].map((w,j) => <div key={j} className="sk" style={{ height: "12px", width: `${w}%`, marginBottom: "12px" }} />)}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" as const, background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{savedOnly ? "♡" : "⚽"}</div>
            <p style={{ fontSize: "14px", color: C.muted, marginBottom: "4px" }}>
              {savedOnly ? (isHe ? "אין משחקים שמורים" : "No saved matches") : (isHe ? "לא נמצאו משחקים" : "No matches found")}
            </p>
            <p style={{ fontSize: "12px", color: C.hint }}>
              {savedOnly ? (isHe ? "לחץ על ♡ בכרטיס" : "Tap ♡ on any card") : (isHe ? "נסה לשנות פילטרים" : "Try changing filters")}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
            {filtered.map((match, i) => (
              <MatchCard key={match.id} match={match} idx={i} sell={getSell(match.id)} buy={getBuy(match.id)} priceRange={getPrice(match.id)} hot={isHot(match.id)} saved={saved.has(match.id)} onSave={toggleSave} isHe={isHe} />
            ))}
          </div>
        )}
      </div>

      {/* INFO STRIP */}
      <div style={{ ...W, marginTop: "28px" }}>
        <div style={{ borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
          <div style={{ background: C.blue, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{isHe ? "כדורגל ישראלי" : "Israeli Football"}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", marginTop: "2px", fontWeight: 300 }}>{isHe ? "ליגת העל + גביע המדינה · עונת 2025–26" : "Ligat Ha'Al + State Cup · Season 2025–26"}</div>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: "rgba(255,255,255,.12)", padding: "5px 12px", borderRadius: "3px", border: "1px solid rgba(255,255,255,.15)", whiteSpace: "nowrap" as const }}>
              {isHe ? "אוג׳ 2025 – מאי 2026" : "Aug 2025 – May 2026"}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: C.border }}>
            {[
              { dot: C.blue,    name: isHe ? "ליגת העל"      : "Ligat Ha'Al", n: isHe ? `${ligatCount} משחקים` : `${ligatCount} matches` },
              { dot: "#b8860b", name: isHe ? "גביע המדינה"   : "State Cup",   n: isHe ? `${cupCount} משחקים`   : `${cupCount} matches`  },
              { dot: C.teal,    name: isHe ? "מודעות פעילות" : "Listings",    n: isHe ? `${activeCount} פעילות` : `${activeCount} active` },
            ].map(c => (
              <div key={c.name} style={{ background: "rgba(255,255,255,0.8)", padding: "12px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.dot, flexShrink: 0, display: "inline-block" }} />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{c.name}</div>
                  <div style={{ fontSize: "10px", color: C.hint, marginTop: "1px" }}>{c.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ ...W, marginTop: "20px", paddingBottom: "52px" }}>
        <div style={{ padding: "24px", border: `1px solid ${C.border}`, borderRadius: "6px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" as const }}>
          <div>
            <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "16px", fontWeight: 800, color: C.text, marginBottom: "4px", letterSpacing: "-0.3px" }}>
              {isHe ? "יש לך כרטיסים לכדורגל?" : "Got football tickets to sell?"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 300, color: C.muted, lineHeight: 1.75 }}>
              {isHe ? "פרסם מודעה תוך 60 שניות. קונים יפנו אליך ישירות בוואטסאפ." : "Post a listing in 60 seconds. Buyers contact you directly on WhatsApp."}
            </div>
          </div>
          <Link href={isLoggedIn ? "/post-listing" : "/auth"} style={{ padding: "12px 26px", background: C.blue, color: "#fff", fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0 }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = ".88")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            {isHe ? "פרסם מודעה →" : "Post listing →"}
          </Link>
        </div>
      </div>
    </main>
  );
}
