/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const privateRoutes = ["admin", "blast", "peta", "dashboard", "direktori", "ringkasan", "tentang"];
    return privateRoutes.map(route => ({source: `/${route}/:path*`, headers: [{key: "X-Robots-Tag", value: "noindex, nofollow"}]}));
  },
};
module.exports = nextConfig;
