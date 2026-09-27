import React from 'react';
import { ClosingCta, Eyebrow, TextLink } from '../components/ui';

const OBSERVATIONS = [
  ['A request is a clue', '“We need a dashboard” might really mean someone cannot see the state of a decision. We look for that gap before we draw a single screen.'],
  ['The edges reveal the system', 'Exceptions, permissions and handoffs tell us as much as the everyday path. They are usually where people lose time.'],
  ['Useful beats impressive', 'The best solution makes the next action easier to understand, even when nobody is watching a demo.'],
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
            <p className="lede">Before we design anything, we find out what is really going wrong. It is slow, careful work, and it shapes everything after it.</p>
            <TextLink to="/playbook">See how we work</TextLink>
          </div>
        </div>
      </header>

      <section className="section tone-raised" aria-labelledby="why-title">
        <div className="wrap two-col">
          <h2 id="why-title" className="h-section">Confusing software usually starts as a confusing conversation.</h2>
          <div>
            <p className="lede">People feel the seams when design, engineering and business decisions are made apart. We start by putting those conversations next to each other.</p>
            <p className="body">We ask what the person using the software is trying to do, what the business needs to know and which constraints are real. Then we write the answers down where everyone can question them.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="details-title">
        <div className="wrap">
          <h2 id="details-title" className="h-section notes-title">The details are the work.</h2>
          <ul className="notes">
            {OBSERVATIONS.map(([title, body]) => (
              <li key={title}>
                <h3 className="h-card">{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section tone-sunken" aria-labelledby="today-title">
        <div className="wrap moment">
          <Eyebrow>Where we are today</Eyebrow>
          <h2 id="today-title" className="h-section">New, small, and doing the work ourselves.</h2>
          <p className="lede">EKA is a young studio started by two founders. For now, the people you first speak to are the people who design and build your project.</p>
          <p className="body">We are careful about what we show. Our own website is the first project we can open up fully; client work appears here only once it is approved for publication.</p>
          <div className="moment-links">
            <TextLink to="/founding-25">How Founding 25 works</TextLink>
            <TextLink to="/work">See the work we can show</TextLink>
          </div>
        </div>
      </section>

      <ClosingCta eyebrow="Keep reading" title={<>See what we <em>build.</em></>} action="Explore services" to="/services">
        Four kinds of work, often combined in one project: products, business systems, AI workflows and the platforms beneath them.
      </ClosingCta>
    </div>
  );
}
