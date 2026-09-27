import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CONTACT, PAGES } from '../site';

const LINKS = [...PAGES, CONTACT];

export default function Navbar() {
  const [menuPath, setMenuPath] = useState(null);
  const { pathname } = useLocation();
  const menuOpen = menuPath === pathname;
  const buttonRef = useRef(null);

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

  return <header className="site-nav">
    <div className="site-wrap site-nav-inner">
      <Link className="nav-brand" to="/" aria-label="EKA Solution home" onClick={() => setMenuPath(null)}><img className="nav-symbol" src="/brand/eka-symbol-small.webp" alt="" width="34" height="34" /><img src="/brand/eka-wordmark-small.webp" alt="EKA Solution" width="113" height="30" /></Link>
      <nav className="nav-desktop" aria-label="Primary navigation">{PAGES.filter(({ path }) => path !== '/').map(({ path, label }) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'active' : undefined}>{label}</NavLink>)}</nav>
      <Link className="nav-contact" to="/contact">Start a project <span aria-hidden="true">↗</span></Link>
      <button ref={buttonRef} type="button" className="nav-menu-button" aria-expanded={menuOpen} aria-controls="site-mobile-menu" onClick={() => setMenuPath(menuOpen ? null : pathname)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '×' : '+'}</span></button>
    </div>
    {menuOpen && <nav id="site-mobile-menu" className="nav-mobile" aria-label="All pages"><div className="site-wrap"><p className="eyebrow">Index / EKA Solution</p>{LINKS.map(({ path, label }, index) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMenuPath(null)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong><em aria-hidden="true">↗</em></NavLink>)}</div></nav>}
  </header>;
}
