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
- `npm run test` — 126 тестов (`tests/*.test.ts`)
- Локальная проверка: `npm run dev -- --port 3111`, затем `Invoke-WebRequest` по маршрутам (PowerShell). Перед `npm run build` остановить dev-сервер (общий `.next`)
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

## Шаг 4 — страницы решений «Два пути» (сделано)
- `lib/solutions/meta.ts` — лейблы фасетов (`PROBLEM_TYPE_LABELS`, `SURFACE_LABELS`, `SEVERITY_LABELS`, `AUDIENCE_LABELS`), `solutionSummary`, `relatedSolutions` (поверхность → тип → категория).
- `lib/solutions/structured-data.ts` — `buildSolutionFaq` (FAQ из данных решения + смет по 3 рынкам), `buildSolutionJsonLd` (`@graph`: HowTo + FAQPage + BreadcrumbList), `serializeJsonLd` (экранирует `<`).
- `components/solution/` — `WarningList` (danger-блок), `PriceRange` (client, смета в валюте рынка из cookie), `DiyPanel` (шаги, tip, средства → `/brands/{slug}`), `ProPanel` (client, 3 компании рынка: relatedCategory > promoted > verified > рейтинг; phone/telegram с `trackClick`; empty-state для RU/KZ), `SolutionCard`, `SolutionsExplorer` (client, фильтры `?type=&surface=` в URL).
- `app/solutions/page.tsx` — индекс; `app/solutions/[slug]/page.tsx` — SSG (10 страниц), хлебные крошки, дисклеймер, мобильный переключатель путей (#diy / #pro), FAQ на `<details>` (без JS), похожие решения.
- `lib/format.ts` — `pluralize(n, [шаг, шага, шагов])`.

## Шаг 5 — редизайн главной (сделано)
- `components/RegionSelector.tsx` — Base UI Select с группами по странам (`BY:minsk` и т.п.), пишет в `RegionProvider`. Варианты `pill` (Navbar) и `block` (мобильное меню).
- `components/Navbar.tsx` — пункт «Решения» первым, `RegionSelector` (desktop ≥md, в мобильном меню <md), CTA «Разместить бизнес» только ≥xl, бургер ≥lg скрыт; мобильное меню — тапы 44px+, блокировка скролла body.
- `components/MarketBadge.tsx` — бейдж «Город · Страна» в hero (client).
- `app/page.tsx` — H1 «Найдите решение любой задачи чистоты», `SmartSearch` на первом экране, `CleanGraph` только `lg+`, trust bar 4 метрики (+решения), 4 intent-карточки (Решить самому / Вызвать мастера / Офис, ТЦ / Химия и техника), секция «Частые задачи» (6 `SolutionCard`), категории, компании, принципы, B2B teaser. Секция «Trust strip» удалена (дублировала принципы). `HomeSearch` остаётся в репо, но на главной не используется.
- `app/layout.tsx` — `metadataBase`, `title.template`, OG/Twitter, robots, viewport. **Не задаёт canonical/alternates** — иначе дочерние страницы без своих метаданных наследуют canonical главной.

## Шаг 6 — SEO-техника (сделано)
- `lib/site.ts` — `SITE_URL` (env `NEXT_PUBLIC_SITE_URL`, fallback `https://cleaning-rating.by` — **уточнить реальный домен перед деплоем**), `absoluteUrl`, `pageAlternates(path)` → canonical + hreflang (ru-BY/ru-RU/ru-KZ/ru/x-default на один URL — заготовка под будущие региональные URL).
- Next не мерджит вложенный `alternates` между layout и page → каждая страница вызывает `pageAlternates(...)`. Добавлены метаданные `/rating`, `/brands` (через `app/brands/layout.tsx`, т.к. страница `"use client"`), `/for-partners` (аналогично), canonical у `/companies/[slug]` и `/brands/[slug]`.
- `app/sitemap.ts` — статические страницы + решения + компании + бренды. `/rating?category=` намеренно не включён (клиентская фильтрация = дубли HTML). `app/robots.ts` — allow `/`, disallow `/api/`.

### Проверки после Шагов 4–6 (пройдены)
- `npm run typecheck` — 0 ошибок; `npm run lint` — чисто; `npm run test` — 19/19
- `npm run build` — 47 страниц, `/solutions/[slug]` ● SSG ×10, `/sitemap.xml` и `/robots.txt` ○
- JSON-LD на `/solutions/vino-na-divane`: HowTo (3 step) + FAQPage (5) + BreadcrumbList (3); canonical + 5 hreflang на всех проверенных страницах

## Следующее (вне Спринта 1)
- Применить миграцию `0002` в проде: `wrangler d1 migrations apply cleaning-rating-db --remote`, засеять `solutions`/`intent_keywords`/`price_estimates`.
- Задать `NEXT_PUBLIC_SITE_URL` в `wrangler.jsonc` (`vars`) под реальный домен.
- `CompanyTable` форматирует цену по городу компании; при появлении компаний RU/KZ проверить `formatMarketPriceFrom`.
- OG-изображение (`opengraph-image.tsx`) — не сделано.

### Проверки после Шага 3 (пройдены)
- `npm run typecheck` — 0 ошибок
- `npm run lint` — чисто
- `npm run test` — 15/15 (добавлены 6 тестов intent-router)
- `npm run build` — `/api/search` собран как `ƒ` (dynamic)
- Вручную: «вино на диване» → b2c/solution `vino-na-divane`; «офис 500 м²» → b2b/category `offices`; «Kiehl» → pro/brand `kiehl`

## Спринт 2 — дизайн-токены + лидерборд брендов (сделано)
### Дизайн-система
- `app/globals.css` — токены `--sponsor`/`--sponsor-foreground` (золото) + `--color-sponsor*`; удалены `.bubble`, `@keyframes float`, `.glow-ring` (мёртвый CSS). `shimmer-badge` теперь используется плашкой «Выбор профессионалов».
- `components/ui/StatusBadge.tsx` — единый язык статусов: `sponsor` (золото, title «Платное размещение…»), `verified`, `prosChoice` (shimmer), `testWinner`. Заменены все ad-hoc «Партнёр»/«Реклама»/«Рекламное размещение» (CompanyCard, CompanyListItem, ProPanel, companies/[slug], SponsoredCategoryBanner, BrandHero). `SponsoredBadge.tsx` удалён.
- `components/CompanyBadges.tsx` — общие `RankBadge`/`RatingBadge` (были продублированы в двух карточках).
- `components/CompanyContactActions.tsx` — проп `compact`: один primary-CTA «Позвонить» (иначе Telegram), остальное icon-only. Применён в CompanyCard/CompanyListItem.
- `components/visual/CleanGraph.tsx` удалён (не использовался).

### Лидерборд брендов («Индекс доверия профи»)
- `lib/brand-score.ts` — чистые `computeBrandScore` (веса: verifiedCompany×3, recommended×2, alternative×1, click×1), `rankBrands`, `prosChoiceIds` (плашка только при score>0, лидер каждого фокуса).
- `lib/types.ts` — `BrandScore`, `RankedBrand`.
- `lib/db/queries.ts` — `getBrandsByScore()` (D1: company_brands verified + solution_products + analytics_events brand/website; если solution_products пусты в D1 — счёт по seed, чтобы индекс не обнулялся), `getBrandBySlug`, `getBrandSlugs`.
- `db/seed.ts` — `company_brands.evidence_status`: 'verified' для verified-компаний, иначе 'pending'. `db/seed-data.ts` — «Спектр Клининг» помечен `promoted: true` как демо-спонсор (плашка «Спонсор» видна в каталоге).
- `components/brands/BrandLeaderboard.tsx` — client: фильтры фокуса, ранги, полоса score, `CountUp`/`ScoreBar` анимации через `motion` (useInView + useReducedMotion, итоговое значение сразу в разметке для SSR).
- `app/brands/page.tsx` — стал server component: `getBrandsByScore()`, лидерборд + блок «Брендам» → /for-brands. `app/brands/[slug]/page.tsx` — на D1 (`getBrandSlugs` + `getBrandsByScore` + `getAllCompanies`/`getAllSolutions`): чинит 404 у kiehl/prochem, добавлен блок индекса и секция «В протоколах». Товары пока на `affiliateProducts` из mock (таблица products не сидируется).
- `lib/mock-data.ts` — добавлены `kiehl`, `prochem` (для CompanyEquipmentTags fallback).

### Проверки (пройдены)
- typecheck 0 ошибок; lint чисто; test 24/24; build 49 страниц, `/brands/[slug]` ● SSG ×9
- Ручная проверка: /brands (лидерборд + «Выбор профессионалов»), /rating, /companies/spectrclean («Спонсор» + «Профиль проверен»), /solutions/vino-na-divane (золотая плашка в ProPanel), /brands/kiehl и /brands/prochem — 200 (были 404)

### Деплой-заметки
- Прод-D1: связи `company_brands` остаются 'pending' → индекс в проде = 0 до верификации. После пересида (`migrations/seed.sql`) verified-компании получат 'verified' автоматически; либо точечный `UPDATE company_brands SET evidence_status='verified'` для подтверждённых связей.
- «Спонсор» = бывший «Партнёр»: золотая плашка, title «Платное размещение. Органический рейтинг не зависит от оплаты».
- **CD:** Git-интеграция Workers Builds — воркер `clean-rate` (аккаунт `66dfb4ebcaecc905458a8f071cbbee82`) автодеплоит `main` на push; статус = GitHub check-run `Workers Builds: clean-rate`. wrangler локально НЕ авторизован. `workers.dev` поддомен выключен (530), `cleaning-rating.by` публично не резолвится — живой домен смотреть в dashboard `workers/services/view/clean-rate/production`.

## Блок 2 — Рекламный бэкенд и логика допусков (Ad Engine & Eligibility Gate) (сделано)
- `db/schema.ts` — расширена таблица `campaigns`: плейсменты (`solution.sponsored_product`, `rating.category_partner`, `home.editorial_partner`, `search.sponsored_result`, `products.sponsored_slot`, `brand.profile_campaign`, `dealer.local_partner`), сроки (`startsAt`, `endsAt`), таргетинг (`targetCountries`, `targetCategories`, `targetSurfaces`, `targetSolutions`), лимиты (`maxImpressions`, `maxClicks`, `currentImpressions`, `currentClicks`), креативы (`title`, `description`, `ctaText`, `ctaUrl`, `ctaType`, `badgeText`), `priority`. В таблицу `products` добавлены поля `ph`, `compatibleSurfaces`, `prohibitedSurfaces`.
- `migrations/0004_absent_nehzno.sql` — сгенерированная D1-миграция.
- `lib/types.ts` — типы `AdPlacement`, `AdCtaType`, `CampaignStatus`, `Campaign`, `AdTargetContext`, `ProductSafetyProfile`, `EligibleAd`.
- `lib/ads/eligibility.ts` — чистые функции допусков и безопасности: `checkProductSafety` (блокировка кислот на чувствительных поверхностях pH < 6, блокировка щелочей pH > 9.5, соблюдение запретов производителя и протоколов решений), `checkProductRelevance` (порог релевантности: спонсор не может купить неподходящий состав), `checkCampaignEligibility` (статус, сроки, лимиты показов/кликов, гео/категорийный таргетинг), `filterAndRankEligibleCampaigns`, `resolveEligibleAd`.
- `lib/ads/queries.ts` — `getAllCampaigns`, `getActiveCampaigns`, `getProductsSafetyMap`, `getEligibleAd` (возвращает `EligibleAd | null` — если подходящей или безопасной кампании нет, возвращает `null` без пустых дыр), `incrementCampaignImpression`, `incrementCampaignClick`.
- `db/seed-data.ts` и `db/seed.ts` — добавлены `seedProducts` с профилями безопасности и `seedCampaigns` для разработки.
- `tests/ads.test.ts` — 23 теста Ad Engine & Eligibility Gate (сроки, статусы, бюджеты, гео-таргетинг, химическая безопасность, релевантность, возврат `null`, инвариантность органического рейтинга от спонсорства).

## Блок 3 — Дизайн и UI/UX рекламы: слоты, нативная маркировка, карточки действий (сделано)
### Архитектура (CLS = 0 без клиентской подгрузки)
- Реклама рендерится **на сервере** прямо в HTML: `components/ads/AdPlacement.tsx` (async server component) → `getEligibleAd()` → `AdCreative`. Нет допущенной кампании → `null`, слота нет в разметке вовсе (никаких пустых плашек, никаких сдвигов).
- `components/ads/AdCreative.tsx` — изоморфный рендерер по `placement` (без импорта D1/drizzle — можно импортировать из client-компонентов). Оборачивает шаблон в `AdImpression` с `key={campaignId}`.
- SSG-страницы не знают страну пользователя → серверный гейт работает без гео-фильтра, а `AdImpression` дополнительно скрывает кампанию, если `targetCountries` не содержит регион из cookie (`isAdVisibleInCountry`). Seed-кампании таргетированы на BY/RU/KZ, поэтому на практике сдвига нет.
- `/rating`: категория выбирается на клиенте, поэтому `app/rating/page.tsx` резолвит партнёров пакетом — `getEligibleAdsForCategories()` → `RatingContent` получает `categoryAds` и показывает `AdCreative` только при выбранной категории (`all` → ничего). Органический порядок списка не трогается, ранг не присваивается.
- Главная: `getEligibleAd("home.editorial_partner", {})` в `Promise.all`; секция рендерится условно целиком (нет кампании — нет и отступа). Блок стоит после «Бренды профи», перед манифестом — не в hero.

### Файлы
- `lib/ads/presentation.ts` — чистые хелперы: `AD_MARK_LABEL` («Реклама»), `AD_CTA_META` (4 CTA + website: подпись/hint/иконка), `adCtaMeta`, `buildAdReasons` («Почему подходит»: причина relevance-гейта + класс pH + допуски производителя, ≤3 факта, без выдумок), `describePh`, `adTrackingEntity`, `isAdVisibleInCountry`.
- `lib/ads/queries.ts` — рефакторинг: общий `resolveForContext` + `resolveBrand` с кешем; `getEligibleAdsForCategories`; `reasonText` заполняется из `checkProductRelevance` для `solution.sponsored_product`.
- `lib/types.ts` `EligibleAd` — добавлены `productPh`, `productCompatibleSurfaces`, `brandAccent`, `targetCountries`.
- `components/ads/AdBadge.tsx` — постоянная текстовая маркировка «РЕКЛАМА | {формат}», нейтральный графит (не имитирует «Проверено»/золотой «Спонсор»), тон `light`/`dark`.
- `components/ads/AdCta.tsx` (client) — `motion.a` с `rel="noopener noreferrer sponsored"`, h-11/h-12 (≥44px), иконка по `ctaType` (Store/FileText/GraduationCap/Presentation/ArrowUpRight), варианты `primary` (графит)/`secondary`/`onDark`, клик → `trackEvent` eventType `website` + metadata `{placement, ctaType, brandId}`.
- `components/ads/AdImpression.tsx` (client) — viewability по IAB: ≥50% площади ≥1с непрерывно, `visibilityState` учитывается, один impression на кампанию; `data-nosnippet` + `data-ad-placement`/`data-ad-campaign`.
- `components/ads/BrandMark.tsx` — буквенная метка бренда (sm/md/lg).
- `components/ads/templates/SponsoredProductCard.tsx` — `solution.sponsored_product`: бейдж + «Прошёл проверку безопасности», бренд/продукт, заголовок, aside «Почему подходит», CTA + «О бренде», дисклеймер.
- `components/ads/templates/CategoryPartnerBanner.tsx` — `rating.category_partner`: компактный разделитель с акцент-полосой бренда, подписью «Не участвует в рейтинге», secondary CTA.
- `components/ads/templates/EditorialPartnerBlock.tsx` — `home.editorial_partner`: премиальный блок с радиальным светом в цвете бренда, крупной буквенной меткой (lg+), CTA size lg + «Профиль бренда».
- `components/SponsoredCategoryBanner.tsx` — переведён на `AdBadge`/`BrandMark` (видимая маркировка вместо `title`). Компонент по-прежнему не используется на страницах (как и `CategoryCard`).
- `app/api/analytics/impression|click/route.ts` — при `campaignId` дополнительно вызывают `incrementCampaignImpression/Click` (иначе лимиты показов/кликов из Блока 2 никогда не срабатывали); click-роут принимает `metadata`.
- `components/solution/DiyPanel.tsx`, `ProPanel.tsx` — `min-w-0` на секциях: чинит горизонтальный скролл на мобильных `/solutions/*` (`truncate` в списке средств распирал grid-колонку; было 90–200px overflow).
- `tests/ads-ui.test.ts` — 12 тестов: CTA-метаданные, `buildAdReasons`, pH-классы, трекинг-сущность, гео-гейт, `reasonText`/`productPh` в `getEligibleAd`, `getEligibleAdsForCategories` (offices → grass, остальные → null; просрочка → null).

### Проверки (пройдены)
- typecheck 0 ошибок; lint чисто; test 60/60; build 50 страниц (`/solutions/[slug]` ● SSG ×10, `/` и `/rating` ○).
- Playwright (системный Chrome, 390×844 @2x и 1440×900): все три слота отрендерены в SSR-HTML, CLS от рекламы = 0 на `/` и `/solutions/*`; тап-зоны CTA 44–48px; impression приходит один раз на кампанию с `countryCode`, `path`, `metadata.placement`; клик по CTA → `/api/analytics/click` с `ctaType`. На решениях без допущенной кампании (`zapah-syrosti-posle-potopa`) слота в HTML нет.
- **Известная проблема вне Блока 3:** на `/rating` CLS ≈ 0.42 из-за футера — `RatingContent` в `<Suspense>` без fallback (`useSearchParams`) рендерится на клиенте, футер прыгает вниз. Не связано с рекламой (без категории и без слота значение то же). Лечится fallback-скелетом (ранее был `RatingSkeleton.tsx`, удалён) или `min-h` у секции списка.

## Визуальный язык C в проде (Стадии 1–4, сделано)
- Палитра — токены `app/globals.css` (лайм `--brand` только заливки, тёмная мята `--primary`/`--link` для текста, золото `--sponsor`, звёзды `--star`/`--ad`). Цвета вне CSS (OG, favicon, `manifest`, `themeColor`, SVG-бейдж `/badge/[slug]`) берутся из `BRAND_COLORS` в `lib/site.ts` — при смене токенов менять оба места. Хардкод `amber-*`/hex в компонентах запрещён.
- Shape lock: интерактив — `rounded-full`, панели — `rounded-panel`, поля — `rounded-control`; поверхности — `.data-surface`, стекло `.glass` только для поиска, ИИ-панели и навбара.
- `components/CompanyTable.tsx` — единственный список компаний (`/rating`, `/[city]/[category]`, `/brands/[slug]` c `ranked={false}`). Режим «плитка» и `CompanyCard` удалены; старый `?view=grid` игнорируется.
- Главная: `components/home/*` (`HomeHero`, `SolutionShelves`, `TaskTicker`, `TwoPathsSection`, `PriceTable`, `Marquee`, `Reveal`); логика — `lib/solutions/{covers,diagnostic,shelves}.ts`; эффекты — `components/ui/fx`. На экране допустим только один `Marquee`.
- Картинки полок — `public/shelves/*.jpg` (Pexels License: stains 5659651, odors 13450868, renovation 9908376, kitchen 4850197, bathroom 7587870, office 12526862). Прототипы `/dev/design/*` и `components/dev*` удалены.
- Сборка: `next.config` — `staticPageGenerationTimeout: 180`, `staticGenerationMaxConcurrency: 1` (иначе SSG падает по таймауту). Dev-сервер перед `npm run build` остановить; после удаления роутов чистить `.next/types`.
- Тесты: `npm run test` — 126 тестов (добавлены `solutions-diagnostic`, `solutions-shelves`, `semantic-search`, `launch-guards`, `ph`, `assistant`).
- Политика рекламы: не больше одного рекламного блока на экран; ничего в hero, таблицах, поп-апах; живые слоты — `home.editorial_partner`, `rating.category_partner`, `solution.sponsored_product` + платная компания в списках; видимое слово «Реклама»/`AdBadge` обязательно; демо-метрики seed публично не показывать. Остальные плейсменты схемы — без шаблонов, пока нет спроса. Спонсор на `/rating` (ранг + «Спонсор» при органическом #1) не менять без решения владельца.
- CI: `.github/workflows/ci.yml` — на `pull_request` и push в `main`: job `check` (typecheck, lint, test) и job `build` (`next build`, кэш `.next/cache`; не требует Cloudflare-авторизации, D1 уходит в seed-fallback). Деплой остаётся на Workers Builds (`clean-rate`). Lighthouse CI/бюджеты производительности — не сделано.
- CSS-слои: `.data-surface` — в `@layer components`, правило `* { border-color }` — в `@layer base`; иначе безслойный CSS перебивает утилиты (`hover:border-*`, `border-primary`, `hover:shadow-*`). Новые глобальные правила класть в слой.
- Безопасность: `isAdminAllowed` закрыт по умолчанию (открыт только при `NEXTJS_ENV=development` / `NODE_ENV=development` или заголовке Cloudflare Access); на Workers `NEXTJS_ENV` не задан. `/api/search` режет `q` до 200 символов, `/api/assistant` проверяет лимит и размер до парсинга, `brand-lead.website` — только http(s). Без `TURNSTILE_SECRET_KEY` и биндингов лимитов в проде пишется предупреждение (проверка пропускается).
- Состояния: `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`; `MotionProvider` (reducedMotion="user") в layout; программный скролл — `scrollBehavior()` из `lib/utils`.

## Спринт «Прямо сейчас» — безопасность, доверие, конверсия (сделано)
- **Демо-реклама снята, спонсор-витрина возвращена:** `seedCampaigns` в `db/seed-data.ts` — все `status: "draft"` (без договора реклама реальных брендов не показывается). «Спектр Клининг» — `promoted: true` как витрина платного размещения (решение владельца): слот «Спонсор» отделён от органики, тест-страж — органика никогда не содержит `promoted`. Тесты рекламного движка — через `tests/helpers/demo-campaigns.ts`, спонсорские — на фикстуре `withSponsor`.
- **Navbar** — только «Решения» и «Рейтинг компаний» (+ `aria-current`, активность по `match`-префиксам, `/companies` относится к рейтингу); CTA «Разместить бизнес» с `lg`. Консультант живёт в выпадашке поиска (`SearchSuggestions`: постоянная строка «Спросить ИИ-консультанта» последним пунктом, навигация стрелками включена; `assistantHrefFor` в `SmartSearch.tsx`).
- **Hero главной** — счётчики «10/13/9» заменены на `QUALITY_MARKS` (три проверяемых факта доверия, stagger-анимация). Проп `stats` у `HomeHero` и `getAllBrands` на главной удалены.
- **`/suppliers`** — `robots: { index: false }`, убрана из `app/sitemap.ts` и футера (секция «Бизнесу» теперь ведёт на `/for-brands`).
- **`/for-brands`** — `pageAlternates` + OG, счётчики заменены на принципы.
- **Мостик DIY→Pro:** `components/solution/DiyEscalation.tsx` (client) после `DiyChecklist` — риск-поверхность из `SURFACE_RISK_LABELS` (`lib/solutions/meta.ts`), смета «от» и первый органический мастер региона через `buildEscalation()` (`lib/solutions/diagnostic.ts`, тестируемый чистый хелпер). `PhoneButton` получил проп `label`. `ProPanel` переведён с собственного `pickCompanies` (буст `promoted +2`) на `buildProCompanies`: органика по доверию, спонсор — отдельной помеченной строкой; `StickyCallBar` ведёт на organic[0].
- **RU/Москва открыта и наполнена:** `MARKETS.RU.enabled: true`; у `City` — `enabled?: boolean` (СПб скрыт). Хелпер `openCities(market)` — единый источник для селектора, посадочных и форм. В `seedCompanies` добавлены 10 реальных московских компаний (открытые рейтинги Ведомости/Klerk): `verified: false`, `ratingSource: "unverified"` — баллы не выдумываем. `db/seed.ts` выводит `country_code` через `getMarketByCity`, а не хардкод 'BY'. Посадочные Москвы — `noindex`, пока компаний < 2 (`LANDING_INDEX_MIN_COMPANIES`): с 10 компаниями в базе порог уже пройден — пересмотреть при желании индексации. KZ закрыт.
- **Видеоразбор протоколов:** `solutions.video_url` (миграция 0005) + `Solution.videoUrl`; `lib/solutions/video.ts` — `parseVideoSource` (YouTube/nocookie/Shorts, VK, Rutube, mp4); `components/solution/SolutionVideo.tsx` — SSR-iframe 9:16/16:9 в `DiyPanel` перед чек-листом. Без URL слот пуст.
- **Монетизация `/for-partners`:** тарифные карточки «Базовый 0» / «PRO Спонсор от 149 Br/мес» (цена — плейсхолдер, утверждает владелец); кнопки выбирают тариф и скроллят к форме. `partner_leads.plan` (`base`/`pro`) — zod-enum в API, строка «Тариф» в Telegram, колонка в миграции 0005. В `DiyPanel` у средств — внешняя кнопка «Купить» на `brand.affiliateUrl` (`rel="sponsored nofollow noopener"`).
- **AI без Vectorize:** `getSearchBindings` больше не требует VECTORIZE — LLM-ответы и vision-фото консультанта работают при одном `AI`-биндинге, семантика откатывается на словарь. Для полного семантического поиска: `wrangler vectorize create cleanhub-solutions --dimensions=1024 --metric=cosine`, раскомментировать `vectorize` в `wrangler.jsonc`, деплой, `POST /api/admin/reindex` (требует AI+VECTORIZE).
- **Проверки:** typecheck 0, lint чисто, test 140/140, build — 123 страницы. Ручная проверка dev: `/solutions/vino-na-divane` — мостик в SSR, реклама/спонсор отсутствуют; `/moscow/uborka-kvartir` — 200 + `noindex`; `/suppliers` — `noindex`; шапка без лишних пунктов.
- **Осторожно с dev-сервером:** `kill` shell-сессии не убивает процесс Next на порту (старый инстанс отдавал 404 на всех вложенных роутах). Освобождать: `netstat -ano | grep :3111` → `taskkill //PID`.
