import React from 'react';
import FoundingPlaces from '../components/FoundingPlaces';
import { Button, ClosingCta, Eyebrow, TextLink } from '../components/ui';
import { FOUNDING } from '../lib/founding';

const INCLUDED = [
  ['A founder reads your note', 'No sales team and no automatic reply. One of the founders reads what you send and answers personally.'],
  ['A working session with both founders', 'A first conversation about the problem, not a pitch. Bring the people who feel the friction every day.'],
  ['A written first plan, yours to keep', 'What we heard, the risks we see and a sensible first release, written down. You keep it whether or not we work together.'],
  ['Founders on every decision', 'The design and engineering choices on your project are made by the founders, not passed to someone you have never met.'],
  ['A direct line until launch', 'A founder’s own email and WhatsApp for the life of the project, so a question never waits in a queue.'],
];

const TERMS = [
  ['Places go to projects, not to whoever asks first', 'We say yes where we believe we can do genuinely good work. Applying early helps, but it does not guarantee a place.'],
  ['Applying costs nothing and commits you to nothing', 'It is a conversation. If a project follows, scope and pricing are agreed openly, like any other engagement.'],
  ['If we are not the right fit, we will say so', 'And where we can, we will point you to someone who is.'],
];

const STEPS = [
  ['Send a short note', 'Use the contact form and tick “Founding 25”. A few honest sentences are enough.'],
  ['Hear back from a founder', 'A personal reply, with any questions we need answered first.'],
  ['Meet both founders', 'The working session. Afterwards you receive the written first plan.'],
];

export default function FoundingPage() {
  return (
    <div className="founding-page">
      <header className="page-hero">
        <div className="wrap page-hero-grid">
          <div>
            <Eyebrow>Founding 25</Eyebrow>
            <h1 className="h-display">Our first 25 clients work <em>with the founders.</em></h1>
          </div>
          <div className="page-hero-aside">
            <p className="lede">EKA is new and deliberately small. For our first twenty-five clients that is the advantage: the people who started the company lead the work themselves.</p>
            <div className="actions">
              <Button to={FOUNDING.applyPath}>Apply for a place</Button>
              <TextLink href="#included" dir="down">What is included</TextLink>
            </div>
          </div>
        </div>
      </header>

      <section className="section tone-raised" aria-labelledby="why-title">
        <div className="wrap founding-why">
          <div>
            <Eyebrow>Why twenty-five</Eyebrow>
            <h2 id="why-title" className="h-section">Founder time is the one thing that <em>does not scale.</em></h2>
            <p className="lede">Two founders can give their full attention to a limited number of projects. Twenty-five is our honest estimate of that limit.</p>
            <p className="body">This is not a discount and there is no countdown clock. When the twenty-fifth place is taken, the programme closes, and it will not come back later at a higher price.</p>
          </div>
          <FoundingPlaces className="card" />
        </div>
      </section>

      <section className="section" id="included" aria-labelledby="included-title">
        <div className="wrap">
          <div className="split-head">
            <div>
              <Eyebrow>What a founding place includes</Eyebrow>
              <h2 id="included-title" className="h-section">The people who started EKA, <em>on your project.</em></h2>
            </div>
            <p className="body">Five commitments we can keep for every one of the twenty-five, without exception.</p>
          </div>
          <ol className="included-list">
            {INCLUDED.map(([title, text], index) => (
              <li className="card" key={title}>
                <span>{index + 1}</span>
                <h3 className="h-card">{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section tone-sunken" aria-labelledby="terms-title">
        <div className="wrap two-col">
          <div>
            <Eyebrow>How places work</Eyebrow>
            <h2 id="terms-title" className="h-section">Plain terms, <em>no small print.</em></h2>
          </div>
          <ul className="terms-list">
            {TERMS.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="apply-title">
        <div className="wrap">
          <div className="intro-block">
            <Eyebrow>How to apply</Eyebrow>
            <h2 id="apply-title" className="h-section">Three steps to a <em>first conversation.</em></h2>
          </div>
          <ol className="steps">
            {STEPS.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}
          </ol>
        </div>
      </section>

      <ClosingCta eyebrow="Founding 25" title={<>Take one of the <em>first twenty-five.</em></>} action="Apply for a place" to={FOUNDING.applyPath}>
        Tell us what is happening and tick “Founding 25”. A founder will read it and write back personally.
      </ClosingCta>
    </div>
  );
}
