// Probe the matches table to understand schema + 2026 bracket placeholders
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cihpuwinkgaumngsftin.supabase.co",
  "sb_publishable_uFMJVz_1cBnHK_DEhBNlHg_5_SdFhOK"
);

const { data, error } = await supabase
  .from("matches")
  .select("*")
  .order("fifa_match_number", { ascending: true });

if (error) {
  console.error(error);
  process.exit(1);
}

console.log("TOTAL:", data.length);

const stages = {};
for (const m of data) stages[m.stage] = (stages[m.stage] || 0) + 1;
console.log("STAGES:");
for (const [s, n] of Object.entries(stages)) console.log("  ", s, "->", n);

console.log("\nSAMPLE FIELDS:", Object.keys(data[0]).join(", "));

console.log("\nGROUP A SAMPLE:");
for (const m of data.filter((m) => m.stage === "Group A")) {
  console.log("  #" + m.fifa_match_number, m.home_team_name, "vs", m.away_team_name);
}

console.log("\nROUND OF 32 (all 16):");
for (const m of data.filter((m) => m.stage === "Round of 32")) {
  console.log("  #" + m.fifa_match_number, m.home_team_name, "vs", m.away_team_name);
}

console.log("\nROUND OF 16 (all 8):");
for (const m of data.filter((m) => m.stage === "Round of 16")) {
  console.log("  #" + m.fifa_match_number, m.home_team_name, "vs", m.away_team_name);
}

console.log("\nQUARTER FINALS (all 4):");
for (const m of data.filter((m) => m.stage === "Quarter Finals")) {
  console.log("  #" + m.fifa_match_number, m.home_team_name, "vs", m.away_team_name);
}

console.log("\nSEMI FINALS (all 2):");
for (const m of data.filter((m) => m.stage === "Semi Finals")) {
  console.log("  #" + m.fifa_match_number, m.home_team_name, "vs", m.away_team_name);
}

console.log("\nFINAL + THIRD PLACE:");
for (const m of data.filter((m) => m.stage === "Final" || m.stage === "Third Place")) {
  console.log("  #" + m.fifa_match_number, m.stage, m.home_team_name, "vs", m.away_team_name);
}
