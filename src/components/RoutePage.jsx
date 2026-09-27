import React from 'react';
import { Link } from 'react-router-dom';

const PAGE_COPY = {
  about: {
    eyebrow: 'About EKA',
    title: <>A considered way<br />to make software.</>,
    lead: 'EKA brings design and engineering into the same conversation, so the work stays useful after launch—not just impressive on presentation day.',
    note: 'What matters to us',
    items: [
      ['Start with the real friction', 'A feature request is usually a signal. We take time to understand the people, decision and operational constraint behind it.'],
      ['Make decisions visible', 'A clear prototype, a useful technical plan and plain language give everyone something real to respond to.'],
      ['Leave the work legible', 'The systems, source and reasoning should remain understandable to the people who depend on them.'],
    ],
    cta: ['See how we work', '/playbook'],
  },
  services: {
    eyebrow: 'Services',
    title: <>From a complicated<br /><em>problem to a clear system.</em></>,
    lead: 'We help teams design, build and improve the digital parts of their business—without separating the thinking from the implementation.',
    note: 'Where we can help',
    items: [
      ['Digital products', 'Customer experiences, portals and applications that make a complex job feel simple.'],
      ['Business systems', 'Internal tools and workflows that make day-to-day operations easier to understand and run.'],
      ['AI workflows', 'Useful automation with clear boundaries, observability and a human way back in.'],
      ['Reliable platforms', 'The engineering foundations that help a product stay fast, stable and ready to change.'],
    ],
    cta: ['Start a conversation', '/contact'],
  },
  playbook: {
    eyebrow: 'The playbook',
    title: <>A steady path through<br /><em>uncertain work.</em></>,
    lead: 'The process is intentionally straightforward. Each step exists to reduce a particular kind of risk before it becomes expensive.',
    note: 'The rhythm',
    items: [
      ['01 — Understand', 'We map the situation, the people involved and the decision that the work needs to support.'],
      ['02 — Frame', 'We make the possible paths visible, test the assumptions and agree on what a useful first release means.'],
      ['03 — Build', 'Design and engineering move together in small, reviewable pieces—not as a long black box.'],
      ['04 — Learn', 'We check the result in real use, document what matters and leave a sensible next step.'],
    ],
    cta: ['Discuss a project', '/contact'],
  },
  work: {
    eyebrow: 'Work',
    title: <>Proof belongs in<br /><em>the work itself.</em></>,
    lead: 'We would rather show a clear process than dress up unverified names, metrics or testimonials. The strongest evidence is a system that makes sense to the people using it.',
    note: 'What a useful outcome looks like',
    items: [
      ['More clarity', 'People can see what happens next, why it happens and where to go when the normal path breaks.'],
      ['Less friction', 'The experience removes unnecessary effort without hiding decisions that need human judgement.'],
      ['A durable foundation', 'The system is understandable, testable and ready for the next useful change.'],
    ],
    cta: ['Talk through your situation', '/contact'],
  },
  careers: {
    eyebrow: 'Careers',
    title: <>Good work is built<br /><em>with care.</em></>,
    lead: 'We are keeping public role listings honest while the team’s hiring plans are being confirmed. If the way we work sounds like your kind of work, introduce yourself.',
    note: 'A thoughtful introduction is enough',
    items: [
      ['Show us something you care about', 'A project, a technical note, a design decision or a difficult problem you learned from.'],
      ['Tell us how you think', 'We value clear communication, curiosity and a willingness to make the work better—not just louder.'],
      ['Keep it simple', 'There is no application theatre here. An email with the context you want us to know is a useful start.'],
    ],
    cta: ['Email EKA', 'mailto:contact@ekasolution.com'],
  },
  contact: {
    eyebrow: 'Contact',
    title: <>Bring the rough<br /><em>version first.</em></>,
    lead: 'An unfinished idea, a frustrating process or a product that has stopped feeling right is enough to begin a useful conversation.',
    note: 'A good first note can include',
    items: [
      ['The situation', 'What is changing, what is not working, and who is feeling the friction.'],
      ['The goal', 'What you would like to be true when the work is done.'],
      ['The constraint', 'A timing, technical, operational or budget consideration that will shape the route.'],
    ],
    cta: ['Email contact@ekasolution.com', 'mailto:contact@ekasolution.com'],
  },
};

function RouteLink({ href, children }) {
  return href.startsWith('/') ? <Link className="v2-route-cta" to={href}>{children}<span aria-hidden="true">↗</span></Link> : <a className="v2-route-cta" href={href}>{children}<span aria-hidden="true">↗</span></a>;
}

export default function RoutePage({ page }) {
  const content = PAGE_COPY[page];
  if (!content) return null;

  return (
    <article className="v2-route-page">
      <header className="v2-route-hero">
        <div className="v2-route-wrap">
          <p className="story-kicker">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="v2-route-lead">{content.lead}</p>
        </div>
      </header>
      <section className="v2-route-body">
        <div className="v2-route-wrap">
          <p className="story-kicker">{content.note}</p>
          <ol className="v2-route-list">
            {content.items.map(([title, body], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h2>{title}</h2><p>{body}</p></div>
              </li>
            ))}
          </ol>
          <RouteLink href={content.cta[1]}>{content.cta[0]}</RouteLink>
        </div>
      </section>
    </article>
  );
}
