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