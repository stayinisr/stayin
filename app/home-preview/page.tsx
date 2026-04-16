"use client";

import Link from "next/link";
import { useLanguage } from "../../lib/LanguageContext";

const COLORS = {
  bg: "#f6f8fc",
  card: "rgba(255,255,255,0.82)",
  border: "rgba(13,27,62,0.08)",
  text: "#0d1b3e",
  muted: "#5f6f8f",
  soft: "#8da0bd",
  navy: "#10254e",
  turquoise: "#28d7c5",
  turquoiseSoft: "rgba(40,215,197,0.14)",
  white: "#ffffff",
};

const sportsCards = [
  {
    titleEn: "World Cup 2026",
    titleHe: "מונדיאל 2026",
    subtitleEn: "The biggest matches, all in one clear place",
    subtitleHe: "המשחקים הכי גדולים במקום אחד ברור",
    href: "/sports/world-cup-2026",
    badgeEn: "Featured now",
    badgeHe: "בולט עכשיו",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
  },
  {
    titleEn: "Football",
    titleHe: "כדורגל",
    subtitleEn: "Big matches, leagues and national teams",
    subtitleHe: "משחקים גדולים, ליגות ונבחרות",
    href: "/sports",
    badgeEn: "Popular",
    badgeHe: "פופולרי",
    image:
      "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=80",
  },
  {
    titleEn: "Basketball",
    titleHe: "כדורסל",
    subtitleEn: "Coming next",
    subtitleHe: "בקרוב",
    href: "/sports",
    badgeEn: "Soon",
    badgeHe: "בקרוב",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
  },
];

const liveCards = [
  {
    titleEn: "Live Shows",
    titleHe: "הופעות חיות",
    subtitleEn: "Concerts, tours and big live nights",
    subtitleHe: "הופעות, טורים ולילות גדולים",
    href: "/live-shows",
    badgeEn: "New category",
    badgeHe: "קטגוריה חדשה",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    titleEn: "Festivals",
    titleHe: "פסטיבלים",
    subtitleEn: "Multi-day events and summer weekends",
    subtitleHe: "אירועים מרובי ימים וסופי שבוע של קיץ",
    href: "/live-shows",
    badgeEn: "Soon",
    badgeHe: "בקרוב",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    titleEn: "Artists & Tours",
    titleHe: "אמנים וטורים",
    subtitleEn: "Find the right night, not endless posts",
    subtitleHe: "למצוא את הערב הנכון בלי ללכת לאיבוד בפוסטים",
    href: "/live-shows",
    badgeEn: "Soon",
    badgeHe: "בקרוב",
    image:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=80",
  },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 18,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-dm,'DM Sans',sans-serif)",
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: COLORS.text,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: COLORS.muted,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  subtitle,
  badge,
  href,
  image,
  large = false,
}: {
  title: string;
  subtitle: string;
  badge: string;
  href: string;
  image: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "inherit", minWidth: large ? 560 : 320 }}
    >
      <div
        style={{
          position: "relative",
          height: large ? 390 : 340,
          borderRadius: 28,
          overflow: "hidden",
          background: `${COLORS.navy}`,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 60px rgba(15,23,42,0.10)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scale(1.01)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(9,18,38,0.10) 0%, rgba(9,18,38,0.26) 30%, rgba(9,18,38,0.88) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(40,215,197,0.14) 0%, rgba(40,215,197,0.00) 42%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 22,
            top: 22,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.96)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: COLORS.turquoise,
              boxShadow: "0 0 20px rgba(40,215,197,0.8)",
            }}
          />
          {badge}
        </div>

        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-dm,'DM Sans',sans-serif)",
              color: COLORS.white,
              fontSize: large ? 42 : 30,
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              maxWidth: large ? 390 : 240,
              textWrap: "balance",
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 12,
              color: "rgba(255,255,255,0.80)",
              fontSize: 14,
              lineHeight: 1.55,
              maxWidth: large ? 360 : 230,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePreviewBLuxury() {
  const { lang } = useLanguage();
  const isHe = lang === "he";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(40,215,197,0.12), transparent 26%), linear-gradient(180deg, #fbfcfe 0%, #f6f8fc 100%)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 32,
            border: `1px solid ${COLORS.border}`,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(247,250,255,0.92) 58%, rgba(240,255,252,0.92) 100%)",
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
            padding: "42px 40px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -120,
              right: -80,
              width: 320,
              height: 320,
              borderRadius: 999,
              background: "radial-gradient(circle, rgba(40,215,197,0.16), transparent 68%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 999,
                background: COLORS.turquoiseSoft,
                border: "1px solid rgba(40,215,197,0.18)",
                color: COLORS.navy,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.02em",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: COLORS.turquoise,
                }}
              />
              {isHe ? "פלטפורמת כרטיסים יד שנייה" : "Second-hand ticket platform"}
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: isHe
                  ? "var(--font-he,'Heebo',sans-serif)"
                  : "var(--font-dm,'DM Sans',sans-serif)",
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 0.92,
                letterSpacing: "-0.06em",
                color: COLORS.text,
                fontWeight: 800,
                maxWidth: 700,
                textWrap: "balance",
              }}
            >
              {isHe
                ? "הכרטיסים הנכונים, במקום אחד ברור"
                : "The right tickets, in one clear place"}
            </h1>

            <p
              style={{
                margin: "18px 0 0",
                color: COLORS.muted,
                fontSize: 17,
                lineHeight: 1.7,
                maxWidth: 640,
              }}
            >
              {isHe
                ? "ספורט והופעות חיות, עם חוויית גלישה מסודרת ונקייה שמחברת בין אנשים בלי ללכת לאיבוד בין פוסטים וקבוצות."
                : "Sports and live shows, with a clean browsing experience that helps people connect without getting lost in endless posts and groups."}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              <Link
                href="/sports"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 18px",
                  borderRadius: 999,
                  background: COLORS.navy,
                  color: COLORS.white,
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: "0 14px 30px rgba(16,37,78,0.18)",
                }}
              >
                {isHe ? "לגלישה בקטגוריות" : "Browse categories"}
              </Link>

              <Link
                href="/post-listing"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.72)",
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {isHe ? "פרסם מודעה" : "Post listing"}
              </Link>
            </div>
          </div>
        </section>

        <div style={{ marginTop: 34 }}>
          <SectionHeader
            title={isHe ? "כרטיסי ספורט" : "Sports Tickets"}
            subtitle={
              isHe
                ? "כרטיסיות גדולות, ברורות ומזמינות לעולמות הספורט המרכזיים"
                : "Large, clear and inviting entry points into the biggest sports worlds"
            }
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr",
              gap: 18,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            <CategoryCard
              large
              title={isHe ? sportsCards[0].titleHe : sportsCards[0].titleEn}
              subtitle={isHe ? sportsCards[0].subtitleHe : sportsCards[0].subtitleEn}
              badge={isHe ? sportsCards[0].badgeHe : sportsCards[0].badgeEn}
              href={sportsCards[0].href}
              image={sportsCards[0].image}
            />
            {sportsCards.slice(1).map((card) => (
              <CategoryCard
                key={card.titleEn}
                title={isHe ? card.titleHe : card.titleEn}
                subtitle={isHe ? card.subtitleHe : card.subtitleEn}
                badge={isHe ? card.badgeHe : card.badgeEn}
                href={card.href}
                image={card.image}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 34 }}>
          <SectionHeader
            title={isHe ? "הופעות חיות" : "Live Shows"}
            subtitle={
              isHe
                ? "הופעות, פסטיבלים ואירועים חיים — באותה חוויית גלישה יוקרתית ונקייה"
                : "Concerts, festivals and live events — with the same refined browsing feel"
            }
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              gap: 18,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {liveCards.map((card, index) => (
              <CategoryCard
                key={card.titleEn}
                large={index === 0}
                title={isHe ? card.titleHe : card.titleEn}
                subtitle={isHe ? card.subtitleHe : card.subtitleEn}
                badge={isHe ? card.badgeHe : card.badgeEn}
                href={card.href}
                image={card.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
