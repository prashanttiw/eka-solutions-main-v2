import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="notfound-page paper-surface section-pad"><div className="site-wrap"><p className="eyebrow">404 / Off the map</p><h1 className="display-title">This path does not <em>go anywhere.</em></h1><p>Try the homepage, or tell us what you were looking for.</p><div className="hero-actions"><Link className="button button-primary" to="/">Back to home <span aria-hidden="true">↗</span></Link><Link className="text-link" to="/contact">Contact EKA <span aria-hidden="true">↗</span></Link></div></div></div>;
}
