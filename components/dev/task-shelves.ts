import type { Solution } from "@/lib/types";

/**
 * Тематические полки прототипа A (/dev/design/a-vitrina, этап 1.4).
 *
 * Полки собираются только из published-решений: счётчик каждой обложки
 * вычисляется предикатом над реальными данными, href ведёт на настоящий
 * фильтр /solutions (параметры type/surface читает SolutionsExplorer).
 * Полка без совпадений исключается — фиктивных обложек и «популярности» нет.
 */

export interface TaskShelfCover {
  id: string;
  title: string;
  note: string;
  href: string;
  img: string;
  imgAlt: string;
  featured: boolean;
  count: number;
  slugs: string[];
}

interface ShelfDef {
  id: string;
  title: string;
  note: string;
  href: string;
  img: string;
  imgAlt: string;
  featured?: boolean;
  match: (s: Solution) => boolean;
}

const SHELF_DEFS: ShelfDef[] = [
  {
    id: "stains",
    title: "Пятна",
    note: "Вино, кофе, кровь, жир",
    href: "/solutions?type=stain",
    img: "/dev/a-tasks/stains.jpg",
    imgAlt: "Опрокинутый бокал с разлитым тёмным напитком",
    featured: true,
    match: (s) => s.problemType === "stain",
  },
  {
    id: "odors",
    title: "Запахи",
    note: "Моча, сырость, затхлость",
    href: "/solutions?type=odor",
    img: "/dev/a-tasks/odors.jpg",
    imgAlt: "Собака лежит на тёмном ковре в гостиной",
    match: (s) => s.problemType === "odor",
  },
  {
    id: "renovation",
    title: "После ремонта",
    note: "Затирка, клей, строительная пыль",
    href: "/solutions?type=postrenovation",
    img: "/dev/a-tasks/renovation.jpg",
    imgAlt: "Пустая комната во время ремонта: лестница и упаковки покрытий",
    match: (s) => s.problemType === "postrenovation",
  },
  {
    id: "kitchen",
    title: "Кухня",
    note: "Жир и нагар",
    href: "/solutions?surface=kitchen",
    img: "/dev/a-tasks/kitchen.jpg",
    imgAlt: "Загрязнённая газовая плита с нагаром на конфорках",
    match: (s) => s.surface === "kitchen",
  },
  {
    id: "bathroom",
    title: "Ванная и стекло",
    note: "Налёт и водный камень",
    href: "/solutions?surface=bathroom",
    img: "/dev/a-tasks/bathroom.jpg",
    imgAlt: "Душевая кабина со стеклянными дверцами",
    match: (s) => s.surface === "bathroom",
  },
  {
    id: "office",
    title: "Офис и бизнес",
    note: "Регламентная и срочная уборка",
    href: "/solutions?type=general",
    img: "/dev/a-tasks/office.jpg",
    imgAlt: "Пустой современный офис с рабочими местами",
    match: (s) => s.problemType === "general",
  },
];

/**
 * Обложки полок для переданных решений. Берутся только опубликованные
 * решения, полки без единого совпадения не рендерятся.
 */
export function buildTaskShelves(solutions: Solution[]): TaskShelfCover[] {
  const published = solutions.filter((s) => s.status === "published");
  return SHELF_DEFS.flatMap((def) => {
    const matched = published.filter(def.match);
    if (matched.length === 0) return [];
    return [
      {
        id: def.id,
        title: def.title,
        note: def.note,
        href: def.href,
        img: def.img,
        imgAlt: def.imgAlt,
        featured: def.featured === true,
        count: matched.length,
        slugs: matched.map((s) => s.slug),
      },
    ];
  });
}
