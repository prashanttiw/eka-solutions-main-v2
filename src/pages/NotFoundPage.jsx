import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import PageHeader from '../components/PageHeader';
export default function NotFoundPage() {
  return (
    <PageHeader
      eyebrow="404 / Page not found"
      title={
        <>
          Let’s get you
          <br />
          <span className="text-[var(--blue)]">back on track.</span>
        </>
      }
        lead="This page may have moved, or the address may be incorrect. Head to the homepage or contact EKA for help."
    >
      <div className="flex flex-wrap gap-4 mt-6">
        <Link to="/" className="btn-ink">
          Back to home
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        <Link to="/contact" className="editorial-link">
          Contact EKA
        </Link>
      </div>
    </PageHeader>
  );
}
