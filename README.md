# ChistoLab (`chistolab.pro`)

Лаборатория решений чистоты и честный рейтинг клининговых компаний для рынков СНГ (Беларусь, Россия, Казахстан).

## Ключевые модули платформы
- **Продуктовый граф «Два пути» (`/solutions`, `/solutions/[slug]`)** — проверенные пошаговые протоколы выведения пятен, запахов, налёта и последствий ремонта + честная граница эскалации к профессионалам с расчётом сметы по региону.
- **Умный поиск и ИИ-технолог (`/assistant`, `/api/search`, `/api/assistant`)** — классификация интента (`b2c` / `b2b` / `pro`), интерактивный триаж по материалу и давности пятна, ответы строго по фактам проверенных протоколов со сметой и мастерами города.
- **Честный рейтинг компаний (`/rating`, `/companies/[slug]`, `/[city]/[category]`)** — органический балл по открытым источникам отзывов, прямые телефоны и Telegram без комиссии; спонсорская полка (`PRO Спонсор`) вынесена отдельно над рейтингом и не влияет на место #1.
- **Индекс доверия профи и Ad Engine (`/brands`, `/for-brands`)** — лидерборд брендов профессиональной химии и техники + нативные рекламные слоты с обязательным Safety Gate по pH и совместимости с поверхностями.
- **Zero-PII обработка B2B-заявок (`/for-partners`, `/for-brands`)** — транзитная доставка контактов в Telegram с хранением в Cloudflare D1 только обезличенного SHA-256 следа.

## Стек
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (`app/globals.css`) + Motion
- Cloudflare Workers (`@opennextjs/cloudflare`) + Cloudflare D1 (Drizzle ORM) + Workers AI + Rate Limiting + Turnstile

## Команды
```bash
npm install
npm run dev          # локальный сервер разработки
npm run typecheck    # проверка типов TypeScript
npm run lint         # проверка ESLint
npm run test         # автотесты (node:test + tsx)
npm run build        # production-сборка Next.js
npm run preview      # локальное превью Cloudflare Worker (.open-next)
```

