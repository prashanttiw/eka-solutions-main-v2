import React from 'react';
import { Link } from 'react-router-dom';

const OBSERVATIONS = [
  ['A request is a clue', '“We need a dashboard” might mean someone cannot see the state of a decision. We look for that gap first.'],
  ['The edges reveal the system', 'Exception paths, permissions and handoffs tell us as much as the happy path.'],
  ['Useful beats impressive', 'The best solution makes the next action easier to understand, even when nobody is watching a demo.'],
];

export default function AboutPage() {
  return <div className="about-page">
    <header className="about-hero paper-surface section-pad"><div className="site-wrap"><p className="eyebrow"><span className="eyebrow-mark" /> About / The thinking behind EKA</p><div className="about-hero-grid"><h1 className="display-title">We like the hard part <em>before</em> the build.</h1><div className="about-hero-side"><span className="editorial-rule" aria-hidden="true" /><p>Understanding what is actually happening in a business takes patience. That work shapes everything that follows.</p><Link className="text-link" to="/playbook">How we work <span aria-hidden="true">↗</span></Link></div></div><div className="about-running-line"><span>Curiosity</span><span>Judgement</span><span>Care</span></div></div></header>
    <section className="section-pad about-intro"><div className="site-wrap two-column-story"><p className="eyebrow">01 / Why this matters</p><div><h2 className="display-title">A system is only as clear as the thinking inside it.</h2><p className="section-lede">People feel the seams when design, engineering and business decisions are made apart. Our work starts by putting those conversations next to each other.</p><p>We ask what the person using the software is trying to accomplish, what the business needs to learn, and which constraints are real. Then we make those answers visible enough to challenge.</p></div></div></section>
    <section className="section-pad about-observations paper-surface"><div className="site-wrap"><div className="section-heading section-heading-split"><p className="eyebrow">02 / Things we pay attention to</p><h2 className="display-title">The details are the work.</h2><p>These questions are small enough to miss and important enough to change the outcome.</p></div><div className="observation-list">{OBSERVATIONS.map(([title, body], index) => <article key={title}><span className="index-number">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="section-pad about-promise ink-section"><div className="site-wrap about-promise-grid"><p className="eyebrow">03 / What we aim to leave</p><h2 className="display-title">Something that makes sense <em>tomorrow.</em></h2><div><p>A useful product should be understandable to its users, maintainable by its owners and resilient when the next change arrives.</p><Link className="button button-light" to="/services">See what we do <span aria-hidden="true">↗</span></Link></div></div></section>
  </div>;
}
