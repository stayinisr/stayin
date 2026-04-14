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

const TEAMS: Record<string, { flag: string; he: string; code: string }> = {
  // ── South America ──
  "Argentina":           { flag: "🇦🇷", he: "ארגנטינה", code: "ar" },
  "Brazil":              { flag: "🇧🇷", he: "ברזיל", code: "br" },
  "Colombia":            { flag: "🇨🇴", he: "קולומביה", code: "co" },
  "Uruguay":             { flag: "🇺🇾", he: "אורוגוואי", code: "uy" },
  "Ecuador":             { flag: "🇪🇨", he: "אקוודור", code: "ec" },
  "Venezuela":           { flag: "🇻🇪", he: "ונצואלה", code: "ve" },
  "Bolivia":             { flag: "🇧🇴", he: "בוליביה", code: "bo" },
  "Paraguay":            { flag: "🇵🇾", he: "פרגוואי", code: "py" },
  "Chile":               { flag: "🇨🇱", he: "צ'ילה", code: "cl" },
  "Peru":                { flag: "🇵🇪", he: "פרו", code: "pe" },

  // ── Europe ──
  "France":              { flag: "🇫🇷", he: "צרפת", code: "fr" },
  "England":             { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", he: "אנגליה", code: "gb-eng" },
  "Spain":               { flag: "🇪🇸", he: "ספרד", code: "es" },
  "Germany":             { flag: "🇩🇪", he: "גרמניה", code: "de" },
  "Portugal":            { flag: "🇵🇹", he: "פורטוגל", code: "pt" },
  "Netherlands":         { flag: "🇳🇱", he: "הולנד", code: "nl" },
  "Belgium":             { flag: "🇧🇪", he: "בלגיה", code: "be" },
  "Italy":               { flag: "🇮🇹", he: "איטליה", code: "it" },
  "Switzerland":         { flag: "🇨🇭", he: "שווייץ", code: "ch" },
  "Croatia":             { flag: "🇭🇷", he: "קרואטיה", code: "hr" },
  "Denmark":             { flag: "🇩🇰", he: "דנמרק", code: "dk" },
  "Austria":             { flag: "🇦🇹", he: "אוסטריה", code: "at" },
  "Turkey":              { flag: "🇹🇷", he: "טורקיה", code: "tr" },
  "Türkiye":             { flag: "🇹🇷", he: "טורקיה", code: "tr" },
  "Scotland":            { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", he: "סקוטלנד", code: "gb-sct" },
  "Serbia":              { flag: "🇷🇸", he: "סרביה", code: "rs" },
  "Hungary":             { flag: "🇭🇺", he: "הונגריה", code: "hu" },
  "Czech Republic":      { flag: "🇨🇿", he: "צ'כיה", code: "cz" },
  "Czechia":             { flag: "🇨🇿", he: "צ'כיה", code: "cz" },
  "Slovakia":            { flag: "🇸🇰", he: "סלובקיה", code: "sk" },
  "Poland":              { flag: "🇵🇱", he: "פולין", code: "pl" },
  "Ukraine":             { flag: "🇺🇦", he: "אוקראינה", code: "ua" },
  "Romania":             { flag: "🇷🇴", he: "רומניה", code: "ro" },
  "Greece":              { flag: "🇬🇷", he: "יוון", code: "gr" },
  "Albania":             { flag: "🇦🇱", he: "אלבניה", code: "al" },
  "Slovenia":            { flag: "🇸🇮", he: "סלובניה", code: "si" },
  "Norway":              { flag: "🇳🇴", he: "נורווגיה", code: "no" },
  "Sweden":              { flag: "🇸🇪", he: "שוודיה", code: "se" },
  "Wales":               { flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", he: "וויילס", code: "gb-wls" },
  "Northern Ireland":    { flag: "🇬🇧", he: "צפון אירלנד", code: "gb-nir" },
  "Ireland":             { flag: "🇮🇪", he: "אירלנד", code: "ie" },
  "Iceland":             { flag: "🇮🇸", he: "איסלנד", code: "is" },
  "Finland":             { flag: "🇫🇮", he: "פינלנד", code: "fi" },
  "Georgia":             { flag: "🇬🇪", he: "גאורגיה", code: "ge" },
  "Bosnia-Herzegovina": { flag: "🇧🇦", he: "בוסניה", code: "ba" },
  "Montenegro":          { flag: "🇲🇪", he: "מונטנגרו", code: "me" },
  "North Macedonia":     { flag: "🇲🇰", he: "מקדוניה", code: "mk" },
  "Kosovo":              { flag: "🇽🇰", he: "קוסובו", code: "xk" },
  "Bulgaria":            { flag: "🇧🇬", he: "בולגריה", code: "bg" },
  "Israel":              { flag: "🇮🇱", he: "ישראל", code: "il" },
  "Luxembourg":          { flag: "🇱🇺", he: "לוקסמבורג", code: "lu" },
  "Kazakhstan":          { flag: "🇰🇿", he: "קזחסטן", code: "kz" },
  "Azerbaijan":          { flag: "🇦🇿", he: "אזרבייג'ן", code: "az" },
  "Armenia":             { flag: "🇦🇲", he: "ארמניה", code: "am" },
  "Belarus":             { flag: "🇧🇾", he: "בלארוס", code: "by" },
  "Lithuania":           { flag: "🇱🇹", he: "ליטא", code: "lt" },
  "Latvia":              { flag: "🇱🇻", he: "לטביה", code: "lv" },
  "Estonia":             { flag: "🇪🇪", he: "אסטוניה", code: "ee" },
  "Moldova":             { flag: "🇲🇩", he: "מולדובה", code: "md" },
  "Cyprus":              { flag: "🇨🇾", he: "קפריסין", code: "cy" },

  // ── North & Central America + Caribbean ──
  "United States":       { flag: "🇺🇸", he: "ארה\"ב", code: "us" },
  "USA":                 { flag: "🇺🇸", he: "ארה\"ב", code: "us" },
  "Mexico":              { flag: "🇲🇽", he: "מקסיקו", code: "mx" },
  "Canada":              { flag: "🇨🇦", he: "קנדה", code: "ca" },
  "Jamaica":             { flag: "🇯🇲", he: "ג'מייקה", code: "jm" },
  "Panama":              { flag: "🇵🇦", he: "פנמה", code: "pa" },
  "Honduras":            { flag: "🇭🇳", he: "הונדורס", code: "hn" },
  "Costa Rica":          { flag: "🇨🇷", he: "קוסטה ריקה", code: "cr" },
  "El Salvador":         { flag: "🇸🇻", he: "אל סלבדור", code: "sv" },
  "Trinidad and Tobago": { flag: "🇹🇹", he: "טרינידד וטובגו", code: "tt" },
  "Cuba":                { flag: "🇨🇺", he: "קובה", code: "cu" },
  "Haiti":               { flag: "🇭🇹", he: "האיטי", code: "ht" },
  "Guatemala":           { flag: "🇬🇹", he: "גואטמלה", code: "gt" },
  "Curaçao":             { flag: "🇨🇼", he: "קוראסאו", code: "cw" },

  // ── Africa ──
  "Morocco":             { flag: "🇲🇦", he: "מרוקו", code: "ma" },
  "Senegal":             { flag: "🇸🇳", he: "סנגל", code: "sn" },
  "Egypt":               { flag: "🇪🇬", he: "מצרים", code: "eg" },
  "Nigeria":             { flag: "🇳🇬", he: "ניגריה", code: "ng" },
  "Cameroon":            { flag: "🇨🇲", he: "קמרון", code: "cm" },
  "Ghana":               { flag: "🇬🇭", he: "גאנה", code: "gh" },
  "Ivory Coast":         { flag: "🇨🇮", he: "חוף השנהב", code: "ci" },
  "Côte d'Ivoire":       { flag: "🇨🇮", he: "חוף השנהב", code: "ci" },
  "Algeria":             { flag: "🇩🇿", he: "אלג'יריה", code: "dz" },
  "Tunisia":             { flag: "🇹🇳", he: "תוניסיה", code: "tn" },
  "Mali":                { flag: "🇲🇱", he: "מאלי", code: "ml" },
  "Burkina Faso":        { flag: "🇧🇫", he: "בורקינה פאסו", code: "bf" },
  "South Africa":        { flag: "🇿🇦", he: "דרום אפריקה", code: "za" },
  "Congo DR":            { flag: "🇨🇩", he: "קונגו", code: "cd" },
  "Cabo Verde":          { flag: "🇨🇻", he: "כף ורדה", code: "cv" },
  "Zambia":              { flag: "🇿🇲", he: "זמביה", code: "zm" },
  "Tanzania":            { flag: "🇹🇿", he: "טנזניה", code: "tz" },
  "Uganda":              { flag: "🇺🇬", he: "אוגנדה", code: "ug" },
  "Guinea":              { flag: "🇬🇳", he: "גינאה", code: "gn" },
  "Kenya":               { flag: "🇰🇪", he: "קניה", code: "ke" },
  "Zimbabwe":            { flag: "🇿🇼", he: "זימבבואה", code: "zw" },
  "Mozambique":          { flag: "🇲🇿", he: "מוזמביק", code: "mz" },
  "Angola":              { flag: "🇦🇴", he: "אנגולה", code: "ao" },
  "Gabon":               { flag: "🇬🇦", he: "גבון", code: "ga" },
  "Equatorial Guinea":   { flag: "🇬🇶", he: "גינאה המשוונית", code: "gq" },
  "Benin":               { flag: "🇧🇯", he: "בנין", code: "bj" },
  "Ethiopia":            { flag: "🇪🇹", he: "אתיופיה", code: "et" },
  "Sudan":               { flag: "🇸🇩", he: "סודן", code: "sd" },
  "Libya":               { flag: "🇱🇾", he: "לוב", code: "ly" },

  // ── Asia ──
  "Japan":               { flag: "🇯🇵", he: "יפן", code: "jp" },
  "South Korea":         { flag: "🇰🇷", he: "קוריאה הדרומית", code: "kr" },
  "Korea Republic":      { flag: "🇰🇷", he: "קוריאה הדרומית", code: "kr" },
  "IR Iran":                { flag: "🇮🇷", he: "איראן", code: "ir" },
  "Saudi Arabia":        { flag: "🇸🇦", he: "ערב הסעודית", code: "sa" },
  "Australia":           { flag: "🇦🇺", he: "אוסטרליה", code: "au" },
  "Qatar":               { flag: "🇶🇦", he: "קטאר", code: "qa" },
  "United Arab Emirates":{ flag: "🇦🇪", he: "איחוד האמירויות", code: "ae" },
  "UAE":                 { flag: "🇦🇪", he: "איחוד האמירויות", code: "ae" },
  "Uzbekistan":          { flag: "🇺🇿", he: "אוזבקיסטן", code: "uz" },
  "Iraq":                { flag: "🇮🇶", he: "עיראק", code: "iq" },
  "Oman":                { flag: "🇴🇲", he: "עומאן", code: "om" },
  "Jordan":              { flag: "🇯🇴", he: "ירדן", code: "jo" },
  "Bahrain":             { flag: "🇧🇭", he: "בחריין", code: "bh" },
  "Kuwait":              { flag: "🇰🇼", he: "כווית", code: "kw" },
  "China":               { flag: "🇨🇳", he: "סין", code: "cn" },
  "Kyrgyzstan":          { flag: "🇰🇬", he: "קירגיזסטן", code: "kg" },
  "Tajikistan":          { flag: "🇹🇯", he: "טג'יקיסטן", code: "tj" },
  "India":               { flag: "🇮🇳", he: "הודו", code: "in" },
  "Thailand":            { flag: "🇹🇭", he: "תאילנד", code: "th" },
  "Vietnam":             { flag: "🇻🇳", he: "וייטנאם", code: "vn" },
  "Indonesia":           { flag: "🇮🇩", he: "אינדונזיה", code: "id" },
  "Philippines":         { flag: "🇵🇭", he: "פיליפינים", code: "ph" },

  // ── Oceania ──
  "New Zealand":         { flag: "🇳🇿", he: "ניו זילנד", code: "nz" },
  "Fiji":                { flag: "🇫🇯", he: "פיג'י", code: "fj" },
  "Papua New Guinea":    { flag: "🇵🇬", he: "פפואה גינאה החדשה", code: "pg" },

  // ── Placeholders ──
  "TBD":                 { flag: "🏳️", he: "טרם נקבע", code: "TBD" },
  "TBC":                 { flag: "🏳️", he: "טרם נקבע", code: "TBC" },
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

/** Returns the 2-letter ISO country code for flagcdn.com
 *  Usage: <img src={`https://flagcdn.com/w40/${teamCode("Argentina")}.png`} />
 */
export function teamCode(name: string | null | undefined): string {
  if (!name) return "un";
  return TEAMS[name]?.code ?? "un";
}

/** Inline flag img tag props — spread onto <img> */
export function flagImgSrc(name: string | null | undefined): string {
  return `https://flagcdn.com/w40/${teamCode(name)}.png`;
}
