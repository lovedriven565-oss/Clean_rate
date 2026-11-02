# ТЗ на единый арт ChistoLab (обложки протоколов и полок)

Цель: сделать карточки «на картинке», как в референсах G2A (154/155) и Steam (151/152): арт несёт карточку, текст лежит под ним, а не поверх.

## 1. Стиль (общий для всех 22 изображений)

**Soft 3D key art.** Один главный предмет в мягком 3D-рендере (глиняная/полуматовая фактура, скруглённые формы), на цветном градиенте. Как плитки Windows 11 и Office в референсе 155.

- Один предмет по центру, без людей, рук и лиц.
- Свет сверху-слева, мягкая контактная тень, лёгкое зерно на фоне.
- Никакого текста, логотипов, названий брендов, водяных знаков.
- Предмет занимает центральные ~55% кадра, вокруг пустое поле: из квадрата нарезаются форматы 3:4, 4:3 и 16:9.
- Пятно/дефект показан, но не натуралистично и не отталкивающе (стилизованная клякса, а не «грязь с фото»).
- Это иллюстрации, не результаты испытаний. Картинки «после чистки» не делаем.

### Цвет фона по типу проблемы (система, как цвета платформ в 154)

| Тип | Градиент фона | Применение |
|---|---|---|
| Пятна (stain) | `#FF9AA8` → `#D6405A` | коралл |
| Запахи (odor) | `#B3A8FF` → `#6A58E8` | фиолетовый |
| Налёт и плесень (scale) | `#8FE3F5` → `#1FA6CF` | аквамарин |
| После ремонта (postrenovation) | `#FFD27A` → `#EE9A1F` | янтарь |
| Уборка помещений (general) | `#C6F36B` → `#5FAE0E` | лайм (цвет бренда) |

## 2. Шаблон промпта

```
Soft 3D product key art illustration, {ПРЕДМЕТ}, single hero object centered,
semi-matte clay render with rounded forms, soft studio light from top-left,
gentle contact shadow, smooth {ЦВЕТ ФОНА} gradient background with subtle grain,
generous empty margin, subject within central 55% of frame, square 1:1, 2048px,
no text, no letters, no logos, no brand names, no people, no hands, no watermark
```

Negative prompt: `text, letters, watermark, logo, hands, faces, people, photo-realistic mess, harsh shadows, clutter`

## 3. Порядок работы

1. Сгенерируйте **один эталон**: `vino-na-divane`. Покажите мне, утвердим стиль.
2. Остальные 21 делайте с тем же стилем: Midjourney `--sref {эталон}`, Flux/другое: image reference на эталон, тот же seed/стиль-ключ.
3. Не меняйте угол камеры и тип света между картинками.

## 4. Обложки протоколов: 16 штук (квадрат 1:1)

Файл называется `{slug}.jpg` (или `.webp`), складывать в `public/covers/`.

| # | slug | Тип / фон | Предмет в промпте |
|---|---|---|---|
| 1 | `vino-na-divane` | stain / коралл | corner of a chenille sofa seat cushion, a tipped red wine glass and a stylized wine stain |
| 2 | `kofe-na-tekstile` | stain / коралл | upholstered chair cushion with a tipped coffee cup and a brown stylized splash |
| 3 | `krov-na-matrase` | stain / коралл | white mattress corner with a small stylized red droplet stain, soft and non-graphic |
| 4 | `flomaster-ruchka-na-divane` | stain / коралл | fabric sofa cushion with a marker pen lying on it and a bold scribble line |
| 5 | `vosk-zhvachka-na-kovre` | stain / коралл | patch of carpet pile with a pink chewing gum blob and a small candle |
| 6 | `zhir-vytyazhka-kuhnya` | stain / коралл | stainless kitchen range hood with stylized grease drips on the surface |
| 7 | `mocha-i-zapah-matras` | odor / фиолет | mattress with wavy stylized odor lines rising above it |
| 8 | `zapah-zhivotnyh-kover` | odor / фиолет | rolled carpet with a paw print and wavy odor swirls |
| 9 | `zapah-syrosti-posle-potopa` | odor / фиолет | wall corner with water droplets, a small puddle and a hint of dark mold |
| 10 | `vodny-kamen-dushevaya` | scale / аквамарин | glass shower panel with white limescale streaks and a chrome tap |
| 11 | `chernaya-plesen-shvy-vannaya` | scale / аквамарин | white tile wall corner with dark moldy grout lines |
| 12 | `nalet-chernaya-santehnika` | scale / аквамарин | matte black faucet with a white limescale crust |
| 13 | `poslestroy-zatirka-plitka` | postrenovation / янтарь | porcelain floor tile piece with cement grout haze and a trowel |
| 14 | `poslestroy-okna-skotch` | postrenovation / янтарь | window pane with painter's tape strips and glue residue |
| 15 | `sledy-reziny-kleya-laminat` | postrenovation / янтарь | laminate floor planks with black scuff marks and a tape roll |
| 16 | `uborka-ofisa-posle-korporativa` | general / лайм | office desk with party cups, confetti and leftover plates |

## 5. Полки: 6 штук (16:9, предмет по центру, допускается композиция из 2-3 предметов темы)

Файл `{id}.jpg`, складывать в `public/shelves/`.

| id | Фон | Композиция |
|---|---|---|
| `stains` | коралл | tipped wine glass, coffee cup and a sofa cushion with stylized stains |
| `odors` | фиолет | mattress, carpet roll and wavy odor lines |
| `renovation` | янтарь | tile piece, trowel, tape roll and a window pane |
| `kitchen` | коралл | range hood and a stove burner with grease drips |
| `bathroom` | аквамарин | glass shower panel, chrome tap, tile corner |
| `office` | лайм | desk, party cups, confetti |

## 6. Иконки поверхностей: не нужны

Пиктограммы (диван, матрас, ковёр, пол, окна, кухня, ванная, офис) берутся из Lucide, он уже подключён в проекте. Я оформлю их крупными монохромными, как в 154. От вас ничего не требуется.

## 7. Чек-лист приёмки

- [ ] Все 22 файла в едином стиле, камера и свет совпадают.
- [ ] Ни на одной картинке нет текста, логотипов, людей.
- [ ] Предмет в центральных ~55% (читается и в 3:4, и в 16:9).
- [ ] Цвет фона соответствует типу проблемы из таблицы.
- [ ] Вес каждого файла ≤ 300 КБ после сжатия (jpg/webp, ~1600 px по стороне).
- [ ] Имена файлов совпадают со slug и id из таблиц.

Когда файлы будут в `public/covers/` и `public/shelves/`, я подключу их в `lib/solutions/covers.ts` и `lib/solutions/shelves.ts` и сделаю сетку под новый арт (часть D плана).
