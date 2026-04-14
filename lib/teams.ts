// lib/teams.ts
// ── World Cup 2026 — Team flags & Hebrew names ─────────────────────────────
// Usage:
//   import { teamFlag, teamName, teamDisplay } from "@/lib/teams";
//
//   teamFlag("Argentina")           → "🇦🇷"
//   teamName("Argentina", true)     → "ארגנטינה"   (isHe = true)
//   teamName("Argentina", false)    → "Argentina"
//   teamDisplay("Argentina", true)  → "🇦🇷 ארגנטינה"
//   teamDisplay("Argentina", false) → "🇦🇷 Argentina"

const TEAMS: Record<string, { flag: string; he: string }> = {
  // ── South America ──
  "Argentina":           { flag: "🇦🇷", he: "ארגנטינה" },
  "Brazil":              { flag: "🇧🇷", he: "ברזיל" },
  "Colombia":            { flag: "🇨🇴", he: "קולומביה" },
  "Uruguay":             { flag: "🇺🇾", he: "אורוגוואי" },
  "Ecuador":             { flag: "🇪🇨", he: "אקוודור" },
  "Venezuela":           { flag: "🇻🇪", he: "ונצואלה" },
  "Bolivia":             { flag: "🇧🇴", he: "בוליביה" },
  "Paraguay":            { flag: "🇵🇾", he: "פרגוואי" },
  "Chile":               { flag: "🇨🇱", he: "צ'ילה" },
  "Peru":                { flag: "🇵🇪", he: "פרו" },

  // ── Europe ──
  "France":              { flag: "🇫🇷", he: "צרפת" },
  "England":             { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", he: "אנגליה" },
  "Spain":               { flag: "🇪🇸", he: "ספרד" },
  "Germany":             { flag: "🇩🇪", he: "גרמניה" },
  "Portugal":            { flag: "🇵🇹", he: "פורטוגל" },
  "Netherlands":         { flag: "🇳🇱", he: "הולנד" },
  "Belgium":             { flag: "🇧🇪", he: "בלגיה" },
  "Italy":               { flag: "🇮🇹", he: "איטליה" },
  "Switzerland":         { flag: "🇨🇭", he: "שווייץ" },
  "Croatia":             { flag: "🇭🇷", he: "קרואטיה" },
  "Denmark":             { flag: "🇩🇰", he: "דנמרק" },
  "Austria":             { flag: "🇦🇹", he: "אוסטריה" },
  "Turkey":              { flag: "🇹🇷", he: "טורקיה" },
  "Turkiye":             { flag: "🇹🇷", he: "טורקיה" },
  "Scotland":            { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", he: "סקוטלנד" },
  "Serbia":              { flag: "🇷🇸", he: "סרביה" },
  "Hungary":             { flag: "🇭🇺", he: "הונגריה" },
  "Czech Republic":      { flag: "🇨🇿", he: "צ'כיה" },
  "Czechia":             { flag: "🇨🇿", he: "צ'כיה" },
  "Slovakia":            { flag: "🇸🇰", he: "סלובקיה" },
  "Poland":              { flag: "🇵🇱", he: "פולין" },
  "Ukraine":             { flag: "🇺🇦", he: "אוקראינה" },
  "Romania":             { flag: "🇷🇴", he: "רומניה" },
  "Greece":              { flag: "🇬🇷", he: "יוון" },
  "Albania":             { flag: "🇦🇱", he: "אלבניה" },
  "Slovenia":            { flag: "🇸🇮", he: "סלובניה" },
  "Norway":              { flag: "🇳🇴", he: "נורווגיה" },
  "Sweden":              { flag: "🇸🇪", he: "שוודיה" },
  "Wales":               { flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", he: "וויילס" },
  "Northern Ireland":    { flag: "🇬🇧", he: "צפון אירלנד" },
  "Ireland":             { flag: "🇮🇪", he: "אירלנד" },
  "Iceland":             { flag: "🇮🇸", he: "איסלנד" },
  "Finland":             { flag: "🇫🇮", he: "פינלנד" },
  "Georgia":             { flag: "🇬🇪", he: "גאורגיה" },
  "Bosnia and Herzegovina": { flag: "🇧🇦", he: "בוסניה" },
  "Montenegro":          { flag: "🇲🇪", he: "מונטנגרו" },
  "North Macedonia":     { flag: "🇲🇰", he: "מקדוניה" },
  "Kosovo":              { flag: "🇽🇰", he: "קוסובו" },
  "Bulgaria":            { flag: "🇧🇬", he: "בולגריה" },
  "Israel":              { flag: "🇮🇱", he: "ישראל" },
  "Luxembourg":          { flag: "🇱🇺", he: "לוקסמבורג" },
  "Kazakhstan":          { flag: "🇰🇿", he: "קזחסטן" },
  "Azerbaijan":          { flag: "🇦🇿", he: "אזרבייג'ן" },
  "Armenia":             { flag: "🇦🇲", he: "ארמניה" },
  "Belarus":             { flag: "🇧🇾", he: "בלארוס" },
  "Lithuania":           { flag: "🇱🇹", he: "ליטא" },
  "Latvia":              { flag: "🇱🇻", he: "לטביה" },
  "Estonia":             { flag: "🇪🇪", he: "אסטוניה" },
  "Moldova":             { flag: "🇲🇩", he: "מולדובה" },
  "Cyprus":              { flag: "🇨🇾", he: "קפריסין" },

  // ── North & Central America + Caribbean ──
  "United States":       { flag: "🇺🇸", he: "ארה\"ב" },
  "USA":                 { flag: "🇺🇸", he: "ארה\"ב" },
  "Mexico":              { flag: "🇲🇽", he: "מקסיקו" },
  "Canada":              { flag: "🇨🇦", he: "קנדה" },
  "Jamaica":             { flag: "🇯🇲", he: "ג'מייקה" },
  "Panama":              { flag: "🇵🇦", he: "פנמה" },
  "Honduras":            { flag: "🇭🇳", he: "הונדורס" },
  "Costa Rica":          { flag: "🇨🇷", he: "קוסטה ריקה" },
  "El Salvador":         { flag: "🇸🇻", he: "אל סלבדור" },
  "Trinidad and Tobago": { flag: "🇹🇹", he: "טרינידד וטובגו" },
  "Cuba":                { flag: "🇨🇺", he: "קובה" },
  "Haiti":               { flag: "🇭🇹", he: "האיטי" },
  "Guatemala":           { flag: "🇬🇹", he: "גואטמלה" },
  "Curacao":             { flag: "🇨🇼", he: "קוראסאו" },

  // ── Africa ──
  "Morocco":             { flag: "🇲🇦", he: "מרוקו" },
  "Senegal":             { flag: "🇸🇳", he: "סנגל" },
  "Egypt":               { flag: "🇪🇬", he: "מצרים" },
  "Nigeria":             { flag: "🇳🇬", he: "ניגריה" },
  "Cameroon":            { flag: "🇨🇲", he: "קמרון" },
  "Ghana":               { flag: "🇬🇭", he: "גאנה" },
  "Ivory Coast":         { flag: "🇨🇮", he: "חוף השנהב" },
  "Côte d'Ivoire":       { flag: "🇨🇮", he: "חוף השנהב" },
  "Algeria":             { flag: "🇩🇿", he: "אלג'יריה" },
  "Tunisia":             { flag: "🇹🇳", he: "תוניסיה" },
  "Mali":                { flag: "🇲🇱", he: "מאלי" },
  "Burkina Faso":        { flag: "🇧🇫", he: "בורקינה פאסו" },
  "South Africa":        { flag: "🇿🇦", he: "דרום אפריקה" },
  "DR Congo":            { flag: "🇨🇩", he: "קונגו" },
  "Cape Verde":          { flag: "🇨🇻", he: "כף ורדה" },
  "Zambia":              { flag: "🇿🇲", he: "זמביה" },
  "Tanzania":            { flag: "🇹🇿", he: "טנזניה" },
  "Uganda":              { flag: "🇺🇬", he: "אוגנדה" },
  "Guinea":              { flag: "🇬🇳", he: "גינאה" },
  "Kenya":               { flag: "🇰🇪", he: "קניה" },
  "Zimbabwe":            { flag: "🇿🇼", he: "זימבבואה" },
  "Mozambique":          { flag: "🇲🇿", he: "מוזמביק" },
  "Angola":              { flag: "🇦🇴", he: "אנגולה" },
  "Gabon":               { flag: "🇬🇦", he: "גבון" },
  "Equatorial Guinea":   { flag: "🇬🇶", he: "גינאה המשוונית" },
  "Benin":               { flag: "🇧🇯", he: "בנין" },
  "Ethiopia":            { flag: "🇪🇹", he: "אתיופיה" },
  "Sudan":               { flag: "🇸🇩", he: "סודן" },
  "Libya":               { flag: "🇱🇾", he: "לוב" },

  // ── Asia ──
  "Japan":               { flag: "🇯🇵", he: "יפן" },
  "South Korea":         { flag: "🇰🇷", he: "קוריאה הדרומית" },
  "Korea Republic":      { flag: "🇰🇷", he: "קוריאה הדרומית" },
  "Iran":                { flag: "🇮🇷", he: "איראן" },
  "Saudi Arabia":        { flag: "🇸🇦", he: "ערב הסעודית" },
  "Australia":           { flag: "🇦🇺", he: "אוסטרליה" },
  "Qatar":               { flag: "🇶🇦", he: "קטאר" },
  "United Arab Emirates":{ flag: "🇦🇪", he: "איחוד האמירויות" },
  "UAE":                 { flag: "🇦🇪", he: "איחוד האמירויות" },
  "Uzbekistan":          { flag: "🇺🇿", he: "אוזבקיסטן" },
  "Iraq":                { flag: "🇮🇶", he: "עיראק" },
  "Oman":                { flag: "🇴🇲", he: "עומאן" },
  "Jordan":              { flag: "🇯🇴", he: "ירדן" },
  "Bahrain":             { flag: "🇧🇭", he: "בחריין" },
  "Kuwait":              { flag: "🇰🇼", he: "כווית" },
  "China":               { flag: "🇨🇳", he: "סין" },
  "Kyrgyzstan":          { flag: "🇰🇬", he: "קירגיזסטן" },
  "Tajikistan":          { flag: "🇹🇯", he: "טג'יקיסטן" },
  "India":               { flag: "🇮🇳", he: "הודו" },
  "Thailand":            { flag: "🇹🇭", he: "תאילנד" },
  "Vietnam":             { flag: "🇻🇳", he: "וייטנאם" },
  "Indonesia":           { flag: "🇮🇩", he: "אינדונזיה" },
  "Philippines":         { flag: "🇵🇭", he: "פיליפינים" },

  // ── Oceania ──
  "New Zealand":         { flag: "🇳🇿", he: "ניו זילנד" },
  "Fiji":                { flag: "🇫🇯", he: "פיג'י" },
  "Papua New Guinea":    { flag: "🇵🇬", he: "פפואה גינאה החדשה" },

  // ── Placeholders ──
  "TBD":                 { flag: "🏳️", he: "טרם נקבע" },
  "TBC":                 { flag: "🏳️", he: "טרם נקבע" },
};

/** Returns the flag emoji for a team. Falls back to 🏳️ */
export function teamFlag(name: string | null | undefined): string {
  if (!name) return "🏳️";
  return TEAMS[name]?.flag ?? "🏳️";
}

/** Returns the team name in the right language */
export function teamName(name: string | null | undefined, isHe: boolean): string {
  if (!name) return isHe ? "טרם נקבע" : "TBD";
  if (isHe) return TEAMS[name]?.he ?? name;
  return name;
}

/** Returns "🇦🇷 ארגנטינה" or "🇦🇷 Argentina" */
export function teamDisplay(name: string | null | undefined, isHe: boolean): string {
  return `${teamFlag(name)} ${teamName(name, isHe)}`;
}
