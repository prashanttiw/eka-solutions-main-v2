import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../lib/services';
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp';
import { EMAIL } from './ui';

const COMPANY = [['About', '/about'], ['Work', '/work'], ['Playbook', '/playbook'], ['Founding 25', '/founding-25'], ['Careers', '/careers']];

/**
 * A quiet footer: the page's own closing card has already made the invitation, so this is
 * orientation only — who we are, where to go, and how to reach a person.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" aria-label="EKA Solution home">
              <span className="footer-mark"><img src="/brand/eka-symbol-small.webp" alt="" width="32" height="27" loading="lazy" /></span>
              <img className="footer-wordmark" src="/brand/eka-wordmark-small.webp" alt="EKA Solution" width="118" height="31" loading="lazy" />
            </Link>
            <p>A design and engineering studio for websites, applications and the systems behind them.</p>
          </div>
          <div className="footer-reach">
            <span>Say hello</span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>

        <div className="footer-main">
          <div>
            <h2>Company</h2>
            <ul>{COMPANY.map(([label, path]) => <li key={path}><Link to={path}>{label}</Link></li>)}</ul>
          </div>
          <div>
            <h2>Services</h2>
            <ul>{SERVICES.map((service) => <li key={service.id}><Link to={`/services#${service.id}`}>{service.title}</Link></li>)}</ul>
          </div>
          <div>
            <h2>Contact</h2>
            <ul>
              <li><Link to="/contact">Start a project</Link></li>
              <li><a href={`mailto:${EMAIL}`}>Email</a></li>
              <li><a href={whatsappHref()} target="_blank" rel="noopener noreferrer">WhatsApp {WHATSAPP_DISPLAY}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} EKA Solution</span>
          <span>Designed and built in-house.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
