import React from 'react';
import { ClosingCta, Eyebrow } from '../components/ui';
import { STAGES } from '../lib/stages';


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
