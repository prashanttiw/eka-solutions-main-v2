import React from 'react';
import PageHeader from '../components/PageHeader';
import PageNav from '../components/PageNav';
import Playbook from '../components/Playbook';
import EngineeringStandards from '../components/EngineeringStandards';
import Engagement from '../components/Engagement';
export default function PlaybookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Playbook"
        title={
          <>
            A clear path.
            <br />
            <span className="text-[var(--blue)]">From idea to launch.</span>
          </>
        }
        lead="Understand the goal, agree on a plan, and review the work as it takes shape. Here is how we approach the journey together."
        sections={[
          { id: 'playbook', label: 'The process' },
          { id: 'standards', label: 'Our priorities' },
          { id: 'engagement', label: 'Ways to work together' },
        ]}
      />
      <Playbook />
      <EngineeringStandards />
      <Engagement />
      <PageNav />
    </>
  );
}
