/** @type {import('next').NextConfig} */
// Proxy /api/* to the backend so the browser only ever talks to this origin.
// This keeps the session cookie first-party, which is required for cross-site
// cookie blockers (Brave, Safari, Chrome's third-party cookie phase-out).
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET || "https://fluxionos-api.onrender.com";

const nextConfig = {
  transpilePackages: ["@fluxionos/shared"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
