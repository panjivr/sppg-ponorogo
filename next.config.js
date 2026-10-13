/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const privateRoutes = ["admin", "blast", "peta", "dashboard", "direktori", "ringkasan", "tentang", "laporan"];
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }, ...privateRoutes.map(route => ({source: `/${route}/:path*`, headers: [{key: "X-Robots-Tag", value: "noindex, nofollow"}]}))];
  },
};
module.exports = nextConfig;
