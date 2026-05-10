import type { Metadata } from 'next';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';

export const metadata: Metadata = {
  title: 'Afrodite — Profils vérifiés près de chez vous',
  description: 'La plateforme de référence en Afrique de l\'Ouest pour trouver des profils vérifiés, échanger en privé et découvrir des talents près de chez vous.',
  keywords: 'profils, vérifiés, Cotonou, Lomé, Abidjan, Dakar, Afrique',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Afrodite — Profils vérifiés',
    description: 'Découvrez des profils vérifiés près de chez vous.',
    siteName: 'Afrodite',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen bg-white text-gray-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }} />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(err) {
                console.log('SW registration failed:', err);
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}
