"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";
import { getTeamLogo } from "../../../lib/teamLogos";

// ── Types ─────────────────────────────────────────────────────────────────────
type Competition = "ligat_haal" | "state_cup" | "all";

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

// ── Tokens — same as WC page ──────────────────────────────────────────────────
const C = {
  blue:   "#1a3a8f",
  green:  "#0095DA",   // תכלת — צבע פסי הדגל
  teal:   "#4A8FD4",   // תכלת בהיר
  bg:     "#f0f6ff",   // רקע כחלחל קל
  white:  "#ffffff",
  border: "#dce8f8",
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

// ── Font helpers — matches WC page pattern ────────────────────────────────────
const fHe  = "var(--font-he,'Heebo',sans-serif)";
const fEn  = "var(--font-dm,'DM Sans',sans-serif)";
const fSyne = "var(--font-syne,'Syne',sans-serif)";
function fBody(isHe: boolean) { return isHe ? fHe : fEn; }

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
  const src   = getTeamLogo(name);
  const color = TEAM_COLORS[name] ?? C.hint;
  if (err || !src) {
    return (
      <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `${color}22`, border: `1.5px solid ${color}55`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color, fontFamily: fSyne }}>
        {name.slice(0,1)}
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
  const accent    = ACCENTS[idx % 3];
  const countdown = useCountdown(match.match_date, match.match_time, isHe);
  const [hov, setHov] = useState(false);
  const isCup = match.competition === "state_cup";

  return (
    <div
      style={{ background: hov ? "rgba(248,249,252,0.9)" : "rgba(255,255,255,0.75)", transition: "background 120ms", position: "relative" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
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

        {/* Row 2: teams — same font pattern as WC */}
        <Link href={`/sports/football-israel/${match.id}`} style={{ textDecoration: "none", display: "block", marginBottom: "7px" }}>
          <div style={{ fontFamily: fBody(isHe), fontSize: "15px", fontWeight: 600, letterSpacing: "-0.1px", color: C.text, lineHeight: 1.3 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <TeamLogo name={match.home_team} size={20} />
              {isHe ? match.home_team : match.home_team_en}
            </span>
            <br />
            <span style={{ color: C.hint, fontWeight: 400, fontSize: "12px" }}>{isHe ? "נגד " : "vs "}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
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
            href={`/post-listing?matchId=${match.id}&type=israeli`}
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 14px", border: `1px solid ${C.border}`, borderRadius: "3px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.blue, textDecoration: "none", transition: "all 150ms" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(26,58,143,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = C.blue; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
          >
            + {isHe ? "היה הראשון לפרסם" : "Be first to post"}
          </Link>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: fSyne, fontSize: "14px", fontWeight: 800, color: priceRange ? C.blue : C.faint, letterSpacing: "-0.2px" }}>
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

  const [tab,       setTab]       = useState<Competition>("all");
  const [query,     setQuery]     = useState("");
  const [savedOnly,     setSavedOnly]     = useState(false);
  const [withListings,  setWithListings]  = useState(false);
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
        .neq("status", "finished")
        .gte("match_date", new Date().toISOString().slice(0, 10))
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
      if (tab !== "all" && m.competition !== tab) return false;
      if (savedOnly && !saved.has(m.id)) return false;
      if (withListings && listings.filter(l => l.israeli_match_id === m.id && isActiveL(l)).length === 0) return false;
      const text = [m.home_team, m.away_team, m.home_team_en, m.away_team_en, m.round, m.round_en, m.city, m.city_en, m.stadium].join(" ").toLowerCase();
      if (q && !text.includes(q)) return false;
      if (mn !== null || mx !== null) {
        const prices = listings.filter(l => l.israeli_match_id === m.id && l.type === "sell" && isActiveL(l)).map(l => Number(l.price));
        if (!prices.length || !prices.some(p => (mn === null || p >= mn) && (mx === null || p <= mx))) return false;
      }
      return true;
    });
  }, [matches, listings, query, tab, savedOnly, withListings, saved, minPrice, maxPrice]);

  const activeCount = listings.filter(isActiveL).length;
  const ligatCount  = matches.filter(m => m.competition === "ligat_haal").length;
  const cupCount    = matches.filter(m => m.competition === "state_cup").length;
  const sellCount   = listings.filter(l => isActiveL(l) && l.type === "sell").length;
  const buyCount    = listings.filter(l => isActiveL(l) && l.type === "buy").length;
  const sellPrices  = listings.filter(l => isActiveL(l) && l.type === "sell").map(l => Number(l.price)).filter(Boolean);
  const minP        = sellPrices.length ? Math.min(...sellPrices) : null;
  const avgP        = sellPrices.length ? Math.round(sellPrices.reduce((a,b)=>a+b,0)/sellPrices.length) : null;

  const W: React.CSSProperties = { maxWidth: "1100px", margin: "0 auto", padding: "0 16px" };
  const smallCaps: React.CSSProperties = { fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.hint };

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: fBody(isHe) }}>
      <style>{`
        @keyframes shi{from{background-position:-600px 0}to{background-position:600px 0}}
        .sk{background:linear-gradient(90deg,#f0f4f8 25%,#e8edf5 50%,#f0f4f8 75%);background-size:800px 100%;animation:shi 1.4s infinite linear;border-radius:2px;}
        .il-tab{padding:6px 14px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid transparent;transition:all 150ms;letter-spacing:0.04em;}
        .il-tab.on{background:${C.blue};color:#fff;border-color:${C.blue}}
        .il-tab.off{background:transparent;color:${C.muted};border-color:${C.border}}
        .il-tab.off:hover{background:rgba(26,58,143,0.05);border-color:${C.blue};color:${C.blue}}
        @media(max-width:640px){.hero-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* 3px top bar — כחול → תכלת → לבן */}
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.blue} 33.3%,${C.green} 33.3% 66.6%,#ffffff 66.6%)` }} />

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg,#e8f2ff 0%,#f4f8ff 50%,#ffffff 100%)", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        {[
          { w:360, t:-100, r:-60,  c:"rgba(26,58,143,.08)"  },
          { w:280, b:-80,  l:-40,  c:"rgba(0,149,218,.06)"  },
          { w:220, t:30,   r:"28%",c:"rgba(74,143,212,.05)" },
        ].map((b,i) => (
          <div key={i} style={{ position:"absolute", width:b.w, height:b.w, borderRadius:"50%", background:`radial-gradient(circle,${b.c},transparent 70%)`, top:(b as any).t, bottom:(b as any).b, left:(b as any).l, right:(b as any).r, pointerEvents:"none" as const }} />
        ))}
        <div style={{ ...W, paddingTop: "44px", paddingBottom: "40px" }}>

          {/* Label */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "22px", ...smallCaps }}>
            <span style={{ display: "flex", gap: "4px" }}>
              {[C.blue, C.green, C.teal].map(c => <span key={c} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, display: "inline-block" }} />)}
            </span>
            {isHe ? "כדורגל ישראלי · ליגת העל · גביע המדינה" : "Israeli Football · Ligat Ha'Al · State Cup"}
          </div>

          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center" }}>
            <div>
              {/* "STAY IN THE GAME" style label */}
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: C.blue, marginBottom: "16px" }}>
                {isHe ? "STAY IN THE GAME" : "STAY IN THE GAME"}
              </div>

              {/* H1 — exact same sizing as WC */}
              {isHe ? (
                <h1 style={{ fontFamily: fHe, fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.5px", marginBottom: "18px" }}>
                  <span style={{ color: C.blue }}>כרטיסים לכדורגל </span><span style={{ color: C.green }}>ישראלי</span>
                  <br />
                  <span style={{ color: C.teal }}>בדרך </span><span style={{ color: C.blue }}>פשוטה.</span>
                </h1>
              ) : (
                <h1 style={{ fontFamily: fSyne, fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "0.02em", marginBottom: "18px" }}>
                  <span style={{ color: C.blue }}>ISRAELI </span><span style={{ color: C.green }}>FOOTBALL TICKETS.</span>
                  <br />
                  <span style={{ color: C.teal }}>THE SIMPLE </span><span style={{ color: C.blue }}>WAY.</span>
                </h1>
              )}

              <p style={{ fontSize: "15px", fontWeight: 400, color: C.muted, lineHeight: 1.8, maxWidth: "420px", marginBottom: "28px", fontFamily: fBody(isHe) }}>
                {isHe
                  ? "כרטיסים לליגת העל וגביע המדינה — ישירות בין מוכר לקונה. בלי עמלות, בלי תיווך."
                  : "Tickets for Ligat Ha'Al and the State Cup — directly between buyer and seller. No fees, no middlemen."}
              </p>

              {/* Buttons — same structure as WC page */}
              <div className="hero-btns" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" as const }}>
                <a href="#matches" style={{ padding: "12px 24px", background: "transparent", color: C.blue, fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none", letterSpacing: "0.02em", border: `2px solid ${C.blue}`, transition: "all 150ms" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.blue; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.blue; }}
                >
                  {isHe ? "צפה במשחקים ↓" : "Browse matches ↓"}
                </a>
                {isLoggedIn && (
                  <Link href="/post-listing?type=israeli" style={{ padding: "12px 22px", border: `1px solid ${C.border}`, color: C.muted, fontSize: "13px", fontWeight: 500, borderRadius: "4px", textDecoration: "none", background: C.white, transition: "border-color 150ms,color 150ms" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.blue; (e.currentTarget as HTMLElement).style.color = C.blue; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; }}
                  >
                    {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                  </Link>
                )}
              </div>
            </div>

            {/* Right: stats — 3 columns, identical to WC page */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
              {[
                { val: loading ? "–" : String(matches.length), lbl: isHe ? "משחקים" : "Matches",        color: C.blue,   live: false },
                { val: loading ? "–" : String(activeCount),    lbl: isHe ? "מודעות פעילות" : "Live listings", color: C.text, live: true  },
                { val: "WA",                                    lbl: isHe ? "קשר ישיר" : "Direct contact", color: C.teal,  live: false },
              ].map((s, i) => (
                <div key={i} style={{ background: "transparent", padding: "18px 14px", textAlign: "center" as const }}>
                  <div style={{ fontFamily: fSyne, fontSize: "22px", fontWeight: 800, color: s.color, letterSpacing: "-0.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    {s.val}
                    {s.live && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />}
                  </div>
                  <div style={{ ...smallCaps, marginTop: "4px" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS — identical structure to WC page ── */}
      <div id="matches" style={{ ...W, paddingTop: "24px" }}>

        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.8)", borderRadius: "4px", marginBottom: "10px", backdropFilter: "blur(8px)", transition: "border-color 150ms" }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = C.blue)}
          onBlurCapture={e => (e.currentTarget.style.borderColor = C.border)}
        >
          <span style={{ padding: "0 14px", fontSize: "16px", color: C.faint }}>⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder={isHe ? "חיפוש קבוצה, סיבוב, אצטדיון..." : "Search team, round, stadium..."}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "13px", padding: "12px 0", fontFamily: "var(--font-dm),var(--font-he),sans-serif" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ padding: "0 14px", background: "none", border: "none", color: C.hint, cursor: "pointer", fontSize: "14px" }}>✕</button>
          )}
        </div>

        {/* Price range */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.hint, flexShrink: 0 }}>
            {isHe ? "טווח מחיר" : "Price range"}
          </span>
          <div style={{ display: "flex", flex: 1, gap: "8px" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: "4px", background: C.white }}>
              <span style={{ padding: "0 10px", fontSize: "12px", color: C.faint }}>₪</span>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder={isHe ? "מינימום" : "Min"} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "12px", padding: "10px 0", fontFamily: "var(--font-dm),var(--font-he),sans-serif" }} />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: "4px", background: C.white }}>
              <span style={{ padding: "0 10px", fontSize: "12px", color: C.faint }}>₪</span>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder={isHe ? "מקסימום" : "Max"} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "12px", padding: "10px 0", fontFamily: "var(--font-dm),var(--font-he),sans-serif" }} />
            </div>
            {(minPrice || maxPrice) && (
              <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} style={{ padding: "0 12px", background: "none", border: `1px solid ${C.border}`, borderRadius: "4px", color: C.hint, cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" as const }}>✕</button>
            )}
          </div>
        </div>

        {/* Chips — All | Ligat Ha'Al | State Cup | ♥ Saved | live dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", flexWrap: "wrap" as const }}>
          {/* All */}
          <button onClick={() => { setTab("all"); setSavedOnly(false); }}
            style={{ padding: "5px 14px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, border: `1px solid ${tab === "all" && !savedOnly ? C.blue : C.border}`, color: tab === "all" && !savedOnly ? C.blue : C.hint, background: tab === "all" && !savedOnly ? "rgba(26,58,143,0.05)" : C.white, cursor: "pointer", borderRadius: "3px", transition: "all 150ms", fontFamily: "var(--font-dm),sans-serif" }}>
            {isHe ? "הכל" : "All"}
          </button>

          {/* Competition tabs as chips */}
          {([["ligat_haal", isHe ? "ליגת העל" : "Ligat Ha'Al", ligatCount], ["state_cup", isHe ? "גביע המדינה" : "State Cup", cupCount]] as [Competition, string, number][]).map(([id, label, count]) => (
            <button key={id} onClick={() => { setTab(id); setSavedOnly(false); }}
              style={{ padding: "5px 14px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, border: `1px solid ${tab === id && !savedOnly ? C.blue : C.border}`, color: tab === id && !savedOnly ? C.blue : C.hint, background: tab === id && !savedOnly ? "rgba(26,58,143,0.05)" : C.white, cursor: "pointer", borderRadius: "3px", transition: "all 150ms", whiteSpace: "nowrap" as const, fontFamily: "var(--font-dm),sans-serif" }}>
              {label} <span style={{ opacity: 0.6, fontSize: "9px" }}>({loading ? "–" : count})</span>
            </button>
          ))}

          {/* Saved */}
          <button onClick={() => setSavedOnly(p => !p)}
            style={{ padding: "5px 14px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, border: `1px solid ${savedOnly ? "rgba(230,57,70,0.4)" : C.border}`, color: savedOnly ? C.red : C.hint, background: savedOnly ? "rgba(230,57,70,0.05)" : C.white, cursor: "pointer", borderRadius: "3px", transition: "all 150ms", fontFamily: "var(--font-dm),sans-serif" }}>
            ♥ {isHe ? "שמורים" : "Saved"}{saved.size > 0 && ` (${saved.size})`}
          </button>

          {/* With listings checkbox */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", cursor: "pointer", userSelect: "none" as const }}>
            <span style={{
              width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
              border: `1.5px solid ${withListings ? C.blue : C.border}`,
              background: withListings ? C.blue : C.white,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              transition: "all 150ms",
            }}
              onClick={() => setWithListings(p => !p)}
            >
              {withListings && <span style={{ color: "#fff", fontSize: "10px", fontWeight: 800, lineHeight: 1 }}>✓</span>}
            </span>
            <span
              onClick={() => setWithListings(p => !p)}
              style={{ fontSize: "11px", fontWeight: 600, color: withListings ? C.blue : C.hint, transition: "color 150ms", whiteSpace: "nowrap" as const }}
            >
              {isHe ? "רק משחקים עם מודעות" : "Only with listings"}
            </span>
          </label>

          {/* Live dot + count */}
          <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.hint }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            {isHe ? "מתעדכן חי" : "Live updates"}
            {!loading && (
              <span style={{ color: C.blue, fontWeight: 600 }}>
                · {filtered.length} {isHe ? (filtered.length === 1 ? "משחק" : "משחקים") : (filtered.length === 1 ? "match" : "matches")}
              </span>
            )}
          </div>
        </div>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={smallCaps}>{isHe ? "משחקים" : "Matches"}</span>
          <span style={{ fontSize: "11px", color: C.blue, fontWeight: 600 }}>{activeCount} {isHe ? "מודעות פעילות" : "active listings"} ●</span>
        </div>
      </div>

      {/* ── GRID ── */}
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
            <p style={{ fontSize: "14px", color: C.muted, marginBottom: "4px", fontFamily: fBody(isHe) }}>
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

      {/* ── INFO STRIP ── */}
      <div style={{ ...W, marginTop: "28px" }}>
        <div style={{ borderRadius: "6px", overflow: "hidden", border: `1px solid ${C.border}` }}>
          <div style={{ background: C.blue, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: fSyne, fontSize: "13px", fontWeight: 700, color: "#fff" }}>{isHe ? "כדורגל ישראלי" : "Israeli Football"}</div>
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
                  <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, fontFamily: fBody(isHe) }}>{c.name}</div>
                  <div style={{ fontSize: "10px", color: C.hint, marginTop: "1px" }}>{c.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ ...W, marginTop: "20px", paddingBottom: "52px" }}>
        <div style={{ padding: "24px", border: `1px solid ${C.border}`, borderRadius: "6px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" as const }}>
          <div>
            <div style={{ fontFamily: fSyne, fontSize: "16px", fontWeight: 800, color: C.text, marginBottom: "4px", letterSpacing: "-0.3px" }}>
              {isHe ? "יש לך כרטיסים לכדורגל?" : "Got football tickets to sell?"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 300, color: C.muted, lineHeight: 1.75, fontFamily: fBody(isHe) }}>
              {isHe ? "פרסם מודעה תוך 60 שניות. קונים יפנו אליך ישירות בוואטסאפ." : "Post a listing in 60 seconds. Buyers contact you directly on WhatsApp."}
            </div>
          </div>
          <Link href={isLoggedIn ? "/post-listing?type=israeli" : "/auth"} style={{ padding: "12px 26px", background: C.blue, color: "#fff", fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0 }}
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
