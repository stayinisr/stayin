// lib/teams.ts
// World Cup 2026 — team names + flag image codes

type TeamMeta = {
  he: string;
  code: string;
};

const TEAMS: Record<string, TeamMeta> = {
  // South America
  Argentina: { he: "ארגנטינה", code: "ar" },
  Brazil: { he: "ברזיל", code: "br" },
  Colombia: { he: "קולומביה", code: "co" },
  Uruguay: { he: "אורוגוואי", code: "uy" },
  Ecuador: { he: "אקוודור", code: "ec" },
  Venezuela: { he: "ונצואלה", code: "ve" },
  Bolivia: { he: "בוליביה", code: "bo" },
  Paraguay: { he: "פרגוואי", code: "py" },
  Chile: { he: "צ'ילה", code: "cl" },
  Peru: { he: "פרו", code: "pe" },

  // Europe
  France: { he: "צרפת", code: "fr" },
  England: { he: "אנגליה", code: "gb-eng" },
  Spain: { he: "ספרד", code: "es" },
  Germany: { he: "גרמניה", code: "de" },
  Portugal: { he: "פורטוגל", code: "pt" },
  Netherlands: { he: "הולנד", code: "nl" },
  Belgium: { he: "בלגיה", code: "be" },
  Italy: { he: "איטליה", code: "it" },
  Switzerland: { he: "שווייץ", code: "ch" },
  Croatia: { he: "קרואטיה", code: "hr" },
  Denmark: { he: "דנמרק", code: "dk" },
  Austria: { he: "אוסטריה", code: "at" },
  Turkey: { he: "טורקיה", code: "tr" },
  Türkiye: { he: "טורקיה", code: "tr" },
  Scotland: { he: "סקוטלנד", code: "gb-sct" },
  Serbia: { he: "סרביה", code: "rs" },
  Hungary: { he: "הונגריה", code: "hu" },
  "Czech Republic": { he: "צ'כיה", code: "cz" },
  Czechia: { he: "צ'כיה", code: "cz" },
  Slovakia: { he: "סלובקיה", code: "sk" },
  Poland: { he: "פולין", code: "pl" },
  Ukraine: { he: "אוקראינה", code: "ua" },
  Romania: { he: "רומניה", code: "ro" },
  Greece: { he: "יוון", code: "gr" },
  Albania: { he: "אלבניה", code: "al" },
  Slovenia: { he: "סלובניה", code: "si" },
  Norway: { he: "נורווגיה", code: "no" },
  Sweden: { he: "שוודיה", code: "se" },
  Wales: { he: "וויילס", code: "gb-wls" },
  "Northern Ireland": { he: "צפון אירלנד", code: "gb-nir" },
  Ireland: { he: "אירלנד", code: "ie" },
  Iceland: { he: "איסלנד", code: "is" },
  Finland: { he: "פינלנד", code: "fi" },
  Georgia: { he: "גאורגיה", code: "ge" },
  "Bosnia-Herzegovina": { he: "בוסניה", code: "ba" },
  Montenegro: { he: "מונטנגרו", code: "me" },
  "North Macedonia": { he: "מקדוניה", code: "mk" },
  Kosovo: { he: "קוסובו", code: "xk" },
  Bulgaria: { he: "בולגריה", code: "bg" },
  Israel: { he: "ישראל", code: "il" },
  Luxembourg: { he: "לוקסמבורג", code: "lu" },
  Kazakhstan: { he: "קזחסטן", code: "kz" },
  Azerbaijan: { he: "אזרבייג'ן", code: "az" },
  Armenia: { he: "ארמניה", code: "am" },
  Belarus: { he: "בלארוס", code: "by" },
  Lithuania: { he: "ליטא", code: "lt" },
  Latvia: { he: "לטביה", code: "lv" },
  Estonia: { he: "אסטוניה", code: "ee" },
  Moldova: { he: "מולדובה", code: "md" },
  Cyprus: { he: "קפריסין", code: "cy" },

  // North & Central America + Caribbean
  "United States": { he: 'ארה"ב', code: "us" },
  USA: { he: 'ארה"ב', code: "us" },
  Mexico: { he: "מקסיקו", code: "mx" },
  Canada: { he: "קנדה", code: "ca" },
  Jamaica: { he: "ג'מייקה", code: "jm" },
  Panama: { he: "פנמה", code: "pa" },
  Honduras: { he: "הונדורס", code: "hn" },
  "Costa Rica": { he: "קוסטה ריקה", code: "cr" },
  "El Salvador": { he: "אל סלבדור", code: "sv" },
  "Trinidad and Tobago": { he: "טרינידד וטובגו", code: "tt" },
  Cuba: { he: "קובה", code: "cu" },
  Haiti: { he: "האיטי", code: "ht" },
  Guatemala: { he: "גואטמלה", code: "gt" },
  Curaçao: { he: "קוראסאו", code: "cw" },

  // Africa
  Morocco: { he: "מרוקו", code: "ma" },
  Senegal: { he: "סנגל", code: "sn" },
  Egypt: { he: "מצרים", code: "eg" },
  Nigeria: { he: "ניגריה", code: "ng" },
  Cameroon: { he: "קמרון", code: "cm" },
  Ghana: { he: "גאנה", code: "gh" },
  "Ivory Coast": { he: "חוף השנהב", code: "ci" },
  "Côte d'Ivoire": { he: "חוף השנהב", code: "ci" },
  Algeria: { he: "אלג'יריה", code: "dz" },
  Tunisia: { he: "תוניסיה", code: "tn" },
  Mali: { he: "מאלי", code: "ml" },
  "Burkina Faso": { he: "בורקינה פאסו", code: "bf" },
  "South Africa": { he: "דרום אפריקה", code: "za" },
  "Congo DR": { he: "קונגו", code: "cd" },
  "Cabo Verde": { he: "כף ורדה", code: "cv" },
  Zambia: { he: "זמביה", code: "zm" },
  Tanzania: { he: "טנזניה", code: "tz" },
  Uganda: { he: "אוגנדה", code: "ug" },
  Guinea: { he: "גינאה", code: "gn" },
  Kenya: { he: "קניה", code: "ke" },
  Zimbabwe: { he: "זימבבואה", code: "zw" },
  Mozambique: { he: "מוזמביק", code: "mz" },
  Angola: { he: "אנגולה", code: "ao" },
  Gabon: { he: "גבון", code: "ga" },
  "Equatorial Guinea": { he: "גינאה המשוונית", code: "gq" },
  Benin: { he: "בנין", code: "bj" },
  Ethiopia: { he: "אתיופיה", code: "et" },
  Sudan: { he: "סודן", code: "sd" },
  Libya: { he: "לוב", code: "ly" },

  // Asia
  Japan: { he: "יפן", code: "jp" },
  "South Korea": { he: "קוריאה הדרומית", code: "kr" },
  "Korea Republic": { he: "קוריאה הדרומית", code: "kr" },
  "IR Iran": { he: "איראן", code: "ir" },
  "Saudi Arabia": { he: "ערב הסעודית", code: "sa" },
  Australia: { he: "אוסטרליה", code: "au" },
  Qatar: { he: "קטאר", code: "qa" },
  "United Arab Emirates": { he: "איחוד האמירויות", code: "ae" },
  UAE: { he: "איחוד האמירויות", code: "ae" },
  Uzbekistan: { he: "אוזבקיסטן", code: "uz" },
  Iraq: { he: "עיראק", code: "iq" },
  Oman: { he: "עומאן", code: "om" },
  Jordan: { he: "ירדן", code: "jo" },
  Bahrain: { he: "בחריין", code: "bh" },
  Kuwait: { he: "כווית", code: "kw" },
  China: { he: "סין", code: "cn" },
  Kyrgyzstan: { he: "קירגיזסטן", code: "kg" },
  Tajikistan: { he: "טג'יקיסטן", code: "tj" },
  India: { he: "הודו", code: "in" },
  Thailand: { he: "תאילנד", code: "th" },
  Vietnam: { he: "וייטנאם", code: "vn" },
  Indonesia: { he: "אינדונזיה", code: "id" },
  Philippines: { he: "פיליפינים", code: "ph" },

  // Oceania
  "New Zealand": { he: "ניו זילנד", code: "nz" },
  Fiji: { he: "פיג'י", code: "fj" },
  "Papua New Guinea": { he: "פפואה גינאה החדשה", code: "pg" },

  // Placeholders
  TBD: { he: "טרם נקבע", code: "" },
  TBC: { he: "טרם נקבע", code: "" },
};

export function teamName(name: string | null | undefined, isHe: boolean): string {
  if (!name) return isHe ? "טרם נקבע" : "TBD";
  if (isHe) return TEAMS[name]?.he ?? name;
  return name;
}

export function teamCode(name: string | null | undefined): string {
  if (!name) return "";
  return TEAMS[name]?.code ?? "";
}

export function flagImgSrc(name: string | null | undefined): string {
  const code = teamCode(name);
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
}

// FIFA 3-letter code mapping for compact tournament displays.
// Keyed by the canonical English name as used in the matches table.
const TEAM_CODE3: Record<string, string> = {
  Argentina: "ARG", Brazil: "BRA", Colombia: "COL", Uruguay: "URU",
  Ecuador: "ECU", Venezuela: "VEN", Bolivia: "BOL", Paraguay: "PAR",
  Chile: "CHI", Peru: "PER",
  France: "FRA", England: "ENG", Spain: "ESP", Germany: "GER",
  Portugal: "POR", Netherlands: "NED", Belgium: "BEL", Italy: "ITA",
  Switzerland: "SUI", Croatia: "CRO", Denmark: "DEN", Austria: "AUT",
  Turkey: "TUR", "Türkiye": "TUR", Scotland: "SCO", Serbia: "SRB",
  Hungary: "HUN", "Czech Republic": "CZE", Czechia: "CZE", Slovakia: "SVK",
  Poland: "POL", Ukraine: "UKR", Romania: "ROU", Greece: "GRE",
  Albania: "ALB", Slovenia: "SVN", Norway: "NOR", Sweden: "SWE",
  Wales: "WAL", "Northern Ireland": "NIR", Ireland: "IRL", Iceland: "ISL",
  Finland: "FIN", Georgia: "GEO", "Bosnia-Herzegovina": "BIH",
  Montenegro: "MNE", "North Macedonia": "MKD", Kosovo: "KOS",
  Bulgaria: "BUL", Israel: "ISR", Luxembourg: "LUX",
  Kazakhstan: "KAZ", Azerbaijan: "AZE", Armenia: "ARM", Belarus: "BLR",
  Lithuania: "LTU", Latvia: "LVA", Estonia: "EST", Moldova: "MDA",
  Cyprus: "CYP",
  "United States": "USA", USA: "USA", Mexico: "MEX", Canada: "CAN",
  Jamaica: "JAM", Panama: "PAN", Honduras: "HON", "Costa Rica": "CRC",
  "El Salvador": "SLV", "Trinidad and Tobago": "TRI", Cuba: "CUB",
  Haiti: "HAI", Guatemala: "GUA", "Curaçao": "CUW",
  Morocco: "MAR", Senegal: "SEN", Egypt: "EGY", Nigeria: "NGA",
  Cameroon: "CMR", Ghana: "GHA", "Ivory Coast": "CIV", "Côte d'Ivoire": "CIV",
  Algeria: "ALG", Tunisia: "TUN", Mali: "MLI", "Burkina Faso": "BFA",
  "South Africa": "RSA", "Congo DR": "COD", "Cabo Verde": "CPV",
  Zambia: "ZAM", Tanzania: "TAN", Uganda: "UGA", Guinea: "GUI",
  Kenya: "KEN", Zimbabwe: "ZIM", Mozambique: "MOZ", Angola: "ANG",
  Gabon: "GAB", "Equatorial Guinea": "EQG", Benin: "BEN",
  Ethiopia: "ETH", Sudan: "SUD", Libya: "LBY",
  Japan: "JPN", "South Korea": "KOR", "Korea Republic": "KOR",
  "IR Iran": "IRN", "Saudi Arabia": "KSA", Australia: "AUS",
  Qatar: "QAT", "United Arab Emirates": "UAE", UAE: "UAE",
  Uzbekistan: "UZB", Iraq: "IRQ", Oman: "OMA", Jordan: "JOR",
  Bahrain: "BHR", Kuwait: "KUW", China: "CHN",
  Kyrgyzstan: "KGZ", Tajikistan: "TJK", India: "IND", Thailand: "THA",
  Vietnam: "VIE", Indonesia: "IDN", Philippines: "PHI",
  "New Zealand": "NZL", Fiji: "FIJ", "Papua New Guinea": "PNG",
};

// 3-letter code (FIFA-style). Falls back to first 3 uppercase letters
// of the name (with diacritics stripped) when unknown.
export function teamCode3(name: string | null | undefined): string {
  if (!name) return "";
  if (TEAM_CODE3[name]) return TEAM_CODE3[name]!;
  const stripped = name
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
  return stripped.slice(0, 3) || "TBD";
}