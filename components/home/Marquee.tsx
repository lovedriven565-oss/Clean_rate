import { cn } from "@/lib/utils";

/**
 * Бесшовная бегущая строка на CSS-анимации: пауза на hover, остановка при prefers-reduced-motion.
 * Keyframes объявлены локально, чтобы не трогать globals.css.
 */
export function Marquee({
  children,
  duration = 40,
  className,
  reverse = false,
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <style>{`@keyframes ch-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div
        className="flex w-max gap-3 group-hover:[animation-play-state:paused] motion-reduce:[animation:none]"
        style={{ animation: `ch-marquee ${duration}s linear infinite${reverse ? " reverse" : ""}` }}
      >
        <div className="flex shrink-0 gap-3">{children}</div>
        <div className="flex shrink-0 gap-3" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
