import React from 'react';
import PageHeader from '../components/PageHeader';
import PageNav from '../components/PageNav';
import Careers from '../components/Careers';
export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title={
          <>
            Care about the craft?
            <br />
            <span className="text-[var(--blue)]">Let’s connect.</span>
          </>
        }
        lead="See the roles we are hiring for, understand how we work, and apply with the work you are proudest of."
        sections={[
          { id: 'careers', label: 'Open roles' },
          { id: 'careers-apply', label: 'How to apply' },
        ]}
      />
      <Careers standalone />
      <PageNav />
    </>
  );
}
