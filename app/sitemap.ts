import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://afrodiz.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/profiles`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${BASE_URL}/tarifs`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles?limit=200&status=ACTIVE`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const profiles = data.profiles || data;
      const profilePages = profiles.map((p: any) => ({
        url: `${BASE_URL}/profiles/${p.id}`,
        lastModified: new Date(p.updatedAt || p.createdAt),
        changeFrequency: 'weekly' as const,
        priority: p.boosts?.length > 0 ? 0.9 : 0.7,
      }));
      return [...staticPages, ...profilePages];
    }
  } catch {}

  return staticPages;
}
