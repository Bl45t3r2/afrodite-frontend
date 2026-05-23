import type { Metadata } from 'next';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${params.id}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error('Not found');
    const profile = await res.json();

    const name = profile.displayName || 'Profil';
    const city = profile.city || '';
    const age = profile.age || '';
    const bio = profile.bio ? profile.bio.slice(0, 160) : `Découvrez le profil de ${name}, ${age} ans à ${city} sur Afrodite.`;
    const photo = profile.photos?.find((p: any) => p.isMain)?.url || profile.photos?.[0]?.url;
    const categories = profile.categories?.join(', ') || '';
    const title = `${name}, ${age} ans — ${city} | Afrodite`;
    const description = bio;
    const url = `${process.env.NEXT_PUBLIC_CLIENT_URL || 'https://afrodiz.com'}/profiles/${params.id}`;

    return {
      title,
      description,
      keywords: `${name}, ${city}, ${categories}, profil vérifié, Afrodite`,
      openGraph: {
        title,
        description,
        url,
        type: 'profile',
        siteName: 'Afrodite',
        locale: 'fr_FR',
        images: photo ? [{ url: photo, width: 800, height: 1000, alt: name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: photo ? [photo] : [],
      },
      alternates: { canonical: url },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: 'Profil | Afrodite',
      description: 'Découvrez des profils vérifiés sur Afrodite, la plateforme de référence en Afrique de l\'Ouest.',
      robots: { index: false, follow: false },
    };
  }
}

export default function ProfileLayout({ children }: Props) {
  return <>{children}</>;
}
