"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type Band = {
  id: string;
  en: string;
  he: string;
  subEn: string;
  subHe: string;
  badgeEn: string;
  badgeHe: string;
  href: string;
  img: string;
  accentColor: string;
  live?: boolean;
  soon?: boolean;
};

// ── Data ──────────────────────────────────────────────────────────────────────
const BANDS: Band[] = [
  {
    id: "wc2026",
    en: "World Cup 2026",
    he: "מונדיאל 2026",
    subEn: "104 matches · USA, Canada & México · Live listings",
    subHe: "104 משחקים · ארה\"ב, קנדה ומקסיקו · מודעות פעילות",
    badgeEn: "Live now",
    badgeHe: "פעיל עכשיו",
    href: "/sports/world-cup-2026",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
    accentColor: "rgba(230,57,70,0.35)",
    live: true,
  },
  {
    id: "football",
    en: "Football",
    he: "כדורגל",
    subEn: "Leagues, cups & national teams",
    subHe: "ליגות, גביעים ונבחרות",
    badgeEn: "Sports",
    badgeHe: "ספורט",
    href: "/sports/football",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80",
    accentColor: "rgba(26,191,176,0.28)",
  },
  {
    id: "concerts",
    en: "Live Concerts",
    he: "הופעות חיות",
    subEn: "Artists, tours and big nights",
    subHe: "אמנים, טורים ולילות גדולים",
    badgeEn: "New",
    badgeHe: "חדש",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
    accentColor: "rgba(212,160,23,0.28)",
  },
  {
    id: "festivals",
    en: "Festivals",
    he: "פסטיבלים",
    subEn: "Multi-day events & summer weekends",
    subHe: "אירועים מרובי ימים וסופי שבוע של קיץ",
    badgeEn: "Soon",
    badgeHe: "בקרוב",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
    accentColor: "rgba(26,191,176,0.22)",
    soon: true,
  },
  {
    id: "artists",
    en: "Artists & Tours",
    he: "אמנים וטורים",
    subEn: "The right night, no endless scrolling",
    subHe: "הערב הנכון, בלי ללכת לאיבוד בפוסטים",
    badgeEn: "Soon",
    badgeHe: "בקרוב",
    href: "/live-shows",
    img: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=80",
    accentColor: "rgba(230,57,70,0.2)",
    soon: true,
  },
  {
    id: "basketball",
    en: "Basketball",
    he: "כדורסל",
    subEn: "Courts, leagues & playoff nights",
    subHe: "קורטים, ליגות ולילות פלייאוף",
    badgeEn: "Soon",
    badgeHe: "בקרוב",
    href: "/sports",
    img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
    accentColor: "rgba(212,160,23,0.22)",
    soon: true,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExpandBands() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const [active, setActive] = useState<string>("wc2026");

  return (
    <>
      <style>{`
        .eb-band {
          flex: 1;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: flex 420ms cubic-bezier(0.4,0,0.2,1);
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .eb-band:last-child { border-right: none; }
        .eb-band.eb-active { flex: 3.8; }

        .eb-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: opacity 420ms ease, transform 420ms ease;
          opacity: 0.18; transform: scale(1.04);
        }
        .eb-band.eb-active .eb-bg { opacity: 0.45; transform: scale(1.0); }

        .eb-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 20%, rgba(6,11,22,0.95) 100%);
        }

        .eb-accent {
          position: absolute; inset: 0;
          opacity: 0; transition: opacity 420ms;
        }
        .eb-band.eb-active .eb-accent { opacity: 1; }

        .eb-content {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 22px 20px;
        }

        .eb-num {
          font-size: 9px; font-weight: 800;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 8px;
          transition: color 300ms;
        }
        .eb-band.eb-active .eb-num { color: rgba(255,255,255,0.4); }

        .eb-title {
          font-family: var(--font-syne,'Syne',sans-serif);
          font-weight: 800; color: #fff;
          letter-spacing: -0.04em; line-height: 1.0;
          font-size: 15px;
          transition: font-size 350ms cubic-bezier(0.4,0,0.2,1);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .eb-band.eb-active .eb-title {
          font-size: 28px;
          white-space: normal; text-overflow: unset;
        }

        .eb-sub {
          font-size: 13px; color: rgba(255,255,255,0.52); line-height: 1.5;
          margin-top: 7px;
          max-height: 0; overflow: hidden;
          transition: max-height 350ms ease, opacity 300ms ease;
          opacity: 0;
        }
        .eb-band.eb-active .eb-sub { max-height: 80px; opacity: 1; }

        .eb-cta {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 14px;
          font-size: 12px; font-weight: 800;
          color: #1abfb0; letter-spacing: 0.04em;
          max-height: 0; overflow: hidden; opacity: 0;
          transition: max-height 300ms 80ms ease, opacity 250ms 80ms ease;
        }
        .eb-band.eb-active .eb-cta { max-height: 40px; opacity: 1; }

        .eb-badge {
          position: absolute; top: 14px; left: 14px;
          padding: 4px 10px; border-radius: 4px;
          font-size: 9px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; white-space: nowrap;
          opacity: 0; transition: opacity 300ms 100ms;
        }
        .eb-band.eb-active .eb-badge { opacity: 1; }

        .eb-badge-live {
          background: rgba(230,57,70,0.22);
          border: 1px solid rgba(230,57,70,0.4);
          color: #ff8a8a;
        }
        .eb-badge-new {
          background: rgba(26,191,176,0.15);
          border: 1px solid rgba(26,191,176,0.3);
          color: #1abfb0;
        }
        .eb-badge-soon {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.35);
        }

        .eb-soon-overlay {
          position: absolute; inset: 0;
          background: rgba(6,11,22,0.45);
          backdrop-filter: grayscale(0.6);
          transition: opacity 300ms;
        }
        .eb-band.eb-active .eb-soon-overlay { opacity: 0; }

        @keyframes ebFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "44px 28px 0" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", gap: 16,
          marginBottom: 18,
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "#1abfb0", marginBottom: 6,
            }}>
              {isHe ? "קטגוריות" : "Categories"}
            </div>
            <div style={{
              fontFamily: "var(--font-syne,'Syne',sans-serif)",
              fontSize: "clamp(22px,2.8vw,32px)",
              fontWeight: 800, letterSpacing: "-0.04em",
              color: "#0d1b3e", lineHeight: 1,
            }}>
              {isHe ? "מה אתה מחפש?" : "What are you looking for?"}
            </div>
          </div>
          <div style={{
            fontSize: 13, color: "#9aaac4", fontWeight: 400,
            textAlign: isHe ? "left" : "right" as const,
          }}>
            {isHe ? "עברו מעל קטגוריה לגלות אותה" : "Hover a category to explore it"}
          </div>
        </div>

        {/* Bands container */}
        <div style={{
          display: "flex",
          height: 380,
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "#06080f",
          boxShadow: "0 24px 64px rgba(6,11,22,0.28)",
        }}>
          {BANDS.map((band, i) => {
            const isActive = active === band.id;
            const badgeClass = band.live
              ? "eb-badge eb-badge-live"
              : band.soon
              ? "eb-badge eb-badge-soon"
              : "eb-badge eb-badge-new";

            return (
              <Link
                key={band.id}
                href={band.href}
                className={`eb-band${isActive ? " eb-active" : ""}`}
                onMouseEnter={() => setActive(band.id)}
                style={{ textDecoration: "none" }}
              >
                {/* Background image */}
                <div
                  className="eb-bg"
                  style={{ backgroundImage: `url(${band.img})` }}
                />

                {/* Dark gradient overlay */}
                <div className="eb-gradient" />

                {/* Accent color overlay */}
                <div
                  className="eb-accent"
                  style={{
                    background: `linear-gradient(160deg, ${band.accentColor} 0%, transparent 55%)`,
                  }}
                />

                {/* Soon overlay (grayscale dimmer) */}
                {band.soon && <div className="eb-soon-overlay" />}

                {/* Badge */}
                <div className={badgeClass}>
                  {isHe ? band.badgeHe : band.badgeEn}
                </div>

                {/* Content */}
                <div className="eb-content">
                  <div className="eb-num">
                    {String(i + 1).padStart(2, "0")} ·{" "}
                    {band.live
                      ? (isHe ? "ספורט" : "Sports")
                      : band.id === "football" || band.id === "basketball"
                      ? (isHe ? "ספורט" : "Sports")
                      : (isHe ? "הופעות" : "Live")}
                  </div>

                  <div className="eb-title">
                    {isHe ? band.he : band.en}
                  </div>

                  <div className="eb-sub">
                    {isHe ? band.subHe : band.subEn}
                  </div>

                  <div className="eb-cta">
                    {band.soon
                      ? (isHe ? "עדכנו אותי" : "Notify me")
                      : (isHe ? "כניסה לקטגוריה" : "Explore")}
                    <span style={{ fontSize: 14 }}>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer tags */}
        <div style={{
          display: "flex", gap: 8, marginTop: 14,
          flexWrap: "wrap", alignItems: "center",
        }}>
          {[
            { en: "Sports", he: "ספורט", color: "#1abfb0" },
            { en: "Live Shows", he: "הופעות חיות", color: "#1abfb0" },
            { en: "Festivals", he: "פסטיבלים", color: "#9aaac4" },
            { en: "No fees", he: "ללא עמלות", color: "#9aaac4" },
            { en: "Direct WhatsApp", he: "ישיר לוואטסאפ", color: "#9aaac4" },
          ].map(t => (
            <span key={t.en} style={{
              padding: "5px 12px",
              borderRadius: 4,
              background: "rgba(13,27,62,0.05)",
              border: "1px solid rgba(13,27,62,0.08)",
              fontSize: 11, fontWeight: 600,
              color: t.color,
              letterSpacing: "0.04em",
            }}>
              {isHe ? t.he : t.en}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
