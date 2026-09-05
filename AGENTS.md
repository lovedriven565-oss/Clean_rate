# CLEANHUB — памятка для Devin

## Стек
- Next.js 16.3.3 (App Router), React 19
- Tailwind CSS 4 (`@theme inline` в `globals.css`)
- OpenNext Cloudflare (`npm run preview` / `npm run deploy`)
- D1 (SQLite) + Drizzle ORM + seed-fallback
- Статический рынок в `lib/markets.ts`: BY (Минск/Брест), RU (Москва/СПб), KZ (Алматы/Астана)

## Команды
- `npm run typecheck` — проверка типов
- `npm run lint` — ESLint
- `npm run test` — 9 тестов: `tests/rating.test.ts` + `tests/solutions.test.ts`
- `npm run build` — Next.js build
- `npm run db:generate` — генерация D1-миграций
- `npm run preview` / `npm run deploy` — Cloudflare

## Что уже выполнено (Спринт 1)
### Шаг 1 — мультирегиональность
- `lib/markets.ts` — рынки BY/RU/KZ, валюты, города, хелперы
- `components/providers/RegionProvider.tsx` — контекст + cookie `ch_region` (365 дней, `samesite=lax`)
- `lib/format.ts` — `formatMarketCurrency` / `formatMarketPriceFrom` (BYN/RUB/KZT)
- `app/layout.tsx` — `children` обёрнуты в `<RegionProvider>`

### Шаг 2 — продуктовый граф
- `db/schema.ts` — новые таблицы: `solutions`, `solution_products`, `intent_keywords`, `price_estimates`
- `migrations/0002_eager_jack_flag.sql` — сгенерированная миграция
- `db/seed-data.ts` — 10 решений, 68 ключевых слов интента, сметы по 3 странам; добавлены бренды `kiehl`, `prochem`
- `lib/types.ts` — типы `Solution`, `IntentKeyword`, `PriceEstimate`
- `lib/db/queries.ts` — `getAllSolutions`, `getSolutionBySlug`, `getSolutionSlugs`, `getSolutionsByCategory`, `getPriceEstimates`, `getIntentKeywords`
- `tests/solutions.test.ts` — 5 тестов графа решений

## Шаг 3 — AI-ready умный поиск (сделано)
- `lib/search/intent-router.ts` — чистая функция `classifyIntent(query, keywords)` → `{ intent, target, confidence, matchedKeyword }`; совпадение по двустороннему includes + вес + длина ключа как тай-брейк. Адаптер `SearchProvider`/`KeywordProvider` — готов к замене на `AiProvider` (Workers AI embeddings) без изменения вызывающего кода.
- `app/api/search/route.ts` — `GET /api/search?q=...`: читает `ch_region` из cookie запроса → рынок → города для фильтра компаний; классифицирует интент; возвращает `{ query, intent, target, confidence, solutions[], companies[], brands[] }`; `Cache-Control: s-maxage=60`.
- `components/SmartSearch.tsx` — строка поиска (стиль `HomeSearch`) + тумблер `[Для дома | Для бизнеса | Для профи]` (переопределяет авто-интент) + 5 чипов + дропдаун подсказок (debounce 200ms) с секциями Решения/Компании/Бренды; Enter/клик маршрутизируют по `target`/`intent` (`/solutions/{slug}`, `/brands/{slug}`, `/rating?category=...`, `/rating?q=...&intent=b2b`, `/brands?q=...`).
- `tests/intent-router.test.ts` — 6 тестов классификатора (b2c/b2b/pro, нет совпадений, пустой запрос, адаптер).
- Известное ограничение (не баг): `KeywordProvider` матчит по подстроке без морфологии — «вина» (родительный падеж) не совпадёт с ключом «вино на диване». Это ожидаемо для keyword-адаптера; закрывается будущим `AiProvider`.
- **Не сделано в Шаге 3** (осознанно, по плану — это Шаг 4/5): `/solutions/[slug]` страниц ещё нет, поэтому переход по `target.kind === "solution"` из SmartSearch будет вести на несуществующий маршрут до Шага 4; SmartSearch не подключён на главную и в Navbar (это Шаг 5).

## Следующая задача: Шаг 4 — страницы решений «Два пути»
См. план: `app/solutions/page.tsx`, `app/solutions/[slug]/page.tsx`, `components/solution/{DiyPanel,ProPanel,WarningList,PriceRange}.tsx`, JSON-LD (HowTo/FAQPage).

### Проверки после Шага 3 (пройдены)
- `npm run typecheck` — 0 ошибок
- `npm run lint` — чисто
- `npm run test` — 15/15 (добавлены 6 тестов intent-router)
- `npm run build` — `/api/search` собран как `ƒ` (dynamic)
- Вручную: «вино на диване» → b2c/solution `vino-na-divane`; «офис 500 м²» → b2b/category `offices`; «Kiehl» → pro/brand `kiehl`

## Полный план
- `C:/Users/gushc/.devin/plans/plan-1f8ec360ec5f573f.md`
