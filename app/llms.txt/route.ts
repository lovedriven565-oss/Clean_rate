import { getAllCompanies, getAllSolutions } from "@/lib/db/queries";
import { absoluteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { getIndexableLandings } from "@/lib/landing";
import { CATEGORIES, getCategorySlug } from "@/lib/categories";
import { ENABLED_MARKETS, openCities } from "@/lib/markets";

export const dynamic = "force-dynamic";

/**
 * /llms.txt — карта сайта для LLM-агентов (ChatGPT Search, Perplexity, Claude).
 * Кратко описывает платформу, принципы и ключевые машиночитаемые разделы.
 */
export async function GET() {
  const [solutions, companies] = await Promise.all([getAllSolutions(), getAllCompanies()]);
  const published = solutions.filter((s) => s.status === "published");
  const indexableLandings = getIndexableLandings(companies);
  const cityHubs = ENABLED_MARKETS.flatMap((market) => openCities(market));

  const lines: string[] = [
    `# ${SITE_NAME}`,
    ``,
    `> ${SITE_TAGLINE}. Платформа объединяет пошаговые протоколы очистки`,
    `> поверхностей, открытый рейтинг клининговых компаний и каталог профессиональных`,
    `> брендов и средств для рынка Беларуси, России и Казахстана.`,
    ``,
    `## Принципы`,
    ``,
    `- Рейтинг компаний считается по открытым источникам отзывов; платные размещения`,
    `  помечены отдельно и не влияют на органическую позицию.`,
    `- Каждый протокол решения проверен редакцией технологов и содержит ограничения,`,
    `  шаги DIY и критерий эскалации к профессионалу.`,
    `- Цены — ориентиры из открытых смет и карточек компаний, а не оферта платформы.`,
    ``,
    `## Ключевые разделы`,
    ``,
    `- [Главная](${absoluteUrl("/")}): обзор платформы и поиск`,
    `- [Решения задач](${absoluteUrl("/solutions")}): протоколы «убрать самому или вызвать мастера»`,
    `- [Рейтинг компаний](${absoluteUrl("/rating")}): каталог клининговых компаний с контактами`,
    `- [Методология рейтинга](${absoluteUrl("/rating/methodology")}): как считается оценка`,
    `- [Бренды и средства](${absoluteUrl("/brands")}): профессиональная химия и техника`,
    `- [ИИ-консультант](${absoluteUrl("/assistant")}): подбор решения по описанию задачи`,
    `- [Для компаний](${absoluteUrl("/for-partners")}): размещение и подтверждение профиля`,
    ``,
    `## Города`,
    ``,
    ...cityHubs.map((city) => `- [${city.nameIn}](${absoluteUrl(`/${city.slug}`)}): клининговые компании и услуги`),
    ``,
    `## Услуги по городам (индексируемые посадочные)`,
    ``,
    ...indexableLandings.map(({ city, category }) => {
      const cat = CATEGORIES.find((c) => getCategorySlug(c.id) === category);
      return `- [${cat?.name ?? category} в ${city}](${absoluteUrl(`/${city}/${category}`)})`;
    }),
    ``,
    `## Протоколы решений`,
    ``,
    ...published.map((s) => `- [${s.title}](${absoluteUrl(`/solutions/${s.slug}`)})`),
    ``,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
