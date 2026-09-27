import React from 'react';

/*
 * Small interface sketches, one per capability. They are plain HTML and CSS rather than
 * screenshots or generated images: sharp at any size, a few hundred bytes each, and
 * clearly illustrative. None of them depicts a real client system.
 */

function Frame({ label, children, className = '' }) {
  return (
    <div className={`vg ${className}`.trim()} aria-hidden="true">
      <div className="vg-bar"><i /><i /><i /><span>{label}</span></div>
      <div className="vg-body">{children}</div>
    </div>
  );
}

export function PortalVignette() {
  return (
    <Frame label="portal.yourcompany.com" className="vg-portal">
      <div className="vg-head">
        <div><small>Request 1042</small><strong>Site survey, Unit 4B</strong></div>
        <span className="vg-pill vg-pill-blue">On track</span>
      </div>
      <ol className="vg-steps">
        <li className="done"><b />Received<em>Mon</em></li>
        <li className="done"><b />Reviewed<em>Tue</em></li>
        <li className="now"><b />Visit scheduled<em>Thu 10:00</em></li>
        <li><b />Report shared<em>—</em></li>
      </ol>
      <div className="vg-actions"><span className="vg-btn">Reschedule</span><span className="vg-btn vg-btn-ghost">Message the team</span></div>
    </Frame>
  );
}

export function BoardVignette() {
  const columns = [
    ['New', 2, ['Supplier invoice', 'Leave request']],
    ['Review', 3, ['Refund · ₹4,200', 'New vendor', 'Contract change']],
    ['Done', 1, ['Onboarding pack']],
  ];
  return (
    <Frame label="Operations · this week" className="vg-board">
      <div className="vg-columns">
        {columns.map(([name, count, cards], col) => (
          <div className="vg-col" key={name}>
            <p>{name}<span>{count}</span></p>
            {cards.map((card, i) => <span key={card} className={`vg-card ${col === 1 && i === 0 ? 'is-active' : ''}`}>{card}{col === 1 && i === 0 && <em>Needs approval</em>}</span>)}
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function AssistVignette() {
  return (
    <Frame label="Assisted reply" className="vg-assist">
      <div className="vg-head">
        <div><small>Customer email</small><strong>Where is my replacement part?</strong></div>
        <span className="vg-pill vg-pill-amber">Needs review</span>
      </div>
      <div className="vg-draft">
        <small>Suggested reply</small>
        <i style={{ width: '94%' }} /><i style={{ width: '86%' }} /><i style={{ width: '58%' }} />
      </div>
      <p className="vg-source">Based on: Order 2231 · Returns policy 4.2</p>
      <div className="vg-actions"><span className="vg-btn">Approve &amp; send</span><span className="vg-btn vg-btn-ghost">Edit</span></div>
    </Frame>
  );
}

export function PlatformVignette() {
  return (
    <Frame label="Service health" className="vg-platform">
      <div className="vg-head">
        <div><small>Checkout service</small><strong>All systems normal</strong></div>
        <span className="vg-pill vg-pill-green">Healthy</span>
      </div>
      <svg className="vg-chart" viewBox="0 0 300 90" preserveAspectRatio="none">
        <path d="M0 62 C20 58 32 66 50 60 S80 48 100 52 130 64 150 56 180 40 200 44 230 50 250 42 280 34 300 38 V90 H0Z" className="vg-area" />
        <path d="M0 62 C20 58 32 66 50 60 S80 48 100 52 130 64 150 56 180 40 200 44 230 50 250 42 280 34 300 38" className="vg-line" />
      </svg>
      <dl className="vg-stats">
        <div><dt>Response</dt><dd>182 ms</dd></div>
        <div><dt>Errors</dt><dd>0.02%</dd></div>
        <div><dt>Releases</dt><dd>3 today</dd></div>
      </dl>
    </Frame>
  );
}
