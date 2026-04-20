"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

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
  white:  "#ffffff",
} as const;

// ── Ticker data ───────────────────────────────────────────────────────────────
const TICKER = [
  { en: "2× Argentina vs France · $420",         he: "2× ארגנטינה נגד צרפת · ₪1,550" },
  { en: "WANTED · 4× USA vs Mexico",              he: "מחפש · 4× ארה\"ב נגד מקסיקו" },
  { en: "1× Brazil vs Spain · $310",              he: "1× ברזיל נגד ספרד · ₪1,140" },
  { en: "3× Canada Quarter Final · $280",         he: "3× קנדה רבע גמר · ₪1,030" },
  { en: "WANTED · 2× World Cup Final",            he: "מחפש · 2× גמר המונדיאל" },
  { en: "1× Maccabi TA vs Hapoel · ₪180",        he: "1× מכבי ת\"א נגד הפועל · ₪180" },
  { en: "2× Morocco vs Portugal · $260",          he: "2× מרוקו נגד פורטוגל · ₪960" },
  { en: "WANTED · 1× Semi Final seat",            he: "מחפש · 1× מושב חצי גמר" },
  { en: "2× Maccabi Haifa vs Beitar · ₪220",     he: "2× מכבי חיפה נגד בית\"ר · ₪220" },
];

// ── Bands ─────────────────────────────────────────────────────────────────────
const BANDS = [
  {
    id: "wc2026",
    en: "World Cup 2026",    he: "מונדיאל 2026",
    subEn: "104 matches · USA, Canada & México",
    subHe: "104 משחקים · ארה\"ב, קנדה ומקסיקו",
    tagEn: "01 · Sports",   tagHe: "01 · ספורט",
    ctaEn: "Browse matches", ctaHe: "לגלישה במשחקים",
    href: "/sports/world-cup-2026",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(230,57,70,0.32)", top: "#e63946", live: true,
  },
  {
    id: "israel",
    en: "Israeli Football",  he: "כדורגל ישראלי",
    subEn: "Ligat Ha'Al & State Cup",
    subHe: "ליגת העל וגביע המדינה",
    tagEn: "02 · Sports",   tagHe: "02 · ספורט",
    ctaEn: "Explore",        ctaHe: "לגלישה",
    href: "/sports/football-israel",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(26,191,176,0.24)", top: "#1abfb0",
  },
  {
    id: "concerts",
    en: "Live Concerts",     he: "הופעות חיות",
    subEn: "Artists, tours & big nights",
    subHe: "אמנים, טורים ולילות גדולים",
    tagEn: "03 · Live",     tagHe: "03 · הופעות",
    ctaEn: "Explore",        ctaHe: "לגלישה",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.24)", top: "#d4a017", isNew: true,
  },
  {
    id: "festivals",
    en: "Festivals",         he: "פסטיבלים",
    subEn: "Multi-day events & summer weekends",
    subHe: "אירועים מרובי ימים וסופי שבוע",
    tagEn: "04 · Live",     tagHe: "04 · הופעות",
    ctaEn: "Notify me",      ctaHe: "עדכנו אותי",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(26,191,176,0.2)", top: "#1abfb0", soon: true,
  },
  {
    id: "basketball",
    en: "Basketball",        he: "כדורסל",
    subEn: "Courts, leagues & playoff nights",
    subHe: "קורטים, ליגות ולילות פלייאוף",
    tagEn: "05 · Sports",   tagHe: "05 · ספורט",
    ctaEn: "Notify me",      ctaHe: "עדכנו אותי",
    href: "/sports",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.2)", top: "#d4a017", soon: true,
  },
];

const VALUE_PROPS = [
  { icon: "✓",  titleEn: "0% fees",       titleHe: "0% עמלות", subEn: "No fees for anyone",     subHe: "בלי עמלות לאף אחד" },
  { icon: "💬", titleEn: "WhatsApp",       titleHe: "וואטסאפ",  subEn: "Direct, fast, simple",   subHe: "ישיר, מהיר, פשוט" },
  { icon: "🆓", titleEn: "Free to post",   titleHe: "חינמי",    subEn: "Always, for everyone",   subHe: "פרסום ללא עלות" },
  { icon: "🤝", titleEn: "No middlemen",   titleHe: "ישיר",     subEn: "You set the price",      subHe: "בין אנשים בלבד" },
];

const STEPS = [
  {
    n: "01", icon: "🔍",
    en: "Find your event",   he: "מצאו את האירוע",
    dEn: "Browse by category, tournament or show. Every listing sorted by exact match or night — no endless scrolling.",
    dHe: "גלשו לפי קטגוריה, תחרות או הופעה. כל מודעה ממוינת לפי משחק או ערב ספציפי.",
    color: C.navy,
  },
  {
    n: "02", icon: "🎟️",
    en: "Read the listings",  he: "קראו את המודעות",
    dEn: "Clear prices, seat info and quantities. Sell & buy listings side by side. No hidden fees, ever.",
    dHe: "מחירים ברורים, פרטי מושבים וכמויות. מודעות קנייה ומכירה זו לצד זו. ללא עמלות.",
    color: C.teal,
  },
  {
    n: "03", icon: "💬",
    en: "Contact directly",   he: "פנו ישירות",
    dEn: "Tap WhatsApp and talk to the seller. No middlemen, no platform fees. Just people.",
    dHe: "לחצו על וואטסאפ ודברו ישירות. בלי תיווך, בלי עמלות, פשוט אנשים.",
    color: "#25D366",
  },
];

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker({ isHe }: { isHe: boolean }) {
  const items = [...TICKER, ...TICKER];
  return (
    <>
      <style>{`@keyframes stayin-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div style={{ overflow: "hidden", borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
        <div style={{ display: "flex", animation: "stayin-tick 36s linear infinite", whiteSpace: "nowrap" }}>
          {items.map((t, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "0 22px", fontSize: 11, fontWeight: 600, color: C.muted,
              borderRight: `1px solid ${C.border}`,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                background: i % 3 === 0 ? C.red : i % 3 === 1 ? C.navy : C.teal,
                display: "inline-block",
              }} />
              {isHe ? t.he : t.en}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ExpandBands ───────────────────────────────────────────────────────────────
function ExpandBands({ isHe }: { isHe: boolean }) {
  const [active, setActive] = useState("wc2026");
  return (
    <>
      <style>{`
        .sb{flex:1;position:relative;overflow:hidden;cursor:pointer;transition:flex 420ms cubic-bezier(.4,0,.2,1);border-right:1px solid rgba(255,255,255,.05)}
        .sb:last-child{border-right:none}
        .sb.on{flex:3.8}
        .sb-img{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.15;transition:opacity 400ms,transform 400ms;transform:scale(1.06)}
        .sb.on .sb-img{opacity:.48;transform:scale(1)}
        .sb-grad{position:absolute;inset:0;background:linear-gradient(180deg,transparent 10%,rgba(4,8,18,.96) 100%)}
        .sb-acc{position:absolute;inset:0;opacity:0;transition:opacity 400ms}.sb.on .sb-acc{opacity:1}
        .sb-top{position:absolute;top:0;left:0;right:0;height:3px;width:0;transition:width 420ms}.sb.on .sb-top{width:100%}
        .sb-badge{position:absolute;top:14px;left:14px;padding:4px 10px;border-radius:4px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:0;transition:opacity 250ms 80ms}.sb.on .sb-badge{opacity:1}
        .sb-body{position:absolute;bottom:0;left:0;right:0;padding:22px 18px}
        .sb-tag{font-size:8px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:8px;transition:color 280ms}.sb.on .sb-tag{color:rgba(255,255,255,.4)}
        .sb-title{font-family:var(--font-syne,'Syne',sans-serif);font-weight:800;color:#fff;letter-spacing:-.04em;line-height:1;font-size:13px;transition:font-size 380ms cubic-bezier(.4,0,.2,1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sb.on .sb-title{font-size:24px;white-space:normal;text-overflow:unset}
        .sb-sub{font-size:12px;color:rgba(255,255,255,.48);line-height:1.5;margin-top:7px;max-height:0;overflow:hidden;opacity:0;transition:max-height 340ms,opacity 280ms}.sb.on .sb-sub{max-height:56px;opacity:1}
        .sb-cta{display:inline-flex;align-items:center;gap:5px;margin-top:12px;font-size:11px;font-weight:800;color:#1abfb0;letter-spacing:.04em;max-height:0;overflow:hidden;opacity:0;transition:max-height 300ms 70ms,opacity 260ms 70ms}.sb.on .sb-cta{max-height:30px;opacity:1}
        .sb-soon{position:absolute;inset:0;background:rgba(4,8,18,.42);transition:opacity 300ms}.sb.on .sb-soon{opacity:0}
        @media(max-width:640px){.sb.on{flex:4}.sb.on .sb-title{font-size:18px}}
      `}</style>
      <div style={{
        display: "flex", height: 380, borderRadius: 16,
        overflow: "hidden", background: "#06090f",
        boxShadow: "0 18px 52px rgba(6,10,20,.2)",
      }}>
        {BANDS.map((b) => {
          const on = active === b.id;
          const badge = b.live
            ? { bg: "rgba(230,57,70,.18)", border: "1px solid rgba(230,57,70,.34)", color: "#ff9090", label: isHe ? "פעיל עכשיו" : "Live now" }
            : b.isNew
            ? { bg: "rgba(26,191,176,.15)", border: "1px solid rgba(26,191,176,.3)", color: "#1abfb0", label: isHe ? "חדש" : "New" }
            : { bg: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", label: isHe ? "בקרוב" : "Soon" };
          return (
            <Link
              key={b.id}
              href={b.href}
              className={`sb${on ? " on" : ""}`}
              onMouseEnter={() => setActive(b.id)}
              style={{ textDecoration: "none" }}
            >
              <div className="sb-img" style={{ backgroundImage: `url(${b.img})` }} />
              <div className="sb-grad" />
              <div className="sb-acc" style={{ background: `linear-gradient(155deg,${b.accent},transparent 55%)` }} />
              <div className="sb-top" style={{ background: b.top }} />
              {b.soon && <div className="sb-soon" />}
              <div className="sb-badge" style={{ background: badge.bg, border: badge.border, color: badge.color }}>
                {badge.label}
              </div>
              <div className="sb-body">
                <div className="sb-tag">{isHe ? b.tagHe : b.tagEn}</div>
                <div className="sb-title">{isHe ? b.he : b.en}</div>
                <div className="sb-sub">{isHe ? b.subHe : b.subEn}</div>
                <div className="sb-cta">{isHe ? b.ctaHe : b.ctaEn} →</div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const dir  = isHe ? "rtl" : "ltr";

  return (
    <>
      <style>{`
        @keyframes stayin-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .su1{animation:stayin-up .5s ease both}
        .su2{animation:stayin-up .5s .08s ease both}
        .su3{animation:stayin-up .5s .16s ease both}
        @media(max-width:640px){
          .hero-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr!important}
          .step-col:not(:first-child){border-left:none!important;border-top:1px solid ${C.border};padding-left:0!important;padding-top:28px!important}
          .vp-grid{grid-template-columns:1fr 1fr!important}
          .cta-inner{flex-direction:column!important;align-items:flex-start!important}
          .hero-btns{flex-direction:column!important}
        }
      `}</style>

      <div dir={dir} style={{ minHeight: "100vh", background: C.white, fontFamily: "var(--font-dm,'DM Sans',sans-serif)" }}>

        {/* TICKER */}
        <Ticker isHe={isHe} />

        {/* ── HERO ── */}
        <div style={{
          background: "linear-gradient(135deg,#eef2ff 0%,#fdf0f2 52%,#edfff8 100%)",
          padding: "72px 40px 64px",
          position: "relative", overflow: "hidden",
        }}>
          {/* blobs */}
          {[
            { w: 400, t: -120, r: -80,  c: "rgba(230,57,70,.06)" },
            { w: 320, b: -100, l: -60,  c: "rgba(26,58,143,.06)" },
            { w: 260, t: 40,   r: "30%",c: "rgba(0,104,71,.05)"  },
          ].map((b, i) => (
            <div key={i} style={{
              position: "absolute", width: b.w, height: b.w, borderRadius: "50%",
              background: `radial-gradient(circle,${b.c},transparent 70%)`,
              top: (b as any).t, bottom: (b as any).b,
              left: (b as any).l, right: (b as any).r,
              pointerEvents: "none",
            }} />
          ))}

          <div className="hero-grid" style={{
            maxWidth: 1200, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr auto",
            gap: 52, alignItems: "center", position: "relative",
          }}>
            {/* Left: text */}
            <div>
              <div className="su1" style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(26,58,143,.07)", border: "1px solid rgba(26,58,143,.14)",
                fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 22,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.navy, display: "inline-block" }} />
                {isHe ? "מרקטפלייס הכרטיסים יד שנייה של ישראל" : "Israel's secondary ticket marketplace"}
              </div>

              <h1 className="su2" style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "clamp(42px,6vw,68px)",
                fontWeight: 900, lineHeight: 0.87,
                letterSpacing: "-3.5px", margin: "0 0 22px",
              }}>
                {isHe ? (
                  <><span style={{ color: C.navy }}>מצא </span><span style={{ color: C.red }}>כרטיסים.</span><br /><span style={{ color: C.green }}>דלג </span><span style={{ color: C.navy }}>על הבלאגן.</span></>
                ) : (
                  <><span style={{ color: C.navy }}>Find </span><span style={{ color: C.red }}>tickets.</span><br /><span style={{ color: C.green }}>Skip </span><span style={{ color: C.navy }}>the chaos.</span></>
                )}
              </h1>

              <p className="su3" style={{
                fontSize: 16, lineHeight: 1.72, color: C.muted,
                maxWidth: 480, margin: "0 0 30px",
              }}>
                {isHe
                  ? "ספורט, הופעות ופסטיבלים — הכל במקום אחד ברור. קונים ומוכרים מתחברים ישירות. בלי עמלות, בלי תיווך."
                  : "Sports, concerts and festivals — all in one clear place. Buyers and sellers connect directly. No fees, no middlemen."}
              </p>

              <div className="hero-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/sports/world-cup-2026" style={{
                  textDecoration: "none", padding: "14px 28px",
                  borderRadius: 8, background: C.navy, color: C.white,
                  fontSize: 14, fontWeight: 800,
                  boxShadow: "0 8px 24px rgba(26,58,143,.24)",
                }}>
                  {isHe ? "מונדיאל 2026 →" : "World Cup 2026 →"}
                </Link>
                <Link href="/sports/football-israel" style={{
                  textDecoration: "none", padding: "14px 22px",
                  borderRadius: 8,
                  background: "rgba(26,191,176,.1)",
                  border: "1px solid rgba(26,191,176,.25)",
                  color: C.teal,
                  fontSize: 14, fontWeight: 700,
                }}>
                  {isHe ? "כדורגל ישראלי →" : "Israeli Football →"}
                </Link>
              </div>
            </div>

            {/* Right: 2×2 value props */}
            <div className="vp-grid" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 8, flexShrink: 0, minWidth: 220,
            }}>
              {VALUE_PROPS.map((v) => (
                <div key={v.titleEn} style={{
                  padding: "16px 14px", borderRadius: 12, textAlign: "center",
                  background: "rgba(255,255,255,.7)",
                  border: "1px solid rgba(255,255,255,.95)",
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{v.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                    {isHe ? v.titleHe : v.titleEn}
                  </div>
                  <div style={{ fontSize: 10, color: C.hint, lineHeight: 1.35 }}>
                    {isHe ? v.subHe : v.subEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WC strip */}
        <div style={{
          background: C.navy, padding: "13px 40px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["rgba(255,255,255,.35)", "#ff8080", "#4ade80"].map((c, i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
              ))}
            </div>
            <span style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>
              FIFA World Cup 2026
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
              {isHe ? "48 קבוצות · 104 משחקים · 16 ערים" : "48 teams · 104 matches · 16 host cities"}
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)",
            background: "rgba(255,255,255,.08)", padding: "5px 13px",
            borderRadius: 4, border: "1px solid rgba(255,255,255,.1)",
          }}>Jun 11 – Jul 19, 2026</span>
        </div>

        {/* ── CATEGORIES ── */}
        <div style={{ maxWidth: 1200, margin: "60px auto 0", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: C.navy, opacity: 0.55, marginBottom: 6 }}>
                {isHe ? "קטגוריות" : "Categories"}
              </div>
              <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, letterSpacing: "-0.04em", color: C.text, lineHeight: 1 }}>
                {isHe ? "מה אתה מחפש?" : "What are you looking for?"}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.hint }}>{isHe ? "עברו מעל קטגוריה לגלות אותה" : "Hover to explore"}</div>
          </div>
          <ExpandBands isHe={isHe} />
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { en: "Sports",          he: "ספורט",          c: C.navy,    bg: "rgba(26,58,143,.07)",  b: "rgba(26,58,143,.13)" },
              { en: "Live Shows",      he: "הופעות חיות",    c: C.teal,    bg: "rgba(26,191,176,.07)", b: "rgba(26,191,176,.14)" },
              { en: "No fees",         he: "ללא עמלות",      c: C.green,   bg: "rgba(0,104,71,.07)",   b: "rgba(0,104,71,.13)" },
              { en: "Direct WhatsApp", he: "ישיר לוואטסאפ", c: "#25D366", bg: "rgba(37,211,102,.07)", b: "rgba(37,211,102,.13)" },
              { en: "Free to post",    he: "פרסום חינמי",   c: C.red,     bg: "rgba(230,57,70,.06)",  b: "rgba(230,57,70,.12)" },
            ].map((p) => (
              <span key={p.en} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: p.c, background: p.bg, border: `1px solid ${p.b}` }}>
                {isHe ? p.he : p.en}
              </span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ maxWidth: 1200, margin: "72px auto 0", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: C.teal, marginBottom: 6 }}>
                {isHe ? "איך זה עובד" : "How it works"}
              </div>
              <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, letterSpacing: "-0.04em", color: C.text, lineHeight: 1 }}>
                {isHe ? "שלושה צעדים. זהו." : "Three steps. That's it."}
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.hint }}>{isHe ? "בלי סיבוך, בלי תשלומים" : "No complexity, no payments"}</div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}` }} />

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="step-col" style={{
                padding: "40px 32px 40px 0",
                ...(i > 0 ? { paddingLeft: 32, borderLeft: `1px solid ${C.border}` } : {}),
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", bottom: 24, right: 20,
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: 80, fontWeight: 900, opacity: 0.04,
                  lineHeight: 1, pointerEvents: "none", color: C.text,
                }}>{s.n}</div>
                <div style={{ fontSize: 26, marginBottom: 18 }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: s.color, marginBottom: 10 }}>
                  Step {s.n}
                </div>
                <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 10 }}>
                  {isHe ? s.he : s.en}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.75, color: C.muted }}>
                  {isHe ? s.dHe : s.dEn}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}` }} />
        </div>

        {/* ── CTA ── */}
        <div style={{
          background: "linear-gradient(135deg,#1a3a8f 0%,#0f2252 55%,#0d2a1a 100%)",
          padding: "72px 40px", marginTop: 72,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", top: -70, right: -40, background: "radial-gradient(circle,rgba(26,191,176,.14),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", bottom: -60, left: 80, background: "radial-gradient(circle,rgba(230,57,70,.11),transparent 70%)", pointerEvents: "none" }} />
          <div className="cta-inner" style={{
            maxWidth: 1200, margin: "0 auto",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 32, flexWrap: "wrap",
            position: "relative",
          }}>
            <div>
              <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(26px,4vw,36px)", fontWeight: 900, letterSpacing: "-0.05em", color: C.white, lineHeight: 1, marginBottom: 12 }}>
                {isHe ? "יש לך כרטיסים למכור?" : "Got tickets to sell?"}
              </div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,.48)", lineHeight: 1.65, maxWidth: 420 }}>
                {isHe
                  ? "פרסם מודעה תוך דקה. קונים יפנו אליך ישירות בוואטסאפ. חינמי לחלוטין."
                  : "Post a listing in under a minute. Buyers contact you directly on WhatsApp. Completely free."}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" }}>
              <Link href="/post-listing" style={{
                textDecoration: "none", padding: "14px 30px",
                borderRadius: 8, background: C.teal, color: C.navy,
                fontSize: 14, fontWeight: 800,
              }}>
                {isHe ? "פרסם מודעה →" : "Post listing →"}
              </Link>
              <Link href="/sports/world-cup-2026" style={{
                textDecoration: "none", padding: "14px 22px",
                borderRadius: 8, background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.6)", fontSize: 14, fontWeight: 600,
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
