import { type ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  name: string
  className?: string
  /** Фон ячейки: обычно <Image> + градиентная подложка для читаемости. */
  background: ReactNode
  Icon: React.ElementType
  description: string
  href: string
  cta: string
}

/**
 * Bento-сетка (адаптация Magic UI): ровные ряды карточек-ссылок с обложкой.
 * Ячейка целиком — ссылка; на lg+ строка CTA всплывает по hover.
 * Токены проекта: rounded-panel, text-foreground поверх фото-базы bg-cta.
 */
const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[15rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: BentoCardProps) => (
  <Link
    href={href}
    className={cn(
      "group relative col-span-1 flex flex-col justify-end overflow-hidden rounded-panel border border-border bg-cta",
      className
    )}
  >
    {background}
    <div className="pointer-events-none relative z-10 flex transform-gpu flex-col gap-1 p-5 transition-transform duration-300 lg:group-hover:-translate-y-8">
      <Icon
        className="size-7 origin-left transform-gpu text-white/90 transition-transform duration-300 ease-in-out group-hover:scale-90"
        aria-hidden
      />
      <h3 className="font-display text-lg font-bold tracking-tight text-white">
        {name}
      </h3>
      <p className="max-w-lg text-sm leading-snug text-white/75">{description}</p>
    </div>

    <div className="relative z-10 flex flex-row items-center px-5 pb-5 lg:pointer-events-none lg:absolute lg:bottom-0 lg:translate-y-9 lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        {cta}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </div>
  </Link>
)

export { BentoCard, BentoGrid }
