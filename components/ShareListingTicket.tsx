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
  const [previewScale, setPreviewScale] = useState(0.58);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width <= 768);
      const availableWidth = Math.max(280, width - 44);
      const availableHeight = Math.max(260, height - 210);
      const scaleByWidth = availableWidth / 1600;
      const scaleByHeight = availableHeight / 900;
      setPreviewScale(Math.min(0.68, scaleByWidth, scaleByHeight));
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

function SafeImage({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style: CSSProperties;
}) {
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
        gap: 18,
        minWidth: 0,
      }}
    >
      {side === "left" && flagEl}
      <div
        style={{
          color: "#ffffff",
          fontSize: 54,
          lineHeight: 1,
          fontWeight: 950,
          letterSpacing: "-0.055em",
          textAlign: side === "left" ? "left" : "right",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 270,
          textShadow: "0 14px 35px rgba(0,0,0,0.32)",
        }}
      >
        {clean(translated)}
      </div>
      {side === "right" && flagEl}
    </div>
  );
}

const flagStyle: CSSProperties = {
  width: 62,
  height: 62,
  borderRadius: 999,
  objectFit: "cover",
  border: "1px solid rgba(255,255,255,0.32)",
  boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
  flexShrink: 0,
};

function InfoCell({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      style={{
        minWidth: 0,
        textAlign: "center",
        paddingInline: 10,
        borderInlineStart: "1px solid rgba(145,169,210,0.30)",
      }}
    >
      <div style={{ color: "rgba(207,218,245,0.55)", fontSize: 22, fontWeight: 750, marginBottom: 11, lineHeight: 1 }}>
        {label}
      </div>
      <div
        style={{
          color: strong ? "#7df9ff" : "#ffffff",
          fontSize: strong ? 34 : 28,
          fontWeight: strong ? 980 : 900,
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: strong ? "0 0 22px rgba(34,211,238,0.28)" : undefined,
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
    border: "3px solid rgba(39,117,241,0.72)",
    zIndex: 4,
  };
  return (
    <>
      <div style={{ ...cutout, left: -32, top: 250 }} />
      <div style={{ ...cutout, left: 305, top: -32 }} />
      <div style={{ ...cutout, left: 305, bottom: -32 }} />
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
  const location = [stadium !== EMPTY ? stadium : null, city !== EMPTY ? city : null].filter(Boolean).join(" · ") || EMPTY;
  const publisher = clean(listing.profile?.full_name);

  const topDetails = [
    { label: isHe ? "משחק" : "Match", value: matchNumber },
    { label: isHe ? "אצטדיון" : "Stadium", value: stadium },
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
        width: 1600,
        height: 900,
        position: "relative",
        overflow: "hidden",
        borderRadius: 58,
        border: "3px solid rgba(38,117,241,0.9)",
        background: "linear-gradient(130deg, #06142d 0%, #071d42 42%, #04101f 100%)",
        boxShadow: "0 44px 110px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(125,249,255,0.12)",
        fontFamily: "var(--font-he, Heebo), var(--font-dm, Arial), sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 73% 18%, rgba(34,211,238,0.18), transparent 26%), radial-gradient(circle at 16% 68%, rgba(37,99,235,0.18), transparent 28%)",
        }}
      />

      <SafeImage
        src="/stayin-stadium-bg.png"
        alt=""
        style={{
          position: "absolute",
          left: 0,
          bottom: 8,
          width: 560,
          height: "auto",
          opacity: 0.78,
          transform: "translateX(-76px)",
          zIndex: 1,
        }}
      />

      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 360, background: "linear-gradient(180deg, rgba(16,50,103,0.76), rgba(5,16,35,0.78))", zIndex: 2 }} />
      <div style={{ position: "absolute", left: 355, top: 0, bottom: 0, borderLeft: "4px dashed rgba(34,160,255,0.82)", zIndex: 3 }} />
      <TicketCutouts />

      <aside
        style={{
          position: "absolute",
          insetBlock: 0,
          left: 0,
          width: 354,
          padding: "78px 40px 70px",
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
              width: 244,
              height: "auto",
              maxHeight: 112,
              objectFit: "contain",
              marginInline: "auto",
              filter: "drop-shadow(0 0 18px rgba(34,211,238,0.28))",
            }}
          />
          <div style={{ color: "#7df9ff", fontSize: 31, fontWeight: 900, letterSpacing: "0.28em", marginTop: 20 }}>TICKETS</div>
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

      <main style={{ position: "absolute", left: 405, right: 64, top: 78, bottom: 62, zIndex: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 42 }}>
          <div>
            <div style={{ color: "#24dce9", fontSize: 34, fontWeight: 900, letterSpacing: "0.18em" }}>FIFA WORLD CUP 2026™</div>
            <div style={{ color: "rgba(215,223,249,0.66)", fontSize: 31, fontWeight: 650, letterSpacing: "0.17em", marginTop: 16 }}>{stage}</div>
          </div>
          <SafeImage
            src="/stayin-cup-icon.png"
            alt=""
            style={{
              width: 86,
              height: 86,
              objectFit: "contain",
              opacity: 0.9,
              filter: "drop-shadow(0 0 22px rgba(34,211,238,0.24))",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 42, marginBottom: 54 }}>
          <TeamNameWithFlag name={match.home_team_name} side="left" isHe={isHe} />
          <div style={{ color: "rgba(209,217,244,0.66)", fontSize: 36, fontWeight: 850, letterSpacing: "0.08em" }}>VS</div>
          <TeamNameWithFlag name={match.away_team_name} side="right" isHe={isHe} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", direction: isHe ? "rtl" : "ltr", marginBottom: 36 }}>
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

        <div
          dir={isHe ? "rtl" : "ltr"}
          style={{
            marginTop: 30,
            color: "rgba(218,228,255,0.55)",
            fontSize: 20,
            fontWeight: 650,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: isHe ? "right" : "left",
          }}
        >
          {isHe ? "מיקום" : "Location"}: {location} · {isHe ? "מפרסם" : "Publisher"}: {publisher} · {isHe ? "הערות" : "Notes"}: {clean(listing.notes)}
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
        padding: 18,
      }}
    >
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          width: "min(1040px, 100%)",
          maxHeight: "94vh",
          overflow: "auto",
          borderRadius: 24,
          background: "#06101f",
          boxShadow: "0 30px 100px rgba(0,0,0,0.46)",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
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
            }}
          >
            ×
          </button>
        </div>

        <div style={{ width: "100%", overflow: "hidden", borderRadius: 22, background: "#06101f", padding: 10 }}>
          <div
            style={{
              width: "100%",
              height: Math.ceil(900 * previewScale),
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 1600,
                height: 900,
                transform: `scale(${previewScale})`,
                transformOrigin: "top center",
                flexShrink: 0,
              }}
            >
              <div ref={cardRef} style={{ width: 1600, height: 900 }}>
                <TicketPreview listing={listing} match={match} isHe={isHe} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 16 }}>
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
