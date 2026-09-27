import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Arrow, Button, EMAIL, Eyebrow } from '../components/ui';
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp';

const START = { name: '', email: '', company: '', subject: '', context: '', timing: '' };

const AFTER = [
  ['We listen', 'A short call about the situation, the people involved and what is at stake.'],
  ['We name the decision', 'We write back with what we heard and the question the project needs to answer.'],
  ['We suggest a first step', 'A small, practical next move you can act on straight away.'],
];

function makeEmail(form, founding) {
  const subject = `${founding ? 'Founding 25 application' : 'Project conversation'} — ${form.subject.trim() || 'New enquiry'}`;
  const body = [
    'Hello EKA,',
    '',
    `I am ${form.name.trim()} (${form.email.trim()}).`,
    ...(founding ? ['', 'I would like to apply for one of the Founding 25 places.', `Company or website: ${form.company.trim() || 'Not provided'}`] : []),
    '',
    `What I am working on: ${form.subject.trim() || 'Not specified'}`,
    '',
    'The situation:',
    form.context.trim(),
    '',
    `Timing: ${form.timing.trim() || 'To discuss'}`,
  ].join('\n');
  return { text: body, href: `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(START);
  const [founding, setFounding] = useState(searchParams.get('founding') === '1');
  const [review, setReview] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const email = makeEmail(form, founding);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const prepare = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !form.context.trim()) {
      setError('Add your name, a valid email and a short description of the situation.');
      return;
    }
    setError('');
    setCopied(false);
    setReview(true);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(email.text); setCopied(true); } catch { setCopied(false); }
  };

  return (
    <div className="contact-page">
      <header className="page-hero">
        <div className="wrap page-hero-grid">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h1 className="h-display">Bring the rough version <em>first.</em></h1>
          </div>
          <div className="page-hero-aside">
            <p className="lede">Half-formed is fine. Tell us what is happening, who it affects and what you hope could be different.</p>
          </div>
        </div>
      </header>

      <section className="section tone-sunken" aria-labelledby="note-title">
        <div className="wrap contact-grid">
          <aside className="contact-aside">
            <Eyebrow>Start a conversation</Eyebrow>
            <h2 id="note-title" className="h-section">A useful note beats a perfect brief.</h2>
            <p className="body">We will help frame the problem together. The form prepares an email in your own app, so you can read it before anything is sent.</p>
            <ul className="contact-direct">
              <li><a href={`mailto:${EMAIL}`}><span><small>Email</small><strong>{EMAIL}</strong></span><Arrow /></a></li>
              <li><a href={whatsappHref()} target="_blank" rel="noopener noreferrer"><span><small>WhatsApp</small><strong>{WHATSAPP_DISPLAY}</strong></span><Arrow /></a></li>
            </ul>
          </aside>

          <div className="contact-sheet card">
            {!review ? (
              <form onSubmit={prepare} noValidate>
                <h3 className="h-card">Tell us what is on your mind.</h3>
                <label className={`founding-toggle ${founding ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={founding} onChange={(event) => setFounding(event.target.checked)} />
                  <span className="founding-toggle-box" aria-hidden="true" />
                  <span><strong>Apply for a Founding 25 place</strong><small>A founder reads your note and replies personally. <Link to="/founding-25">What is included</Link></small></span>
                </label>
                <div className="form-pair">
                  <label className="field">Your name<input name="name" value={form.name} autoComplete="name" onChange={update('name')} required /></label>
                  <label className="field">Email address<input type="email" name="email" value={form.email} autoComplete="email" onChange={update('email')} required /></label>
                </div>
                {founding && <label className="field"><span className="field-label">Company or website<span className="field-hint">Optional</span></span><input name="company" autoComplete="organization" placeholder="So we can read up before we reply" value={form.company} onChange={update('company')} /></label>}
                <label className="field">What are you working on?<input name="subject" placeholder="A short working title is enough" value={form.subject} onChange={update('subject')} /></label>
                <label className="field">What is happening now?<textarea name="context" rows="6" placeholder="Where is the friction? What would you like to change?" value={form.context} onChange={update('context')} required /></label>
                <label className="field"><span className="field-label">Timing<span className="field-hint">Optional</span></span><input name="timing" placeholder="To discuss, or a rough date" value={form.timing} onChange={update('timing')} /></label>
                {error && <p className="form-error" role="alert">{error}</p>}
                <Button type="submit" className="btn-block" dir="right">{founding ? 'Review your application' : 'Review your note'}</Button>
              </form>
            ) : (
              <div className="contact-review">
                <h3 className="h-card">Ready to open in your email app.</h3>
                <p>Read it once, change anything you like, then send it from your own account.</p>
                <pre>{email.text}</pre>
                <div className="actions">
                  <Button href={email.href}>Open email app</Button>
                  <Button variant="ghost" dir="right" onClick={copy}>{copied ? 'Copied' : 'Copy note'}</Button>
                </div>
                <button type="button" className="text-link" onClick={() => setReview(false)}><Arrow dir="back" /><span>Edit the note</span></button>
              </div>
            )}
            <p className="contact-sheet-note">Nothing is sent from this page. It stays private until you send it yourself.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="after-title">
        <div className="wrap">
          <div className="intro-block">
            <Eyebrow>After you say hello</Eyebrow>
            <h2 id="after-title" className="h-section">What happens <em>next.</em></h2>
          </div>
          <ol className="after-hello">
            {AFTER.map(([title, text], index) => <li className="card" key={title}><span>{index + 1}</span><strong>{title}</strong><p>{text}</p></li>)}
          </ol>
        </div>
      </section>
    </div>
  );
}
