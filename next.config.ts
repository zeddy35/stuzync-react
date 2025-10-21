import type { NextConfig } from 'next';

// Next.js config
const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Allow production builds to succeed even if ESLint has errors.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow production builds to succeed even if there are TypeScript errors.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Add your CDN/R2 hostnames here (hostnames only, no protocol)
    domains: [
      'cdn.stuzync.com',
      '0990e9455341062a6d208e78963c01f7.r2.cloudflarestorage.com',
    ],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https: wss: https:;" },
        ],
      },
    ];
  },
};

export default config;
