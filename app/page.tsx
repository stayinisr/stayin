"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

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
  bg:     "#f8f9fc",
} as const;

const fHe   = "var(--font-he,'Heebo',sans-serif)";
const fEn   = "var(--font-dm,'DM Sans',sans-serif)";
const fSyne = "var(--font-syne,'Syne',sans-serif)";
function fBody(isHe: boolean) { return isHe ? fHe : fEn; }

// ── Ticker ────────────────────────────────────────────────────────────────────
const TICKER = [
  { en: "2× Argentina vs France · $420",       he: "2× ארגנטינה נגד צרפת · ₪1,550" },
  { en: "WANTED · 4× USA vs Mexico",            he: "מחפש · 4× ארה\"ב נגד מקסיקו" },
  { en: "1× Brazil vs Spain · $310",            he: "1× ברזיל נגד ספרד · ₪1,140" },
  { en: "3× Canada Quarter Final · $280",       he: "3× קנדה רבע גמר · ₪1,030" },
  { en: "WANTED · 2× World Cup Final",          he: "מחפש · 2× גמר המונדיאל" },
  { en: "1× Maccabi TA vs Hapoel · ₪180",      he: "1× מכבי ת\"א נגד הפועל · ₪180" },
  { en: "2× Morocco vs Portugal · $260",        he: "2× מרוקו נגד פורטוגל · ₪960" },
  { en: "WANTED · 1× Semi Final seat",          he: "מחפש · 1× מושב חצי גמר" },
  { en: "2× Maccabi Haifa vs Beitar · ₪220",   he: "2× מכבי חיפה נגד בית\"ר · ₪220" },
];

function Ticker({ isHe }: { isHe: boolean }) {
  const items = [...TICKER, ...TICKER];
  return (
    <>
      <style>{`@keyframes stayin-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div style={{ overflow: "hidden", borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
        <div style={{ display: "flex", animation: "stayin-tick 36s linear infinite", whiteSpace: "nowrap" }}>
          {items.map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 22px", fontSize: 11, fontWeight: 600, color: C.muted, borderRight: `1px solid ${C.border}` }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: i % 3 === 0 ? C.red : i % 3 === 1 ? C.navy : C.teal, display: "inline-block" }} />
              {isHe ? t.he : t.en}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ExpandBands ───────────────────────────────────────────────────────────────
const BANDS = [
  {
    id: "wc2026", en: "World Cup 2026", he: "מונדיאל 2026",
    subEn: "104 matches · USA, Canada & México", subHe: "104 משחקים · ארה\"ב, קנדה ומקסיקו",
    tagEn: "01 · Sports", tagHe: "01 · ספורט", ctaEn: "Browse matches", ctaHe: "לגלישה במשחקים",
    href: "/sports/world-cup-2026",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(230,57,70,0.32)", top: "#e63946", live: true,
  },
  {
    id: "israel", en: "Israeli Football", he: "כדורגל ישראלי",
    subEn: "Ligat Ha'Al & State Cup", subHe: "ליגת העל וגביע המדינה",
    tagEn: "02 · Sports", tagHe: "02 · ספורט", ctaEn: "Explore", ctaHe: "לגלישה",
    href: "/sports/football-israel",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(26,191,176,0.24)", top: "#1abfb0",
  },
  {
    id: "concerts", en: "Live Concerts", he: "הופעות חיות",
    subEn: "Artists, tours & big nights", subHe: "אמנים, טורים ולילות גדולים",
    tagEn: "03 · Live", tagHe: "03 · הופעות", ctaEn: "Explore", ctaHe: "לגלישה",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.24)", top: "#d4a017", isNew: true,
  },
  {
    id: "festivals", en: "Festivals", he: "פסטיבלים",
    subEn: "Multi-day events & summer weekends", subHe: "אירועים מרובי ימים וסופי שבוע",
    tagEn: "04 · Live", tagHe: "04 · הופעות", ctaEn: "Notify me", ctaHe: "עדכנו אותי",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(26,191,176,0.2)", top: "#1abfb0", soon: true,
  },
  {
    id: "basketball", en: "Basketball", he: "כדורסל",
    subEn: "Courts, leagues & playoff nights", subHe: "קורטים, ליגות ולילות פלייאוף",
    tagEn: "05 · Sports", tagHe: "05 · ספורט", ctaEn: "Notify me", ctaHe: "עדכנו אותי",
    href: "/sports",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.2)", top: "#d4a017", soon: true,
  },
];

function ExpandBands({ isHe }: { isHe: boolean }) {
  const [active, setActive] = useState("wc2026");
  return (
    <>
      <style>{`
        .sb{flex:1;position:relative;overflow:hidden;cursor:pointer;transition:flex 420ms cubic-bezier(.4,0,.2,1);border-right:1px solid rgba(255,255,255,.05)}
        .sb:last-child{border-right:none}.sb.on{flex:3.8}
        .sb-img{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.15;transition:opacity 400ms,transform 400ms;transform:scale(1.06)}.sb.on .sb-img{opacity:.48;transform:scale(1)}
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
      <div style={{ display: "flex", height: 380, borderRadius: "6px", overflow: "hidden", background: "#06090f", border: `1px solid ${C.border}` }}>
        {BANDS.map((b) => {
          const on = active === b.id;
          const badge = b.live
            ? { bg: "rgba(230,57,70,.18)", border: "1px solid rgba(230,57,70,.34)", color: "#ff9090", label: isHe ? "פעיל עכשיו" : "Live now" }
            : b.isNew
            ? { bg: "rgba(26,191,176,.15)", border: "1px solid rgba(26,191,176,.3)", color: "#1abfb0", label: isHe ? "חדש" : "New" }
            : { bg: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", label: isHe ? "בקרוב" : "Soon" };
          return (
            <Link key={b.id} href={b.href} className={`sb${on ? " on" : ""}`} onMouseEnter={() => setActive(b.id)} style={{ textDecoration: "none" }}>
              <div className="sb-img" style={{ backgroundImage: `url(${b.img})` }} />
              <div className="sb-grad" />
              <div className="sb-acc" style={{ background: `linear-gradient(155deg,${b.accent},transparent 55%)` }} />
              <div className="sb-top" style={{ background: b.top }} />
              {b.soon && <div className="sb-soon" />}
              <div className="sb-badge" style={{ background: badge.bg, border: badge.border, color: badge.color }}>{badge.label}</div>
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

// ── Value Props — redesigned to match WC aesthetic ────────────────────────────
const VALUE_PROPS = [
  {
    num: "01", color: C.navy,
    titleEn: "Zero fees",       titleHe: "אפס עמלות",
    subEn: "No fees for buyers or sellers. Ever.",
    subHe: "בלי עמלות לקונה או למוכר. אף פעם.",
  },
  {
    num: "02", color: "#25D366",
    titleEn: "WhatsApp direct", titleHe: "ישיר בוואטסאפ",
    subEn: "Contact the seller directly. No middlemen.",
    subHe: "פנייה ישירה למוכר. בלי תיווך.",
  },
  {
    num: "03", color: C.teal,
    titleEn: "Free to post",    titleHe: "פרסום חינמי",
    subEn: "List your tickets in under 60 seconds.",
    subHe: "פרסם כרטיסים תוך פחות מ-60 שניות.",
  },
  {
    num: "04", color: C.red,
    titleEn: "You set the price", titleHe: "אתה קובע את המחיר",
    subEn: "No algorithms. No price manipulation.",
    subHe: "בלי אלגוריתמים. בלי מניפולציות מחיר.",
  },
];

const STEPS = [
  { n: "01", icon: "🔍", en: "Find your event", he: "מצאו את האירוע", dEn: "Browse by category, tournament or show. Every listing sorted by exact match or night — no endless scrolling.", dHe: "גלשו לפי קטגוריה, תחרות או הופעה. כל מודעה ממוינת לפי משחק או ערב ספציפי.", color: C.navy },
  { n: "02", icon: "🎟️", en: "Read the listings", he: "קראו את המודעות", dEn: "Clear prices, seat info and quantities. Sell & buy listings side by side. No hidden fees, ever.", dHe: "מחירים ברורים, פרטי מושבים וכמויות. מודעות קנייה ומכירה זו לצד זו. ללא עמלות.", color: C.teal },
  { n: "03", icon: "💬", en: "Contact directly", he: "פנו ישירות", dEn: "Tap WhatsApp and talk to the seller. No middlemen, no platform fees. Just people.", dHe: "לחצו על וואטסאפ ודברו ישירות. בלי תיווך, בלי עמלות, פשוט אנשים.", color: "#25D366" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  return (
    <>
      <style>{`
        @keyframes stayin-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .su1{animation:stayin-up .5s ease both}
        .su2{animation:stayin-up .5s .08s ease both}
        .su3{animation:stayin-up .5s .16s ease both}
        @media(max-width:640px){
          .steps-grid{grid-template-columns:1fr!important}
          .step-col:not(:first-child){border-left:none!important;border-top:1px solid ${C.border};padding-left:0!important;padding-top:28px!important}
          .cta-inner{flex-direction:column!important;align-items:flex-start!important}
          .hero-btns{flex-direction:column!important}
          .vp-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.white, fontFamily: fBody(isHe) }}>

        <Ticker isHe={isHe} />

        {/* ── HERO ── */}
        <div style={{ background: "transparent", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "44px 16px 40px" }}>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "22px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.hint }}>
              <span style={{ display: "flex", gap: "4px" }}>
                {[C.navy, C.red, C.teal].map(c => <span key={c} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, display: "inline-block" }} />)}
              </span>
              {isHe ? "מרקטפלייס הכרטיסים יד שנייה של ישראל" : "Israel's secondary ticket marketplace"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "40px", alignItems: "center" }} className="hero-grid">
              <div>
                {/* "STAY IN THE GAME" label */}
                <div className="su1" style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase" as const, color: C.navy, marginBottom: "16px" }}>
                  STAY IN THE GAME
                </div>

                {/* H1 — matches WC exactly */}
                {isHe ? (
                  <h1 className="su2" style={{ fontFamily: fHe, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.5px", color: C.text, marginBottom: "18px" }}>
                    כל הכרטיסים
                    <br />
                    <span style={{ color: C.navy }}>במקום אחד.</span>
                  </h1>
                ) : (
                  <h1 className="su2" style={{ fontFamily: fSyne, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em", color: C.text, marginBottom: "18px" }}>
                    ALL TICKETS
                    <br />
                    <span style={{ color: C.navy }}>IN ONE PLACE.</span>
                  </h1>
                )}

                <p className="su3" style={{ fontSize: "15px", fontWeight: 400, color: C.muted, lineHeight: 1.8, maxWidth: "420px", marginBottom: "28px", fontFamily: fBody(isHe) }}>
                  {isHe
                    ? "ספורט, הופעות ופסטיבלים — הכל במקום אחד. קונים ומוכרים מתחברים ישירות. בלי עמלות, בלי תיווך."
                    : "Sports, concerts and festivals — all in one place. Buyers and sellers connect directly. No fees, no middlemen."}
                </p>

                <div className="hero-btns su3" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" as const }}>
                  <Link href="/sports/world-cup-2026" style={{
                    padding: "12px 24px", background: "transparent", color: C.navy,
                    fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none",
                    letterSpacing: "0.02em", border: `2px solid ${C.navy}`, transition: "all 150ms",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.navy; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.navy; }}
                  >
                    {isHe ? "מונדיאל 2026 ↓" : "World Cup 2026 ↓"}
                  </Link>
                  <Link href="/sports/football-israel" style={{
                    padding: "12px 22px", border: `1px solid ${C.border}`, color: C.muted,
                    fontSize: "13px", fontWeight: 500, borderRadius: "4px", textDecoration: "none",
                    background: C.white, transition: "border-color 150ms,color 150ms",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.navy; (e.currentTarget as HTMLElement).style.color = C.navy; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; }}
                  >
                    {isHe ? "כדורגל ישראלי →" : "Israeli Football →"}
                  </Link>
                </div>
              </div>

              {/* Value props — redesigned WC style */}
              <div className="vp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                {VALUE_PROPS.map((v) => (
                  <div key={v.num} style={{ background: C.white, padding: "20px 18px", position: "relative" }}>
                    {/* top accent line */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: v.color }} />
                    <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.hint, marginBottom: "10px" }}>
                      {v.num}
                    </div>
                    <div style={{ fontFamily: fSyne, fontSize: "15px", fontWeight: 800, color: C.text, letterSpacing: "-0.3px", marginBottom: "6px" }}>
                      {isHe ? v.titleHe : v.titleEn}
                    </div>
                    <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.6, fontFamily: fBody(isHe) }}>
                      {isHe ? v.subHe : v.subEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* WC strip */}
        <div style={{ background: C.navy, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["rgba(255,255,255,.35)", "#ff8080", "#4ade80"].map((c, i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
              ))}
            </div>
            <span style={{ fontFamily: fSyne, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>FIFA World Cup 2026</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{isHe ? "48 קבוצות · 104 משחקים · 16 ערים" : "48 teams · 104 matches · 16 host cities"}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", background: "rgba(255,255,255,.08)", padding: "5px 13px", borderRadius: 3, border: "1px solid rgba(255,255,255,.1)" }}>Jun 11 – Jul 19, 2026</span>
        </div>

        {/* ── CATEGORIES ── */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "44px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.hint, marginBottom: 6 }}>
                {isHe ? "קטגוריות" : "Categories"}
              </div>
              <div style={{ fontFamily: fSyne, fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, letterSpacing: "-0.04em", color: C.text, lineHeight: 1 }}>
                {isHe ? "מה אתה מחפש?" : "What are you looking for?"}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.hint }}>{isHe ? "עברו מעל קטגוריה לגלות אותה" : "Hover to explore"}</div>
          </div>
          <ExpandBands isHe={isHe} />
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" as const }}>
            {[
              { en: "Sports", he: "ספורט", c: C.navy, bg: "rgba(26,58,143,.07)", b: "rgba(26,58,143,.13)" },
              { en: "Live Shows", he: "הופעות חיות", c: C.teal, bg: "rgba(26,191,176,.07)", b: "rgba(26,191,176,.14)" },
              { en: "No fees", he: "ללא עמלות", c: C.green, bg: "rgba(0,104,71,.07)", b: "rgba(0,104,71,.13)" },
              { en: "Direct WhatsApp", he: "ישיר לוואטסאפ", c: "#25D366", bg: "rgba(37,211,102,.07)", b: "rgba(37,211,102,.13)" },
              { en: "Free to post", he: "פרסום חינמי", c: C.red, bg: "rgba(230,57,70,.06)", b: "rgba(230,57,70,.12)" },
            ].map((p) => (
              <span key={p.en} style={{ padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 600, color: p.c, background: p.bg, border: `1px solid ${p.b}` }}>
                {isHe ? p.he : p.en}
              </span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ maxWidth: "1100px", margin: "52px auto 0", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" as const }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.hint, marginBottom: 6 }}>
                {isHe ? "איך זה עובד" : "How it works"}
              </div>
              <div style={{ fontFamily: fSyne, fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, letterSpacing: "-0.04em", color: C.text, lineHeight: 1 }}>
                {isHe ? "שלושה צעדים. זהו." : "Three steps. That's it."}
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.hint }}>{isHe ? "בלי סיבוך, בלי תשלומים" : "No complexity, no payments"}</div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}` }} />
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="step-col" style={{ padding: "40px 32px 40px 0", ...(i > 0 ? { paddingLeft: 32, borderLeft: `1px solid ${C.border}` } : {}), position: "relative" }}>
                <div style={{ position: "absolute", bottom: 24, right: 20, fontFamily: fSyne, fontSize: 80, fontWeight: 900, opacity: 0.04, lineHeight: 1, pointerEvents: "none" as const, color: C.text }}>{s.n}</div>
                <div style={{ fontSize: 26, marginBottom: 18 }}>{s.icon}</div>
                <div style={{ fontFamily: fSyne, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: s.color, marginBottom: 10 }}>Step {s.n}</div>
                <div style={{ fontFamily: fSyne, fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 10 }}>{isHe ? s.he : s.en}</div>
                <div style={{ fontSize: 13, lineHeight: 1.75, color: C.muted, fontFamily: fBody(isHe) }}>{isHe ? s.dHe : s.dEn}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}` }} />
        </div>

        {/* ── CTA ── */}
        <div style={{ maxWidth: "1100px", margin: "20px auto 52px", padding: "0 16px" }}>
          <div style={{ padding: "24px", border: `1px solid ${C.border}`, borderRadius: "6px", background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" as const }} className="cta-inner">
            <div>
              <div style={{ fontFamily: fSyne, fontSize: "16px", fontWeight: 800, color: C.text, marginBottom: "4px", letterSpacing: "-0.3px" }}>
                {isHe ? "יש לך כרטיסים למכור?" : "Got tickets to sell?"}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 300, color: C.muted, lineHeight: 1.75, fontFamily: fBody(isHe) }}>
                {isHe ? "פרסם מודעה תוך 60 שניות. קונים יפנו אליך ישירות בוואטסאפ." : "Post a listing in 60 seconds. Buyers contact you directly on WhatsApp."}
              </div>
            </div>
            <Link href="/post-listing" style={{ padding: "12px 26px", background: C.navy, color: "#fff", fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = ".88")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              {isHe ? "פרסם מודעה →" : "Post listing →"}
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}
