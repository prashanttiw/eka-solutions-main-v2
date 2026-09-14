import React from 'react';
import { WHATSAPP_DISPLAY, whatsappHref } from '../lib/whatsapp';

/**
 * The one persistent way to reach a human, parked bottom-right.
 *
 * Collapsed it is an ink disc — quiet enough to live over any section. On hover or keyboard
 * focus the capsule grows leftward and hands over the actual number, so the visitor can read
 * it (or save it) without committing to a tap. The reveal animates a grid track from 0fr to
 * 1fr rather than a max-width, which is the only way to ease to a *content-sized* width
 * without hard-coding one and without the usual max-width lurch.
 *
 * Touch devices never get the hover state, so there the disc simply opens the chat.
 */

export function WhatsAppGlyph({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

export default function WhatsAppFloat() {
  return (
    <div className="fixed bottom-5 right-4 z-[55] sm:bottom-6 sm:right-6">
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="chat"
        aria-label={`Message EKA Solution on WhatsApp at ${WHATSAPP_DISPLAY}`}
        className="group flex items-center rounded-full border border-[var(--ink)]/[0.08] bg-[var(--ink)] py-1.5 pl-1.5 pr-1.5 text-[#F7F6F1] shadow-quiet-card transition-shadow duration-300 hover:shadow-quiet-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
      >
        {/* The reveal: a zero-width grid track that eases open to its content width. */}
        <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr] motion-reduce:transition-none">
          <span className="min-w-0 overflow-hidden">
            <span className="flex flex-col pl-3.5 pr-3 text-left">
              <span className="whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#F7F6F1]/55">
                WhatsApp us
              </span>
              <span className="whitespace-nowrap font-display text-sm font-bold leading-tight tracking-tight">
                {WHATSAPP_DISPLAY}
              </span>
            </span>
          </span>
        </span>

        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7F6F1] text-[var(--ink)] transition-transform duration-300 group-hover:scale-[1.04]">
          <WhatsAppGlyph className="h-[22px] w-[22px]" />
          {/* Quiet "we're here" pulse — one dot, no colour, no bounce. */}
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-[var(--ink)] bg-[#25D366]" />
          </span>
        </span>
      </a>
    </div>
  );
}
