import React from 'react';
import { ClosingCta, Eyebrow } from '../components/ui';

const STAGES = [
  {
    number: '1',
    verb: 'Understand',
    line: 'Find the real problem.',
    text: 'We listen to the people involved, trace how the work happens today and name the decision the project needs to make easier.',
    questions: ['Who feels this problem, and when?', 'What happens today, step by step?', 'What would “better” look like in a month?'],
    output: 'A shared, written picture of the situation',
  },
  {
    number: '2',
    verb: 'Frame',
    line: 'Choose a useful first move.',
    text: 'We compare possible approaches, make the assumptions visible and agree on what the first release needs to prove.',
    questions: ['What is the smallest release that helps?', 'Which assumptions carry the most risk?', 'What are we deliberately leaving out?'],
    output: 'A clear scope, plan and working direction',
  },
  {
    number: '3',
    verb: 'Build',
    line: 'Work in reviewable pieces.',
    text: 'Design and engineering move together. Each piece is small enough to examine and real enough to learn from.',
    questions: ['Can you try it this week?', 'Does it hold up on real devices and data?', 'Is every decision written down?'],
    output: 'Working software you have already used',
  },
  {
    number: '4',
    verb: 'Learn',
    line: 'See what happens in use.',
    text: 'We check the result with the people who rely on it, tidy the handover and identify the next useful change.',
    questions: ['Is it being used the way we expected?', 'Can your team run and change it?', 'What should come next, if anything?'],
    output: 'A clean handover and a sensible next step',
  },
];

export default function PlaybookPage() {
  return (
    <div className="playbook-page">
      <header className="page-hero">
        <div className="wrap">
          <div className="page-hero-grid">
            <div>
              <Eyebrow>Playbook</Eyebrow>
              <h1 className="h-display">Make the next step <em>a better one.</em></h1>
            </div>
            <div className="page-hero-aside">
              <p className="lede">Four stages. Each one leaves something useful behind and removes a little uncertainty from the next.</p>
            </div>
          </div>
          <nav aria-label="Stages on this page">
            <ul className="anchor-pills">
              {STAGES.map((stage) => <li key={stage.number}><a href={`#stage-${stage.number}`}><span>{stage.number}</span>{stage.verb}</a></li>)}
            </ul>
          </nav>
        </div>
      </header>

      <div className="stages">
        {STAGES.map((stage) => (
          <section className="stage section" id={`stage-${stage.number}`} key={stage.number} aria-labelledby={`stage-${stage.number}-title`}>
            <div className="wrap stage-grid">
              <span className="stage-num" aria-hidden="true">{stage.number}</span>
              <div className="stage-copy">
                <Eyebrow>{stage.line}</Eyebrow>
                <h2 id={`stage-${stage.number}-title`} className="h-section">{stage.verb}</h2>
                <p className="lede">{stage.text}</p>
                <div className="stage-detail">
                  <div className="card">
                    <h3>Questions we ask</h3>
                    <ul>{stage.questions.map((question) => <li key={question}>{question}</li>)}</ul>
                  </div>
                  <div className="card stage-output">
                    <h3>What it leaves behind</h3>
                    <p>{stage.output}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <ClosingCta eyebrow="Start here" title={<>Your first note can be <em>unfinished.</em></>} action="Tell us the situation">
        You do not need a perfect brief. The first conversation is where we begin to make the work clear.
      </ClosingCta>
    </div>
  );
}
