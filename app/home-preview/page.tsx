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
  aqua: "#17c8c0",
} as const;

type RailItem = {
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  badgeHe?: string;
  badgeEn?: string;
  href: string;
  glow: string;
  gradient: string;
  accent: string;
};

const sportsItems: RailItem[] = [
  {
    titleHe: "מונדיאל 2026",
    titleEn: "World Cup 2026",
    subtitleHe: "הדרך הכי נקייה למצוא ולפרסם כרטיסים למשחקים הגדולים.",
    subtitleEn: "The cleanest way to find and post tickets for the biggest matches.",
    badgeHe: "פופולרי עכשיו",
    badgeEn: "Popular now",
    href: "/sports/world-cup-2026",
    glow: "rgba(26,58,107,0.16)",
    gradient:
      "radial-gradient(circle at 82% 18%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0) 22%), linear-gradient(135deg, #183764 0%, #0d1b3e 58%, #081226 100%)",
    accent: C.aqua,
  },
  {
    titleHe: "ליגת האלופות",
    titleEn: "Champions League",
    subtitleHe: "עוד רגע גם משחקים אירופיים, נוקאאוטים ולילות גדולים.",
    subtitleEn: "Soon: European nights, knockouts, and the biggest fixtures.",
    badgeHe: "בקרוב",
    badgeEn: "Soon",
    href: "/sports",
    glow: "rgba(23,200,192,0.12)",
    gradient:
      "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 18%), linear-gradient(135deg, #0b1830 0%, #12305d 50%, #1f5d7c 100%)",
    accent: "#7dd3fc",
  },
  {
    titleHe: "ליגות ונבחרות",
    titleEn: "Leagues & national teams",
    subtitleHe: "בסיס אחד ברור לכל עולמות הספורט שייכנסו לפלטפורמה.",
    subtitleEn: "One clean base for every sports world coming to the platform.",
    badgeHe: "Stayin Sports",
    badgeEn: "Stayin Sports",
    href: "/sports",
    glow: "rgba(13,27,62,0.10)",
    gradient:
      "radial-gradient(circle at 85% 15%, rgba(23,200,192,0.24) 0%, rgba(23,200,192,0) 20%), linear-gradient(135deg, #102240 0%, #1a3a6b 42%, #13314b 100%)",
    accent: "#34d399",
  },
];

const liveItems: RailItem[] = [
  {
    titleHe: "הופעות ענק",
    titleEn: "Major concerts",
    subtitleHe: "האמנים, הפסטיבלים וההופעות שכולם מחפשים — במקום אחד ברור.",
    subtitleEn: "The artists, festivals and live shows everyone is looking for — in one clear place.",
    badgeHe: "Live",
    badgeEn: "Live",
    href: "/live-shows",
    glow: "rgba(230,57,70,0.12)",
    gradient:
      "radial-gradient(circle at 78% 18%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 18%), linear-gradient(135deg, #22102e 0%, #4c214f 48%, #7b2d50 100%)",
    accent: "#f472b6",
  },
  {
    titleHe: "פסטיבלים",
    titleEn: "Festivals",
    subtitleHe: "כרטיסים לאירועים עם ביקוש גבוה, בלי להיאבד בקבוצות ובהודעות.",
    subtitleEn: "Tickets for high-demand events, without getting lost in groups and repeated messages.",
    badgeHe: "בקרוב",
    badgeEn: "Soon",
    href: "/live-shows",
    glow: "rgba(14,165,233,0.10)",
    gradient:
      "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 20%), linear-gradient(135deg, #131b35 0%, #25325f 45%, #45517e 100%)",
    accent: "#a78bfa",
  },
  {
    titleHe: "סטאנד־אפ ומופעים",
    titleEn: "Shows & comedy",
    subtitleHe: "כרטיסי יד שנייה לעוד עולמות תוכן שייכנסו בהמשך בצורה מסודרת.",
    subtitleEn: "Second-hand tickets for more live categories arriving in a clean, structured way.",
    badgeHe: "Soon on Stayin",
    badgeEn: "Soon on Stayin",
    href: "/live-shows",
    glow: "rgba(99,102,241,0.10)",
    gradient:
      "radial-gradient(circle at 84% 14%, rgba(23,200,192,0.20) 0%, rgba(23,200,192,0) 18%), linear-gradient(135deg, #18162d 0%, #28284a 45%, #433f76 100%)",
    accent: "#fb7185",
  },
];

function RailCard({ item, isHe, featured = false }: { item: RailItem; isHe: boolean; featured?: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        flex: `0 0 ${featured ? "min(72vw, 540px)" : "min(54vw, 360px)"}`,
        scrollSnapAlign: "start",
      }}
    >
      <div
        style={{
          position: "relative",
          minHeight: featured ? "320px" : "270px",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)",
          background: item.gradient,
          boxShadow: `0 22px 70px ${item.glow}`,
          transform: "translateZ(0)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(13,27,62,0.06) 32%, rgba(8,18,38,0.40) 72%, rgba(8,18,38,0.74) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 18,
            left: isHe ? "auto" : 18,
            right: isHe ? 18 : "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.92)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: item.accent,
              boxShadow: `0 0 18px ${item.accent}`,
            }}
          />
          {isHe ? item.badgeHe : item.badgeEn}
        </div>

        <div
          style={{
            position: "absolute",
            insetInlineStart: 24,
            insetInlineEnd: 24,
            bottom: 22,
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
              color: "rgba(255,255,255,0.74)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {featured ? "Featured" : "Explore"}
          </div>

          <div
            style={{
              fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-syne,'Syne',sans-serif)",
              fontSize: featured ? "clamp(30px, 4vw, 40px)" : "clamp(22px, 3vw, 30px)",
              lineHeight: 1,
              fontWeight: isHe ? 900 : 800,
              letterSpacing: isHe ? "-0.02em" : "-0.02em",
              color: "#fff",
              maxWidth: featured ? "76%" : "84%",
            }}
          >
            {isHe ? item.titleHe : item.titleEn}
          </div>

          <div
            style={{
              maxWidth: featured ? 360 : 280,
              color: "rgba(255,255,255,0.72)",
              fontSize: 14,
              lineHeight: 1.65,
              fontWeight: 450,
              fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)",
            }}
          >
            {isHe ? item.subtitleHe : item.subtitleEn}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Rail({
  titleHe,
  titleEn,
  subHe,
  subEn,
  items,
  isHe,
}: {
  titleHe: string;
  titleEn: string;
  subHe: string;
  subEn: string;
  items: RailItem[];
  isHe: boolean;
}) {
  return (
    <section style={{ marginTop: 38 }}>
      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.hint,
            }}
          >
            {isHe ? "קטגוריה" : "Category"}
          </div>
          <div
            style={{
              fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-syne,'Syne',sans-serif)",
              fontSize: "clamp(26px, 3.4vw, 38px)",
              lineHeight: 1,
              fontWeight: isHe ? 900 : 800,
              letterSpacing: "-0.03em",
              color: C.text,
            }}
          >
            {isHe ? titleHe : titleEn}
          </div>
          <div
            style={{
              maxWidth: 520,
              color: C.muted,
              fontSize: 14,
              lineHeight: 1.8,
              fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)",
            }}
          >
            {isHe ? subHe : subEn}
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: C.usa,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          <span>{isHe ? "גלילה אופקית" : "Horizontal rail"}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 30, height: 2, background: C.usa, borderRadius: 999 }} />
            <span style={{ width: 14, height: 2, background: C.border, borderRadius: 999 }} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          overflowX: "auto",
          paddingBottom: 6,
          scrollSnapType: "x proximity",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="stayin-rail"
      >
        {items.map((item, idx) => (
          <RailCard key={idx} item={item} isHe={isHe} featured={idx === 0} />
        ))}
      </div>
    </section>
  );
}

export default function HomePreviewEditorial() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  const W = { maxWidth: "1220px", margin: "0 auto", padding: "0 20px" };

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        .stayin-rail::-webkit-scrollbar { display: none; }
        .modern-card-hover { transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease; }
        .modern-card-hover:hover { transform: translateY(-3px); filter: saturate(1.04); }
        @media (max-width: 900px) {
          .editorial-hero { grid-template-columns: 1fr !important; }
          .editorial-actions { width: 100%; }
          .editorial-actions a { flex: 1 1 auto; justify-content: center; }
        }
      `}</style>

      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${C.usa} 33.3%, ${C.canada} 33.3% 66.6%, ${C.mexico} 66.6%)`,
        }}
      />

      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...W, paddingTop: 44, paddingBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 22,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.hint,
            }}
          >
            <span style={{ display: "flex", gap: 4 }}>
              {[C.usa, C.canada, C.mexico].map((c) => (
                <span key={c} style={{ width: 6, height: 6, borderRadius: 999, background: c, display: "inline-block" }} />
              ))}
            </span>
            {isHe ? "Stayin · קטגוריות כרטיסים" : "Stayin · Ticket categories"}
          </div>

          <div
            className="editorial-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
              gap: 28,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 30,
                background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)",
                padding: "34px 32px 30px",
                boxShadow: "0 20px 60px rgba(13,27,62,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.usa,
                  marginBottom: 16,
                }}
              >
                STAY IN THE GAME
              </div>

              <h1
                style={{
                  margin: 0,
                  marginBottom: 18,
                  fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-syne,'Syne',sans-serif)",
                  fontSize: "clamp(42px, 6vw, 76px)",
                  lineHeight: 0.96,
                  fontWeight: isHe ? 900 : 800,
                  letterSpacing: "-0.04em",
                  color: C.text,
                }}
              >
                {isHe ? (
                  <>
                    כל הכרטיסים
                    <br />
                    <span style={{ color: C.usa }}>לפי עולמות תוכן.</span>
                  </>
                ) : (
                  <>
                    ALL TICKETS
                    <br />
                    <span style={{ color: C.usa }}>BY CATEGORY.</span>
                  </>
                )}
              </h1>

              <p
                style={{
                  maxWidth: 560,
                  color: C.muted,
                  fontSize: 15,
                  lineHeight: 1.9,
                  margin: 0,
                  marginBottom: 26,
                  fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)",
                }}
              >
                {isHe
                  ? "הכניסה החדשה ל-Stayin: גולשים לפי קטגוריות, מגיעים מהר לאירוע הנכון, וממשיכים למודעות בלי ללכת לאיבוד בדרך."
                  : "The new Stayin entry point: browse by category, reach the right event faster, and move into listings without getting lost on the way."}
              </p>

              <div className="editorial-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="#category-rails"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "13px 24px",
                    borderRadius: 999,
                    textDecoration: "none",
                    background: C.usa,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    boxShadow: "0 12px 28px rgba(26,58,107,0.18)",
                  }}
                >
                  {isHe ? "גלישה לפי קטגוריות" : "Browse categories"}
                </a>
                <Link
                  href="/post-listing"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "13px 22px",
                    borderRadius: 999,
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.88)",
                    color: C.text,
                    border: `1px solid ${C.border}`,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {isHe ? "+ פרסם מודעה" : "+ Post listing"}
                </Link>
              </div>
            </div>

            <div
              className="modern-card-hover"
              style={{
                position: "relative",
                borderRadius: 30,
                overflow: "hidden",
                minHeight: 360,
                background:
                  "radial-gradient(circle at 18% 16%, rgba(23,200,192,0.24) 0%, rgba(23,200,192,0) 22%), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0) 18%), linear-gradient(135deg, #102240 0%, #183764 42%, #091526 100%)",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 34px 90px rgba(13,27,62,0.14)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.00) 34%, rgba(9,21,38,0.42) 72%, rgba(9,21,38,0.82) 100%)",
                }}
              />

              <div style={{ position: "absolute", top: 22, left: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[isHe ? "ספורט" : "Sports", isHe ? "לייב" : "Live", "WA"].map((tag, i) => (
                  <span
                    key={tag}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: i === 0 ? "rgba(23,200,192,0.12)" : "rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(14px)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ position: "absolute", insetInlineStart: 24, insetInlineEnd: 24, bottom: 22 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  {[
                    {
                      n: "01",
                      tHe: "כרטיסי ספורט",
                      tEn: "Sports tickets",
                    },
                    {
                      n: "02",
                      tHe: "הופעות חיות",
                      tEn: "Live shows",
                    },
                  ].map((box) => (
                    <div
                      key={box.n}
                      style={{
                        borderRadius: 18,
                        padding: "16px 16px 18px",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <div style={{ color: "rgba(255,255,255,0.44)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em" }}>
                        {box.n}
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          color: "#fff",
                          fontSize: 20,
                          fontWeight: 800,
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                          fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-syne,'Syne',sans-serif)",
                        }}
                      >
                        {isHe ? box.tHe : box.tEn}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    fontSize: 14,
                    lineHeight: 1.8,
                    maxWidth: 470,
                    fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)",
                  }}
                >
                  {isHe
                    ? "אותו DNA של Stayin — פשוט, מהיר, נקי — אבל עם כניסה חדשה לפי קטגוריות במקום להיכנס ישר רק למונדיאל."
                    : "The same Stayin DNA — simple, fast, clean — but with a new category-led entry instead of jumping straight into only the World Cup."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="category-rails" style={{ ...W, paddingTop: 34, paddingBottom: 44 }}>
        <Rail
          titleHe="כרטיסי ספורט"
          titleEn="Sports tickets"
          subHe="עולם הספורט נשאר הכניסה החזקה של Stayin — אבל עכשיו כחלק מפלטפורמה רחבה יותר, מסודרת יותר ועתידית יותר."
          subEn="Sports stays the strongest Stayin entry point — now as part of a broader, cleaner and more future-ready platform."
          items={sportsItems}
          isHe={isHe}
        />

        <Rail
          titleHe="הופעות חיות"
          titleEn="Live shows"
          subHe="קטגוריה מקבילה שתאפשר ל-Stayin לגדול מעבר לספורט, בלי לשבור את השפה ובלי להפוך את דף הבית לעמוס."
          subEn="A parallel category that lets Stayin grow beyond sports without breaking the visual language or cluttering the homepage."
          items={liveItems}
          isHe={isHe}
        />

        <section style={{ marginTop: 44 }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 28,
              padding: "28px 26px",
              background:
                "radial-gradient(circle at 15% 20%, rgba(23,200,192,0.16) 0%, rgba(23,200,192,0) 16%), linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.90) 100%)",
              border: `1px solid ${C.border}`,
              boxShadow: "0 16px 44px rgba(13,27,62,0.04)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 18, alignItems: "center" }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: C.usa,
                    marginBottom: 10,
                  }}
                >
                  {isHe ? "מהלך המוצר" : "Product move"}
                </div>
                <div
                  style={{
                    fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-syne,'Syne',sans-serif)",
                    fontSize: "clamp(24px, 3vw, 34px)",
                    lineHeight: 1.05,
                    fontWeight: isHe ? 900 : 800,
                    letterSpacing: "-0.03em",
                    color: C.text,
                    marginBottom: 10,
                  }}
                >
                  {isHe ? "המונדיאל נשאר הכוכב — אבל לא כל הסיפור." : "The World Cup stays the star — but not the whole story."}
                </div>
                <div
                  style={{
                    maxWidth: 700,
                    color: C.muted,
                    fontSize: 14,
                    lineHeight: 1.9,
                    fontFamily: isHe ? "var(--font-he,'Heebo',sans-serif)" : "var(--font-dm,'DM Sans',sans-serif)",
                  }}
                >
                  {isHe
                    ? "בדיוק אותה חוויית משתמש, רק עם היררכיה חכמה יותר: בית כללי, קטגוריה, תחרות או אמן, ואז אירוע ומודעות."
                    : "The exact same UX, just with smarter hierarchy: general home, category, competition or artist, then event and listings."}
                </div>
              </div>

              <Link
                href="/sports/world-cup-2026"
                style={{
                  justifySelf: "start",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 20px",
                  borderRadius: 999,
                  textDecoration: "none",
                  background: C.usa,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                }}
              >
                {isHe ? "להיכנס למונדיאל" : "Enter World Cup"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
