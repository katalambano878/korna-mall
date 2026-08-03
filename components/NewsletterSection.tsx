"use client";

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setEmail('');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mb-14 md:mb-20">
      <div className="relative mx-auto max-w-[85rem] overflow-hidden rounded-[1.75rem] md:rounded-[2.25rem] bg-brand">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-brand-dark"
        />
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center px-7 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14 lg:px-16 lg:py-16">
          <div className="text-left max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-white">
                The Insider Club
              </span>
            </div>

            <h2 className="font-serif text-white text-[2rem] sm:text-4xl md:text-[2.75rem] leading-[1.12] tracking-tight mb-5">
              Unlock <span className="italic text-brand-accent">10% Off</span> Your First
              <br className="hidden sm:block" /> Order
            </h2>

            <p className="text-white/80 text-[14px] sm:text-[15px] leading-relaxed max-w-[28rem]">
              Be the first to know about new arrivals, restocks, and exclusive deals. From dresses
              to electronics, we keep you updated on the latest products.
            </p>
          </div>

          <div className="w-full lg:pl-4">
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-stretch gap-0 rounded-2xl bg-brand-dark/60 border border-white/15 p-1.5 sm:p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <label htmlFor="insider-email" className="sr-only">
                Email address
              </label>
              <input
                id="insider-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="min-w-0 flex-1 bg-transparent border-0 text-white placeholder:text-white/40 px-4 sm:px-5 py-3.5 sm:py-4 text-[14px] sm:text-[15px] focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-brand-soft text-brand font-semibold px-5 sm:px-7 py-3.5 sm:py-4 text-[14px] sm:text-[15px] transition-colors disabled:opacity-70 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
              >
                {isSubmitting ? (
                  <i className="ri-loader-4-line animate-spin text-lg" aria-hidden />
                ) : (
                  <>
                    Join
                    <i className="ri-arrow-right-line text-lg" aria-hidden />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {submitStatus === 'success' && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-brand-dark/95 px-4 py-2.5 text-white text-sm shadow-xl">
            <i className="ri-check-line text-brand-accent" />
            Welcome to the club!
          </div>
        )}
      </div>
    </section>
  );
}
