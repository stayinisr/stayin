"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { flagImgSrc, teamName } from "../lib/teams";

type ShareMatch = {
  id: string;
  fifa_match_number?: number | null;
  home_team_name?: string | null;
  away_team_name?: string | null;
  city?: string | null;
  stadium?: string | null;
  match_date?: string | null;
  match_time?: string | null;
  stage?: string | null;
};

type ShareListing = {
  id: string;
  type?: string | null;
  category?: string | null;
  quantity?: number | null;
  price?: number | null;
  notes?: string | null;
  status?: string | null;
  expires_at?: string | null;
  seated_together?: string | null;
  seats_block?: string | null;
  seats_row?: string | null;
  seats_numbers?: string | null;
  profile?: {
    full_name?: string | null;
    country?: string | null;
    city?: string | null;
  } | null;
};

type Props = {
  listing: ShareListing;
  match: ShareMatch;
  isHe: boolean;
  size?: "sm" | "md";
};

const SITE_URL = "stayin.co.il";
const EMPTY = "—";
const TICKET_WIDTH = 1600;
const TICKET_HEIGHT = 900;

function clean(value: unknown) {
  if (value === null || value === undefined) return EMPTY;
  const str = String(value).trim();
  return str.length ? str : EMPTY;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return EMPTY;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return clean(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(time?: string | null) {
  if (!time) return EMPTY;
  return time.slice(0, 5);
}

function formatPrice(price?: number | null, type?: string | null, isHe = true) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) return EMPTY;
  const prefix = type === "buy" ? (isHe ? "עד " : "Up to ") : "";
  return `${prefix}$${Number(price).toLocaleString("en-US")}`;
}

function listingTypeLabel(type: string | null | undefined, isHe: boolean) {
  if (type === "buy") return isHe ? "קנייה" : "Buy";
  return isHe ? "מכירה" : "Sell";
}

function yesNo(value: string | null | undefined, isHe: boolean) {
  if (!value) return EMPTY;
  const normalized = String(value).toLowerCase().trim();
  if (["yes", "true", "1", "כן"].includes(normalized)) return isHe ? "כן" : "Yes";
  if (["no", "false", "0", "לא"].includes(normalized)) return isHe ? "לא" : "No";
  return clean(value);
}

function getShareUrl(listingId: string, matchId: string) {
  if (typeof window === "undefined") return `https://${SITE_URL}/matches/${matchId}?listing=${listingId}`;
  return `${window.location.origin}/matches/${matchId}?listing=${listingId}`;
}

function useModalLayout(open: boolean) {
  const [mounted, setMounted] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width <= 768);

      const modalChromeHeight = width <= 768 ? 190 : 154;
      const availableWidth = Math.max(280, width - 64);
      const availableHeight = Math.max(240, height - modalChromeHeight);
      const scaleByWidth = availableWidth / TICKET_WIDTH;
      const scaleByHeight = availableHeight / TICKET_HEIGHT;
      const maxScale = width <= 768 ? 0.42 : 0.55;
      const minScale = width <= 768 ? 0.2 : 0.38;
      setPreviewScale(Math.max(minScale, Math.min(maxScale, scaleByWidth, scaleByHeight)));
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return { mounted, previewScale, isMobile };
}

function SafeImage({ src, alt, style }: { src: string; alt: string; style: CSSProperties }) {
  return (
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      style={style}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

const flagStyle: CSSProperties = {
  width: 68,
  height: 68,
  borderRadius: 999,
  objectFit: "cover",
  border: "1px solid rgba(255,255,255,0.32)",
  boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
  flexShrink: 0,
};

function TeamNameWithFlag({ name, side, isHe }: { name?: string | null; side: "left" | "right"; isHe: boolean }) {
  const translated = teamName(name, isHe);
  const flag = flagImgSrc(name);
  const flagEl = flag ? <img src={flag} crossOrigin="anonymous" alt="" style={flagStyle} /> : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
        gap: 22,
        minWidth: 0,
      }}
    >
      {side === "left" && flagEl}
      <div
        style={{
          color: "#ffffff",
          fontSize: 60,
          lineHeight: 1,
          fontWeight: 950,
          letterSpacing: "-0.055em",
          textAlign: side === "left" ? "left" : "right",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 335,
          textShadow: "0 14px 35px rgba(0,0,0,0.32)",
        }}
      >
        {clean(translated)}
      </div>
      {side === "right" && flagEl}
    </div>
  );
}

function InfoCell({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      style={{
        minWidth: 0,
        textAlign: "center",
        paddingInline: 11,
        borderInlineStart: "1px solid rgba(145,169,210,0.30)",
      }}
    >
      <div style={{ color: "rgba(207,218,245,0.57)", fontSize: 23, fontWeight: 750, marginBottom: 11, lineHeight: 1 }}>
        {label}
      </div>
      <div
        style={{
          color: strong ? "#7df9ff" : "#ffffff",
          fontSize: strong ? 35 : 29,
          fontWeight: strong ? 980 : 900,
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: strong ? "0 0 22px rgba(34,211,238,0.30)" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TicketCutouts() {
  const cutout: CSSProperties = {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 999,
    background: "#06101f",
    border: "3px solid rgba(39,117,241,0.76)",
    zIndex: 4,
  };
  return (
    <>
      <div style={{ ...cutout, left: -32, top: 250 }} />
      <div style={{ ...cutout, left: 330, top: -32 }} />
      <div style={{ ...cutout, left: 330, bottom: -32 }} />
    </>
  );
}

function TicketPreview({ listing, match, isHe }: { listing: ShareListing; match: ShareMatch; isHe: boolean }) {
  const shareType = listingTypeLabel(listing.type, isHe);
  const price = formatPrice(listing.price, listing.type, isHe);
  const quantity = listing.quantity ? `${listing.quantity}` : EMPTY;
  const matchNumber = match.fifa_match_number ? `#${match.fifa_match_number}` : EMPTY;
  const stage = clean(match.stage);
  const stadium = clean(match.stadium);
  const city = clean(match.city);
  const publisher = clean(listing.profile?.full_name);
  const locationText = [stadium !== EMPTY ? stadium : null, city !== EMPTY ? city : null].filter(Boolean).join(" · ") || EMPTY;

  const topDetails = [
    { label: isHe ? "משחק" : "Match", value: matchNumber },
    { label: isHe ? "עיר" : "City", value: city },
    { label: isHe ? "תאריך" : "Date", value: formatDate(match.match_date) },
    { label: isHe ? "שעה" : "Time", value: formatTime(match.match_time) },
    { label: isHe ? "קטגוריה" : "Category", value: clean(listing.category) },
  ];

  const bottomDetails = [
    { label: isHe ? "מחיר" : "Price", value: price, strong: true },
    { label: isHe ? "כמות" : "Qty", value: quantity },
    { label: isHe ? "בלוק" : "Block", value: clean(listing.seats_block) },
    { label: isHe ? "שורה" : "Row", value: clean(listing.seats_row) },
    { label: isHe ? "מושבים" : "Seats", value: clean(listing.seats_numbers) },
    { label: isHe ? "יחד" : "Together", value: yesNo(listing.seated_together, isHe) },
  ];

  return (
    <div
      dir="ltr"
      style={{
        width: TICKET_WIDTH,
        height: TICKET_HEIGHT,
        position: "relative",
        overflow: "hidden",
        borderRadius: 58,
        border: "3px solid rgba(38,117,241,0.92)",
        background: "linear-gradient(130deg, #06142d 0%, #071d42 43%, #04101f 100%)",
        boxShadow: "0 44px 110px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(125,249,255,0.12)",
        fontFamily: "var(--font-he, Heebo), var(--font-dm, Arial), sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 74% 20%, rgba(34,211,238,0.18), transparent 27%), radial-gradient(circle at 18% 69%, rgba(37,99,235,0.18), transparent 29%)",
        }}
      />

      <SafeImage
        src="/stayin-stadium-bg.png"
        alt=""
        style={{
          position: "absolute",
          left: 0,
          bottom: 10,
          width: 575,
          height: "auto",
          opacity: 0.76,
          transform: "translateX(-98px)",
          mixBlendMode: "screen",
          zIndex: 1,
        }}
      />

      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 382, background: "linear-gradient(180deg, rgba(16,50,103,0.76), rgba(5,16,35,0.78))", zIndex: 2 }} />
      <div style={{ position: "absolute", left: 377, top: 0, bottom: 0, borderLeft: "4px dashed rgba(34,160,255,0.84)", zIndex: 3 }} />
      <TicketCutouts />

      <aside
        style={{
          position: "absolute",
          insetBlock: 0,
          left: 0,
          width: 374,
          padding: "82px 40px 70px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 5,
        }}
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          <SafeImage
            src="/stayin-share-logo.png"
            alt="Stayin"
            style={{
              width: 265,
              height: "auto",
              maxHeight: 112,
              objectFit: "contain",
              marginInline: "auto",
              filter: "drop-shadow(0 0 18px rgba(34,211,238,0.30))",
              mixBlendMode: "screen",
            }}
          />
          <div style={{ color: "#7df9ff", fontSize: 31, fontWeight: 900, letterSpacing: "0.28em", marginTop: 22 }}>TICKETS</div>
        </div>

        <div style={{ width: "100%", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              minWidth: 206,
              height: 78,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(20,184,166,0.50)",
              border: "3px solid rgba(34,211,238,0.86)",
              color: "#7df9ff",
              fontSize: 43,
              fontWeight: 950,
              boxShadow: "0 0 34px rgba(34,211,238,0.35)",
            }}
          >
            {shareType}
          </div>
          <div style={{ color: "#7df9ff", fontSize: 31, fontWeight: 850, marginTop: 22, letterSpacing: "0.02em" }}>{SITE_URL}</div>
        </div>
      </aside>

      <main style={{ position: "absolute", left: 455, right: 68, top: 80, bottom: 54, zIndex: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 46 }}>
          <div>
            <div style={{ color: "#24dce9", fontSize: 34, fontWeight: 900, letterSpacing: "0.18em" }}>FIFA WORLD CUP 2026™</div>
            <div style={{ color: "rgba(215,223,249,0.66)", fontSize: 31, fontWeight: 650, letterSpacing: "0.17em", marginTop: 16 }}>{stage}</div>
          </div>
          <SafeImage
            src="/stayin-cup-icon.png"
            alt=""
            style={{
              width: 92,
              height: 92,
              objectFit: "contain",
              opacity: 0.82,
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 22px rgba(34,211,238,0.30))",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 48, marginBottom: 76 }}>
          <TeamNameWithFlag name={match.home_team_name} side="left" isHe={isHe} />
          <div style={{ color: "rgba(209,217,244,0.66)", fontSize: 38, fontWeight: 850, letterSpacing: "0.08em" }}>VS</div>
          <TeamNameWithFlag name={match.away_team_name} side="right" isHe={isHe} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", direction: isHe ? "rtl" : "ltr", marginBottom: 36 }}>
          {topDetails.map((item) => (
            <InfoCell key={item.label} label={item.label} value={item.value} />
          ))}
        </div>

        <div style={{ borderTop: "4px dashed rgba(46,133,255,0.72)", marginBottom: 36 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", direction: isHe ? "rtl" : "ltr" }}>
          {bottomDetails.map((item) => (
            <InfoCell key={item.label} label={item.label} value={item.value} strong={item.strong} />
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(145,169,210,0.24)", marginTop: 32 }} />

        <div
          dir={isHe ? "rtl" : "ltr"}
          style={{
            marginTop: 27,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            color: "#ffffff",
            fontSize: 27,
            fontWeight: 850,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ color: "#24dce9", fontSize: 28 }}>◎</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{locationText}</span>
        </div>

        <div
          dir={isHe ? "rtl" : "ltr"}
          style={{
            marginTop: 16,
            color: "rgba(218,228,255,0.50)",
            fontSize: 18,
            fontWeight: 650,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "center",
          }}
        >
          {isHe ? "מפרסם" : "Publisher"}: {publisher} · {isHe ? "הערות" : "Notes"}: {clean(listing.notes)}
        </div>
      </main>
    </div>
  );
}

export default function ShareListingTicketButton({ listing, match, isHe, size = "md" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { mounted, previewScale, isMobile } = useModalLayout(open);

  const shareUrl = useMemo(() => getShareUrl(listing.id, match.id), [listing.id, match.id]);
  const matchTitle = `${teamName(match.home_team_name, isHe)} ${isHe ? "נגד" : "vs"} ${teamName(match.away_team_name, isHe)}`;
  const shareText = isHe
    ? `מודעה ב-Stayin: ${listingTypeLabel(listing.type, true)} ל${matchTitle} במחיר ${formatPrice(listing.price, listing.type, true)}\n${shareUrl}`
    : `Stayin listing: ${listingTypeLabel(listing.type, false)} for ${matchTitle} at ${formatPrice(listing.price, listing.type, false)}\n${shareUrl}`;

  async function makeImage() {
    if (!cardRef.current) return null;
    setBusy(true);
    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#06101f",
      });
    } finally {
      setBusy(false);
    }
  }

  async function downloadImage() {
    const dataUrl = await makeImage();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `stayin-listing-${listing.id}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareWhatsApp() {
    const dataUrl = await makeImage();
    if (dataUrl && navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `stayin-listing-${listing.id}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "Stayin", text: shareText, files: [file], url: shareUrl });
          return;
        }
      } catch {
        // fallback below
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  }

  const isSm = size === "sm";
  const modal = open ? (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(3,9,22,0.78)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
      }}
    >
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          width: "min(940px, 100%)",
          maxHeight: "96vh",
          overflow: "hidden",
          borderRadius: 24,
          background: "#06101f",
          boxShadow: "0 30px 100px rgba(0,0,0,0.46)",
          padding: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#ffffff" }}>{isHe ? "כרטיס שיתוף מודעה" : "Listing share ticket"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", marginTop: 2 }}>{isHe ? "תמונה מוכנה לשיתוף בקבוצות" : "Ready image for groups"}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={isHe ? "סגור" : "Close"}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 999,
              width: 38,
              height: 38,
              cursor: "pointer",
              fontSize: 22,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ width: "100%", overflow: "hidden", borderRadius: 20, background: "#06101f", padding: 8 }}>
          <div
            style={{
              width: "100%",
              height: Math.ceil(TICKET_HEIGHT * previewScale),
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: TICKET_WIDTH,
                height: TICKET_HEIGHT,
                transform: `scale(${previewScale})`,
                transformOrigin: "top center",
                flexShrink: 0,
              }}
            >
              <div ref={cardRef} style={{ width: TICKET_WIDTH, height: TICKET_HEIGHT }}>
                <TicketPreview listing={listing} match={match} isHe={isHe} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 14 }}>
          {isMobile ? (
            <button type="button" onClick={shareWhatsApp} disabled={busy} style={actionButton("#25D366", "#ffffff")}>
              {busy ? (isHe ? "מכין תמונה..." : "Creating...") : isHe ? "שתף בוואטסאפ" : "Share WhatsApp"}
            </button>
          ) : null}
          <button type="button" onClick={downloadImage} disabled={busy} style={actionButton("#0d1b3e", "#ffffff")}>
            {busy ? (isHe ? "מכין תמונה..." : "Creating...") : isHe ? "הורד תמונה" : "Download image"}
          </button>
          <button type="button" onClick={copyLink} style={actionButton("#f1f5f9", "#0d1b3e")}>
            {copied ? (isHe ? "הקישור הועתק" : "Copied") : isHe ? "העתק קישור" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: isSm ? "8px 12px" : "10px 16px",
          borderRadius: isSm ? 4 : 5,
          border: "1px solid rgba(34,211,238,0.28)",
          background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(37,99,235,0.08))",
          color: "#0d1b3e",
          fontSize: isSm ? 10 : 12,
          fontWeight: 800,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {isHe ? "שתף מודעה" : "Share listing"}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}

function actionButton(bg: string, color: string): CSSProperties {
  return {
    padding: "11px 18px",
    borderRadius: 10,
    border: "none",
    background: bg,
    color,
    fontSize: 13,
    fontWeight: 850,
    cursor: "pointer",
  };
}
