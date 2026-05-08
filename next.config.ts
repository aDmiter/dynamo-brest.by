// next.config.ts - Конфигурация Next.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
