import React from 'react';
import { Arrow, ClosingCta, Eyebrow } from '../components/ui';
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
          <nav className="page-index" aria-label="Stages on this page">
            <ul>
              {STAGES.map((stage) => <li key={stage.number}><a href={`#stage-${stage.number}`}>{stage.verb}<Arrow dir="down" /></a></li>)}
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
                <h2 id={`stage-${stage.number}-title`} className="h-section">{stage.verb}</h2>
                <p className="stage-line">{stage.line}</p>
                <p className="lede">{stage.text}</p>
                <div className="stage-detail">
                  <div className="stage-questions">
                    <h3>Questions we ask</h3>
                    <ul>{stage.questions.map((question) => <li key={question}>{question}</li>)}</ul>
                  </div>
                  <div className="stage-keep">
                    <h3>What you keep</h3>
                    <p>{stage.output}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <ClosingCta eyebrow="Start here" title={<>Stage one is <em>a conversation.</em></>} action="Tell us the situation">
        You do not need a perfect brief. Tell us what is happening; we listen first, then write back with what we heard.
      </ClosingCta>
    </div>
  );
}
