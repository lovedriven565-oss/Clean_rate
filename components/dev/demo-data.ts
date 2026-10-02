export type DemoTask = {
  slug: string;
  title: string;
  note: string;
  img: string;
};

export type DemoProduct = {
  name: string;
  purpose: string;
  constraint: string;
  price: string;
  img: string;
};

export const demoTasks: DemoTask[] = [
  { slug: "windows", title: "Окна и зеркала", note: "Без разводов и ворса", img: "/dev/task-windows.jpg" },
  { slug: "furniture", title: "Мебель и ковры", note: "Пятна и запахи", img: "/dev/task-furniture.jpg" },
  { slug: "kitchen", title: "Кухня", note: "Жир и нагар", img: "/dev/task-kitchen.jpg" },
  { slug: "bathroom", title: "Санузел", note: "Налёт и плесень", img: "/dev/task-bathroom.jpg" },
];

export const demoProducts: DemoProduct[] = [
  {
    name: "Спрей для стекла «Демо Гласс»",
    purpose: "Стекло, зеркала, глянцевая плитка",
    constraint: "Не для матовых и тонирующих плёнок",
    price: "от 8,40 BYN",
    img: "/dev/product-a.jpg",
  },
  {
    name: "Пена для обивки «Демо Текстиль»",
    purpose: "Диваны, ковры, автосалон",
    constraint: "Проверить на скрытом участке ткани",
    price: "от 12,90 BYN",
    img: "/dev/product-b.jpg",
  },
];

export const demoCompany = {
  name: "Чистый город",
  city: "Минск",
  ratingSource: "Рейтинг по 214 отзывам и проверенным заказам",
  price: "уборка квартиры от 90 BYN",
  img: "/dev/service.jpg",
};

export const demoAd = {
  advertiser: "Демо Бренд",
  title: "Концентрат для пола «Демо Флор»",
  description: "Подходит для ламината и плитки. Оплаченное размещение — позиция в каталоге не зависит от оплаты.",
  cta: "На сайт бренда",
};

export const demoNav = ["Решения", "Рейтинг", "Бренды", "Компаниям"];

export const demoChips = ["вино на диване", "жир на кухне", "окна без разводов", "уборка офиса"];

export const demoHeroImg = "/dev/hero.jpg";
