import React from 'react';
import '../brand.css';

// Shared assets are cut from the supplied artwork, including its custom lettering.
// Keep the mark blue; only the wordmark switches to a light ink on dark surfaces.
export default function BrandLogo({
  layout = 'horizontal',
  inverse = false,
  decorative = false,
  priority = false,
  className = '',
}) {
  return (
    <span
      className={`brand-logo brand-logo--${layout}${inverse ? ' brand-logo--inverse' : ''} ${className}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'EKA Solution'}
      aria-hidden={decorative || undefined}
    >
      {layout !== 'wordmark' && (
        <img
          className="brand-symbol"
          src="/brand/eka-symbol.webp"
          width="384"
          height="322"
          alt=""
          draggable="false"
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
        />
      )}
      {layout !== 'symbol' && (
        <img
          className="brand-wordmark"
          src="/brand/eka-wordmark.webp"
          width="560"
          height="149"
          alt=""
          draggable="false"
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
        />
      )}
    </span>
  );
}
