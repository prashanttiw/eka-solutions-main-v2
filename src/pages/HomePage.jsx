import React from 'react';
import { Link } from 'react-router-dom';
import { Arrow, Button, ClosingCta, Eyebrow, TextLink } from '../components/ui';
import { VIGNETTES } from '../components/vignetteList';
import FoundingPlaces from '../components/FoundingPlaces';
import { FOUNDING } from '../lib/founding';
import { usePlayWhenVisible } from '../lib/playWhenVisible';
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

const FLOW_PATHS = [
  'M34 96C96 74 118 156 180 134S262 82 302 152 352 212 384 220',
  'M34 220C86 198 112 262 172 242S252 190 292 230 352 220 384 220',
  'M34 344C96 344 132 376 194 366S266 332 306 290 354 230 384 220',
];

function FlowSvg({ className, children }) {
  return <svg className={className} viewBox="0 0 560 440" aria-hidden="true">{children}</svg>;
}

/*
 * The diagram is static SVG. Its "flow" is a highlight window sliding left to right while
 * the blue copy inside it slides the other way, so the copy stays registered with the
 * paths. Both are transform animations the compositor runs without repainting the SVG.
 */
function HeroFlow() {
  const ref = usePlayWhenVisible();
  return (
    <div ref={ref} className="flow-stage play-scope" role="img" aria-label="Spreadsheets, email threads and workarounds joining into one clear path">
      <FlowSvg className="hero-flow">
        <g className="flow-grid">
          {Array.from({ length: 7 }, (_, row) => Array.from({ length: 10 }, (_, col) => <circle key={`${row}-${col}`} cx={28 + col * 56} cy={30 + row * 64} r="1.3" />))}
        </g>
        <g className="flow-paths">{FLOW_PATHS.map((d) => <path key={d} d={d} />)}</g>
        <g className="flow-sources">
          <circle cx="34" cy="96" r="6" /><circle cx="34" cy="220" r="6" /><circle cx="34" cy="344" r="6" />
        </g>
        <path className="flow-out" d="M384 220H520M506 208l14 12-14 12" />
        <circle className="flow-node" cx="384" cy="220" r="10" />
      </FlowSvg>
      {/* Labels are HTML, not SVG text, so they keep a readable size when the drawing shrinks. */}
      <div className="flow-labels" aria-hidden="true">
        <span style={{ left: '6%', top: '16%' }}>Spreadsheets</span>
        <span style={{ left: '6%', top: '44%' }}>Email threads</span>
        <span style={{ left: '6%', top: '72.3%' }}>Workarounds</span>
        <span className="flow-result" style={{ right: '7%', top: '44%' }}>One clear path</span>
      </div>
      <div className="flow-sweep">
        <div className="flow-window">
          <FlowSvg className="flow-glow">
            {FLOW_PATHS.map((d) => <path key={d} d={d} />)}
            <path className="flow-glow-out" d="M392 220H516" />
          </FlowSvg>
        </div>
      </div>
      <span className="flow-halo" />
    </div>
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
        <div className="wrap voices-layout">
          <div className="voices-intro">
            <h2 id="friction-title" className="h-section">The best brief often begins with “this is frustrating.”</h2>
            <p className="lede">That sentence tells us where to look. We follow it to the people and the tools involved before we suggest building anything.</p>
          </div>
          <ul className="voices">
            {SYMPTOMS.map(([quote, underneath]) => (
              <li key={quote}>
                <blockquote className="voice-quote">{quote}</blockquote>
                <p className="voice-under"><span>Usually underneath:</span> {underneath}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section tone-sunken" aria-labelledby="build-title">
        <div className="wrap">
          <div className="split-head">
            <h2 id="build-title" className="h-section">Four ways in. Often one project.</h2>
            <p className="body">Problems rarely arrive in neat categories. A customer portal usually needs a better process behind it, and both need a platform that holds up.</p>
          </div>
          {/* One frame, four cells that share their edges: the layout says "one project". */}
          <div className="service-frame">
            {SERVICES.map((service, index) => {
              const Vignette = VIGNETTES[index];
              return (
                <Link className="service-cell" key={service.id} to={`/services#${service.id}`}>
                  <div className="service-art"><Vignette /></div>
                  <div className="service-copy">
                    <h3 className="h-card">{service.title}</h3>
                    <p>{service.short}</p>
                    <span className="service-more">Explore {service.name}<Arrow dir="right" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="swipe-hint" aria-hidden="true">Swipe to see all four<Arrow dir="right" /></p>
        </div>
      </section>

      <section className="section band-ink" aria-labelledby="founding-title">
        <div className="wrap founding-band">
          <div className="founding-copy">
            <p className="band-label"><span className="band-dot" aria-hidden="true" />Founding 25</p>
            <h2 id="founding-title" className="h-section">Our first 25 clients work directly with the founders.</h2>
            <p className="founding-promise">A personal reply, a working session with both founders, a written first plan and a direct line until launch.</p>
            <div className="founding-actions">
              <Button to={FOUNDING.applyPath} variant="light">Apply for a place</Button>
              <TextLink to="/founding-25">How it works</TextLink>
            </div>
          </div>
          <FoundingPlaces tone="dark" />
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
