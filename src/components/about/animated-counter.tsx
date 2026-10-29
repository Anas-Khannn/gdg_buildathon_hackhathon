"use client";

import React, { useState, useEffect } from "react";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [val, setVal] = useState<number>(from);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * easeProgress;
      setVal(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setVal(to);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [from, to, duration]);

  const displayVal = Number.isInteger(to) ? Math.round(val) : val.toFixed(1);

  return (
    <span className={className}>
      {prefix}
      {displayVal}
      {suffix}
    </span>
  );
}

