import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { pageAlternates, SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description:
    `Пользовательское соглашение платформы ${SITE_NAME}: роль каталога, рейтинг и рекламные размещения, партнёрские ссылки, ограничение ответственности.`,
  alternates: pageAlternates("/terms"),
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main id="content" className="flex-1">
        <section className="container py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Пользовательское соглашение
            </h1>

            <div className="mt-8 flex flex-col gap-6 text-foreground/90">
              <h2 className="font-display text-xl font-semibold text-foreground">
                1. Роль платформы
              </h2>
              <p>
                <strong>{SITE_NAME}</strong> — информационный каталог: пошаговые
                протоколы решения задач чистоты, рейтинг клининговых компаний и
                каталог брендов. Платформа не оказывает клининговые услуги, не
                выступает посредником и не является стороной договора между
                клиентом и компанией. Контакты компаний публикуются открыто —
                договорённости вы достигаете с исполнителем напрямую.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                2. Точность информации
              </h2>
              <p>
                Протоколы и сметы носят справочный характер: цены являются
                ориентиром, точную стоимость называет компания после осмотра
                объекта. Перед применением любого средства проверяйте его
                совместимость с вашей поверхностью на незаметном участке и
                следуйте инструкции производителя.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                3. Рейтинг и рекламные размещения
              </h2>
              <p>
                Органический порядок компаний рассчитывается по открытой
                методологии и не зависит от оплаты. Платные размещения помечены
                словом «Реклама» (для рынка РФ — с токеном erid), выносятся в
                отдельные слоты и не влияют на ранги в рейтинге.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                4. Партнёрские ссылки
              </h2>
              <p>
                Часть ссылок «Где купить» ведёт к дилерам и магазинам по
                партнёрским программам: платформа может получать вознаграждение
                за переход или покупку. Это не меняет цену для вас и не влияет
                на подбор средств в протоколах.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                5. Ограничение ответственности
              </h2>
              <p>
                Платформа не отвечает за качество услуг компаний, действия
                пользователей по протоколам и содержимое внешних сайтов, на
                которые ведут ссылки. Используя материалы сайта, вы действуете
                на свой риск.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground">
                6. Изменение условий
              </h2>
              <p>
                Соглашение может обновляться; актуальная версия всегда доступна
                на этой странице. Продолжая пользоваться платформой после
                изменений, вы принимаете новую редакцию.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
