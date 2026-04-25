import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = { params: { id: string } };

// ── Metadata — WhatsApp / Telegram / Twitter read this ────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: listing } = await sb
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!listing) return { title: "Stayin" };

  let matchName = "";
  let price = "";
  let city = "";

  if (listing.match_id) {
    const { data: m } = await sb
      .from("matches")
      .select("home_team_name,away_team_name,city,match_date")
      .eq("id", listing.match_id)
      .single();
    if (m) {
      matchName = `${m.home_team_name ?? "TBD"} vs ${m.away_team_name ?? "TBD"}`;
      city = m.city ?? "";
    }
    price = listing.price ? `$${listing.price}` : "";
  } else if (listing.israeli_match_id) {
    const { data: m } = await sb
      .from("israeli_matches")
      .select("home_team,away_team,city,match_date")
      .eq("id", listing.israeli_match_id)
      .single();
    if (m) {
      matchName = `${m.home_team} נגד ${m.away_team}`;
      city = m.city ?? "";
    }
    price = listing.price ? `₪${listing.price}` : "";
  }

  const type  = listing.type === "sell" ? "כרטיסים למכירה" : "מחפש כרטיסים";
  const qty   = listing.quantity ? `${listing.quantity}×` : "";
  const title = `${qty} ${matchName} · ${type}`;
  const desc  = [price, city].filter(Boolean).join(" · ") + " | Stayin.co.il";
  const base  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stayin.co.il";
  const ogUrl = `${base}/listing/${params.id}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [{ url: `${ogUrl}/opengraph-image`, width: 1200, height: 630 }],
      url: ogUrl,
      siteName: "Stayin",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [`${ogUrl}/opengraph-image`],
    },
  };
}

// ── Page — renders HTML so bots read meta tags, users get JS redirect ─────────
export default async function ListingSharePage({ params }: Props) {
  const { data: listing } = await sb
    .from("listings")
    .select("match_id,israeli_match_id")
    .eq("id", params.id)
    .single();

  // Build redirect target
  let target = "/";
  if (listing?.match_id)          target = `/matches/${listing.match_id}`;
  if (listing?.israeli_match_id)  target = `/sports/football-israel/${listing.israeli_match_id}`;

  // Return a real HTML page (NOT redirect) so WhatsApp/Telegram bots
  // can scrape the og:image meta tag above.
  // The <script> and <meta refresh> handle the human redirect immediately.
  return (
    <html lang="he">
      <head>
        {/* Instant redirect for browsers */}
        <meta httpEquiv="refresh" content={`0;url=${target}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace("${target}");`,
          }}
        />
      </head>
      <body style={{ margin: 0, background: "#070e1f", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", fontFamily: "sans-serif", color: "#fff" }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
            Stay<span style={{ color: "#1abfb0" }}>in</span> 🎟️
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
            מעביר אותך...
          </div>
        </div>
      </body>
    </html>
  );
}
