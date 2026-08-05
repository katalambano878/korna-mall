"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';

function FooterSection({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand/30 lg:border-none last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left lg:py-0 lg:cursor-default lg:mb-6"
      >
        <h4 className="font-bold text-lg text-white">{title}</h4>
        <i className={`ri-arrow-down-s-line text-brand-accent text-xl transition-transform duration-300 lg:hidden ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0 lg:max-h-full lg:overflow-visible'}`}>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'KORNA MALL';
  const siteLogo = getSetting('site_logo') || '/logo.png';
  const siteTagline = getSetting('site_tagline') || '';
  const socialInstagram = getSetting('social_instagram') || '';
  const socialTiktok = getSetting('social_tiktok') || '';
  const socialSnapchat = getSetting('social_snapchat') || '';

  const normalizeSocialUrl = (value: string, baseUrl?: string) => {
    const raw = value.trim();
    if (!raw || raw === '#') return baseUrl || '';

    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^(mailto:|tel:)/i.test(raw)) return raw;

    if (baseUrl) {
      const handle = raw.replace(/^@/, '');
      return `${baseUrl}${handle}`;
    }

    return `https://${raw}`;
  };

  const socialLinks = [
    { link: normalizeSocialUrl(socialInstagram, 'https://instagram.com/'), icon: 'ri-instagram-line', label: 'Instagram' },
    { link: normalizeSocialUrl(socialTiktok, 'https://www.tiktok.com/@'), icon: 'ri-tiktok-fill', label: 'TikTok' },
    { link: normalizeSocialUrl(socialSnapchat, 'https://www.snapchat.com/add/'), icon: 'ri-snapchat-fill', label: 'Snapchat' },
  ].filter((social) => social.link);

  return (
    <footer className="relative mt-20 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand to-brand-dark rounded-t-[3rem] -z-10 overflow-hidden border-t border-brand-accent/20 shadow-[0_-14px_50px_-16px_rgba(26,26,26,0.45)]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <div className="text-white pt-24 pb-12">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

            <div className="lg:col-span-4 space-y-8 pr-0 lg:pr-12">
              <Link href="/" className="inline-block group transition-all duration-500 hover:opacity-80">
                <Image src={siteLogo} alt={siteName} width={460} height={346} className="h-14 w-auto object-contain object-left opacity-90" unoptimized />
              </Link>

              <p className="text-white/70 font-light leading-relaxed text-[15px] max-w-sm">
                {siteTagline || 'KORNA MALL — your online mall in Accra. Shop quality products with delivery across Ghana.'}
              </p>

              <div className="flex gap-4 pt-4">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-11 h-11 bg-brand-dark/75 border border-brand-accent/35 rounded-full flex items-center justify-center text-white/80 hover:bg-brand-dark hover:text-white hover:border-brand-accent hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  >
                    <i className={`${social.icon} text-lg`}></i>
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-16">
              <div className="space-y-8">
                <h4 className="font-serif text-xl font-bold text-white tracking-wide drop-shadow-sm">Shop</h4>
                <ul className="space-y-4 text-white/70 text-[15px] font-light">
                  <li><Link href="/shop" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    All Products
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/categories" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Collections
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/shop?sort=newest" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    New Arrivals
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/shop?sort=bestsellers" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Best Sellers
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                </ul>
              </div>

              <div className="space-y-8">
                <h4 className="font-serif text-xl font-bold text-white tracking-wide drop-shadow-sm">Support</h4>
                <ul className="space-y-4 text-white/70 text-[15px] font-light">
                  <li><Link href="/contact" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Contact Us
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/order-tracking" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Track Order
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/shipping" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Shipping & Delivery
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/returns" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Returns & Exchange
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                </ul>
              </div>

              <div className="space-y-8 col-span-2 md:col-span-1">
                <h4 className="font-serif text-xl font-bold text-white tracking-wide drop-shadow-sm">Company</h4>
                <ul className="space-y-4 text-white/70 text-[15px] font-light">
                  <li><Link href="/about" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Our Story
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/privacy" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Privacy Policy
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/terms" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Terms of Service
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                  <li><Link href="/admin" className="relative group inline-block hover:text-brand-accent transition-colors duration-300">
                    Admin Access
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent/60 transition-all duration-300 group-hover:w-full"></span>
                  </Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-brand-accent/20 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-white/55 font-light tracking-wide">
            <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            <div className="flex gap-5 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <i className="ri-visa-line text-3xl"></i>
              <i className="ri-mastercard-line text-3xl"></i>
              <i className="ri-paypal-line text-3xl"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
