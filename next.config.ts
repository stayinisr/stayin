import type { NextConfig } from "next";

// AlfaMath (alfamath.co.il) is served from static files in public/homework.
const ALFAMATH_HOSTS = ["alfamath.co.il", "www.alfamath.co.il"];
const alfamathRoutes: [string, string][] = [
  ["/", "/homework/home.html"],
  ["/app", "/homework/index.html"],
  ["/manifest.json", "/homework/manifest.json"],
  ["/icon-192.png", "/homework/icon-192.png"],
  ["/icon-512.png", "/homework/icon-512.png"],
  ["/robots.txt", "/homework/robots.txt"],
  ["/sitemap.xml", "/homework/sitemap.xml"],
  ["/terms", "/homework/terms.html"],
  ["/privacy", "/homework/privacy.html"],
];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: ALFAMATH_HOSTS.flatMap((host) =>
        alfamathRoutes.map(([source, destination]) => ({
          source,
          destination,
          has: [{ type: "host" as const, value: host }],
        })),
      ),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
