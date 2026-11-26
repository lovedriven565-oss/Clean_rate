---
description: "Premium web design engineering standards (CSS 2026-27, motion, anti-slop layout) — apply for UI/UX, styling, animations, layout work"
trigger: model_decision
---

# Premium Futuristic Web Stack & Design Engineering Rules (2026–2027)

Эта памятка всегда активна для создания сверхкрутых, стильных, премиальных сайтов уровня **Linear, Raycast, Vercel, Apple, Stripe, Teenage Engineering, Epic Games Store**.

---

## 1. Аудит: что уже есть vs чего не хватает в текущем стеке

### Уже установлено в проекте (`ChistoLab`)
- **Ядро:** Next.js 16.3 (`App Router`), React 19, Tailwind CSS v4 (`@theme inline`), TypeScript 5.9.
- **Примитивы и утилиты:** `@base-ui/react` (headless a11y), `class-variance-authority`, `clsx`, `tailwind-merge`, `geist` (`Sans` + `Mono`), `lucide-react`.
- **Движение и шейдеры:** `motion` v13 (`motion/react`), `@paper-design/shaders-react` (`MeshGradient`), кастомные `SpotlightCard`, `Tilt`, `GlowLink`, `RevealText`, `PillTabs` в `components/ui/fx`.

### Чего НЕ ХВАТАЕТ (полный стек для сайтов будущего — подключать по задаче)

#### A. Интерактивный 3D, WebGL/WebGPU и пространственный веб (Spatial Web)
1. **`three` + `@react-three/fiber` + `@react-three/drei`** — индустриальный стандарт декларативного 3D в React (GLTF-модели, физический свет, стеклянные преломления `MeshTransmissionMaterial`, `Float`, `Environment`, 3D-типографика).
2. **`@react-three/postprocessing`** — киношный Bloom, Chromatic Aberration, Depth of Field, Vignette, Noise поверх 3D-сцен.
3. **`@rive-app/react-canvas` (Rive)** — стейт-машины интерактивной векторной графики (60–120fps, в 10× легче Lottie, реагирует на курсор, клики, скролл и данные в реальном времени).
4. **`@splinetool/react-spline`** — быстрые интерактивные 3D-сцены из Spline без ручного кода шейдеров.
5. **`cobe`** — сверхлёгкий (5 KB) WebGL-глобус от Vercel для гео-витрин и мультирегиональных карт.
6. **`curtainsjs` / `ogl`** — легковесный WebGL для искажения DOM-изображений и видео при скролле/наведении (liquid distortion, displacement).

#### B. Кинематографичный скролл и таймлайны (Scrollytelling)
1. **`gsap` + `@gsap/react` (`ScrollTrigger`, `SplitText`, `Flip`)** — когда пружин `motion/react` недостаточно: сложная пин-хореография экранов (Apple-style scroll-jacking секций без поломки нативного скролла), морфинг SVG, покадровый скраббинг.
2. **Нативный CSS Scroll-Driven Animations (`animation-timeline: view() / scroll()`)** — 0 KB JS, работает в потоке композитора браузера (120fps) для прогресс-баров, параллакса и плавного проявления карточек.
3. **Покадровый Canvas Image Sequence / WebCodecs Scrollytelling** — рендер 60–120 кадров WebP/AVIF в `<canvas>` по прогрессу скролла (эффект разбора устройства или микроскопии волокон как у Apple AirPods Pro).

#### C. Микро-интеракции, числа, звук и тактильность (Tactile & Sonic UI)
1. **`@number-flow/react` (NumberFlow)** — эталонная каскадная анимация цифр (цены, сметы, индексы, таймеры) с физикой барабана в стиле Linear/Stripe/Robinhood.
2. **`vaul`** — физические mobile-first шторки (Drawers) с инерцией и масштабированием заднего фона как в iOS.
3. **`cmdk`** — мгновенная палитра команд (`⌘K`) уровня Raycast/Linear.
4. **`sonner`** — многослойные стековые тосты с пружинной физикой и жестами смахивания.
5. **`embla-carousel-react`** — физические карусели с точным контролем инерции и snap-точек.
6. **Web Audio API UI-синтезатор (Zero-asset Sonic UI)** — процедурные микро-щелчки (2–8 мс синус/шум через `AudioContext`, 0 сетевых запросов) на переключение тумблеров, ползунков `BeforeAfter` и чек-листов (строго опционально, с mute-тумблером).

#### D. Copy-Paste реестры премиальных компонентов (не npm-зависимости, а исходники)
Использовать как эталонные доноры механик (адаптируя под токены проекта):
- **Atelier UI (`@atelier/*`)** — единый WebGL-канвас + DOM-выравнивание, fluid distortion, кривые медиа при скролле, переходы между страницами.
- **React Bits (`reactbits.dev`)** — 170+ шейдерных фонов (Silk, Iridescence, Aurora, Halftone), текстовых и курсорных эффектов (`npx shadcn@latest add https://reactbits.dev/r/...`).
- **Motion Primitives (`motion-primitives.com`)** — чистые микро-компоненты на `motion/react` (Morphing Dialog, Cursor, Text Effect, Magnetic, Progressive Blur).
- **21st.dev / Cult UI / Magic UI / Aceternity UI** — bento-сетки, border-beams, marquee, интерактивные карточки.

---

## 2. Платформенные стандарты CSS & Web API 2026–2027 (использовать по умолчанию)

1. **View Transitions API (Next.js `<ViewTransition>` / `document.startViewTransition`):**
   - Бесшовный морфинг обложек и заголовков при переходе из карточки каталога на детальную страницу (`view-transition-name`).
   - Всегда оборачивать в `@media (prefers-reduced-motion: no-preference)`.
2. **Перцептивное цветовое пространство `oklch()` и `color-mix()`:**
   - При генерации оттенков и свечений использовать `color-mix(in oklch, ...)` — даёт чистые переходы без грязно-серых провалов в середине градиента, поддерживает Wide Gamut (`Display-P3`).
3. **CSS Anchor Positioning (`anchor-name`, `position-anchor`, `@position-try`):**
   - Позиционирование тултипов, плавающих бейджей и поповеров нативно без тяжеловесных JS-расчётов координат.
4. **CSS `@starting-style` + `transition-behavior: allow-discrete`:**
   - Плавное появление/скрытие `<dialog>`, `[popover]` и раскрывающихся блоков без JS-обёрток `AnimatePresence`, когда не нужна сложная пружина.
5. **CSS Container Queries (`@container`) и `subgrid`:**
   - Карточки в Bento-сетках и полках выравнивают внутренние шапки, цены и нижние кнопки через `grid-template-rows: subgrid`, чтобы кнопки в ряду всегда стояли на одной оптической линии.
6. **Progressive Blur (многослойное размытие с маской):**
   - Вместо жёстких границ у липких шапок и нижних доков использовать градиентную маску `mask-image: linear-gradient(...)` поверх `backdrop-filter: blur(20px) saturate(160%)`.

---

## 3. Архитектурные законы премиального дизайна («Anti-Slop & High-Craft»)

### Закон 1: Режиссура света и поверхностей (Lighting & Specular Physics)
- **Единый источник света сверху (Top-lit):** верхняя грань любой карточки светлее боковых и нижней (`inset 0 1px 0 hsl(var(--highlight) / 0.08)` или `.linear-beam`).
- **Тонированные тени:** никогда не использовать чёрный `rgba(0,0,0,0.1)` на цветных или тёплых/холодных фонах — тень всегда окрашена в тон базы (`--shadow-tint`).
- **Материальность:** сочетать матовую микро-текстуру (`.fx-grain` 3–5% opacity), приборные 1px рамки, спекулярные блики за курсором (`SpotlightCard`) и глубокий контраст секций.

### Закон 2: Типографика как интерфейс (Kinetic & Instrument Typography)
- **Контраст масштабов:** заголовки первого экрана — плотные (`tracking-[-0.035em]`, `leading-[1.04]`, `text-balance`), подзаголовки — спокойные (`max-w-[60ch]`, `text-pretty`).
- **Приборный моноширинный слой (`font-data` / `tabular-nums`):** любые цены, проценты, pH, координаты, таймеры, индексы и хоткеи `<kbd>` набираются строго моноширинным шрифтом с `slashed-zero`. Числа никогда не «прыгают» по ширине при обновлении.

### Закон 3: Композиция и ритм (Anti-Template Layout)
- **Запрет на монотонные 3 колонки одинаковых карточек на весь сайт:** чередовать ритм:
  1. Асимметричный Hero с живым интерактивным прибором/капсулой (60/40 или 7/5 колонок).
  2. Узкая приборная полоса живого пульса/тикера (`TaskTicker`).
  3. Сетка постеров (`aspect-[3/4]`) или асимметричный Bento (`col-span-7` + `col-span-5`).
  4. Двухколоночный интерактивный стенд (`Master-Detail` со sticky-плеером / симулятором).
  5. Тёмный чертёжный блок (`Blueprint / Spec Sheet`) с изометрической векторной графикой и координатной сеткой.
- **Second-Read Moments (второй слой чтения):** у каждой крупной карточки должен быть микро-сценарий при наведении/фокусе (раскрытие стоп-ошибки, сдвиг лазерной шторки, подсветка грани, живой пересчёт выгоды).

### Закон 4: Физика движения и 120fps Performance Budget
- **Zero React Re-renders на `pointermove` / `scroll`:** координаты мыши и скролла живут только в `MotionValue`, CSS-переменных (`--mx`, `--my`) или `requestAnimationFrame`. Никаких `useState` на движение курсора.
- **Пружины вместо линейных кривых:** для UI-переходов использовать физику пружин (`stiffness: 280–420, damping: 24–34`), для шейдеров и фонов — плавное затухание.
- **Бюджет WebGL/Canvas:** не более 1 активного тяжёлого шейдера/WebGL-канваса в видимой области (`IntersectionObserver` / авто-пауза вне экрана); на мобильных, при `prefers-reduced-motion` или `Save-Data` — мгновенный SSR-фолбэк на CSS-градиенты и SVG без потери эстетики.
- **Нативный скролл прежде всего:** никогда не ломать инерцию трекпада/колеса мыши глобальным перехватом скролла без крайней необходимости.
