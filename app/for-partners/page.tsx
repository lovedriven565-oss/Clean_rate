"use client";

import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, Building2, Check, Phone, ShieldCheck, Users } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PartnerLeadForm } from "@/components/PartnerLeadForm";
import { StatCounter } from "@/components/StatCounter";
import { Button } from "@/components/ui/primitives";
import { categories, companies } from "@/lib/mock-data";
import { ENABLED_MARKETS } from "@/lib/markets";
import { pluralize } from "@/lib/format";

const enabledCities = ENABLED_MARKETS.flatMap((market) => market.cities.map((city) => city.name));

const steps = [
  {
    order: "01",
    title: "Оставьте заявку",
    description: "Расскажите о компании, услугах и городе: мы свяжемся и уточним детали.",
  },
  {
    order: "02",
    title: "Получите карточку",
    description: "Создадим профиль с реальными контактами, перечнем услуг и ценами. Базовое размещение бесплатно.",
  },
  {
    order: "03",
    title: "Получайте клиентов напрямую",
    description: "Вашу компанию находят через поиск и фильтры. Звонки и сообщения приходят напрямую без комиссии сервиса.",
  },
];

const features = [
  "Карточка с прямыми контактами и ценами",
  "Органический рейтинг на основе реальных отзывов",
  "Прямой контакт клиентов без комиссии платформы",
  "Участие в рекомендациях каталога и протоколах",
];

const partnerFeatures = [
  "Бейдж «Спонсор» с открытой маркировкой",
  "Приоритетная видимость в каталоге и категориях",
  "Спецразмещение в протоколах решений",
  "Помощь редакции в наполнении профиля",
];

export default function ForPartnersPage() {
  const reduce = useReducedMotion();

  function scrollToForm() {
    document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Split Hero */}
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div className="container relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                <Building2 className="h-3.5 w-3.5" />
                Клининговым компаниям
              </span>

              <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                Получайте клиентов через независимый рейтинг
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Разместите компанию в каталоге бесплатно или подключите пакет приоритетной видимости:
                без накруток, с прямыми звонками и прозрачной аналитикой.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={scrollToForm}>
                  <Phone className="h-4 w-4" />
                  Отправить заявку
                </Button>
              </div>
            </motion.div>

            {/* Right: real model highlight */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="data-surface rounded-panel border border-border p-7 sm:p-9"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                Принципы размещения
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
                Честные условия для каждого подрядчика
              </h2>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span><strong>Базовый профиль бесплатен:</strong> мы не требуем обязательных платежей за нахождение в каталоге.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span><strong>Прямой контакт:</strong> телефон и Telegram ведут напрямую к вам, без скрытых комиссий с каждого заказа.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span><strong>Рейтинг не продаётся:</strong> органическая оценка рассчитывается по открытым отзывам, платное продвижение маркируется отдельно.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Honest Stats */}
        <section className="border-b border-border bg-muted/30">
          <div className="container grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
            <StatCounter value={companies.length} label="компаний в каталоге" />
            <StatCounter value={categories.length} label="категорий услуг" />
            <StatCounter
              value={enabledCities.length}
              suffix={` ${pluralize(enabledCities.length, ["город", "города", "городов"]).split(" ")[1]}`}
              label={enabledCities.join(" и ")}
            />
          </div>
        </section>

        {/* Steps: Editorial Numbered Flow */}
        <section className="container py-16 sm:py-24">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
              Как подключиться к платформе
            </h2>
            <p className="mt-3 text-muted-foreground">
              Простой и прозрачный процесс от заявки до первых звонков.
            </p>
          </div>

          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.order} className="relative border-t border-border pt-6">
                <span className="font-display text-5xl font-bold leading-none tracking-[-0.05em] text-muted sm:text-6xl">
                  {step.order}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.02em] text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Two Plans */}
        <section className="border-y border-border bg-muted/20 py-16 sm:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                Два варианта размещения
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Органический рейтинг нельзя купить: платное размещение всегда маркируется и не влияет на расчёт баллов.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-panel border border-border bg-card p-8 sm:p-10">
                <h3 className="font-display text-2xl font-bold text-foreground">Базовое размещение</h3>
                <p className="mt-1 font-semibold text-primary">Бесплатно навсегда</p>
                <ul className="mt-7 flex flex-col gap-3.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-panel border-2 border-primary bg-card p-8 sm:p-10 shadow-lg shadow-primary/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Партнёр платформы</h3>
                    <p className="mt-1 font-semibold text-muted-foreground">Индивидуальный расчёт</p>
                  </div>
                  <span className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground">
                    Максимум охвата
                  </span>
                </div>
                <ul className="mt-7 flex flex-col gap-3.5">
                  {partnerFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                  Стоимость зависит от города и категорий. Не влияет на органический рейтинг: только охват и позиция в спонсорском блоке.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form section */}
        <section id="partner-form" className="container py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
                Оставьте заявку
              </h2>
              <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
                Мы перезвоним, поможем оформить карточку и ответим на все вопросы о платформе.
              </p>
              <div className="mt-8 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </span>
                  <span>Без скрытых комиссий с заказов</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BadgeCheck className="h-4 w-4" />
                  </span>
                  <span>Официальная верификация данных</span>
                </div>
              </div>
            </div>
            <PartnerLeadForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
