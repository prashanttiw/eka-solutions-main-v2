import React, { useEffect, useRef, useState } from 'react';

// The six role titles are draft content restored for the owner's design review.
const ROLES = [
  { title: 'Staff Engineer, Platform', level: 'Staff', area: 'Engineering', detail: 'Shape the foundations that make complex products understandable and reliable.' },
  { title: 'AI Systems Engineer', level: 'Senior', area: 'Engineering', detail: 'Build and evaluate useful automation with clear boundaries and human review.' },
  { title: 'Site Reliability Engineer', level: 'Senior', area: 'Operations', detail: 'Help teams see, understand and improve how their systems behave in use.' },
  { title: 'Product Designer', level: 'Senior', area: 'Design', detail: 'Work close to the build, turning hard workflows into coherent experiences.' },
  { title: '3D & Motion Engineer', level: 'Mid–Senior', area: 'Creative technology', detail: 'Make expressive interfaces that still run well on ordinary devices.' },
  { title: 'Engineering Manager', level: 'Lead', area: 'Leadership', detail: 'Give teams the context, standards and space to do thoughtful work.' },
];

const PROCESS = [
  ['01', 'Introduction', 'A conversation about your work and what matters to you.'],
  ['02', 'The work', 'We look at a project or problem you know well.'],
  ['03', 'Mutual fit', 'We talk through expectations, collaboration and next steps.'],
];

function prepareApplication(role, form) {
  const subject = `EKA introduction — ${role?.title || 'Open introduction'}`;
  const body = [`Hello EKA,`, '', `I am interested in: ${role?.title || 'A future opportunity'}`, `Name: ${form.name.trim()}`, `Email: ${form.email.trim()}`, `Portfolio / profile: ${form.link.trim() || 'Not provided'}`, '', form.note.trim(), '', 'I will attach my CV or work samples in my email app.'].join('\n');
  return `mailto:contact@ekasolution.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function CareersPage() {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', link: '', note: '' });
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const cardTitleRef = useRef(null);

  useEffect(() => {
    if (selected) cardTitleRef.current?.focus();
  }, [selected]);

  const choose = (role) => {
    setSelected(role);
    setReady(false);
    setError('');
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

  return <div className="careers-page">
    <header className="careers-hero paper-surface section-pad"><div className="site-wrap"><p className="eyebrow"><span className="eyebrow-mark" /> Careers / People who care about the work</p><div className="careers-hero-grid"><h1 className="display-title">Good work takes <em>good company.</em></h1><p>We are drawn to people who ask careful questions, make complex things easier to use and keep learning after the launch.</p></div><div className="careers-hero-bottom"><span>Curiosity</span><span>Clarity</span><span>Craft</span></div></div></header>

    <section className="careers-main section-pad" id="openings"><div className="site-wrap"><div className="section-heading section-heading-split"><p className="eyebrow">01 / Roles in review</p><h2 className="display-title">Find the work that <em>sounds like you.</em></h2><p>These draft role listings are here for review. Availability and details will be confirmed before publication.</p></div>
      <div className="careers-layout"><div className="roles-column"><div className="roles-topline"><span>Role index</span><span>06 / Draft listings</span></div><div className="roles-list">{ROLES.map((role, index) => <button type="button" key={role.title} className={`role-row ${selected?.title === role.title ? 'selected' : ''}`} onClick={() => choose(role)} aria-controls="careers-card" aria-expanded={selected?.title === role.title}><span className="index-number">0{index + 1}</span><span className="role-row-main"><strong>{role.title}</strong><small>{role.area} / {role.level}</small></span><span className="role-row-arrow" aria-hidden="true">↗</span></button>)}</div><p className="roles-aside">Different background? <button type="button" onClick={() => choose({ title: 'Open introduction', area: 'Your area', level: 'Open' })}>Introduce yourself anyway ↗</button></p></div>
      <div className="career-card-wrap" id="careers-card"><div className={`career-card ${selected ? 'is-flipped' : ''} ${ready ? 'is-ready' : ''}`}><div className="career-card-face career-card-front" inert={Boolean(selected) || undefined}><div className="career-card-top"><span className="eyebrow">Hiring / A short guide</span><span aria-hidden="true">EKA—01</span></div><h3>First, let’s talk about the work.</h3><p className="career-card-intro">We care about how you think, what you make and what you want to get better at.</p><ol className="career-process">{PROCESS.map(([number, title, detail]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}</ol><span className="career-card-foot">Select a role to turn this card →</span></div>
      <div className="career-card-face career-card-back" inert={!selected || undefined}><div className="career-card-top"><span className="eyebrow">Introduction / {selected?.area || 'EKA'}</span><button type="button" onClick={() => { setSelected(null); setReady(false); }} aria-label="Close the application card">×</button></div><h3 ref={cardTitleRef} tabIndex={-1}>{selected?.title || 'Your introduction'}</h3>{!ready ? <form onSubmit={submit} noValidate className="career-form"><p>Tell us enough to start a useful conversation. Your email app will open so you can review the message and attach your CV.</p><div className="form-pair"><label>Full name <input name="name" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Email <input name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label></div><label>Portfolio or profile <span>Optional</span><input name="link" type="url" placeholder="https://" value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} /></label><label>A few words about your work <textarea name="note" rows="3" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit">Prepare introduction <span aria-hidden="true">↗</span></button></form> : <div className="career-ready" role="status"><p>Your introduction is ready. Open it in your email app, attach any CV or work sample you want to share, then send it yourself.</p><a className="button button-primary" href={prepareApplication(selected, form)}>Open email app <span aria-hidden="true">↗</span></a><button type="button" className="text-link" onClick={() => setReady(false)}>Edit your note <span aria-hidden="true">↶</span></button></div>}</div></div></div></div>
    </div></section>
    <section className="careers-close section-pad ink-section"><div className="site-wrap next-grid"><p className="eyebrow">A good introduction</p><h2 className="display-title">Show us something <em>you care about.</em></h2><p>A project, a decision, a difficult problem or a lesson learned. The context behind the work tells us more than a list of tools.</p></div></section>
  </div>;
}
