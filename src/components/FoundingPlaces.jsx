import React from 'react';
import { FOUNDING, foundingLeft } from '../lib/founding';

/**
 * The twenty-five places as a small mark: the number, set in the serif, beside a 5 × 5 grid of
 * dots. Filled dots appear only once places are genuinely taken (see lib/founding.js).
 */
export default function FoundingPlaces({ tone = 'light', className = '' }) {
  const left = foundingLeft();
  const taken = FOUNDING.taken ?? 0;
  const label = left === null ? `${FOUNDING.total} founding places` : `${left} of ${FOUNDING.total} founding places left`;

  return (
    <div className={`places places-${tone} ${className}`.trim()}>
      <div className="places-mark">
        <strong className="places-number">{left === null ? FOUNDING.total : left}</strong>
        <div className="places-grid" role="img" aria-label={label}>
          {Array.from({ length: FOUNDING.total }, (_, index) => <i key={index} className={index < taken ? 'is-taken' : undefined} />)}
        </div>
      </div>
      <p className="places-caption">
        {left === null ? 'Founding places in total. When they are gone, the programme closes.' : `Of ${FOUNDING.total} places still open. When they are gone, the programme closes.`}
      </p>
    </div>
  );
}
