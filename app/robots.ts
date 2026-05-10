import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://afrodite.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/profiles', '/profiles/*', '/contact', '/tarifs'],
        disallow: ['/dashboard', '/admin', '/messages', '/api/*', '/auth/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
