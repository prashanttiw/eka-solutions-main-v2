import React from 'react';
import { ClosingCta, Eyebrow, TextLink } from '../components/ui';
import { VIGNETTES } from '../components/vignetteList';
import { SERVICES } from '../lib/services';

export default function ServicesPage() {
  return (
    <div className="services-page">
      <header className="page-hero">
        <div className="wrap">
          <div className="page-hero-grid">
            <div>
              <Eyebrow>Services</Eyebrow>
              <h1 className="h-display">Build what the work <em>actually needs.</em></h1>
            </div>
            <div className="page-hero-aside">
              <p className="lede">A product, a business process and the platform underneath it are often the same problem seen from different angles.</p>
            </div>
          </div>
          <nav aria-label="Services on this page">
            <ul className="anchor-pills">
              {SERVICES.map((service, index) => <li key={service.id}><a href={`#${service.id}`}><span>{index + 1}</span>{service.title}</a></li>)}
            </ul>
          </nav>
        </div>
      </header>

      <div className="chapters">
        {SERVICES.map((service, index) => {
          const Vignette = VIGNETTES[index];
          return (
            <section id={service.id} className="chapter section" key={service.id} aria-labelledby={`${service.id}-title`}>
              <div className="wrap chapter-grid">
                <div className="chapter-copy">
                  <Eyebrow>{service.prompt}</Eyebrow>
                  <h2 id={`${service.id}-title`} className="h-section">{service.title}</h2>
                  <p className="lede">{service.description}</p>
                  <ul className="tag-list" aria-label={`Typical ${service.name} work`}>
                    {service.examples.map((example) => <li key={example}>{example}</li>)}
                  </ul>
                  <TextLink to="/contact">Discuss a project like this</TextLink>
                </div>
                <div className="chapter-visual"><Vignette /></div>
              </div>
            </section>
          );
        })}
      </div>

      <ClosingCta eyebrow="Not sure which one?" title={<>Start with the situation, <em>not a package.</em></>} action="Discuss a project">
        Tell us where the friction is. We will work out together which of these belong in the answer.
      </ClosingCta>
    </div>
  );
}
