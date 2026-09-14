import React from 'react';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Factory from 'lucide-react/dist/esm/icons/factory';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import Layers from 'lucide-react/dist/esm/icons/layers';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { whatsappHref } from '../lib/whatsapp';
import { useContent } from '../lib/content';

/**
 * Buyer routing. Six sectors, each stated as the constraint that actually changes how the
 * software gets built there.
 *
 * The failure mode for a section like this is a grid of industry nouns that means "we
 * will take anyone's money". What makes it worth the screen space is the second line —
 * naming the regulation, the latency budget or the failure mode specific to that sector
 * is the fastest way to show the work has been done there before, and it costs a
 * visitor from that sector about four seconds to verify.
 */

const SECTORS = [
  {
    Icon: Layers,
    name: 'SaaS & Platforms',
    constraint: 'Clear account boundaries and room to grow.',
    detail:
      'Accounts, permissions, subscriptions, and integrations that support the way your customers use the product.',
  },
  {
    Icon: CreditCard,
    name: 'FinTech & Payments',
    constraint: 'Clarity and accuracy in every transaction.',
    detail:
      'Payment journeys, transaction visibility, reconciliation workflows, and carefully defined integration boundaries.',
  },
  {
    Icon: HeartPulse,
    name: 'Health & Life Sciences',
    constraint: 'Careful handling of sensitive information.',
    detail:
      'Accessible journeys, permission controls, consent flows, and data handling requirements reviewed with your domain specialists.',
  },
  {
    Icon: Truck,
    name: 'Logistics & Supply Chain',
    constraint: 'A clearer view of moving parts.',
    detail:
      'Tracking, operational dashboards, field workflows, and connections between the tools your team already uses.',
  },
  {
    Icon: ShoppingBag,
    name: 'Retail & Commerce',
    constraint: 'A smoother path from browsing to buying.',
    detail:
      'Product discovery, checkout, order management, and performance planning for busy periods.',
  },
  {
    Icon: Factory,
    name: 'Industrial & Energy',
    constraint: 'Make operational information easier to use.',
    detail:
      'Dashboards, reporting, and integrations shaped by your equipment, working environment, and operational constraints.',
  },
];

const SECTOR_ICONS = { Layers, CreditCard, HeartPulse, Truck, ShoppingBag, Factory };
const mapSector = (entry) => {
  const fallback = SECTORS.find((sector) => sector.name === entry.name);
  return {
    ...fallback,
    ...entry,
    Icon: SECTOR_ICONS[entry.Icon] || fallback?.Icon || Layers,
    constraint: entry.constraint || fallback?.constraint || '',
    detail: entry.description || fallback?.detail || '',
  };
};

export default function Industries() {
  const sectors = useContent('industries', SECTORS, mapSector);

  return (
    <section
      id="industries"
      className="grid-paper section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <SectionHeading
            eyebrow="Business contexts"
            title={
              <>
                Different businesses.
                <br />
                <span className="text-[var(--blue)]">
                  Different priorities.
                </span>
              </>
            }
            size="md"
          />
          <Reveal variant="up" delay={140}>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
              The right solution depends on how your business works. These are
              examples of the priorities we can explore during discovery, with
              specialist requirements agreed as part of the scope.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-[var(--border-hairline)] bg-[var(--border-hairline)] sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector, index) => (
            <Reveal
              key={sector.name}
              variant="fade"
              delay={index * 70}
              className="paper group relative bg-[var(--bg-canvas)] p-7 transition-colors duration-400 hover:bg-[var(--bg-raised)] lg:p-8"
            >
              {/* The hover wash rises from the bottom rather than fading in flat, so a
                  pointer crossing the grid reads as light moving across a surface. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[var(--blue)]/[0.05] to-transparent transition-all duration-500 group-hover:h-full"
              />

              <div className="relative">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--blue)] transition-all duration-400 group-hover:-translate-y-0.5 group-hover:border-[var(--blue)]/30 group-hover:bg-[var(--ink)] group-hover:text-[#F7F6F1]">
                  <sector.Icon
                    className="h-5 w-5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>

                <h3 className="mt-6 font-display text-xl leading-tight text-[var(--ink)]">
                  {sector.name}
                </h3>

                <p className="mt-3 text-sm font-medium leading-snug text-[var(--blue)]">
                  {sector.constraint}
                </p>

                <p className="mt-3 text-[var(--fs-sm)] leading-relaxed text-[var(--ink-soft)]">
                  {sector.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="up" delay={160} className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="w-full text-center text-sm text-[var(--ink-faint)] sm:w-auto">
              Every business has its own context. Tell us about yours.
            </p>
            <a
              href={whatsappHref(
                'Hi EKA Solution, I work in a sector not listed on your site — can we talk about whether it fits?',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-raised)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-quiet-chip transition-all hover:-translate-y-px hover:bg-[var(--ink)] hover:text-[#F7F6F1]"
            >
              <span>Tell us your sector</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
