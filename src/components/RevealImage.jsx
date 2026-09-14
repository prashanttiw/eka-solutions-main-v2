import React from 'react';
import { useInView } from '../hooks/useInView';

export default function RevealImage({ src, alt, className = '', imgClassName = '', loading = 'lazy' }) {
  const [ref, isVisible] = useInView({ threshold: 0.15 });
  return (
    <div ref={ref} className={`kb-frame ${isVisible ? 'is-visible' : ''} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`kb-image h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
