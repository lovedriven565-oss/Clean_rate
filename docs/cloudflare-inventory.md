# Cloudflare inventory — ChistoLab

Дата: 2026-11-26. Режим: read-only. Изменений в прод-D1 не выполнялось.

## Источники

- Код: GitHub `main` `cbb4123` (`feat(stage-9): photo triage, GTM consent gate, perf pack, SEO hardening, product compatibility gate`).
- Обязательные документы прочитаны: `AGENTS.md`, `CHANGELOG.md`.
- Cloudflare Worker API: доступен.
- Cloudflare D1 API: недоступен текущим токеном (`Authentication error [10000]` на `/d1/database`, `not authorized [7403]` на query конкретной БД).

## Активное состояние Worker

- Worker: `cleaning-rating`
- Активный deployment: `e7626c11-1bc9-4b22-a0bf-0ac4391d4daf`
- Активная version: `1c7576f6-c2cc-47c0-8809-eb839c6b76ed`, 100% трафика
- Дата deployment: 2026-11-26T12:38:09Z
- Это совпадает с записью в `CHANGELOG.md` о деплое GTM.

Проверенные bindings/vars:

| Тип | Имя | Значение/состояние |
|---|---|---|
| D1 | `DB` | database_id `871b3c22-b53c-46b8-95a9-b3da96a2c31f` |
| R2 | `MEDIA` | bucket `chisyolab` |
| AI | `AI` | подключён |
| Rate limit | `LEAD_LIMITER` | 5/60s |
| Rate limit | `EVENT_LIMITER` | 120/60s |
| Rate limit | `SEARCH_LIMITER` | 60/60s |
| Rate limit | `ASSISTANT_LIMITER` | 20/60s |
| Rate limit | `PHOTO_LIMITER` | 10/60s |
| var | `STRICT_DB` | `0` |
| var | `NEXT_PUBLIC_SITE_URL` | `https://chistolab.pro` |
| var | `NEXT_PUBLIC_GTM_ID` | `GTM-5N84R54Q` |
| var | `NEXT_PUBLIC_YM_ID` | пусто |
| var | `NEXT_PUBLIC_CF_BEACON_TOKEN` | пусто |
| var | `PHOTO_ASSIST_ENABLED` | пусто → фото-бета выключена |
| var | `NEXT_PUBLIC_PHOTO_BETA` | пусто → UI фото-беты скрыт |
| var | `PHOTO_DAILY_BUDGET` | `40` |

## D1 migrations

Фактический `d1_migrations` проверить не удалось: у токена нет permission для D1. Команда блокируется до выполнения SQL:

```bash
npx wrangler d1 migrations list cleaning-rating-db --remote
```

Ожидаемые schema-миграции в репозитории:

- `0000_supreme_invaders.sql` … `0011_common_silver_samurai.sql`
- `0011-apply.sql` — операционная копия/хелпер, не обычная drizzle-миграция

Операционные seed-файлы в репозитории:

- `seed.sql` — запрещён на проде
- `all_in_one_init.sql` — не использовать на проде без отдельного решения
- `seed-stage5.sql` … `seed-stage9.sql`
- `seed-stage10.sql` — создан как проект синхронизации каталога вне `migrations/`, **не применён и не зарегистрирован**

По `CHANGELOG.md` от 2026-11-26: миграция `0011` и `seed-stage9.sql` уже применены в прод-D1 через `execute --file`; все прежние `seed-stageN` вручную зарегистрированы в `d1_migrations`. Это последнее подтверждённое состояние, но требует повторной live-сверки после выдачи D1 permission.

## Сравнение seed-data и последнего известного prod-D1

Текущий `db/seed-data.ts` на `main`:

| Сущность | seed-data |
|---|---:|
| companies | 28 |
| companies Минск | 14 |
| companies Москва | 11 |
| companies Алматы | 3 |
| solutions | 25 |
| products | 21 |
| brands | 9 |
| affiliateProducts | 8 |
| campaigns | 3 draft |

Последний зафиксированный дрейф prod-D1 из `CHANGELOG.md`:

- В проде было 11 products вместо 21 из seed.
- Отсутствуют в проде 13 products из актуального seed-каталога:
  - `prod-prochem-spotter`
  - `prod-prochem-inksolv`
  - `prod-prochem-solvall`
  - `prod-prochem-odourfresh`
  - `prod-prochem-fibreshampoo`
  - `prod-grass-dosgel`
  - `prod-grass-gloss`
  - `prod-grass-antigraffiti`
  - `prod-kiehl-torvan`
  - `prod-kiehl-omnifresh`
  - `prod-kiehl-grassetplus`
  - `prod-kiehl-carpacryl`
  - `prod-ecolab-odor`
- В проде есть 3 устаревших products, удалённых из seed после веб-аудита:
  - `prod-prochem-coffee`
  - `prod-kiehl-arenas`
  - `prod-ecolab-odogone`
- `compatibility_verified` в актуальном seed подтверждена только у:
  - `prod-prochem-stainpro`
  - `prod-prochem-spotter`

Важно: `prod-kiehl-arenas` удалён осознанно после инцидента с кислотным средством, выданным за нейтральное. Его нельзя возвращать.

## Проект безопасной синхронизации

Создан файл `db/manual-seeds/seed-stage10.sql` (намеренно вне `migrations/`, чтобы `wrangler d1 migrations apply` не мог случайно выполнить draft как schema-миграцию):

- только `INSERT OR IGNORE` 13 отсутствующих products;
- не содержит `DELETE`;
- не трогает `analytics_events`, `campaigns`, `leads`, `companies`, `solutions`;
- включает compatibility-поля для `prod-prochem-spotter`, потому что `UPDATE` из `seed-stage9.sql` на проде был no-op при отсутствии строки;
- содержит контрольный `SELECT`, который должен вернуть 21 строку полного seed-каталога.

Не включено в `seed-stage10.sql` намеренно: архивация/удаление устаревших `prod-prochem-coffee`, `prod-kiehl-arenas`, `prod-ecolab-odogone`. Это отдельное контентное решение после проверки ссылок из `solution_products` и `campaigns`. Рекомендуемый безопасный второй шаг — не `DELETE`, а идемпотентный `UPDATE status='archived'`, затем отдельная проверка витрин.

## Порядок применения после подтверждения владельца

1. Исправить Cloudflare API token: добавить Account → D1:Read (для применения позже — D1:Edit). Значение `CLOUDFLARE_ACCOUNT_ID` в секретном хранилище также нужно хранить чистым UUID без префикса `CLOUDFLARE_ACCOUNT_ID=`.
2. Read-only backup/export prod-D1.
3. Проверить `d1_migrations` и сверить со списком файлов.
4. Проверить counts: `products`, `companies`, `campaigns`, `solutions`, `solution_products`.
5. Проверить references устаревших products перед любой архивацией.
6. Применить `db/manual-seeds/seed-stage10.sql` через `execute --file`.
7. Не регистрировать `seed-stage10.sql` в `d1_migrations`, пока файл находится вне `migrations/`; регистрация нужна только если операционный seed когда-либо будет лежать в migration directory.
8. Проверить prod: спонсорский слот на подходящем протоколе, отсутствие SSR/CLS регрессий, счётчик products = 21.

До исправления permission и подтверждения владельца данные в D1 не менять.
