import React from 'react';

/**
 * Static card wrapper retained for the existing call sites.
 * V2 deliberately removes the pointer-following 3D tilt and sheen: those effects scheduled
 * work for every pointer movement without making the content easier to use.
 */
export default function TiltCard({
  as: Tag = 'div',
  className = '',
  innerClassName = '',
  style,
  children,
  ...rest
}) {
  return (
    <Tag
      className={className}
      style={style}
      {...rest}
    >
      <div className={`relative h-full ${innerClassName}`}>
        {children}
      </div>
    </Tag>
  );
}
