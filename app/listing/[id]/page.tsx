import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = { params: { id: string } };

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
    const { data: m } = await sb.from("matches").select("home_team_name,away_team_name,city,match_date").eq("id", listing.match_id).single();
    if (m) {
      matchName = `${m.home_team_name ?? "TBD"} vs ${m.away_team_name ?? "TBD"}`;
      city = m.city ?? "";
    }
    price = listing.price ? `$${listing.price}` : "";
  } else if (listing.israeli_match_id) {
    const { data: m } = await sb.from("israeli_matches").select("home_team,away_team,city,match_date").eq("id", listing.israeli_match_id).single();
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
  const ogUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://stayin.co.il"}/listing/${params.id}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [`${ogUrl}/opengraph-image`],
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

export default async function ListingSharePage({ params }: Props) {
  const { data: listing } = await sb
    .from("listings")
    .select("match_id,israeli_match_id")
    .eq("id", params.id)
    .single();

  if (!listing) redirect("/");

  if (listing.match_id) redirect(`/matches/${listing.match_id}`);
  if (listing.israeli_match_id) redirect(`/sports/football-israel/${listing.israeli_match_id}`);

  redirect("/");
}
