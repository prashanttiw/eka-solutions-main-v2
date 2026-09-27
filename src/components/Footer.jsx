import React from 'react';
import { Link } from 'react-router-dom';

const EXPLORE = [['About', '/about'], ['Services', '/services'], ['Work', '/work'], ['Playbook', '/playbook']];
const CONNECT = [['Careers', '/careers'], ['Contact', '/contact']];

export default function Footer() {
  return <footer className="site-footer"><div className="site-wrap">
    <div className="footer-top"><div><p className="eyebrow">EKA Solution / Next chapter</p><h2>Good work starts with <em>a good question.</em></h2></div><Link className="button button-light" to="/contact">Ask yours <span aria-hidden="true">↗</span></Link></div>
    <div className="footer-main"><div className="footer-brand"><Link to="/" aria-label="EKA Solution home"><img src="/brand/eka-symbol-small.webp" alt="" width="38" height="38" loading="lazy" /><img src="/brand/eka-wordmark-small.webp" alt="EKA Solution" width="120" height="34" loading="lazy" /></Link><p>Making complicated work feel clearer.</p></div><nav aria-label="Footer explore"><span>Explore</span>{EXPLORE.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</nav><nav aria-label="Footer connect"><span>Connect</span>{CONNECT.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}<a href="mailto:contact@ekasolution.com">Email</a></nav></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} EKA Solution</span><span>Designed to be understood. Built to keep working.</span><a href="#top">Back to top ↑</a></div>
  </div></footer>;
}
