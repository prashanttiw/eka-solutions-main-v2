import React from 'react';
import { ClosingCta, Eyebrow, TextLink } from '../components/ui';

const OBSERVATIONS = [
  ['A request is a clue', '“We need a dashboard” might really mean someone cannot see the state of a decision. We look for that gap before we draw a single screen.'],
  ['The edges reveal the system', 'Exceptions, permissions and handoffs tell us as much as the everyday path. They are usually where people lose time.'],
  ['Useful beats impressive', 'The best solution makes the next action easier to understand, even when nobody is watching a demo.'],
];

const QUALITIES = [
  ['Understandable', 'The people using it can tell what it is doing, and why.'],
  ['Maintainable', 'Your own team can change it without starting over.'],
  ['Resilient', 'It keeps working when the business, the load or the rules change.'],
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="page-hero">
        <div className="wrap page-hero-grid">
          <div>
            <Eyebrow>About EKA</Eyebrow>
            <h1 className="h-display">We like the hard part <em>before</em> the build.</h1>
          </div>
          <div className="page-hero-aside">
            <p className="lede">Understanding what is really happening in a business takes patience. That work shapes everything that follows.</p>
            <TextLink to="/playbook">See how we work</TextLink>
          </div>
        </div>
      </header>

      <section className="section tone-raised" aria-labelledby="why-title">
        <div className="wrap two-col">
          <div>
            <Eyebrow>Why this matters</Eyebrow>
            <h2 id="why-title" className="h-section">A system is only as clear as the thinking inside it.</h2>
          </div>
          <div>
            <p className="lede">People feel the seams when design, engineering and business decisions are made apart. We start by putting those conversations next to each other.</p>
            <p className="body">We ask what the person using the software is trying to accomplish, what the business needs to learn, and which constraints are real. Then we make those answers visible enough for everyone to challenge.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="details-title">
        <div className="wrap">
          <div className="split-head">
            <div>
              <Eyebrow>What we pay attention to</Eyebrow>
              <h2 id="details-title" className="h-section">The details are the work.</h2>
            </div>
            <p className="body">Small enough to miss, important enough to change the outcome.</p>
          </div>
          <div className="note-cards">
            {OBSERVATIONS.map(([title, body], index) => (
              <article className="note-card card" key={title}>
                <span className="note-card-index">{index + 1}</span>
                <h3 className="h-card">{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section tone-sunken" aria-labelledby="leave-title">
        <div className="wrap">
          <div className="intro-block">
            <Eyebrow>What we aim to leave</Eyebrow>
            <h2 id="leave-title" className="h-section">Something that still makes sense <em>tomorrow.</em></h2>
          </div>
          <ul className="qualities">
            {QUALITIES.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}
          </ul>
        </div>
      </section>

      <ClosingCta eyebrow="Keep reading" title={<>See what we <em>build.</em></>} action="Explore services" to="/services">
        Four kinds of work, often combined in one project: products, business systems, AI workflows and the platforms beneath them.
      </ClosingCta>
    </div>
  );
}
