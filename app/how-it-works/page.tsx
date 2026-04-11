// ─── how-it-works/page.tsx ────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useLanguage } from "../../lib/LanguageContext";

const C = { usa: "#1a3a6b", canada: "#e63946", mexico: "#006847", border: "#e8edf5", text: "#0d1b3e", muted: "#64748b", hint: "#94a3b8", faint: "#cbd5e1" };

export default function HowItWorksPage() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  const steps = [
    {
      num: "01", color: C.usa,
      title: isHe ? "נרשמים בחינם" : "Sign up for free",
      desc: isHe ? "פותחים חשבון עם האימייל שלכם, מוסיפים שם ומספר וואטסאפ — ומוכנים. הכל חינמי לגמרי." : "Create an account with your email, add your name and WhatsApp number — and you're ready. Completely free.",
      icon: "✓",
    },
    {
      num: "02", color: C.mexico,
      title: isHe ? "מפרסמים או מחפשים" : "Post or search",
      desc: isHe ? "פרסמו מודעת מכירה או בקשת קנייה. חפשו לפי משחק, נבחרת, עיר, קטגוריה ומחיר. עד 10 מודעות בחינם." : "Post a sell listing or buy request. Search by match, team, city, category and price. Up to 10 listings free.",
      icon: "🔍",
    },
    {
      num: "03", color: C.canada,
      title: isHe ? "יוצרים קשר ישיר" : "Contact directly",
      desc: isHe ? "כל הפנייה נעשית ישירות בין הצדדים דרך וואטסאפ. אין תיווך, אין עמלה, אין סליקה דרך Stayin." : "All contact happens directly between parties via WhatsApp. No brokerage, no commission, no checkout.",
      icon: "💬",
    },
  ];

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.88)", border: `1px solid ${C.border}`, borderRadius: "10px", backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(13,27,62,0.05)" };

  return (
    <main style={{ minHeight: "100vh" }}>
      <style>{`@keyframes fsu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fsu{animation:fsu 380ms cubic-bezier(0.16,1,0.3,1) both}.fsu1{animation-delay:60ms}.fsu2{animation-delay:120ms}.fsu3{animation-delay:180ms}`}</style>
      <div style={{ height: "3px", background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)` }} />

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: C.hint, textDecoration: "none", marginBottom: "20px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ← {isHe ? "דף הבית" : "Home"}
        </Link>

        <div className="fsu" style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.usa, marginBottom: "12px" }}>STAY IN THE GAME</div>
          <h1 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.5px", color: C.text, marginBottom: "12px", lineHeight: 1.05 }}>
            {isHe ? "איך זה עובד" : "How it works"}
          </h1>
          <p style={{ fontSize: "14px", fontWeight: 300, color: C.muted, lineHeight: 1.8 }}>
            {isHe ? "Stayin מחבר בין קונים ומוכרים של כרטיסי מונדיאל 2026 בצורה פשוטה, מהירה וישירה." : "Stayin connects World Cup 2026 ticket buyers and sellers simply, quickly and directly."}
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {steps.map((s, i) => (
            <div key={s.num} className={`fsu fsu${i + 1}`} style={{ ...card, overflow: "hidden" }}>
              <div style={{ height: "2px", background: s.color }} />
              <div style={{ padding: "20px 24px", display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <div style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "32px", fontWeight: 800, color: s.color, opacity: 0.2, flexShrink: 0, lineHeight: 1, minWidth: "44px" }}>{s.num}</div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)", fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>{s.icon} {s.title}</h2>
                  <p style={{ fontSize: "13px", fontWeight: 300, color: C.muted, lineHeight: 1.8 }}>{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ background: "rgba(254,243,199,0.9)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "10px", padding: "20px 24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {isHe ? "⚠️ חשוב לדעת" : "⚠️ Important"}
          </h3>
          <p style={{ fontSize: "12px", color: "#78350f", lineHeight: 1.8, fontWeight: 300 }}>
            {isHe
              ? "Stayin אינו צד לעסקה, אינו בודק זהות משתמשים, אינו מטפל בתשלום ואינו אחראי לעסקה או לתוצאותיה. האתר מסייע לחיבור בין אנשים בלבד. תמיד מומלץ לוודא את זהות הצד השני לפני כל עסקה."
              : "Stayin is not a party to any transaction, does not verify user identity, does not process payments, and is not responsible for transactions or their outcomes. The platform only helps connect people. Always verify who you're dealing with before any transaction."}
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/" style={{ padding: "11px 22px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px", fontWeight: 600, color: C.muted, textDecoration: "none" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.usa; (e.currentTarget as HTMLElement).style.color = C.usa; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; }}>
            {isHe ? "← דף הבית" : "← Back home"}
          </Link>
          <Link href="/auth" style={{ padding: "11px 22px", background: C.usa, color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em" }}>
            {isHe ? "הצטרפו בחינם" : "Join for free"}
          </Link>
        </div>
      </div>
    </main>
  );
}
