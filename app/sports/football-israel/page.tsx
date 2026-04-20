"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../lib/LanguageContext";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  navy:   "#1a3a8f",
  red:    "#e63946",
  green:  "#006847",
  teal:   "#1abfb0",
  text:   "#0d1b3e",
  muted:  "#5a6a88",
  hint:   "#9aaac4",
  border: "#e8edf5",
  bg:     "#f8f9fc",
  white:  "#ffffff",
  gold:   "#d4a017",
} as const;

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
  home_color: string;
  away_color: string;
  stadium: string;
  stadium_en: string;
  city: string;
  city_en: string;
  match_date: string;
  match_time: string;
  status: string;
  sell_count?: number;
  buy_count?: number;
};

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

// ── Team Badge ────────────────────────────────────────────────────────────────
function TeamBadge({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const isTBD = name === "TBD";
  const initials = isTBD ? "?" : name.slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: isTBD ? "rgba(154,170,196,.12)" : `${color}22`,
      border: `1.5px solid ${isTBD ? C.border : color + "44"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-syne,'Syne',sans-serif)",
      fontSize: size * 0.36, fontWeight: 900,
      color: isTBD ? C.hint : color,
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
  const total   = (m.sell_count ?? 0) + (m.buy_count ?? 0);

  return (
    <Link href={`/sports/football-israel/${m.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: C.white,
          border: `1px solid ${isSoon ? "rgba(26,191,176,.25)" : C.border}`,
          borderRadius: 12, padding: "18px 20px",
          display: "grid", gridTemplateColumns: "1fr auto",
          gap: 16, alignItems: "center",
          boxShadow: isSoon ? "0 0 0 1px rgba(26,191,176,.1)" : "0 1px 4px rgba(13,27,62,.04)",
          transition: "box-shadow 200ms, border-color 200ms",
          cursor: "pointer",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 4px 20px rgba(13,27,62,.1)";
          el.style.borderColor = C.teal + "66";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = isSoon ? "0 0 0 1px rgba(26,191,176,.1)" : "0 1px 4px rgba(13,27,62,.04)";
          el.style.borderColor = isSoon ? "rgba(26,191,176,.25)" : C.border;
        }}
      >
        {/* Left */}
        <div>
          {/* Badges row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              padding: "3px 8px", borderRadius: 4,
              background: "rgba(26,58,143,.06)", border: "1px solid rgba(26,58,143,.1)",
              color: C.navy,
            }}>
              {isHe ? m.round : m.round_en}
            </span>
            {isToday && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                padding: "3px 8px", borderRadius: 4,
                background: "rgba(230,57,70,.1)", border: "1px solid rgba(230,57,70,.2)",
                color: C.red,
              }}>
                {isHe ? "היום" : "Today"}
              </span>
            )}
            {!isToday && isSoon && days > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                padding: "3px 8px", borderRadius: 4,
                background: "rgba(26,191,176,.1)", border: "1px solid rgba(26,191,176,.2)",
                color: C.teal,
              }}>
                {isHe ? `בעוד ${days} ימים` : `In ${days} days`}
              </span>
            )}
            {m.competition === "state_cup" && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                padding: "3px 8px", borderRadius: 4,
                background: "rgba(212,160,23,.1)", border: "1px solid rgba(212,160,23,.2)",
                color: C.gold,
              }}>
                {isHe ? "גביע" : "Cup"}
              </span>
            )}
          </div>

          {/* Teams */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
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
                {isHe ? m.away_team : m.away_team_en}
              </div>
              <div style={{ fontSize: 10, color: C.hint, fontWeight: 600, marginTop: 2 }}>
                {isHe ? "חוץ" : "Away"}
              </div>
            </div>
            <TeamBadge name={m.away_team} color={m.away_color} />
          </div>

          {/* Meta */}
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

        {/* Right: counts */}
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
            background: "rgba(26,58,143,.06)", border: "1px solid rgba(26,58,143,.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: C.navy,
          }}>→</div>
        </div>
      </div>
    </Link>
  );
}

// ── Season Bar ────────────────────────────────────────────────────────────────
function SeasonBar({ total, isHe }: { total: number; isHe: boolean }) {
  const played = 29, allRounds = 33;
  const pct = Math.round((played / allRounds) * 100);
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
            {isHe ? "עונת 2025–26" : "Season 2025–26"}
          </span>
          <span style={{ fontSize: 11, color: C.hint }}>
            {isHe ? `מחזור ${played} מתוך ${allRounds}` : `Matchday ${played} of ${allRounds}`}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: C.border, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, width: `${pct}%`,
            background: `linear-gradient(90deg, ${C.navy}, ${C.teal})`,
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
  const isHe = lang === "he";
  const dir  = isHe ? "rtl" : "ltr";

  const [tab, setTab]         = useState<Competition>("ligat_haal");
  const [matches, setMatches] = useState<ILMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // ── Fetch matches + listing counts from Supabase ──────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);

      // 1. Fetch upcoming matches
      const { data: matchData, error: matchErr } = await supabase
        .from("israeli_matches")
        .select("*")
        .gte("match_date", new Date().toISOString().slice(0, 10))
        .order("match_date", { ascending: true });

      if (matchErr || !matchData) {
        setError(true);
        setLoading(false);
        return;
      }

      // 2. Fetch listing counts grouped by israeli_match_id
      const { data: listingData } = await supabase
        .from("listings")
        .select("israeli_match_id, type")
        .in("israeli_match_id", matchData.map(m => m.id))
        .eq("status", "active");

      // 3. Merge counts into matches
      const enriched: ILMatch[] = matchData.map(m => {
        const related = listingData?.filter(l => l.israeli_match_id === m.id) ?? [];
        return {
          ...m,
          sell_count: related.filter(l => l.type === "sell").length,
          buy_count:  related.filter(l => l.type === "buy").length,
        };
      });

      setMatches(enriched);
      setLoading(false);
    }

    load();
  }, []);

  const filtered      = matches.filter(m => m.competition === tab);
  const ligatCount    = matches.filter(m => m.competition === "ligat_haal").length;
  const cupCount      = matches.filter(m => m.competition === "state_cup").length;
  const totalListings = matches.reduce((a, m) => a + (m.sell_count ?? 0) + (m.buy_count ?? 0), 0);

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
        .il-tab.active{background:${C.navy};color:${C.white};box-shadow:0 4px 14px rgba(26,58,143,.3)}
        .il-tab.inactive{background:${C.white};color:${C.muted};border:1px solid ${C.border}}
        .il-tab.inactive:hover{background:${C.bg};color:${C.text}}
        @media(max-width:640px){
          .il-hero-grid{grid-template-columns:1fr!important}
          .il-stats{grid-template-columns:repeat(2,1fr)!important}
          .il-topbar{flex-direction:column!important;align-items:flex-start!important}
        }
      `}</style>

      <div dir={dir} style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-dm,'DM Sans',sans-serif)" }}>

        {/* ── HERO ── */}
        <div style={{
          background: "linear-gradient(135deg,#0d2a1a 0%,#0f2252 60%,#1a3a8f 100%)",
          padding: "56px 40px 48px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", top: -140, right: -60, background: "radial-gradient(circle,rgba(26,191,176,.12),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", bottom: -100, left: -40, background: "radial-gradient(circle,rgba(230,57,70,.1),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)", fontSize: 180, opacity: 0.03, pointerEvents: "none", userSelect: "none" as const, color: "#fff" }}>✡</div>

          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
            {/* Breadcrumb */}
            <div className="il1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>
              <Link href="/" style={{ color: "rgba(255,255,255,.35)", textDecoration: "none" }}>{isHe ? "דף הבית" : "Home"}</Link>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,.6)" }}>{isHe ? "ספורט" : "Sports"}</span>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,.85)" }}>{isHe ? "כדורגל ישראלי" : "Israeli Football"}</span>
            </div>

            <div className="il-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
              <div>
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
                  fontSize: "clamp(34px,5vw,56px)", fontWeight: 900, lineHeight: 0.9,
                  letterSpacing: "-2.5px", margin: "0 0 18px", color: C.white,
                }}>
                  {isHe
                    ? <><span style={{ color: "#fff" }}>כדורגל </span><span style={{ color: "#1abfb0" }}>ישראלי</span></>
                    : <><span style={{ color: "#fff" }}>Israeli </span><span style={{ color: "#1abfb0" }}>Football</span></>}
                </h1>

                <p className="il3" style={{ fontSize: 14, color: "rgba(255,255,255,.48)", lineHeight: 1.7, maxWidth: 420, margin: "0 0 24px" }}>
                  {isHe
                    ? "כרטיסים לליגת העל וגביע המדינה — ישירות בין מוכר לקונה. אפס עמלות."
                    : "Tickets for Ligat Ha'Al and the State Cup — directly between buyer and seller. Zero fees."}
                </p>

                <div className="il3" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { he: "ליגת העל",       en: "Ligat Ha'Al",     c: C.teal    },
                    { he: "גביע המדינה",    en: "State Cup",       c: C.gold    },
                    { he: "ישיר לוואטסאפ", en: "Direct WhatsApp", c: "#25D366" },
                    { he: "0% עמלות",       en: "0% Fees",         c: C.red     },
                  ].map(t => (
                    <span key={t.en} style={{
                      padding: "5px 12px", borderRadius: 5,
                      background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                      fontSize: 11, fontWeight: 600, color: t.c,
                    }}>
                      {isHe ? t.he : t.en}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="il-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { v: String(ligatCount),    lHe: "משחקי ליגה",    lEn: "League games"  },
                  { v: String(cupCount),       lHe: "משחקי גביע",    lEn: "Cup games"     },
                  { v: String(totalListings),  lHe: "מודעות פעילות", lEn: "Listings"      },
                ].map(s => (
                  <div key={s.lEn} style={{
                    background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 10, padding: "14px 16px", textAlign: "center", minWidth: 80,
                  }}>
                    <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: 26, fontWeight: 900, color: C.white, lineHeight: 1 }}>
                      {loading ? "–" : s.v}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 600, marginTop: 5, lineHeight: 1.3 }}>
                      {isHe ? s.lHe : s.lEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 40px 80px" }}>

          {tab === "ligat_haal" && !loading && (
            <div style={{ marginBottom: 24 }}>
              <SeasonBar total={ligatCount} isHe={isHe} />
            </div>
          )}

          {/* Tabs + CTA */}
          <div className="il-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["ligat_haal", "state_cup"] as Competition[]).map(c => (
                <button
                  key={c}
                  className={`il-tab ${tab === c ? "active" : "inactive"}`}
                  onClick={() => setTab(c)}
                >
                  {c === "ligat_haal"
                    ? (isHe ? "ליגת העל" : "Ligat Ha'Al")
                    : (isHe ? "גביע המדינה" : "State Cup")}
                  <span style={{
                    marginInlineStart: 7, fontSize: 10,
                    background: tab === c ? "rgba(255,255,255,.18)" : "rgba(26,58,143,.08)",
                    color: tab === c ? "rgba(255,255,255,.8)" : C.hint,
                    padding: "1px 6px", borderRadius: 3,
                  }}>
                    {loading ? "–" : c === "ligat_haal" ? ligatCount : cupCount}
                  </span>
                </button>
              ))}
            </div>
            <Link href="/post-listing" style={{
              textDecoration: "none", padding: "10px 20px", borderRadius: 8,
              background: C.teal, color: C.white, fontSize: 13, fontWeight: 800,
            }}>
              {isHe ? "+ פרסם מודעה" : "+ Post listing"}
            </Link>
          </div>

          {/* Section label */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: C.hint, marginBottom: 4 }}>
              {tab === "ligat_haal"
                ? (isHe ? "משחקים קרובים · ליגת העל" : "Upcoming · Ligat Ha'Al")
                : (isHe ? "משחקים קרובים · גביע המדינה" : "Upcoming · State Cup")}
            </div>
            <div style={{ height: 1, background: C.border }} />
          </div>

          {/* States */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: 110, borderRadius: 12,
                  background: `linear-gradient(90deg, ${C.border} 25%, #f0f3f8 50%, ${C.border} 75%)`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                }} />
              ))}
              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          ) : error ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <p style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                {isHe ? "שגיאה בטעינה" : "Failed to load"}
              </p>
              <p style={{ fontSize: 13, color: C.muted }}>{isHe ? "נסה לרענן את הדף" : "Try refreshing the page"}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>⚽</div>
              <p style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                {isHe ? "אין משחקים קרובים" : "No upcoming matches"}
              </p>
              <p style={{ fontSize: 13, color: C.muted }}>{isHe ? "בדוק שוב בקרוב" : "Check back soon"}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(m => <MatchCard key={m.id} m={m} isHe={isHe} />)}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            marginTop: 32, fontSize: 11, color: C.hint,
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
          padding: "56px 40px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", top: -60, right: -30, background: "radial-gradient(circle,rgba(26,191,176,.13),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap", position: "relative" }}>
            <div>
              <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900, letterSpacing: "-0.05em", color: C.white, marginBottom: 10 }}>
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
                textDecoration: "none", padding: "13px 20px", borderRadius: 8,
                background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)",
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
