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
const TICKET_WIDTH = 1659;
const TICKET_HEIGHT = 948;

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

function stageLabel(stage?: string | null, isHe = true) {
  const value = clean(stage);
  if (value === EMPTY) return isHe ? "שלב" : "Stage";
  const lower = value.toLowerCase();

  if (isHe) {
    if (lower.includes("group")) return "שלב הבתים";
    if (lower.includes("round of 32")) return "32 האחרונות";
    if (lower.includes("round of 16")) return "שמינית גמר";
    if (lower.includes("quarter")) return "רבע גמר";
    if (lower.includes("semi")) return "חצי גמר";
    if (lower === "final" || lower.includes(" final")) return "גמר";
  } else {
    if (lower.includes("group")) return "Group Stage";
    if (lower.includes("round of 32")) return "Round of 32";
    if (lower.includes("round of 16")) return "Round of 16";
    if (lower.includes("quarter")) return "Quarter-final";
    if (lower.includes("semi")) return "Semi-final";
    if (lower === "final" || lower.includes(" final")) return "Final";
  }

  return value;
}

function eventTitle(isHe: boolean) {
  return isHe ? "מונדיאל 2026" : "FIFA WORLD CUP 2026™";
}

function getShareUrl(listingId: string, matchId: string) {
  if (typeof window === "undefined") return `https://${SITE_URL}/matches/${matchId}?listing=${listingId}`;
  return `${window.location.origin}/matches/${matchId}?listing=${listingId}`;
}

function useModalLayout(open: boolean) {
  const [mounted, setMounted] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.42);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width <= 768;
      setIsMobile(mobile);

      const chromeHeight = mobile ? 265 : 185;
      const availableWidth = Math.max(260, width - (mobile ? 34 : 84));
      const availableHeight = Math.max(210, height - chromeHeight);
      const byWidth = availableWidth / TICKET_WIDTH;
      const byHeight = availableHeight / TICKET_HEIGHT;
      const maxScale = mobile ? 0.47 : 0.61;
      const minScale = mobile ? 0.22 : 0.34;
      setPreviewScale(Math.max(minScale, Math.min(maxScale, byWidth, byHeight)));
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
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

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();

      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.onload = done;
        img.onerror = done;
      });
    })
  );

  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function fitFont(text: string, base: number, mediumAt: number, smallAt: number, min = 34) {
  if (text.length > smallAt) return Math.max(min, base - 18);
  if (text.length > mediumAt) return Math.max(min, base - 10);
  return base;
}

function TeamName({ value, x, y, w, align }: { value: string; x: number; y: number; w: number; align: "left" | "right" | "center" }) {
  const text = clean(value);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        color: "#ffffff",
        fontSize: fitFont(text, 53, 9, 14, 32),
        lineHeight: 1,
        fontWeight: 950,
        letterSpacing: text.length > 10 ? "-0.035em" : "-0.045em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: align,
        textShadow: "0 14px 35px rgba(0,0,0,0.48)",
      }}
    >
      {text}
    </div>
  );
}

const flagStyle: CSSProperties = {
  position: "absolute",
  width: 70,
  height: 70,
  borderRadius: 999,
  objectFit: "cover",
  border: "1px solid rgba(255,255,255,0.34)",
  boxShadow: "0 14px 30px rgba(0,0,0,0.38)",
};

function Flag({ name, x, y }: { name?: string | null; x: number; y: number }) {
  const flag = flagImgSrc(name);
  if (!flag) return <div style={{ ...flagStyle, left: x, top: y, background: "rgba(255,255,255,0.08)" }} />;
  return <img src={flag} crossOrigin="anonymous" alt="" style={{ ...flagStyle, left: x, top: y }} />;
}

function LabelValue({ label, value, x, y, w, strong = false }: { label: string; value: string; x: number; y: number; w: number; strong?: boolean }) {
  const text = clean(value);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        textAlign: "center",
        fontFamily: "var(--font-he, Heebo), var(--font-dm, Arial), sans-serif",
      }}
    >
      <div style={{ color: "#66f6ff", fontSize: 19, fontWeight: 900, marginBottom: 11, lineHeight: 1 }}>
        {label}
      </div>
      <div
        style={{
          color: strong ? "#65f7ff" : "#ffffff",
          fontSize: strong ? fitFont(text, 34, 7, 10, 25) : fitFont(text, 29, 8, 12, 22),
          fontWeight: strong ? 980 : 900,
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: strong ? "0 0 22px rgba(34,211,238,0.42)" : "0 10px 22px rgba(0,0,0,0.30)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Header({ isHe, stage }: { isHe: boolean; stage: string }) {
  const title = eventTitle(isHe);
  const box = isHe
    ? { left: 805, topTitle: 108, topStage: 168, width: 530, align: "right" as const }
    : { left: 520, topTitle: 106, topStage: 165, width: 760, align: "left" as const };

  return (
    <>
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          left: box.left,
          top: box.topTitle,
          width: box.width,
          color: "#5ef7ff",
          fontSize: isHe ? 38 : 36,
          fontWeight: 950,
          letterSpacing: isHe ? "0.025em" : "0.075em",
          textTransform: isHe ? "none" : "uppercase",
          lineHeight: 1,
          textAlign: box.align,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: "0 0 18px rgba(34,211,238,0.30)",
        }}
      >
        {title}
      </div>
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          left: box.left,
          top: box.topStage,
          width: box.width,
          color: "rgba(208,197,255,0.9)",
          fontSize: isHe ? 28 : 29,
          fontWeight: 850,
          letterSpacing: isHe ? "0" : "0.055em",
          textAlign: box.align,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {stage}
      </div>
    </>
  );
}

function TicketPreview({ listing, match, isHe }: { listing: ShareListing; match: ShareMatch; isHe: boolean }) {
  const homeName = teamName(match.home_team_name, isHe);
  const awayName = teamName(match.away_team_name, isHe);
  const shareType = listingTypeLabel(listing.type, isHe);
  const price = formatPrice(listing.price, listing.type, isHe);
  const quantity = listing.quantity ? `${listing.quantity}` : EMPTY;
  const matchNumber = match.fifa_match_number ? `#${match.fifa_match_number}` : EMPTY;
  const city = clean(match.city);
  const stadium = clean(match.stadium);
  const notes = clean(listing.notes);
  const template = isHe ? "/stayin-ticket-template-he.png?v=7" : "/stayin-ticket-template-en.png?v=7";
  const stage = stageLabel(match.stage, isHe);
  const stadiumText = stadium !== EMPTY && city !== EMPTY ? `${stadium} · ${city}` : stadium !== EMPTY ? stadium : city;

  return (
    <div
      dir="ltr"
      style={{
        width: TICKET_WIDTH,
        height: TICKET_HEIGHT,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-he, Heebo), var(--font-dm, Arial), sans-serif",
        color: "#ffffff",
        background: "#040b18",
      }}
    >
      <SafeImage src={template} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />

      <Header isHe={isHe} stage={stage} />

      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          left: 126,
          top: 653,
          width: 236,
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#75f7ff",
          fontSize: shareType.length > 5 ? 39 : 45,
          fontWeight: 950,
          lineHeight: 1,
          paddingBottom: 1,
          textShadow: "0 0 22px rgba(34,211,238,0.62)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {shareType}
      </div>

      <Flag name={match.home_team_name} x={515} y={305} />
      <TeamName value={homeName} x={595} y={326} w={300} align="left" />
      <TeamName value={awayName} x={1114} y={326} w={290} align="right" />
      <Flag name={match.away_team_name} x={1420} y={305} />

      <LabelValue label={isHe ? "קטגוריה" : "Category"} value={clean(listing.category)} x={512} y={468} w={150} />
      <LabelValue label={isHe ? "שעה" : "Time"} value={formatTime(match.match_time)} x={705} y={468} w={136} />
      <LabelValue label={isHe ? "תאריך" : "Date"} value={formatDate(match.match_date)} x={890} y={468} w={190} />
      <LabelValue label={isHe ? "עיר" : "City"} value={city} x={1128} y={468} w={174} />
      <LabelValue label={isHe ? "משחק" : "Match"} value={matchNumber} x={1380} y={468} w={124} />

      <LabelValue label={isHe ? "כמות" : "Qty"} value={quantity} x={512} y={635} w={110} />
      <LabelValue label={isHe ? "מושבים" : "Seats"} value={clean(listing.seats_numbers)} x={672} y={635} w={154} />
      <LabelValue label={isHe ? "שורה" : "Row"} value={clean(listing.seats_row)} x={870} y={635} w={124} />
      <LabelValue label={isHe ? "בלוק" : "Block"} value={clean(listing.seats_block)} x={1066} y={635} w={132} />
      <LabelValue label={isHe ? "יחד" : "Together"} value={yesNo(listing.seated_together, isHe)} x={1220} y={635} w={118} />
      <LabelValue label={isHe ? "מחיר" : "Price"} value={price} x={1366} y={635} w={150} strong />

      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          left: isHe ? 600 : 595,
          top: 814,
          width: isHe ? 760 : 790,
          color: "#ffffff",
          fontSize: fitFont(stadiumText, 29, 24, 38, 22),
          fontWeight: 860,
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: isHe ? "right" : "left",
          textShadow: "0 12px 22px rgba(0,0,0,0.35)",
        }}
      >
        {stadiumText}
      </div>

      {notes !== EMPTY ? (
        <div
          dir={isHe ? "rtl" : "ltr"}
          style={{
            position: "absolute",
            left: 610,
            top: 864,
            width: 790,
            color: "rgba(230,237,255,0.58)",
            fontSize: 16,
            fontWeight: 650,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: isHe ? "right" : "left",
          }}
        >
          {isHe ? "הערות" : "Notes"}: {notes}
        </div>
      ) : null}
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
      await waitForImages(cardRef.current);

      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#040b18",
        style: {
          backgroundColor: "#040b18",
        },
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
        background: "rgba(3,9,22,0.76)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? 10 : 18,
      }}
    >
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          width: isMobile ? "min(100%, 430px)" : "min(1100px, 100%)",
          maxHeight: "96vh",
          overflow: "hidden",
          borderRadius: isMobile ? 30 : 28,
          background: "#06101f",
          boxShadow: "0 34px 100px rgba(0,0,0,0.52)",
          padding: isMobile ? 14 : 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: isMobile ? 14 : 16 }}>
          <div>
            <div style={{ fontSize: isMobile ? 21 : 20, fontWeight: 950, color: "#ffffff" }}>{isHe ? "כרטיס שיתוף מודעה" : "Listing share ticket"}</div>
            <div style={{ fontSize: isMobile ? 13 : 12, color: "rgba(255,255,255,0.58)", marginTop: 4 }}>{isHe ? "תמונה מוכנה לשיתוף בקבוצות" : "Ready image for groups"}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={isHe ? "סגור" : "Close"}
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 999,
              width: isMobile ? 44 : 40,
              height: isMobile ? 44 : 40,
              cursor: "pointer",
              fontSize: 25,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ width: "100%", overflow: "hidden", borderRadius: 22, background: "#040b18" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, minmax(160px, 1fr))", gap: 12, marginTop: isMobile ? 18 : 16 }}>
          {isMobile ? (
            <button type="button" onClick={shareWhatsApp} disabled={busy} style={{ ...actionButton("#25D366", "#ffffff"), gridColumn: "1 / -1" }}>
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
    padding: "14px 18px",
    borderRadius: 14,
    border: "none",
    background: bg,
    color,
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
    minHeight: 52,
  };
}
