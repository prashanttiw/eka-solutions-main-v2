import React from 'react';
import { usePlayWhenVisible } from '../lib/playWhenVisible';

/*
 * Small interface sketches, one per capability. They are plain HTML and CSS rather than
 * screenshots, video or generated images: sharp at any size, a few hundred bytes each, and
 * clearly illustrative. None of them depicts a real client system.
 *
 * Each one plays a short looping story with CSS transforms and opacity only, and only while
 * it is on screen (see usePlayWhenVisible). With reduced motion they rest on a still frame.
 */

function Frame({ label, children, className = '' }) {
  const ref = usePlayWhenVisible();
  return (
    <div ref={ref} className={`vg play-scope ${className}`.trim()} aria-hidden="true">
      <div className="vg-bar"><i /><i /><i /><span>{label}</span></div>
      <div className="vg-body">{children}</div>
    </div>
  );
}

/** Two states in one grid cell; CSS crossfades between them. */
function Swap({ from, to, className = '' }) {
  return <span className={`vg-swap ${className}`.trim()}><span className="vg-from">{from}</span><span className="vg-to">{to}</span></span>;
}

function Cursor() {
  return (
    <svg className="vg-cursor" viewBox="0 0 20 22" width="20" height="22">
      <path d="M3 2l13 9.5-6 1.2 3.4 6.8-2.6 1.3-3.4-6.9L3 18z" fill="#12264a" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function Toast({ children }) {
  return <div className="vg-toast"><span className="vg-toast-tick" />{children}</div>;
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
        <li className="now step-3"><b />Site visit<em>Thu 10:00</em></li>
        <li className="step-4"><b />Report shared<Swap from="—" to="Fri 16:00" /></li>
        <li className="vg-ring" />
      </ol>
      <div className="vg-actions"><span className="vg-btn">Reschedule</span><span className="vg-btn vg-btn-ghost">Message the team</span></div>
      <Toast>Your survey report is ready</Toast>
    </Frame>
  );
}

export function BoardVignette() {
  return (
    <Frame label="Operations · this week" className="vg-board">
      <div className="vg-columns">
        <div className="vg-col">
          <p>New<span>2</span></p>
          <span className="vg-card">Supplier invoice</span>
          <span className="vg-card">Leave request</span>
        </div>
        <div className="vg-col">
          <p>Review<Swap from="3" to="2" /></p>
          <span className="vg-card is-active vg-mover">
            <span className="vg-card-text">Refund ₹4,200</span>
            <Swap className="vg-chip" from={<em>Pending</em>} to={<em className="is-ok">Approved</em>} />
          </span>
          <span className="vg-card">New vendor</span>
          <span className="vg-card">Credit note</span>
        </div>
        <div className="vg-col">
          <p>Done<Swap from="1" to="2" /></p>
          <span className="vg-card vg-shift">Onboarding</span>
        </div>
      </div>
    </Frame>
  );
}

export function AssistVignette() {
  return (
    <Frame label="Assisted reply" className="vg-assist">
      <div className="vg-head">
        <div><small>Customer email</small><strong>Where is my replacement part?</strong></div>
        <Swap className="vg-status" from={<span className="vg-pill vg-pill-amber">Needs review</span>} to={<span className="vg-pill vg-pill-green">Sent</span>} />
      </div>
      <div className="vg-draft">
        <small>Suggested reply</small>
        <i style={{ width: '94%' }} /><i style={{ width: '86%' }} /><i style={{ width: '58%' }} />
      </div>
      <p className="vg-source">Based on: Order 2231 · Returns policy 4.2</p>
      <div className="vg-actions">
        <span className="vg-btn vg-press">Approve &amp; send</span><span className="vg-btn vg-btn-ghost">Edit</span>
        <Cursor />
      </div>
      <Toast>Reply sent and logged to Order 2231</Toast>
    </Frame>
  );
}

const WAVE = 'M0 60C30 60 40 40 70 44S110 64 140 58 190 30 220 36 260 60 300 60C330 60 340 40 370 44S410 64 440 58 490 30 520 36 560 60 600 60';

export function PlatformVignette() {
  return (
    <Frame label="Service health" className="vg-platform">
      <div className="vg-head">
        <div><small>Checkout service</small><strong>All systems normal</strong></div>
        <span className="vg-pill vg-pill-green vg-live"><i />Healthy</span>
      </div>
      <div className="vg-chart">
        <svg viewBox="0 0 600 90" preserveAspectRatio="none">
          <path d={`${WAVE}V90H0Z`} className="vg-area" />
          <path d={WAVE} className="vg-line" />
        </svg>
      </div>
      <dl className="vg-stats">
        <div><dt>Response</dt><dd>182 ms</dd></div>
        <div><dt>Errors</dt><dd>0.02%</dd></div>
        <div><dt>Releases</dt><dd><Swap from="3 today" to="4 today" /></dd></div>
      </dl>
      <Toast>Release 4 shipped with no errors</Toast>
    </Frame>
  );
}
