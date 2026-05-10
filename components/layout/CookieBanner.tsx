'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('afrodite_cookies');
    if (!consent) setTimeout(() => setVisible(true), 1500);
  }, []);

  const accept = () => {
    localStorage.setItem('afrodite_cookies', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('afrodite_cookies', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Cookie size={18} className="text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Nous utilisons des cookies</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Afrodite utilise des cookies pour améliorer votre expérience et analyser le trafic.{' '}
              <Link href="/legal/cookies" className="text-brand-400 hover:underline">
                En savoir plus
              </Link>
            </p>
          </div>
          <button onClick={decline} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="flex-1 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="flex-1 py-2 text-xs font-medium bg-brand-400 hover:bg-brand-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Check size={13} /> Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
