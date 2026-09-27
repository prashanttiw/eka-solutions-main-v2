import React from 'react';
import { Link } from 'react-router-dom';
import { Button, ClosingCta, Eyebrow, TextLink } from '../components/ui';
import { VIGNETTES } from '../components/vignetteList';
import FoundingPlaces from '../components/FoundingPlaces';
import { FOUNDING } from '../lib/founding';
import { SERVICES } from '../lib/services';

const SYMPTOMS = [
  ['“Only one person really understands the spreadsheet.”', 'The process has outgrown its tool, and the knowledge lives in someone’s head.'],
  ['“Customers keep asking where things stand.”', 'The information exists, but nobody outside the team can see it.'],
  ['“Every new request means another workaround.”', 'The system was shaped for last year’s business, not this one.'],
];

const MOVES = [
  ['Listen', 'Find the real friction', 'We start with the moment that is failing someone, not a list of features.', 'A shared picture of the problem'],
  ['Shape', 'Make the path visible', 'A working model gives everyone something concrete to test and question.', 'A clear, agreed first release'],
  ['Build', 'Prove it in use', 'Design and engineering move together in small pieces you can review as they become real.', 'Working software, week by week'],
];

const LEAVES = [
  ['People understand it', 'The people using it can tell what it is doing and what to do next.'],
  ['You can change it', 'Your team can maintain and extend it without calling us for every edit.'],
  ['Every choice is explained', 'Decisions are written down, so the reasoning survives the handover.'],
];

function HeroFlow() {
  return (
    <svg className="hero-flow" viewBox="0 0 560 440" role="img" aria-labelledby="flow-title">
      <title id="flow-title">Spreadsheets, email threads and workarounds joining into one clear path</title>
      <g className="flow-grid">
        {Array.from({ length: 7 }, (_, row) => Array.from({ length: 10 }, (_, col) => <circle key={`${row}-${col}`} cx={28 + col * 56} cy={30 + row * 64} r="1.3" />))}
      </g>
      <g className="flow-paths">
        <path d="M34 96C96 74 118 156 180 134S262 82 302 152 352 212 384 220" />
        <path d="M34 220C86 198 112 262 172 242S252 190 292 230 352 220 384 220" />
        <path d="M34 344C98 368 134 288 194 310S264 362 304 292 354 230 384 220" />
      </g>
      <g className="flow-labels">
        <text x="34" y="70">Spreadsheets</text>
        <text x="34" y="194">Email threads</text>
        <text x="34" y="318">Workarounds</text>
      </g>
      <g className="flow-sources">
        <circle cx="34" cy="96" r="6" /><circle cx="34" cy="220" r="6" /><circle cx="34" cy="344" r="6" />
      </g>
      <path className="flow-out" d="M384 220H520M506 208l14 12-14 12" />
      <circle className="flow-node" cx="384" cy="220" r="10" />
      <text className="flow-result" x="398" y="194">One clear path</text>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="wrap home-hero-grid">
          <div className="home-hero-copy">
            <Eyebrow>Design &amp; engineering studio</Eyebrow>
            <h1 id="home-title" className="h-display">Make the complex <em>clear.</em></h1>
            <p className="lede">When a business problem is hard to explain, the software built around it should not make it harder.</p>
            <p className="body">EKA Solution designs and builds websites, applications and internal systems. Product thinking, design and engineering sit in one conversation, from the first rough idea to the tool your team uses every day.</p>
            <div className="actions">
              <Button to="/contact">Start a project</Button>
              <Button href="#how-we-work" variant="ghost" dir="down">See how we work</Button>
            </div>
          </div>
          <figure className="hero-figure">
            <HeroFlow />
            <figcaption>Most projects begin here: work spread across tools that were never meant to hold it.</figcaption>
          </figure>
        </div>
        <div className="wrap">
          <ul className="scope-strip" aria-label="What we build">
            {['Websites', 'Web applications', 'Customer portals', 'Internal tools', 'AI workflows', 'Cloud platforms'].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="friction-title">
        <div className="wrap">
          <div className="intro-block">
            <Eyebrow>Where it starts</Eyebrow>
            <h2 id="friction-title" className="h-section">The best brief often begins with <em>“this is frustrating.”</em></h2>
            <p className="lede">That sentence tells us where to look. We trace the friction through the people, decisions and systems around it before we decide what to build.</p>
          </div>
          <div className="symptom-grid">
            {SYMPTOMS.map(([quote, underneath]) => (
              <article className="symptom" key={quote}>
                <p className="symptom-quote">{quote}</p>
                <p className="symptom-under"><span>Usually underneath</span>{underneath}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section tone-sunken" aria-labelledby="build-title">
        <div className="wrap">
          <div className="split-head">
            <div>
              <Eyebrow>What we build</Eyebrow>
              <h2 id="build-title" className="h-section">Four ways in. Often one project.</h2>
            </div>
            <p className="body">Problems rarely arrive in neat categories. A customer portal usually needs a better process behind it, and both need a platform that holds up.</p>
          </div>
          <div className="service-cards">
            {SERVICES.map((service, index) => {
              const Vignette = VIGNETTES[index];
              return (
                <Link className="service-card" key={service.id} to={`/services#${service.id}`}>
                  <Vignette />
                  <div className="service-card-copy">
                    <h3 className="h-card">{service.title}</h3>
                    <p>{service.short}</p>
                    <span className="service-card-more">Explore {service.name}<span className="arrow-nudge" aria-hidden="true">→</span></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="how-we-work" aria-labelledby="method-title">
        <div className="wrap">
          <div className="split-head">
            <div>
              <Eyebrow>How a project runs</Eyebrow>
              <h2 id="method-title" className="h-section">Three moves. <em>One conversation.</em></h2>
            </div>
            <p className="body">Fewer handoffs and clearer decisions. You speak with the people designing and building the work, from the first call to launch.</p>
          </div>
          <ol className="move-list">
            {MOVES.map(([verb, title, text, output], index) => (
              <li className="move" key={verb}>
                <span className="move-index">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="h-card">{verb}</h3>
                <p className="move-title">{title}</p>
                <p className="move-text">{text}</p>
                <p className="move-output"><span>You leave with</span>{output}</p>
              </li>
            ))}
          </ol>
          <TextLink to="/playbook">Read the full playbook</TextLink>
        </div>
      </section>

      <section className="section section-flush-top" aria-labelledby="founding-title">
        <div className="wrap">
          <div className="founding-band">
            <div>
              <Eyebrow>Founding 25</Eyebrow>
              <h2 id="founding-title" className="h-section">Our first 25 clients work directly <em>with the founders.</em></h2>
              <p className="body">A personal reply, a working session with both founders, a written first plan and a direct line until launch. When the twenty-five places are taken, the programme closes.</p>
              <div className="actions">
                <Button to={FOUNDING.applyPath}>Apply for a place</Button>
                <Button to="/founding-25" variant="ghost" dir="right">How it works</Button>
              </div>
            </div>
            <FoundingPlaces />
          </div>
        </div>
      </section>

      <section className="section section-flush-top" aria-labelledby="belief-title">
        <div className="wrap">
          <div className="belief">
            <div className="intro-block">
              <Eyebrow>What we leave behind</Eyebrow>
              <h2 id="belief-title" className="h-section">Good software leaves <em>clarity</em> behind.</h2>
            </div>
            <ul className="leave-list">
              {LEAVES.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}
            </ul>
            <TextLink to="/about">More about how we think</TextLink>
          </div>
        </div>
      </section>

      <ClosingCta title={<>Bring the rough version <em>first.</em></>}>
        The half-formed idea, the process everyone works around, or the product that never quite feels right. That is enough to begin.
      </ClosingCta>
    </div>
  );
}
