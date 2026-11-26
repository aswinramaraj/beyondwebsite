/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // the scroll/interaction runtime is imperative; avoid double-mount in dev
  images: { unoptimized: true },
  // Sirpi contest backend (backend/sirpi): same-origin proxy so its login cookie is first-party.
  async rewrites() {
    const api = process.env.SIRPI_API_URL || 'http://127.0.0.1:8787';
    return [{ source: '/sirpi-api/:path*', destination: `${api}/api/:path*` }];
  },
};
export default nextConfig;
