import React from 'react';
import PageHeader from '../components/PageHeader';
import PageNav from '../components/PageNav';
import About from '../components/About';
import PointOfView from '../components/PointOfView';
export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={
          <>
            Thoughtful technology.
            <br />
            <span className="text-[var(--blue)]">Human at heart.</span>
          </>
        }
        lead="Meet EKA: a company bringing design and engineering together to make software more useful for people and businesses."
        sections={[
          { id: 'about', label: 'About EKA' },
          { id: 'point-of-view', label: 'Our principles' },
        ]}
      />
      <About />
      <PointOfView />
      <PageNav />
    </>
  );
}
