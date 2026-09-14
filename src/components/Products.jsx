import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Bot from 'lucide-react/dist/esm/icons/bot';
import Boxes from 'lucide-react/dist/esm/icons/boxes';
import Gauge from 'lucide-react/dist/esm/icons/gauge';
import Reveal from './Reveal';
import TiltCard from './TiltCard';
import ChromeObject from './ChromeObject';
import SectionHeading from './SectionHeading';
import { useContent } from '../lib/content';

/**
 * The product track, laid out as a small catalogue rather than as three more feature
 * cards.
 *
 * A product section on an engineering company's site fails in one specific way: it lists
 * capabilities, which is indistinguishable from the services section two screens up. What
 * separates a product from a service is that it already exists — so each entry leads with
 * its release state and the thing it replaces, and the capability list is the last thing
 * on the card rather than the first.
 *
 * Naming the state honestly, beta and private preview included, is worth more than three
 * more adjectives. Buyers discount an all-GA catalogue on sight.
 */

const PRODUCTS = [
  {
    id: 'orbit',
    name: 'Orbit',
    Icon: Boxes,
    category: 'SaaS Foundation',
    status: 'Generally available',
    statusTone: 'live',
    replaces: 'The nine months every SaaS spends rebuilding the same plumbing.',
    pitch:
      'Tenancy, identity, roles, billing, audit and an admin console — the layer under your product, shipped as source you own and deploy into your own cloud.',
    capabilities: [
      'Multi-tenant isolation with per-tenant encryption keys',
      'SSO, SCIM provisioning and granular RBAC out of the box',
      'Metered and seat billing wired to Stripe, with proration',
      'Immutable audit trail built for SOC 2 evidence collection',
    ],
    metric: { value: '6 weeks', label: 'Median time to first paying tenant' },
  },
  {
    id: 'relay',
    name: 'Relay',
    Icon: Bot,
    category: 'Agent Runtime',
    status: 'Beta — 11 teams',
    statusTone: 'beta',
    replaces: 'The bespoke orchestration layer every AI feature quietly grows.',
    pitch:
      'A runtime for putting agents in front of real users: tool routing, retries, evaluation gates, spend ceilings and a trace of every decision the model made.',
    capabilities: [
      'Deterministic tool routing with typed schemas and replay',
      'Offline evals gating every prompt and model change in CI',
      'Hard per-tenant spend ceilings and token budgets',
      'Full traces — prompt, tools, cost, latency — retained per call',
    ],
    metric: { value: '38%', label: 'Median inference spend removed in first month' },
  },
  {
    id: 'atlas',
    name: 'Atlas',
    Icon: Gauge,
    category: 'Cloud Control Plane',
    status: 'Private preview',
    statusTone: 'preview',
    replaces: 'The spreadsheet where your cloud spend and your SLOs are reconciled by hand.',
    pitch:
      'One plane over a multi-account estate: environments, policy, drift and cost in the same view, so an infrastructure decision shows its bill before it is merged.',
    capabilities: [
      'Terraform drift detection with a policy gate on every plan',
      'Per-service cost attribution down to the pull request',
      'SLO burn-rate alerting wired to the on-call rotation',
      'One-command environment cloning for staging and load tests',
    ],
    metric: { value: '99.98%', label: 'Availability across managed estates, 12mo' },
  },
];

const PRODUCT_ICONS = { Boxes, Bot, Gauge };
const mapProduct = (entry) => ({
  ...entry,
  Icon: PRODUCT_ICONS[entry.Icon] || Boxes,
  capabilities: Array.isArray(entry.capabilities) ? entry.capabilities : [],
  metric: entry.metric || { value: '', label: '' },
});

const TONES = {
  live: 'bg-[var(--blue)]/10 text-[var(--blue)] border-[var(--blue)]/25',
  beta: 'bg-[var(--ink)]/[0.06] text-[var(--ink)] border-[var(--ink)]/15',
  preview: 'bg-transparent text-[var(--ink-faint)] border-[var(--border-strong)]',
};

export default function Products() {
  const products = useContent('products', PRODUCTS, mapProduct);

  return (
    <section
      id="products"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <ChromeObject
        variant="cluster"
        className="-right-20 bottom-24 hidden w-[260px] xl:block"
        speed={100}
        rotate={10}
        tint={0.5}
        opacity={0.75}
        floatDuration={19}
        floatY={-22}
        rotateFrom={3}
        rotateTo={-5}
        bloom={0.13}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <SectionHeading
            eyebrow="Track 02 · Products"
            title={
              <>
                Software we run
                <br />
                <span className="text-[var(--blue)]">before we sell it.</span>
              </>
            }
          />
          <Reveal variant="up" delay={140}>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
              Three platforms, each pulled out of work we had done more than once. They ship
              as source into your cloud, or managed by us against an SLA. Either way the
              engineers who wrote them are the ones who answer the pager.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.id} variant="scale" delay={index * 120} className="h-full">
              <TiltCard className="h-full" innerClassName="rounded-[1.75rem]" max={5}>
                <article className="card-elevated relative flex h-full flex-col p-7 [transform-style:preserve-3d] lg:p-8">
                  {/* The wash is clipped by its own layer rather than by the article.
                      `overflow: hidden` on an element inside a 3D context flattens that
                      context — which would silently cancel every `translateZ` below and
                      leave the tilt as a flat skew with no depth in it. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]"
                  >
                    <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[var(--blue)]/[0.06] blur-3xl" />
                  </div>

                  <div className="tilt-z relative" style={{ '--tz': '30px' }}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--ink)] text-[#F7F6F1]">
                        <product.Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.16em] ${
                          TONES[product.statusTone]
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <div className="mt-7 flex items-baseline gap-2.5">
                      <h3 className="text-hero text-4xl leading-none text-[var(--ink)]">
                        {product.name}
                      </h3>
                      <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* What it replaces, before what it does. A buyer recognises their own
                      problem faster than they recognise your feature list. */}
                  <p className="relative mt-5 border-l-2 border-[var(--blue)]/35 pl-4 text-sm font-medium leading-relaxed text-[var(--ink)]">
                    {product.replaces}
                  </p>

                  <p className="relative mt-5 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {product.pitch}
                  </p>

                  <ul className="relative mt-6 space-y-2.5 border-t border-dashed border-[var(--divider-dashed)] pt-6">
                    {product.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className="flex items-start gap-2.5 text-[var(--fs-sm)] leading-relaxed text-[var(--ink-soft)]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.4rem] h-1 w-1 shrink-0 rounded-full bg-[var(--ink-faint)]"
                        />
                        {capability}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-auto pt-7">
                    <div className="rounded-2xl bg-[var(--bg-sunken)] px-4 py-3.5">
                      <div className="text-hero text-2xl leading-none text-[var(--ink)]">
                        {product.metric.value}
                      </div>
                      <div className="mt-1.5 text-[var(--fs-2xs)] leading-snug text-[var(--ink-faint)]">
                        {product.metric.label}
                      </div>
                    </div>

                    <Link
                      to="/contact"
                      className="group/cta mt-5 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
                    >
                      <span className="link-draw">Request a walkthrough</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal variant="up" delay={180} className="mt-8">
          <p className="text-center text-sm text-[var(--ink-faint)]">
            Every product ships with the source, the infrastructure definitions and the
            runbooks. If you ever want us out of the loop, nothing has to be rewritten to
            get us there.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
