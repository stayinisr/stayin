import { supabase } from "../../lib/supabase";

export default async function ListingsPage() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      id,
      type,
      category,
      quantity,
      price,
      created_at,
      matches (
        fifa_match_number,
        home_team_name,
        away_team_name,
        city,
        stadium,
        match_date,
        match_time
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black text-[var(--text-primary)]">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-3">Listings</h1>
        <p className="text-gray-400 mb-8">
          Buy and sell listings from fans
        </p>

        {error ? (
          <p className="text-red-400">Failed to load listings.</p>
        ) : (
          <div className="grid gap-4">
            {listings?.map((listing: any) => (
              <div
                key={listing.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
              >
                <div className="text-sm text-green-400 font-semibold mb-2 uppercase">
                  {listing.type}
                </div>

                <div className="text-xl font-bold mb-2">
                  Match {listing.matches?.fifa_match_number} ·{" "}
                  {listing.matches?.home_team_name || "TBD"} vs{" "}
                  {listing.matches?.away_team_name || "TBD"}
                </div>

                <div className="text-sm text-gray-400 mb-1">
                  {listing.matches?.city} · {listing.matches?.stadium}
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  {listing.matches?.match_date} · {listing.matches?.match_time}
                </div>

                <div className="text-sm text-[var(--text-primary)]">
                  {listing.category} · {listing.quantity} tickets · ${listing.price}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}