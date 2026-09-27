import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { PAGES } from '../site';
import { usePlayWhenVisible } from '../lib/playWhenVisible';
import { Arrow, Button, EMAIL } from './ui';
import { WhatsAppGlyph } from './WhatsAppFloat';
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp';

export default function Navbar() {
  const [menuPath, setMenuPath] = useState(null);
  const [lifted, setLifted] = useState(false);
  const { pathname } = useLocation();
  const menuOpen = menuPath === pathname;
  const buttonRef = useRef(null);
  const sentinelRef = useRef(null);
  const announceRef = usePlayWhenVisible();
  const close = () => setMenuPath(null);

  // The bar gains its shadow once the page has moved beneath it. A 1px sentinel at the top
  // of the document tells us that without listening to scroll events.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setLifted(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('site-menu-open', menuOpen);
    return () => document.body.classList.remove('site-menu-open');
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuPath(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <>
      {pathname !== '/founding-25' && (
        <Link ref={announceRef} className="announce play-scope" to="/founding-25">
          <span className="announce-dot" aria-hidden="true" />
          <strong>Founding 25</strong>
          <span className="announce-text">Our first 25 clients work directly with the founders.</span>
          <span className="announce-more">How it works<Arrow dir="right" /></span>
        </Link>
      )}
      <div ref={sentinelRef} className="nav-sentinel" aria-hidden="true" />
      <header className={`site-nav ${lifted ? 'is-lifted' : ''} ${menuOpen ? 'is-open' : ''}`}>
        <div className="wrap">
          <div className="site-nav-inner">
            <Link className="nav-brand" to="/" aria-label="EKA Solution home" onClick={close}>
              <img src="/brand/eka-symbol-small.webp" alt="" width="34" height="34" />
              <img src="/brand/eka-wordmark-small.webp" alt="EKA Solution" width="113" height="30" />
            </Link>
            <nav className="nav-desktop" aria-label="Primary navigation">
              {PAGES.filter(({ path }) => path !== '/').map(({ path, label }) => (
                <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'active' : undefined)}>{label}</NavLink>
              ))}
            </nav>
            <a className="nav-whatsapp" href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label={`Message EKA Solution on WhatsApp at ${WHATSAPP_DISPLAY}`}><WhatsAppGlyph /></a>
            <Button to="/contact" className="nav-cta">Start a project</Button>
            <button ref={buttonRef} type="button" className="nav-menu-button" aria-expanded={menuOpen} aria-controls="site-mobile-menu" onClick={() => setMenuPath(menuOpen ? null : pathname)}>
              {menuOpen ? 'Close' : 'Menu'}<span className="nav-menu-lines" aria-hidden="true" />
            </button>
          </div>
          {menuOpen && (
            <nav id="site-mobile-menu" className="nav-mobile" aria-label="All pages">
              {PAGES.map(({ path, label }) => (
                <NavLink key={path} to={path} end={path === '/'} onClick={close} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  {label}<Arrow dir="right" />
                </NavLink>
              ))}
              <Link className="nav-mobile-founding" to="/founding-25" onClick={close}>
                <span className="announce-dot" aria-hidden="true" />
                <span><strong>Founding 25</strong><small>Work directly with the founders</small></span>
                <Arrow dir="right" />
              </Link>
              <Button to="/contact" className="btn-block" onClick={close}>Start a project</Button>
              <p className="nav-mobile-contact">Prefer email? <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            </nav>
          )}
        </div>
      </header>
      {menuOpen && <button type="button" className="nav-backdrop" aria-label="Close menu" tabIndex={-1} onClick={close} />}
    </>
  );
}
