import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { PAGES } from '../site';
import { Arrow, Button, EMAIL } from './ui';

const MENU_LINKS = PAGES;

export default function Navbar() {
  const [menuPath, setMenuPath] = useState(null);
  const { pathname } = useLocation();
  const menuOpen = menuPath === pathname;
  const buttonRef = useRef(null);
  const close = () => setMenuPath(null);

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
    <header className="site-nav">
      <div className="wrap site-nav-inner">
        <Link className="nav-brand" to="/" aria-label="EKA Solution home" onClick={close}>
          <img src="/brand/eka-symbol-small.webp" alt="" width="34" height="34" />
          <img src="/brand/eka-wordmark-small.webp" alt="EKA Solution" width="113" height="30" />
        </Link>
        <nav className="nav-desktop" aria-label="Primary navigation">
          {PAGES.filter(({ path }) => path !== '/').map(({ path, label }) => (
            <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'active' : undefined)}>{label}</NavLink>
          ))}
        </nav>
        <Button to="/contact" className="nav-cta">Start a project</Button>
        <button ref={buttonRef} type="button" className="nav-menu-button" aria-expanded={menuOpen} aria-controls="site-mobile-menu" onClick={() => setMenuPath(menuOpen ? null : pathname)}>
          {menuOpen ? 'Close' : 'Menu'}<span className="nav-menu-lines" aria-hidden="true" />
        </button>
      </div>
      {menuOpen && (
        <nav id="site-mobile-menu" className="nav-mobile" aria-label="All pages">
          <div className="wrap">
            {MENU_LINKS.map(({ path, label }) => (
              <NavLink key={path} to={path} end={path === '/'} onClick={close} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {label}<Arrow dir="right" />
              </NavLink>
            ))}
            <Button to="/contact" className="btn-block" onClick={close}>Start a project</Button>
            <p className="nav-mobile-contact">Prefer email? <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          </div>
        </nav>
      )}
    </header>
  );
}
