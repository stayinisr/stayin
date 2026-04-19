"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../lib/LanguageContext";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  // Page
  pageBg:   "#f4f6ff",
  white:    "#ffffff",
  border:   "#dde3f8",

  // Brand
  navy:     "#1a3a8f",
  red:      "#e63946",
  green:    "#006847",
  teal:     "#1abfb0",

  // Text
  text:     "#0d1b3e",
  muted:    "#5a6a88",
  hint:     "#9aaac4",
} as const;

// ── Ticker items (demo) ───────────────────────────────────────────────────────
const TICKER = [
  { en: "2× Argentina vs France · $420",       he: "2× ארגנטינה נגד צרפת · ₪1,550" },
  { en: "WANTED · 4× USA vs Mexico",            he: "מחפש · 4× ארה\"ב נגד מקסיקו" },
  { en: "1× Brazil vs Spain · $310",            he: "1× ברזיל נגד ספרד · ₪1,140" },
  { en: "3× Canada Quarter Final · $280",       he: "3× קנדה רבע גמר · ₪1,030" },
  { en: "WANTED · 2× World Cup Final",          he: "מחפש · 2× גמר המונדיאל" },
  { en: "1× Germany Group Stage · $190",        he: "1× גרמניה שלב בתים · ₪700" },
  { en: "2× Morocco vs Portugal · $260",        he: "2× מרוקו נגד פורטוגל · ₪960" },
  { en: "WANTED · 1× Semi Final seat",          he: "מחפש · 1× מושב חצי גמר" },
];

// ── Band data ─────────────────────────────────────────────────────────────────
const BANDS = [
  {
    id: "wc2026",
    en: "World Cup 2026", he: "מונדיאל 2026",
    subEn: "104 matches · USA, Canada & México",
    subHe: "104 משחקים · ארה\"ב, קנדה ומקסיקו",
    tagEn: "01 · Sports", tagHe: "01 · ספורט",
    ctaEn: "Browse matches", ctaHe: "לגלישה במשחקים",
    href: "/sports/world-cup-2026",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(230,57,70,0.35)",
    topColor: "#e63946",
    live: true,
  },
  {
    id: "football",
    en: "Football", he: "כדורגל",
    subEn: "Leagues, cups & national teams",
    subHe: "ליגות, גביעים ונבחרות",
    tagEn: "02 · Sports", tagHe: "02 · ספורט",
    ctaEn: "Explore", ctaHe: "לגלישה",
    href: "/sports/football",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(26,191,176,0.25)",
    topColor: "#1abfb0",
  },
  {
    id: "concerts",
    en: "Live Concerts", he: "הופעות חיות",
    subEn: "Artists, tours & big nights",
    subHe: "אמנים, טורים ולילות גדולים",
    tagEn: "03 · Live", tagHe: "03 · הופעות",
    ctaEn: "Explore", ctaHe: "לגלישה",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.25)",
    topColor: "#d4a017",
    isNew: true,
  },
  {
    id: "festivals",
    en: "Festivals", he: "פסטיבלים",
    subEn: "Multi-day events & summer weekends",
    subHe: "אירועים מרובי ימים וסופי שבוע",
    tagEn: "04 · Live", tagHe: "04 · הופעות",
    ctaEn: "Notify me", ctaHe: "עדכנו אותי",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(26,191,176,0.2)",
    topColor: "#1abfb0",
    soon: true,
  },
  {
    id: "basketball",
    en: "Basketball", he: "כדורסל",
    subEn: "Courts, leagues & playoff nights",
    subHe: "קורטים, ליגות ולילות פלייאוף",
    tagEn: "05 · Sports", tagHe: "05 · ספורט",
    ctaEn: "Notify me", ctaHe: "עדכנו אותי",
    href: "/sports",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.2)",
    topColor: "#d4a017",
    soon: true,
  },
];

const STEPS = [
  {
    n: "01",
    en: "Find your event",   he: "מצאו את האירוע",
    dEn: "Browse by category, tournament or show. Every listing is sorted by exact match or night — no endless scrolling.",
    dHe: "גלשו לפי קטגוריה, תחרות או הופעה. כל מודעה ממוינת לפי משחק או ערב ספציפי.",
    color: C.navy,
    bg: "rgba(26,58,143,0.06)",
    border: "rgba(26,58,143,0.14)",
    emoji: "🔍",
  },
  {
    n: "02",
    en: "Read the listings", he: "קראו את המודעות",
    dEn: "See sell & buy listings with clear prices, seat info and quantities. No hidden fees, ever.",
    dHe: "ראו מודעות קנייה ומכירה עם מחירים ברורים, פרטי מושבים וכמויות. ללא עמלות.",
    color: C.teal,
    bg: "rgba(26,191,176,0.06)",
    border: "rgba(26,191,176,0.18)",
    emoji: "🎟️",
  },
  {
    n: "03",
    en: "Contact directly",  he: "פנו ישירות",
    dEn: "Tap WhatsApp and talk to the seller. No middlemen, no platform fees. Just people.",
    dHe: "לחצו על וואטסאפ ודברו ישירות עם המוכר. בלי תיווך. בלי עמלות.",
    color: "#25D366",
    bg: "rgba(37,211,102,0.06)",
    border: "rgba(37,211,102,0.18)",
    emoji: "💬",
  },
];

// ── Ticker component ──────────────────────────────────────────────────────────
function Ticker({ isHe }: { isHe: boolean }) {
  const items = [...TICKER, ...TICKER];
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-inner { display:flex; animation: ticker 32s linear infinite; white-space:nowrap; }
        .ticker-inner:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-inner">
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "0 24px",
              fontSize: 11, fontWeight: 600, color: C.muted,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            <span style={{
              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
              background: i % 3 === 0 ? C.red : i % 3 === 1 ? C.navy : C.teal,
              display: "inline-block",
            }} />
            {isHe ? item.he : item.en}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── ExpandBands ───────────────────────────────────────────────────────────────
function ExpandBands({ isHe }: { isHe: boolean }) {
  const [active, setActive] = useState("wc2026");

  return (
    <>
      <style>{`
        .eb { flex:1; position:relative; overflow:hidden; cursor:pointer;
              transition:flex 420ms cubic-bezier(.4,0,.2,1);
              border-right:1px solid rgba(255,255,255,0.07); }
        .eb:last-child { border-right:none; }
        .eb.on { flex:3.8; }
        .eb-img { position:absolute;inset:0;background-size:cover;background-position:center;
                  opacity:.16;transition:opacity 400ms,transform 400ms;transform:scale(1.04); }
        .eb.on .eb-img { opacity:.46;transform:scale(1.0); }
        .eb-grad { position:absolute;inset:0;
                   background:linear-gradient(180deg,transparent 15%,rgba(5,10,20,.94) 100%); }
        .eb-acc { position:absolute;inset:0;opacity:0;transition:opacity 400ms; }
        .eb.on .eb-acc { opacity:1; }
        .eb-top { position:absolute;top:0;left:0;right:0;height:3px;
                  width:0;transition:width 420ms ease; }
        .eb.on .eb-top { width:100%; }
        .eb-soon { position:absolute;inset:0;background:rgba(5,10,20,.38);
                   backdrop-filter:grayscale(.55);transition:opacity 300ms; }
        .eb.on .eb-soon { opacity:0; }
        .eb-badge { position:absolute;top:14px;left:14px;padding:4px 10px;border-radius:4px;
                    font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
                    opacity:0;transition:opacity 280ms 80ms; }
        .eb.on .eb-badge { opacity:1; }
        .eb-body { position:absolute;bottom:0;left:0;right:0;padding:20px 18px; }
        .eb-tag { font-size:8px;font-weight:800;letter-spacing:.18em;color:rgba(255,255,255,.22);
                  text-transform:uppercase;margin-bottom:7px;transition:color 300ms; }
        .eb.on .eb-tag { color:rgba(255,255,255,.42); }
        .eb-title { font-family:var(--font-syne,'Syne',sans-serif);font-weight:800;color:#fff;
                    letter-spacing:-.04em;line-height:1;font-size:14px;
                    transition:font-size 360ms cubic-bezier(.4,0,.2,1);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
        .eb.on .eb-title { font-size:26px;white-space:normal;text-overflow:unset; }
        .eb-sub { font-size:12px;color:rgba(255,255,255,.5);line-height:1.5;margin-top:6px;
                  max-height:0;overflow:hidden;opacity:0;
                  transition:max-height 340ms ease,opacity 280ms ease; }
        .eb.on .eb-sub { max-height:60px;opacity:1; }
        .eb-cta { display:inline-flex;align-items:center;gap:5px;margin-top:12px;
                  font-size:11px;font-weight:800;color:#1abfb0;letter-spacing:.04em;
                  max-height:0;overflow:hidden;opacity:0;
                  transition:max-height 300ms 60ms ease,opacity 260ms 60ms ease; }
        .eb.on .eb-cta { max-height:32px;opacity:1; }
      `}</style>

      <div style={{
        display: "flex", height: 380,
        borderRadius: 16, overflow: "hidden",
        background: "#060a14",
        boxShadow: "0 24px 60px rgba(6,10,20,.3)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        {BANDS.map((b) => {
          const isOn = active === b.id;
          const badgeStyle = b.live
            ? { background: "rgba(230,57,70,.18)", border: "1px solid rgba(230,57,70,.35)", color: "#ff9090" }
            : b.isNew
            ? { background: "rgba(26,191,176,.14)", border: "1px solid rgba(26,191,176,.28)", color: "#1abfb0" }
            : { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)" };

          return (
            <Link
              key={b.id}
              href={b.href}
              className={`eb${isOn ? " on" : ""}`}
              onMouseEnter={() => setActive(b.id)}
              style={{ textDecoration: "none" }}
            >
              <div className="eb-img" style={{ backgroundImage: `url(${b.img})` }} />
              <div className="eb-grad" />
              <div className="eb-acc" style={{ background: `linear-gradient(155deg,${b.accent} 0%,transparent 55%)` }} />
              <div className="eb-top" style={{ background: b.topColor }} />
              {b.soon && <div className="eb-soon" />}
              <div className="eb-badge" style={badgeStyle}>
                {b.live ? (isHe ? "פעיל עכשיו" : "Live now")
                  : b.isNew ? (isHe ? "חדש" : "New")
                  : (isHe ? "בקרוב" : "Soon")}
              </div>
              <div className="eb-body">
                <div className="eb-tag">{isHe ? b.tagHe : b.tagEn}</div>
                <div className="eb-title">{isHe ? b.he : b.en}</div>
                <div className="eb-sub">{isHe ? b.subHe : b.subEn}</div>
                <div className="eb-cta">{isHe ? b.ctaHe : b.ctaEn} <span>→</span></div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const dir  = isHe ? "rtl" : "ltr";

  const [listingCount, setListingCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .then(({ count }) => setListingCount(count ?? null));
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fu1 { animation: fadeUp .5s ease both; }
        .fu2 { animation: fadeUp .5s .08s ease both; }
        .fu3 { animation: fadeUp .5s .16s ease both; }
        .fu4 { animation: fadeUp .5s .24s ease both; }
      `}</style>

      <div dir={dir} style={{ minHeight: "100vh", background: C.pageBg, fontFamily: "var(--font-dm,'DM Sans',sans-serif)" }}>

        {/* ── TICKER ── */}
        <div style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "11px 0",
          background: C.white,
          overflow: "hidden",
        }}>
          <Ticker isHe={isHe} />
        </div>

        {/* ── HERO ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 28px 0" }}>
          <div style={{
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(26,58,143,0.12)",
            border: `1px solid ${C.border}`,
          }}>

            {/* Hero body — gradient bg */}
            <div style={{
              background: "linear-gradient(135deg, #eef2ff 0%, #fdf0f2 50%, #edfff8 100%)",
              padding: "52px 52px 48px",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 48,
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative blobs */}
              <div style={{
                position: "absolute", top: -60, right: 200,
                width: 320, height: 320, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(230,57,70,0.08), transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -80, left: -40,
                width: 280, height: 280, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(26,58,143,0.08), transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", top: 20, right: -40,
                width: 240, height: 240, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,104,71,0.07), transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Left: text */}
              <div style={{ position: "relative" }}>
                {/* Kicker */}
                <div className="fu1" style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "7px 14px", borderRadius: 999,
                  background: "rgba(26,58,143,0.07)",
                  border: "1px solid rgba(26,58,143,0.16)",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                  color: C.navy, marginBottom: 22,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.navy, display: "inline-block" }} />
                  {isHe ? "מרקטפלייס הכרטיסים יד שנייה של ישראל" : "Israel's secondary ticket marketplace"}
                </div>

                {/* Headline — words in WC2026 colors */}
                <h1 className="fu2" style={{
                  margin: "0 0 22px",
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "clamp(40px,5vw,66px)",
                  fontWeight: 900, lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                }}>
                  {isHe ? (
                    <>
                      <span style={{ color: C.navy }}>מצא</span>{" "}
                      <span style={{ color: C.red }}>כרטיסים.</span>
                      <br />
                      <span style={{ color: C.green }}>דלג</span>{" "}
                      <span style={{ color: C.navy }}>על הבלאגן.</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: C.navy }}>Find</span>{" "}
                      <span style={{ color: C.red }}>tickets.</span>
                      <br />
                      <span style={{ color: C.green }}>Skip</span>{" "}
                      <span style={{ color: C.navy }}>the chaos.</span>
                    </>
                  )}
                </h1>

                <p className="fu3" style={{
                  margin: "0 0 30px",
                  fontSize: 16, lineHeight: 1.7,
                  color: C.muted, maxWidth: 480,
                }}>
                  {isHe
                    ? "ספורט, הופעות ופסטיבלים — הכל במקום אחד ברור. קונים ומוכרים ישירות. בלי עמלות, בלי תיווך."
                    : "Sports, concerts and festivals — all in one clear place. Buyers and sellers connect directly. No fees, no middlemen."}
                </p>

                <div className="fu4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/sports/world-cup-2026" style={{
                    textDecoration: "none",
                    padding: "13px 26px", borderRadius: 8,
                    background: C.navy, color: C.white,
                    fontSize: 14, fontWeight: 800,
                    boxShadow: "0 8px 24px rgba(26,58,143,0.28)",
                    transition: "opacity 150ms",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = ".88"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                  >
                    {isHe ? "גלישה במשחקים →" : "Browse matches →"}
                  </Link>

                  <Link href="/post-listing" style={{
                    textDecoration: "none",
                    padding: "13px 22px", borderRadius: 8,
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(8px)",
                    border: `1.5px solid ${C.border}`,
                    color: C.text,
                    fontSize: 14, fontWeight: 700,
                    transition: "border-color 150ms",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.navy}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
                  >
                    {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                  </Link>
                </div>
              </div>

              {/* Right: stats grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 10, flexShrink: 0, minWidth: 240,
              }}>
                {[
                  { n: "104",  l: isHe ? "משחקים"  : "Matches",     c: C.navy,    bg: "rgba(26,58,143,0.06)",  b: "rgba(26,58,143,0.14)" },
                  { n: "0%",   l: isHe ? "עמלות"   : "Fees",        c: C.teal,    bg: "rgba(26,191,176,0.06)", b: "rgba(26,191,176,0.16)" },
                  { n: "WA",   l: isHe ? "ישיר"    : "Direct",      c: "#25D366", bg: "rgba(37,211,102,0.06)", b: "rgba(37,211,102,0.16)" },
                  {
                    n: listingCount !== null ? String(listingCount) : "—",
                    l: isHe ? "מודעות חיות" : "Live listings",
                    c: C.red,
                    bg: "rgba(230,57,70,0.06)",
                    b:  "rgba(230,57,70,0.14)",
                  },
                ].map(s => (
                  <div key={s.l} style={{
                    padding: "18px 18px 14px",
                    borderRadius: 12,
                    background: s.bg,
                    border: `1px solid ${s.b}`,
                  }}>
                    <div style={{
                      fontFamily: "var(--font-syne,'Syne',sans-serif)",
                      fontSize: 28, fontWeight: 900,
                      color: s.c, letterSpacing: "-0.05em",
                    }}>{s.n}</div>
                    <div style={{
                      fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase" as const,
                      color: C.hint, marginTop: 4,
                    }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* WC Strip */}
            <div style={{
              background: C.navy,
              padding: "14px 52px",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 20,
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {[C.navy, C.red, C.green].map((c, i) => (
                    <span key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: i === 0 ? "rgba(255,255,255,0.4)" : c === C.red ? "#ff8080" : "#4ade80",
                      display: "inline-block",
                    }} />
                  ))}
                </div>
                <span style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)",
                }}>
                  FIFA World Cup 2026
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  {isHe ? "48 קבוצות · 104 משחקים · 16 ערים" : "48 teams · 104 matches · 16 host cities"}
                </span>
              </div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.08)",
                padding: "6px 14px", borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                Jun 11 – Jul 19, 2026
              </div>
            </div>
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 28px 0" }}>

          {/* Section header */}
          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", gap: 16,
            marginBottom: 16,
          }}>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase" as const,
                color: C.navy, marginBottom: 6, opacity: 0.6,
              }}>
                {isHe ? "קטגוריות" : "Categories"}
              </div>
              <div style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "clamp(20px,2.5vw,30px)",
                fontWeight: 800, letterSpacing: "-0.04em",
                color: C.text, lineHeight: 1,
              }}>
                {isHe ? "מה אתה מחפש?" : "What are you looking for?"}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.hint }}>
              {isHe ? "עברו מעל קטגוריה לגלות אותה" : "Hover to explore each category"}
            </div>
          </div>

          <ExpandBands isHe={isHe} />

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { en: "Sports",         he: "ספורט",          c: C.navy,    bg: "rgba(26,58,143,0.07)",  b: "rgba(26,58,143,0.14)" },
              { en: "Live Shows",     he: "הופעות חיות",    c: C.teal,    bg: "rgba(26,191,176,0.07)", b: "rgba(26,191,176,0.16)" },
              { en: "No fees",        he: "ללא עמלות",      c: C.green,   bg: "rgba(0,104,71,0.07)",   b: "rgba(0,104,71,0.14)" },
              { en: "Direct WhatsApp",he: "ישיר לוואטסאפ", c: "#25D366", bg: "rgba(37,211,102,0.07)", b: "rgba(37,211,102,0.15)" },
              { en: "Free to post",   he: "פרסום חינמי",   c: C.red,     bg: "rgba(230,57,70,0.06)",  b: "rgba(230,57,70,0.14)" },
            ].map(p => (
              <span key={p.en} style={{
                padding: "5px 13px", borderRadius: 6,
                background: p.bg, border: `1px solid ${p.b}`,
                fontSize: 11, fontWeight: 600, color: p.c,
                letterSpacing: "0.03em",
              }}>
                {isHe ? p.he : p.en}
              </span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 28px 0" }}>
          <div style={{
            background: C.white,
            borderRadius: 24,
            border: `1px solid ${C.border}`,
            padding: "44px 48px",
            boxShadow: "0 4px 24px rgba(26,58,143,0.05)",
          }}>
            {/* Header */}
            <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase" as const,
                  color: C.teal, marginBottom: 6,
                }}>
                  {isHe ? "איך זה עובד" : "How it works"}
                </div>
                <div style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "clamp(20px,2.5vw,30px)",
                  fontWeight: 800, letterSpacing: "-0.04em",
                  color: C.text, lineHeight: 1,
                }}>
                  {isHe ? "שלושה צעדים. זהו." : "Three steps. That's it."}
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.hint, maxWidth: 320 }}>
                {isHe
                  ? "בלי הרשמות מסובכות, בלי תשלומים, בלי ביורוקרטיה"
                  : "No complex sign-ups, no payments, no bureaucracy"}
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {STEPS.map((s, i) => (
                <div key={s.n} style={{
                  padding: "28px 24px",
                  borderRadius: 16,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Big number watermark */}
                  <div style={{
                    position: "absolute", top: -10, right: 14,
                    fontFamily: "var(--font-syne,'Syne',sans-serif)",
                    fontSize: 72, fontWeight: 900,
                    color: s.color, opacity: 0.06,
                    lineHeight: 1, userSelect: "none",
                    pointerEvents: "none",
                  }}>
                    {s.n}
                  </div>

                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: C.white,
                    border: `1px solid ${s.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, marginBottom: 16,
                    boxShadow: `0 4px 12px ${s.border}`,
                  }}>
                    {s.emoji}
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                  }}>
                    <span style={{
                      fontFamily: "var(--font-syne,'Syne',sans-serif)",
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.16em", textTransform: "uppercase" as const,
                      color: s.color,
                    }}>{s.n}</span>
                    <div style={{ flex: 1, height: 1, background: s.border }} />
                  </div>

                  <div style={{
                    fontFamily: "var(--font-syne,'Syne',sans-serif)",
                    fontSize: 18, fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: C.text, marginBottom: 10,
                  }}>
                    {isHe ? s.he : s.en}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: C.muted }}>
                    {isHe ? s.dHe : s.dEn}
                  </div>

                  {/* Arrow connector (not last) */}
                  {i < 2 && (
                    <div style={{
                      position: "absolute", top: "50%", right: -22,
                      transform: "translateY(-50%)",
                      fontSize: 16, color: C.hint, zIndex: 2,
                    }}>›</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA STRIP ── */}
        <div style={{ maxWidth: 1280, margin: "24px auto 0", padding: "0 28px 64px" }}>
          <div style={{
            borderRadius: 24,
            background: `linear-gradient(135deg, ${C.navy} 0%, #0f2252 60%, #0d2a1a 100%)`,
            padding: "48px 52px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            gap: 32, flexWrap: "wrap",
            position: "relative", overflow: "hidden",
            boxShadow: "0 24px 60px rgba(26,58,143,0.24)",
          }}>
            {/* Decorative blobs */}
            <div style={{
              position: "absolute", top: -60, right: -40,
              width: 260, height: 260, borderRadius: "50%",
              background: "radial-gradient(circle,rgba(26,191,176,0.15),transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -50, left: 120,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle,rgba(230,57,70,0.12),transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
              <div style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "clamp(22px,3vw,36px)",
                fontWeight: 900, letterSpacing: "-0.05em",
                color: C.white, lineHeight: 1.05, marginBottom: 10,
              }}>
                {isHe ? "יש לך כרטיסים למכור?" : "Got tickets to sell?"}
              </div>
              <div style={{
                fontSize: 15, color: "rgba(255,255,255,0.5)",
                lineHeight: 1.65, maxWidth: 460,
              }}>
                {isHe
                  ? "פרסם מודעה תוך דקה. קונים יפנו אליך ישירות בוואטסאפ. חינמי לחלוטין."
                  : "Post a listing in under a minute. Buyers contact you directly on WhatsApp. Completely free."}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexShrink: 0, position: "relative" }}>
              <Link href="/post-listing" style={{
                textDecoration: "none",
                padding: "14px 30px", borderRadius: 8,
                background: C.teal, color: C.navy,
                fontSize: 14, fontWeight: 800,
                transition: "opacity 150ms",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = ".88"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
              >
                {isHe ? "פרסם מודעה →" : "Post listing →"}
              </Link>
              <Link href="/sports/world-cup-2026" style={{
                textDecoration: "none",
                padding: "14px 22px", borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.65)",
                fontSize: 14, fontWeight: 600,
              }}>
                {isHe ? "חיפוש כרטיסים" : "Find tickets"}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
