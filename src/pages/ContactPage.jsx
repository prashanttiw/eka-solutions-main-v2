import React, { useState } from 'react';

const START = { name: '', email: '', subject: '', context: '', timing: '' };

function makeEmail(form) {
  const subject = `Project conversation — ${form.subject.trim() || 'New enquiry'}`;
  const body = [`Hello EKA,`, '', `I am ${form.name.trim()} (${form.email.trim()}).`, '', `What I am working on: ${form.subject.trim()}`, '', `The situation:`, form.context.trim(), '', `Timing: ${form.timing.trim() || 'To discuss'}`].join('\n');
  return { text: body, href: `mailto:contact@ekasolution.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

export default function ContactPage() {
  const [form, setForm] = useState(START);
  const [review, setReview] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const email = makeEmail(form);

  const prepare = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !form.context.trim()) {
      setError('Add your name, a valid email and a short description of the situation.');
      return;
    }
    setError('');
    setReview(true);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(email.text); setCopied(true); }
    catch { setCopied(false); }
  };

  return <div className="contact-page">
    <header className="contact-hero ink-section section-pad"><div className="site-wrap contact-hero-grid"><div><p className="eyebrow"><span className="eyebrow-mark" /> Contact / Start anywhere</p><h1 className="display-title">Bring the rough <em>version first.</em></h1></div><p>Half formed is fine. Tell us what is happening, who it affects and what you hope could be different.</p></div></header>
    <section className="contact-main section-pad paper-surface"><div className="site-wrap contact-grid"><aside><p className="eyebrow">01 / Start a conversation</p><h2 className="display-title">A useful note beats a perfect brief.</h2><p>We will help frame the problem together. The form prepares an email in your own email app so you can review it before sending.</p><div className="contact-direct"><span>Or write directly</span><a href="mailto:contact@ekasolution.com">contact@ekasolution.com ↗</a></div></aside><div className="contact-sheet"><div className="sheet-top"><span>EKA / PROJECT NOTE</span><span>001</span></div>{!review ? <form onSubmit={prepare} noValidate><h3>Tell us what is on your mind.</h3><div className="form-pair"><label>Your name <input name="name" value={form.name} autoComplete="name" onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Email address <input type="email" name="email" value={form.email} autoComplete="email" onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label></div><label>What are you working on? <input name="subject" placeholder="A short working title is enough" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label><label>What is happening now? <textarea name="context" rows="6" placeholder="Where is the friction? What would you like to change?" value={form.context} onChange={(event) => setForm({ ...form, context: event.target.value })} required /></label><label>Timing <span>Optional</span><input name="timing" placeholder="To discuss, or a rough date" value={form.timing} onChange={(event) => setForm({ ...form, timing: event.target.value })} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="button button-primary">Review your note <span aria-hidden="true">↗</span></button></form> : <div className="contact-review"><h3>Ready to open in your email app.</h3><p>Read it once, make any changes you like, then send it from your own account.</p><pre>{email.text}</pre><div className="contact-review-actions"><a className="button button-primary" href={email.href}>Open email app <span aria-hidden="true">↗</span></a><button type="button" className="button button-outline" onClick={copy}>{copied ? 'Copied' : 'Copy note'} <span aria-hidden="true">↗</span></button></div><button type="button" className="text-link" onClick={() => setReview(false)}>Edit the note <span aria-hidden="true">↶</span></button></div>}<div className="sheet-bottom"><span>Private until you choose to send it</span><span>— EKA Solution</span></div></div></div></section>
    <section className="contact-end section-pad"><div className="site-wrap"><p className="eyebrow">02 / First conversation</p><h2 className="display-title">What happens <em>after hello?</em></h2><div className="contact-next-row"><span>We listen to the situation.</span><span>We name the decision.</span><span>We agree on a useful next step.</span></div></div></section>
  </div>;
}
