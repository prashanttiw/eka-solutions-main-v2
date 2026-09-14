import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Reveal from './Reveal';

export function TextLink({ to = '/contact', children, className = '' }) {
  return (
    <Link to={to} className={`editorial-link ${className}`}>
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}

export function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`editorial-section ${className}`}>
      <div className="site-container">{children}</div>
    </section>
  );
}

export function CallToAction({
  title = 'Have a project in mind?',
  body = 'Tell us what you want to build, improve, or simplify. We can work through the next steps together.',
  label = 'Start a conversation',
  to = '/contact',
}) {
  return (
    <Reveal className="editorial-cta">
      <div>
        <h2 className="font-display">{title}</h2>
        <p>{body}</p>
      </div>
      <Link to={to} className="btn-ink">
        {label}
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </Reveal>
  );
}
