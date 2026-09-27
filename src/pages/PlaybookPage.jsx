import React from 'react';
import { Link } from 'react-router-dom';

const STAGES = [
  { number: '01', verb: 'Understand', line: 'Find the real problem.', text: 'We listen to the people involved, trace the current path and name the decision the project needs to make possible.', output: 'A shared picture of the situation' },
  { number: '02', verb: 'Frame', line: 'Choose a useful first move.', text: 'We compare possible approaches, make assumptions visible and agree on what the first release needs to prove.', output: 'A clear scope and working direction' },
  { number: '03', verb: 'Build', line: 'Work in reviewable pieces.', text: 'Design and engineering move together. Each slice is small enough to examine and real enough to learn from.', output: 'Working software and visible decisions' },
  { number: '04', verb: 'Learn', line: 'See what happened in use.', text: 'We check the experience with the people who rely on it, tidy the handover and identify the next useful change.', output: 'A sensible next step' },
];

export default function PlaybookPage() {
  return <div className="playbook-page">
    <header className="playbook-hero paper-surface section-pad"><div className="site-wrap"><p className="eyebrow"><span className="eyebrow-mark" /> Playbook / A working route</p><div className="playbook-hero-grid"><h1 className="display-title">Make the next step <em>a better one.</em></h1><div><span className="playbook-hero-number" aria-hidden="true">04</span><p>Four stages. Each one leaves something useful behind and removes a little uncertainty from the next.</p></div></div></div></header>
    <section className="playbook-contents"><div className="site-wrap"><p className="eyebrow">Inside this page</p><nav aria-label="Playbook stages">{STAGES.map((stage) => <a href={`#stage-${stage.number}`} key={stage.number}><span>{stage.number}</span>{stage.verb}<span aria-hidden="true">↘</span></a>)}</nav></div></section>
    <div className="playbook-stages">{STAGES.map((stage) => <section className="playbook-stage section-pad" id={`stage-${stage.number}`} key={stage.number}><div className="site-wrap playbook-stage-grid"><div className="stage-marker"><span>{stage.number}</span><div aria-hidden="true" /></div><div><p className="eyebrow">{stage.line}</p><h2 className="display-title">{stage.verb}<span className="stage-period">.</span></h2><p className="section-lede">{stage.text}</p><div className="stage-output"><span>What it leaves behind</span><strong>{stage.output}</strong></div></div></div></section>)}</div>
    <section className="section-pad playbook-end ink-section"><div className="site-wrap next-grid"><p className="eyebrow">Start here</p><h2 className="display-title">Your first note can be <em>unfinished.</em></h2><div><p>You do not need a perfect brief. The first conversation is where we begin to make the work clear.</p><Link className="button button-light" to="/contact">Tell us the situation <span aria-hidden="true">↗</span></Link></div></div></section>
  </div>;
}
