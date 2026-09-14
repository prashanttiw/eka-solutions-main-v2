import { API_BASE_URL, API_ENABLED, api } from './api';
import { getAttribution } from './attribution';

const DNT = typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true);
const DISABLED = DNT || !API_ENABLED;
const MAX_BATCH = 20;
const FLUSH_MS = 5000;

let queue = [];
let flushTimer = 0;
let started = false;
let cleanup = () => {};
const formStarts = new WeakSet();

const currentPage = () => (typeof window === 'undefined' ? '/' : window.location.pathname || '/');

const safeLabel = (value) => String(value || '')
  .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]')
  .replace(/https?:\/\/\S+/gi, '[url]')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 160);

const payloadFor = (events) => {
  const attribution = getAttribution();
  return {
    visitor_id: attribution.visitor_id,
    session_id: attribution.session_id,
    events,
  };
};

const scrollDepth = () => {
  if (typeof window === 'undefined') return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 100;
};

export function track(name, fields = {}) {
  if (DISABLED || typeof window === 'undefined') return;
  const event = {
    type: fields.type || 'event',
    name,
    category: fields.category || 'website',
    path: fields.path || currentPage(),
    label: safeLabel(fields.label),
    referrer: document.referrer || '',
    title: document.title,
    ts: Date.now(),
  };
  if (fields.utm) event.utm = fields.utm;
  if (fields.time_on_page_ms !== undefined) event.time_on_page_ms = Math.max(0, Math.round(fields.time_on_page_ms));
  if (fields.scroll_depth !== undefined) event.scroll_depth = Math.max(0, Math.min(100, Math.round(fields.scroll_depth)));
  queue.push(event);
  if (queue.length >= MAX_BATCH) void flush();
}

export function trackPageview(path = currentPage()) {
  if (DISABLED) return;
  track('pageview', { type: 'pageview', path, category: 'navigation', label: document.title, utm: getAttribution().utm });
}

export function trackFormStart(formName) {
  if (DISABLED || typeof document === 'undefined') return;
  const form = typeof formName === 'string' ? document.querySelector(`[data-form-name="${formName}"]`) : formName;
  if (form && !formStarts.has(form)) {
    formStarts.add(form);
    track('form_start', { category: 'form', label: formName || form.getAttribute('name') || 'form' });
  }
}

export function reportClientError(error, context = '') {
  const message = error instanceof Error ? error.message : String(error || 'Unknown client error');
  track('client_error', {
    category: 'client',
    label: `${context ? `${context}: ` : ''}${message}`,
  });
}

async function flush({ beacon = false } = {}) {
  if (DISABLED || queue.length === 0) return;
  const events = queue.splice(0, MAX_BATCH);
  const payload = payloadFor(events);
  const body = JSON.stringify(payload);

  if (beacon && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(API_BASE_URL + '/analytics/collect', new Blob([body], { type: 'application/json' }));
    if (sent) return;
  }

  try {
    await api('/analytics/collect', { method: 'POST', body, timeoutMs: 4000 });
  } catch {
    // Analytics must never block navigation or surface an error to a visitor. Put a small
    // batch back so a transient outage can be retried on the next flush.
    queue = [...events, ...queue].slice(-MAX_BATCH * 2);
  }
}

export function startAnalytics() {
  if (started || DISABLED || typeof window === 'undefined') return cleanup;
  started = true;

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      track('page_exit', { category: 'navigation', time_on_page_ms: performance.now(), scroll_depth: scrollDepth() });
      void flush({ beacon: true });
    }
  };
  const onPageHide = () => {
    track('page_exit', { category: 'navigation', time_on_page_ms: performance.now(), scroll_depth: scrollDepth() });
    void flush({ beacon: true });
  };
  const onClick = (event) => {
    const target = event.target.closest?.('[data-analytics], a[href^="mailto:"], a[href*="wa.me"]');
    if (!target) return;
    const href = target.getAttribute('href') || '';
    const explicit = target.dataset.analytics;
    const name = explicit || (href.startsWith('mailto:') ? 'email_click' : href.includes('wa.me') ? 'whatsapp_click' : 'outbound_click');
    track(name, { category: explicit ? 'interaction' : 'outbound', label: target.dataset.analyticsLabel || target.textContent });
  };
  const onFocus = (event) => {
    const form = event.target.closest?.('form[data-form-name]');
    if (form) trackFormStart(form);
  };
  const onError = (event) => reportClientError(event.error || event.message, 'window');
  const onRejection = (event) => reportClientError(event.reason, 'unhandled-rejection');

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  document.addEventListener('click', onClick, true);
  document.addEventListener('focusin', onFocus, true);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  flushTimer = window.setInterval(() => void flush(), FLUSH_MS);

  cleanup = () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('focusin', onFocus, true);
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    window.clearInterval(flushTimer);
    void flush();
    started = false;
  };
  return cleanup;
}
