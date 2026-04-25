"use client";

import { useState } from "react";

type Props = {
  listingId: string;
  matchName: string;
  price: string;
  isHe?: boolean;
  size?: "sm" | "md";
};

export default function ShareButton({ listingId, matchName, price, isHe = true, size = "md" }: Props) {
  const [copied, setCopied] = useState(false);

  const url  = `https://stayin.co.il/listing/${listingId}`;
  const text = isHe
    ? `מצאתי כרטיסים ל${matchName} ב-${price} ב-Stayin 🎟️\n${url}`
    : `Found tickets for ${matchName} at ${price} on Stayin 🎟️\n${url}`;

  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  function handleShare() {
    // Try native share first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: `כרטיסים ל${matchName}`, url }).catch(() => {});
      return;
    }
    // Fallback: WhatsApp
    window.open(waUrl, "_blank");
  }

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isSm = size === "sm";

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {/* WhatsApp share */}
      <button
        onClick={handleShare}
        title={isHe ? "שתף בוואטסאפ" : "Share on WhatsApp"}
        style={{
          display: "flex", alignItems: "center", gap: isSm ? 4 : 6,
          padding: isSm ? "5px 10px" : "8px 16px",
          background: "#25D366", color: "#fff",
          border: "none", borderRadius: 6,
          fontSize: isSm ? 11 : 12, fontWeight: 700,
          cursor: "pointer", whiteSpace: "nowrap" as const,
          transition: "opacity 150ms",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = ".85")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
      >
        <span style={{ fontSize: isSm ? 13 : 15 }}>📤</span>
        {isHe ? "שתף" : "Share"}
      </button>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        title={isHe ? "העתק קישור" : "Copy link"}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: isSm ? "5px 8px" : "8px 10px",
          background: copied ? "rgba(26,191,176,.1)" : "rgba(13,27,62,.05)",
          border: `1px solid ${copied ? "rgba(26,191,176,.3)" : "#e8edf5"}`,
          borderRadius: 6,
          fontSize: isSm ? 11 : 12, fontWeight: 600,
          color: copied ? "#1abfb0" : "#94a3b8",
          cursor: "pointer", transition: "all 150ms",
          whiteSpace: "nowrap" as const,
        }}
      >
        {copied ? "✓" : "🔗"}
      </button>
    </div>
  );
}
