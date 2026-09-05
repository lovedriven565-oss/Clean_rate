"use client";

import { motion } from "motion/react";
import { BadgeCheck, Building2, Check, List, Phone, Search, Users } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PartnerLeadForm } from "@/components/PartnerLeadForm";
import { StatCounter } from "@/components/StatCounter";
import { Button } from "@/components/ui/primitives";
import { trustStats } from "@/lib/mock-data";


const steps = [
  {
    icon: List,
    title: "Оставьте заявку",
    description: "Расскажите о компании, услугах и городе — мы перезвоним в тот же день.",
  },
  {
    icon: BadgeCheck,
    title: "Получите карточку",
    description: "Создадим профиль с реальными контактами и ценами. Базовое размещение бесплатно.",
  },
  {
    icon: Users,
    title: "Получайте клиентов",
    description: "Вашу компанию найдут через поиск и фильтры. Клиенты связываются напрямую по указанным контактам.",
  },
];

const features = [
  "Карточка с контактами и ценами",
  "Честный рейтинг на основе отзывов",
  "Прямые контакты клиентов — без посредника",
];

const partnerFeatures = [
  "Бейдж «Партнёр платформы»",
  "Приоритет в топе категории",
  "Повышенная видимость в каталоге",
  "Помощь в оформлении карточки",
];

export default function ForPartnersPage() {
  function scrollToForm() {
    document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="bg-fresh relative overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
          />
          <div className="container relative flex flex-col items-center gap-6 py-20 text-center sm:py-28">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm"
            >
              <Building2 className="h-4 w-4 text-primary" />
              Для клининговых компаний
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-3xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
            >
              Получайте клиентов через{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                честный рейтинг Минска
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl text-lg text-muted-foreground"
            >
              Разместите компанию в каталоге бесплатно или подключите пакет «Партнёр платформы» для
              приоритетной видимости — без накрутки рейтинга.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" onClick={scrollToForm}>
                <Phone className="h-4 w-4" />
                Отправить заявку
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/30">
          <div className="container grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
            {trustStats.map((stat) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals}
                label={stat.label}
              />
            ))}
          </div>
        </section>

        <section className="container py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-6 text-center"
              >
                <span className="mx-flex mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container pb-16 sm:pb-20">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Два честных варианта размещения
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Органический рейтинг нельзя купить. Платное размещение всегда помечено и не влияет на
              итоговую оценку.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-[var(--radius)] border border-border bg-card p-8"
            >
              <h3 className="font-display text-xl font-bold text-foreground">Базовое размещение</h3>
              <p className="mt-1 text-muted-foreground">Бесплатно и навсегда</p>
              <ul className="mt-6 flex flex-col gap-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-[var(--radius)] border-2 border-primary bg-card p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Партнёр платформы</h3>
                  <p className="mt-1 text-muted-foreground">Расчёт в заявке</p>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  Рекомендуем
                </span>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {partnerFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground">
                Стоимость обсуждается индивидуально. Никакой влияния на органический рейтинг — только
                видимость и приоритет в каталоге.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="partner-form" className="border-t border-border bg-muted/30">
          <div className="container grid grid-cols-1 gap-10 py-16 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Оставьте заявку
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Мы перезвоним, расскажем, как устроен каталог, и обсудим, какой вариант размещения вам
                подходит.
              </p>
            </div>
            <PartnerLeadForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
