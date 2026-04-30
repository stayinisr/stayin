"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { flagImgSrc, teamName } from "../lib/teams";

type ListingWithMatch = {
  id: string;
  type?: string | null;
  category?: string | null;
  quantity?: number | null;
  price?: number | null;
  seats_block?: string | null;
  seats_row?: string | null;
  seats_numbers?: string | null;
  seated_together?: string | null;
  match?: {
    id: string;
    fifa_match_number?: number | null;
    home_team_name?: string | null;
    away_team_name?: string | null;
    city?: string | null;
    match_date?: string | null;
    match_time?: string | null;
    stage?: string | null;
  } | null;
  ilMatch?: {
    id: string;
    home_team_name?: string | null;
    away_team_name?: string | null;
    city?: string | null;
    match_date?: string | null;
    match_time?: string | null;
  } | null;
};

type Props = {
  listings: ListingWithMatch[];
  isHe: boolean;
  open: boolean;
  onClose: () => void;
};

const SITE_URL = "stayin.co.il";
const LOGO_SRC = "/stayin-share-logo.png";
const fCond = "'Righteous','Nunito',sans-serif";
const navy = "#08204a";
const teal = "#1abfb0";
const C = { text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", border: "rgba(13,27,62,.09)" };
const CARD_W = 1400;
const STUB_W = 320;
const ROW_H = 130;
const HEADER_H = 206;
const FOOTER_H = 70;

function fmt(v: unknown) { if (!v) return null; const s = String(v).trim(); return s || null; }
function fmtDate(d?: string | null) {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}
function fmtTime(t?: string | null) { return t ? t.slice(0,5) : null; }
function stageShort(s?: string | null, isHe = true) {
  const v = (s||"").toLowerCase();
  if (isHe) {
    if (v.includes("group")) return "בתים";
    if (v.includes("32")) return "32";
    if (v.includes("16")) return "שמינית";
    if (v.includes("quarter")) return "רבע";
    if (v.includes("semi")) return "חצי";
    if (v.includes("final")) return "גמר";
  } else {
    if (v.includes("group")) return "Group";
    if (v.includes("32")) return "R32";
    if (v.includes("16")) return "R16";
    if (v.includes("quarter")) return "QF";
    if (v.includes("semi")) return "SF";
    if (v.includes("final")) return "Final";
  }
  return null;
}
async function waitReady(el: HTMLElement) {
  const imgs = Array.from(el.querySelectorAll("img"));
  await Promise.all(imgs.map(img => img.complete && img.naturalWidth > 0 ? Promise.resolve() : new Promise<void>(res => { img.onload = img.onerror = () => res(); })));
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise<void>(res => setTimeout(res, 500));
}

function AllCard({ listings, isHe }: { listings: ListingWithMatch[]; isHe: boolean }) {
  const cardH = HEADER_H + listings.length * ROW_H + FOOTER_H;
  return (
    <div style={{ width: CARD_W, fontFamily: "var(--font-he,Heebo),Arial,sans-serif", direction:"ltr", filter:"drop-shadow(0 24px 60px rgba(13,27,62,.18))", position:"relative" }}>
      {[{ top:-24 },{ bottom:-24 }].map((p,i) => (
        <div key={i} style={{ position:"absolute", width:48, height:48, borderRadius:999, background:"#d8dde8", zIndex:10, left:STUB_W-24, ...p }} />
      ))}
      <div style={{ width:CARD_W, height:cardH, borderRadius:44, overflow:"hidden", background:"linear-gradient(145deg,#f0f4fa,#edf1f8)", border:"1px solid rgba(13,27,62,.07)", display:"flex" }}>

        {/* STUB */}
        <div style={{ width:STUB_W, flexShrink:0, background:"linear-gradient(155deg,#1c3a6e,#2a5298,#183a6e,#1a5c2a)", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:"60px 0 56px" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(55deg,rgba(255,255,255,.03) 0px,rgba(255,255,255,.03) 14px,transparent 14px,transparent 28px)" }} />
          <div style={{ position:"absolute", top:0, bottom:0, right:0, borderRight:"2px dashed rgba(255,255,255,.18)" }} />
          <img src={LOGO_SRC} alt="Stayin" crossOrigin="anonymous" style={{ width:240, objectFit:"contain", display:"block", margin:"0 auto", position:"relative" }} />
          <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <div style={{ fontFamily:fCond, fontSize:28, letterSpacing:".4em", color:"rgba(255,255,255,.65)", textTransform:"uppercase" }}>ALL</div>
            <div style={{ fontFamily:fCond, fontSize:160, lineHeight:.82, fontWeight:400, background:"linear-gradient(180deg,#fff 0%,#a8f0e8 30%,#1abfb0 60%,#a8f0e8 90%,#fff 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 2px rgba(26,191,176,.8))" }}>{listings.length}</div>
            <div style={{ fontFamily:fCond, fontSize:26, letterSpacing:".35em", color:"rgba(255,255,255,.65)", textTransform:"uppercase" }}>{isHe ? "מודעות" : "LISTINGS"}</div>
          </div>
          <div style={{ position:"relative", textAlign:"center" }}>
            <div style={{ fontFamily:fCond, fontSize:26, letterSpacing:".18em", color:"#fff", textShadow:"0 0 12px rgba(26,191,176,.6)" }}>{SITE_URL}</div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ height:6, background:"linear-gradient(90deg,#1a3a6b,#c0202c,#1a5c2a)", flexShrink:0 }} />

          {/* Header */}
          <div style={{ padding:"28px 60px 22px", borderBottom:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <div style={{ fontSize:18, fontWeight:800, letterSpacing:".2em", textTransform:"uppercase", color:"#1a3a8f", marginBottom:6 }}>FIFA WORLD CUP 2026™</div>
              <div style={{ fontSize:52, fontWeight:900, color:navy, lineHeight:.95, letterSpacing:"-.02em" }}>{isHe ? "כל המודעות שלי" : "My Listings"}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:18, color:C.hint, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6 }}>STAYIN.CO.IL</div>
              <div style={{ fontSize:16, color:C.muted, lineHeight:1.5 }}>{isHe ? "קנייה ומכירת כרטיסים ללא עמלה" : "Buy & sell tickets, no fees"}</div>
            </div>
          </div>

          {/* Rows */}
          <div style={{ flex:1 }}>
            {listings.map((l, idx) => {
              const m = l.match || l.ilMatch;
              const isSell = l.type === "sell";
              const home = teamName(m?.home_team_name, isHe);
              const away = teamName(m?.away_team_name, isHe);
              const matchNum = l.match?.fifa_match_number ? `#${l.match.fifa_match_number}` : null;
              const stage = stageShort(l.match?.stage, isHe);
              const date = fmtDate(m?.match_date);
              const time = fmtTime(m?.match_time);
              const price = l.price ? `$${Number(l.price).toLocaleString()}` : null;
              const qty = l.quantity ? `×${l.quantity}` : null;
              const hFlag = flagImgSrc(m?.home_team_name);
              const aFlag = flagImgSrc(m?.away_team_name);
              const flagStyle = { width:48, height:48, borderRadius:999, objectFit:"cover" as const, border:"2px solid rgba(255,255,255,.8)", boxShadow:"0 2px 8px rgba(13,27,62,.1)" };

              return (
                <div key={l.id} style={{ display:"flex", alignItems:"center", padding:"0 60px", height:ROW_H, borderBottom: idx < listings.length-1 ? `1px solid ${C.border}` : "none", background: idx%2 ? "rgba(13,27,62,.015)" : "transparent" }}>

                  {/* Type */}
                  <div style={{ width:100, flexShrink:0 }}>
                    <div style={{ display:"inline-flex", padding:"7px 18px", borderRadius:8, background: isSell ? "rgba(0,104,71,.08)" : "rgba(26,58,143,.08)", border:`1px solid ${isSell ? "rgba(0,104,71,.2)" : "rgba(26,58,143,.18)"}` }}>
                      <span style={{ fontSize:20, fontWeight:900, color: isSell ? "#006847" : "#1a3a8f", letterSpacing:".04em" }}>
                        {isSell ? (isHe?"מכירה":"SELL") : (isHe?"קנייה":"BUY")}
                      </span>
                    </div>
                  </div>

                  <div style={{ width:1, height:70, background:C.border, flexShrink:0, margin:"0 24px" }} />

                  {/* Teams */}
                  <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, minWidth:0 }}>
                    {hFlag && <img src={hFlag} alt="" style={flagStyle} />}
                    <span style={{ fontSize:28, fontWeight:900, color:navy, letterSpacing:"-.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:180 }}>{home}</span>
                    <span style={{ fontSize:18, color:C.hint, fontWeight:300, letterSpacing:".1em", flexShrink:0 }}>VS</span>
                    <span style={{ fontSize:28, fontWeight:900, color:"#8b0000", letterSpacing:"-.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:180 }}>{away}</span>
                    {aFlag && <img src={aFlag} alt="" style={flagStyle} />}
                  </div>

                  <div style={{ width:1, height:70, background:C.border, flexShrink:0, margin:"0 24px" }} />

                  {/* Meta */}
                  <div style={{ display:"flex", gap:28, alignItems:"center", flexShrink:0 }}>
                    {matchNum && <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:12, color:C.hint, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>{isHe?"משחק":"Match"}</div>
                      <div style={{ fontFamily:fCond, fontSize:28, color:teal }}>{matchNum}</div>
                    </div>}
                    {stage && <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:12, color:C.hint, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>{isHe?"שלב":"Stage"}</div>
                      <div style={{ fontSize:22, fontWeight:900, color:C.text }}>{stage}</div>
                    </div>}
                    {date && <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:12, color:C.hint, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>{isHe?"תאריך":"Date"}</div>
                      <div style={{ fontSize:20, fontWeight:800, color:C.text }}>{date}</div>
                    </div>}
                    {time && <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:12, color:C.hint, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>{isHe?"שעה":"Time"}</div>
                      <div style={{ fontSize:20, fontWeight:800, color:C.text }}>{time}</div>
                    </div>}
                    {qty && <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:12, color:C.hint, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>{isHe?"כמות":"Qty"}</div>
                      <div style={{ fontSize:26, fontWeight:900, color:C.text }}>{qty}</div>
                    </div>}
                  </div>

                  <div style={{ width:1, height:70, background:C.border, flexShrink:0, margin:"0 24px" }} />

                  {/* Price */}
                  <div style={{ flexShrink:0, textAlign:"center", minWidth:130 }}>
                    <div style={{ fontSize:12, color:C.hint, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>{isHe?"מחיר":"Price"}</div>
                    <div style={{ fontSize: price && price.length > 6 ? 28 : 38, fontWeight:900, color:teal, letterSpacing:"-.02em", lineHeight:1 }}>{price||"—"}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding:"18px 60px", borderTop:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, height:FOOTER_H }}>
            <div style={{ fontSize:16, color:C.hint, fontWeight:600 }}>{isHe ? "ללא עמלה · בין אנשים" : "No fees · Person to person"}</div>
            <div style={{ fontFamily:fCond, fontSize:24, letterSpacing:".15em", color:teal }}>{SITE_URL}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShareAllTicket({ listings, isHe, open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(0.3);
  const cardRef = useRef<HTMLDivElement>(null);
  const active = listings.filter(l => l.match || l.ilMatch);
  const cardH = HEADER_H + active.length * ROW_H + FOOTER_H + 6;

  useEffect(() => {
    setMounted(true);
    if (!document.querySelector('link[href*="Righteous"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Righteous&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    function update() {
      const w = window.innerWidth, h = window.innerHeight;
      const mob = w <= 768;
      setIsMobile(mob);
      const avW = Math.max(260, w - (mob ? 32 : 120));
      const avH = Math.max(180, h - (mob ? 440 : 400));
      const byW = avW / CARD_W;
      const byH = avH / cardH;
      const max = mob ? 0.26 : 0.52;
      const min = mob ? 0.14 : 0.22;
      setScale(Math.max(min, Math.min(max, byW, byH)));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardH]);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, [open]);

  async function makeImage() {
    if (!cardRef.current) return null;
    setBusy(true);
    try {
      await waitReady(cardRef.current);
      const opts = { cacheBust:true, pixelRatio:2, backgroundColor:"#f6fbff" };
      await toPng(cardRef.current, opts);
      await new Promise<void>(res => setTimeout(res, 100));
      return await toPng(cardRef.current, opts);
    } finally { setBusy(false); }
  }

  async function handleDownload() {
    const url = await makeImage();
    if (!url) return;
    const a = document.createElement("a"); a.download = "stayin-all-listings.png"; a.href = url; a.click();
  }

  async function handleShare() {
    const url = await makeImage();
    const txt = isHe ? `המודעות שלי ב-Stayin 🎟️\nstayin.co.il` : `My listings on Stayin 🎟️\nstayin.co.il`;
    if (url && navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], "stayin-listings.png", { type:"image/png" });
        if (navigator.canShare({ files:[file] })) { await navigator.share({ title:"Stayin", text:txt, files:[file] }); return; }
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText("stayin.co.il");
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, zIndex:999999, background:"rgba(5,12,28,.72)", backdropFilter:"blur(14px)", display:"flex", alignItems: isMobile ? "flex-end" : "center", justifyContent:"center", padding: isMobile ? 0 : 18 }}>
      <div dir={isHe ? "rtl" : "ltr"}
        style={{ width: isMobile ? "min(100%,440px)" : "min(900px,100%)", maxHeight:"94vh", overflowY:"auto", overflowX:"hidden", borderRadius: isMobile ? "28px 28px 0 0" : 30, background:"rgba(255,255,255,.97)", boxShadow:"0 -40px 90px rgba(13,27,62,.2)" }}>

        {isMobile && <div style={{ width:36, height:4, background:"#e2e8f0", borderRadius:99, margin:"12px auto 0" }} />}

        {/* Header */}
        <div style={{ padding: isMobile ? "14px 20px 12px" : "18px 22px 14px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", borderBottom:"1px solid rgba(13,27,62,.06)" }}>
          <div>
            <div style={{ fontSize:10, fontWeight:850, letterSpacing:".16em", textTransform:"uppercase", background:`linear-gradient(135deg,${navy},${teal})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:5 }}>
              Stayin · {isHe ? "שיתוף" : "Share"}
            </div>
            <div style={{ fontSize: isMobile ? 19 : 18, fontWeight:900, color:C.text, letterSpacing:"-.4px" }}>
              {isHe ? "שתף את כל המודעות" : "Share all listings"}
            </div>
            <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>
              {active.length} {isHe ? "מודעות בתמונה אחת" : "listings in one image"}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:"#f1f5f9", border:"1px solid #e8edf5", color:C.muted, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>×</button>
        </div>

        {/* Preview */}
        <div style={{ margin:"14px 16px", borderRadius:20, overflow:"hidden", boxShadow:"0 8px 36px rgba(13,27,62,.16),0 0 0 1px rgba(13,27,62,.06)", background:"#f6fbff" }}>
          <div style={{ width:"100%", height: Math.ceil(cardH * scale), overflow:"hidden", display:"flex", justifyContent:"center", alignItems:"flex-start" }}>
            <div style={{ width:CARD_W, height:cardH, transform:`scale(${scale})`, transformOrigin:"top center", flexShrink:0 }}>
              <div ref={cardRef} style={{ width:CARD_W, height:cardH }}>
                <AllCard listings={active} isHe={isHe} />
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{ margin:"0 16px 14px", padding:"10px 14px", background:"rgba(26,191,176,.06)", border:"1px solid rgba(26,191,176,.16)", borderRadius:10, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:teal, flexShrink:0 }} />
          <div style={{ fontSize:11, color:"#475569", fontWeight:500, lineHeight:1.4 }}>
            {isHe ? "תמונה אחת עם כל המודעות — מושלמת לשיתוף בקבוצות ווצאפ" : "One image with all listings — perfect for WhatsApp groups"}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding:"0 16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
          <button type="button" onClick={handleShare} disabled={busy}
            style={{ width:"100%", height:56, borderRadius:18, border:"none", cursor: busy?"wait":"pointer", background:"linear-gradient(135deg,#25D366,#20BA5A)", color:"#fff", display:"flex", alignItems:"center", gap:12, padding:"0 20px", boxShadow:"0 4px 16px rgba(37,211,102,.3)", opacity: busy ? 0.7 : 1 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>💬</div>
            <div style={{ flex:1, textAlign: isHe ? "right" : "left" }}>
              <div style={{ fontSize:15, fontWeight:800 }}>{busy ? (isHe?"מכין תמונה...":"Creating...") : isHe ? "שתף בוואטסאפ" : "Share on WhatsApp"}</div>
              {!busy && <div style={{ fontSize:10, opacity:.7, marginTop:1 }}>{isHe ? "כל המודעות בתמונה אחת" : "All listings in one image"}</div>}
            </div>
            <div style={{ fontSize:16, opacity:.6 }}>{isHe ? "←" : "→"}</div>
          </button>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <button type="button" onClick={handleDownload} disabled={busy}
              style={{ height:52, borderRadius:16, border:"1px solid rgba(26,58,143,.12)", cursor: busy?"wait":"pointer", background:"rgba(26,58,143,.05)", color:navy, display:"flex", alignItems:"center", gap:10, padding:"0 16px", opacity: busy ? 0.7 : 1 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"rgba(26,58,143,.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>⬇</div>
              <div style={{ fontSize:12, fontWeight:750 }}>{busy ? "..." : isHe ? "הורד תמונה" : "Download"}</div>
            </button>
            <button type="button" onClick={handleCopy}
              style={{ height:52, borderRadius:16, border:"1px solid #e8edf5", cursor:"pointer", background:"#f8f9fc", color: copied ? teal : "#475569", display:"flex", alignItems:"center", gap:10, padding:"0 16px" }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"#fff", border:"1px solid #e8edf5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{copied ? "✓" : "🔗"}</div>
              <div style={{ fontSize:12, fontWeight:750 }}>{copied ? (isHe?"הועתק!":"Copied!") : isHe ? "העתק קישור" : "Copy link"}</div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
