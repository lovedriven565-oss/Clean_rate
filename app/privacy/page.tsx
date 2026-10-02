import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Клининг Рейтинг",
  description:
    "Политика конфиденциальности платформы Клининг Рейтинг: какие данные собираются, как они хранятся и как мы защищаем персональную информацию.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="container py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Политика конфиденциальности
            </h1>

            <div className="mt-8 flex flex-col gap-6 text-foreground/90">
              <p>
                Платформа <strong>Клининг Рейтинг</strong> действует как честный каталог:
                мы показываем публичные контакты клининговых компаний и не выступаем
                посредником между клиентом и исполнителем.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                1. Какие данные не собираются
              </h2>
              <p>
                Мы не собираем, не обрабатываем и не храним персональные данные
                конечных пользователей каталога: имена, телефоны, адреса, email и прочие
                идентификаторы.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                2. Обезличенная аналитика
              </h2>
              <p>
                При кликах по контактам компаний (телефон, сайт, Telegram) фиксируются
                только обезличенные события: идентификатор компании, тип клика и страница,
                с которой совершён клик. Никаких данных, позволяющих идентифицировать
                пользователя, не передаётся.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                3. Веб-аналитика
              </h2>
              <p>
                Для оценки посещаемости могут использоваться Яндекс Метрика и
                Cloudflare Web Analytics. Эти сервисы собирают обезличенную
                статистику (страницы, источники переходов, тип устройства) и могут
                устанавливать собственные cookie по своим условиям обработки
                данных. Отключить Метрику можно официальным блокировщиком
                Яндекса или настройками браузера.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                4. B2B-заявки
              </h2>
              <p>
                Формы для компаний и рекламодателей (размещение в каталоге, партнёрство,
                реклама) требуют контактных данных: название компании, имя контактного
                лица, телефон, город. Эти данные используются исключительно для связи по
                вопросам размещения и не передаются третьим лицам без согласия.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                5. Хранение и безопасность
              </h2>
              <p>
                Заявки B2B пересылаются в защищённый Telegram-чат владельца платформы.
                Данные не размещаются в открытом доступе и не используются для массовых
                рассылок.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                6. Согласие
              </h2>
              <p>
                Отправляя B2B-форму, вы подтверждаете согласие на обработку указанных
                персональных данных в соответствии с настоящей политикой.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
