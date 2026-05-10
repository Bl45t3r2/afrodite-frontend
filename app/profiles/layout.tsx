import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profils vérifiés — Afrodite',
  description: 'Découvrez des milliers de profils vérifiés en Afrique de l\'Ouest. Filtrez par ville, catégorie, tags et plus encore.',
  openGraph: {
    title: 'Profils vérifiés — Afrodite',
    description: 'Découvrez des milliers de profils vérifiés en Afrique de l\'Ouest.',
    siteName: 'Afrodite',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function ProfilesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
