import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Mail from 'lucide-react/dist/esm/icons/mail';
import { Section } from './Editorial';
import { WhatsAppGlyph } from './WhatsAppFloat';
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp';
import { api, newIdempotencyKey, userMessageFor } from '../lib/api';
import { getAttribution } from '../lib/attribution';
import { track } from '../lib/analytics';

const SERVICES = [
  'Not sure yet',
  'Websites & applications',
  'Product design',
  'AI & automation',
  'Cloud & reliability',
  'Custom business software',
];
const EMAIL = 'contact@ekasolution.com';

export default function ContactTerminal() {
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: SERVICES.includes(params.get('service'))
      ? params.get('service')
      : SERVICES[0],
    budget: '',
    message: '',
  }));
  const [reviewing, setReviewing] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reference, setReference] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const reviewRef = useRef(null);
  const nameRef = useRef(null);
  const [formRenderTs] = useState(() => Date.now());
  const requestKey = useRef(newIdempotencyKey());
  useEffect(() => {
    if (reviewing) reviewRef.current?.focus();
  }, [reviewing]);
  const update = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    setCopyStatus('');
  };
  const brief = [
    `Hello EKA,`,
    '',
    form.message.trim(),
    '',
    `Name: ${form.name.trim()}`,
    `Reply email: ${form.email.trim()}`,
    form.phone.trim() && `Phone / WhatsApp: ${form.phone.trim()}`,
    form.company.trim() && `Company: ${form.company.trim()}`,
    `Interested in: ${form.service}`,
    form.budget.trim() && `Budget / timing: ${form.budget.trim()}`,
  ]
    .filter((line) => line !== false)
    .join('\n');
  const emailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(`Project enquiry — ${form.service}`)}&body=${encodeURIComponent(brief)}`;
  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyStatus(
        'Brief copied. Paste it into an email and send it to contact@ekasolution.com.',
      );
    } catch {
      setCopyStatus(
        'Copy was unavailable. Select the brief below and copy it, or use the email draft button.',
      );
    }
  };
  const edit = () => {
    setReviewing(false);
    setCopyStatus('');
    setSubmitError('');
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const submitEnquiry = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const attribution = getAttribution();
      const response = await api('/leads/contact', {
        method: 'POST',
        headers: { 'Idempotency-Key': requestKey.current },
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          service: form.service,
          budget: form.budget.trim() || undefined,
          message: form.message.trim(),
          consent_marketing: marketingConsent,
          hp_website: '',
          meta: { ...attribution, form_render_ts: formRenderTs, form_key: 'contact_terminal' },
        },
      });
      setReference(response.data?.reference || '');
      setSent(true);
      track('form_submit', { category: 'contact', label: 'contact_terminal:success' });
    } catch (error) {
      setSubmitError(userMessageFor(error));
      track('form_error', { category: 'contact', label: `contact_terminal:${error?.code || 'request_failed'}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section id="contact">
      <div className="contact-layout">
        <div className="contact-intro">
          <span className="editorial-label">A useful first conversation</span>
          <h2 className="font-display">
            Start with what
            <br />
            you have in mind.
          </h2>
          <p>
            A new idea, an existing product, or a process that takes too much
            time. Tell us where you are and where you want to go.
          </p>
          <a className="contact-direct" href={`mailto:${EMAIL}`}>
            <Mail size={20} aria-hidden="true" />
            <span>
              <small>Email EKA</small>
              {EMAIL}
            </span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a
            className="contact-direct"
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph className="h-5 w-5" />
            <span>
              <small>Talk on WhatsApp</small>
              {WHATSAPP_DISPLAY}
            </span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <div className="contact-guidance">
            <span className="editorial-label">Helpful to include</span>
            <ol>
              <li>What your business does.</li>
              <li>What you want to build or improve.</li>
              <li>Any timing, budget, or practical constraints.</li>
            </ol>
          </div>
        </div>
        <div className="brief-card">
          {sent ? (
            <div>
              <span className="editorial-label">Message received</span>
              <h2 ref={reviewRef} tabIndex={-1} className="font-display">
                That is with us.
              </h2>
              <p className="brief-note">
                Thanks for the context. A person at EKA will read it and reply within one working day.
              </p>
              {reference && <p className="section-footnote">Reference: {reference}</p>}
              <div className="brief-actions">
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn-ink" data-analytics="whatsapp_click">
                  Talk on WhatsApp
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <button type="button" onClick={() => { setSent(false); setReviewing(false); }} className="editorial-link">
                  Send another enquiry
                </button>
              </div>
            </div>
          ) : reviewing ? (
            <div>
              <span className="editorial-label">Ready for your review</span>
              <h2 ref={reviewRef} tabIndex={-1} className="font-display">
                Your project brief
              </h2>
              <p className="brief-note">
                Check the details, then send the enquiry securely to EKA. You can still open an email draft as a fallback.
              </p>
              <pre className="brief-preview">{brief}</pre>
              <div className="brief-actions">
                <button type="button" onClick={submitEnquiry} className="btn-ink" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send enquiry to EKA'}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
                <a href={emailHref} className="btn-ink">
                  Open email draft
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <button type="button" onClick={edit} className="editorial-link">
                  Edit brief
                </button>
              </div>
              {submitError && <p role="alert" className="field-error mt-4">{submitError}</p>}
              <button
                type="button"
                onClick={copyBrief}
                className="editorial-link"
              >
                <Copy size={16} aria-hidden="true" />
                Copy brief
              </button>
              <p role="status" className="brief-note">
                {copyStatus}
              </p>
              <p className="section-footnote">
                If the secure send is unavailable, copy the brief or open the email draft. Your form stays here if a request fails.
              </p>
            </div>
          ) : (
            <form
              data-form-name="contact_terminal"
              onSubmit={(e) => {
                e.preventDefault();
                if (!e.currentTarget.reportValidity()) return;
                track('form_start', { category: 'contact', label: 'contact_terminal:review' });
                setReviewing(true);
              }}
            >
              <span className="editorial-label">Prepare a project enquiry</span>
              <h2 className="font-display">
                A little context goes a long way.
              </h2>
              <p className="brief-note" id="brief-help">
                Prepare the useful context once. You will review it before EKA receives anything. Fields marked * are required.
              </p>
              <div className="brief-fields">
                <div>
                  <label htmlFor="enquiry-name">Your name *</label>
                  <input
                    ref={nameRef}
                    id="enquiry-name"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    pattern=".*\S.*"
                    placeholder="Your name"
                    value={form.name}
                    onChange={update}
                  />
                </div>
                <div>
                  <label htmlFor="enquiry-phone">
                    Phone / WhatsApp <span>(optional)</span>
                  </label>
                  <input
                    id="enquiry-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    placeholder="+91 …"
                    value={form.phone}
                    onChange={update}
                  />
                </div>
                <div>
                  <label htmlFor="enquiry-email">Email address *</label>
                  <input
                    id="enquiry-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={update}
                  />
                </div>
                <div className="brief-full">
                  <label htmlFor="enquiry-company">
                    Company <span>(optional)</span>
                  </label>
                  <input
                    id="enquiry-company"
                    name="company"
                    autoComplete="organization"
                    maxLength={150}
                    placeholder="Your business or organisation"
                    value={form.company}
                    onChange={update}
                  />
                </div>
                <label className="brief-full flex items-start gap-3 text-sm leading-relaxed text-[var(--ink-soft)]" htmlFor="enquiry-marketing">
                  <input
                    id="enquiry-marketing"
                    name="consent_marketing"
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) => setMarketingConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--ink)]"
                  />
                  <span>Keep me in the loop about useful EKA updates. Optional.</span>
                </label>
                <input
                  aria-hidden="true"
                  tabIndex="-1"
                  autoComplete="off"
                  name="hp_website"
                  className="absolute -left-[10000px] h-px w-px opacity-0"
                  value=""
                  onChange={() => {}}
                />
                <div className="brief-full">
                  <label htmlFor="enquiry-service">
                    What can we help with?
                  </label>
                  <select
                    id="enquiry-service"
                    name="service"
                    value={form.service}
                    onChange={update}
                  >
                    {SERVICES.map((service) => (
                      <option key={service}>{service}</option>
                    ))}
                  </select>
                </div>
                <div className="brief-full">
                  <label htmlFor="enquiry-budget">
                    Budget or timing <span>(optional)</span>
                  </label>
                  <input
                    id="enquiry-budget"
                    name="budget"
                    maxLength={200}
                    placeholder="A range, a launch date, or still exploring"
                    value={form.budget}
                    onChange={update}
                  />
                </div>
                <div className="brief-full">
                  <label htmlFor="enquiry-message">
                    What do you have in mind? *
                  </label>
                  <textarea
                    id="enquiry-message"
                    name="message"
                    rows={5}
                    required
                    minLength={20}
                    maxLength={5000}
                    placeholder="Tell us about the goal, the people using it, and what you would like to change."
                    value={form.message}
                    onChange={update}
                  />
                </div>
              </div>
              <button
                className="btn-ink"
                type="submit"
                aria-describedby="brief-help"
              >
                Review project brief
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
              <p className="section-footnote">
                We only send this after you review it. A copy-and-email fallback remains available if your connection is interrupted.
              </p>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
