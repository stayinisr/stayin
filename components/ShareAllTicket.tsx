"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";

// ── Types ────────────────────────────────────────────────────────────────────
export type AllListing = {
  id: string;
  type?: string | null;
  price?: number | null;
  quantity?: number | null;
  match_id?: string | null;
  israeli_match_id?: string | null;
  matchName?: string;       // pre-built: "ברזיל נגד ספרד"
  matchMeta?: string;       // pre-built: "ניו יורק · 26/06/26"
  isWC?: boolean;
};

type Props = {
  listings: AllListing[];
  isHe?: boolean;
  onClose?: () => void;
};

const SITE_URL = "stayin.co.il";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(l: AllListing, isHe: boolean) {
  if (!l.price) return "—";
  const sym = l.isWC ? "$" : "₪";
  return l.type === "sell" ? `${sym}${l.price}` : `עד ${sym}${l.price}`;
}

function typeLabel(type: string | null | undefined, isHe: boolean) {
  if (type === "sell") return isHe ? "מכירה" : "Sell";
  if (type === "buy")  return isHe ? "קנייה"  : "Buy";
  return "—";
}

// ── Card component (what gets captured) ──────────────────────────────────────
function AllTicketCard({ listings, isHe }: { listings: AllListing[]; isHe: boolean }) {
  const activeCount = listings.length;

  return (
    <div
      style={{
        width: 900,
        background: "#fff",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(13,27,62,.15)",
        fontFamily: "var(--font-he,'Heebo',Arial,sans-serif)",
        border: "1px solid rgba(13,27,62,.08)",
      }}
    >
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0d1b3e,#1a3a8f)", padding: "28px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 300, height: 300, top: -100, left: -80, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,191,176,.15),transparent 70%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#1a3a6b,#e63946,#006847)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-.5px", marginBottom: 4 }}>
              Stay<span style={{ color: "#1abfb0" }}>in</span> 🎟️
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
              {isHe ? "כרטיסים בין אנשים, בלי עמלה" : "Tickets between people, no fees"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>{activeCount}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, marginTop: 4 }}>
              {isHe ? "מודעות פעילות" : "Active listings"}
            </div>
          </div>
        </div>
      </div>

      {/* Listing rows */}
      {listings.map((l, i) => {
        const isLast = i === listings.length - 1;
        const accentColor = l.isWC
          ? "linear-gradient(180deg,#1a3a6b,#e63946,#006847)"
          : "linear-gradient(180deg,#1a3a8f,#1abfb0)";
        const isSell = l.type === "sell";

        return (
          <div
            key={l.id}
            style={{
              padding: "18px 28px",
              display: "flex",
              alignItems: "center",
              gap: 18,
              borderBottom: isLast ? "none" : "1px solid #f1f5f9",
            }}
          >
            {/* Color accent */}
            <div style={{ width: 4, borderRadius: 99, alignSelf: "stretch", flexShrink: 0, background: accentColor }} />

            {/* Match info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0d1b3e", marginBottom: 4, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                {l.matchName || "—"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                {l.matchMeta || ""}
              </div>
            </div>

            {/* Type badge */}
            <div style={{
              fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 999,
              letterSpacing: ".06em", textTransform: "uppercase" as const,
              background: isSell ? "rgba(0,104,71,.08)" : "rgba(26,58,143,.08)",
              border: `1px solid ${isSell ? "rgba(0,104,71,.2)" : "rgba(26,58,143,.18)"}`,
              color: isSell ? "#006847" : "#1a3a8f",
              flexShrink: 0,
            }}>
              {typeLabel(l.type, isHe)}
            </div>

            {/* Price + qty */}
            <div style={{ textAlign: "left", flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#0d1b3e", letterSpacing: -.5 }}>
                {formatPrice(l, isHe)}
              </div>
              {l.quantity && (
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  × {l.quantity} {isHe ? "כרטיסים" : "tickets"}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{ background: "#f8f9fc", padding: "14px 32px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{SITE_URL}</div>
        <div style={{ fontSize: 12, color: "#1a3a8f", fontWeight: 800 }}>
          {isHe ? "צפו בכל המודעות →" : "View all listings →"}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ShareAllTicket({ listings, isHe = true, onClose }: Props) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setMounted(true); }, []);

  function close() { setOpen(false); onClose?.(); }

  async function makeImage() {
    if (!cardRef.current) return null;
    const opts = { cacheBust: true, pixelRatio: 2, backgroundColor: "#fff" };
    await toPng(cardRef.current, opts);
    await new Promise<void>(r => setTimeout(r, 150));
    return toPng(cardRef.current, opts);
  }

  async function handleWhatsApp() {
    setBusy(true);
    try {
      const url = `https://${SITE_URL}/my-listings`;
      const text = isHe
        ? `יש לי ${listings.length} כרטיסים למכירה ב-Stayin 🎟️\n${url}`
        : `I have ${listings.length} listings on Stayin 🎟️\n${url}`;
      const dataUrl = await makeImage();
      if (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "stayin-all-listings.png";
        link.click();
        await new Promise(r => setTimeout(r, 400));
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    setBusy(true);
    try {
      const dataUrl = await makeImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "stayin-all-listings.png";
      link.click();
    } finally {
      setBusy(false);
    }
  }

  function handleCopy() {
    const url = `https://${SITE_URL}/my-listings`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!open) return null;

  const modal = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(13,27,62,.45)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div style={{ width: "100%", maxWidth: 520, background: "rgba(255,255,255,.97)", borderRadius: "28px 28px 0 0", overflow: "hidden", boxShadow: "0 -1px 0 rgba(255,255,255,.9), 0 -40px 80px rgba(13,27,62,.15)" }}>

        {/* Handle */}
        <div style={{ width: 36, height: 4, background: "#e2e8f0", borderRadius: 99, margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ padding: "16px 20px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid rgba(13,27,62,.06)" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" as const, background: "linear-gradient(135deg,#1a3a8f,#1abfb0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 5 }}>
              Stayin · {isHe ? "שיתוף" : "Share"}
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#0d1b3e", letterSpacing: "-.4px" }}>
              {isHe ? "שתף את כל המודעות" : "Share all listings"}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
              {isHe ? `${listings.length} מודעות פעילות` : `${listings.length} active listings`}
            </div>
          </div>
          <button onClick={close} style={{ width: 32, height: 32, borderRadius: 10, background: "#f1f5f9", border: "1px solid #e8edf5", color: "#64748b", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Card preview */}
        <div style={{ margin: "14px 16px", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(13,27,62,.10)", transform: "scale(0.58)", transformOrigin: "top center", marginBottom: `${-220 + (listings.length * -28)}px` }}>
          <div ref={cardRef}>
            <AllTicketCard listings={listings} isHe={isHe} />
          </div>
        </div>

        {/* Hint */}
        <div style={{ margin: "0 16px 14px", padding: "10px 14px", background: "rgba(26,191,176,.06)", border: "1px solid rgba(26,191,176,.14)", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1abfb0", flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 500, lineHeight: 1.4 }}>
            {isHe ? <>התמונה תורד ואז תוכל לשלוח אותה בוואטסאפ — <strong style={{ color: "#1a3a8f" }}>Stayin</strong> גדל כשאתה משתף</> : <>Image downloads then share on WhatsApp</>}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
          <button type="button" onClick={handleWhatsApp} disabled={busy}
            style={{ width: "100%", height: 56, borderRadius: 18, border: "none", cursor: busy ? "wait" : "pointer", background: "linear-gradient(135deg,#25D366,#20BA5A)", color: "#fff", display: "flex", alignItems: "center", gap: 12, padding: "0 20px", boxShadow: "0 4px 16px rgba(37,211,102,.3)", opacity: busy ? .7 : 1 }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💬</div>
            <div style={{ flex: 1, textAlign: isHe ? "right" : "left" as const }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{busy ? (isHe ? "מכין תמונה..." : "Creating...") : isHe ? "שתף בוואטסאפ" : "Share WhatsApp"}</div>
              {!busy && <div style={{ fontSize: 10, opacity: .7, marginTop: 1 }}>{isHe ? "מוריד תמונה ופותח וואטסאפ" : "Downloads image & opens WhatsApp"}</div>}
            </div>
            <div style={{ fontSize: 16, opacity: .6 }}>{isHe ? "←" : "→"}</div>
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button type="button" onClick={handleDownload} disabled={busy}
              style={{ height: 52, borderRadius: 16, border: "1px solid rgba(26,58,143,.12)", cursor: busy ? "wait" : "pointer", background: "linear-gradient(135deg,rgba(26,58,143,.06),rgba(26,191,176,.04))", color: "#1a3a8f", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", opacity: busy ? .7 : 1 }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(26,58,143,.08)", border: "1px solid rgba(26,58,143,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⬇</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{busy ? "..." : isHe ? "הורד תמונה" : "Download"}</div>
            </button>
            <button type="button" onClick={handleCopy}
              style={{ height: 52, borderRadius: 16, border: "1px solid #e8edf5", cursor: "pointer", background: "#f8f9fc", color: copied ? "#1abfb0" : "#475569", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", transition: "all 150ms" }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#fff", border: "1px solid #e8edf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{copied ? "✓" : "🔗"}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{copied ? (isHe ? "הועתק!" : "Copied!") : isHe ? "העתק קישור" : "Copy link"}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modal, document.body) : null;
}
