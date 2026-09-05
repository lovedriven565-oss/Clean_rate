import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  Building2,
  TrendingUp,
  MapPinned,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { CompanyCard } from "@/components/CompanyCard";
import { HomeSearch } from "@/components/HomeSearch";
import { StatCounter } from "@/components/StatCounter";
import { CleanGraph } from "@/components/visual/CleanGraph";
import { getAllBrands, getAllCategories, getAllCompanies } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Клининг Рейтинг — платформа индустрии чистоты Беларуси",
  description:
    "Компании, бренды, поставщики и профессиональные решения для индустрии чистоты Беларуси. Открытые источники рейтинга и прямые контакты.",
};

export default async function Home() {
  const [companies, brands, categories] = await Promise.all([
    getAllCompanies(),
    getAllBrands(),
    getAllCategories(),
  ]);

  // Партнёры платформы (открытое платное размещение) показываются первыми, порядок остальных —
  // как в каталоге. Это не рейтинг по качеству — честный рейтинг по отзывам появится, когда
  // у компаний будут проверенные отзывы.
  const homeCompanies = [...companies].sort((a, b) => Number(b.promoted) - Number(a.promoted));

const intents = [
  {
    icon: Users,
    eyebrow: "Для заказчиков",
    title: "Найти подрядчика",
    description: "Сравнить специализацию, географию, цены и источники рейтинга клининговых компаний.",
    href: "/rating",
    action: "Открыть рейтинг",
  },
  {
    icon: Boxes,
    eyebrow: "Для профессионалов",
    title: "Найти оборудование",
    description: "Изучить бренды, продукты, дилеров и подтверждённые сценарии применения.",
    href: "/brands",
    action: "Смотреть решения",
  },
  {
    icon: BookOpen,
    eyebrow: "Знания рынка",
    title: "Выбрать технологию",
    description: "Практические материалы, методология рейтинга и будущие исследования индустрии.",
    href: "/brands",
    action: "Изучить платформу",
  },
  {
    icon: Building2,
    eyebrow: "Для бизнеса",
    title: "Развивать компанию",
    description: "Подтвердить профиль, показать компетенции и получать прямые обращения без посредника.",
    href: "/for-partners",
    action: "Разместить компанию",
  },
];

const steps = [
  {
    icon: MapPinned,
    title: "Собираем рынок",
    description: "Компании, услуги, бренды и контакты объединяются в единой отраслевой структуре.",
  },
  {
    icon: BadgeCheck,
    title: "Показываем источники",
    description: "Оценки, верификация и коммерческие размещения не смешиваются между собой.",
  },
  {
    icon: Network,
    title: "Связываем участников",
    description: "Заказчики находят исполнителей, а профессионалы — технику, дилеров и знания.",
  },
];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-fresh relative overflow-hidden border-b border-border/80">
          <div className="bg-grid-fade absolute inset-0" aria-hidden />
          <div className="pointer-events-none absolute left-[12%] top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute right-[6%] top-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden />

          <div className="container relative grid items-center gap-12 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
            <div className="flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Беларусь · платформа формируется
              </span>
              <h1 className="mt-7 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
                Инфраструктура рынка
                <span className="mt-1 block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  профессиональной чистоты
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Рейтинг клининговых компаний остаётся в центре. Вокруг него мы объединяем бренды,
                поставщиков, оборудование и знания — с открытыми источниками и без продажи оценки.
              </p>
              <div className="mt-8 w-full">
                <HomeSearch />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                <Link href="/rating" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80">
                  Смотреть рейтинг
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                <Link href="/for-partners" className="font-medium text-muted-foreground hover:text-foreground">
                  Подтвердить профиль компании
                </Link>
              </div>
            </div>

            <CleanGraph />
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-b border-border bg-card/70">
          <div className="container grid grid-cols-1 gap-4 py-8 sm:grid-cols-3">
            <StatCounter value={companies.length} label="компаний в каталоге" />
            <StatCounter value={categories.length} label="категорий услуг" />
            <StatCounter value={brands.length} label="брендов и решений" />
          </div>
        </section>

        <section className="container py-18 sm:py-24">
          <div className="mb-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Одна платформа</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
                Начните со своей задачи
              </h2>
            </div>
            <p className="max-w-2xl text-muted-foreground lg:justify-self-end">
              Интерфейс разделяет сценарии частного клиента, клининговой компании и поставщика,
              но связывает их общей структурой рынка.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {intents.map((intent) => (
              <Link
                key={intent.title}
                href={intent.href}
                className="data-surface group rounded-[1.75rem] border border-border/80 p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-2xl sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <intent.icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <span className="mt-8 block text-xs font-bold uppercase tracking-[0.18em] text-primary">{intent.eyebrow}</span>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{intent.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{intent.description}</p>
                <span className="mt-6 inline-flex text-sm font-semibold text-foreground">{intent.action}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="border-y border-border bg-muted/35 py-18 sm:py-24">
          <div className="container">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Рынок услуг</span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-foreground">Категории клининга</h2>
              </div>
              <Link href="/rating" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Все компании
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  brand={brands.find((brand) => brand.id === category.brandId && brand.isSponsor)}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container py-18 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Принцип платформы</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                Доверие строится на структуре данных
              </h2>
              <p className="mt-4 text-muted-foreground">
                Платный охват возможен, покупка органической оценки — нет.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="relative rounded-[1.5rem] border border-border bg-card p-6">
                  <span className="absolute right-5 top-4 font-display text-4xl font-bold text-muted">0{index + 1}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-8 font-display text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top companies */}
        <section className="border-y border-border bg-card py-18 sm:py-24">
          <div className="container">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Рейтинг сохраняется
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                  Компании из каталога
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Источник оценки показывается открыто. Коммерческое размещение маркируется и не должно менять органический балл.
                </p>
              </div>
              <Link href="/rating" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                Открыть весь рейтинг
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {homeCompanies.slice(0, 3).map((company, index) => (
                <CompanyCard key={company.id} company={company} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="container py-18 sm:py-24">
          <div className="data-surface grid gap-8 rounded-[2rem] border border-border p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h2 className="mt-6 font-display text-3xl font-bold tracking-[-0.035em] text-foreground">
                Реклама видима. Источник данных проверяем. Контакт остаётся прямым.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Мы строим отраслевую инфраструктуру, а не посредника между клиентом и исполнителем.
              </p>
            </div>
            <div className="grid min-w-56 gap-3 text-sm">
              <span className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-3"><BadgeCheck className="h-4 w-4 text-primary" /> Источник оценки</span>
              <span className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-3"><Wrench className="h-4 w-4 text-primary" /> Связи с брендами</span>
              <span className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-3"><Network className="h-4 w-4 text-primary" /> Прямые контакты</span>
            </div>
          </div>
        </section>

        {/* B2B teaser */}
        <section className="container pb-18 sm:pb-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-foreground p-8 text-background sm:p-12 lg:p-16">
            <div className="bg-grid-fade absolute inset-0 opacity-20" aria-hidden />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Компаниям и брендам</span>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                  Станьте частью карты рынка, а не ещё одним рекламным баннером
                </h2>
                <p className="mt-5 max-w-2xl text-background/65">
                  Подтвердите данные компании или обсудите пилотное размещение бренда с прозрачной аналитикой.
                </p>
              </div>
              <Link
                href="/for-partners"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Разместить бизнес
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
