// next.config.ts - Конфигурация Next.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/images/news/:file',
          destination: '/api/serve-upload/news/:file',
        },
        {
          source: '/images/featured/:file',
          destination: '/api/serve-upload/featured/:file',
        },
        {
          source: '/images/products/:file',
          destination: '/api/serve-upload/products/:file',
        },
        {
          source: '/images/email/:file',
          destination: '/api/serve-upload/email/:file',
        },
        {
          source: '/images/:path*upload-:rest',
          destination: '/api/serve-upload/:path*upload-:rest',
        },
        {
          source: '/club-history/:path*upload-:rest',
          destination: '/api/serve-upload/club-history/:path*upload-:rest',
        },
      ],
    };
  },
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
