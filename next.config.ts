import type { NextConfig } from 'next';

// Türkçe: Görsel alanları için CDN domainlerini ekleyin; kendi CDN/R2 domaininizi aşağıda güncelleyin.
const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Türkçe: Kendi CDN domain(ler)inizi buraya ekleyin.
    domains: [
      'cdn.stuzync.com', // [CDN_DOMAIN] - kendinize göre değiştirin
      'https://0990e9455341062a6d208e78963c01f7.r2.cloudflarestorage.com',
    ],
  },
  async headers() {
    return [
      // Türkçe: Public klasöründeki /images/* için uzun süreli cache başlığı.
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Türkçe: Genel güvenlik başlıkları ve CSP politikası.
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
