# Cloudflare/D1 inventory — 2026-11-27

Read-only инвентаризация прод-D1 для `chistolab.pro`. Изменений в продовых данных не выполнялось.

## Доступ и идентификация базы

- `npx wrangler d1 list` успешно выполнен после обновления API token.
- В Cloudflare API база отображается как `cleaning-rating`, UUID `871b3c22-b53c-46b8-95a9-b3da96a2c31f`.
- В `wrangler.jsonc` этот же UUID привязан как `database_name: "cleaning-rating-db"`; команды `wrangler ... cleaning-rating-db` работают через конфиг воркера.
- Секрет `CLOUDFLARE_ACCOUNT_ID` в org-scope валиден (hex32). Personal-секрет с этим именем имеет невалидную структуру и не использовался.

## Миграции

`npx wrangler d1 migrations list cleaning-rating-db --remote` до чистки показывал один pending файл:

| pending | диагноз |
|---|---|
| `0011-apply.sql` | временный duplicate `0011_common_silver_samurai.sql` без `--> statement-breakpoint`; колонки уже есть в проде, сама миграция `0011_common_silver_samurai.sql` зарегистрирована. Файл удалён из репозитория, чтобы `migrations apply` не пытался повторно выполнить duplicate ALTER. |

В `d1_migrations` зарегистрированы 19 записей: `0000`–`0011_common_silver_samurai`, `all_in_one_init`, `seed.sql`, `seed-stage5`–`seed-stage9`. Остальные ранее существовавшие файлы в `migrations/` соответствуют реестру. После удаления duplicate `0011-apply.sql` повторный `migrations list` не показывает pending-файлов. Draft `seed-stage10.sql` намеренно лежит в `db/manual-seeds/`, а не в `migrations/`, чтобы wrangler не считал операционный seed schema migration.

## Сверка counts: прод-D1 vs `db/seed-data.ts`

| таблица | прод-D1 | seed | итог |
|---|---:|---:|---|
| `products` | 11 | 21 | критический дрейф |
| `cleaning_companies` | 28 | 28 | count и ID совпадают |
| `campaigns` | 3 | 3 | count совпадает, но один ID различен |
| `solutions` | 25 | 25 | count и ID совпадают, контент частично устарел |

Дополнительная read-only сверка связанных таблиц:

| таблица | прод-D1 | seed | итог |
|---|---:|---:|---|
| `solution_products` | 50 | 50 | ID совпадают, но все 50 строк отличаются по `brand_id`/`note` |
| `intent_keywords` | 114 | 114 | совпадают |
| `price_estimates` | 93 | 93 | совпадают |
| `rating_sources` | 10 | 10 | совпадают |
| `company_categories` | 132 | 132 | совпадают |

## Найденный дрейф данных

### Products

В проде есть 3 legacy-строки, которых нет в актуальном seed после веб-аудита:

- `prod-ecolab-odogone`
- `prod-kiehl-arenas` — по-прежнему опубликован с ошибочным `ph=7`; аудит уже установил, что это кислотное предстирочное средство, а не нейтральный пятновыводитель
- `prod-prochem-coffee`

В проде отсутствуют 13 актуальных seed-продуктов:

- `prod-prochem-spotter`, `prod-prochem-inksolv`, `prod-prochem-solvall`, `prod-prochem-odourfresh`, `prod-prochem-fibreshampoo`
- `prod-grass-dosgel`, `prod-grass-gloss`, `prod-grass-antigraffiti`
- `prod-kiehl-torvan`, `prod-kiehl-omnifresh`, `prod-kiehl-grassetplus`, `prod-kiehl-carpacryl`
- `prod-ecolab-odor`

Из 8 пересекающихся продуктов только `prod-karcher-puzzi` совпадает полностью. У остальных устарели pH/описания/поверхности:

- `prod-prochem-stainpro`: pH `8.5 → 10.5`, описание и `prohibited_surfaces`
- `prod-prochem-urine`: pH `4.5 → 3.5`
- `prod-grass-cement`: pH `1.5 → 2`
- `prod-grass-azelit`: slug/name `grass-azelit-pro`/`Professional → grass-azelit-gel`/`Azelit-Gel`
- `prod-kiehl-powerfix`: pH `1 → 0.5`, назначение исправлено на гель для унитазов/писсуаров
- `prod-kiehl-sanikal`: pH `4.5 → 9`
- `prod-kiehl-tablefit`: описание уточнено

### Campaigns

- `camp-grass-offices` и `camp-karcher-home` совпадают с seed.
- В проде вместо `camp-prochem-stainpro` находится legacy `camp-kiehl-upholstery`, привязанная к `prod-kiehl-arenas` и содержащая ошибочное утверждение про нейтральный pH 7.0.
- Обе кампании в статусе `draft`, поэтому публичного показа сейчас нет, но legacy-кампания опасна при случайной публикации.

### Solutions и solution_products

- ID и основные поля 25 решений совпадают.
- Во всех 25 решениях `diy_cost_note` в проде остался старым BYN-only текстом; seed содержит двойную валюту `BYN / ≈RUB`.
- `video_url` в проде есть у `vino-na-divane` и `vodny-kamen-dushevaya`; оба URL отвечают `200 video/mp4`. Seed раньше знал только про первое видео; теперь `db/seed-data.ts` дополнен вторым URL, то есть этот пункт приведён к зеркалу без изменения прода.
- Все 50 строк `solution_products` в проде отражают старый каталог до веб-аудита: встречаются Arenas, OdoGone, Taxat Clean, Into Free, Omniclean и другие удалённые/неподтверждённые артикулы. Это критичнее самого count-дрейфа `products`, потому что именно эти note/brand связи видны в протоколах.

## Draft `db/manual-seeds/seed-stage10.sql`

Файл обновлён после ревизии химического графа, но **не применён**. Идемпотентность обеспечена SQLite UPSERT (`INSERT ... ON CONFLICT(id) DO UPDATE`) и точечными `UPDATE`. `DELETE` есть только в `solution_products` для устаревших артикулов Arenas/OdoGone/Taxat/Into Free/Omniclean; `analytics_events`, `brand_leads`, `partner_leads`, `profile_claims` не затрагиваются.

Состав draft:

| блок | операции |
|---|---:|
| все seed-products | 21 UPSERT; `created_at` существующих строк сохраняется |
| legacy products | 3 `UPDATE status='archived'` |
| `camp-prochem-stainpro` | 1 UPSERT; повторный запуск не перезаписывает counters |
| legacy `camp-kiehl-upholstery` | 1 `UPDATE status='completed'` (`archived` отсутствует в enum campaigns.status) |
| solution cost notes | 25 `UPDATE` |
| legacy solution_products | 1 защитный `DELETE` только по legacy-названиям в `note` |
| solution product graph | 50 UPSERT |
| **итого** | **72 UPSERT, 29 UPDATE, 1 DELETE** |

Проверка локально через SQLite `executescript` на минимальной схеме: файл выполняется дважды без ошибок и дублей; после обоих прогонов `solution_products` содержит 50 строк и 0 совпадений по `Arenas`, `OdoGone`, `Taxat`, `Into Free`, `Omniclean`.

Химические исправления в графе:

- `vino-na-divane` и `chay-na-obivke`: `Prochem Neutral Pro-Spotter` — `recommended`; `Prochem Stain Pro` — `alternative` с обязательным тестом и кислотным ополаскиванием.
- `vodny-kamen-dushevaya`: `Grass Gloss Gel` — `recommended` по кислотному шагу pH 2–3; `Kiehl Sanikal-eco` — `alternative` только для лёгкого мыльного налёта.
- `mel-flomaster-na-oboyah`: `Grass Antigraffiti` удалён из связки для обоев; основной деликатный вариант — `Prochem Ink Solv` только точечно после теста на моющемся виниле/краске, `Kiehl Tablefit` ограничен твёрдыми моющимися поверхностями.

## План применения после явного подтверждения владельца

1. Снять backup только затрагиваемых таблиц:

   ```bash
   npx wrangler d1 export cleaning-rating-db --remote \
     --table products --table campaigns --table solutions --table solution_products \
     --output backups/d1-before-stage10-$(date +%Y%m%d-%H%M%S).sql
   ```

2. Применить draft:

   ```bash
   npx wrangler d1 execute cleaning-rating-db --remote --file=db/manual-seeds/seed-stage10.sql
   ```

3. Вручную зарегистрировать seed-файл, как уже сделано для stage5–stage9:

   ```sql
   INSERT OR IGNORE INTO d1_migrations (name) VALUES ('seed-stage10.sql');
   ```

4. Verify read-only:
   - `products`: 24 строки total, из них 21 `published` и 3 `archived` legacy;
   - `camp-prochem-stainpro` существует, `camp-kiehl-upholstery.status='completed'`;
   - `solution_products` не содержит `Arenas`, `OdoGone`, `Taxat Clean`, `Into Free`, `Omniclean`;
   - все 25 `solutions.diy_cost_note` содержат двойную валюту `BYN / ≈RUB`;
   - `SELECT name FROM d1_migrations WHERE name='seed-stage10.sql'` возвращает одну строку после регистрации.

## Решения, которые нужно подтвердить перед применением

- Архивировать, а не удалять legacy-products `prod-kiehl-arenas`, `prod-prochem-coffee`, `prod-ecolab-odogone`; legacy `camp-kiehl-upholstery` перевести в `completed`, потому что `archived` нет в enum `campaigns.status`.
- Принять каталог seed как источник исправлений веб-аудита для products/solution_products, несмотря на общее правило «прод-D1 — источник истины»: в данном случае прод отстаёт от уже подтверждённого аудита.
- Оставить перенос `current_impressions=120/current_clicks=14` в новую `camp-prochem-stainpro` как в seed или обнулить счётчики при вставке.
