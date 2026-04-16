"use client";

import Link from "next/link";
import { ChevronRight, Ticket, Trophy, Music2, Sparkles, Radio, Star } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";

export default function HomePreviewPremiumPage() {
  const { lang } = useLanguage();
  const isHebrew = lang === "he";

  const t = {
    badge: isHebrew ? "תצוגה מקדימה" : "Preview",
    title1: isHebrew ? "כרטיסים יד שנייה" : "Second-hand tickets",
    title2: isHebrew ? "שמרגישים כמו פלטפורמה אמיתית" : "that feel like a real platform",
    subtitle: isHebrew
      ? "ספורט והופעות חיות במקום אחד ברור, מהיר ומדויק — עם כניסה לעולמות תוכן ולא לעוד רשימה יבשה."
      : "Sports and live shows in one clear, fast place — built around content worlds, not another dry list.",
    ctaPrimary: isHebrew ? "לחקור קטגוריות" : "Explore categories",
    ctaSecondary: isHebrew ? "פרסום מודעה" : "Post listing",
    stat1: isHebrew ? "עולמות תוכן" : "Content worlds",
    stat2: isHebrew ? "כניסה ישירה" : "Direct entry",
    stat3: isHebrew ? "עיצוב פרימיום" : "Premium feel",
    sectionTitle: isHebrew ? "בחר עולם" : "Choose your world",
    sectionSub: isHebrew
      ? "לא עוד דף בית טכני — אלא כניסה שמרגישה כמו תוכן שאתה רוצה לפתוח."
      : "Not a technical homepage — an entry point that feels like content you want to open.",
    sports: isHebrew ? "כרטיסי ספורט" : "Sports Tickets",
    sportsSub: isHebrew
      ? "כדורגל, גמרים, משחקים גדולים וטורנירים"
      : "Football, finals, big matches and tournaments",
    sportsTag: isHebrew ? "העולם הפעיל עכשיו" : "Live now",
    sportsCta: isHebrew ? "כניסה לספורט" : "Enter sports",
    live: isHebrew ? "הופעות חיות" : "Live Shows",
    liveSub: isHebrew
      ? "הופעות, פסטיבלים ואירועים שחייבים להיות בהם"
      : "Concerts, festivals and live events worth showing up for",
    liveTag: isHebrew ? "בקרוב מתרחב" : "Growing soon",
    liveCta: isHebrew ? "כניסה להופעות" : "Enter live shows",
    spotlight: isHebrew ? "בולט עכשיו בספורט" : "Spotlight in sports",
    wcTitle: isHebrew ? "FIFA World Cup 2026" : "FIFA World Cup 2026",
    wcSub: isHebrew
      ? "הכניסה הראשית שלך למשחקים, חיפוש מודעות וקנייה/מכירה בין אנשים."
      : "Your main entry into matches, listings and direct buyer-seller contact.",
    wcCta: isHebrew ? "כניסה למונדיאל" : "Open World Cup",
    footer: isHebrew
      ? "Preview בלבד — בלי חיבור לדאטה ובלי סיכון לעמוד הבית החי"
      : "Preview only — no data connection and no risk to the live homepage",
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.16),transparent_24%),linear-gradient(180deg,#06111f_0%,#081426_35%,#09111c_100%)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 shadow-[0_0_30px_rgba(45,212,191,0.18)] backdrop-blur-xl">
              <Ticket className="h-5 w-5 text-teal-300" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-wide">Stayin</div>
              <div className="text-xs text-white/45">{t.badge}</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs text-teal-200">
              {t.footer}
            </span>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%,rgba(45,212,191,0.08)_100%)]" />
          <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                {isHebrew ? "דף בית קטגורי חדש" : "New category-driven homepage"}
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                {t.title1}
                <span className="mt-2 block bg-gradient-to-r from-white via-teal-100 to-cyan-300 bg-clip-text text-transparent">
                  {t.title2}
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
                {t.subtitle}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:scale-[1.02]">
                  {t.ctaPrimary}
                </button>
                <button className="rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-medium text-white/88 transition hover:bg-white/10">
                  {t.ctaSecondary}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { icon: Trophy, label: t.stat1 },
                { icon: Radio, label: t.stat2 },
                { icon: Star, label: t.stat3 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[26px] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                      <Icon className="h-4.5 w-4.5 text-teal-200" />
                    </div>
                    <div className="text-sm font-medium text-white/90">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{t.sectionTitle}</h2>
              <p className="mt-1 text-sm text-white/56">{t.sectionSub}</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Link
              href="/sports"
              className="group relative overflow-hidden rounded-[30px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(10,18,32,0.96),rgba(8,41,56,0.88)_55%,rgba(14,102,123,0.78))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(3,7,18,0.45)_100%)]" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-cyan-300/12 blur-3xl transition duration-300 group-hover:scale-110" />
              <div className="pointer-events-none absolute left-6 top-6 flex gap-2 opacity-80">
                {[1,2,3].map((i) => (
                  <span key={i} className="h-24 w-16 rounded-2xl border border-white/8 bg-white/6 shadow-lg backdrop-blur-sm" />
                ))}
              </div>

              <div className="relative mt-28 flex items-end justify-between gap-6">
                <div>
                  <div className="mb-3 inline-flex items-center rounded-full border border-cyan-200/15 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                    {t.sportsTag}
                  </div>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] sm:text-[2rem]">{t.sports}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{t.sportsSub}</p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/8 transition group-hover:bg-white/12">
                  <ChevronRight className="h-5 w-5 text-white/85" />
                </div>
              </div>
            </Link>

            <Link
              href="/live-shows"
              className="group relative overflow-hidden rounded-[30px] border border-fuchsia-300/10 bg-[linear-gradient(135deg,rgba(18,8,28,0.96),rgba(53,18,68,0.9)_55%,rgba(123,39,87,0.78))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] transition duration-300 hover:-translate-y-1 hover:border-fuchsia-300/25"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.16),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(3,7,18,0.45)_100%)]" />
              <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-fuchsia-300/12 blur-3xl transition duration-300 group-hover:scale-110" />
              <div className="pointer-events-none absolute left-6 top-6 flex items-end gap-3 opacity-85">
                <div className="h-24 w-16 rounded-2xl border border-white/8 bg-white/6" />
                <div className="h-28 w-20 rounded-[22px] border border-white/10 bg-white/8" />
                <div className="h-20 w-14 rounded-2xl border border-white/8 bg-white/6" />
              </div>

              <div className="relative mt-28 flex items-end justify-between gap-6">
                <div>
                  <div className="mb-3 inline-flex items-center rounded-full border border-fuchsia-200/15 bg-fuchsia-300/10 px-3 py-1 text-xs text-fuchsia-100">
                    {t.liveTag}
                  </div>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] sm:text-[2rem]">{t.live}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{t.liveSub}</p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/8 transition group-hover:bg-white/12">
                  <ChevronRight className="h-5 w-5 text-white/85" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Link
            href="/sports/world-cup-2026"
            className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl transition hover:-translate-y-1 hover:border-teal-300/20"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(45,212,191,0.12),transparent_30%)]" />
            <div className="relative flex h-full flex-col justify-between gap-8 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-teal-200/15 bg-teal-300/10 px-3 py-1 text-xs text-teal-100">
                  {t.spotlight}
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{t.wcTitle}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/66">{t.wcSub}</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/88 transition group-hover:bg-white/12">
                {t.wcCta}
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="mb-4 text-sm font-medium text-white/90">
              {isHebrew ? "למה זה נראה יותר טוב" : "Why this feels better"}
            </div>
            <div className="space-y-3 text-sm leading-6 text-white/62">
              <p>{isHebrew ? "• הקטגוריות מרגישות כמו תוכן, לא כמו כפתורים רגילים." : "• Categories feel like content worlds, not standard buttons."}</p>
              <p>{isHebrew ? "• לכל עולם יש אופי ויזואלי משלו, בלי לשבור את השפה של Stayin." : "• Each world has its own visual identity without breaking the Stayin language."}</p>
              <p>{isHebrew ? "• המונדיאל נשאר בולט, אבל כבר לא כולא את המותג כולו." : "• The World Cup stays prominent without defining the whole brand."}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
