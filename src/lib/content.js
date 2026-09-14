import { useEffect, useState } from 'react';
import { api } from './api';

const identity = (value) => value;

/**
 * Fetch published content without making the marketing site depend on the API.
 * The fallback is rendered immediately; an API response replaces it only when it is
 * a non-empty list. This keeps direct links and temporary API outages useful while
 * allowing the admin content catalogue to become the source of truth over time.
 */
export function useContent(type, fallback, map = identity) {
  const [items, setItems] = useState(fallback);

  useEffect(() => {
    let active = true;

    api(`/content/${type}`, { timeoutMs: 8000 })
      .then((payload) => {
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        if (active && rows.length > 0) setItems(rows.map(map));
      })
      .catch(() => {
        // The local copy is already visible; content availability is not a blocking error.
      });

    return () => {
      active = false;
    };
  }, [type, map]);

  return items;
}
