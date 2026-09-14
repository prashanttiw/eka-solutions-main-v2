import React from 'react';
import PageHeader from '../components/PageHeader';
import CaseStudies from '../components/CaseStudies';
import ProjectBook from '../components/ProjectBook';
import Testimonials from '../components/Testimonials';
import PageNav from '../components/PageNav';

const SECTIONS = [
  { id: 'work', label: 'Case studies' },
  { id: 'journal', label: 'The work book' },
  { id: 'testimonials', label: 'Testimonials' },
];

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work"
        variant="globe"
        title={
          <>
            The numbers are theirs,
            <br />
            <span className="text-[var(--blue)]">not ours.</span>
          </>
        }
        lead="Case studies taken from client dashboards, the full project book a spread at a time, and what the people who paid for it said afterwards. Every reference on this page will take a call."
        sections={SECTIONS}
      />

      <CaseStudies />
      <ProjectBook />
      <Testimonials />
      <PageNav />
    </>
  );
}
