# ChistoLab (`chistolab.pro`) — памятка для Devin

> История работ по этапам — в `CHANGELOG.md`. Здесь только актуальное состояние,
> правила и TODO. Не дописывай сюда спринты — добавляй записи в CHANGELOG.

## Стек
- Next.js 16.3.3 (App Router, Turbopack), React 19, Tailwind CSS 4 (`@theme inline` в `globals.css`)
- OpenNext Cloudflare → воркер `cleaning-rating`, custom_domain `chistolab.pro` + `www` (301 www→apex в `proxy.ts`)
- D1 (SQLite) + Drizzle ORM + seed-fallback (`STRICT_DB=0`)
- Рынки `lib/markets.ts`: BY (Минск), RU (Москва) открыты; KZ `enabled:false` (данные/сметы KZT в seed сохранены)
- Биндинги: `DB` (D1), `MEDIA` (R2 `chisyolab`), `AI`, rate-limit'ы LEAD/EVENT/SEARCH/ASSISTANT/PHOTO

## Команды
- `npm run typecheck` / `lint` / `test` / `build` — стандартные проверки (test = 247 тестов, `node --import tsx --test tests/**`)
- `npm run deploy` — OpenNext build + deploy на прод
- `npm run db:generate` — генерация D1-миграций (`migrations/NNNN_*.sql`)
- Прод-миграции: `npx wrangler d1 migrations apply cleaning-rating-db --remote` — **только с разрешения владельца**
- ⚠️ **Перед `migrations apply` всегда сверять список pending с `d1_migrations`:** seed-файлы, накатанные через `execute --file`, wrangler считает неприменёнными, а plain INSERT в них неидемпотентен. С 2026-11-26 все seed-stageN зарегистрированы в d1_migrations вручную — при добавлении новых seed-stageN повторять регистрацию
- ⚠️ `migrations/seed.sql` на проде **ЗАПРЕЩЁН** (DELETE'ит analytics_events, campaigns, claims). Точечные `seed-stageN.sql` — можно
- `updated_at`/`created_at` в D1 — **миллисекунды**, не `unixepoch()`

## Карта продукта (что есть сейчас)
- `/` — `PlatformHero` (H1 «Уберите любое пятно — сами или с мастером», `SmartSearch bare`) → `ProductZoneShelf` → `SeasonalBrandBanner` → `VideoLabSection` → `CleanersByServiceSection` → `TaskRibbon` → trust-строка → B2B
- `/assistant` + hero-ИИ — `AssistantPanel`/`HeroAssistant`: триаж timing/material, вердикт-светофор, чек-лист, средства, смета, мастера. Retrieval: Vectorize → токен-ранкер+синонимы → LLM `@cf/meta/llama-4-scout-17b-16e-instruct`
- `/api/assistant/photo` — фото-триаж бета (**выключен**, см. флаги); ответ только из проверенной базы, модель отдаёт токен категории
- `/solutions/[slug]` — 25 протоколов «Два пути», SSG, JSON-LD HowTo+FAQ+Breadcrumb, E-E-A-T блок (reviewed_by/sources)
- `/[city]`, `/[city]/[category]` — посадочные minsk/moscow; порог индексации ≥2 компаний (`LANDING_INDEX_MIN_COMPANIES`)
- `/rating` — `CompanyTable` (единственный список), спонсорская полка над органикой, `noindex` при фильтрах
- `/brands`, `/brands/[slug]` — «Индекс доверия профи» (`lib/brand-score.ts`)
- `/for-partners`, `/for-brands` — B2B: тарифы (`lib/partners.ts`), media-kit (`lib/ads/media-kit.ts`)
- `/admin` — закрыт по умолчанию (`isAdminAllowed`), «Радар спроса», плейсменты, статистика контактов
- `/privacy` (п.6 — фото-бета), `/terms` (п.6), `/llms.txt`, `/sitemap.xml` (force-dynamic, lastmod из D1)
- Видео: `solutions.video_url` → `/media/[...key]` из R2; конвенция имён `{slug}-9x16.mp4`
- Реклама: `campaigns` + `lib/ads/eligibility.ts` (pH/безопасность/гео/сроки/erid для RU), серверный рендер `AdPlacement`→`AdCreative` (CLS=0), `AdBadge` «РЕКЛАМА», viewability IAB в `AdImpression`. Демо-кампании = draft
- Аналитика: Zero-PII, `METADATA_ALLOWLIST`, placement-воронка; внешние YM/CF — только после ch_consent

## Флаги и секреты (wrangler vars / .dev.vars)
- `PHOTO_ASSIST_ENABLED=""` — серверный kill-switch `/api/assistant/photo` (503 photo_disabled)
- `NEXT_PUBLIC_PHOTO_BETA=""` — видимость UI-секции `PhotoAssist`
- `PHOTO_DAILY_BUDGET="40"` — дневной бюджет AI-вызовов (таблица `ai_usage_daily`, миграция 0010 применена)
- `NEXT_PUBLIC_YM_ID`, `NEXT_PUBLIC_CF_BEACON_TOKEN` — пустые = внешняя аналитика выключена
- `NEXT_PUBLIC_GTM_ID` = `GTM-5N84R54Q` — Google Tag Manager, тот же consent-гейт (ch_consent="all")
- `TURNSTILE_SECRET_KEY`, `PII_HASH_PEPPER` — в `.dev.vars`, не в vars
- Включение фото-беты = оба флага `"1"` + редеплой (решение владельца)

## Критические правила и грабли
- **D1 на билде отключена** (`NEXT_PHASE=phase-production-build` в `lib/db/client.ts`): контент SSG всегда из seed-fallback. Иначе недетерминированные таймауты D1 растягивали `generateMetadata` и Next.js запекал в статику служебный `<meta robots noindex>` streaming-шелла рядом с настоящим тегом (Google берёт restrictive → компании выпали бы из индекса). seed-data.ts обязан оставаться зеркалом прод-D1
- **EPERM на `.open-next` при деплое:** убить зависший `next start`/node-процесс, повторить
- **Windows/Turbopack:** `npm run build` может падать `0xc0000142` → `npx next build --webpack` или сразу deploy
- **Dev-сервер:** kill shell не убивает node → `netstat -ano | findstr :3111` → `taskkill //PID //F`
- **localhost curl:** `--noproxy "*"` (VPN-прокси перехватывает loopback)
- **Git:** основная ветка `main` в `origin` (github.com/lovedriven565-oss/Clean_rate). История изменений дополнительно ведётся в CHANGELOG.md (формат: что сделано → ключевые файлы → проверки → деплой). Источник истины кода — GitHub `main`; источник истины данных — прод-D1 (seed-data.ts — зеркало)
- **CSS-слои:** глобальные правила — в `@layer base/components`; `.container`/`.glass` вне слоёв → `!`-утилиты
- **`dynamicParams` НЕ отключать** на `[city]`/`[city]/[category]` — NoFallbackError даёт закешированный 404 в воркере
- **OG-шрифты** (`ogFonts`): fs → `env.ASSETS` → fetch `SITE_URL/fonts/*` (fs нет в воркере)
- **Incremental cache** ключуется `NEXT_BUILD_ID`; `set()` пропускает status≥400
- **cf:typegen** пишет литералы vars → env-переменные читать как `string | undefined`
- **`motion.create` в рендере запрещён** (линт static-components) — только модульные карты
- **Рекламная политика:** ≤1 блока/экран, не в hero/таблицах/поп-апах, «Реклама» обязательно, erid для RU, promoted не влияет на органический порядок
- **Совместимость товаров** (`solution.sponsored_product`) закрыта до подтверждённых данных (material+surface+источник)
- **ИИ-ответы** маркируются предварительными; промпты не должны генерировать рецепты — только проверенная база
- **Рейтинги:** только с `ratingSource` + реальный источник; без источника → `unverified`, объект `rating` не показываем

## TODO владельца (вне кода)
- Доступы Google Search Console + Яндекс.Вебмастер (sitemap вручную); IndexNow — `npm run indexnow` после деплоев
- `NEXT_PUBLIC_YM_ID` / `NEXT_PUBLIC_CF_BEACON_TOKEN` — реальные токены
- Включение фото-беты после живого теста на реальных фото
- Perf-пакет: TBT ~5.8с (scriptEvaluation/styleLayout), LCP; вернуть строгие пороги `lighthouserc.json`
- Реальные `rating_sources` для BY-компаний; подтверждения совместимости товаров для ad-слота
- Цены в `lib/ads/media-kit.ts` и тарифы — плейсхолдеры до утверждения
- Внешние рейтинги/упоминания брендов для «Индекса доверия»

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
