import React, { useEffect, useRef, useState } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Check from 'lucide-react/dist/esm/icons/check';
import Clock3 from 'lucide-react/dist/esm/icons/clock-3';
import Send from 'lucide-react/dist/esm/icons/send';
import X from 'lucide-react/dist/esm/icons/x';
import confetti from 'canvas-confetti';
import FileDrop from './FileDrop';
import { CheckField, SelectField, TextField, TextareaField } from './Fields';
import { api, userMessageFor } from '../../lib/api';
import { getAttribution } from '../../lib/attribution';
import { track } from '../../lib/analytics';

/**
 * The careers application, on the back of the hiring card.
 *
 * Four steps rather than one long sheet. The research on this is consistent and the
 * reasoning is not really about length: a single column of twenty fields asks the
 * applicant to hold the whole shape of the task in their head before they have committed
 * to any of it, where four named stretches let them commit to the first one — which is
 * three fields — and then keep going because they have already started.
 *
 * The order is deliberate too. The CV comes first, before anything else is asked, because
 * the single largest source of abandonment on job forms is being made to retype a work
 * history that is already sitting in the file the applicant just attached. Everything
 * after step one is either something a CV cannot answer (notice period, comp, setup) or
 * something we would rather hear in their own words.
 *
 * Text fields are kept locally as a short-lived draft. Files are uploaded as temporary,
 * expiring tokens and claimed by the backend only after the complete application passes
 * validation, so a failed submission never loses the applicant's work.
 */

const DRAFT_KEY = 'eka:careers-application:v1';

/* Fields whose presence in a stored draft does not, on its own, mean the applicant started
   writing one. */
const TOUCH_EXEMPT = new Set(['role', 'currency']);

const EXPERIENCE = [
  '0–2 years',
  '2–5 years',
  '5–8 years',
  '8–12 years',
  '12+ years',
];

const NOTICE = [
  'Available immediately',
  'Within 2 weeks',
  '30 days',
  '60 days',
  '90 days or more',
];

const SETUP = ['Fully remote', 'Hybrid — Bengaluru', 'Either works for me'];

const AUTHORISATION = [
  'Indian citizen / OCI',
  'Valid Indian work permit',
  'Will need sponsorship',
  'Applying from outside India (contract)',
];

const HEARD = [
  'A friend or colleague',
  'LinkedIn',
  'GitHub',
  'Search',
  'An EKA engineer reached out',
  'A conference or meetup',
  'Somewhere else',
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  location: '',
  role: '',
  experience: '',
  company: '',
  notice: '',
  setup: '',
  currency: 'INR',
  compensation: '',
  authorisation: '',
  linkedin: '',
  github: '',
  website: '',
  proudest: '',
  why: '',
  heard: '',
  consent: false,
};

const STEPS = [
  { key: 'start', label: 'Start', title: 'Your CV, and how to reach you.' },
  { key: 'fit', label: 'The role', title: 'What you are applying for.' },
  { key: 'work', label: 'Your work', title: 'Where the rest of it lives.' },
  { key: 'words', label: 'In your words', title: 'The part we actually read first.' },
];

/**
 * Read the saved draft once, at initialisation.
 *
 * Deliberately not an effect. Restoring in an effect means the form paints empty, then
 * repaints full — which on a slow device is a visible flash of an empty application to
 * someone who is coming back to finish one.
 *
 * Only keys the current schema still declares are taken, so a draft left behind by an
 * older version of this form cannot inject fields nothing renders.
 */
function readDraft() {
  let saved = null;
  try {
    saved = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null');
  } catch {
    saved = null;
  }
  if (!saved || typeof saved !== 'object') {
    return { data: EMPTY, files: { resume: null, portfolio: null, photo: null }, restored: false };
  }

  const data = { ...EMPTY };
  let typed = false;
  for (const key of Object.keys(EMPTY)) {
    if (saved[key] === undefined || saved[key] === EMPTY[key]) continue;
    data[key] = saved[key];
    // Choosing a role is a click, not a draft. Announcing "we picked up your draft" to
    // someone who only pressed a row on the list is confusing and slightly alarming — the
    // banner is reserved for a form that actually has writing in it.
    if (!TOUCH_EXEMPT.has(key)) typed = true;
  }
  const savedFiles = saved.__files && typeof saved.__files === 'object' ? saved.__files : {};
  const files = Object.fromEntries(['resume', 'portfolio', 'photo'].map((key) => {
    const file = savedFiles[key];
    return [key, file?.token ? file : null];
  }));
  return { data, files, restored: typed };
}

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** A URL field that people will paste bare hostnames into. Both should pass. */
const isUrlish = (value) => !value.trim() || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#][^\s]*)?$/i.test(value.trim());

/**
 * Per-step validation. Returns a `{ field: message }` map — empty means the step passes.
 * Kept as one function rather than one per step so the rules for a field are all in the
 * same place as the field's neighbours, which is where a drift between them shows up.
 */
function validateStep(index, data, files) {
  const errors = {};

  if (index === 0) {
    if (!data.name.trim()) errors.name = 'We need a name to put on the application.';
    if (!data.email.trim()) errors.email = 'We need an email to reply to.';
    else if (!isEmail(data.email)) errors.email = 'That does not look like an email address.';
    if (!files.resume?.token) errors.resume = 'A CV is the one attachment we do need.';
  }

  if (index === 1) {
    if (!data.role) errors.role = 'Pick the role, or the open application.';
    if (!data.experience) errors.experience = 'Roughly how long have you been doing this?';
    if (!data.notice) errors.notice = 'How soon could you start?';
    if (!data.setup) errors.setup = 'Remote, hybrid or either.';
  }

  if (index === 2) {
    if (!isUrlish(data.linkedin)) errors.linkedin = 'That does not look like a link.';
    if (!isUrlish(data.github)) errors.github = 'That does not look like a link.';
    if (!isUrlish(data.website)) errors.website = 'That does not look like a link.';
  }

  if (index === 3) {
    if (!data.proudest.trim()) errors.proudest = 'This is the field we read first — please fill it in.';
    else if (data.proudest.trim().length < 40) errors.proudest = 'A little more than that. Two or three sentences.';
    if (!data.consent) errors.consent = 'We need your permission to keep the application on file.';
  }

  return errors;
}

export default function ApplicationForm({ roles, initialRole, onClose, onSubmitted }) {
  const [draft] = useState(readDraft);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [data, setData] = useState(() => ({
    ...draft.data,
    // The role the applicant just clicked wins over whatever the draft held — they have
    // told us, explicitly, which one they mean.
    role: initialRole || draft.data.role,
  }));
  const [files, setFiles] = useState(() => draft.files);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitResult, setSubmitResult] = useState(null);
  const restored = draft.restored;

  /* Switching roles while the form is open. This is the "adjusting state when a prop
     changes" case: it is done during render rather than in an effect so the select never
     paints one role and then flips to another. */
  const [appliedRole, setAppliedRole] = useState(initialRole);
  if (initialRole !== appliedRole) {
    setAppliedRole(initialRole);
    if (initialRole) setData((current) => ({ ...current, role: initialRole }));
  }

  const headingRef = useRef(null);
  const stepChanged = useRef(false);

  const roleOptions = [...(roles || []).map((role) => role.title), 'Open application — none of the above'];

  /* Draft save, debounced. Only temporary upload metadata is persisted; file bytes never are. */
  useEffect(() => {
    if (submitted) return;
    const timer = window.setTimeout(() => {
      try {
        const serialisedFiles = Object.fromEntries(Object.entries(files).map(([key, file]) => [
          key,
          file?.token ? { token: file.token, name: file.name, size: file.size, mime: file.mime } : null,
        ]));
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, __files: serialisedFiles }));
      } catch {
        // A private window with storage disabled loses the draft. It must not lose the form.
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data, files, submitted]);

  /* Move focus to the new step's heading. Without this a keyboard or screen-reader user
     presses "Continue" and their focus stays on a button that has just been re-labelled,
     with no announcement that the questions behind it all changed. */
  useEffect(() => {
    if (!stepChanged.current) return;
    stepChanged.current = false;
    headingRef.current?.focus();
  }, [step]);

  const set = (key) => (event) => {
    const value = event?.target ? event.target.value : event;
    setData((current) => ({ ...current, [key]: value }));
    // Clear the error the moment the applicant starts fixing it, rather than making them
    // press Continue again to find out whether they have.
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const setFile = (key) => (file) => {
    setFiles((current) => ({ ...current, [key]: file }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const focusFirstError = (found) => {
    const first = Object.keys(found)[0];
    if (!first) return;
    window.requestAnimationFrame(() => {
      const node = document.querySelector(`[aria-invalid="true"]`);
      node?.focus?.();
    });
  };

  const goNext = () => {
    const found = validateStep(step, data, files);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found);
      return;
    }
    stepChanged.current = true;
    setDirection('forward');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    track('form_step', { category: 'careers', label: `careers_application:step_${step + 1}` });
  };

  const goBack = () => {
    stepChanged.current = true;
    setDirection('back');
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Re-run every step, not just the last one. Someone can reach step four with a valid
    // step four and an earlier step that was emptied by a draft restore.
    for (let index = 0; index < STEPS.length; index += 1) {
      const found = validateStep(index, data, files);
      if (Object.keys(found).length) {
        setErrors(found);
        stepChanged.current = true;
        setDirection('back');
        setStep(index);
        focusFirstError(found);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const selected = (roles || []).find((entry) => entry.title === data.role);
      const attribution = getAttribution();
      const response = await api('/careers/applications', {
        method: 'POST',
        body: {
          job_opening_uuid: selected?.uuid || null,
          role_label: data.role === 'Open application — none of the above' ? 'Open application' : data.role,
          ...data,
          files: {
            resume: files.resume?.token || null,
            portfolio: files.portfolio?.token || null,
            photo: files.photo?.token || null,
          },
          meta: { ...attribution, form_key: 'careers_application' },
          hp_website: '',
        },
        timeoutMs: 30000,
      });

      setSubmitResult(response.data || null);
      setSubmitted(true);
      onSubmitted?.();
      track('form_submit', { category: 'careers', label: 'careers_application:success' });

      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // A blocked storage provider must not affect a successful application.
      }

      try {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          confetti({
            particleCount: 110,
            spread: 74,
            origin: { y: 0.62 },
            colors: ['#1B2252', '#2F42B0', '#4065FF', '#A9B2D8'],
          });
        }
      } catch {
        // Confetti is decoration. A blocked canvas must not swallow the submission.
      }
    } catch (error) {
      const roleError = error?.details?.job_opening_uuid;
      if (roleError) {
        setErrors((current) => ({ ...current, role: roleError[0] || 'Please choose another role.' }));
        setStep(1);
        stepChanged.current = true;
      }
      setSubmitError(userMessageFor(error, 'We could not send your application. Your form is still here — please try again.'));
      track('form_error', { category: 'careers', label: `careers_application:${error?.code || 'request_failed'}` });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="card-elevated flex h-full flex-col items-center justify-center px-8 py-16 text-center">
        <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ink)] text-[#F7F6F1]">
          <Check className="h-7 w-7 stroke-[3]" />
        </span>
        <h3 className="font-display text-3xl leading-tight text-[var(--ink)]">
          That is with us.
        </h3>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
          An engineer reads it, not a filter. If there is a fit you will hear from us inside
          five working days, and if there is not you will still hear from us — a silent no is
          a rude one.
        </p>
        <p className="mt-6 max-w-sm font-mono text-[var(--fs-2xs)] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
          {submitResult?.reference || data.role || 'Open application'}
        </p>
        <button type="button" onClick={onClose} className="btn-outline mt-8">
          <span>Back to the roles</span>
        </button>
      </div>
    );
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-form-name="careers_application"
      className="card-elevated flex h-full flex-col p-7 sm:p-9"
    >
      {/* Header: what this is, how long it takes, and the way out. */}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.26em] text-[var(--ink-faint)]">
            <span aria-hidden="true" className="text-[var(--blue)]">+</span> Application
          </span>
          <p className="mt-2 flex items-center gap-1.5 text-[var(--fs-xs)] text-[var(--ink-faint)]">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Four short steps, about four minutes. Your progress is kept if you leave.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close the application and go back to the hiring process"
          className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-[var(--ink-faint)] transition-colors hover:bg-[rgba(27,34,82,0.06)] hover:text-[var(--ink)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step rail */}
      <ol className="step-rail mt-7" aria-label="Application progress">
        {STEPS.map((entry, index) => (
          <li
            key={entry.key}
            className="step-rail-item"
            data-state={index < step ? 'done' : index === step ? 'current' : 'todo'}
            aria-current={index === step ? 'step' : undefined}
          >
            <span className="step-rail-track">
              <span className="step-rail-fill" />
            </span>
            <span
              className={`mt-2 block font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.14em] ${
                index <= step ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]'
              }`}
            >
              <span className="hidden sm:inline">{entry.label}</span>
              <span className="sm:hidden">{String(index + 1).padStart(2, '0')}</span>
            </span>
          </li>
        ))}
      </ol>

      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-7 font-display text-2xl leading-tight text-[var(--ink)] outline-none sm:text-[1.75rem]"
      >
        {current.title}
      </h3>

      {restored && step === 0 && (
        <p className="mt-3 rounded-xl bg-[var(--bg-sunken)] px-3.5 py-2.5 text-[var(--fs-xs)] leading-relaxed text-[var(--ink-soft)]">
          We picked up a draft you started earlier. Attach the CV again — files are not kept
          on your device.
        </p>
      )}

      {/* The step. Keyed so React remounts it and the entrance animation re-runs. */}
      <div key={current.key} data-dir={direction} className="step-panel mt-7 flex-1">
        {step === 0 && (
          <div className="grid gap-5">
            <FileDrop
              label="CV / résumé"
              name="resume"
              required
              accept=".pdf,.doc,.docx"
              maxMB={10}
              value={files.resume}
              onChange={setFile('resume')}
              error={errors.resume}
              hint="PDF is safest — it arrives looking the way you laid it out."
            />

            <TextField
              label="Full name"
              required
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={data.name}
              onChange={set('name')}
              error={errors.name}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Email"
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@domain.com"
                value={data.email}
                onChange={set('email')}
                error={errors.email}
              />
              <TextField
                label="Phone / WhatsApp"
                optional
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+91 …"
                value={data.phone}
                onChange={set('phone')}
                error={errors.phone}
              />
            </div>

            <TextField
              label="Where you are based"
              optional
              name="location"
              autoComplete="address-level2"
              placeholder="City, country"
              value={data.location}
              onChange={set('location')}
              hint="We work across time zones, but the IST overlap on some roles is real."
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5">
            <SelectField
              label="Role"
              required
              name="role"
              placeholder="Choose a role"
              options={roleOptions}
              value={data.role}
              onChange={set('role')}
              error={errors.role}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Experience"
                required
                name="experience"
                placeholder="Select"
                options={EXPERIENCE}
                value={data.experience}
                onChange={set('experience')}
                error={errors.experience}
              />
              <TextField
                label="Current title & company"
                optional
                name="company"
                autoComplete="organization"
                placeholder="Senior Engineer, Somewhere"
                value={data.company}
                onChange={set('company')}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Earliest start"
                required
                name="notice"
                placeholder="Select"
                options={NOTICE}
                value={data.notice}
                onChange={set('notice')}
                error={errors.notice}
              />
              <SelectField
                label="Working setup"
                required
                name="setup"
                placeholder="Select"
                options={SETUP}
                value={data.setup}
                onChange={set('setup')}
                error={errors.setup}
              />
            </div>

            {/* Compensation. Asked as a plain number with the currency beside it rather
                than as a band: bands anchor the negotiation before the conversation has
                happened, and we would rather hear the real figure. */}
            <div>
              <span className="field-label">
                Expected annual compensation
                <span className="field-optional">Optional</span>
              </span>
              <div className="flex gap-3">
                <SelectField
                  label=""
                  className="w-28 shrink-0 [&_.field-label]:sr-only"
                  aria-label="Currency"
                  name="currency"
                  options={CURRENCIES}
                  value={data.currency}
                  onChange={set('currency')}
                />
                <TextField
                  label=""
                  className="flex-1 [&_.field-label]:sr-only"
                  aria-label="Expected annual compensation"
                  name="compensation"
                  inputMode="numeric"
                  placeholder="e.g. 48,00,000"
                  value={data.compensation}
                  onChange={set('compensation')}
                />
              </div>
              <p className="field-hint">
                A real number, not a band. We will tell you ours in the first call.
              </p>
            </div>

            <SelectField
              label="Right to work"
              optional
              name="authorisation"
              placeholder="Select"
              options={AUTHORISATION}
              value={data.authorisation}
              onChange={set('authorisation')}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5">
            <TextField
              label="LinkedIn"
              optional
              name="linkedin"
              autoComplete="url"
              placeholder="linkedin.com/in/…"
              value={data.linkedin}
              onChange={set('linkedin')}
              error={errors.linkedin}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="GitHub / GitLab"
                optional
                name="github"
                placeholder="github.com/…"
                value={data.github}
                onChange={set('github')}
                error={errors.github}
              />
              <TextField
                label="Portfolio / site"
                optional
                name="website"
                placeholder="yoursite.com"
                value={data.website}
                onChange={set('website')}
                error={errors.website}
              />
            </div>

            <FileDrop
              label="Work sample or portfolio"
              name="portfolio"
              accept=".pdf,.zip,.png,.jpg,.jpeg"
              maxMB={25}
              value={files.portfolio}
              onChange={setFile('portfolio')}
              hint="A case study, a deck, a repo export — whatever shows the work best."
            />

            <FileDrop
              label="Photo"
              name="photo"
              accept=".png,.jpg,.jpeg,.webp"
              maxMB={5}
              value={files.photo}
              onChange={setFile('photo')}
              hint="Only so the people on your calls know who they are meeting. Never used to screen."
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <TextareaField
              label="The thing you are proudest of having built"
              required
              name="proudest"
              rows={5}
              placeholder="What it was, what made it hard, and what you would do differently now."
              value={data.proudest}
              onChange={set('proudest')}
              error={errors.proudest}
              hint="Two or three sentences is plenty. This is the field we read first."
            />

            <TextareaField
              label="Why here"
              optional
              name="why"
              rows={3}
              placeholder="What made you open this page rather than close it."
              value={data.why}
              onChange={set('why')}
            />

            <SelectField
              label="How you heard about us"
              optional
              name="heard"
              placeholder="Select"
              options={HEARD}
              value={data.heard}
              onChange={set('heard')}
            />

            <div className="rounded-2xl bg-[var(--bg-sunken)] px-5 py-4">
              <CheckField
                name="consent"
                checked={data.consent}
                onChange={set('consent')}
                error={errors.consent}
                label="You may keep my application and the files attached to it on file for twelve months, and contact me about this role and others like it."
              />
            </div>
          </div>
        )}
      </div>

      {submitError && (
        <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
          {submitError}
        </p>
      )}

      {/* Actions. The primary sits on the right on every step so it never moves. */}
      <div className="mt-8 flex items-center gap-3 border-t border-[var(--border-hairline)] pt-6">
        {step > 0 ? (
          <button type="button" onClick={goBack} className="btn-outline !px-5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <span className="font-mono text-[var(--fs-2xs)] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            Step {step + 1} of {STEPS.length}
          </span>
        )}

        <span className="flex-1" />

        {isLast ? (
          <button type="submit" className="btn-ink" disabled={submitting}>
            <span>{submitting ? 'Sending…' : 'Send application'}</span>
            <Send className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={goNext} className="btn-ink">
            <span>Continue</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
