// next.config.ts - Конфигурация Next.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/page/services-transport',
        destination: '/services/transport',
        permanent: true,
      },
      {
        source: '/dlya-smi',
        destination: '/media/press',
        permanent: true,
      },
      {
        source: '/anthems',
        destination: '/media/anthems',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Разрешаем локальные изображения
    unoptimized: false,
  },
};

export default nextConfig;
