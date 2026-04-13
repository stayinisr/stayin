export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;

  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;

  return iosStandalone || displayModeStandalone;
}

export function canShowAddToHome(key: string): boolean {
  if (typeof window === "undefined") return false;
  if (isStandaloneMode()) return false;

  const hiddenUntil = localStorage.getItem(key);
  if (!hiddenUntil) return true;

  const hiddenUntilMs = Number(hiddenUntil);
  if (!hiddenUntilMs) return true;

  return Date.now() > hiddenUntilMs;
}

export function dismissAddToHome(key: string, days = 14) {
  if (typeof window === "undefined") return;
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(key, String(until));
}

export function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /android/i.test(window.navigator.userAgent);
}