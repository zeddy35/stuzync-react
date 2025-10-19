/** @type {import('next').NextConfig} */
const API = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:3000';

module.exports = {
  async rewrites() {
    return [
      // Express paylaşımları ve statikler
      { source: '/uploads/:path*', destination: `${API}/uploads/:path*` },
      // İstersen tüm /api çağrılarını backend’e
      // removed generic /api proxy to avoid breaking NextAuth internal routes
    ];
  },
};
