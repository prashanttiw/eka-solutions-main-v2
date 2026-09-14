import { attributionHeaders } from './attribution';

const configuredBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (configuredBase || (import.meta.env.DEV
  ? 'http://127.0.0.1:8080/api/v1'
  : '')).replace(/\/$/, '');
export const API_ENABLED = API_BASE_URL.length > 0;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = {}, requestId = '', retryAfter = 0 } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
  }
}

const idempotencyKey = () => {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const newIdempotencyKey = idempotencyKey;

export const userMessageFor = (error, fallback = 'Something went wrong. Please try again, or use the email option below.') => {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 429) return 'We have received several requests from this connection. Please wait a moment and try again.';
  if (error.status >= 500 || error.code === 'NETWORK_ERROR' || error.code === 'API_NOT_CONFIGURED') return 'We could not reach EKA just now. Your details are still here — please try again or use the email option below.';
  return error.message || fallback;
};

export async function api(path, options = {}) {
  if (!API_ENABLED) {
    throw new ApiError('The EKA API is not configured for this build.', {
      code: 'API_NOT_CONFIGURED',
    });
  }

  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    timeoutMs = 15000,
  } = options;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const requestHeaders = {
    Accept: 'application/json',
    ...attributionHeaders(),
    ...headers,
  };
  let requestBody = body;

  if (body !== undefined && !(body instanceof FormData) && typeof body !== 'string') {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: signal || controller.signal,
      credentials: 'omit',
    });

    const requestId = response.headers.get('X-Request-Id') || '';
    const retryAfter = Number(response.headers.get('X-RateLimit-Reset') || 0);
    let payload = null;
    if (response.status !== 204) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }

    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        payload?.error?.message || `Request failed with status ${response.status}.`,
        {
          status: response.status,
          code: payload?.error?.code || 'HTTP_ERROR',
          details: payload?.error?.details || {},
          requestId,
          retryAfter,
        },
      );
    }

    return payload || { success: true, data: null, meta: { request_id: requestId } };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error?.name === 'AbortError'
      ? 'The request took too long. Please check your connection and try again.'
      : 'We could not reach EKA just now. Please check your connection and try again.';
    throw new ApiError(message, { code: 'NETWORK_ERROR' });
  } finally {
    window.clearTimeout(timeout);
  }
}
