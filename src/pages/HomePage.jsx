import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../story.css';

const CHAPTERS = [
  {
    number: '01',
    verb: 'Listen',
    serif: 'to the mess.',
    body: 'Before screens or architecture, we find the friction: who is stuck, what they are trying to do, and what the business actually needs to change.',
  },
  {
    number: '02',
    verb: 'Shape',
    serif: 'the system.',
    body: 'Product flow, interface and technical shape are worked together. The prototype is a decision-making tool, not a hand-off artifact.',
  },
  {
    number: '03',
    verb: 'Build',
    serif: 'the habit.',
    body: 'We ship in small slices, observe real use and keep reducing the distance between what the product promises and what people experience.',
  },
];

const CAPABILITIES = [
  ['01', 'Digital products', 'SaaS, portals, applications and customer-facing experiences.'],
  ['02', 'Business systems', 'Internal software that makes complicated operations feel calmer.'],
  ['03', 'AI workflows', 'Automation with judgement, observability and a human way out.'],
  ['04', 'Reliable platforms', 'Infrastructure and delivery systems that survive real use.'],
];

const PRINCIPLES = [
  ['You own it', 'Source, infrastructure, decisions and documentation leave with you.'],
  ['Same people', 'The people discussing the problem are the people shaping the build.'],
  ['Prove it', 'Performance, usability and operational claims should be measurable.'],
  ['Keep it human', 'Automation should remove repeat work without removing judgement.'],
];

const MENU_LINKS = [
  ['01', 'Story', '#story'],
  ['02', 'Capabilities', '#capabilities'],
  ['03', 'Principles', '#principles'],
  ['04', 'Contact', '#contact'],
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('Story');

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const root = document.documentElement;
        const max = Math.max(1, root.scrollHeight - window.innerHeight);
        root.style.setProperty('--story-progress', String(Math.min(1, window.scrollY / max)));
        setScrolled(window.scrollY > 28);
        raf = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-story-section]')];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.dataset?.storyLabel) setActive(visible.target.dataset.storyLabel);
      },
      { rootMargin: '-38% 0px -45% 0px', threshold: [0, 0.15, 0.4] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reveals = [...document.querySelectorAll('.story-reveal')];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );

    reveals.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="story-shell">
      <div className="story-progress" aria-hidden="true" />

      <header className={'story-nav ' + (scrolled ? 'story-nav--scrolled' : '')}>
        <a className="story-brand" href="#story-top" aria-label="EKA Solution home">
          <img className="story-brand-symbol" src="/brand/eka-symbol.webp" alt="" aria-hidden="true" />
          <img className="story-brand-wordmark" src="/brand/eka-wordmark.webp" alt="EKA Solution" />
        </a>
        <div className="story-nav-context" aria-live="polite">
          <span className="story-nav-dot" />
          <span>{active}</span>
        </div>
        <div className="story-nav-actions">
          <Link className="story-nav-quiet" to="/contact">Start a project</Link>
          <button
            className="story-menu-trigger"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="story-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span>Menu</span><span aria-hidden="true">＋</span>
          </button>
        </div>
      </header>

      <div id="story-menu" className={'story-menu ' + (menuOpen ? 'is-open' : '')} aria-hidden={!menuOpen}>
        <div className="story-menu-top">
          <span className="story-menu-brand"><img src="/brand/eka-symbol.webp" alt="" /><img src="/brand/eka-wordmark.webp" alt="" /></span>
          <button type="button" className="story-menu-close" onClick={closeMenu}>Close ×</button>
        </div>
        <nav className="story-menu-links" aria-label="Homepage sections">
          {MENU_LINKS.map(([number, label, href]) => (
            <a key={label} href={href} onClick={closeMenu}>
              <span>{number}</span><strong>{label}</strong><em>↗</em>
            </a>
          ))}
        </nav>
        <p className="story-menu-note">A short navigation on purpose. The homepage is one story, not a directory.</p>
      </div>

      <section id="story-top" className="story-hero" data-story-section data-story-label="Introduction">
        <div className="story-hero-aura" aria-hidden="true" />
        <img className="story-hero-symbol" src="/brand/eka-symbol.webp" alt="" aria-hidden="true" />
        <div className="story-hero-copy">
          <p className="story-kicker story-hero-in-1">EKA Solution / Product + Engineering</p>
          <h1>
            <span className="story-hero-in-2">Software should feel</span>
            <em className="story-hero-in-3">obvious.</em>
          </h1>
          <p className="story-hero-thought story-hero-in-4">
            Not because the problem was simple.<br />
            Because someone cared enough to make it feel that way.
          </p>
          <p className="story-hero-body story-hero-in-5">
            We design and engineer digital products, business systems and AI workflows for teams with complicated problems and no appetite for forgettable software.
          </p>
          <a href="#story" className="story-enter story-hero-in-6">Enter the story <span>↓</span></a>
        </div>
        <div className="story-scroll-cue" aria-hidden="true">Scroll <span>↓</span></div>
      </section>

      <section id="story" className="story-friction" data-story-section data-story-label="Story">
        <div className="story-frame">
          <p className="story-kicker story-reveal">Why EKA exists</p>
          <h2 className="story-friction-title story-reveal">Most software starts<br />with a feature list.</h2>
          <p className="story-friction-turn story-reveal">We start with the moment someone says —</p>
          <blockquote className="story-friction-quote story-reveal">“This is frustrating.”</blockquote>
          <div className="story-transform-rail story-reveal" aria-label="From mess to momentum">
            <span>Mess</span><i>→</i><span>Meaning</span><i>→</i><span>Momentum</span>
          </div>
          <p className="story-friction-note story-reveal">
            That shift — from friction to flow — is the job. Design gives it shape. Engineering makes it real. Operations prove whether it actually works.
          </p>
        </div>
      </section>

      <section className="story-build" data-story-section data-story-label="How we build">
        <div className="story-build-grid">
          <aside className="story-build-sticky">
            <p className="story-kicker">The build story</p>
            <h2>Three moves.<br /><em>One conversation.</em></h2>
            <p>Less theatre between disciplines. More decisions made with the people who will live with them.</p>
          </aside>
          <div className="story-chapters">
            {CHAPTERS.map((chapter) => (
              <article className="story-chapter story-reveal" key={chapter.number}>
                <span className="story-chapter-number">{chapter.number}</span>
                <h3><strong>{chapter.verb}</strong> <em>{chapter.serif}</em></h3>
                <p>{chapter.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="story-capabilities" data-story-section data-story-label="Capabilities">
        <div className="story-frame">
          <p className="story-kicker story-kicker--light story-reveal">What we can own with you</p>
          <h2 className="story-capabilities-title story-reveal">
            Not a menu of services.<br />
            A set of problems we know how to carry.
          </h2>
          <div className="story-capability-list">
            {CAPABILITIES.map(([number, title, description]) => (
              <a href="/services" className="story-capability-row story-reveal" key={title}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{description}</p>
                <em>↗</em>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="story-two-lanes" data-story-section data-story-label="What EKA is">
        <div className="story-lane story-lane--client story-reveal">
          <span>01 / With clients</span>
          <h2>We build systems<br />your business runs on.</h2>
          <p>Product design, engineering and reliability stay in one conversation from the first problem to production.</p>
          <Link to="/services">Explore client work ↗</Link>
        </div>
        <div className="story-lane story-lane--product story-reveal">
          <span>02 / For ourselves</span>
          <h2>We build our own<br /><em>products too.</em></h2>
          <p>That keeps us honest. We live with roadmap choices, support, performance and the cost of every shortcut we make.</p>
          <Link to="/about">Why that matters ↗</Link>
        </div>
      </section>

      <section id="principles" className="story-principles" data-story-section data-story-label="Principles">
        <div className="story-frame story-principles-grid">
          <div className="story-principles-heading story-reveal">
            <p className="story-kicker">What we believe</p>
            <h2>Good software leaves<br />clarity behind.</h2>
            <em>Not dependency.</em>
          </div>
          <div className="story-principle-list">
            {PRINCIPLES.map(([title, body], index) => (
              <div className="story-principle story-reveal" key={title}>
                <span>0{index + 1}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="story-contact" data-story-section data-story-label="Contact">
        <div className="story-contact-aura" aria-hidden="true" />
        <img src="/brand/eka-symbol.webp" className="story-contact-symbol" alt="" aria-hidden="true" />
        <div className="story-frame story-contact-inner">
          <h2 className="story-reveal">Bring us<br /><em>the messy version.</em></h2>
          <p className="story-reveal">
            The half-formed idea. The process everyone hates. The product that works but never quite feels right. That is enough to start.
          </p>
          <div className="story-contact-actions story-reveal">
            <Link to="/contact">Start a conversation <span>↗</span></Link>
            <a href="mailto:hello@ekasolution.in">hello@ekasolution.in</a>
          </div>
        </div>
      </section>

      <footer className="story-footer">
        <div className="story-footer-brand">
          <span className="story-footer-logo"><img src="/brand/eka-symbol.webp" alt="" aria-hidden="true" /><img src="/brand/eka-wordmark.webp" alt="EKA Solution" /></span>
          <p>We make complicated software feel considered.</p>
        </div>
        <div className="story-footer-links">
          <div><strong>Explore</strong><Link to="/services">Services</Link><Link to="/playbook">Playbook</Link><Link to="/work">Work</Link></div>
          <div><strong>Company</strong><Link to="/about">About</Link><Link to="/careers">Careers</Link><Link to="/contact">Contact</Link></div>
          <div><strong>Connect</strong><a href="mailto:hello@ekasolution.in">Email</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a><a href="#story-top">Back to top ↑</a></div>
        </div>
        <div className="story-footer-bottom"><span>© 2026 EKA Solution</span><span>Varanasi · India / Building globally</span></div>
      </footer>
    </div>
  );
}
