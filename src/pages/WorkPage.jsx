import React from 'react';
import { Link } from 'react-router-dom';

const DECISIONS = [
  ['01 / Presentation', 'A story instead of a directory', 'The page moves from a real point of friction to an approach, then to the kind of work EKA can help with.'],
  ['02 / Performance', 'A fast page is part of the design', 'The visual language uses type, layout and static artwork. It does not need a renderer running while someone reads.'],
  ['03 / Honesty', 'Evidence before claims', 'Named client results belong here only when the team can stand behind them. Until then, this in house project is the example we can show.'],
];

export default function WorkPage() {
  return <div className="work-page">
    <header className="work-hero ink-section section-pad"><div className="site-wrap work-hero-grid"><div><p className="eyebrow"><span className="eyebrow-mark" /> Work / Selected notes</p><h1 className="display-title">The work should <em>speak plainly.</em></h1></div><p>We are building this section around work we can describe accurately. Here is one project we can show from the inside: this site itself.</p></div><div className="site-wrap work-hero-footer"><span>In house project</span><span>01 / EKA Solution website</span><span>2026</span></div></header>
    <section className="section-pad work-feature paper-surface"><div className="site-wrap work-feature-grid"><div className="work-feature-visual"><div className="work-visual-top"><span>EKA / WORKING FILE</span><span>01—04</span></div><div className="work-visual-text">Make the<br /><em>complex clear.</em></div><div className="work-visual-bottom"><span>From a rough idea</span><span>To a useful system ↗</span></div></div><div className="work-feature-copy"><p className="eyebrow">Featured / Our own digital home</p><h2 className="display-title">A website that practices what it says.</h2><p className="section-lede">The brief was simple to say and hard to get right: make EKA clear to a new visitor while keeping the experience responsive on ordinary devices.</p><p>The result is an ongoing design exercise. We use this space to show the decisions behind it, including the tradeoffs we made for performance and accessibility.</p><Link className="text-link" to="/playbook">See the working approach <span aria-hidden="true">↗</span></Link></div></div></section>
    <section className="section-pad work-decisions"><div className="site-wrap"><div className="section-heading section-heading-split"><p className="eyebrow">Notes from the process</p><h2 className="display-title">Three decisions behind the page.</h2><p>The details below are about this site. They do not claim results for unnamed clients.</p></div><div className="work-decision-list">{DECISIONS.map(([tag, title, body]) => <article key={tag}><span className="eyebrow">{tag}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="section-pad work-next ink-section"><div className="site-wrap next-grid"><p className="eyebrow">Your project</p><h2 className="display-title">A different context.<br /><em>Same care.</em></h2><div><p>Tell us what needs to change. We will start by understanding it.</p><Link className="button button-light" to="/contact">Start a conversation <span aria-hidden="true">↗</span></Link></div></div></section>
  </div>;
}
