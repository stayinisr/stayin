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
} as const;

function CategoryCard({
  href,
  eyebrow,
  title,
  description,
  accent,
  chip,
  meta,
  cta,
  secondaryCta,
  secondaryHref,
  disabled = false,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  chip?: string;
  meta?: string[];
  cta: string;
  secondaryCta?: string;
  secondaryHref?: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      style={{
        position: "relative",
        padding: "28px",
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,249,252,0.98) 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: accent,
        }}
      />

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.hint,
            }}
          >
            {eyebrow}
          </span>

          {chip ? (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "5px 10px",
                borderRadius: "999px",
                background: "rgba(26,58,107,0.06)",
                color: accent,
                border: `1px solid rgba(26,58,107,0.12)`,
                whiteSpace: "nowrap",
              }}
            >
              {chip}
            </span>
          ) : null}
        </div>

        <h2
          style={{
            fontFamily: "var(--font-syne,'Syne',sans-serif)",
            fontSize: "clamp(28px,4vw,42px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: C.text,
            marginBottom: "16px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.8,
            color: C.muted,
            maxWidth: "520px",
            marginBottom: "22px",
          }}
        >
          {description}
        </p>

        {meta?.length ? (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {meta.map((item) => (
              <span
                key={item}
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: C.hint,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  borderRadius: "999px",
                  padding: "6px 10px",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "24px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 22px",
            background: disabled ? "#eef2f7" : accent,
            color: disabled ? C.hint : "#fff",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "4px",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {cta}
        </span>

        {secondaryCta && secondaryHref ? (
          <Link
            href={secondaryHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 18px",
              background: C.white,
              color: C.text,
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "4px",
              textDecoration: "none",
              border: `1px solid ${C.border}`,
              whiteSpace: "nowrap",
            }}
          >
            {secondaryCta}
          </Link>
        ) : null}
      </div>
    </div>
  );

  if (disabled) {
    return (
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          background: C.white,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        overflow: "hidden",
        background: C.white,
        display: "block",
      }}
    >
      {content}
    </Link>
  );
}

export default function HomePreviewPage() {
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
        @media (max-width: 820px) {
          .hero-grid,
          .category-grid,
          .bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg,${C.usa} 33.3%,${C.canada} 33.3% 66.6%,${C.mexico} 66.6%)`,
        }}
      />

      <div style={{ background: "transparent", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...W, paddingTop: "44px", paddingBottom: "40px" }}>
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
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: c,
                    display: "inline-block",
                  }}
                />
              ))}
            </span>
            {isHe
              ? "כרטיסים יד שנייה · ספורט · הופעות חיות"
              : "Second-hand tickets · Sports · Live shows"}
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
                  כל הכרטיסים
                  <br />
                  <span style={{ color: C.usa }}>במקום אחד.</span>
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
                  ALL TICKETS
                  <br />
                  <span style={{ color: C.usa }}>IN ONE PLACE.</span>
                </h1>
              )}

              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  color: C.muted,
                  lineHeight: 1.8,
                  maxWidth: "460px",
                  marginBottom: "28px",
                  letterSpacing: isHe ? "0" : "0.01em",
                  fontFamily: isHe
                    ? "var(--font-he,'Heebo',sans-serif)"
                    : "var(--font-dm,'DM Sans',sans-serif)",
                }}
              >
                {isHe
                  ? "ספורט והופעות חיות — כל המודעות במקום אחד ברור, עם פנייה ישירה בין אנשים."
                  : "Sports and live shows — all listings in one clear place, with direct contact between people."}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href="#categories"
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

                <span
                  style={{
                    padding: "12px 22px",
                    border: `1px solid ${C.border}`,
                    color: C.muted,
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "4px",
                    background: C.white,
                  }}
                >
                  {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "1px",
                background: C.border,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                overflow: "hidden",
                minWidth: "320px",
              }}
            >
              {[
                { val: "2", lbl: isHe ? "קטגוריות" : "Categories", color: C.usa },
                { val: "128", lbl: isHe ? "מודעות לדוגמה" : "Preview listings", color: C.text },
                { val: "64", lbl: isHe ? "אירועי ספורט לדוגמה" : "Preview sports events", color: C.mexico },
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

      <div id="categories" style={{ ...W, paddingTop: "28px", paddingBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ ...smallCaps, marginBottom: "6px" }}>
              {isHe ? "קטגוריות" : "Categories"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-syne,'Syne',sans-serif)",
                fontSize: "22px",
                fontWeight: 800,
                color: C.text,
                letterSpacing: "-0.02em",
              }}
            >
              {isHe ? "בחר עולם והמשך פנימה" : "Choose a world and dive in"}
            </div>
          </div>

          <div style={{ fontSize: "12px", color: C.hint }}>
            {isHe ? "כמו נטפליקס, אבל לכרטיסים" : "Like Netflix, but for tickets"}
          </div>
        </div>

        <div
          className="category-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: "16px",
          }}
        >
          <CategoryCard
            href="/sports"
            eyebrow={isHe ? "כרטיסי ספורט" : "Sports tickets"}
            title={isHe ? "כדורגל וטורנירים" : "Football & tournaments"}
            description={
              isHe
                ? "מונדיאל 2026 וכל מה שיבוא אחריו. כניסה לעולם הספורט ומשם לטורנירים, משחקים ומודעות."
                : "World Cup 2026 and whatever comes next. Enter the sports category and continue to tournaments, matches, and listings."
            }
            accent={C.usa}
            chip="FIFA World Cup 2026"
            meta={
              isHe
                ? ["מונדיאל 2026", "כדורגל", "מודעות יד שנייה"]
                : ["World Cup 2026", "Football", "Second-hand listings"]
            }
            cta={isHe ? "כניסה לספורט →" : "Enter sports →"}
            secondaryCta={isHe ? "ישר למונדיאל" : "Go to World Cup"}
            secondaryHref="/sports/world-cup-2026"
          />

          <CategoryCard
            href="/live-shows"
            eyebrow={isHe ? "הופעות חיות" : "Live shows"}
            title={isHe ? "אמנים, מופעים ופסטיבלים" : "Artists, shows & festivals"}
            description={
              isHe
                ? "קטגוריה נפרדת להופעות חיות. בהמשך תוכל להוסיף אמנים, פסטיבלים ואירועים ספציפיים באותו מבנה בדיוק."
                : "A separate category for live shows. Later you can add artists, festivals, and specific events in the same exact structure."
            }
            accent={C.canada}
            chip={isHe ? "בקרוב" : "Coming soon"}
            meta={
              isHe
                ? ["הופעות", "פסטיבלים", "כרטיסים יד שנייה"]
                : ["Concerts", "Festivals", "Second-hand tickets"]
            }
            cta={isHe ? "כניסה להופעות →" : "Enter live shows →"}
            disabled
          />
        </div>
      </div>

      <div style={{ ...W, marginTop: "8px" }}>
        <div
          className="bottom-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr .8fr",
            gap: "16px",
            paddingBottom: "28px",
          }}
        >
          <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div
              style={{
                background: C.usa,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-syne,'Syne',sans-serif)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  FIFA World Cup 2026
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,.68)",
                    marginTop: "2px",
                    fontWeight: 300,
                  }}
                >
                  {isHe ? "נמצא בתוך קטגוריית הספורט" : "Lives inside the sports category"}
                </div>
              </div>
              <Link
                href="/sports/world-cup-2026"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#fff",
                  background: "rgba(255,255,255,.12)",
                  padding: "8px 12px",
                  borderRadius: "3px",
                  border: "1px solid rgba(255,255,255,.15)",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                {isHe ? "כניסה למונדיאל →" : "Open World Cup →"}
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "1px",
                background: C.border,
              }}
            >
              {[
                {
                  dot: C.usa,
                  name: isHe ? "כרטיסי ספורט" : "Sports tickets",
                  n: isHe ? "הקטגוריה הפעילה עכשיו" : "The active category right now",
                },
                {
                  dot: C.canada,
                  name: isHe ? "מונדיאל 2026" : "World Cup 2026",
                  n: isHe ? "התוכן הראשון בפנים" : "The first content inside",
                },
                {
                  dot: C.mexico,
                  name: isHe ? "הופעות חיות" : "Live shows",
                  n: isHe ? "מוכן להתרחבות בהמשך" : "Ready to expand next",
                },
              ].map((c) => (
                <div
                  key={c.name}
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: c.dot,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{c.name}</div>
                    <div style={{ fontSize: "10px", color: C.hint, marginTop: "1px" }}>{c.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              background: "rgba(255,255,255,0.8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <div style={{ ...smallCaps, marginBottom: "10px" }}>{isHe ? "למוכרים" : "For sellers"}</div>
              <div
                style={{
                  fontFamily: "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: C.text,
                  letterSpacing: "-0.02em",
                  marginBottom: "8px",
                }}
              >
                {isHe ? "יש לך כרטיסים למכור?" : "Got tickets to sell?"}
              </div>
              <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.8 }}>
                {isHe
                  ? "זהו דף תצוגה בלבד. כשתאשר את המבנה, נחבר אותו לזרימה האמיתית של האתר."
                  : "This is a preview-only page. Once you approve the structure, we can connect it to the live site flow."}
              </div>
            </div>

            <span
              style={{
                padding: "12px 20px",
                background: C.usa,
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "4px",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
                alignSelf: "flex-start",
              }}
            >
              {isHe ? "Preview only" : "Preview only"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
