import React, { useId } from 'react';
import Check from 'lucide-react/dist/esm/icons/check';

/**
 * The four field shapes the application uses, wired for assistive tech once rather than
 * per instance.
 *
 * Each one owns its own generated id and hangs the label, the hint and the error off it,
 * so a screen reader hears the question, the constraint and the failure as one unit. Every
 * form on this site had been re-implementing that association by hand, and mostly getting
 * it wrong — labels without `htmlFor`, errors that were visible but unannounced.
 */

function Shell({ id, label, required, optional, hint, error, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && (
          <span className="field-req" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="field-optional">Optional</span>}
      </label>

      {/* The control is cloned rather than rendered blind so the wiring cannot drift: the
          shell decides the id and the description, the caller only decides the input. */}
      {React.cloneElement(children, {
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy,
      })}

      {error ? (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  required,
  optional,
  hint,
  error,
  className = '',
  ...input
}) {
  const id = useId();
  return (
    <div className={className}>
      <Shell id={id} label={label} required={required} optional={optional} hint={hint} error={error}>
        <input className="field-input" required={required} {...input} />
      </Shell>
    </div>
  );
}

export function TextareaField({
  label,
  required,
  optional,
  hint,
  error,
  className = '',
  rows = 4,
  ...input
}) {
  const id = useId();
  return (
    <div className={className}>
      <Shell id={id} label={label} required={required} optional={optional} hint={hint} error={error}>
        <textarea className="field-textarea" rows={rows} required={required} {...input} />
      </Shell>
    </div>
  );
}

export function SelectField({
  label,
  required,
  optional,
  hint,
  error,
  options,
  className = '',
  placeholder,
  ...input
}) {
  const id = useId();
  return (
    <div className={className}>
      <Shell id={id} label={label} required={required} optional={optional} hint={hint} error={error}>
        <select className="field-select" required={required} {...input}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const text = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
      </Shell>
    </div>
  );
}

export function CheckField({ label, checked, onChange, error, name }) {
  const id = useId();
  return (
    <div>
      <label className="field-check" htmlFor={id}>
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span className="field-check-box" aria-hidden="true">
          <Check className="h-3 w-3 stroke-[3.5]" />
        </span>
        <span className="text-[var(--fs-sm)] leading-relaxed text-[var(--ink-soft)]">{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error ml-[1.9rem]">
          {error}
        </p>
      )}
    </div>
  );
}
