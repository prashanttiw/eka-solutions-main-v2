import React from 'react';
import { Arrow, ClosingCta, Eyebrow, TextLink } from '../components/ui';
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
          <nav className="page-index" aria-label="Services on this page">
            <ul>
              {SERVICES.map((service) => <li key={service.id}><a href={`#${service.id}`}>{service.title}<Arrow dir="down" /></a></li>)}
            </ul>
          </nav>
        </div>
      </header>

      <div className="chapters">
        {SERVICES.map((service, index) => {
          const Vignette = VIGNETTES[index];
          return (
            <section id={service.id} className={`chapter section ${index % 2 ? 'tone-sunken' : ''}`.trim()} key={service.id} aria-labelledby={`${service.id}-title`}>
              <div className="wrap chapter-grid">
                <div className="chapter-copy">
                  <p className="chapter-prompt">{service.prompt}</p>
                  <h2 id={`${service.id}-title`} className="h-section">{service.title}</h2>
                  <p className="lede">{service.description}</p>
                  <div className="examples">
                    <h3>Typical work</h3>
                    <ul aria-label={`Typical ${service.name} work`}>
                      {service.examples.map((example) => <li key={example}>{example}</li>)}
                    </ul>
                  </div>
                  <TextLink to="/contact">Discuss a project like this</TextLink>
                </div>
                <figure className="chapter-figure">
                  <div className="chapter-visual"><Vignette /></div>
                  <figcaption><span>Illustrative</span> {service.figure}</figcaption>
                </figure>
              </div>
            </section>
          );
        })}
      </div>

      <ClosingCta eyebrow="Not sure which one?" title={<>Most projects need <em>two or three</em> of these.</>} action="Discuss a project">
        Tell us where the friction is. We will work out together which parts belong in the answer.
      </ClosingCta>
    </div>
  );
}
