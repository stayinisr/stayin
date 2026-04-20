"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";

// ── Tokens (same as site-wide) ────────────────────────────────────────────────
const C = {
  navy:    "#1a3a8f",
  red:     "#e63946",
  green:   "#006847",
  teal:    "#1abfb0",
  text:    "#0d1b3e",
  muted:   "#5a6a88",
  hint:    "#9aaac4",
  border:  "#e8edf5",
  bg:      "#f8f9fc",
  white:   "#ffffff",
  gold:    "#d4a017",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type Competition = "ligat_haal" | "state_cup";

type ILMatch = {
  id: string;
  home_team: string;
  away_team: string;
  home_team_en: string;
  away_team_en: string;
  home_color: string;
  away_color: string;
  stadium: string;
  stadium_en: string;
  city: string;
  city_en: string;
  match_date: string;
  match_time: string;
  competition: Competition;
  round: string;          // e.g. "מחזור 30" / "שמינית גמר"
  round_en: string;
  sell_count?: number;
  buy_count?: number;
};

// ── Mock data (replace with Supabase fetch) ───────────────────────────────────
// TODO: fetch from `matches` table WHERE competition IN ('ligat_haal','state_cup')
//       and join listing counts from `listings` table.
const MOCK_MATCHES: ILMatch[] = [
  // ── Ligat Ha'Al ──
  {
    id: "il-001",
    home_team: "מכבי תל אביב",       away_team: "הפועל תל אביב",
    home_team_en: "Maccabi Tel Aviv", away_team_en: "Hapoel Tel Aviv",
    home_color: "#FDE400",            away_color: "#e63946",
    stadium: "אצטדיון בלומפילד",     stadium_en: "Bloomfield Stadium",
    city: "תל אביב",                  city_en: "Tel Aviv",
    match_date: "2026-04-26",         match_time: "20:00",
    competition: "ligat_haal",        round: "מחזור 30", round_en: "Matchday 30",
    sell_count: 14, buy_count: 7,
  },
  {
    id: "il-002",
    home_team: "מכבי חיפה",           away_team: "בית\"ר ירושלים",
    home_team_en: "Maccabi Haifa",    away_team_en: "Beitar Jerusalem",
    home_color: "#007B40",            away_color: "#FFCE00",
    stadium: "אצטדיון סמי עופר",     stadium_en: "Sammy Ofer Stadium",
    city: "חיפה",                     city_en: "Haifa",
    match_date: "2026-04-25",         match_time: "19:30",
    competition: "ligat_haal",        round: "מחזור 30", round_en: "Matchday 30",
    sell_count: 8, buy_count: 3,
  },
  {
    id: "il-003",
    home_team: "הפועל באר שבע",       away_team: "מכבי נתניה",
    home_team_en: "Hapoel Beer Sheva",away_team_en: "Maccabi Netanya",
    home_color: "#C0392B",            away_color: "#F4C430",
    stadium: "אצטדיון טרנר",         stadium_en: "Turner Stadium",
    city: "באר שבע",                  city_en: "Beer Sheva",
    match_date: "2026-04-27",         match_time: "19:00",
    competition: "ligat_haal",        round: "מחזור 30", round_en: "Matchday 30",
    sell_count: 4, buy_count: 2,
  },
  {
    id: "il-004",
    home_team: "הפועל ירושלים",       away_team: "עירוני קרית שמונה",
    home_team_en: "Hapoel Jerusalem", away_team_en: "Ironi Kiryat Shmona",
    home_color: "#E67E22",            away_color: "#6B2D8B",
    stadium: "אצטדיון טדי",          stadium_en: "Teddy Stadium",
    city: "ירושלים",                  city_en: "Jerusalem",
    match_date: "2026-05-02",         match_time: "20:00",
    competition: "ligat_haal",        round: "מחזור 31", round_en: "Matchday 31",
    sell_count: 6, buy_count: 1,
  },
  {
    id: "il-005",
    home_team: "מכבי תל אביב",        away_team: "מכבי חיפה",
    home_team_en: "Maccabi Tel Aviv", away_team_en: "Maccabi Haifa",
    home_color: "#FDE400",            away_color: "#007B40",
    stadium: "אצטדיון בלומפילד",     stadium_en: "Bloomfield Stadium",
    city: "תל אביב",                  city_en: "Tel Aviv",
    match_date: "2026-05-09",         match_time: "21:00",
    competition: "ligat_haal",        round: "מחזור 32", round_en: "Matchday 32",
    sell_count: 21, buy_count: 11,
  },
  {
    id: "il-006",
    home_team: "הפועל תל אביב",        away_team: "הפועל באר שבע",
    home_team_en: "Hapoel Tel Aviv",   away_team_en: "Hapoel Beer Sheva",
    home_color: "#e63946",             away_color: "#C0392B",
    stadium: "אצטדיון בלומפילד",      stadium_en: "Bloomfield Stadium",
    city: "תל אביב",                   city_en: "Tel Aviv",
    match_date: "2026-05-16",          match_time: "20:00",
    competition: "ligat_haal",         round: "מחזור 33", round_en: "Matchday 33",
    sell_count: 0, buy_count: 0,
  },
  // ── State Cup ──
  {
    id: "il-007",
    home_team: "מכבי חיפה",            away_team: "הפועל תל אביב",
    home_team_en: "Maccabi Haifa",     away_team_en: "Hapoel Tel Aviv",
    home_color: "#007B40",             away_color: "#e63946",
    stadium: "אצטדיון סמי עופר",      stadium_en: "Sammy Ofer Stadium",
    city: "חיפה",                      city_en: "Haifa",
    match_date: "2026-04-30",          match_time: "20:30",
    competition: "state_cup",          round: "חצי גמר", round_en: "Semi Final",
    sell_count: 18, buy_count: 9,
  },
  {
    id: "il-008",
    home_team: "בית\"ר ירושלים",       away_team: "מכבי תל אביב",
    home_team_en: "Beitar Jerusalem",  away_team_en: "Maccabi Tel Aviv",
    home_color: "#FFCE00",             away_color: "#FDE400",
    stadium: "אצטדיון טדי",           stadium_en: "Teddy Stadium",
    city: "ירושלים",                   city_en: "Jerusalem",
    match_date: "2026-05-01",          match_time: "20:30",
    competition: "state_cup",          round: "חצי גמר", round_en: "Semi Final",
    sell_count: 23, buy_count: 14,
  },
  {
    id: "il-009",
    home_team: "TBD",                  away_team: "TBD",
    home_team_en: "TBD",               away_team_en: "TBD",
    home_color: C.hint,                away_color: C.hint,
    stadium: "אצטדיון טדי",           stadium_en: "Teddy Stadium",
    city: "ירושלים",                   city_en: "Jerusalem",
    match_date: "2026-05-20",          match_time: "20:00",
    competition: "state_cup",          round: "גמר", round_en: "Final",
    sell_count: 0, buy_count: 5,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string, isHe: boolean) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();
  if (isHe) return `${day}/${month}/${year}`;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${year}`;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

// ── Team Initials Badge ───────────────────────────────────────────────────────
function TeamBadge({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const isTBD = name === "TBD";
  const initials = isTBD ? "?" : name.slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: isTBD ? "rgba(154,170,196,.15)" : `${color}22`,
      border: `1.5px solid ${isTBD ? C.border : color + "44"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-syne,'Syne',sans-serif)",
      fontSize: size * 0.36, fontWeight: 900,
      color: isTBD ? C.hint : color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ m, isHe }: { m: ILMatch; isHe: boolean }) {
  const days    = daysUntil(m.match_date);
  const isSoon  = days >= 0 && days <= 7;
  const isToday = days === 0;
  const isTBD   = m.home_team === "TBD";
  const total   = (m.sell_count ?? 0) + (m.buy_count ?? 0);

  return (
    <Link
      href={`/matches/${m.id}`}
      style={{ textDecoration: "none" }}
    >
      <div style={{
        background: C.white,
        border: `1px solid ${isSoon ? "rgba(26,191,176,.25)" : C.border}`,
        borderRadius: 12,
        padding: "18px 20px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 16,
        alignItems: "center",
        transition: "box-shadow 200ms, border-color 200ms",
        boxShadow: isSoon ? "0 0 0 1px rgba(26,191,176,.1)" : "0 1px 4px rgba(13,27,62,.04)",
        cursor: "pointer",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(13,27,62,.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = C.teal + "66"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = isSoon ? "0 0 0 1px rgba(26,191,176,.1)" : "0 1px 4px rgba(13,27,62,.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = isSoon ? "rgba(26,191,176,.25)" : C.border; }}
      >
        {/* Left: teams + meta */}
        <div>
          {/* Round badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              padding: "3px 8px", borderRadius: 4,
              background: "rgba(26,58,143,.06)",
              border: "1px solid rgba(26,58,143,.1)",
              color: C.navy,
            }}>
              {isHe ? m.round : m.round_en}
            </span>
            {isToday && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                padding: "3px 8px", borderRadius: 4,
                background: "rgba(230,57,70,.1)",
                border: "1px solid rgba(230,57,70,.2)",
                color: C.red,
              }}>
                {isHe ? "היום" : "Today"}
              </span>
            )}
            {!isToday && isSoon && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                padding: "3px 8px", borderRadius: 4,
                background: "rgba(26,191,176,.1)",
                border: "1px solid rgba(26,191,176,.2)",
                color: C.teal,
              }}>
                {isHe ? `בעוד ${days} ימים` : `In ${days} days`}
              </span>
            )}
          </div>

          {/* Teams */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <TeamBadge name={m.home_team} color={m.home_color} />
            <div>
              <div style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.1,
              }}>
                {isHe ? m.home_team : m.home_team_en}
              </div>
              <div style={{ fontSize: 10, color: C.hint, fontWeight: 600, marginTop: 2 }}>
                {isHe ? "בית" : "Home"}
              </div>
            </div>

            <div style={{
              fontSize: 11, fontWeight: 900, color: C.hint,
              padding: "4px 10px", borderRadius: 6,
              background: C.bg, border: `1px solid ${C.border}`,
              flexShrink: 0,
            }}>
              VS
            </div>

            <div>
              <div style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.1,
              }}>
                {isTBD
                  ? (isHe ? "TBD" : "TBD")
                  : (isHe ? m.away_team : m.away_team_en)}
              </div>
              <div style={{ fontSize: 10, color: C.hint, fontWeight: 600, marginTop: 2 }}>
                {isHe ? "חוץ" : "Away"}
              </div>
            </div>
            <TeamBadge name={m.away_team} color={m.away_color} />
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted }}>
              <span style={{ fontSize: 13 }}>📅</span>
              {formatDate(m.match_date, isHe)} · {m.match_time.slice(0, 5)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted }}>
              <span style={{ fontSize: 13 }}>📍</span>
              {isHe ? m.stadium : m.stadium_en}
              <span style={{ color: C.hint }}>·</span>
              {isHe ? m.city : m.city_en}
            </span>
          </div>
        </div>

        {/* Right: ticket counts + arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {total > 0 ? (
            <>
              <div style={{ display: "flex", gap: 6 }}>
                {(m.sell_count ?? 0) > 0 && (
                  <div style={{
                    padding: "5px 10px", borderRadius: 6, textAlign: "center",
                    background: "rgba(0,104,71,.07)", border: "1px solid rgba(0,104,71,.14)",
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.green, lineHeight: 1 }}>
                      {m.sell_count}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,104,71,.6)", letterSpacing: "0.08em", marginTop: 2 }}>
                      {isHe ? "מכירה" : "SELL"}
                    </div>
                  </div>
                )}
                {(m.buy_count ?? 0) > 0 && (
                  <div style={{
                    padding: "5px 10px", borderRadius: 6, textAlign: "center",
                    background: "rgba(26,58,143,.06)", border: "1px solid rgba(26,58,143,.12)",
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, lineHeight: 1 }}>
                      {m.buy_count}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(26,58,143,.5)", letterSpacing: "0.08em", marginTop: 2 }}>
                      {isHe ? "קנייה" : "BUY"}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 9, color: C.hint, fontWeight: 600 }}>
                {isHe ? "מודעות פעילות" : "active listings"}
              </div>
            </>
          ) : (
            <div style={{
              padding: "6px 12px", borderRadius: 6,
              background: C.bg, border: `1px solid ${C.border}`,
              fontSize: 11, color: C.hint, fontWeight: 600,
            }}>
              {isHe ? "אין מודעות עדיין" : "No listings yet"}
            </div>
          )}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(26,58,143,.06)",
            border: "1px solid rgba(26,58,143,.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: C.navy, marginTop: 2,
          }}>
            →
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Season Progress Bar ───────────────────────────────────────────────────────
function SeasonBar({ isHe }: { isHe: boolean }) {
  // Ligat Ha'Al 2025–26: 26 played out of 33
  const played = 29, total = 33;
  const pct = Math.round((played / total) * 100);
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
            {isHe ? "עונת 2025–26" : "Season 2025–26"}
          </span>
          <span style={{ fontSize: 11, color: C.hint }}>
            {isHe ? `מחזור ${played} מתוך ${total}` : `Matchday ${played} of ${total}`}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: C.border, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${C.navy}, ${C.teal})`,
            transition: "width 600ms ease",
          }} />
        </div>
      </div>
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div style={{
          fontFamily: "var(--font-syne,'Syne',sans-serif)",
          fontSize: 18, fontWeight: 900, color: C.navy, lineHeight: 1,
        }}>{pct}%</div>
        <div style={{ fontSize: 9, color: C.hint, fontWeight: 600, marginTop: 2 }}>
          {isHe ? "הושלם" : "done"}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FootballIsraelPage() {
  const { lang } = useLanguage();
  const isHe     = lang === "he";
  const dir      = isHe ? "rtl" : "ltr";

  const [tab, setTab]       = useState<Competition>("ligat_haal");
  const [matches, setMatches] = useState<ILMatch[]>(MOCK_MATCHES);
  const [loading, setLoading] = useState(false);

  // ── Fetch from Supabase ────────────────────────────────────────────────────
  // TODO: enable once `matches` table has `competition` field for IL matches.
  // Replace MOCK_MATCHES with real data.
  //
  // useEffect(() => {
  //   setLoading(true);
  //   supabase
  //     .from("matches")
  //     .select("id, home_team, away_team, stadium, city, match_date, match_time, competition, round")
  //     .in("competition", ["ligat_haal", "state_cup"])
  //     .gte("match_date", new Date().toISOString().slice(0, 10))
  //     .order("match_date", { ascending: true })
  //     .then(({ data, error }) => {
  //       if (!error && data) setMatches(data as ILMatch[]);
  //       setLoading(false);
  //     });
  // }, []);

  // ── Fetch listing counts per match ─────────────────────────────────────────
  // TODO: join listing counts from `listings` table grouped by match_id.
  // For now, mock counts are embedded in MOCK_MATCHES.

  const filtered = matches.filter(m => m.competition === tab);

  const ligatCount     = matches.filter(m => m.competition === "ligat_haal").length;
  const stateCupCount  = matches.filter(m => m.competition === "state_cup").length;
  const totalListings  = matches.reduce((acc, m) => acc + (m.sell_count ?? 0) + (m.buy_count ?? 0), 0);

  return (
    <>
      <style>{`
        @keyframes il-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .il1{animation:il-up .45s ease both}
        .il2{animation:il-up .45s .06s ease both}
        .il3{animation:il-up .45s .12s ease both}
        .il-tab{
          padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;
          cursor:pointer;border:none;transition:background 200ms,color 200ms,box-shadow 200ms;
          font-family:var(--font-dm,'DM Sans',sans-serif);
        }
        .il-tab.active{
          background:${C.navy};color:${C.white};
          box-shadow:0 4px 14px rgba(26,58,143,.3);
        }
        .il-tab.inactive{
          background:${C.white};color:${C.muted};
          border:1px solid ${C.border};
        }
        .il-tab.inactive:hover{background:${C.bg};color:${C.text}}
        @media(max-width:640px){
          .il-hero-grid{grid-template-columns:1fr!important}
          .il-stats{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      <div dir={dir} style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-dm,'DM Sans',sans-serif)" }}>

        {/* ── HERO ── */}
        <div style={{
          background: "linear-gradient(135deg,#0d2a1a 0%,#0f2252 60%,#1a3a8f 100%)",
          padding: "56px 40px 48px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", top: -140, right: -60, background: "radial-gradient(circle,rgba(26,191,176,.12),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", bottom: -100, left: -40, background: "radial-gradient(circle,rgba(230,57,70,.1),transparent 70%)", pointerEvents: "none" }} />
          {/* Star of David subtle watermark */}
          <div style={{
            position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)",
            fontSize: 180, opacity: 0.03, pointerEvents: "none", userSelect: "none",
            color: "#fff",
          }}>✡</div>

          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>

            {/* Breadcrumb */}
            <div className="il1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>
              <Link href="/" style={{ color: "rgba(255,255,255,.35)", textDecoration: "none" }}>
                {isHe ? "דף הבית" : "Home"}
              </Link>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,.6)" }}>
                {isHe ? "ספורט" : "Sports"}
              </span>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,.85)" }}>
                {isHe ? "כדורגל ישראלי" : "Israeli Football"}
              </span>
            </div>

            <div className="il-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
              <div>
                {/* Label */}
                <div className="il1" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "5px 12px", borderRadius: 999,
                  background: "rgba(26,191,176,.12)", border: "1px solid rgba(26,191,176,.25)",
                  fontSize: 11, fontWeight: 700, color: "#1abfb0", marginBottom: 16,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#1abfb0", display: "inline-block" }} />
                  {isHe ? "ספורט · ישראל" : "Sports · Israel"}
                </div>

                <h1 className="il2" style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "clamp(34px,5vw,56px)",
                  fontWeight: 900, lineHeight: 0.9,
                  letterSpacing: "-2.5px", margin: "0 0 18px",
                  color: C.white,
                }}>
                  {isHe
                    ? <><span style={{ color: "#fff" }}>כדורגל </span><span style={{ color: "#1abfb0" }}>ישראלי</span></>
                    : <><span style={{ color: "#fff" }}>Israeli </span><span style={{ color: "#1abfb0" }}>Football</span></>
                  }
                </h1>

                <p className="il3" style={{ fontSize: 14, color: "rgba(255,255,255,.48)", lineHeight: 1.7, maxWidth: 420, margin: "0 0 24px" }}>
                  {isHe
                    ? "כרטיסים לליגת העל וגביע המדינה — ישירות בין מוכר לקונה. אפס עמלות."
                    : "Tickets for Ligat Ha'Al and the State Cup — directly between buyer and seller. Zero fees."}
                </p>

                {/* IL Flags */}
                <div className="il3" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { he: "ליגת העל",         en: "Ligat Ha'Al",   c: C.teal   },
                    { he: "גביע המדינה",      en: "State Cup",     c: C.gold   },
                    { he: "ישיר לוואטסאפ",   en: "Direct WhatsApp", c: "#25D366" },
                    { he: "0% עמלות",         en: "0% Fees",       c: C.red    },
                  ].map(t => (
                    <span key={t.en} style={{
                      padding: "5px 12px", borderRadius: 5,
                      background: "rgba(255,255,255,.07)",
                      border: "1px solid rgba(255,255,255,.1)",
                      fontSize: 11, fontWeight: 600, color: t.c,
                    }}>
                      {isHe ? t.he : t.en}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: stat cards */}
              <div className="il-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { valHe: String(ligatCount),    labelHe: "משחקי ליגה", valEn: String(ligatCount),    labelEn: "League games"  },
                  { valHe: String(stateCupCount),  labelHe: "משחקי גביע", valEn: String(stateCupCount),  labelEn: "Cup games"     },
                  { valHe: String(totalListings),  labelHe: "מודעות פעילות", valEn: String(totalListings), labelEn: "Listings"     },
                ].map(s => (
                  <div key={s.labelEn} style={{
                    background: "rgba(255,255,255,.07)",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 10, padding: "14px 16px", textAlign: "center",
                    minWidth: 80,
                  }}>
                    <div style={{
                      fontFamily: "var(--font-syne,'Syne',sans-serif)",
                      fontSize: 26, fontWeight: 900, color: C.white, lineHeight: 1,
                    }}>
                      {isHe ? s.valHe : s.valEn}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 600, marginTop: 5, lineHeight: 1.3 }}>
                      {isHe ? s.labelHe : s.labelEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 40px 80px" }}>

          {/* Season bar (Ligat Ha'Al only) */}
          {tab === "ligat_haal" && (
            <div style={{ marginBottom: 24 }}>
              <SeasonBar isHe={isHe} />
            </div>
          )}

          {/* Competition tabs + Post CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={`il-tab ${tab === "ligat_haal" ? "active" : "inactive"}`}
                onClick={() => setTab("ligat_haal")}
              >
                {isHe ? "ליגת העל" : "Ligat Ha'Al"}
                <span style={{
                  marginInlineStart: 7, fontSize: 10,
                  background: tab === "ligat_haal" ? "rgba(255,255,255,.18)" : "rgba(26,58,143,.08)",
                  color: tab === "ligat_haal" ? "rgba(255,255,255,.8)" : C.hint,
                  padding: "1px 6px", borderRadius: 3,
                }}>
                  {ligatCount}
                </span>
              </button>
              <button
                className={`il-tab ${tab === "state_cup" ? "active" : "inactive"}`}
                onClick={() => setTab("state_cup")}
              >
                {isHe ? "גביע המדינה" : "State Cup"}
                <span style={{
                  marginInlineStart: 7, fontSize: 10,
                  background: tab === "state_cup" ? "rgba(255,255,255,.18)" : "rgba(26,58,143,.08)",
                  color: tab === "state_cup" ? "rgba(255,255,255,.8)" : C.hint,
                  padding: "1px 6px", borderRadius: 3,
                }}>
                  {stateCupCount}
                </span>
              </button>
            </div>

            <Link href="/post-listing" style={{
              textDecoration: "none",
              padding: "10px 20px", borderRadius: 8,
              background: C.teal, color: C.white,
              fontSize: 13, fontWeight: 800,
            }}>
              {isHe ? "+ פרסם מודעה" : "+ Post listing"}
            </Link>
          </div>

          {/* Section label */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase" as const, color: C.hint, marginBottom: 4,
            }}>
              {tab === "ligat_haal"
                ? (isHe ? "משחקים קרובים · ליגת העל" : "Upcoming · Ligat Ha'Al")
                : (isHe ? "משחקים קרובים · גביע המדינה" : "Upcoming · State Cup")}
            </div>
            <div style={{ height: 1, background: C.border }} />
          </div>

          {/* Match list */}
          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: C.hint, fontSize: 13 }}>
              {isHe ? "טוען משחקים..." : "Loading matches..."}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding: "56px 24px", textAlign: "center",
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>⚽</div>
              <p style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8,
              }}>
                {isHe ? "אין משחקים קרובים" : "No upcoming matches"}
              </p>
              <p style={{ fontSize: 13, color: C.muted }}>
                {isHe ? "בדוק שוב בקרוב" : "Check back soon"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(m => (
                <MatchCard key={m.id} m={m} isHe={isHe} />
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            marginTop: 32,
            fontSize: 11, color: C.hint,
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "10px 14px",
          }}>
            {isHe
              ? "Stayin היא פלטפורמה לחיבור בין משתמשים בלבד. האתר אינו צד לעסקה ואינו אחראי לתוכן המודעות, למחיר, לתשלום או להעברת הכרטיסים."
              : "Stayin is a user-to-user platform only. It is not a party to any transaction and is not responsible for listing content, pricing, payment, or ticket transfer."}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div style={{
          background: "linear-gradient(135deg,#1a3a8f 0%,#0f2252 60%,#0d2a1a 100%)",
          padding: "56px 40px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", top: -60, right: -30, background: "radial-gradient(circle,rgba(26,191,176,.13),transparent 70%)", pointerEvents: "none" }} />
          <div style={{
            maxWidth: 1200, margin: "0 auto",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 28, flexWrap: "wrap",
            position: "relative",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900,
                letterSpacing: "-0.05em", color: C.white, marginBottom: 10,
              }}>
                {isHe ? "יש לך כרטיסים לכדורגל?" : "Got football tickets to sell?"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.45)", maxWidth: 380, lineHeight: 1.65 }}>
                {isHe
                  ? "פרסם מודעה תוך דקה. קונים יפנו אליך ישירות בוואטסאפ. חינמי לחלוטין."
                  : "Post a listing in under a minute. Buyers contact you directly on WhatsApp. 100% free."}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/post-listing" style={{
                textDecoration: "none", padding: "13px 28px",
                borderRadius: 8, background: C.teal, color: C.navy,
                fontSize: 14, fontWeight: 800,
              }}>
                {isHe ? "פרסם מודעה →" : "Post listing →"}
              </Link>
              <Link href="/" style={{
                textDecoration: "none", padding: "13px 20px",
                borderRadius: 8,
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.55)", fontSize: 13, fontWeight: 600,
              }}>
                {isHe ? "חזרה לדף הבית" : "Back to home"}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
