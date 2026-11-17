"use client";

import { useLayoutEffect, useRef } from "react";

type Props = {
  value: number;
  /** Turns the number into the text that is shown, for example the rupee format. */
  format: (value: number) => string;
};

/** A figure that glides to its new value instead of jumping, so a change in the price is seen.
    It shows the new value at once when motion is off. The text React renders is always the final one. */
export default function TweenNumber({ value, format }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useLayoutEffect(() => {
    const node = ref.current?.firstChild;
    const from = shown.current;
    if (!node || from === value || !document.documentElement.classList.contains("mo")) {
      shown.current = value;
      return;
    }
    const duration = 520;
    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = t >= 1 ? value : Math.round(from + (value - from) * eased);
      shown.current = current;
      node.nodeValue = format(current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    // Before the first paint the figure still shows the old value, then it moves.
    node.nodeValue = format(from);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, format]);

  return <span ref={ref}>{format(value)}</span>;
}
