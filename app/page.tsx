"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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
type TickerItem = { text: string; type: string; href: string };

function Ticker({ isHe }: { isHe: boolean }) {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    async function load() {
      // Fetch active listings with match info
      const { data: listings } = await supabase
        .from("listings")
        .select("type, price, quantity, match_id, israeli_match_id")
        .eq("status", "active")
        .is("archived_at", null)
        .order("last_bumped_at", { ascending: false })
        .limit(20);

      if (!listings?.length) return;

      // Fetch WC match names
      const wcIds = [...new Set(listings.filter(l => l.match_id).map(l => l.match_id))];
      const ilIds = [...new Set(listings.filter(l => l.israeli_match_id).map(l => l.israeli_match_id))];

      const [{ data: wcMatches }, { data: ilMatches }] = await Promise.all([
        wcIds.length ? supabase.from("matches").select("id,home_team_name,away_team_name").in("id", wcIds) : { data: [] },
        ilIds.length ? supabase.from("israeli_matches").select("id,home_team,away_team,home_team_en,away_team_en").in("id", ilIds) : { data: [] },
      ]);

      const wcMap: Record<string, string> = {};
      (wcMatches || []).forEach((m: any) => { wcMap[m.id] = `${m.home_team_name || "TBD"} vs ${m.away_team_name || "TBD"}`; });

      const ilMapHe: Record<string, string> = {};
      const ilMapEn: Record<string, string> = {};
      (ilMatches || []).forEach((m: any) => {
        ilMapHe[m.id] = `${m.home_team} נגד ${m.away_team}`;
        ilMapEn[m.id] = `${m.home_team_en} vs ${m.away_team_en}`;
      });

      const built: TickerItem[] = listings.map(l => {
        const matchHe = l.match_id ? wcMap[l.match_id] : (l.israeli_match_id ? ilMapHe[l.israeli_match_id] : null);
        const matchEn = l.match_id ? wcMap[l.match_id] : (l.israeli_match_id ? ilMapEn[l.israeli_match_id] : null);
        const match = isHe ? matchHe : matchEn;
        if (!match) return null;
        const qty = `${l.quantity}×`;
        const price = l.price ? (l.match_id ? `$${l.price}` : `₪${l.price}`) : "";
        const text = l.type === "buy"
          ? (isHe ? `מחפש · ${qty} ${match}` : `WANTED · ${qty} ${match}`)
          : `${qty} ${match}${price ? ` · ${price}` : ""}`;
        const href = l.match_id
          ? `/matches/${l.match_id}`
          : `/sports/football-israel/${l.israeli_match_id}`;
        return { text, type: l.type, href };
      }).filter(Boolean) as TickerItem[];

      if (built.length) setItems(built);
    }
    load();
  }, [isHe]);

  if (!items.length) return null;

  const doubled = [...items, ...items];
  return (
    <>
      <style>{`@keyframes stayin-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div style={{ overflow: "hidden", borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
        <div style={{ display: "flex", animation: `stayin-tick ${Math.max(20, doubled.length * 3)}s linear infinite`, whiteSpace: "nowrap" }}>
          {doubled.map((t, i) => (
            <a key={i} href={t.href} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 22px", fontSize: 11, fontWeight: 600, color: C.muted, borderRight: `1px solid ${C.border}`, flexShrink: 0, textDecoration: "none", cursor: "pointer", transition: "color 150ms" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: t.type === "buy" ? C.navy : t.type === "sell" ? C.red : C.teal, display: "inline-block" }} />
              {t.text}
            </a>
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
    tagEn: "01 · Sports", tagHe: "01 · ספורט", ctaEn: "Browse matches", ctaHe: "לצפייה במשחקים",
    href: "/sports/world-cup-2026",
    img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(230,57,70,0.32)", top: "#e63946", live: true,
    bgGrad: "linear-gradient(135deg,#1a3a6b,#e63946)",
  },
  {
    id: "israel", en: "Israeli Football", he: "כדורגל ישראלי",
    subEn: "Ligat Ha'Al & State Cup", subHe: "ליגת העל וגביע המדינה",
    tagEn: "02 · Sports", tagHe: "02 · ספורט", ctaEn: "Browse matches", ctaHe: "לצפייה במשחקים",
    href: "/sports/football-israel",
    img: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(26,191,176,0.24)", top: "#1abfb0",
    bgGrad: "linear-gradient(135deg,#1a3a8f,#006847)",
  },
  {
    id: "concerts", en: "Live Concerts", he: "הופעות חיות",
    subEn: "Artists, tours & big nights", subHe: "אמנים, טורים ולילות גדולים",
    tagEn: "03 · Live", tagHe: "03 · הופעות", ctaEn: "View Shows", ctaHe: "הופעות",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.24)", top: "#d4a017", soon: false,
    bgGrad: "linear-gradient(135deg,#4a3000,#d4a017)",
  },
  {
    id: "basketball", en: "Basketball IL", he: "כדורסל ישראלי",
    subEn: "Leagues, playoff & israeli cup", subHe: "ליגה, פליאוף וגביע המדינה",
    tagEn: "04 · Sports", tagHe: "04 · ספורט", ctaEn: "Soon", ctaHe: "בקרוב",
    href: "/sports",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
    accent: "rgba(212,160,23,0.2)", top: "#d4a017", soon: true,
    bgGrad: "linear-gradient(135deg,#2a1a6b,#d4a017)",
  },
];

function ExpandBands({ isHe }: { isHe: boolean }) {
  const [active, setActive] = useState("wc2026");
  return (
    <>
      <style>{`
        /* ── Desktop: horizontal expand ── */
        .sb{flex:1;position:relative;overflow:hidden;cursor:pointer;transition:flex 420ms cubic-bezier(.4,0,.2,1);border-right:1px solid rgba(255,255,255,.05)}
        .sb:last-child{border-right:none}.sb.on{flex:3.8}
        .sb-img{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.30;transition:opacity 400ms,transform 400ms;transform:scale(1.06)}.sb.on .sb-img{opacity:.82;transform:scale(1)}
        .sb-grad{position:absolute;inset:0;background:linear-gradient(180deg,transparent 20%,rgba(4,8,18,.82) 100%)}
        .sb-acc{position:absolute;inset:0;opacity:0;transition:opacity 400ms}.sb.on .sb-acc{opacity:1}
        .sb-top{position:absolute;top:0;left:0;right:0;height:3px;width:0;transition:width 420ms}.sb.on .sb-top{width:100%}
        .sb-badge{position:absolute;top:14px;left:14px;padding:4px 10px;border-radius:4px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:0;transition:opacity 250ms 80ms}.sb.on .sb-badge{opacity:1}
        .sb-body{position:absolute;bottom:0;left:0;right:0;padding:22px 18px}
        .sb-tag{font-size:8px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:8px;transition:color 280ms}.sb.on .sb-tag{color:rgba(255,255,255,.4)}
        .sb-title{font-family:var(--font-syne,'Syne',sans-serif);font-weight:800;color:#fff;letter-spacing:-.04em;line-height:1;font-size:13px;transition:font-size 380ms cubic-bezier(.4,0,.2,1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sb.on .sb-title{font-size:24px;white-space:normal;text-overflow:unset}
        .sb-sub{font-size:12px;color:rgba(255,255,255,.48);line-height:1.5;margin-top:7px;max-height:0;overflow:hidden;opacity:0;transition:max-height 340ms,opacity 280ms}.sb.on .sb-sub{max-height:56px;opacity:1}
        .sb-cta{display:inline-flex;align-items:center;gap:5px;margin-top:12px;font-size:11px;font-weight:800;color:#1abfb0;letter-spacing:.04em;max-height:0;overflow:hidden;opacity:0;transition:max-height 300ms 70ms,opacity 260ms 70ms}.sb.on .sb-cta{max-height:30px;opacity:1}
        .sb-soon{position:absolute;inset:0;background:rgba(4,8,18,.42);transition:opacity 300ms}.sb.on .sb-soon{opacity:0}
        .eb-desktop{display:flex;height:380px;border-radius:6px;overflow:hidden;background:#06090f}
        .eb-mobile{display:none;flex-direction:column;gap:6px}
        /* ── Mobile: accordion ── */
        @media(max-width:640px){
          .eb-desktop{display:none}
          .eb-mobile{display:flex}
          .mb-band{border-radius:8px;overflow:hidden;cursor:pointer}
          .mb-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;position:relative}
          .mb-head-img{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.25}
          .mb-head-grad{position:absolute;inset:0;background:rgba(4,8,18,.55)}
          .mb-head-content{position:relative;display:flex;align-items:center;justify-content:space-between;width:100%}
          .mb-badge{font-size:9px;font-weight:800;padding:2px 7px;border-radius:3px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;display:inline-block}
          .mb-title{font-family:var(--font-syne,'Syne',sans-serif);font-size:17px;font-weight:800;color:#fff;letter-spacing:-.04em;line-height:1}
          .mb-chevron{font-size:11px;color:rgba(255,255,255,.6);transition:transform 280ms;flex-shrink:0}
          .mb-band.mb-open .mb-chevron{transform:rotate(180deg)}
          .mb-body{max-height:0;overflow:hidden;transition:max-height 320ms ease,padding 280ms ease;padding:0 16px;background:rgba(4,8,18,.7)}
          .mb-band.mb-open .mb-body{max-height:80px;padding:12px 16px}
          .mb-sub{font-size:12px;color:rgba(255,255,255,.55);line-height:1.5}
          .mb-cta{font-size:11px;font-weight:800;color:#1abfb0;margin-top:8px;display:block}
          .mb-soon-overlay{position:absolute;inset:0;background:rgba(4,8,18,.35)}
        }
      `}</style>

      {/* ── DESKTOP ── */}
      <div className="eb-desktop" style={{ border: `1px solid ${C.border}` }}>
        {BANDS.map((b) => {
          const on = active === b.id;
          const badge = b.live
            ? { bg: "rgba(230,57,70,.18)", border: "1px solid rgba(230,57,70,.34)", color: "#ff9090", label: isHe ? "פעיל עכשיו" : "Live now" }
            : b.soon
            ? { bg: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", label: isHe ? "בקרוב" : "Soon" }
            : { bg: "rgba(26,191,176,.15)", border: "1px solid rgba(26,191,176,.3)", color: "#1abfb0", label: isHe ? "חדש" : "New" };
          const inner = (
            <>
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
                <div className="sb-cta">{isHe ? b.ctaHe : b.ctaEn} {b.soon ? "" : "→"}</div>
              </div>
            </>
          );
          return b.soon
            ? <div key={b.id} className={`sb${on ? " on" : ""}`} onMouseEnter={() => setActive(b.id)}>{inner}</div>
            : <Link key={b.id} href={b.href} className={`sb${on ? " on" : ""}`} onMouseEnter={() => setActive(b.id)} style={{ textDecoration: "none" }}>{inner}</Link>;
        })}
      </div>

      {/* ── MOBILE: accordion ── */}
      <div className="eb-mobile">
        {BANDS.map((b) => {
          const badge = b.live
            ? { bg: "rgba(230,57,70,.25)", color: "#ff9090", label: isHe ? "פעיל עכשיו" : "Live now" }
            : b.soon
            ? { bg: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", label: isHe ? "בקרוב" : "Soon" }
            : { bg: "rgba(26,191,176,.22)", color: "#1abfb0", label: isHe ? "חדש" : "New" };
          return (
            <div key={b.id} className="mb-band" style={{ background: b.bgGrad || "#06090f" }}
              onClick={e => {
                const el = e.currentTarget as HTMLElement;
                // close all others
                document.querySelectorAll(".mb-band").forEach(x => { if (x !== el) x.classList.remove("mb-open"); });
                el.classList.toggle("mb-open");
              }}
            >
              <div className="mb-head">
                <div className="mb-head-img" style={{ backgroundImage: `url(${b.img})` }} />
                <div className="mb-head-grad" />
                {b.soon && <div className="mb-soon-overlay" />}
                <div className="mb-head-content">
                  <div>
                    <span className="mb-badge" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                    <div className="mb-title">{isHe ? b.he : b.en}</div>
                  </div>
                  <span className="mb-chevron">▼</span>
                </div>
              </div>
              <div className="mb-body">
                <div className="mb-sub">{isHe ? b.subHe : b.subEn}</div>
                {b.soon
                  ? <span className="mb-cta">{isHe ? "בקרוב" : "Soon"}</span>
                  : <Link href={b.href} className="mb-cta" style={{ color: "#1abfb0", textDecoration: "none" }} onClick={e => e.stopPropagation()}>{isHe ? b.ctaHe : b.ctaEn} →</Link>
                }
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Value Props — redesigned to match WC aesthetic ────────────────────────────
const VALUE_PROPS = [
  {
    stat: "0%",
    barFrom: "#1a3a8f", barTo: "#1abfb0",
    gradFrom: "#1a3a8f", gradTo: "#1abfb0",
    labelEn: "Fees",         labelHe: "עמלות",
    subEn: "No fees for buyers or sellers. Ever.",
    subHe: "לא לקונה, לא למוכר. אף פעם.",
  },
  {
    stat: "💬",
    barFrom: "#006847", barTo: "#25D366",
    gradFrom: "#006847", gradTo: "#22c55e",
    labelEn: "WhatsApp direct", labelHe: "ישיר בוואטסאפ",
    subEn: "Contact the seller directly. No middlemen.",
    subHe: "פנייה ישירה למוכר. בלי תיווך.",
  },
  {
    stat: "60s",
    barFrom: "#c0202c", barTo: "#e63946",
    gradFrom: "#c0202c", gradTo: "#e63946",
    labelEn: "Free to post",   labelHe: "פרסום חינמי",
    subEn: "60 seconds. Always, for everyone.",
    subHe: "תוך 60 שניות. תמיד ולכולם.",
  },
  {
    stat: "∞",
    statOffset: "4px",
    barFrom: "#92650a", barTo: "#d4a017",
    gradFrom: "#92650a", gradTo: "#d4a017",
    labelEn: "You set the price", labelHe: "אתה קובע",
    subEn: "No algorithms. Your price, your rules.",
    subHe: "בלי אלגוריתם. המחיר שלך.",
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
        @media(max-width:640px){
        }
          .hero-btns{flex-direction:column!important}
          .vp-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.white, fontFamily: fBody(isHe) }}>

        <Ticker isHe={isHe} />

        {/* ── HERO — colorful gradient ── */}
        <div style={{ background: "linear-gradient(135deg,#eef2ff 0%,#fdf0f2 52%,#edfff8 100%)", padding: "72px 16px 64px", position: "relative", overflow: "hidden" }}>
          {[
            { w: 400, t: -120, r: -80,   c: "rgba(230,57,70,.06)"  },
            { w: 320, b: -100, l: -60,   c: "rgba(26,58,143,.06)"  },
            { w: 260, t: 40,   r: "30%", c: "rgba(0,104,71,.05)"   },
          ].map((b, i) => (
            <div key={i} style={{ position: "absolute", width: b.w, height: b.w, borderRadius: "50%", background: `radial-gradient(circle,${b.c},transparent 70%)`, top: (b as any).t, bottom: (b as any).b, left: (b as any).l, right: (b as any).r, pointerEvents: "none" as const }} />
          ))}

          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: "52px", alignItems: "center", position: "relative" }} className="hero-grid">
            <div>
              <div className="su1" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999, background: "rgba(26,58,143,.07)", border: "1px solid rgba(26,58,143,.14)", fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.navy, display: "inline-block" }} />
                {isHe ? "מרקטפלייס הכרטיסים יד שנייה של ישראל" : "Israel's secondary ticket marketplace"}
              </div>

              {isHe ? (
                <h1 className="su2" style={{ fontFamily: fHe, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.5px", marginBottom: "18px" }}>
                  <span style={{ color: C.navy }}>כל</span> <span style={{ color: C.red }}>הכרטיסים</span><br />
                  <span style={{ color: C.green }}>במקום </span><span style={{ color: C.navy }}>אחד.</span>
                </h1>
              ) : (
                <h1 className="su2" style={{ fontFamily: fSyne, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em", marginBottom: "18px" }}>
                  <span style={{ color: C.navy }}>ALL </span><span style={{ color: C.red }}>TICKETS.</span><br />
                  <span style={{ color: C.green }}>SKIP </span><span style={{ color: C.navy }}>THE CHAOS.</span>
                </h1>
              )}

              <p className="su3" style={{ fontSize: "15px", fontWeight: 400, color: C.muted, lineHeight: 1.8, maxWidth: "420px", marginBottom: "28px", fontFamily: fBody(isHe) }}>
                {isHe ? "ספורט, הופעות ופסטיבלים — הכל במקום אחד. קונים ומוכרים מתחברים ישירות. בלי עמלות, בלי תיווך." : "Sports, concerts and festivals — all in one place. Buyers and sellers connect directly. No fees, no middlemen."}
              </p>


            </div>

            {/* Value props — glass cards on gradient */}
            <div className="vp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flexShrink: 0, minWidth: 240 }}>
              {VALUE_PROPS.map((v, i) => (
                <div key={i} style={{ borderRadius: 16, background: "rgba(255,255,255,.9)", border: "1px solid rgba(255,255,255,.98)", padding: "22px 20px 18px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 8px 32px rgba(13,27,62,.09), 0 2px 8px rgba(13,27,62,.05)", position: "relative", overflow: "hidden", minHeight: 160, transition: "transform 200ms, box-shadow 200ms" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${v.barFrom},${v.barTo})` }} />
                  <div style={{ fontFamily: fHe, fontSize: 50, fontWeight: 900, letterSpacing: -2, lineHeight: 1, marginBottom: 4, paddingRight: v.statOffset ?? 0, background: `linear-gradient(135deg,${v.gradFrom},${v.gradTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {v.stat}
                  </div>
                  <div style={{ fontFamily: fHe, fontSize: 17, fontWeight: 900, color: "#0d1b3e", letterSpacing: "-.3px", lineHeight: 1.1 }}>
                    {isHe ? v.labelHe : v.labelEn}
                  </div>
                  <div style={{ fontFamily: fHe, fontSize: 12, fontWeight: 700, color: "#475569", lineHeight: 1.55 }}>
                    {isHe ? v.subHe : v.subEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
        <div style={{ maxWidth: "1100px", margin: "20px auto 0", padding: "0 16px" }}>
          <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", background: `linear-gradient(135deg,${C.navy},#0f2252,#0d2a1a)` }}>
            {/* blobs */}
            <div style={{ position: "absolute", width: 280, height: 280, top: -90, right: -50, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,191,176,.13),transparent 70%)", pointerEvents: "none" as const }} />
            <div style={{ position: "absolute", width: 220, height: 220, bottom: -70, left: -40, borderRadius: "50%", background: "radial-gradient(circle,rgba(230,57,70,.1),transparent 70%)", pointerEvents: "none" as const }} />
            <div style={{ position: "relative", padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" as const }} className="cta-inner">
              <div>
                <div style={{ fontFamily: fHe, fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 900, color: "#fff", marginBottom: 10, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                  {isHe ? "יש לך כרטיסים למכור?" : "Got tickets to sell?"}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.45)", lineHeight: 1.7, fontFamily: fBody(isHe), maxWidth: 380 }}>
                  {isHe ? "פרסם מודעה תוך 60 שניות. קונים יפנו אליך ישירות בוואטסאפ. חינמי לחלוטין." : "Post a listing in 60 seconds. Buyers contact you directly on WhatsApp. Completely free."}
                </div>
              </div>
              <Link href="/post-listing" style={{ padding: "13px 30px", background: C.teal, color: C.navy, fontSize: 14, fontWeight: 900, borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0, boxShadow: "0 6px 20px rgba(26,191,176,.35)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = ".88")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                {isHe ? "פרסם מודעה →" : "Post listing →"}
              </Link>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}

      </div>
    </>
  );
}
