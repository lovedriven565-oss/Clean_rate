# ChistoLab — технический и продуктовый аудит репозитория

Дата среза: 2026-11-27. Аудит основан на коде `main` после коммитов `dba37d1`/`1371f47`, без выдумывания отсутствующей функциональности.

## 1. Стек и инфраструктура

### Runtime и хостинг

- **Next.js 16.3.3**, App Router, Turbopack; React 19.2.8; TypeScript 5.9.3; Tailwind CSS 4.3.3 — `package.json`.
- Хостинг — **Cloudflare Workers через OpenNext**, не Cloudflare Pages: `@opennextjs/cloudflare` 1.20.3, `wrangler` 4.126.0, воркер `cleaning-rating`, домены `chistolab.pro` и `www.chistolab.pro` — `wrangler.jsonc`.
- `proxy.ts` делает 301 `www → apex` и региональную cookie-логику.
- D1 + **Drizzle ORM 0.45.2**; при production build D1 намеренно отключена, контент SSG строится из `db/seed-data.ts` — `lib/db/client.ts`. Это критичная архитектурная грабля: seed обязан быть зеркалом прод-D1.
- Кэш: собственный OpenNext incremental cache поверх Cloudflare Cache API, ключ включает `NEXT_BUILD_ID` — `lib/opennext/cache-api-incremental-cache.ts`. Статика `/_next/static/*` immutable через `public/_headers`.
- R2: бакет `chisyolab`, биндинг `MEDIA`; раздача только через воркер `app/media/[...key]/route.ts`, не через публичный bucket domain. Роут force-dynamic, whitelist расширений, поддержка Range, ETag/304, `cache-control: public, max-age=31536000, immutable`; svg/html запрещены как XSS-риск.
- AI: биндинг `AI`, фото-триаж выключен флагами `PHOTO_ASSIST_ENABLED`/`NEXT_PUBLIC_PHOTO_BETA`; дневной бюджет в `ai_usage_daily`.
- Внешние счётчики: Яндекс.Метрика, Cloudflare Web Analytics и **GTM** монтируются только после `ch_consent="all"` — `components/analytics/ConsentGatedAnalytics.tsx`. Plausible нет. Токены YM/CF пустые, GTM ID есть (`GTM-5N84R54Q`) — `wrangler.jsonc`.
- Собственная аналитика: `analytics_events` + API `/api/analytics/impression` и `/api/analytics/click`; Zero-PII allowlist metadata.

### Таблицы D1 (`db/schema.ts`)

- `cleaning_companies`: id, slug, name, legal_name, country_code, region, city, address, description, website/phone/email/telegram, price_from/unit, experience_years, cover_image, tags, guarantees, verified, promoted, status, timestamps.
- `company_categories`: company_id + category_id, composite PK.
- `brands`: id, slug, name, tagline, description, focus, website/affiliate URLs, accent, is_sponsor, verified, status, timestamps.
- `suppliers`: id, slug, name, country/region/city, контакты, verified, status, timestamps.
- `products`: id, brand_id, slug, name, category, description, image_key, external_url, ph, compatible_surfaces/prohibited_surfaces/compatible_materials (JSON), compatibility_verified/source, status, timestamps.
- `company_brands`: company_id + brand_id, evidence_url/status, verified_at.
- `supplier_brands`: supplier_id + brand_id, relationship, evidence_url, verified_at.
- `rating_sources`: id, company_id, source (`google|yandex|platform`), source_url, rating, review_count, captured_at; unique company+source.
- `profile_claims`: заявки на управление профилем company/brand/supplier, contact, evidence, status.
- `campaigns`: brand_id/product_id, placement, status, dates, targeting JSON, limits/counters impressions/clicks, creative fields, cta, erid, media, promo_code, priority.
- `analytics_events`: campaign_id, entity_type/id, event_type, path, country_code, metadata JSON, page_view_id, occurred_at.
- `brand_leads`: brandName, website, contactName/contact (в реальной записи — обезличенные), role, status, consent fields, created_at.
- `partner_leads`: companyName/contactName/phone (обезличённые), city, category_ids, plan, status, consent fields.
- `solutions`: id, slug, title, problem_type, surface, material, severity, audience, diy_steps/warnings/search_keywords JSON, when_to_call_pro, diy/pro notes, related_category, video_url, reviewed_by, sources, status, timestamps.
- `solution_products`: solution_id, brand_id/product_id, role recommended/alternative, note.
- `intent_keywords`: keyword, intent b2c/b2b/pro, weight, target_kind solution/category/brand, target_slug.
- `price_estimates`: solution/category, country/city/currency, min/max, unit, note.
- `ai_usage_daily`: day PK, photo_attempts, updated_at.

В проде дополнительно есть служебные `_cf_KV` и `d1_migrations`.

### Админка и управление

- `/admin` есть — `app/admin/page.tsx`: лиды брендов/партнёров, «Радар спроса», кампании, статистика контактов/плейсментов, спонсорские места.
- Авторизации внутри приложения нет; доступ закрыт **Cloudflare Access** по заголовку `cf-access-authenticated-user-email` — `lib/admin/guard.ts`. Локально открыто только в development.
- API управления: `/api/admin/actions` (статусы лидов/кампаний, promoted компании), `/api/admin/report` (CSV), `/api/admin/reindex` (векторный индекс). Полноценного CRUD контента решений/компаний нет.

## 2. Карта страниц и роутинг

### Публичные HTML

- `/` — главная.
- `/solutions`, `/solutions/[slug]`.
- `/rating`, `/rating/methodology`.
- `/companies/[slug]`.
- `/brands`, `/brands/[slug]`.
- `/[city]`, `/[city]/[category]` — сейчас посадочные только для открытых городов.
- `/assistant`.
- `/for-partners`, `/for-brands`.
- `/privacy`, `/terms`.
- `/admin` — закрытая.
- `opengraph-image` variants для городов/категорий/компаний/брендов/решений; `icon`, `apple-icon`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `llms.txt`.

### API/спецмаршруты

- `/api/search`.
- `/api/assistant`, `/api/assistant/photo` (photo отключен флагами).
- `/api/brand-lead`, `/api/partner-lead`.
- `/api/analytics/impression`, `/api/analytics/click`.
- `/api/admin/actions`, `/api/admin/report`, `/api/admin/reindex`.
- `/badge/[slug]` — badge/виджет.
- `/media/[...key]` — R2 proxy.

### Мультистрановость

- Не поддомены и не URL-префиксы. Регион хранится в cookie `ch_region` формата `RU:moscow`/`BY:minsk` — `components/providers/RegionProvider.tsx`.
- `proxy.ts` по `CF-IPCountry` один раз ставит cookie только для RU/BY; остальные страны и краулеры получают нейтральный SSR.
- Городские посадочные всё же существуют как URL `/{city}` и `/{city}/{category}` — это контентные landing pages, а не механизм выбора региона.
- Конфиг рынков — `lib/markets.ts`: BY и RU `enabled: true`; KZ уже `enabled: false`. Алматы остаётся в данных/сметах, но скрыт из селектора, hreflang и открытых посадочных. Поэтому требование «скрыть KZ и оставить BY+RU» фактически уже выполнено на уровне конфига; дополнительно закрытые KZ-профили получают `noindex` — `app/companies/[slug]/page.tsx`.

## 3. Страница решения / инструкции

Файл: `app/solutions/[slug]/page.tsx`; ключевые компоненты — `components/solution/*`.

### Блоки страницы

1. Hero: breadcrumbs, теги surface/material/severity/audience, H1, тематическая обложка, ShareButton, мобильный переключатель «Сделать самому / Вызвать мастера».
2. Два пути:
   - `DiyPanel`: WarningList, RescueCalculator, DiyChecklist, DiyEscalation, рекомендованные средства, dealer-slot.
   - `ProPanel`: PriceRange, подбор компаний, прямые phone/telegram actions, sticky contact block.
3. Предупреждение о тесте на незаметном участке.
4. E-E-A-T блок: reviewedBy, дата, источники.
5. Рекламный слот `solution.sponsored_product` — только активная кампания, placeholder отключен.
6. FAQ accordion, строится из протокола и цен — `buildSolutionFaq`.
7. Похожие решения `SolutionCard`.
8. JSON-LD HowTo + FAQPage + BreadcrumbList + VideoObject при наличии видео — `lib/solutions/structured-data.ts`.

`StoryPlayer` на странице решения не рендерится напрямую как отдельный блок; видео внутри DIY выводится через `SolutionVideo`, а `StoryPlayer` используется в `VideoLabSection` на главной. Видеоплеер в решении — обычный `<video controls>`/iframe в зависимости от источника.

### Интерактивность

- `DiyChecklist` — интерактивный чек-лист шагов.
- `RescueCalculator` — выбор сценария: свежее/засохло/уже испорчено бытовой химией; подбор следующего действия, сметы и компании.
- `DiyEscalation` — эскалация к мастеру с прямыми phone/telegram.
- FAQ — нативный `<details>`.
- Оценки полезности («Было полезно?») нет.

### Переименование «протокол» → «инструкция»

Термин реально глубоко вшит:

- `app`: 56 вхождений в 18 файлах.
- `components`: 71 вхождение в 22 файлах.
- `lib`: 99 вхождений в 20 файлах.
- `db`: 11 вхождений в 3 файлах.

Особенно дорогие места: `lib/assistant/engine.ts` (37), `components/home/StainRescue.tsx` (12), `lib/ads/eligibility.ts` (9), `components/assistant/AssistantPanel.tsx` (9), `app/page.tsx` и `app/solutions/[slug]/page.tsx` по 7. В URL слова `protocol` нет — публичный slug `/solutions/...` останется. Переименование затронет UX-копирайтинг, JSON-LD/alt/aria, промпты ИИ, админку, media-kit и тесты; это не cosmetic one-liner.

## 4. Поиск и маршрутизация пользователя

- API — `app/api/search/route.ts`; UI — `components/SmartSearch.tsx`, `components/NavSearch.tsx`.
- Провайдеры поиска: `KeywordProvider` по `intent_keywords`; если есть Workers AI + Vectorize — `SemanticProvider`, иначе fallback на keywords — `lib/search/semantic.ts`.
- `seedIntentKeywords`: 114 ключей — **74 b2c, 22 b2b, 18 pro**; по целям — 68 solution, 28 category, 18 brand.
- Интент `pro` не возвращает компании, чтобы не подменять профессиональный запрос потребительской витриной.
- Ранжирование решений двухслойное: exact/keyword target + `rankSolutionsByTokens` с русской морфологией/stemming, синонимами и весами полей — `lib/search/rank.ts`.
- Есть autocomplete/подсказки в поисковых компонентах, лимит 6 результатов, rate limit `SEARCH_LIMITER`, кэш пустого/обычного ответа через `Cache-Control`.
- Результат включает решения, компании открытого рынка, бренды и иногда рекламный `search.sponsored_result`.
- Для нераспознанных запросов используется Zero-PII demand capture: `sanitizeDemandSearchQuery`, события питают «Радар спроса» в `/admin`.
- Фасетные фильтры есть не в поиске API, а в каталогах: `/solutions` (`type`, `surface` через `SolutionsExplorer`) и `/rating` (город/категория/verified/sort/query).

## 5. Конверсия, лидген и монетизация

### Формы и заявки

- `/for-brands` → `BrandLeadForm` → `POST /api/brand-lead`.
- `/for-partners` → `PartnerLeadForm` → `POST /api/partner-lead`.
- Отдельной пользовательской формы «заказать клининг» нет: конверсия B2C идёт через прямые контакты компаний (phone/telegram/website) в ProPanel, карточках и StickyCallBar.
- `profile_claims` в схеме есть, но публичной формы claim profile в найденных маршрутах нет.
- Полная PII заявки уходит только транзитом в Telegram через `forwardToTelegram` — `lib/telegram.ts`. В D1 сохраняется обезличенный след: контактное лицо заменяется транзит-меткой, контакт — хешем через `lib/privacy/pii.ts`.
- Turnstile поддержан (`verifyTurnstile`), rate limit `LEAD_LIMITER`; сервер требует consent=true.

### Реклама и партнёрские ссылки

- Кампании — `seedCampaigns`, все сейчас draft: `camp-prochem-stainpro`, `camp-grass-offices`, `camp-karcher-home` в seed. Прод-D1 пока расходится с seed — см. `docs/cloudflare-inventory.md`.
- Placements: `home.editorial_partner`, `rating.category_partner`, `solution.sponsored_product`, `search.sponsored_result`, `dealer.local_partner`, `products.sponsored_slot` и др. — enum в `db/schema.ts` и `lib/types.ts`.
- Eligibility gate: статус, даты, geo, категории/поверхности/решения, pH/запретные поверхности, verified compatibility, erid для RU — `lib/ads/eligibility.ts`.
- Показ фиксируется только после viewability в `AdImpression`; API `/api/analytics/impression` валидирует кампанию.
- Клики валидируются против существующей сущности и кампании; `recordAnalyticsEvent` пишет event и обновляет счётчики кампании одним D1 batch — `app/api/analytics/click/route.ts`, `lib/db/queries.ts`.
- **Редирект-трекера `/go/...` нет.** Внешние ссылки идут напрямую на `ctaUrl`/`affiliateUrl`/сайты компаний, а клик фиксируется client-side перед переходом через `trackClick`/`trackEvent`. Это проигрывает редиректу по надёжности атрибуции при уходе с страницы до завершения fetch.
- `erid` поле есть в схеме и eligibility, но в текущих seed-кампаниях не заполнено.

## 6. Контент и медиа

### Точная статистика seed/main

- 25 опубликованных решений.
- 28 компаний: Минск 14, Москва 11, Алматы 3.
- 21 товар в `seedProducts`; 8 affiliate/vitrina товаров в `seedAffiliateProducts`.
- 9 брендов.
- 3 кампании.
- 50 связей solution_products.
- 114 intent keywords, 93 price estimates.
- Видео в seed: 2 — `vino-na-divane`, `vodny-kamen-dushevaya`.
- В R2 сейчас 2 реальных mp4: `vino-na-divane-9x16.mp4` (около 13 MB) и `vodny-kamen-dushevaya-9x16.mp4` (1 579 919 байт), плюс пустой marker `1/`.
- Локальные изображения: 20 jpg + 1 png в `public`, из них 10 cover-изображений в `public/covers`; суммарный размер `public` около 3 MB. Локальных mp4 в репозитории нет.

Важно: прод-D1 сейчас не полностью зеркалит seed. Актуальный дрейф задокументирован в `docs/cloudflare-inventory.md`: products 11/21, все 50 solution_products старого аудита, campaign mismatch, у всех решений в проде старые BYN-only cost notes. Draft синхронизации — `db/manual-seeds/seed-stage10.sql`, не применён.

### StoryPlayer и VideoLabSection

- `components/home/VideoLabSection.tsx`: client component, 5 карточек 9:16. После последнего изменения сначала идут опубликованные протоколы с `videoUrl`, потом без видео; по клику открывается модальный `StoryPlayer`, который lazy-loaded через `next/dynamic` (`ssr:false`).
- `StoryPlayer.tsx`: сторис-модалка. Если `videoUrl` распарсен (`parseVideoSource` поддерживает mp4 и embeds), рендерит видео/iframe; mp4 получает `controls` и `autoPlay={!reduce}` — уважает `prefers-reduced-motion`.
- Fallback без видео: слайды «Не делайте» → шаги DIY → карточка средства, autoplay таймером `SLIDE_MS`, ручная навигация кнопками/стрелками, pointer down ставит паузу, прогресс-бар сверху.
- Постер/фон — thematic cover через `next/image`; видео в карточках не загружается до открытия модалки, что хорошо для performance.
- CTA средства — прямая внешняя `affiliateUrl` с `rel="noopener noreferrer sponsored"` и client-side analytics event.

## 7. SEO и производительность

### SEO уже настроено

- `app/sitemap.ts`: force-dynamic, список из открытых рынков; KZ исключён; lastmod считается из реальных updatedAt. На последнем деплое 83 URL.
- `app/robots.ts` и `app/llms.txt/route.ts` есть.
- Canonical/alternates формируются через `pageAlternates`; глобальные OG/Twitter — `app/layout.tsx`, `lib/site.ts`.
- `proxy.ts` добавляет `X-Robots-Tag: noindex, follow` для фильтрованных query-состояний `/rating`, `/solutions`, `/brands`.
- KZ company profiles получают `noindex, follow` при закрытом рынке.
- JSON-LD:
  - решение: HowTo, FAQPage, BreadcrumbList, VideoObject, HowToSupply/HowToStep, citations;
  - компания: LocalBusiness + BreadcrumbList;
  - бренд: Brand + Product nodes + BreadcrumbList;
  - `/solutions` и `/brands`: CollectionPage + ItemList;
  - `/rating`: ItemList;
  - главная: WebSite + SearchAction + Organization.
- OG images генерируются для основных сущностей; шрифты читаются через fs/assets/fetch fallback — `lib/og/*`.
- IndexNow скрипт есть — `scripts/indexnow.mjs`, после последних деплоев отдавал 200/202.

### Производительность

- Архитектурно большая часть контента SSG: build генерирует 174/174 страниц. Динамические зоны: admin, API, sitemap, media, assistant.
- D1 на build отключена сознательно — это ускорило генерацию и убрало недетерминированный noindex streaming-shell инцидент.
- Выполненная оптимизация: motion убран из критического бандла главной, RSC payload дедуплицирован компактными проекциями `toCardSolution`/`toCardCompany`; StoryPlayer lazy-loaded.
- Видео хранится вне бандла в R2 и отдаётся с immutable cache + Range. Новое `vodny` оптимизировано (~1.58 MB), но `vino` в R2 около 13 MB — очевидный следующий кандидат на сжатие.
- Известный остаток perf-долга из CHANGELOG: TBT после оптимизации примерно 2080 мс в тихом локальном замере; основной остаток — стоимость гидратации react-dom runtime/framework chunk. `lighthouserc.json` пока анти-регрессионный, не строгий.
- Потенциальные узкие места: большой HTML/RSC payload главной из-за передачи данных в несколько client islands; клиентская фильтрация/рендер каталогов; старый большой mp4; OpenNext предупреждения о duplicate keys в bundled handler (warning зависимости, не подтверждённая runtime-ошибка).

## 8. Техдолг и недоделки

1. **Критический дрейф прод-D1 ↔ seed**: products/campaigns/solutions/solution_products не синхронизированы. Это самый важный эксплуатационный риск, потому что SSG читает seed, runtime читает D1. План есть в `docs/cloudflare-inventory.md` и `db/manual-seeds/seed-stage10.sql`, но не применён.
2. **В prod всё ещё старый продуктовый граф**: Arenas/OdoGone/Taxat/Into Free/Omniclean в `solution_products` — химически опасный/неподтверждённый контент до применения stage10.
3. **Нет `/go/...` redirect tracker** — атрибуция внешних кликов зависит от client-side events.
4. **Нет CRUD контента**: админка управляет статусами/лидами/promoted, но не редактирует решения, компании, продукты и медиа.
5. **Нет публичной формы заказа клининга**: только прямые контакты компаний; нет внутренней заявки B2C с распределением по клинерам.
6. **Нет оценки полезности инструкции** и нет пользовательских отзывов о протоколах.
7. **Vectorize не подключен в wrangler config** (закомментирован); semantic search архитектурно предусмотрен, но не активен без индекса. `/api/admin/reindex` существует.
8. **Фото-триаж выключен** флагами; есть budget table и API, но продуктово это не запущено.
9. **Внешняя аналитика фактически не наполнена**: YM/CF tokens пустые; GTM включён только после consent.
10. **`vino-na-divane` видео ~13 MB** — не соответствует новому стандарту 1.5–3 MB.
11. **KZ данные есть, но рынок выключен** — это осознанное решение, не баг; нужен контентный запуск при включении.
12. **Цены media-kit/тарифы плейсхолдеры** до утверждения; рейтинги части BY-компаний без внешних источников (`unverified`).
13. **`seed.sql` опасен для прода** (destructive), операционные seed-файлы должны жить вне `migrations/`; это уже закреплено как правило, но требует дисциплины.
14. **Терминология «протокол» глубоко вшита** — переименование в «инструкции» требует отдельного аккуратного этапа с тестами и проверкой SEO/copy/AI prompts.
