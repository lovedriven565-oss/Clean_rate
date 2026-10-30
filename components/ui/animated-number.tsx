'use client';
import { cn } from '@/lib/utils';
import { motion, SpringOptions, useReducedMotion, useSpring, useTransform } from 'motion/react';
import React, { useEffect, useRef } from 'react';

// Motion components are declared at module scope (never created during render).
const motionComponents = {
  span: motion.span,
  div: motion.div,
  p: motion.p,
} as const;

export type AnimatedNumberTag = keyof typeof motionComponents;

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: AnimatedNumberTag;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const MotionComponent = motionComponents[as];

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString('ru-RU')
  );
  const mounted = useRef(false);

  // SSR и первая отрисовка показывают итоговое значение; после гидрации —
  // один честный count-up с нуля. При reduced-motion число ставится сразу.
  useEffect(() => {
    if (reduce) {
      spring.jump(value);
    } else if (!mounted.current) {
      spring.jump(0);
      spring.set(value);
    } else {
      spring.set(value);
    }
    mounted.current = true;
  }, [spring, value, reduce]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
