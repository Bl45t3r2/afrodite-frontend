import { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${params.id}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return { title: 'Profil — Afrodite' };
    }

    const profile = await res.json();
    const photo = profile.photos?.[0]?.url;
    const title = `${profile.displayName}, ${profile.age} ans — ${profile.city} | Afrodite`;
    const description = profile.bio
      ? profile.bio.slice(0, 160)
      : `Découvrez le profil de ${profile.displayName}, ${profile.age} ans à ${profile.city}. ${profile.isVerified ? 'Profil vérifié.' : ''} Contactez-le sur Afrodite.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: photo ? [{ url: photo, width: 800, height: 600, alt: profile.displayName }] : [],
        type: 'profile',
        siteName: 'Afrodite',
        locale: 'fr_FR',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: photo ? [photo] : [],
      },
      alternates: {
        canonical: `/profiles/${params.id}`,
      },
      robots: {
        index: profile.status === 'ACTIVE',
        follow: true,
      },
    };
  } catch {
    return { title: 'Profil — Afrodite' };
  }
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
