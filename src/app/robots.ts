import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/order-email';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/preview-login',
        '/shop/cart',
        '/shop/checkout',
        '/shop/checkout/',
      ],
    },
    host: baseUrl.replace(/^https?:\/\//, ''),
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
