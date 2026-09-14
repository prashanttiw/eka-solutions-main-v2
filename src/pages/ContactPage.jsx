import React from 'react';
import PageHeader from '../components/PageHeader';
import PageNav from '../components/PageNav';
import ContactTerminal from '../components/ContactTerminal';
import FAQ from '../components/FAQ';
export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Your next chapter
            <br />
            <span className="text-[var(--blue)]">starts here.</span>
          </>
        }
        lead="Tell us what you want to build, improve, or simplify. You do not need a finished brief to start a useful conversation."
        sections={[
          { id: 'contact', label: 'Discuss a project' },
          { id: 'faq', label: 'Common questions' },
        ]}
      />
      <ContactTerminal standalone />
      <FAQ />
      <PageNav />
    </>
  );
}
