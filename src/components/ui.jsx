import React from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp';

export const EMAIL = 'contact@ekasolution.com';

const PATHS = {
  up: 'M5 11 11 5M6 5h5v5',
  down: 'M8 3v10M4 9l4 4 4-4',
  right: 'M3 8h10M9 4l4 4-4 4',
  back: 'M13 8H3M7 4 3 8l4 4',
};

/** One stroke icon set, drawn at 16px so it sits on the text baseline. */
export function Arrow({ dir = 'up' }) {
  return (
    <svg className="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d={PATHS[dir]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Pill button with an arrow chip. On hover the arrow leaves and a copy arrives from the
 * opposite corner; both moves are transforms only, so they cost nothing to paint.
 */
export function Button({ to, href, variant = 'primary', dir = 'up', children, className = '', ...rest }) {
  const content = (
    <>
      <span className="btn-label">{children}</span>
      <span className="btn-chip" data-dir={dir} aria-hidden="true"><Arrow dir={dir} /><Arrow dir={dir} /></span>
    </>
  );
  const classes = `btn btn-${variant} ${className}`.trim();
  if (to) return <Link to={to} className={classes} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...rest}>{content}</a>;
  return <button type="button" className={classes} {...rest}>{content}</button>;
}

export function TextLink({ to, href, dir = 'right', children, className = '', ...rest }) {
  const content = <><span>{children}</span><Arrow dir={dir} /></>;
  const classes = `text-link ${className}`.trim();
  if (to) return <Link to={to} className={classes} {...rest}>{content}</Link>;
  return <a href={href} className={classes} {...rest}>{content}</a>;
}

export function Eyebrow({ children, className = '' }) {
  return <p className={`eyebrow ${className}`.trim()}>{children}</p>;
}

/**
 * Every page closes on the same kind of object: a blue card sitting on the paper, so the
 * invitation is unmistakable and the navy footer below it reads as a separate place.
 */
export function ClosingCta({ eyebrow = 'Next step', title, children, action = 'Start a conversation', to = '/contact' }) {
  return (
    <section className="closing" aria-label={eyebrow}>
      <div className="wrap">
        <div className="closing-card">
          <div className="closing-copy">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="h-section">{title}</h2>
            <p>{children}</p>
          </div>
          <div className="closing-actions">
            <Button {...(to.startsWith('/') ? { to } : { href: to })} variant="light" dir={to.startsWith('#') ? 'down' : 'up'}>{action}</Button>
            <p className="closing-alt">
              <span>Or write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a></span>
              <span>or message <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a> on WhatsApp</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
