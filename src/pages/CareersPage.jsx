import React, { useEffect, useRef, useState } from 'react';
import { Arrow, Button, ClosingCta, EMAIL, Eyebrow } from '../components/ui';

// The six role titles are draft content restored for the owner's design review.
const ROLES = [
  { title: 'Staff Engineer, Platform', level: 'Staff', area: 'Engineering' },
  { title: 'AI Systems Engineer', level: 'Senior', area: 'Engineering' },
  { title: 'Site Reliability Engineer', level: 'Senior', area: 'Operations' },
  { title: 'Product Designer', level: 'Senior', area: 'Design' },
  { title: '3D & Motion Engineer', level: 'Mid–Senior', area: 'Creative technology' },
  { title: 'Engineering Manager', level: 'Lead', area: 'Leadership' },
];

const PROCESS = [
  ['Introduction', 'A conversation about your work and what matters to you.'],
  ['The work', 'We look together at a project or problem you know well.'],
  ['Mutual fit', 'We talk through expectations, collaboration and next steps.'],
];

const OPEN_INTRO = { title: 'Open introduction', area: 'Any discipline', level: 'Open' };

function prepareApplication(role, form) {
  const subject = `EKA introduction — ${role?.title || 'Open introduction'}`;
  const body = ['Hello EKA,', '', `I am interested in: ${role?.title || 'A future opportunity'}`, `Name: ${form.name.trim()}`, `Email: ${form.email.trim()}`, `Portfolio / profile: ${form.link.trim() || 'Not provided'}`, '', form.note.trim(), '', 'I will attach my CV or work samples in my email app.'].join('\n');
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function CareersPage() {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', link: '', note: '' });
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const cardTitleRef = useRef(null);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  useEffect(() => {
    if (selected) cardTitleRef.current?.focus({ preventScroll: true });
  }, [selected]);

  const choose = (role) => {
    setSelected(role);
    setReady(false);
    setError('');
    // On a single-column layout the card sits below the list; bring it into view.
    if (window.matchMedia('(max-width: 1080px)').matches) {
      document.getElementById('careers-card')?.scrollIntoView({ block: 'start' });
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Add your name and a valid email so we can reply.');
      return;
    }
    if (!form.note.trim()) {
      setError('Tell us a little about the work you would like to share.');
      return;
    }
    setError('');
    setReady(true);
  };

  return (
    <div className="careers-page">
      <header className="page-hero">
        <div className="wrap page-hero-grid">
          <div>
            <Eyebrow>Careers</Eyebrow>
            <h1 className="h-display">Good work takes <em>good company.</em></h1>
          </div>
          <div className="page-hero-aside">
            <p className="lede">We are drawn to people who ask careful questions, make complex things easier to use and keep learning after the launch.</p>
          </div>
        </div>
      </header>

      <section className="section tone-sunken" id="openings" aria-labelledby="roles-title">
        <div className="wrap">
          <div className="split-head">
            <div>
              <Eyebrow>Roles</Eyebrow>
              <h2 id="roles-title" className="h-section">Find the work that <em>sounds like you.</em></h2>
            </div>
            <p className="body">Choose a role and the card on the right turns into a short introduction you send from your own email.</p>
          </div>
          <p className="draft-note">Draft listings for review. Availability and details are not yet confirmed.</p>

          <div className="careers-layout">
            <div className="roles-column">
              <div className="roles-list">
                {ROLES.map((role) => (
                  <button type="button" key={role.title} className={`role-row ${selected?.title === role.title ? 'selected' : ''}`} onClick={() => choose(role)} aria-controls="careers-card" aria-expanded={selected?.title === role.title}>
                    <span className="role-row-main"><strong>{role.title}</strong><small>{role.area} · {role.level}</small></span>
                    <span className="role-row-arrow" aria-hidden="true"><Arrow dir="right" /></span>
                  </button>
                ))}
              </div>
              <p className="roles-aside">Different background?<button type="button" onClick={() => choose(OPEN_INTRO)}>Introduce yourself anyway</button></p>
            </div>

            <div className="career-card-wrap" id="careers-card">
              <div className={`career-card ${selected ? 'is-flipped' : ''} ${ready ? 'is-ready' : ''}`}>
                <div className="career-card-face career-card-front" inert={Boolean(selected) || undefined}>
                  <div className="career-card-top"><Eyebrow>How hiring works</Eyebrow></div>
                  <h3>First, let’s talk about the work.</h3>
                  <p className="career-card-intro">We care about how you think, what you make and what you want to get better at.</p>
                  <ol className="career-process">
                    {PROCESS.map(([title, detail], index) => <li key={title}><span>{index + 1}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}
                  </ol>
                  <span className="career-card-foot">Choose a role to begin <Arrow dir="right" /></span>
                </div>

                <div className="career-card-face career-card-back" inert={!selected || undefined}>
                  <div className="career-card-top">
                    <Eyebrow>{selected?.area || 'Introduction'}</Eyebrow>
                    <button type="button" className="career-card-close" onClick={() => { setSelected(null); setReady(false); }} aria-label="Close the introduction card">×</button>
                  </div>
                  <h3 ref={cardTitleRef} tabIndex={-1}>{selected?.title || 'Your introduction'}</h3>
                  {!ready ? (
                    <form onSubmit={submit} noValidate className="career-form">
                      <p>Enough to start a useful conversation. Your email app opens next so you can review the message and attach a CV.</p>
                      <div className="form-pair">
                        <label className="field">Full name<input name="name" autoComplete="name" value={form.name} onChange={update('name')} required /></label>
                        <label className="field">Email<input name="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} required /></label>
                      </div>
                      <label className="field"><span className="field-label">Portfolio or profile<span className="field-hint">Optional</span></span><input name="link" type="url" placeholder="https://" value={form.link} onChange={update('link')} /></label>
                      <label className="field">A few words about your work<textarea name="note" rows="3" value={form.note} onChange={update('note')} required /></label>
                      {error && <p className="form-error" role="alert">{error}</p>}
                      <Button type="submit" className="btn-block" dir="right">Prepare introduction</Button>
                    </form>
                  ) : (
                    <div className="career-ready" role="status">
                      <p>Your introduction is ready. Open it in your email app, attach any CV or work sample, then send it yourself.</p>
                      <Button href={prepareApplication(selected, form)}>Open email app</Button>
                      <button type="button" className="text-link" onClick={() => setReady(false)}><Arrow dir="back" /><span>Edit your note</span></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta eyebrow="A good introduction" title={<>Show us something <em>you care about.</em></>} action="Choose a role" to="#openings">
        A project, a decision, a difficult problem or a lesson learned. The context behind the work tells us more than a list of tools.
      </ClosingCta>
    </div>
  );
}
