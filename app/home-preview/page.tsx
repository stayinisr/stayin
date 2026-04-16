"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        "#f7f8fb",
  white:     "#ffffff",
  text:      "#0d1b3e",
  muted:     "#5a6a88",
  hint:      "#9aaac4",
  border:    "rgba(13,27,62,0.08)",
  navy:      "#0f2252",
  teal:      "#1abfb0",
  tealSoft:  "rgba(26,191,176,0.10)",
  red:       "#e63946",
  redSoft:   "rgba(230,57,70,0.08)",
  gold:      "#d4a017",
} as const;

// ── Category data ─────────────────────────────────────────────────────────────
const SPORTS = [
  {
    id: "wc2026",
    en: "World Cup 2026", he: "מונדיאל 2026",
    subEn: "104 matches · USA, Canada & México",
    subHe: "104 משחקים · ארה\"ב, קנדה ומקסיקו",
    badgeEn: "🔥 Live now", badgeHe: "🔥 פעיל עכשיו",
    href: "/sports/world-cup-2026",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
    accent: C.red, featured: true,
  },
  {
    id: "football",
    en: "Football", he: "כדורגל",
    subEn: "Leagues, cups & national teams",
    subHe: "ליגות, גביעים ונבחרות",
    badgeEn: "Popular", badgeHe: "פופולרי",
    href: "/sports/football",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    accent: C.teal, featured: false,
  },
  {
    id: "basketball",
    en: "Basketball", he: "כדורסל",
    subEn: "Coming soon",
    subHe: "בקרוב",
    badgeEn: "Soon", badgeHe: "בקרוב",
    href: "/sports",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    accent: C.gold, featured: false,
  },
];

const LIVE = [
  {
    id: "concerts",
    en: "Live Concerts", he: "הופעות חיות",
    subEn: "Artists, tours & big nights",
    subHe: "אמנים, טורים ולילות גדולים",
    badgeEn: "New", badgeHe: "חדש",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
    accent: C.teal, featured: true,
  },
  {
    id: "festivals",
    en: "Festivals", he: "פסטיבלים",
    subEn: "Multi-day events & summer weekends",
    subHe: "אירועים מרובי ימים וסופי שבוע",
    badgeEn: "Soon", badgeHe: "בקרוב",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    accent: C.gold, featured: false,
  },
  {
    id: "tours",
    en: "Artists & Tours", he: "אמנים וטורים",
    subEn: "The right night, no endless scrolling",
    subHe: "הערב הנכון, בלי לאבד את עצמך",
    badgeEn: "Soon", badgeHe: "בקרוב",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=800&q=80",
    accent: C.red, featured: false,
  },
];

const TICKER_ITEMS = [
  { en: "2× Argentina vs France · $420",    he: "2× ארגנטינה נגד צרפת · ₪1,550" },
  { en: "1× Brazil vs Spain · $310",         he: "1× ברזיל נגד ספרד · ₪1,140" },
  { en: "LOOKING · 4× USA vs Mexico",         he: "מחפש · 4× ארה\"ב נגד מקסיקו" },
  { en: "3× Canada Quarter Final · $280",    he: "3× קנדה רבע גמר · ₪1,030" },
  { en: "LOOKING · 2× World Cup Final",      he: "מחפש · 2× גמר המונדיאל" },
  { en: "1× Germany Group Stage · $190",     he: "1× גרמניה שלב בתים · ₪700" },
];

const STEPS = [
  {
    n: "01",
    en: "Find your event",      he: "מצאו את האירוע",
    descEn: "Browse by sport, tournament or show. Every listing is organised by exact match or night.",
    descHe: "גלשו לפי ספורט, תחרות או הופעה. כל מודעה ממוינת לפי משחק או ערב ספציפי.",
    icon: "⚽",
  },
  {
    n: "02",
    en: "Read the listings",    he: "קראו את המודעות",
    descEn: "See sell & buy listings with clear prices, seat info and quantities. No hidden fees.",
    descHe: "ראו מודעות קנייה ומכירה עם מחירים ברורים, פרטי מושבים וכמויות. ללא עמלות.",
    icon: "🎟️",
  },
  {
    n: "03",
    en: "Contact directly",     he: "פנו ישירות",
    descEn: "Tap WhatsApp and talk to the seller. No middlemen. No platform fees. Just people.",
    descHe: "לחצו על וואטסאפ ודברו ישירות עם המוכר. בלי תיווך. בלי עמלות. פשוט אנשים.",
    icon: "💬",
  },
];

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker({ isHe }: { isHe: boolean }) {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div style={{
        display: "flex", gap: "0",
        animation: "ticker 28s linear infinite",
        whiteSpace: "nowrap",
      }}>
        {items.map((item, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "0 28px",
            fontSize: "12px", fontWeight: 600, color: C.muted,
            letterSpacing: "0.01em",
            borderRight: `1px solid ${C.border}`,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i % 2 === 0 ? C.teal : C.red,
              flexShrink: 0, display: "inline-block",
            }}/>
            {isHe ? item.he : item.en}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Category Card ─────────────────────────────────────────────────────────────
function CatCard({
  card, isHe, featured = false,
}: {
  card: typeof SPORTS[0]; isHe: boolean; featured?: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <Link href={card.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative",
          height: featured ? 420 : 300,
          borderRadius: 24,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          boxShadow: hov
            ? "0 28px 64px rgba(13,27,62,0.18)"
            : "0 8px 32px rgba(13,27,62,0.08)",
          transition: "box-shadow 300ms, transform 300ms",
          transform: hov ? "translateY(-4px)" : "translateY(0)",
          cursor: "pointer",
        }}
      >
        {/* Image */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${card.img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: hov ? "scale(1.06)" : "scale(1.01)",
          transition: "transform 500ms ease",
        }}/>

        {/* Overlays */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(7,14,30,0.08) 0%, rgba(7,14,30,0.28) 35%, rgba(7,14,30,0.90) 100%)",
        }}/>
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${card.accent}22 0%, transparent 50%)`,
        }}/>

        {/* Badge */}
        <div style={{
          position: "absolute", top: 18, left: 18,
          padding: "6px 12px", borderRadius: 999,
          background: "rgba(255,255,255,0.13)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.04em",
        }}>
          {isHe ? card.badgeHe : card.badgeEn}
        </div>

        {/* Content */}
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 22 }}>
          <div style={{
            fontFamily: "var(--font-syne,'Syne',sans-serif)",
            fontSize: featured ? 36 : 26,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: 8,
          }}>
            {isHe ? card.he : card.en}
          </div>
          <div style={{
            fontSize: 13, color: "rgba(255,255,255,0.68)",
            lineHeight: 1.45,
          }}>
            {isHe ? card.subHe : card.subEn}
          </div>
          <div style={{
            marginTop: 14,
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 700, color: card.accent,
            opacity: hov ? 1 : 0,
            transform: hov ? "translateX(0)" : "translateX(-8px)",
            transition: "all 250ms",
          }}>
            {isHe ? "כניסה לקטגוריה" : "Enter category"} →
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";

  return (
    <>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.55s ease both; }
        .anim-2 { animation: fadeUp 0.55s 0.1s ease both; }
        .anim-3 { animation: fadeUp 0.55s 0.2s ease both; }
        .anim-4 { animation: fadeUp 0.55s 0.3s ease both; }
      `}</style>

      <div dir={dir} style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-dm,'DM Sans',sans-serif)" }}>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "48px 28px 0",
        }}>
          <div style={{
            borderRadius: 32,
            background: C.white,
            border: `1px solid ${C.border}`,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(13,27,62,0.06)",
          }}>

            {/* Ticker bar */}
            <div style={{
              borderBottom: `1px solid ${C.border}`,
              padding: "13px 0",
              background: "rgba(247,248,251,0.6)",
            }}>
              <Ticker isHe={isHe} />
            </div>

            {/* Hero body */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 40,
              padding: "52px 52px 48px",
              alignItems: "center",
            }}>
              <div className="anim-1">
                {/* Label */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 999,
                  background: C.tealSoft,
                  border: "1px solid rgba(26,191,176,0.2)",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                  color: "#0d7a72", marginBottom: 22,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block" }}/>
                  {isHe ? "מרקטפלייס הכרטיסים יד שנייה של ישראל" : "Israel's secondary ticket marketplace"}
                </div>

                {/* Headline */}
                <h1 style={{
                  margin: "0 0 20px",
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "clamp(40px,5.5vw,68px)",
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: "-0.05em",
                  color: C.text,
                }}>
                  {isHe ? (
                    <>הכרטיסים הנכונים.<br /><span style={{ color: C.teal }}>בלי</span> הבלאגן.</>
                  ) : (
                    <>The right tickets.<br /><span style={{ color: C.teal }}>Without</span> the chaos.</>
                  )}
                </h1>

                <p style={{
                  margin: "0 0 32px",
                  fontSize: 17, lineHeight: 1.7,
                  color: C.muted, maxWidth: 520,
                }}>
                  {isHe
                    ? "ספורט, הופעות ופסטיבלים — מרוכז במקום אחד ברור. מוכרים ישירות, קונים ישירות, בלי תיווך ובלי עמלות."
                    : "Sports, concerts and festivals — all in one clean place. Sellers sell directly, buyers find directly. No middlemen, no fees."}
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/sports/world-cup-2026" style={{
                    textDecoration: "none",
                    padding: "14px 26px",
                    borderRadius: 999,
                    background: C.navy,
                    color: "#fff",
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: "0.01em",
                    boxShadow: "0 10px 30px rgba(15,34,82,0.22)",
                    transition: "opacity 150ms",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = ".88"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                  >
                    {isHe ? "גלישה במשחקים →" : "Browse matches →"}
                  </Link>
                  <Link href="/post-listing" style={{
                    textDecoration: "none",
                    padding: "14px 26px",
                    borderRadius: 999,
                    background: "transparent",
                    color: C.text,
                    fontSize: 14, fontWeight: 700,
                    border: `1px solid ${C.border}`,
                    transition: "border-color 150ms",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#9aaac4"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
                  >
                    {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                  </Link>
                </div>
              </div>

              {/* Stats block */}
              <div className="anim-2" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                borderRadius: 20,
                overflow: "hidden",
                border: `1px solid ${C.border}`,
                background: C.border,
                flexShrink: 0,
                minWidth: 260,
              }}>
                {[
                  { n: "104",  l: isHe ? "משחקים" : "Matches",        c: C.navy },
                  { n: "0%",   l: isHe ? "עמלה"   : "Fees",           c: C.teal },
                  { n: "WA",   l: isHe ? "ישיר"   : "Direct",         c: "#25D366" },
                  { n: "FREE", l: isHe ? "פרסום"  : "To post",        c: C.red },
                ].map(s => (
                  <div key={s.l} style={{
                    background: C.white,
                    padding: "22px 22px 18px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-syne,'Syne',sans-serif)",
                      fontSize: 28, fontWeight: 900,
                      color: s.c, letterSpacing: "-0.05em",
                    }}>{s.n}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.12em", textTransform: "uppercase" as const,
                      color: C.hint, marginTop: 4,
                    }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SPORTS ────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 28px 0" }}>
          <SectionLabel
            eyebrow={isHe ? "ספורט" : "Sports"}
            title={isHe ? "כרטיסי ספורט" : "Sports Tickets"}
            sub={isHe
              ? "ממונדיאל 2026 ועד הליגות הגדולות — כל המשחקים, מחירים ברורים"
              : "From World Cup 2026 to the biggest leagues — all matches, clear prices"}
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "1.72fr 1fr 1fr",
            gap: 16,
          }}>
            <CatCard card={SPORTS[0]} isHe={isHe} featured />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CatCard card={SPORTS[1]} isHe={isHe} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CatCard card={SPORTS[2]} isHe={isHe} />
            </div>
          </div>
        </div>

        {/* ── LIVE SHOWS ────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 28px 0" }}>
          <SectionLabel
            eyebrow={isHe ? "הופעות" : "Live Shows"}
            title={isHe ? "הופעות חיות" : "Live Shows"}
            sub={isHe
              ? "הופעות, פסטיבלים ואמנים — מחוברים ישירות לאנשים"
              : "Concerts, festivals and artists — connected directly to people"}
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            gap: 16,
          }}>
            <CatCard card={LIVE[0]} isHe={isHe} featured />
            <CatCard card={LIVE[1]} isHe={isHe} />
            <CatCard card={LIVE[2]} isHe={isHe} />
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 28px 0" }}>
          <SectionLabel
            eyebrow={isHe ? "איך זה עובד" : "How it works"}
            title={isHe ? "שלושה צעדים, זהו." : "Three steps. That's it."}
            sub={isHe
              ? "מצאו, קראו, פנו. הכל קורה ישירות בין אנשים."
              : "Find, read, contact. Everything happens directly between people."}
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}>
            {STEPS.map((step) => (
              <div key={step.n} style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "32px 28px",
                boxShadow: "0 4px 20px rgba(13,27,62,0.05)",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  marginBottom: 18,
                }}>
                  <div style={{
                    width: 46, height: 46,
                    borderRadius: 12,
                    background: C.tealSoft,
                    border: "1px solid rgba(26,191,176,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-syne,'Syne',sans-serif)",
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.18em", textTransform: "uppercase" as const,
                    color: C.teal,
                  }}>
                    {step.n}
                  </div>
                </div>
                <div style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: 22, fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: C.text, marginBottom: 10,
                }}>
                  {isHe ? step.he : step.en}
                </div>
                <div style={{
                  fontSize: 14, lineHeight: 1.7,
                  color: C.muted,
                }}>
                  {isHe ? step.descHe : step.descEn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA STRIP ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: "44px auto 0", padding: "0 28px 64px" }}>
          <div style={{
            borderRadius: 28,
            background: C.navy,
            padding: "48px 52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* BG glow */}
            <div style={{
              position: "absolute", top: -80, right: -80,
              width: 300, height: 300, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(26,191,176,0.18), transparent 70%)",
              pointerEvents: "none",
            }}/>
            <div style={{
              position: "absolute", bottom: -60, left: 100,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(230,57,70,0.12), transparent 70%)",
              pointerEvents: "none",
            }}/>

            <div style={{ position: "relative" }}>
              <div style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "clamp(24px,3vw,38px)",
                fontWeight: 900, letterSpacing: "-0.05em",
                color: "#fff", lineHeight: 1.05,
                marginBottom: 10,
              }}>
                {isHe ? "יש לך כרטיסים למכור?" : "Got tickets to sell?"}
              </div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 480 }}>
                {isHe
                  ? "פרסם מודעה תוך דקה. קונים יפנו אליך ישירות בוואטסאפ. חינמי לחלוטין."
                  : "Post a listing in under a minute. Buyers contact you directly on WhatsApp. Completely free."}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexShrink: 0, position: "relative" }}>
              <Link href="/post-listing" style={{
                textDecoration: "none",
                padding: "15px 30px",
                borderRadius: 999,
                background: C.teal,
                color: C.navy,
                fontSize: 14, fontWeight: 800,
                letterSpacing: "0.01em",
                transition: "opacity 150ms",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = ".88"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
              >
                {isHe ? "פרסם מודעה →" : "Post listing →"}
              </Link>
              <Link href="/sports/world-cup-2026" style={{
                textDecoration: "none",
                padding: "15px 24px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 14, fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.12)",
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

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: C.teal, marginBottom: 6,
      }}>
        {eyebrow}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div style={{
          fontFamily: "var(--font-syne,'Syne',sans-serif)",
          fontSize: "clamp(22px,2.8vw,32px)",
          fontWeight: 800, letterSpacing: "-0.04em",
          color: C.text, lineHeight: 1,
        }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: C.muted, maxWidth: 380, textAlign: "right" as const }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
