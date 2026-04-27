"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../lib/LanguageContext";

const C = { text: "#0d1b3e", teal: "#1abfb0", navy: "#1a3a8f" };

export default function Footer() {
  const { lang } = useLanguage();
  const isHe = lang === "he";
  const fBody = isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)";

  return (
    <footer style={{ background: C.text, marginTop: 48 }}>
      <div className="footer-inner" style={{ maxWidth: "1100px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Image
            src="/stayin-logo-dark-transparent.png"
            alt="Stayin"
            width={90}
            height={24}
            style={{ height: "auto", width: "auto", maxHeight: "26px" }}
          />
        </Link>

        {/* Nav links */}
        <div className="footer-links" style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, alignItems: "center" }}>
          {[
            { he: "מונדיאל 2026",    en: "World Cup 2026",   href: "/sports/world-cup-2026" },
            { he: "כדורגל ישראלי",  en: "Israeli Football",  href: "/sports/football-israel" },
            { he: " הופעות חיות",          en: "Live Shows",        href: "/live-shows" },
            { he: "פרסם מודעה",     en: "Post listing",       href: "/post-listing" },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{ fontSize: 11, color: "rgba(255,255,255,.32)", textDecoration: "none", fontFamily: fBody, fontWeight: 600, transition: "color 150ms", whiteSpace: "nowrap" as const }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.7)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.32)")}
            >
              {isHe ? l.he : l.en}
            </Link>
          ))}
        </div>

        {/* Social + copyright */}
        <div className="footer-social" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.18)", fontFamily: fBody }}>© 2026</div>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.1)" }} />
          {[
            {
              label: "Instagram",
              href: "https://instagram.com/stayin.co.il",
              bg: "linear-gradient(135deg,#405de6,#e1306c,#fd1d1d,#f56040,#ffdc80)",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/>
                </svg>
              ),
            },
            {
              label: "TikTok",
              href: "https://tiktok.com/@stayin.co.il",
              bg: "#000",
              icon: (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.78 1.53V7.12a4.85 4.85 0 0 1-1.01-.43z"/>
                </svg>
              ),
            },
            {
              label: "Facebook",
              href: "https://facebook.com/stayin.co.il",
              bg: "#1877f2",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              ),
            },
          ].map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              style={{ width: 28, height: 28, borderRadius: 6, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "transform 150ms", border: "1px solid rgba(255,255,255,.08)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1.12)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:640px){
          .footer-inner{flex-direction:column!important;align-items:center!important;text-align:center;gap:16px!important;padding:18px 16px!important}
          .footer-links{flex-wrap:wrap!important;justify-content:center!important;gap:10px!important}
          .footer-social{justify-content:center!important;width:100%!important}
        }
      `}</style>
    </footer>
  );
}
