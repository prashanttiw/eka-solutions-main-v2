import React from 'react';
import { ClosingCta, Eyebrow, TextLink } from '../components/ui';

const DECISIONS = [
  ['Presentation', 'A story instead of a directory', 'Each page moves from a real point of friction, to an approach, to the kind of work we can help with, and ends with one clear next step.'],
  ['Performance', 'A fast page is part of the design', 'Type, layout and hand-built illustrations carry the look. Nothing runs in the background while someone reads, so ordinary phones and laptops stay responsive.'],
  ['Honesty', 'Evidence before claims', 'Client names and results appear here only once they are approved for publication. Until then, this in-house project is the work we can show openly.'],
];

export default function WorkPage() {
  return (
    <div className="work-page">
      <header className="page-hero">
        <div className="wrap page-hero-grid">
          <div>
            <Eyebrow>Work</Eyebrow>
            <h1 className="h-display">The work should <em>speak plainly.</em></h1>
          </div>
          <div className="page-hero-aside">
            <p className="lede">We only show work we can describe accurately. The first project we can open up fully is this website itself.</p>
          </div>
        </div>
      </header>

      <section className="section tone-sunken" aria-labelledby="case-title">
        <div className="wrap case-feature">
          <figure className="browser">
            <div className="vg-bar"><i /><i /><i /><span>ekasolution.com</span></div>
            <img
              src="/assets/work-eka-home.webp"
              srcSet="/assets/work-eka-home-720.webp 720w, /assets/work-eka-home.webp 1200w"
              sizes="(max-width: 1080px) calc(100vw - 40px), 700px"
              alt="The EKA Solution homepage: the headline “Make the complex clear.” beside a diagram of three paths joining into one"
              width="1200"
              height="750"
              decoding="async"
            />
          </figure>
          <div className="case-copy">
            <Eyebrow>In-house project</Eyebrow>
            <h2 id="case-title" className="h-section">A website that practises what it says.</h2>
            <dl className="case-meta">
              <div><dt>Scope</dt><dd>Strategy, design, build</dd></div>
              <div><dt>Focus</dt><dd>Clarity, speed</dd></div>
              <div><dt>Year</dt><dd>2026</dd></div>
            </dl>
            <p className="body">The brief was simple to say and hard to get right: explain EKA clearly to a first-time visitor, and keep the site quick on the Windows laptops and Android phones most people actually use.</p>
            <p className="body">An earlier version leaned on 3D graphics and particle effects. It looked striking on a new MacBook and struggled everywhere else, so we rebuilt it around writing, typography and lightweight illustration.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="decisions-title">
        <div className="wrap">
          <div className="split-head">
            <h2 id="decisions-title" className="h-section">Three decisions behind the page.</h2>
            <TextLink to="/playbook">See the process we followed</TextLink>
          </div>
          <ol className="annotations">
            {DECISIONS.map(([tag, title, body]) => (
              <li key={tag}>
                <p className="annotation-tag">{tag}</p>
                <h3 className="h-card">{title}</h3>
                <p className="annotation-text">{body}</p>
              </li>
            ))}
          </ol>
          <p className="honesty-note">These notes describe this website only. They make no claims about results for unnamed clients.</p>
        </div>
      </section>

      <ClosingCta eyebrow="Your project" title={<>Could yours be the next one <em>on this page?</em></>}>
        Tell us what needs to change. If we work together and you are happy to share it, your project could be the next case we write up here.
      </ClosingCta>
    </div>
  );
}
