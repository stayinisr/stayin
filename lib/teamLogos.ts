export const teamLogos: Record<string, string> = {
  "מכבי תל אביב": "/teams/maccabi-tel-aviv.png",
  "מכבי חיפה": "/teams/maccabi-haifa.png",
  "הפועל תל אביב": "/teams/hapoel-tel-aviv.png",
  "הפועל באר שבע": "/teams/hapoel-beer-sheva.png",
  "בית\"ר ירושלים": "/teams/beitar-jerusalem.png",
  "הפועל ירושלים": "/teams/hapoel-jerusalem.png",
  "הפועל חיפה": "/teams/hapoel-haifa.png",
  "הפועל פתח תקוה": "/teams/hapoel-petah-tikva.png",
  "מכבי נתניה": "/teams/maccabi-netanya.png",
  "בני סכנין": "/teams/bnei-sakhnin.png",
  "מכבי בני ריינה": "/teams/maccabi-bnei-reineh.png",
  "מ.ס. אשדוד": "/teams/fc-ashdod.png",
  "עירוני טבריה": "/teams/ironi-tiberias.png",
  "עירוני קריית שמונה": "/teams/ironi-kiryat-shmona.png",
  "בני יהודה תל אביב": "/teams/bnei-yehuda-tel-aviv.png",

  "Maccabi Tel Aviv": "/teams/maccabi-tel-aviv.png",
  "Maccabi Haifa": "/teams/maccabi-haifa.png",
  "Hapoel Tel Aviv": "/teams/hapoel-tel-aviv.png",
  "Hapoel Be’er Sheva": "/teams/hapoel-beer-sheva.png",
  "Beitar Jerusalem": "/teams/beitar-jerusalem.png",
  "Hapoel Jerusalem": "/teams/hapoel-jerusalem.png",
  "Hapoel Haifa": "/teams/hapoel-haifa.png",
  "Hapoel Petah Tikva": "/teams/hapoel-petah-tikva.png",
  "Maccabi Netanya": "/teams/maccabi-netanya.png",
  "Bnei Sakhnin": "/teams/bnei-sakhnin.png",
  "Maccabi Bnei Reineh": "/teams/maccabi-bnei-reineh.png",
  "FC Ashdod": "/teams/fc-ashdod.png",
  "Ironi Tiberias": "/teams/ironi-tiberias.png",
  "Ironi Kiryat Shmona": "/teams/ironi-kiryat-shmona.png",
  "Bnei Yehuda Tel Aviv": "/teams/bnei-yehuda-tel-aviv.png",
};

export function getTeamLogo(teamName: string | null | undefined) {
  if (!teamName) return "/teams/default-team.png";
  return teamLogos[teamName] || "/teams/default-team.png";
}
