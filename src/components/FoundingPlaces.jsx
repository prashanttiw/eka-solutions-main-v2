import React from 'react';
import { FOUNDING, foundingLeft } from '../lib/founding';

/** Twenty-five marks, one per place. Filled marks appear only once real places are taken. */
export default function FoundingPlaces({ className = '' }) {
  const left = foundingLeft();
  const taken = FOUNDING.taken ?? 0;
  const label = left === null ? `${FOUNDING.total} founding places` : `${left} of ${FOUNDING.total} founding places left`;

  return (
    <div className={`places ${className}`.trim()}>
      <div className="places-grid" role="img" aria-label={label}>
        {Array.from({ length: FOUNDING.total }, (_, index) => <i key={index} className={index < taken ? 'is-taken' : undefined} />)}
      </div>
      <p className="places-caption">
        <strong>{left === null ? FOUNDING.total : left}</strong>
        <span>{left === null ? 'founding places, in total. When they are gone, the programme closes.' : `of ${FOUNDING.total} places still open. When they are gone, the programme closes.`}</span>
      </p>
    </div>
  );
}
