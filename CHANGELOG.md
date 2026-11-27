# ChistoLab — журнал работ (CHANGELOG)

Хронологический лог по датам/этапам. Актуальное состояние проекта и правила —
в `AGENTS.md`. Формат записи: что сделано → ключевые файлы → проверки → деплой.

---

## 2026-11-27 — Этап 10 inventory: read-only сверка прод-D1 и draft точечной синхронизации

- **Прод-D1 не изменялся.** Проверен доступ Cloudflare/D1: UUID базы в API совпадает с `database_id` из `wrangler.jsonc`; команды работают через имя `cleaning-rating-db` из конфига, хотя в `d1 list` база отображается как `cleaning-rating`.
- **Миграции:** в `d1_migrations` зарегистрированы `0000`–`0011_common_silver_samurai`, `all_in_one_init`, `seed.sql`, `seed-stage5`–`seed-stage9`. Удалён временный duplicate `migrations/0011-apply.sql` — он делал `0011` pending для wrangler, хотя колонки уже применены и зарегистрированы. После чистки pending только draft `seed-stage10.sql`.
- **Inventory (`docs/cloudflare-inventory.md`):** counts прод/seed — products 11/21, cleaning_companies 28/28, campaigns 3/3, solutions 25/25. Компании, intent keywords, price estimates, rating sources и company categories совпадают. Найден критический дрейф: 13 актуальных продуктов отсутствуют в проде, 3 legacy продукта лишние; campaign `camp-kiehl-upholstery` ссылается на ошибочный Arenas вместо `camp-prochem-stainpro`; все 25 `diy_cost_note` без RUB-эквивалента; все 50 `solution_products` ещё соответствуют старому каталогу до веб-аудита.
- **Draft `migrations/seed-stage10.sql`:** только `INSERT OR IGNORE`/`UPDATE` (14 + 101), без DELETE/ALTER и без затрагивания analytics/leads/claims. План: добавить 13 продуктов и Prochem-кампанию, синхронизировать 21 продукт, архивировать 3 legacy-товара и legacy campaign, обновить 25 смет и 50 связок solution_products. НЕ применён — нужно явное подтверждение владельца.
- **Seed-зеркало:** в `db/seed-data.ts` добавлен `videoUrl` для `vodny-kamen-dushevaya` — прод уже отдаёт существующий `200 video/mp4`, поэтому зеркало догнано без изменения прода.
- Проверки: typecheck 0, lint 0, тесты 252/252. SQL draft проверен локально через SQLite `executescript`: ошибок синтаксиса нет.

---

## 2026-11-26 — Подключение Google Tag Manager (GTM-5N84R54Q)

- **`ConsentGatedAnalytics`:** контейнер GTM монтируется по тому же consent-гейту,
  что YM/CF — только после `ch_consent="all"` (Zero-PII обещание /privacy).
  Актуальный формат Google-тега 2025+: `dataLayer`+`gtag` синхронно, затем ручная
  инжекция `gtm.js` (порядок не зависит от next/script); `gtag('config')` не нужен —
  gtm.js-контейнеры инициализируются при загрузке.
- **`wrangler.jsonc`:** новый var `NEXT_PUBLIC_GTM_ID` = `GTM-5N84R54Q`.
- **Тексты:** баннер согласия и `/privacy` п.3 — добавлен Google Tag Manager в список
  внешних счётчиков.
- Проверки: typecheck 0, lint 0, тесты 252/252.
- **Деплой (2026-11-26):** `npm run deploy` — Version 1c7576f6-c2cc-47c0-8809-eb839c6b76ed,
  `NEXT_PUBLIC_GTM_ID` в биндингах воркера. Прод верифицирован: `/` 200, `/privacy` упоминает
  GTM, `googletagmanager` в исходном HTML отсутствует — корректно, скрипт инжектируется
  на клиенте только после согласия.

---

## 2026-11-26 — Этап 9: Perf-пакет (TBT), тех. SEO и коммерческая готовность рекламы

### Perf / Core Web Vitals
- **`motion/react` убран из критического бандла:** `components/Navbar.tsx` (hover-пилюля → CSS), `components/home/Reveal.tsx` (InView → нативный IntersectionObserver + CSS-классы `.reveal-*` в globals.css, prefers-reduced-motion учтён), удалены неиспользуемые `components/providers/MotionProvider.tsx` и хук in-view; зависимость `lenis` удалена из package.json (не использовалась нигде).
- **RSC-пейлоад главной урезан и дедуплицирован** (`app/page.tsx`): компактные проекции `toCardSolution`/`toCardCompany` — все 4 клиентские секции (StainRescue, VideoLabSection, CleanersByServiceSection, TaskRibbon) получают одни и те же объектные ссылки, поэтому протоколы сериализуются один раз вместо 3–4. HTML главной 303 → 249 KB, RSC-пейлоад −40%.
- **Замер Lighthouse (локально, `next start`, тихая машина):** TBT ~5800 → **2080 мс**, Perf 0.63 → **0.70**, LCP 1.26 с, CLS 0. Основной остаток — стоимость гидратации react-dom runtime (227 KB framework-чанк), снижается только архитектурно (lazy hydration нижних секций — отдельный этап). Замеры на машине сильно шумные: под нагрузкой TBT гуляет до 3900 мс.
- **`lighthouserc.json`:** пороги пересмотрены с фиктивных (Perf 0.3, TBT 6000) на анти-регрессионные (Perf 0.5, TBT 3400, LCP 3500) — отсекают откат, но достижимы на текущей архитектуре.

### Техническое SEO
- **`app/sitemap.ts`:** компании закрытых рынков (KZ/Алматы) исключены из карты; посадочные и хабы считаются по открытым рынкам; lastmod агрегаторов (`/`, `/solutions`, `/rating`, `/brands`) — реальный максимум updatedAt сущностей вместо зашитой даты 2026-02-14.
- **`app/companies/[slug]/page.tsx`:** `noindex, follow` для профилей компаний закрытых рынков — раньше страницы Алматы индексировались при выключенном рынке.
- **JSON-LD:** `CollectionPage`+`ItemList` на `/solutions` и `/brands`; на `/brands/[slug]` стабильные якоря `#product-{slug}` у карточек средств + `@id` в Product-графе — вместо тонких `/products/[slug]` (решение: отдельные страницы товаров откроются после наполнения техкарт, сейчас было бы thin content).
- **`app/layout.tsx`:** `alternateLocale: ["ru_RU"]` в OpenGraph.
- **⚠️ Грабля найдена и закрыта:** недетерминированные таймауты D1 при билде (SQLITE_BUSY локального Miniflare) растягивали `generateMetadata`, и Next.js запечатывал в статический HTML служебный `<meta robots noindex>` streaming-шелла РЯДОМ с настоящим `index,follow` — при конфликте Google берёт restrictive, компании выпали бы из индекса (у части страниц уже запекалось!). Фикс: `lib/db/client.ts` возвращает null при `NEXT_PHASE=phase-production-build` — SSG всегда строится из seed-fallback детерминированно, генерация 174 страниц ускорилась 62с → 15с, D1-шум из билда исчез. Побочное исправление: `robots: undefined` затирал дефолт layout — ключ теперь добавляется только для закрытых рынков.

### Коммерческая готовность (разблокировка solution.sponsored_product)
- **Схема D1 `products`:** новые колонки `compatible_materials` (JSON), `compatibility_verified`, `compatibility_source` — миграция `migrations/0011_common_silver_samurai.sql`.
- **Верифицированные данные по техкартам производителя** (`db/seed-data.ts` + `migrations/seed-stage9.sql`): Prochem Stain Pro — по TDS B144/pssb144.pdf (водно-сольвентный щелочной пятновыводитель для ковров и тканей, incl. wool с pre-test, pH 10.5 подтверждён); Prochem Neutral Pro-Spotter — WoolSafe-approved нейтральный. Материалы указаны точными строками `solution.material` — гейт `hasVerifiedCompatibility` требует exact match.
- **`lib/ads/queries.ts`:** маппинг новых полей в `getProductsSafetyMap` (D1 и seed-fallback).
- **Медиакит (`lib/ads/media-kit.ts`):** к каждому формату добавлен `priceLabelRu` в ₽ (490 BYN ≈ 15 000 ₽ и т.д. — маркетинговое округление), обе валюты выводятся на `/for-brands`.
- **Тесты:** старый инвариант «слот всегда пуст» заменён на пару — гейт пропускает подтверждённый материал (шенилл/рогожка → Stain Pro выходит в слоте) и отсекает неподтверждённый (кожа/велюр-mix).

### Проверки
- typecheck 0, lint 0, тесты 252/252, build 174/174 страниц.
- sitemap: 83 URL, 0 almaty; страницы компаний KZ отдают `noindex`.

### Деплой (2026-11-26)
- Прод-D1: миграция `0011` применена через `execute --file` (3 колонки в products — верифицировано запросом к sqlite_master), затем `seed-stage9.sql`. ⚠️ `migrations apply` был опасен: wrangler считал seed-stage6/7/8 неприменёнными (накатывались через execute --file), а stage6 содержит plain INSERT — повторный прогон повредил бы данные. Все seed-stageN вручную зарегистрированы в `d1_migrations` — будущий `migrations apply` безопасен.
- `npm run deploy` — Version 9c5fc3e0-7ed0-4af5-ba45-e02d86213012, 174/174 страниц.
- `npm run indexnow` — 83 URL, api.indexnow.org 200, yandex.com 200.
- Верификация прода: главная и открытые компании — одиночный `index, follow`; alaclean — `noindex, follow`; sitemap 83 URL, 0 KZ, lastmod из реальных updatedAt; `/for-brands` показывает BYN + ₽; `/solutions` — CollectionPage JSON-LD.
- ⚠️ Найден дрейф данных (решение владельца): в прод-D1 11 продуктов vs 21 в seed. В продукте нет prod-prochem-spotter/fibreshampoo/inksolv/solvall/odourfresh, kiehl-carpacryl/grassetplus/omnifresh/torvan, grass-antigraffiti/dosgel/gloss, ecolab-odor; зато в проде есть prod-prochem-coffee, prod-kiehl-arenas, prod-ecolab-odogone, которых нет в seed. UPDATE spotter из seed-stage9 на проде — no-op (строки нет). Массовая вставка НЕ делалась — это контентное решение.

---

## 2026-11-25 (поздний вечер) — Этап 8: веб-верификация каталога компаний (seed-stage8)

- **Веб-сверка каждой компании** по официальным сайтам, Яндекс.Картам и
  реестрам (УНП/ИНН). Источник истины — живые карточки, не тексты сайтов.
- **Удалены 3 компании Минска:** `freshclean` (дубль телефона «Спектр Клининг»),
  `ladyclean` (заглушка УНП 123456789, недостоверные ISO-теги), `skyclean`
  (решение владельца).
- **Добавлены 5:** Минск — GetClean (УНП 192613202, от 76 BYN/1-комн.),
  GreenCleaning (УНП 193612839, после ремонта от 4 BYN/м²), Альфа Клининг
  (от 39 BYN, 24/7), Клинтри (1-комн. ~150 BYN); Москва — UberClean
  (ИП Седов А.А., Яндекс 5.0/551, от 3 390 ₽). Мойдодыр сознательно
  не добавлен — рейтинг 4.4 не проходит планку «высокий».
- **Правки Минска:** Спектр Клининг цена → от 2,7 BYN/м² (подтверждено
  владельцем); SAUBER — адрес ул. Платонова 10 оф. 102, цена от 99 BYN/уборка
  вместо «18 за окно»; Чистый Кит — имя без «CleanWhale», ООО «ВИРИКС Групп»,
  телефон/адрес, единица 1-комн.; CleanOFF — адрес ул. Беломорская 23,
  priceUnit «мес»; Глянец Про — от 115 BYN/1-комн. (по прайсу поддерживающей);
  nesoda — ген. уборка от 10 BYN/м² (не 20), «с 2021»; Грязи Нет — от 3 BYN/м²,
  ООО «ГРЯЗИ НЕТ»; Clean-Clean/FreshRoom — телефоны и единицы цен.
- **Правки Москвы:** у всех 10+1 компаний проставлены цены с единицами
  (м² или уборка — по прайсам сайтов); Аннушка/Чистюля/CleanYou — телефоны,
  адреса, почта; Qlean — адрес Вятская 27с15; CleanOn — адрес Ольховская 15,
  убрано «лидер рейтингов 2025». Рейтинги Яндекс.Карт актуализированы:
  CleanOn 5.0/1438, Клининг24 5.0/214, Qlean 4.2/2299, Аннушка 4.9/1703;
  Чистюля получила источник 4.7/70 — рейтинг теперь показывается.
  Qlean (4.2) и Домовёнок (4.3) оставлены с честными рейтингами — решение
  владельца: прозрачность важнее отсева.
- **Файлы:** `db/seed-data.ts` (весь блок компаний), `migrations/seed-stage8.sql`
  (DELETE 3 + UPDATE 20 + INSERT 5 компаний/категории + 6 rating_sources,
  идемпотентно), `tests/cleaning-services.test.ts` (синтетический noUnit —
  в сиде больше нет компаний без единицы цены, это теперь инвариант).
- **Проверки:** typecheck 0, lint 0, тесты 251/251.
- **Прод-D1:** `seed-stage8.sql` применён через `wrangler d1 execute --remote`
  (предварительно подтверждено read-only сверкой — все 26 старых строк на месте).
  Итог в базе: Минск 14, Москва 11, Алматы 3.
- **Деплой:** `npm run deploy` → version `406f09e6-5cc9-49db-a5f4-19c3d322a6f2`;
  прод `/rating` — удалённые компании отсутствуют, GetClean/UberClean рендерятся.

---

## 2026-11-25 (вечер) — Фикс регионального фолбэка и упрочнение гео-детекта (задеплоено, v025b1d4d)

- **Баг:** у посетителей без cookie `ch_region` (все страны кроме RU/BY) после
  гидратации применялся `DEFAULT_STATE` = Минск — сайт «притворялся минским»
  для всего остального мира. Теперь `resolved` включается только при наличии
  cookie (автодетект RU/BY) или ручного выбора региона; без cookie интерфейс
  остаётся нейтральным постоянно (`components/providers/RegionProvider.tsx`).
- **`proxy.ts`:** гео-сигнал читается и из `request.cf.country`, и из заголовка
  `CF-IPCountry` — Node-middleware OpenNext может не проксировать объект `cf`;
  заголовок Cloudflare перезаписывает на edge, подделка с клиента невозможна.
- Проверки: typecheck чисто, solutions/zone-shelf 17/17, прод: не-RU/BY
  посетитель cookie не получает, SSR нейтральный (200, без set-cookie).
- Деплой: `npm run deploy` → version `025b1d4d-0755-4df6-b606-b24e5cd127e3`.

---

## 2026-11-25 — Веб-аудит средств + нейтральный SSR и автодетект региона (задеплоено, v b417fd93)

- **Веб-аудит каталога** (`db/seed-data.ts`, `docs/product-audit.md`):
  критический инцидент — `Kiehl Arenas-exet 3` был выдан за нейтральный
  пятновыводитель вина (pH 7.0), по факту кислотное средство от ржавчины
  (pH ≈ 1.0, предстирочное). Исключён из каталога, 4 протоколов, витрины и
  кампании. Исправлены pH/описания: Prochem Stain Pro 8.5→10.5,
  Sanikal-eco 4.5→9.0 (слабощелочной), Powerfix-Gel — гель для унитазов pH 0.5
  (не «очиститель цемента»). Удалены неподтверждённые артикулы: Prochem Coffee
  Stain Remover, Ecolab OdoGone, Grass Anti-Fat/Vitril/Window, Kiehl Omniclean/Sanpro,
  Ecolab Taxat Clean/Into Free/Oasis. Все 50 связей `seedSolutionProducts` приведены
  к реальным артикулам с верифицированными pH (prochem.co.uk, kiehl-group.com, grass.by).
- **Скрыты выдуманные рейтинги и цены** витрины (★4.5–4.9, точные BYN без источника):
  `rating` в `AffiliateProduct` стал опциональным, ссылки — честные «сайт бренда».
- **Катч регрессионным тестом:** `nalet-chernaya-santehnika` — кислотный Powerfix
  заменён на нейтральный Torvan (протокол запрещает кислоты для матовых PVD);
  `pota-na-obivke` — Stain Pro заменён на Neutral Pro-Spotter (материал кожа).
- **`checkProductSafety` (`lib/ads/eligibility.ts`):** исправлен ложный блок —
  «не наносите кислоту на мрамор» больше не запрещает кислоту на керамограните
  (эвристика по предложению + совпадение материала).
- **`lib/assistant/guides.ts`:** исправлены названия и pH-клеймы (Torvan вместо
  «Veriprop/Torvan pH 7», Kärcher RM 519/WV 1 вместо вымышленного Glass Cleaner,
  Neutral Pro-Spotter вместо Prespray Gold, Bio-Enzymatic вместо OdoGone,
  Diversol вместо Kitchen Pro); все `diyCostNote` — двойная валюта `BYN / ≈RUB`.
- **Регрессионный тест** `tests/product-audit.test.ts`: существование брендов/решений
  в связях, химическая совместимость рекомендаций с поверхностью протокола,
  запрет маскировки кислот под нейтральные средства, запрет возврата Arenas.
- **Нейтральный SSR + автодетект региона:** `proxy.ts` — живому посетителю из
  `RU`/`BY` по `CF-IPCountry` один раз выставляется cookie `ch_region`
  (краулеры и прочие страны — без cookie). `RegionProvider` — флаг `resolved`
  (false на SSR и первом рендере): RegionSelector показывает «Регион», MarketBadge
  «СНГ», HeroStats — суммарные компании и цены `от X Br / от Y ₽`, мосты
  ProductZoneShelf/StainRescue — «в вашем городе» без валютной привязки,
  CleanersByServiceSection — заголовок без города, компании всех открытых
  городов и двойная смета. После гидратации — обычный региональный рендер.
  Опечатка мета-описания главной («кратеры чистоты») исправлена.
- **Проверки:** typecheck 0, lint 0, **251/251 тест**, build webpack.
- **Не сделано (TODO владельца):** деплой; точные цены/рейтинги — только после
  подтверждённых источников/дилеров; миграции D1 на прод не запускались
  (prod продолжает читать свои таблицы).

## 2026-11-24 — Release A: стабилизация (Zero-PII, аналитика, B2B, perf)

- **Zero-PII «Радар спроса»:** `sanitizeDemandSearchQuery` вынесен в
  `lib/search/demand.ts` (route-файлы не экспортируют хелперы — ловил build);
  из поискового запроса отсекаются телефоны/email/ссылки перед записью в
  `analytics_events`. Тест в `tests/launch-guards.test.ts`.
- **Аналитика hero:** `HeroAssistant.tsx` — `eventType` "share"→"view",
  metadata приведена к `METADATA_ALLOWLIST` (`lib/analytics/validation.ts`).
- **B2B-входы на главной:** `app/page.tsx` — две кнопки: «Клининговым компаниям»
  → `/for-partners`, «Брендам и дилерам» → `/for-brands`.
- **Perf:** удалён `@paper-design/shaders-react` целиком (`fx/index.tsx`
  изолирован, CSS-фолбэк); `SpeculationRules` — prerender → conservative.
  Замер главной: **Perf 0.43→0.63, LCP 4.4с→1.41с**, A11y 0.91, SEO 1,
  TBT ~5.8с (долг), CLS 0.013.
- **SEO/шеринг:** `lib/site.ts` — `pageSocialMeta`/`pageAlternates`/`cityAlternates`;
  `og:url`/`og:title`/`twitter:*` теперь на каждой странице, а не наследуются
  от главной. `app/sitemap.ts` — force-dynamic, реальный `lastmod` из D1,
  hreflang только для индексируемых эквивалентов. `X-Robots-Tag: noindex,follow`
  на фильтрах (proxy.ts).
- **Lighthouse CI:** `lighthouserc.json` — ослабленные baseline-пороги
  (Perf≥0.3, A11y≥0.9, SEO=1, LCP<8с, TBT<6с, CLS<0.1). Строгие пороги —
  после perf-пакета.
- **Проверки:** typecheck 0, lint 0, **234/234 тестов**, build 170 страниц.
- **Деплой:** версия `ed554323-1580-489d-8409-2c4dbd9a1115`. Прод-проверки:
  15 URL → 200, www→301, og-теги корректны, аналитическое событие persisted.
- **Инцидент:** EPERM на `.open-next` — брошенный `next start --port 3100`
  держал файлы; убит по PID, повторный деплой прошёл.

## 2026-11-24 — Release B: фото-бета (выключена)

- **`lib/assistant/photo.ts`** (~500 строк): строгий пайплайн — magic-bytes
  детект jpeg/png/webp, чтение размеров без decode, лимиты
  (5 МБ / 2048px), вызов `@cf/meta/llama-4-scout-17b-16e-instruct`
  (PHOTO_MODEL), таймаут 20с. Модель возвращает **только токен категории**
  из белого списка (`stain_upholstery`, `carpet`, `window`, `unclear`,
  `not_cleaning`, `personal_data`…); парсер отвергает любой произвольный
  текст/рецепт/инъекцию → безопасный отказ. Ответ собирается детерминированно
  из проверенной базы (`buildPhotoProtocolAnswer`, `buildPhotoFallbackAnswer`).
- **`app/api/assistant/photo/route.ts`** — POST, fail-closed цепочка:
  `PHOTO_ASSIST_ENABLED !== "1"` → 503 → `checkPhotoRateLimit` (PHOTO_LIMITER,
  10/мин, в проде отсутствие биндинга = unavailable) → content-length/5МБ →
  multipart → сигнатура/размеры (415) → Turnstile → `reservePhotoAttempt`
  (атомарный D1-бюджет `ai_usage_daily`, 40/день, fail-closed без D1) →
  AI-вызов → ответ `no-store`. Фото/EXIF не пишутся никуда; аналитика —
  только `resultKind`.
- **`lib/assistant/photo-budget.ts`** + `db/schema.ts` таблица `ai_usage_daily`
  + миграция `migrations/0010_worthless_puff_adder.sql` (аддитивная).
- **UI:** `components/assistant/PhotoAssist.tsx` — клиентское сжатие до
  ~1.5 МБ / 1600px, выбор материала, Turnstile, честные отказы; рендерится
  только при `NEXT_PUBLIC_PHOTO_BETA="1"`. Подключён в `PlatformHero`
  (`HeroPhotoAssist`) и `AssistantPanel`. Ответ фото идёт в общий
  `applyPhotoAnswer`/рендер панели.
- **Правовая база:** `app/privacy/page.tsx` — п.6 «Фото-разбор (бета)»
  (транзитная обработка Workers AI, без хранения, EXIF не пишется);
  `app/terms/page.tsx` — п.6 с дисклеймером «не экспертное заключение».
- **`wrangler.jsonc`:** vars `PHOTO_ASSIST_ENABLED=""`, `PHOTO_DAILY_BUDGET="40"`,
  `NEXT_PUBLIC_PHOTO_BETA=""`; rate-limit `PHOTO_LIMITER` (namespace 2105, 10/60s).
- **Тесты:** `tests/photo-assist.test.ts` — 13 тестов (magic bytes, размеры,
  валидация, парсер-инъекции, протокол/fallback, бюджет-фейк D1, гейты роута).
  Итого **247/247**, typecheck 0, lint 0, build 170 страниц.
- **Деплой:** миграция 0010 применена к прод-D1 (`seed-stage6/7` упали на
  UNIQUE solutions.slug — старые сиды, не критично); версия
  `59c4b360-e99c-4948-934a-b119907e1c0e`. Прод: `/api/assistant/photo` →
  `{"error":"photo_disabled"}`, все страницы 200, биндинги AI/PHOTO_LIMITER
  подтверждены.
- **Включение беты** = `PHOTO_ASSIST_ENABLED="1"` + `NEXT_PUBLIC_PHOTO_BETA="1"`
  в wrangler vars + редеплой (отдельное решение владельца).

---

## 2026-11-18/20 — Этап 7: SEO-фундамент

- KZ выключен (`KZ.enabled=false`, данные/сметы KZT сохранены); 301 www→apex
  в `proxy.ts` (matcher без `/api`); футер — только индексируемые ссылки;
  `app/sitemap.ts` → force-dynamic с `lastmod` из D1 (`getEntityTimestamps`);
  IndexNow (`scripts/indexnow.mjs`, ключ в `public/`); реальные рейтинги
  8 компаний Москвы (`ratingSource:"yandex"` + `rating{}` из Яндекс.Карт).
- **Правило данных:** `updated_at`/`created_at` — в миллисекундах
  (старое `unixepoch()` дало lastmod «1970» на проде).
- Деплой `84d64d05`; `seed-stage7.sql` (8 rating_sources) применён;
  `npm run indexnow` — 84 URL → 202.
- `npm run indexnow` запускать после деплоев с изменением URL.

## 2026-11 — Этап 6: протокол «Мел/фломастер на обоях» + поверхность wall

- Новая `SolutionSurface` `wall` («Стены и обои») во всех enum'ах;
  протокол `mel-flomaster-na-oboyah` (25-е решение), 7 intent-ключей,
  сметы BY/RU/KZ. `seed-stage6.sql` применён к прод-D1 точечно.
- **Инцидент:** apex `chistolab.pro` NXDOMAIN при живом www —
  `wrangler triggers deploy` перепривязал custom domain.

## 2026-11 — Видеохостинг на R2

- Бакет `chisyolab`, биндинг `MEDIA`; `app/media/[...key]/route.ts` —
  Range/304/whitelist-расширений (svg/html не отдаём); вертикаль `9x16`
  по имени файла; первый ролик `vino-na-divane-9x16.mp4` на проде.
- Загрузка: `wrangler r2 object put "chisyolab/<slug>-9x16.mp4" --remote`.
- **Грабля:** не передавать `Headers` в `bucket.get()` — dev-прокси падает
  с DevalueError; `cf:typegen` пишет литералы vars → env читать как
  `string | undefined`.

## 2026-11 — Упрощение главной + заглушки рекламных слотов + тарифы

- Тарифы PRO: цена основателя BY 290/RU 9000/KZ 49000 на 6 мес
  (`PRO_FOUNDER_MONTHS`), далее 390/12000/65000; `?format=` на /for-brands.
- `buildSlotPlaceholder` + `AdSlotPlaceholder` (strip/card/poster) —
  «место свободно» вместо пустых дыр; `search.sponsored_result` → null.
- Главная: 7→6 блоков, новый H1 «Уберите любое пятно — сами или с мастером».
- `cleanerCardPrice` — прайс компании с её единицей всегда.

## 2026-11-15 — SEO/GEO-спринт

- Хабы `/[city]`, посадочные `/[city]/[category]` (порог индексации ≥2
  компаний — `LANDING_INDEX_MIN_COMPANIES`), `CATEGORY_GUIDES`,
  `cityAlternates` (x-default = первый индексируемый рынок кластера).
- E-E-A-T: `solutions.reviewed_by`/`sources` (миграция 0009),
  `SOLUTION_REVIEWER`/`SOLUTION_DEFAULT_SOURCES`/`SOLUTION_SEED_DATE`
  (`lib/solutions/editorial.ts` — фиксированная дата, НЕ Date.now()).
- `/llms.txt`, JSON-LD докрутка (Brand+Product, LocalBusiness priceRange,
  BreadcrumbList на /for-partners), `serializeJsonLd` экранирует `<`.
- **`migrations/seed.sql` на проде ЗАПРЕЩЁН** — DELETE'ит analytics_events,
  campaigns, profile_claims, rating_sources.

## 2026-11 — Монетизация «время размещения» + ИИ на Scout

- `ANSWER_MODEL` → `@cf/meta/llama-4-scout-17b-16e-instruct` (~×7 дешевле 70B,
  мультимодальный — задел под фото); фолбэк `llama-3.1-8b-instruct-fp8-fast`.
- `initOpenNextCloudflareForDev()` в next.config — AI/D1 работают в `next dev`.
- Misses-лог: `mode:"empty"` → analytics `assistant.miss` → «Радар спроса».
- Честность данных: внешние рейтинги без источника → `ratingSource:"unverified"`,
  объект `rating` убран (seed.sql — 0 rating_sources до проверки).
- Дилерские поля `dealerName`/`promoCode` → ShelfProduct → карточки;
  `campaigns.promo_code` (миграция 0008).
- `lib/ads/media-kit.ts` — форматы/цены-плейсхолдеры для /for-brands.

## 2026-11 — Пострелизные фиксы прода (критично для понимания)

- **Маппер D1:** `toCompanyRow()` в `lib/db/queries.ts` — drizzle отдаёт
  camelCase+boolean, старый `as CompanyRow` терял verified/promoted/контакты/
  цены/coverImage на проде. При смене схемы держать маппер в синхроне.
- **404 на `/[city]/[category]` в воркере:** `dynamicParams=false` +
  пустой incremental cache → NoFallbackError → закешированный 404.
  `dynamicParams` НЕ отключать нигде — валидность через `notFound()`.
- **OG/icon 500:** шрифты через fs не работают в воркере →
  `ogFonts()`: fs → `env.ASSETS` → fetch `SITE_URL/fonts/*`.
- **Incremental cache:** ключ с `NEXT_BUILD_ID`; `set()` пропускает status≥400.
- Прод-D1: миграции 0006/0007 применены; `price_estimates.unit` исправлен.

## 2026-11 — Доводка визуала до эталона Lovable

- Токены `--ink/--lime/--teal` реально определены в `:root`/`.dark`
  (раньше были только в `@theme` — классы молча не работали).
- Порядок главной: `PlatformHero → ProductZoneShelf → SeasonalBrandBanner →
  VideoLabSection → CleanersByServiceSection → TaskRibbon → trust → B2B`.
- `curl` к localhost требует `--noproxy "*"` (VPN-прокси перехватывает loopback).

## 2026-11 — Редизайн в стиле Lovable (этапы 3–4, plan-2fa43d9a)

- Двухэтажная шапка, `PlatformHero`, `ProductZoneShelf`, `SeasonalBrandBanner`,
  `VideoLabSection` (сторис-плеер), `CleanersByServiceSection`.
- Этапы 1–2: шрифты Golos Text + JetBrains Mono, токены.

## 2026-11 — Главная ChistoLab 2.0 (plan-09dd577c)

- Hero-диагностика в 3 тапа: `RadioCards` + `listAllProblems`/`listSurfaces`;
  реестровые компоненты `components/ui/*` (text-effect, in-view, animated-*,
  bento-grid) и `components/arc/radio-cards`.
- Правила: `motion.create` в рендере запрещён (линт static-components) —
  модульная карта `motionComponents`; `AnimatedBackground` управляемый;
  Arc `foundation.css` не подключать, CSS-переменные Arc — HSL-триплеты.
- `/suppliers` удалён (404).

## 2026-11 — Трансформация, фаза 1 (локально)

- Совместимость товаров НЕ подтверждается pH/брендом/таргетингом: для
  `solution.sponsored_product` нужны материал+поверхность+источник —
  товарный слот закрыт до проектирования данных (`ProductSafetyProfile`
  имеет `compatibleMaterials`/`compatibilitySource`/`compatibilityVerified`,
  но в D1 не сохраняются).
- Свободные ответы ИИ помечаются предварительными и непроверенными.

## 2026-11 — ИИ-технолог v2 + дизайн-апгрейд + hero-ИИ

- Фото-диагностика убрана из `/api/assistant` (VISION_MODEL удалён) —
  заменена точечным триажем; химические синонимы `SOLUTION_CHEMICAL_ALIASES`
  в `lib/search/rank.ts`; 3-уровневый retrieval (Vectorize→токены→LLM).
- `AssistantPanel` — полный дашборд ответа (светофор, чек-лист, средства,
  смета, мастера, follow-up). `useAssistantConsult` — общий хук.
- Hero: `HeroAssistantProvider` + `HeroAnswerSlot` (ответ без CLS, карточка
  через `next/dynamic ssr:false` при первом запросе).
- Дизайн: Aurora только CSS (шейдеры позже удалены в Release A), плавающая
  glass-капсула Navbar, TaskTicker с fx-mask, bento-манифест принципов
  (позже удалён в 2.0).

## 2026-11 — Epic Games + Steam + Textura Lab (plan-d70d7461)

- Скилл `.devin/skills/epic-steam-lab/`; Lenis-колесо отключено в
  MotionProvider (нативный скролл). Чипы триажа `Свежее/Высохло/Замывали`
  → `?timing=` на `/assistant`. *(капсула hero позже удалена в 2.0)*

## 2026-11 — Фазы 3–4 + Linear Precision UI

- Скилл `.devin/skills/linear-style-ui/`; хоткеи `/`/`⌘K`, `.linear-beam`,
  микро-анимации BeforeAfter/DiyChecklist.
- **Zero-PII лиды:** `lib/privacy/pii.ts` — лиды транзитом в Telegram,
  в D1 только `tg-sha256:<16hex>` хеш (`PII_HASH_PEPPER`); при падении
  Telegram в проде → 503 (контакт не теряется).
- `lib/partners.ts` — валютные сметы PRO, `NON_OFFER_DISCLAIMER`,
  prefill-заявки; «Радар спроса» в /admin.

## 2026-11 — Zero-Risk Sponsorship

- Модель: PRO = полка на первом экране, не лидогенерация; отчёты по
  звонкам клиенту не обещаются.
- `splitSponsors` — спонсоры отдельным блоком «Реклама — не участвует
  в рейтинге» НАД органикой; место #1 всегда органическое (тест-страж).
- Гео-чистка: Брест выкл, СПб/миллионники РФ `enabled:false` до данных.
- `lib/landing.ts` — чистый синхронный модуль (без D1 в клиентском бандле).
- `/admin` — `getCompanyEventStats` (контакты компаний за 30 дн).

## 2026-11 — Адаптация под chistolab.pro + ИИ v2 (ранее)

- `SITE_NAME="ChistoLab"`, `SITE_DOMAIN="chistolab.pro"`, монограмма CL;
  wrangler routes custom_domain для apex+www.
- ИИ v2 без фото: точечный триаж, `AssistantPanel`, `SmartSearch`-интеграция.

## Ранние спринты (сжато)

- **Спринт 1, шаги 1–6:** мультирегиональность (`lib/markets.ts`,
  RegionProvider+cookie `ch_region`), продуктовый граф (solutions/
  intent_keywords/price_estimates, миграция 0002), AI-ready поиск
  (`intent-router`, `/api/search`), страницы решений «Два пути»
  (`/solutions/[slug]` SSG, JSON-LD HowTo/FAQ/Breadcrumb), редизайн
  главной (RegionSelector, Navbar, trust bar), SEO-техника (`lib/site.ts`
  pageAlternates — Next не мерджит alternates между layout и page,
  каждая страница вызывает сама).
- **Этап 3 «Запуск»:** erid/маркировка РФ (`campaigns.erid`, миграция 0007,
  RU без erid → не eligible), ConsentBanner+ch_consent (YM/CF только после
  «Принять»), placement-воронка в аналитике, StoryPlayer через dynamic,
  skip-link, lighthouserc+CI job.
- **Спринт 2:** дизайн-токены sponsor/verified/prosChoice, StatusBadge,
  «Индекс доверия профи» (`lib/brand-score.ts`, BrandLeaderboard).
- **Блоки 2–3 (Ad Engine):** campaigns-плейсменты/таргетинг/лимиты
  (миграция 0004), `lib/ads/eligibility.ts` (pH-безопасность, релевантность,
  гео, erid), серверный рендер рекламы (CLS=0, `AdImpression` viewability
  IAB ≥50%/1с), `AdBadge` «РЕКЛАМА», шаблоны SponsoredProductCard/
  CategoryPartnerBanner/EditorialPartnerBlock, `getEligibleAdsForCategories`.
- **Визуальный язык C (стадии 1–4):** палитра-токены (BRAND_COLORS в
  lib/site.ts для OG/favicon/manifest), shape lock, CompanyTable —
  единственный список компаний, `components/home/*` реестровые компоненты.
- **Спринт «Прямо сейчас»:** демо-кампании → draft, RU/Москва открыта
  (10 реальных компаний, `ratingSource:"unverified"`), видеоразборы
  (`solutions.video_url`, миграция 0005), DIY→Pro мостик
  (`DiyEscalation`), тарифы /for-partners, AI без Vectorize.
- **Этап 3.5+4:** 16 протоколов (всего 25), video stories, View Transitions,
  RU/Москва, мобильные исправления.
- **Прод онлайн (2026-10-16):** workers.dev `clean-rate.happydayera` →
  позже chistolab.pro; D1 инициализирована миграциями 0000–0005+seed.
