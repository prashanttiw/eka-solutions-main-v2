import React, { useCallback, useRef } from 'react';

/**
 * A card that rotates toward the pointer, with a specular that tracks it.
 *
 * The rotation is small on purpose — six degrees, not twenty. A card that swings hard
 * enough to be obviously 3D also stops being readable while it is moving, and on a page
 * where the cards carry the actual argument that is a bad trade. Six degrees is enough
 * for the eye to register a surface catching light and not enough to disturb the text.
 *
 * Everything is written to CSS variables on the node rather than to React state: a
 * pointermove handler that called setState would re-render the card's whole subtree on
 * every mouse movement.
 *
 * Touch pointers and reduced-motion are handled in the stylesheet, which neutralises
 * `.tilt` outright — so the variables can be written unconditionally here and simply
 * have no effect where the tilt is not wanted.
 */
export default function TiltCard({
  as: Tag = 'div',
  className = '',
  innerClassName = '',
  max = 6,
  sheen = true,
  style,
  children,
  ...rest
}) {
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const frame = useRef(0);

  const handleMove = useCallback(
    (event) => {
      const stage = stageRef.current;
      const card = cardRef.current;
      if (!stage || !card) return;
      if (frame.current) return;

      const { clientX, clientY } = event;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // -0.5 → 0.5 across each axis, so the rest position is the centre of the card.
        const x = (clientX - rect.left) / rect.width - 0.5;
        const y = (clientY - rect.top) / rect.height - 0.5;

        // Y drives rotateX and X drives rotateY: pushing the pointer toward the top of
        // the card has to tip the top edge away, which is the opposite axis.
        card.style.setProperty('--tilt-x', `${(-y * max).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * max).toFixed(2)}deg`);
        card.style.setProperty('--sheen-x', `${((x + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty('--sheen-y', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
    },
    [max],
  );

  const handleEnter = useCallback(() => {
    cardRef.current?.classList.add('is-tilting');
  }, []);

  const handleLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    // Drop the fast tracking transition before resetting, so the card eases back to flat
    // over half a second instead of snapping.
    card.classList.remove('is-tilting');
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  }, []);

  return (
    <Tag
      ref={stageRef}
      className={`tilt-stage ${className}`}
      style={style}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      {...rest}
    >
      <div ref={cardRef} className={`tilt relative h-full ${innerClassName}`}>
        {children}
        {sheen && <span aria-hidden="true" className="tilt-sheen" />}
      </div>
    </Tag>
  );
}
