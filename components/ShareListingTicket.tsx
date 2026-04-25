"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
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

function seatedTogetherLabel(value: string | null | undefined, isHe: boolean) {
  if (value === "yes") return isHe ? "כן" : "Yes";
  if (value === "no") return isHe ? "לא" : "No";
  return EMPTY;
}

function getShareUrl(listingId: string, matchId: string) {
  if (typeof window === "undefined") return `https://${SITE_URL}/matches/${matchId}?listing=${listingId}`;
  return `${window.location.origin}/matches/${matchId}?listing=${listingId}`;
}

function TeamSide({
  name,
  side,
  isHe,
}: {
  name?: string | null;
  side: "right" | "left";
  isHe: boolean;
}) {
  const translated = teamName(name, isHe);
  const flag = flagImgSrc(name);
  const isRight = side === "right";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isRight ? "flex-end" : "flex-start",
        gap: 10,
        minWidth: 0,
      }}
    >
      {isRight && flag && <img src={flag} crossOrigin="anonymous" alt="" style={flagStyle} />}
      <div
        style={{
          color: "#ffffff",
          fontSize: 24,
          lineHeight: 1.05,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          textAlign: isRight ? "right" : "left",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 210,
        }}
      >
        {clean(translated)}
      </div>
      {!isRight && flag && <img src={flag} crossOrigin="anonymous" alt="" style={flagStyle} />}
    </div>
  );
}

const flagStyle: CSSProperties = {
  width: 38,
  height: 28,
  borderRadius: 7,
  objectFit: "cover",
  border: "1px solid rgba(255,255,255,0.34)",
  boxShadow: "0 10px 20px rgba(0,0,0,0.22)",
  flexShrink: 0,
};

function DetailBox({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.07)",
        padding: "10px 12px",
        minHeight: 58,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.54)", fontSize: 10, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ color: "#ffffff", fontSize: strong ? 18 : 14, fontWeight: strong ? 900 : 750, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </div>
    </div>
  );
}

function TicketPreview({ listing, match, isHe }: { listing: ShareListing; match: ShareMatch; isHe: boolean }) {
  const home = teamName(match.home_team_name, isHe);
  const away = teamName(match.away_team_name, isHe);
  const price = formatPrice(listing.price, listing.type, isHe);
  const shareType = listingTypeLabel(listing.type, isHe);
  const category = clean(listing.category);
  const quantity = listing.quantity ? `${listing.quantity} ${isHe ? "כרטיסים" : "tickets"}` : EMPTY;
  const matchNumber = match.fifa_match_number ? `#${match.fifa_match_number}` : EMPTY;
  const location = [match.stadium, match.city].filter(Boolean).join(" · ") || EMPTY;
  const seller = listing.profile?.full_name || (isHe ? "משתמש Stayin" : "Stayin user");

  const details = [
    { label: isHe ? "מחיר" : "Price", value: price, strong: true },
    { label: isHe ? "כמות" : "Quantity", value: quantity },
    { label: isHe ? "קטגוריה" : "Category", value: category },
    { label: isHe ? "יציע / בלוק" : "Block", value: clean(listing.seats_block) },
    { label: isHe ? "שורה" : "Row", value: clean(listing.seats_row) },
    { label: isHe ? "מושבים" : "Seats", value: clean(listing.seats_numbers) },
    { label: isHe ? "יושבים יחד" : "Together", value: seatedTogetherLabel(listing.seated_together, isHe) },
    { label: isHe ? "מפרסם" : "Seller", value: clean(seller) },
  ];

  return (
    <div
      dir="ltr"
      style={{
        width: 940,
        height: 438,
        borderRadius: 34,
        overflow: "hidden",
        position: "relative",
        display: "grid",
        gridTemplateColumns: "262px 1fr",
        background: "linear-gradient(135deg, #081631 0%, #0a2147 44%, #0b3a66 100%)",
        boxShadow: "0 28px 80px rgba(3,12,28,0.34)",
        fontFamily: "var(--font-he, Heebo), var(--font-dm, Arial), sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 78% 22%, rgba(34,211,238,0.28), transparent 30%), radial-gradient(circle at 24% 90%, rgba(20,184,166,0.24), transparent 34%)" }} />
      <div style={{ position: "absolute", inset: 14, borderRadius: 26, border: "1px solid rgba(255,255,255,0.13)", pointerEvents: "none" }} />

      <aside
        style={{
          position: "relative",
          padding: "30px 24px",
          borderRight: "1px dashed rgba(255,255,255,0.24)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img src="/stayin-logo.svg" alt="Stayin" style={{ width: 150, height: "auto", display: "block", margin: "0 auto 4px" }} />
          <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 17, fontWeight: 900, letterSpacing: "0.22em" }}>TICKETS</div>
        </div>

        <div style={{ width: "100%", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 120,
              height: 46,
              borderRadius: 999,
              background: listing.type === "buy" ? "linear-gradient(135deg, #2563eb, #22d3ee)" : "linear-gradient(135deg, #14b8a6, #22d3ee)",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 950,
              boxShadow: "0 12px 30px rgba(34,211,238,0.25)",
            }}
          >
            {shareType}
          </div>
          <div style={{ color: "#75f3ff", fontSize: 17, fontWeight: 900, marginTop: 12, letterSpacing: "0.02em" }}>{SITE_URL}</div>
        </div>

        <div style={{ color: "rgba(255,255,255,0.54)", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: 1.4 }}>
          {isHe ? "בלי עמלה · פנייה ישירה בוואטסאפ" : "No fees · Direct WhatsApp contact"}
        </div>
      </aside>

      <main style={{ position: "relative", padding: "28px 30px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.64)", fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>FIFA WORLD CUP 2026</span>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#22d3ee" }} />
            <span style={{ color: "rgba(255,255,255,0.64)", fontSize: 12, fontWeight: 800 }}>{matchNumber}</span>
          </div>
          <div style={{ color: "#a5f3fc", fontSize: 13, fontWeight: 900 }}>{clean(match.stage)}</div>
        </div>

        <div
          style={{
            minHeight: 96,
            borderRadius: 22,
            padding: "20px 22px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 18,
            marginBottom: 16,
          }}
        >
          <TeamSide name={match.home_team_name} side="right" isHe={isHe} />
          <div style={{ color: "#22d3ee", fontSize: 16, fontWeight: 950, letterSpacing: "0.08em" }}>{isHe ? "נגד" : "VS"}</div>
          <TeamSide name={match.away_team_name} side="left" isHe={isHe} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
          <DetailBox label={isHe ? "תאריך" : "Date"} value={formatDate(match.match_date)} />
          <DetailBox label={isHe ? "שעה" : "Time"} value={formatTime(match.match_time)} />
          <DetailBox label={isHe ? "מיקום" : "Venue"} value={location} />
          <DetailBox label={isHe ? "סטטוס" : "Status"} value={listing.type === "buy" ? (isHe ? "מחפש כרטיס" : "Looking") : (isHe ? "כרטיס זמין" : "Available")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {details.map((d) => (
            <DetailBox key={d.label} label={d.label} value={d.value} strong={d.strong} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 14, marginTop: 12 }}>
          <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 12, fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {isHe ? "הערות" : "Notes"}: {clean(listing.notes)}
          </div>
          <div style={{ color: "rgba(255,255,255,0.46)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em" }}>STAY IN THE GAME</div>
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
        backgroundColor: "#081631",
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

      {open && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            background: "rgba(4,12,28,0.68)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            dir={isHe ? "rtl" : "ltr"}
            style={{
              width: "min(980px, 100%)",
              borderRadius: 24,
              background: "#ffffff",
              boxShadow: "0 24px 90px rgba(0,0,0,0.28)",
              padding: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#0d1b3e" }}>{isHe ? "כרטיס שיתוף מודעה" : "Listing share ticket"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{isHe ? "תמונה מוכנה לשיתוף בקבוצות" : "Ready image for groups"}</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ border: "none", background: "#f1f5f9", borderRadius: 999, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#0d1b3e" }}
              >
                ×
              </button>
            </div>

            <div style={{ width: "100%", overflowX: "auto", borderRadius: 22, background: "#081631", padding: 10 }}>
              <div ref={cardRef} style={{ transformOrigin: "top left" }}>
                <TicketPreview listing={listing} match={match} isHe={isHe} />
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button type="button" onClick={shareWhatsApp} disabled={busy} style={actionButton("#25D366", "#ffffff")}>
                {busy ? (isHe ? "מכין תמונה..." : "Creating...") : isHe ? "שתף בוואטסאפ" : "Share WhatsApp"}
              </button>
              <button type="button" onClick={downloadImage} disabled={busy} style={actionButton("#0d1b3e", "#ffffff")}>
                {isHe ? "הורד תמונה" : "Download image"}
              </button>
              <button type="button" onClick={copyLink} style={actionButton("#f1f5f9", "#0d1b3e")}>
                {copied ? (isHe ? "הקישור הועתק" : "Copied") : isHe ? "העתק קישור" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
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
