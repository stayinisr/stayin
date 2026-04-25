"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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
  const [previewScale, setPreviewScale] = useState(0.5);
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

      const chromeHeight = mobile ? 255 : 180;
      const availableWidth = Math.max(260, width - (mobile ? 32 : 88));
      const availableHeight = Math.max(210, height - chromeHeight);
      const byWidth = availableWidth / TICKET_WIDTH;
      const byHeight = availableHeight / TICKET_HEIGHT;
      const maxScale = mobile ? 0.48 : 0.72;
      const minScale = mobile ? 0.22 : 0.36;
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

function fitFont(text: string, base: number, mediumAt: number, smallAt: number, min = 24) {
  if (text.length > smallAt) return Math.max(min, base - 16);
  if (text.length > mediumAt) return Math.max(min, base - 8);
  return base;
}

function actionButton(background: string, color: string): CSSProperties {
  return {
    border: 0,
    borderRadius: 14,
    minHeight: 54,
    padding: "0 18px",
    background,
    color,
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
  };
}

const baseTextShadow = "0 12px 22px rgba(0,0,0,0.35)";

function NeonText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span style={{ textShadow: baseTextShadow, ...style }}>{children}</span>;
}

function CupIcon() {
  return (
    <svg width="86" height="112" viewBox="0 0 86 112" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", filter: "drop-shadow(0 0 18px rgba(34,211,238,0.58))" }}>
      <path d="M43 8C58 8 70 19 70 33C70 44 63 54 53 58C51 69 56 82 64 95C54 101 32 101 22 95C30 82 35 69 33 58C23 54 16 44 16 33C16 19 28 8 43 8Z" stroke="#35F4FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
      <path d="M21 32C31 42 52 42 65 25" stroke="#35F4FF" strokeWidth="3" strokeLinecap="round" opacity="0.82"/>
      <path d="M31 57C38 50 48 49 55 57" stroke="#35F4FF" strokeWidth="3" strokeLinecap="round" opacity="0.66"/>
      <path d="M31 21C41 30 49 39 58 52" stroke="#35F4FF" strokeWidth="3" strokeLinecap="round" opacity="0.52"/>
      <path d="M27 96H59" stroke="#35F4FF" strokeWidth="4" strokeLinecap="round"/>
      <path d="M22 103H64" stroke="#35F4FF" strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );
}

function StadiumIcon({ rtl }: { rtl: boolean }) {
  return (
    <svg width="72" height="52" viewBox="0 0 72 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", filter: "drop-shadow(0 0 14px rgba(34,211,238,0.48))", transform: rtl ? "none" : "none" }}>
      <ellipse cx="36" cy="25" rx="30" ry="16" stroke="#22F4FF" strokeWidth="3" opacity="0.95"/>
      <ellipse cx="36" cy="25" rx="18" ry="8" stroke="#22F4FF" strokeWidth="2.5" opacity="0.72"/>
      <path d="M8 25V36C8 44 20 49 36 49C52 49 64 44 64 36V25" stroke="#22F4FF" strokeWidth="3" opacity="0.85"/>
      <path d="M15 36C24 42 48 42 57 36" stroke="#22F4FF" strokeWidth="2.4" opacity="0.6"/>
      <path d="M14 13V5M25 9V2M36 8V1M47 9V2M58 13V5" stroke="#22F4FF" strokeWidth="2.4" strokeLinecap="round" opacity="0.72"/>
    </svg>
  );
}

function StadiumDecoration() {
  const ribs = Array.from({ length: 14 }, (_, i) => 54 + i * 22);
  const rings = Array.from({ length: 6 }, (_, i) => i);
  return (
    <svg width="386" height="242" viewBox="0 0 386 242" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", left: 24, top: 315, width: 386, height: 242, opacity: 0.34, filter: "drop-shadow(0 0 22px rgba(34,211,238,0.34))" }}>
      <ellipse cx="193" cy="94" rx="164" ry="62" stroke="#168CFF" strokeWidth="3"/>
      <ellipse cx="193" cy="94" rx="110" ry="34" stroke="#24E9FF" strokeWidth="2" opacity="0.8"/>
      <path d="M29 94V138C29 179 101 212 193 212C285 212 357 179 357 138V94" stroke="#168CFF" strokeWidth="3" opacity="0.7"/>
      <path d="M54 135C86 166 136 184 193 184C250 184 300 166 332 135" stroke="#24E9FF" strokeWidth="2" opacity="0.55"/>
      {ribs.map((x, i) => <path key={"rib-" + i} d={"M" + x + " 49L" + (x + 20) + " 183"} stroke="#1DA7FF" strokeWidth="1.5" opacity="0.28" />)}
      {rings.map((_, i) => <ellipse key={"ring-" + i} cx="193" cy={72 + i * 22} rx={155 - i * 13} ry={56 - i * 5} stroke="#25EAFF" strokeWidth="1.3" opacity="0.18" />)}
    </svg>
  );
}

function Flag({ name }: { name?: string | null }) {
  const flag = flagImgSrc(name);
  if (!flag) return <div style={flagCircleStyle} />;
  return <img src={flag} crossOrigin="anonymous" alt="" style={flagCircleStyle} />;
}

const flagCircleStyle: CSSProperties = {
  width: 76,
  height: 76,
  borderRadius: 999,
  objectFit: "cover",
  flexShrink: 0,
  border: "1px solid rgba(255,255,255,0.35)",
  boxShadow: "0 16px 32px rgba(0,0,0,0.36)",
  background: "rgba(255,255,255,0.08)",
};

function TicketIconMark() {
  return (
    <svg width="62" height="42" viewBox="0 0 62 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginInlineStart: 8, filter: "drop-shadow(0 0 8px rgba(34,211,238,.35))" }}>
      <path d="M9 12L45 3C48 2 51 4 52 7L57 26C58 30 56 33 52 34L16 39C13 40 10 38 9 35L4 18C3 15 5 13 9 12Z" stroke="#58F7FF" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M24 25C27 29 33 29 36 25L39 21C42 17 39 12 34 13" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M38 17C35 13 29 13 26 17L23 21C20 25 23 30 28 29" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

function LogoBlock() {
  return (
    <div style={{ position: "absolute", left: 56, top: 92, width: 318, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
        <span style={{ color: "#ffffff", fontSize: 66, fontWeight: 950, letterSpacing: "-0.055em", textShadow: "0 12px 24px rgba(0,0,0,.35)" }}>Stay</span>
        <span style={{ color: "#28F4FF", fontSize: 66, fontWeight: 950, letterSpacing: "-0.055em", textShadow: "0 0 15px rgba(34,211,238,.35)" }}>in</span>
        <TicketIconMark />
      </div>
      <div style={{ color: "#35f2ff", marginTop: 18, fontSize: 31, fontWeight: 850, letterSpacing: "0.34em" }}>TICKETS</div>
    </div>
  );
}

function LeftPanel({ typeLabel }: { typeLabel: string }) {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 420, height: TICKET_HEIGHT, overflow: "hidden" }}>
      <LogoBlock />

      <div
        style={{
          position: "absolute",
          left: 48,
          top: 280,
          width: 340,
          height: 310,
          borderRadius: 999,
          background:
            "radial-gradient(ellipse at center, rgba(34,160,255,.22) 0%, rgba(34,160,255,.08) 48%, rgba(34,160,255,0) 74%)",
          opacity: 0.9,
        }}
      />
      <StadiumDecoration />

      <div
        style={{
          position: "absolute",
          left: 86,
          top: 640,
          width: 254,
          height: 84,
          borderRadius: 28,
          border: "3px solid #18f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: typeLabel.length > 5 ? 43 : 50,
          fontWeight: 950,
          lineHeight: 1,
          boxShadow: "0 0 24px rgba(24,244,255,.72), inset 0 0 32px rgba(24,244,255,.13)",
          background: "rgba(10,41,58,.46)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          padding: "0 12px",
        }}
      >
        {typeLabel}
      </div>
      <div style={{ position: "absolute", left: 96, top: 758, width: 230, textAlign: "center", color: "#2cf8ff", fontSize: 31, fontWeight: 750 }}>
        {SITE_URL}
      </div>
    </div>
  );
}

function CardShell({ children, typeLabel }: { children: ReactNode; typeLabel: string }) {
  return (
    <div
      style={{
        width: TICKET_WIDTH,
        height: TICKET_HEIGHT,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-he, Heebo), var(--font-dm, Arial), sans-serif",
        color: "#ffffff",
        background:
          "radial-gradient(circle at 20% 40%, rgba(21,122,255,.18) 0%, rgba(21,122,255,.06) 28%, transparent 56%), linear-gradient(105deg, #061121 0%, #071832 45%, #030914 100%)",
        borderRadius: 64,
        border: "3px solid rgba(72,132,255,.86)",
        boxShadow: "inset 0 0 0 1px rgba(0,239,255,.18), inset 0 0 52px rgba(42,116,255,.16), 0 0 32px rgba(57,122,255,.30)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 76% 26%, rgba(26,187,255,.08), transparent 35%)" }} />

      <div style={{ position: "absolute", left: 400, top: 0, width: 4, height: "100%", background: "linear-gradient(#16e7ff, #16e7ff)" , boxShadow: "0 0 18px #16e7ff" }} />
      <div style={{ position: "absolute", left: 391, top: 0, width: 24, height: "100%", background: "repeating-linear-gradient(to bottom, transparent 0 23px, #14e7ff 23px 38px)", opacity: .88 }} />
      <div style={notchStyle(367, -31)} />
      <div style={notchStyle(367, 865)} />
      <div style={sideNotchStyle()} />

      <LeftPanel typeLabel={typeLabel} />
      <div style={{ position: "absolute", left: 420, top: 0, width: 1180, height: TICKET_HEIGHT }}>{children}</div>
    </div>
  );
}

function notchStyle(left: number, top: number): CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width: 72,
    height: 72,
    borderRadius: 999,
    background: "#040b18",
    border: "3px solid rgba(72,132,255,.9)",
    boxShadow: "0 0 22px rgba(38,138,255,.4)",
    zIndex: 3,
  };
}

function sideNotchStyle(): CSSProperties {
  return {
    position: "absolute",
    left: -38,
    top: 315,
    width: 92,
    height: 92,
    borderRadius: 999,
    background: "#040b18",
    border: "3px solid rgba(72,132,255,.9)",
    boxShadow: "0 0 22px rgba(38,138,255,.4)",
    zIndex: 3,
  };
}

function TeamPill({ name, flagName, side, isHe }: { name: string; flagName?: string | null; side: "left" | "right"; isHe: boolean }) {
  const fontSize = fitFont(name, isHe ? 56 : 54, isHe ? 8 : 11, isHe ? 12 : 16, 34);
  const flexDirection = side === "left" ? "row" : "row-reverse";
  const textAlign = side === "left" ? "left" : "right";
  return (
    <div
      style={{
        width: 405,
        height: 105,
        borderRadius: 38,
        border: "2px solid rgba(110,154,255,.58)",
        background: "rgba(7,18,38,.36)",
        boxShadow: "inset 0 0 22px rgba(54,107,255,.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 22,
        padding: "0 28px",
        flexDirection,
        overflow: "hidden",
      }}
    >
      <Flag name={flagName} />
      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          flex: 1,
          minWidth: 0,
          textAlign,
          color: "#fff",
          fontSize,
          fontWeight: 950,
          lineHeight: 1,
          letterSpacing: isHe ? "-0.045em" : "-0.035em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: baseTextShadow,
        }}
      >
        {name}
      </div>
    </div>
  );
}

function DataCell({ label, value, price = false }: { label: string; value: string; price?: boolean }) {
  const cleaned = clean(value);
  return (
    <div style={{ minWidth: 0, textAlign: "center", padding: "0 10px" }}>
      <div style={{ color: "#28f4ff", fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 17 }}>{label}</div>
      <div
        style={{
          color: price ? "#40effa" : "#ffffff",
          fontSize: price ? fitFont(cleaned, 40, 7, 11, 30) : fitFont(cleaned, 34, 9, 14, 25),
          fontWeight: price ? 980 : 900,
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: price ? "0 0 22px rgba(34,211,238,0.42)" : baseTextShadow,
        }}
      >
        {cleaned}
      </div>
    </div>
  );
}

function DataGrid({ items }: { items: Array<{ label: string; value: string; price?: boolean }> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, alignItems: "center" }}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ borderLeft: index === 0 ? "none" : "2px solid rgba(119,151,255,.42)", minWidth: 0 }}>
          <DataCell label={item.label} value={item.value} price={item.price} />
        </div>
      ))}
    </div>
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
  const stage = stageLabel(match.stage, isHe);
  const stadiumText = stadium !== EMPTY && city !== EMPTY ? `${stadium} · ${city}` : stadium !== EMPTY ? stadium : city;
  const rowOne = [
    { label: isHe ? "קטגוריה" : "Category", value: clean(listing.category) },
    { label: isHe ? "שעה" : "Time", value: formatTime(match.match_time) },
    { label: isHe ? "תאריך" : "Date", value: formatDate(match.match_date) },
    { label: isHe ? "עיר" : "City", value: city },
    { label: isHe ? "משחק" : "Match", value: matchNumber },
  ];
  const rowTwo = [
    { label: isHe ? "כמות" : "Qty", value: quantity },
    { label: isHe ? "מושבים" : "Seats", value: clean(listing.seats_numbers) },
    { label: isHe ? "שורה" : "Row", value: clean(listing.seats_row) },
    { label: isHe ? "בלוק" : "Block", value: clean(listing.seats_block) },
    { label: isHe ? "יחד" : "Together", value: yesNo(listing.seated_together, isHe) },
    { label: isHe ? "מחיר" : "Price", value: price, price: true },
  ];

  return (
    <CardShell typeLabel={shareType}>
      <div style={{ position: "absolute", right: 72, top: 72 }}>
        <CupIcon />
      </div>

      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          left: isHe ? 380 : 75,
          top: 70,
          width: isHe ? 600 : 720,
          textAlign: isHe ? "right" : "left",
        }}
      >
        <div
          style={{
            color: "#5ef7ff",
            fontSize: isHe ? 48 : 43,
            fontWeight: 950,
            letterSpacing: isHe ? "0.02em" : "0.07em",
            textTransform: isHe ? "none" : "uppercase",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow: "0 0 18px rgba(34,211,238,0.30)",
          }}
        >
          {eventTitle(isHe)}
        </div>
        <div
          style={{
            color: "rgba(208,197,255,0.92)",
            fontSize: isHe ? 31 : 29,
            fontWeight: 850,
            letterSpacing: isHe ? "0" : "0.04em",
            marginTop: 24,
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {stage}
        </div>
      </div>

      <div style={{ position: "absolute", left: 75, top: 255, width: 1030, display: "grid", gridTemplateColumns: "405px 180px 405px", alignItems: "center" }}>
        <TeamPill name={homeName} flagName={match.home_team_name} side="left" isHe={isHe} />
        <div style={{ textAlign: "center", color: "#a69cf8", fontSize: 52, fontWeight: 900, lineHeight: 1, textShadow: "0 0 16px rgba(166,156,248,.28)" }}>VS</div>
        <TeamPill name={awayName} flagName={match.away_team_name} side="right" isHe={isHe} />
      </div>

      <div style={{ position: "absolute", left: 70, top: 410, width: 1040, height: 2, background: "rgba(113,153,255,.45)" }} />

      <div style={{ position: "absolute", left: 70, top: 462, width: 1040 }}>
        <DataGrid items={rowOne} />
      </div>

      <div style={{ position: "absolute", left: 70, top: 580, width: 1040, borderTop: "3px dashed rgba(88,139,255,.6)" }} />

      <div style={{ position: "absolute", left: 70, top: 632, width: 1040 }}>
        <DataGrid items={rowTwo} />
      </div>

      <div style={{ position: "absolute", left: 70, top: 760, width: 1040, height: 2, background: "rgba(113,153,255,.34)" }} />

      <div
        dir={isHe ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          left: 75,
          top: 795,
          width: 1030,
          display: "flex",
          alignItems: "center",
          gap: 22,
          flexDirection: isHe ? "row-reverse" : "row",
        }}
      >
        <StadiumIcon rtl={isHe} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            color: "#ffffff",
            fontSize: fitFont(stadiumText, 31, 26, 42, 23),
            fontWeight: 860,
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: isHe ? "right" : "left",
            textShadow: baseTextShadow,
          }}
        >
          {stadiumText}
        </div>
      </div>
    </CardShell>
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
          width: isMobile ? "min(100%, 430px)" : "min(1160px, 100%)",
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
          border: "1px solid rgba(32, 211, 238, 0.22)",
          background: "linear-gradient(135deg, rgba(13,27,62,.92), rgba(17,39,86,.92))",
          color: "#ffffff",
          borderRadius: 12,
          minHeight: isSm ? 34 : 40,
          padding: isSm ? "0 12px" : "0 16px",
          fontSize: isSm ? 13 : 14,
          fontWeight: 850,
          cursor: "pointer",
          boxShadow: "0 10px 28px rgba(0,0,0,.12)",
        }}
      >
        {isHe ? "שתף מודעה" : "Share listing"}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
