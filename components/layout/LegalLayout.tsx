import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
        <ChevronLeft size={15} /> Retour à l'accueil
      </Link>

      <div className="mb-10">
        <div className="inline-block bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Document légal
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-3">{title}</h1>
        <p className="text-sm text-white/40">Dernière mise à jour : {lastUpdated}</p>
      </div>

      <div className="prose prose-gray max-w-none
        prose-headings:font-display prose-headings:font-semibold prose-headings:text-white
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-6 prose-h2:border-t prose-h2:border-white/5
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-white/60 prose-p:leading-relaxed prose-p:mb-4
        prose-ul:text-white/60 prose-ul:space-y-1 prose-li:leading-relaxed
        prose-strong:text-white/80 prose-strong:font-semibold
        prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline">
        {children}
      </div>

      {/* Nav entre pages légales */}
      <div className="mt-16 pt-8 border-t border-white/5">
        <p className="text-sm text-white/40 mb-4 font-medium">Autres documents légaux</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'CGU', href: '/legal/cgu' },
            { label: 'Mentions légales', href: '/legal/mentions' },
            { label: 'Confidentialité', href: '/legal/confidentialite' },
            { label: 'Cookies', href: '/legal/cookies' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="text-sm border border-white/10 text-white/50 hover:border-brand-300 hover:text-brand-500 px-4 py-2 rounded-xl transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
