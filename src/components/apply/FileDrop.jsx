import React, { useId, useRef, useState } from 'react';
import Check from 'lucide-react/dist/esm/icons/check';
import Paperclip from 'lucide-react/dist/esm/icons/paperclip';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import X from 'lucide-react/dist/esm/icons/x';
import { api, userMessageFor } from '../../lib/api';
import { track } from '../../lib/analytics';

/**
 * A single-file upload well: drag onto it, click it, or tab to it and press enter.
 *
 * The whole well is the button rather than a "Choose file" control sitting next to a
 * label. A native file input is roughly forty pixels of grey OS chrome that cannot be
 * styled and does not accept a drop; keeping it visually hidden but in the DOM means the
 * accessibility tree and the keyboard still get a real `<input type="file">`, while the
 * pointer gets the whole rectangle as a target.
 *
 * Validation is deliberately client-side and non-blocking in the sense that it never
 * silently discards a file — a rejected drop says what was wrong with it and leaves the
 * previous selection alone, because "nothing happened" is the worst possible response to
 * someone dragging their CV onto a page.
 */

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** `accept` is written for the file dialog; this reads it back to check a dropped file. */
const matchesAccept = (file, accept) => {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .some((token) => {
      if (!token) return false;
      if (token.startsWith('.')) return name.endsWith(token);
      if (token.endsWith('/*')) return file.type.startsWith(token.slice(0, -1));
      return file.type === token;
    });
};

export default function FileDrop({
  label,
  name,
  accept,
  maxMB = 10,
  required = false,
  hint,
  value,
  onChange,
  error,
  context = 'careers_application',
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [uploading, setUploading] = useState(false);

  const shownError = localError || error || '';

  const take = async (file) => {
    if (!file) return;

    if (!matchesAccept(file, accept)) {
      setLocalError(`That file type is not accepted here. Use ${accept.replaceAll(',', ', ')}.`);
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setLocalError(`That file is ${formatSize(file.size)}. The limit is ${maxMB} MB.`);
      return;
    }

    setLocalError('');
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', name);
      body.append('context', context);
      const response = await api('/uploads', { method: 'POST', body, timeoutMs: 30000 });
      const uploaded = response.data || {};
      onChange({
        token: uploaded.upload_token,
        name: uploaded.original_name || file.name,
        size: Number(uploaded.size_bytes || file.size),
        mime: uploaded.mime || file.type,
      });
      track('file_attached', { category: 'careers', label: `${name}:${file.name}` });
    } catch (uploadError) {
      setLocalError(userMessageFor(uploadError, 'We could not upload that file. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const clear = async (event) => {
    // The clear button sits inside the well, which is itself a click target for the file
    // dialog. Without this, removing a file immediately reopens the picker.
    event.stopPropagation();
    setLocalError('');
    if (value?.token) {
      try {
        await api(`/uploads/${encodeURIComponent(value.token)}`, { method: 'DELETE', timeoutMs: 10000 });
      } catch {
        // Expired or already-removed temporary uploads are safe to clear locally.
      }
    }
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="field-label" htmlFor={inputId}>
        {label}
        {required ? (
          <span className="field-req" aria-hidden="true">*</span>
        ) : (
          <span className="field-optional">Optional</span>
        )}
      </label>

      {/* The drop target. A div rather than a button: a button cannot legally contain the
          nested "remove" button that appears once a file is attached. */}
      <div
        role="button"
        tabIndex={0}
        data-dragging={dragging}
        data-filled={Boolean(value?.token)}
        data-invalid={Boolean(shownError)}
        aria-describedby={shownError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className="drop-zone"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          take(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="drop-icon" aria-hidden="true">
          {value ? <Check className="h-4 w-4 stroke-[2.5]" /> : <UploadCloud className="h-[18px] w-[18px]" />}
        </span>

        <span className="min-w-0 flex-1">
          {value?.token ? (
            <>
              <span className="block truncate text-sm font-semibold text-[var(--ink)]">
                {value.name}
              </span>
              <span className="mt-0.5 block font-mono text-[var(--fs-2xs)] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                {uploading ? 'Uploading…' : `${formatSize(value.size)} · attached`}
              </span>
            </>
          ) : (
            <>
              <span className="block text-sm font-semibold text-[var(--ink)]">
                Drop a file here, or browse
              </span>
              <span className="mt-0.5 block font-mono text-[var(--fs-2xs)] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                {accept ? accept.replaceAll(',', ' · ').replaceAll('.', '') : 'Any file'} · max {maxMB} MB
              </span>
            </>
          )}
        </span>

        {value?.token ? (
          <button
            type="button"
            onClick={clear}
            aria-label={`Remove ${value.name}`}
            className="shrink-0 rounded-full p-1.5 text-[var(--ink-faint)] transition-colors hover:bg-[rgba(27,34,82,0.06)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Paperclip className="h-4 w-4 shrink-0 text-[var(--ink-faint)]" aria-hidden="true" />
        )}

        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          disabled={uploading}
          className="sr-only absolute h-px w-px opacity-0"
          onChange={(event) => take(event.target.files?.[0])}
        />
      </div>

      {shownError ? (
        <p id={`${inputId}-error`} role="alert" className="field-error">
          {shownError}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
