import { MetadataRoute } from 'next';

const BASE_URL = (process.env.NEXT_PUBLIC_CLIENT_URL || 'https://afrodiz.com').replace('afrodite.com', 'afrodiz.com');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/profiles', '/profiles/', '/tarifs'],
        disallow: ['/dashboard', '/admin', '/auth', '/messages', '/api'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
