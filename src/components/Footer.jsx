import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

// Keep the main-thread compatibility renderer out of the startup bundle too. The module is
// requested only when the footer is close enough to need its mountain; the fixed-height host
// below already reserves the final canvas geometry, so this creates no layout or visual shift.
const FooterMountainParticles = lazy(() => import('./FooterMountainParticles'));

/* The footer is the site's second table of contents, and now that the sections are pages
   it is the one that has to be complete — the capsule at the top only carries six. */
const PRODUCT_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Custom software', href: '/services#products' },
  { label: 'Playbook', href: '/playbook' },
  { label: 'Work', href: '/work' },
  { label: 'Principles', href: '/about#point-of-view' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
];

const RESOURCES_LINKS = [
  { label: 'Contact', href: '/contact' },
  { label: 'Questions', href: '/contact#faq' },
  { label: 'Email us', href: 'mailto:contact@ekasolution.com' },
  { label: 'Project planning', href: '/playbook#engagement' },
];

function FooterLink({ href, children }) {
  /* Internal destinations use the router; email links use the browser. */
  const Tag = href.startsWith('/') ? Link : 'a';
  const target = href.startsWith('/') ? { to: href } : { href };

  return (
    <Tag
      {...target}
      className="group flex w-fit items-start text-[13px] leading-snug text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)] sm:items-center sm:text-sm"
    >
      <span
        aria-hidden="true"
        className="mr-0 inline-block w-0 -translate-x-1 text-[var(--ink)] opacity-0 transition-all duration-200 ease-out group-hover:mr-1.5 group-hover:w-2 group-hover:translate-x-0 group-hover:opacity-100"
      >
        &ndash;
      </span>
      <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-[var(--ink)]/30">
        {children}
      </span>
    </Tag>
  );
}

function FooterColumn({ heading, links }) {
  return (
    <div className="flex flex-col px-3 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-12 lg:px-10 lg:pt-24">
      <h3 className="mb-4 text-[13px] font-medium text-[var(--ink)] sm:mb-6 sm:text-[15px] lg:mb-7">{heading}</h3>
      <div className="flex flex-col gap-3 sm:gap-4">
        {links.map((link) => (
          <FooterLink key={link.label} href={link.href}>
            {link.label}
          </FooterLink>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  const mountainHostRef = useRef(null);
  const [mountMountain, setMountMountain] = useState(false);

  useEffect(() => {
    const host = mountainHostRef.current;
    if (!host) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setMountMountain(true);
      observer.disconnect();
    }, { rootMargin: '1600px 0px', threshold: 0 });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="relative bg-[#F7F6F1] px-4 py-12 md:px-6">
      {/* Outer Card */}
      <div className="paper relative mx-auto w-full max-w-[1300px] overflow-hidden rounded-[18px] border border-[var(--ink)]/[0.06] bg-[#F7F6F1]">

        {/* Grid Layer — dashed construction lines, sit behind the mountain */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-x-0 top-16 hidden border-t border-dashed border-[var(--divider-dashed-strong)] lg:block" />
          <div className="absolute inset-y-0 left-1/3 border-l border-dashed border-[var(--divider-dashed-strong)] lg:hidden" />
          <div className="absolute inset-y-0 left-2/3 border-l border-dashed border-[var(--divider-dashed-strong)] lg:hidden" />
          <div className="absolute inset-y-0 left-1/4 hidden border-l border-dashed border-[var(--divider-dashed-strong)] lg:block" />
          <div className="absolute inset-y-0 left-1/2 hidden border-l border-dashed border-[var(--divider-dashed-strong)] lg:block" />
          <div className="absolute inset-y-0 left-3/4 hidden border-l border-dashed border-[var(--divider-dashed-strong)] lg:block" />
        </div>

        {/* Mountain Layer — particle dissolve/reform, clipped by the card.
            The asset has a transparent sky, so no fade-out overlay is needed here: the card
            background simply shows through above the ridge line. The layer is tall enough
            that the summit is never sliced off by the cover crop. */}
        <div
          ref={mountainHostRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[280px] overflow-hidden sm:h-[400px] lg:h-[660px]"
        >
          {mountMountain && (
            <Suspense fallback={null}>
              <FooterMountainParticles />
            </Suspense>
          )}
        </div>

        {/* Content Layer */}
        <div className="relative z-20 flex min-h-[700px] flex-col sm:min-h-[820px] lg:grid lg:min-h-[900px] lg:grid-cols-4">

          {/* Column 1: Brand */}
          <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center sm:px-8 sm:pb-8 sm:pt-10 lg:px-10 lg:pt-24">
            <Link to="/" aria-label="EKA Solution — home" className="brand-link brand-footer-link mb-5 sm:mb-6">
              <BrandLogo decorative />
            </Link>
            <p className="line-clamp-2 max-w-[240px] text-sm leading-relaxed text-[var(--ink-soft)] lg:line-clamp-none">
              Thoughtful design and engineering for work worth doing.
            </p>
            <div className="mt-6 text-[11px] uppercase tracking-wider text-[var(--ink-soft)]/70 sm:mt-8">
              © {new Date().getFullYear()} EKA Solution.
              <br />
              All Rights Reserved.
            </div>
          </div>

          {/* Nav row: compact 3-up on mobile/tablet, folds into the 4-col grid at lg */}
          <nav aria-label="Footer" className="grid grid-cols-3 lg:contents">
            <FooterColumn heading="Expertise" links={PRODUCT_LINKS} />
            <FooterColumn heading="Company" links={COMPANY_LINKS} />
            <FooterColumn heading="Resources" links={RESOURCES_LINKS} />
          </nav>

        </div>
      </div>
    </footer>
  );
}
