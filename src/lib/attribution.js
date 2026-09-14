const VISITOR_KEY = 'eka:visitor:v1';
const SESSION_KEY = 'eka:session:v1';
const SESSION_TTL = 30 * 60 * 1000;

const createId = (prefix) => {
  const uuid = globalThis.crypto?.randomUUID?.();
  const raw = (uuid || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)
    .replace(/-/g, '')
    .slice(0, 30);
  return `${prefix}_${raw}`;
};

const readJson = (storage, key) => {
  try {
    return JSON.parse(storage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const writeJson = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or a blocked storage provider must not stop a form submission.
  }
};

const utm = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };
};

export function getAttribution() {
  if (typeof window === 'undefined') {
    return { visitor_id: null, session_id: null, referrer: null, utm: {} };
  }

  const visitor = readJson(window.localStorage, VISITOR_KEY) || { id: createId('v') };
  writeJson(window.localStorage, VISITOR_KEY, visitor);

  const now = Date.now();
  let session = readJson(window.sessionStorage, SESSION_KEY);
  if (!session || now - Number(session.last_activity || 0) > SESSION_TTL) {
    session = { id: createId('s'), started_at: now };
  }
  session.last_activity = now;
  writeJson(window.sessionStorage, SESSION_KEY, session);

  return {
    visitor_id: visitor.id,
    session_id: session.id,
    referrer: document.referrer || null,
    landing_page: window.location.href,
    page: window.location.pathname,
    utm: utm(),
  };
}

export function attributionHeaders() {
  const attribution = getAttribution();
  return {
    ...(attribution.visitor_id ? { 'X-Visitor-Id': attribution.visitor_id } : {}),
    ...(attribution.session_id ? { 'X-Session-Id': attribution.session_id } : {}),
  };
}
