"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const prevRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();

    function step(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setValue(to);
        prevRef.current = to;
      }
    }
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}
