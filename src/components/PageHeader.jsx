import React from 'react';
import { Link } from 'react-router-dom';
import ArrowDownRight from 'lucide-react/dist/esm/icons/arrow-down-right';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

export default function PageHeader({
  eyebrow,
  title,
  lead,
  sections = [],
  children,
}) {
  return (
    <header className="editorial-masthead">
      <div className="site-container">
        <nav aria-label="Breadcrumb" className="editorial-breadcrumb">
          <Link to="/">EKA</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <div className="masthead-grid">
          <h1 className="text-hero editorial-title">{title}</h1>
          <div className="masthead-intro">
            {lead && <p>{lead}</p>}
            {children}
          </div>
        </div>
        {sections.length > 0 && (
          <nav aria-label="Sections on this page" className="section-index">
            <span className="editorial-label">Explore this page</span>
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`}>
                <span className="section-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.label}
                <ArrowDownRight size={15} aria-hidden="true" />
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
