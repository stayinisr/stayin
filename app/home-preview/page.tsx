"use client";

import Link from "next/link";
import { useLanguage } from "../../lib/LanguageContext";

const C = {
  usa: "#1a3a6b",
  canada: "#e63946",
  mexico: "#006847",
  bg: "#f8f9fc",
  white: "#ffffff",
  border: "#e8edf5",
  text: "#0d1b3e",
  muted: "#64748b",
  hint: "#94a3b8",
  faint: "#cbd5e1",
  accent: "#25c6c5",
} as const;

type RailCard = {
  titleEn: string;
  titleHe: string;
  subEn: string;
  subHe: string;
  href: string;
  badgeEn?: string;
  badgeHe?: string;
  tone: "sport" | "show" | "worldcup" | "placeholder";
};

const sportsCards: RailCard[] = [
  {
    titleEn: "FIFA World Cup 2026",
    titleHe: "מונדיאל 2026",
    subEn: "104 matches · direct fan-to-fan listings",
    subHe: "104 משחקים · מודעות ישירות בין אוהדים",
    href: "/sports/world-cup-2026",
    badgeEn: "Live now",
    badgeHe: "פעיל עכשיו",
    tone: "worldcup",
  },
  {
    titleEn: "Champions League",
    titleHe: "ליגת האלופות",
    subEn: "Big nights, knockout drama, premium demand",
    subHe: "לילות גדולים, נוקאאוט וביקוש גבוה",
    href: "/sports",
    badgeEn: "Coming next",
    badgeHe: "בדרך",
    tone: "sport",
  },
  {
    titleEn: "Israeli Football",
    titleHe: "כדורגל ישראלי",
    subEn: "League matches, finals and derby demand",
    subHe: "ליגה, גמרים ודרבים במקום אחד",
    href: "/sports",
    badgeEn: "Future category",
    badgeHe: "קטגוריה עתידית",
    tone: "sport",
  },
  {
    titleEn: "More Sports",
    titleHe: "עוד ענפי ספורט",
    subEn: "Basketball, national teams and major events",
    subHe: "כדורסל, נבחרות ואירועים גדולים",
    href: "/sports",
    tone: "placeholder",
  },
];

const showCards: RailCard[] = [
  {
    titleEn: "Live Concerts",
    titleHe: "הופעות חיות",
    subEn: "Arena shows, tours and premium tickets",
    subHe: "הופעות, סיבובים וכרטיסים מבוקשים",
    href: "/live-shows",
    badgeEn: "Coming soon",
    badgeHe: "יעלה בקרוב",
    tone: "show",
  },
  {
    titleEn: "Festivals",
    titleHe: "פסטיבלים",
    subEn: "Multi-day events and last-minute listings",
    subHe: "אירועים מרובי ימים ומודעות של הרגע האחרון",
    href: "/live-shows",
    tone: "show",
  },
  {
    titleEn: "Stand-Up & Stage",
    titleHe: "סטנדאפ ובמות",
    subEn: "Indoor venues, tours and city events",
    subHe: "אולמות, סיבובים ואירועים עירוניים",
    href: "/live-shows",
    tone: "show",
  },
  {
    titleEn: "More Live Events",
    titleHe: "עוד אירועים חיים",
    subEn: "A growing marketplace for every kind of night out",
    subHe: "מרקטפלייס שיגדל לכל סוג של בילוי",
    href: "/live-shows",
    tone: "placeholder",
  },
];

function Rail({
  title,
  subtitle,
  cards,
  isHe,
}: {
  title: string;
  subtitle: string;
  cards: RailCard[];
  isHe: boolean;
}) {
  return (
    <section style={{ marginTop: "26px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: "14px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.usa,
              marginBottom: "4px",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            fontSize: "11px",
            color: C.hint,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {isHe ? "גלילה אופקית" : "Horizontal rail"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "minmax(290px, 1fr)",
          gap: "14px",
          overflowX: "auto",
          paddingBottom: "6px",
          scrollbarWidth: "thin",
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.titleEn}
            href={card.href}
            style={{ textDecoration: "none" }}
          >
            <article
              className="st-card"
              style={{
                minHeight: "220px",
                borderRadius: "18px",
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                position: "relative",
                background: C.white,
                boxShadow: "0 12px 40px rgba(13,27,62,0.06)",
              }}
            >
              <div style={toneBackground(card.tone)} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(13,27,62,0.10) 40%, rgba(13,27,62,0.82) 100%)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "18px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "7px 10px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: "blur(10px)",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          card.tone === "show"
                            ? "#b794f6"
                            : card.tone === "worldcup"
                            ? C.accent
                            : "#fff",
                        boxShadow: "0 0 18px rgba(255,255,255,0.45)",
                      }}
                    />
                    {card.badgeEn ? (isHe ? card.badgeHe : card.badgeEn) : isHe ? "גלו" : "Explore"}
                  </span>

                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      backdropFilter: "blur(10px)",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontSize: "16px",
                    }}
                  >
                    ↗
                  </span>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: isHe
                        ? "var(--font-he,'Heebo',sans-serif)"
                        : "var(--font-syne,'Syne',sans-serif)",
                      fontSize: "28px",
                      fontWeight: isHe ? 900 : 800,
                      lineHeight: 1.02,
                      letterSpacing: isHe ? "-0.2px" : "-0.02em",
                      color: "#fff",
                      marginBottom: "9px",
                      maxWidth: "85%",
                    }}
                  >
                    {isHe ? card.titleHe : card.titleEn}
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.82)",
                      maxWidth: "90%",
                    }}
                  >
                    {isHe ? card.subHe : card.subEn}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function toneBackground(tone: RailCard["tone"]): React.CSSProperties {
  if (tone === "worldcup") {
    return {
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(circle at 18% 18%, rgba(37,198,197,0.34), transparent 34%),
        radial-gradient(circle at 82% 22%, rgba(230,57,70,0.16), transparent 26%),
        linear-gradient(135deg, #102447 0%, #17376a 50%, #0d1b3e 100%)`,
    };
  }

  if (tone === "show") {
    return {
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(circle at 18% 14%, rgba(183,148,246,0.34), transparent 34%),
        radial-gradient(circle at 76% 20%, rgba(255,111,145,0.18), transparent 24%),
        linear-gradient(135deg, #20113a 0%, #2f1659 48%, #12081f 100%)`,
    };
  }

  if (tone === "sport") {
    return {
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(circle at 20% 18%, rgba(37,198,197,0.18), transparent 34%),
        radial-gradient(circle at 78% 26%, rgba(255,255,255,0.12), transparent 20%),
        linear-gradient(135deg, #0f274d 0%, #163d76 58%, #102447 100%)`,
    };
  }

  return {
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(circle at 20% 18%, rgba(37,198,197,0.15), transparent 28%),
      linear-gradient(135deg, #44506a 0%, #25304a 100%)`,
  };
}

export default function HomePreviewModern() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  const W = { maxWidth: "1100px", margin: "0 auto", padding: "0 16px" };
  const smallCaps = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: C.hint,
  };

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        .st-card{transform:translateY(0);transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease}
        .st-card:hover{transform:translateY(-4px);box-shadow:0 20px 55px rgba(13,27,62,.12);border-color:rgba(26,58,107,.18)}
        .hero-cta{transition:transform .18s ease, opacity .18s ease, background .18s ease, color .18s ease, border-color .18s ease}
        .hero-cta:hover{transform:translateY(-1px)}
        @media (max-width: 820px){
          .hero-grid{grid-template-columns:1fr !important}
          .hero-actions{width:100%}
          .hero-actions a{flex:1}
        }
      `}</style>

      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)`,
        }}
      />

      <div style={{ background: "transparent", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...W, paddingTop: "44px", paddingBottom: "34px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "22px",
              ...smallCaps,
            }}
          >
            <span style={{ display: "flex", gap: "4px" }}>
              {[C.usa, C.canada, C.mexico].map((c) => (
                <span
                  key={c}
                  style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, display: "inline-block" }}
                />
              ))}
            </span>
            {isHe ? "פלטפורמת כרטיסים יד שנייה · ספורט · הופעות" : "Second-hand tickets platform · Sports · Live shows"}
          </div>

          <div
            className="hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "32px",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: C.usa,
                  marginBottom: "16px",
                }}
              >
                STAY IN THE MOMENT
              </div>

              {isHe ? (
                <h1
                  style={{
                    fontFamily: "var(--font-he,'Heebo',sans-serif)",
                    fontSize: "clamp(40px,5.5vw,68px)",
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: "-0.5px",
                    color: C.text,
                    marginBottom: "18px",
                  }}
                >
                  בוחרים קטגוריה.
                  <br />
                  <span style={{ color: C.usa }}>ממשיכים לאירוע.</span>
                </h1>
              ) : (
                <h1
                  style={{
                    fontFamily: "var(--font-syne,'Syne',sans-serif)",
                    fontSize: "clamp(40px,5.5vw,68px)",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    color: C.text,
                    marginBottom: "18px",
                  }}
                >
                  PICK A CATEGORY.
                  <br />
                  <span style={{ color: C.usa }}>MOVE TO THE EVENT.</span>
                </h1>
              )}

              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  color: C.muted,
                  lineHeight: 1.8,
                  maxWidth: "560px",
                  marginBottom: "28px",
                  letterSpacing: isHe ? "0" : "0.01em",
                  fontFamily: isHe
                    ? "var(--font-he,'Heebo',sans-serif)"
                    : "var(--font-dm,'DM Sans',sans-serif)",
                }}
              >
                {isHe
                  ? "עמוד בית בסגנון פלטפורמה: גולשים לפי קטגוריות, נכנסים לעולמות תוכן, ומשם ממשיכים לאירועים ולמודעות."
                  : "A platform-style homepage: browse by category, enter content worlds, then continue to events and listings."}
              </p>

              <div className="hero-actions" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href="#categories"
                  className="hero-cta"
                  style={{
                    padding: "12px 24px",
                    background: "transparent",
                    color: C.usa,
                    fontSize: "13px",
                    fontWeight: 700,
                    borderRadius: "4px",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    border: `2px solid ${C.usa}`,
                  }}
                >
                  {isHe ? "צפה בקטגוריות ↓" : "Browse categories ↓"}
                </a>

                <Link
                  href="/post-listing"
                  className="hero-cta"
                  style={{
                    padding: "12px 22px",
                    border: `1px solid ${C.border}`,
                    color: C.muted,
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "4px",
                    textDecoration: "none",
                    background: C.white,
                  }}
                >
                  {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                </Link>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "1px",
                background: C.border,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                overflow: "hidden",
                minWidth: "280px",
              }}
            >
              {[
                { val: "2", lbl: isHe ? "קטגוריות" : "Categories", color: C.usa },
                { val: "24/7", lbl: isHe ? "זמינות" : "Always on", color: C.text },
                { val: "WA", lbl: isHe ? "קשר ישיר" : "Direct contact", color: C.mexico },
              ].map((s, i) => (
                <div key={i} style={{ background: "transparent", padding: "18px 14px", textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-syne,'Syne',sans-serif)",
                      fontSize: "22px",
                      fontWeight: 800,
                      color: s.color,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {s.val}
                  </div>
                  <div style={{ ...smallCaps, marginTop: "4px" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="categories" style={{ ...W, paddingTop: "22px", paddingBottom: "52px" }}>
        <Rail
          title={isHe ? "כרטיסי ספורט" : "Sports Tickets"}
          subtitle={
            isHe
              ? "כניסות לעולמות הספורט עם דגש על אירועי ביקוש גדולים"
              : "Entry points to sports worlds, focused on high-demand events"
          }
          cards={sportsCards}
          isHe={isHe}
        />

        <Rail
          title={isHe ? "הופעות חיות" : "Live Shows"}
          subtitle={
            isHe
              ? "עולם הופעות שיכול לגדול בהמשך לפסטיבלים, סיבובים ומופעים"
              : "A live-entertainment world that can grow into festivals, tours and major shows"
          }
          cards={showCards}
          isHe={isHe}
        />

        <section style={{ marginTop: "26px" }}>
          <div
            style={{
              padding: "22px",
              border: `1px solid ${C.border}`,
              borderRadius: "18px",
              background: "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.75))",
              boxShadow: "0 12px 40px rgba(13,27,62,0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: "4px",
                  letterSpacing: "-0.3px",
                }}
              >
                {isHe ? "הכיוון החדש של דף הבית" : "New homepage direction"}
              </div>
              <div style={{ fontSize: "13px", lineHeight: 1.75, color: C.muted, maxWidth: "720px" }}>
                {isHe
                  ? "אותו vibe של Stayin, אבל במקום רשימת משחקים ישר בדף הבית — חוויית גלישה לפי קטגוריות, עם rails נוחים, מודרניים ויותר מזמינים."
                  : "The same Stayin vibe, but instead of dropping straight into matches, the homepage becomes a category-led browsing experience with cleaner, more inviting rails."}
              </div>
            </div>

            <Link
              href="/sports/world-cup-2026"
              className="hero-cta"
              style={{
                padding: "12px 26px",
                background: C.usa,
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "4px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
                flexShrink: 0,
              }}
            >
              {isHe ? "למונדיאל 2026 →" : "Go to World Cup 2026 →"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
