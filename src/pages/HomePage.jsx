import React from 'react';
import { Link } from 'react-router-dom';

const SERVICES = [
  ['01', 'Digital products', 'Customer experiences, applications and portals that give people a clearer way through the work.'],
  ['02', 'Business systems', 'Internal software that untangles handoffs, decisions and the everyday operational mess.'],
  ['03', 'AI workflows', 'Automation designed with boundaries, visibility and a useful human way back in.'],
  ['04', 'Reliable platforms', 'The engineering foundations that let a system stay quick, understandable and ready to change.'],
];

const MOVES = [
  ['Listen', 'Find the real friction', 'We begin with the moment that is failing someone, not a list of features waiting to be built.'],
  ['Shape', 'Make the path visible', 'A working model gives the team something concrete to test, question and improve.'],
  ['Build', 'Prove it in use', 'Design and engineering move together in small pieces that can be reviewed as they become real.'],
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero paper-surface" aria-labelledby="home-title">
        <div className="site-wrap home-hero-grid">
          <div className="home-hero-copy">
            <p className="eyebrow"><span className="eyebrow-mark" /> EKA Solution / Design + Engineering</p>
            <h1 id="home-title">Make the<br />complex <em>clear.</em></h1>
            <p className="home-hero-lede">When a business problem is hard to explain, the software built around it should not make it harder.</p>
            <p className="home-hero-support">We bring product thinking, design and engineering into one conversation—from the first rough idea to the work people use every day.</p>
            <div className="hero-actions"><Link className="button button-primary" to="/contact">Tell us what is stuck <span aria-hidden="true">↗</span></Link><a className="text-link" href="#the-story">See how we think <span aria-hidden="true">↓</span></a></div>
          </div>
          <figure className="home-hero-figure">
            <img src="/assets/flow-map.svg" alt="Several irregular paths joining into one clear direction" width="800" height="680" fetchPriority="high" />
            <figcaption><span>Figure 01</span><span>From friction to flow</span></figcaption>
          </figure>
        </div>
        <div className="site-wrap hero-baseline"><span>Designed to be understood.</span><span>Built to keep working.</span><span aria-hidden="true">↓</span></div>
      </section>

      <section className="home-premise section-pad" id="the-story">
        <div className="site-wrap premise-grid">
          <p className="eyebrow">01 / The starting point</p>
          <div><h2 className="display-title">The best brief often starts with <em>“this is frustrating.”</em></h2><p className="section-lede">That sentence tells us where to look. We trace the friction through the people, decisions and systems around it before we decide what needs to be built.</p></div>
          <aside className="margin-note"><span>Margin note / 001</span><p>The first useful question is rarely “what features do you want?”</p></aside>
        </div>
      </section>

      <section className="home-method ink-section section-pad" aria-labelledby="method-title">
        <div className="site-wrap">
          <div className="section-heading"><p className="eyebrow">02 / The working method</p><h2 id="method-title" className="display-title">Three moves.<br /><em>One conversation.</em></h2><p>Fewer handoffs. Clearer decisions. Work that holds together from early thinking to launch.</p></div>
          <div className="method-list">
            {MOVES.map(([verb, title, description], index) => <article className="method-row" key={verb}><span className="index-number">0{index + 1}</span><h3>{verb}<span aria-hidden="true"> ↗</span></h3><div><strong>{title}</strong><p>{description}</p></div></article>)}
          </div>
          <Link className="text-link light-link" to="/playbook">Read the playbook <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="home-services section-pad paper-surface" aria-labelledby="services-title">
        <div className="site-wrap">
          <div className="section-heading section-heading-split"><p className="eyebrow">03 / Where we help</p><h2 id="services-title" className="display-title">Problems do not arrive in neat categories.</h2><p>These capabilities often meet in one project. The useful combination depends on the situation, not a preset package.</p></div>
          <div className="capability-list">
            {SERVICES.map(([number, title, description]) => <Link className="capability-row" key={title} to="/services"><span className="index-number">{number}</span><h3>{title}</h3><p>{description}</p><span className="row-arrow" aria-hidden="true">↗</span></Link>)}
          </div>
        </div>
      </section>

      <section className="home-belief section-pad" aria-labelledby="belief-title">
        <div className="site-wrap belief-grid"><p className="eyebrow">04 / A working principle</p><div><h2 id="belief-title" className="display-title">Good software leaves <em>clarity behind.</em></h2><p className="section-lede">The people who use it should know what it is doing. The people who own it should be able to change it. And the team building it should be able to explain why each decision was made.</p><Link className="text-link" to="/about">More about our point of view <span aria-hidden="true">↗</span></Link></div><span className="belief-stamp" aria-hidden="true">EKA<br />/ 04</span></div>
      </section>

      <section className="home-next section-pad ink-section"><div className="site-wrap next-grid"><p className="eyebrow">The next move</p><h2 className="display-title">Bring the rough<br /><em>version first.</em></h2><div><p>The half formed idea, the process everyone works around, or the product that never quite feels right. That is enough to begin.</p><Link className="button button-light" to="/contact">Start a conversation <span aria-hidden="true">↗</span></Link></div></div></section>
    </div>
  );
}
