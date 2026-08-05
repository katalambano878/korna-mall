'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PWASplash() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only show splash in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Only show on first load (not on subsequent navigations)
    const hasShownSplash = sessionStorage.getItem('splashShown');

    if (isStandalone && !hasShownSplash) {
      setShowSplash(true);
      sessionStorage.setItem('splashShown', 'true');

      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showSplash) return null;

  return (
    <div className="pwa-splash" aria-hidden="true">
      <div className="pwa-splash-logo mb-6">
        <Image
          src="/logo.png"
          alt="KORNA MALL"
          width={460}
          height={346}
          className="h-20 w-auto object-contain mx-auto"
          priority
        />
      </div>
      <h1 className="text-white text-xl font-bold font-serif mb-2">KORNA MALL</h1>
      <p className="text-rose-100 text-sm font-medium mb-8">Your mall, your way — Accra, Ghana</p>
      <div className="pwa-splash-dots flex gap-1.5">
        <span className="w-2 h-2 bg-white rounded-full" />
        <span className="w-2 h-2 bg-white rounded-full" />
        <span className="w-2 h-2 bg-white rounded-full" />
      </div>
    </div>
  );
}
