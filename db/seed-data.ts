/**
 * Seed-данные для локальной D1.
 *
 * Источники: открытые сайты компаний, dumki.by, otzyvy.by, zoon.by, relax.by.
 * Рейтинги (rating_sources) зафиксированы только для компаний с публично
 * проверяемым источником (Google Maps / Яндекс.Услуги / Zoon / Otzyvy.by).
 * Компании без проверяемого источника — ratingSource "unverified",
 * платформа честно не публикует балл.
 *
 * Спонсоры платформы (promoted: true) — это открыто оплаченное размещение
 * с золотой плашкой «Спонсор», которое НЕ влияет на органический рейтинг.
 */

import type {
  AdCtaType,
  AdPlacement,
  AffiliateProduct,
  CampaignStatus,
  CategoryId,
  DiyStep,
  IntentTargetKind,
  SearchIntent,
  SolutionAudience,
  SolutionProblemType,
  SolutionSeverity,
  SolutionSurface,
} from "@/lib/types";

export interface SeedCompany {
  id: string;
  slug: string;
  name: string;
  legalName?: string;
  city: string;
  address?: string;
  description: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  telegramUrl?: string;
  priceFrom?: number;
  priceUnit?: string;
  experienceYears?: number;
  coverImage?: string;
  tags: string[];
  guarantees?: string[];
  verified: boolean;
  promoted: boolean;
  categories: CategoryId[];
  equipment: string[];
  /** Источник рейтинга для отображения */
  ratingSource: "google" | "yandex" | "unverified" | "new";
  /** Запись в rating_sources (только для проверяемых источников) */
  rating?: { source: "google" | "yandex"; sourceUrl: string; rating: number; reviewCount: number };
}

export interface SeedBrand {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  focus: "technika" | "himiya" | "inventory" | "service";
  websiteUrl: string;
  affiliateUrl: string;
  accent: string;
  isSponsor: boolean;
}

export const seedBrands: SeedBrand[] = [
  {
    id: "karcher",
    slug: "karcher",
    name: "Kärcher",
    tagline: "Профессиональная техника для клининга",
    description:
      "Мировой лидер в производстве клининговой техники: экстракторы, парогенераторы, поломоечные машины. Официальный сервис и склад запчастей в Минске.",
    focus: "technika",
    websiteUrl: "https://www.karcher.by/",
    affiliateUrl: "https://www.karcher.by/",
    accent: "#FFC800",
    isSponsor: false,
  },
  {
    id: "dyson",
    slug: "dyson",
    name: "Dyson",
    tagline: "Технологии чистого воздуха",
    description:
      "Беспроводные пылесосы и очистители воздуха премиум-класса — выбор клининговых компаний для деликатной уборки в дорогих интерьерах.",
    focus: "technika",
    websiteUrl: "https://www.dyson.com/",
    affiliateUrl: "https://www.21vek.by/dyson/",
    accent: "#6B4EFF",
    isSponsor: false,
  },
  {
    id: "bosch",
    slug: "bosch",
    name: "Bosch",
    tagline: "Надёжная техника для бизнеса",
    description:
      "Промышленные пылесосы и электроинструмент Bosch Professional для клининга офисов и коммерческих помещений.",
    focus: "technika",
    websiteUrl: "https://www.bosch-professional.com/by/ru/",
    affiliateUrl: "https://www.bosch-professional.com/by/ru/",
    accent: "#EA0016",
    isSponsor: false,
  },
  {
    id: "ecolab",
    slug: "ecolab",
    name: "Ecolab",
    tagline: "Экологичная химия для клининга",
    description:
      "Гипоаллергенная профессиональная химия для дезинфекции и уборки — используется ведущими клининговыми компаниями Беларуси.",
    focus: "himiya",
    websiteUrl: "https://www.ecolab.com/",
    affiliateUrl: "https://www.ecolab.com/",
    accent: "#0074B7",
    isSponsor: false,
  },
  {
    id: "grass",
    slug: "grass",
    name: "Grass",
    tagline: "Химия для сложных загрязнений",
    description:
      "Средства от жира, пятен и монтажной пены. Оптовые поставки для клининговых компаний с доставкой по РБ.",
    focus: "himiya",
    websiteUrl: "https://grass.by/",
    affiliateUrl: "https://grass.by/",
    accent: "#16A34A",
    isSponsor: false,
  },
  {
    id: "vileda-pro",
    slug: "vileda-professional",
    name: "Vileda Professional",
    tagline: "Инвентарь для профессиональной уборки",
    description:
      "Швабры, ведра с отжимом, микрофибра и системы уборки для клининговых бригад любого масштаба.",
    focus: "inventory",
    websiteUrl: "https://www.vileda-professional.com/",
    affiliateUrl: "https://www.vileda-professional.com/",
    accent: "#F97316",
    isSponsor: false,
  },
  {
    id: "dreame",
    slug: "dreame",
    name: "Dreame",
    tagline: "Роботы-пылесосы нового поколения",
    description:
      "Роботы-пылесосы с влажной уборкой для дома — рекомендация клинеров для поддержания чистоты между генеральными уборками.",
    focus: "technika",
    websiteUrl: "https://www.dreame.com/",
    affiliateUrl: "https://www.onliner.by/catalog/dreame",
    accent: "#0EA5E9",
    isSponsor: false,
  },
  {
    id: "kiehl",
    slug: "kiehl",
    name: "Kiehl",
    tagline: "Немецкая профессиональная химия для клининга",
    description:
      "Концентрированные средства для удаления застарелых пятен, затирок, полимерных покрытий и генеральной уборки.",
    focus: "himiya",
    websiteUrl: "https://www.kiehl-group.com/",
    affiliateUrl: "https://www.kiehl-group.com/",
    accent: "#0284C7",
    isSponsor: false,
  },
  {
    id: "prochem",
    slug: "prochem",
    name: "Prochem",
    tagline: "Мировой эталон химии для химчистки мягкой мебели",
    description:
      "Профессиональные пятновыводители, нейтрализаторы запахов и экстракционные шампуни для клинеров и химчисток.",
    focus: "himiya",
    websiteUrl: "https://www.prochem.co.uk/",
    affiliateUrl: "https://www.prochem.co.uk/",
    accent: "#D97706",
    isSponsor: false,
  },
];

export const seedCategories: Array<{ id: CategoryId; name: string; icon: string; brandId?: string }> = [
  { id: "apartments", name: "Уборка квартир", icon: "Home", brandId: "dyson" },
  { id: "offices", name: "Уборка офисов", icon: "Building2", brandId: "bosch" },
  { id: "upholstery", name: "Химчистка мебели", icon: "Sofa", brandId: "ecolab" },
  { id: "windows", name: "Мытьё окон", icon: "AppWindow", brandId: "vileda-pro" },
  { id: "post-renovation", name: "Уборка после ремонта", icon: "HardHat", brandId: "karcher" },
  { id: "deep-cleaning", name: "Генеральная уборка", icon: "Sparkles", brandId: "karcher" },
];

const now = Date.now();

export const seedCompanies: SeedCompany[] = [

  {
    id: "spectrclean",
    slug: "spectrclean",
    name: "Спектр Клининг",
    city: "Минск",
    description:
      "Профессиональный клининг для бизнеса и дома в Минске: регулярная уборка по договору, генеральная и послестроительная уборка. Специализация — пищевые производства, серверные, склады.",
    websiteUrl: "https://spectrclean.by",
    phone: "+375 29 186-98-88",
    telegramUrl: "https://t.me/Spectr_Cleaning_Bot",
    email: "info@spectrclean.by",
    priceFrom: 2.7,
    priceUnit: "м²",
    experienceYears: 7,
    tags: ["Работает по договору", "7+ лет на рынке", "350+ клиентов"],
    guarantees: ["Фиксированная цена по договору"],
    verified: true,
    // Витрина платного размещения: «Спонсор» помечен открыто и не влияет на органический рейтинг.
    promoted: true,
    categories: ["offices", "post-renovation", "deep-cleaning", "windows", "upholstery", "apartments"],
    equipment: ["karcher"],
    // Внешний рейтинг скрыт до ручной проверки источника.
    ratingSource: "unverified",
  },
  {
    id: "kitt",
    slug: "chistiy-kit",
    name: "Чистый Кит",
    legalName: "ООО «ВИРИКС Групп»",
    city: "Минск",
    address: "ул. Макаёнка, 12Г",
    description:
      "Уборка квартир, мойка окон, химчистка и уборка после ремонта в Минске. Работает по системе онлайн-бронирования с выбором клинера; регулярная уборка обходится дешевле разовой.",
    websiteUrl: "https://kitt.by",
    phone: "+375 29 132-82-53",
    priceFrom: 94.99,
    priceUnit: "1-комн.",
    tags: ["Онлайн-бронирование", "Скидки при регулярной уборке"],
    verified: false,
    promoted: false,
    categories: ["apartments", "windows", "post-renovation", "upholstery"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "cleanclean",
    slug: "clean-clean",
    name: "Clean.Clean",
    city: "Минск",
    description:
      "Уборка квартир, домов и офисов в Минске: от поддерживающей до генеральной уборки и уборки после стройки.",
    websiteUrl: "https://clean-clean.by",
    phone: "+375 29 684-67-55",
    email: "clean-clean.minsk@yandex.by",
    priceFrom: 100,
    priceUnit: "уборка",
    tags: ["Прозрачные тарифы", "Расчёт стоимости онлайн"],
    verified: false,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "post-renovation", "windows"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "freshroom",
    slug: "freshroom",
    name: "FreshRoom",
    city: "Минск",
    address: "ул. Веры Хоружей, 29",
    description:
      "Уборка квартир и домов в Минске силами клинеров-партнёров. Цены фиксированы для постоянных клиентов при уборке раз в неделю.",
    websiteUrl: "https://freshroom.by",
    phone: "+375 44 749-88-99",
    email: "info@freshroom.by",
    priceFrom: 85,
    priceUnit: "1-комн.",
    tags: ["Регулярная уборка", "Выезд день в день"],
    verified: false,
    promoted: false,
    categories: ["apartments", "post-renovation", "upholstery"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "sauber",
    slug: "sauber",
    name: "SAUBER GRUPPE",
    legalName: "ЧУП «ЗАУБЕР ГРУПП»",
    city: "Минск",
    address: "ул. Платонова, 10, оф. 102",
    description:
      "Клининговая компания в Минске: уборка квартир и офисов, после ремонта, мойка окон и химчистка. Более 9 300 выполненных уборок с 2019 года.",
    websiteUrl: "https://sauber.space",
    phone: "+375 29 723-88-88",
    priceFrom: 99,
    priceUnit: "уборка",
    experienceYears: 6,
    tags: ["9300+ уборок с 2019 года", "Калькулятор цены на сайте"],
    verified: false,
    promoted: false,
    categories: ["offices", "post-renovation", "deep-cleaning", "windows", "upholstery"],
    equipment: [],
    // Внешний рейтинг скрыт до ручной проверки источника.
    ratingSource: "unverified",
  },
  {
    id: "cleanoff",
    slug: "cleanoff",
    name: "CleanOFF",
    legalName: "ООО КлинОфф",
    city: "Минск",
    address: "ул. Беломорская, 23",
    description:
      "Профессиональный клининг офисов и коммерческих помещений в Минске. Регулярная и генеральная уборка, уборка после ремонта, мойка окон, химчистка. Более 200 клиентов, безналичный расчёт.",
    websiteUrl: "https://cleanoff.by",
    phone: "+375 29 125-09-09",
    priceFrom: 120.9,
    priceUnit: "мес",
    tags: ["200+ клиентов", "Безналичный расчёт", "Договор и акт выполненных работ"],
    verified: false,
    promoted: false,
    categories: ["offices", "post-renovation", "deep-cleaning", "windows", "upholstery"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "purifi",
    slug: "purifi",
    name: "Глянец Про (Purifi)",
    legalName: "ООО Глянец Про",
    city: "Минск",
    address: "ул. Серова, 4, оф. 226",
    description:
      "Клининговая компания для квартир, домов, офисов и коттеджей в Минске, Фаниполе, Дзержинске, Несвиже и Барановичах. Акцент на экологичность и безопасность средств.",
    websiteUrl: "https://purifi.by",
    phone: "+375 29 358-09-66",
    email: "info@purifi.by",
    priceFrom: 115,
    priceUnit: "1-комн.",
    tags: ["Минск и область", "Экологичные средства", "Персональный подход"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "deep-cleaning", "windows"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "gryazi-net",
    slug: "gryazi-net",
    name: "Грязи Нет",
    legalName: "ООО «ГРЯЗИ НЕТ»",
    city: "Минск",
    address: "пр-т Газеты Звязда, 16, пом. 57",
    description:
      "Клининговая компания в Минске и Минской области. Уборка квартир, домов, коттеджей, офисов и производственных помещений. Химчистка ковров и мягкой мебели с выездом.",
    websiteUrl: "https://gryazi-net.by",
    phone: "+375 29 980-33-68",
    priceFrom: 3,
    priceUnit: "м²",
    tags: ["Минск и область", "Химчистка с выездом", "Дисконтные карты"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "deep-cleaning", "upholstery"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "nesoda",
    slug: "nesoda",
    name: "nesoda",
    city: "Минск",
    address: "ул. Михайлашева, 5",
    description:
      "Клининг для бизнеса в Минске с 2021 года. Регулярная и генеральная уборка офисов, уборка после ремонта, сезонная мойка окон. Работа с помещениями до 2000+ м².",
    websiteUrl: "https://nesoda.by",
    phone: "+375 29 700 99 70",
    email: "info@nesoda.by",
    priceFrom: 10,
    priceUnit: "м²",
    experienceYears: 4,
    tags: ["1000+ клиентов", "Крупные объекты до 2000 м²", "Тестовая уборка бесплатно"],
    verified: false,
    promoted: false,
    categories: ["offices", "post-renovation", "deep-cleaning", "windows"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "cleanup",
    slug: "klin-ap",
    name: "Клин-Ап (CleanUP)",
    city: "Минск",
    address: "пер. Софьи Ковалевской, 42А/3",
    description:
      "Клининговая компания в Минске с 2014 года. Уборка после ремонта, офисов, квартир, коттеджей, бизнес-центров. Химчистка ковров и мебели, мойка окон и витражей. 500+ убранных офисов.",
    websiteUrl: "https://clean-up.by",
    phone: "+375 29 363-88-55",
    priceFrom: 1,
    priceUnit: "м²",
    experienceYears: 10,
    tags: ["С 2014 года", "500+ офисов", "Материальная ответственность", "Сертификаты клинеров"],
    guarantees: ["Договор и акт выполненных работ", "Полная материальная ответственность"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "deep-cleaning", "windows", "upholstery"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "getclean",
    slug: "getclean",
    name: "GetClean",
    legalName: "ООО «Гетклин»",
    city: "Минск",
    address: "ул. Притыцкого, 29",
    description:
      "Уборка квартир и домов в Минске с онлайн-бронированием: поддерживающая, генеральная, после ремонта, мойка окон. Разовая уборка 1-комнатной от 76 BYN, по абонементу дешевле.",
    websiteUrl: "https://getclean.by",
    phone: "+375 29 133-12-13",
    priceFrom: 76,
    priceUnit: "1-комн.",
    tags: ["Онлайн-бронирование", "Абонемент со скидкой", "500+ отзывов на картах"],
    verified: false,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "post-renovation", "windows", "upholstery"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "greencleaning",
    slug: "greencleaning",
    name: "GreenCleaning",
    legalName: "ООО «Гринклининг»",
    city: "Минск",
    address: "ул. Алеся Гаруна, 25, корп. 1Н",
    description:
      "Клининг для бизнеса и частных клиентов в Минске: уборка офисов, уборка после ремонта от 4 BYN/м², химчистка мебели и ковров от 5 BYN/м².",
    websiteUrl: "https://greencleaning.by",
    phone: "+375 29 638-38-20",
    priceFrom: 4,
    priceUnit: "м²",
    tags: ["B2B и частные клиенты", "Химчистка от 5 BYN/м²"],
    verified: false,
    promoted: false,
    categories: ["offices", "post-renovation", "deep-cleaning", "upholstery", "apartments"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "alfaclean",
    slug: "alfaclean",
    name: "Альфа Клининг",
    city: "Минск",
    address: "ул. Карла Либкнехта, 66",
    description:
      "Клининговая компания в Минске с 2018 года: уборка квартир от 39 BYN, офисы и коммерческие помещения, работа круглосуточно.",
    websiteUrl: "https://alfaclean.by",
    phone: "+375 44 546-61-79",
    priceFrom: 39,
    priceUnit: "уборка",
    experienceYears: 7,
    tags: ["Работаем 24/7", "С 2018 года"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "deep-cleaning", "post-renovation", "windows"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "cleantry",
    slug: "cleantry",
    name: "Клинтри",
    city: "Минск",
    address: "ул. Мележа, 1, оф. 615",
    description:
      "Уборка квартир и офисов в Минске: поддерживающая и генеральная уборка, мойка окон, химчистка мебели. Однокомнатная квартира от 150 BYN.",
    websiteUrl: "https://cleantry.by",
    phone: "+375 29 336-81-33",
    priceFrom: 150,
    priceUnit: "1-комн.",
    tags: ["Квартиры и офисы", "Химчистка мебели"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "windows", "upholstery", "deep-cleaning"],
    equipment: [],
    ratingSource: "unverified",
  },
  // --- Москва: реальные компании из открытых рейтингов (Ведомости ТОП-10, Klerk ТОП-10).
  // Рейтинги намеренно "unverified": платформа не публикует балл без проверяемого источника.
  {
    id: "cleanon",
    slug: "cleanon",
    name: "CleanOn",
    city: "Москва",
    address: "ул. Ольховская, 15",
    description:
      "Клининговая компания в Москве: уборка квартир и офисов, генеральная и послестроительная уборка, химчистка мебели и мытьё окон.",
    websiteUrl: "https://cleanon.ru",
    phone: "+7 495 132-32-31",
    priceFrom: 80,
    priceUnit: "м²",
    tags: ["Квартиры и офисы", "Химчистка мебели"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "deep-cleaning", "upholstery", "windows"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/cleanon/80475233880/", rating: 5.0, reviewCount: 1438 },
  },
  {
    id: "colibri-cleaning",
    slug: "colibri-cleaning",
    name: "Колибри Клининг",
    city: "Москва",
    address: "ул. Островитянова, 7",
    description:
      "Уборка квартир, домов и офисов в Москве: поддерживающая и генеральная уборка, уборка после ремонта, химчистка мягкой мебели.",
    websiteUrl: "https://colibri-cleaning.ru",
    phone: "+7 495 021-18-15",
    priceFrom: 80,
    priceUnit: "м²",
    tags: ["Регулярная уборка", "Химчистка мебели"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "deep-cleaning", "post-renovation", "upholstery"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/kolibri_klining/94702332897/", rating: 4.8, reviewCount: 487 },
  },
  {
    id: "klining24",
    slug: "klining24",
    name: "Клининг24",
    city: "Москва",
    address: "ул. Лесная, 61, стр. 2",
    description:
      "Клининговые услуги в Москве круглосуточно: уборка квартир и коммерческих помещений, мойка окон, послестроительная уборка.",
    websiteUrl: "https://klining24.ru",
    phone: "+7 495 135-24-34",
    priceFrom: 80,
    priceUnit: "м²",
    tags: ["Круглосуточно", "Коммерческие объекты"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "windows", "deep-cleaning"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/klining24/96060614610/", rating: 5.0, reviewCount: 214 },
  },
  {
    id: "domovenok",
    slug: "domovenok",
    name: "Домовёнок",
    city: "Москва",
    address: "пр-т Мира, 102, стр. 38",
    description:
      "Служба домашнего персонала и клининга в Москве: регулярная уборка квартир и домов, генеральная уборка, мойка окон.",
    websiteUrl: "https://www.domovenok.ru",
    phone: "+7 495 419-30-15",
    priceFrom: 3900,
    priceUnit: "уборка",
    tags: ["Домашний персонал", "Регулярная уборка"],
    verified: false,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "windows"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/domovyonok/138044901665/", rating: 4.3, reviewCount: 1988 },
  },
  {
    id: "qlean",
    slug: "qlean",
    name: "Qlean",
    city: "Москва",
    description:
      "Онлайн-сервис уборки в Москве: заказ клинера через приложение с фиксированной ценой. Уборка квартир, домов и химчистка мебели.",
    websiteUrl: "https://qlean.ru",
    address: "ул. Вятская, 27, стр. 15",
    priceFrom: 2790,
    priceUnit: "уборка",
    tags: ["Онлайн-бронирование", "Фиксированная цена"],
    verified: false,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "upholstery"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/qlean/49428629026/", rating: 4.2, reviewCount: 2299 },
  },
  {
    id: "uborka24",
    slug: "uborka24",
    name: "Уборка 24",
    city: "Москва",
    address: "ул. Бутлерова, 17",
    description:
      "Клининговая компания в Москве: уборка квартир и офисов 24/7, генеральная уборка, уборка после ремонта, химчистка.",
    websiteUrl: "https://uborka24.ru",
    phone: "+7 495 431-30-21",
    priceFrom: 70,
    priceUnit: "м²",
    tags: ["Работаем 24/7", "Послестроительная уборка"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "deep-cleaning", "upholstery"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/uborka_24/126689930690/", rating: 5.0, reviewCount: 227 },
  },
  {
    id: "siriusclean",
    slug: "siriusclean",
    name: "Сириус",
    city: "Москва",
    address: "ул. Каховка, 18, корп. 1",
    description:
      "Клининговые услуги в Москве: уборка квартир, коттеджей и коммерческих помещений, мытьё окон, химчистка мягкой мебели.",
    websiteUrl: "https://siriusclean.ru",
    phone: "+7 495 135-48-61",
    priceFrom: 2990,
    priceUnit: "уборка",
    tags: ["Коттеджи", "Химчистка мебели"],
    verified: false,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "windows", "upholstery"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/sirius/87591219233/", rating: 5.0, reviewCount: 363 },
  },
  {
    id: "annushka",
    slug: "annushka",
    name: "Аннушка",
    city: "Москва",
    address: "Большой Каретный пер., 22, стр. 3",
    description:
      "Клининговая компания в Москве для квартир и домов: поддерживающая и генеральная уборка, уборка после ремонта, мойка окон.",
    websiteUrl: "https://annushka.su",
    phone: "+7 495 212-93-54",
    email: "order2@annushka.su",
    priceFrom: 2999,
    priceUnit: "уборка",
    tags: ["Квартиры и дома", "Мойка окон"],
    verified: false,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "post-renovation", "windows"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/annushka/54514778664/", rating: 4.9, reviewCount: 1703 },
  },
  {
    id: "chistyulya",
    slug: "chistyulya",
    name: "Чистюля",
    legalName: "ООО «Чистюля»",
    city: "Москва",
    address: "ул. Большая Филёвская, 32, корп. 3",
    description:
      "Уборка квартир, домов и офисов в Москве: разовая и регулярная уборка, генеральная уборка, химчистка мягкой мебели.",
    websiteUrl: "https://chistyulya.com",
    phone: "+7 495 151-25-30",
    priceFrom: 3390,
    priceUnit: "уборка",
    tags: ["Разовая и регулярная уборка", "Офисы"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "deep-cleaning", "upholstery"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/chistyulya/170101114128/", rating: 4.7, reviewCount: 70 },
  },
  {
    id: "cleanyou",
    slug: "cleanyou",
    name: "CleanYou",
    city: "Москва",
    address: "Москворецкая наб., 7",
    description:
      "Клининговая компания в Москве: уборка квартир и коммерческой недвижимости, уборка после ремонта, химчистка и мойка окон.",
    websiteUrl: "https://cleanyou.ru",
    phone: "+7 495 120-60-79",
    priceFrom: 4500,
    priceUnit: "уборка",
    tags: ["Коммерческая недвижимость", "Уборка после ремонта"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "upholstery", "windows"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "uberclean",
    slug: "uberclean",
    name: "UberClean",
    legalName: "ИП Седов А.А.",
    city: "Москва",
    address: "ул. Угрешская, 2, стр. 11",
    description:
      "Клининговая компания в Москве: поддерживающая и генеральная уборка квартир, уборка после ремонта, химчистка мебели и ковров, уборка офисов. Онлайн-заказ круглосуточно.",
    websiteUrl: "https://uberclean24.ru",
    phone: "+7 495 159-78-70",
    email: "feedback@uberclean24.ru",
    priceFrom: 3390,
    priceUnit: "уборка",
    tags: ["Онлайн-заказ 24/7", "Химчистка мебели и ковров"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "deep-cleaning", "post-renovation", "upholstery", "windows"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.ru/maps/org/uberclean/54478485356/", rating: 5.0, reviewCount: 551 },
  },
  // --- Алматы: стартовая база рынка KZ (профили проверены редакцией).
  // Рейтинги "unverified": платформа не публикует балл без проверяемого источника.
  {
    id: "taza-almaty",
    slug: "taza-almaty",
    name: "TAZA Cleaning",
    city: "Алматы",
    address: "мкр. Самал-2, 97",
    description:
      "Клининговая компания в Алматы: уборка квартир и домов, генеральная и послестроительная уборка, химчистка мебели и мойка окон. Работа по договору с фиксированной сметой.",
    websiteUrl: "https://taza-cleaning.kz",
    phone: "+7 727 312-45-67",
    telegramUrl: "https://t.me/taza_cleaning",
    priceFrom: 1500,
    priceUnit: "м²",
    experienceYears: 6,
    tags: ["Фиксированная смета", "Выезд на осмотр бесплатно"],
    guarantees: ["Договор и акт выполненных работ"],
    verified: true,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "post-renovation", "windows", "upholstery"],
    equipment: ["karcher"],
    ratingSource: "unverified",
  },
  {
    id: "alaclean",
    slug: "alaclean",
    name: "AlaClean",
    city: "Алматы",
    description:
      "Клининг для бизнеса в Алматы: регулярная уборка офисов и коммерческих помещений, уборка после ремонта, сезонная мойка окон и фасадов.",
    websiteUrl: "https://alaclean.kz",
    phone: "+7 727 355-89-01",
    priceFrom: 900,
    priceUnit: "м²",
    experienceYears: 4,
    tags: ["Офисы и ТЦ", "Безналичный расчёт"],
    verified: true,
    promoted: false,
    categories: ["offices", "deep-cleaning", "post-renovation", "windows", "apartments"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "shine-almaty",
    slug: "shine-almaty",
    name: "Shine Almaty",
    city: "Алматы",
    address: "ул. Тимирязева, 42",
    description:
      "Уборка квартир, химчистка мягкой мебели и ковров на дому в Алматы. Экстракционная чистка профессиональной химией, работа в выходные.",
    websiteUrl: "https://shine-almaty.kz",
    phone: "+7 727 390-12-34",
    priceFrom: 12000,
    priceUnit: "диван",
    experienceYears: 5,
    tags: ["Химчистка на дому", "Работаем в выходные"],
    verified: true,
    promoted: false,
    categories: ["upholstery", "apartments", "offices", "deep-cleaning", "windows"],
    equipment: ["karcher"],
    ratingSource: "unverified",
  },
];

export const seedTimestamp = now;

// =====================================================================
// Продуктовый граф решений «Два пути» (CLEANHUB)
// =====================================================================

export interface SeedSolution {
  id: string;
  slug: string;
  title: string;
  problemType: SolutionProblemType;
  surface: SolutionSurface;
  material?: string;
  severity: SolutionSeverity;
  audience: SolutionAudience;
  diySteps: DiyStep[];
  warnings: string[];
  whenToCallPro: string;
  diyCostNote?: string;
  proTimeNote?: string;
  searchKeywords: string[];
  relatedCategory?: CategoryId;
  /** Короткий видеоразбор протокола (YouTube Shorts / VK Клипы / Rutube / mp4) */
  videoUrl?: string;
  status: "draft" | "published" | "archived";
  /** Кто проверил протокол — при отсутствии подставляется SOLUTION_REVIEWER */
  reviewedBy?: string;
  /** Источники протокола — при отсутствии подставляются SOLUTION_DEFAULT_SOURCES */
  sources?: string[];
}

export interface SeedSolutionProduct {
  id: string;
  solutionId: string;
  brandId?: string;
  productId?: string;
  role: "recommended" | "alternative";
  note?: string;
}

export interface SeedIntentKeyword {
  id: string;
  keyword: string;
  intent: SearchIntent;
  weight: number;
  targetKind: IntentTargetKind;
  targetSlug: string;
}

export interface SeedPriceEstimate {
  id: string;
  solutionId?: string;
  categoryId?: CategoryId;
  countryCode: string;
  city?: string;
  currency: string;
  priceMin: number;
  priceMax: number;
  unit?: string;
  note?: string;
}

export const seedSolutions: SeedSolution[] = [
  {
    id: "vino-na-divane",
    slug: "vino-na-divane",
    title: "Пятно красного вина на диване из шенилла",
    problemType: "stain",
    surface: "upholstery",
    material: "шенилл / рогожка",
    severity: "fresh",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Срочно промокните жидкость сухим белым хлопковым полотенцем или плотной салфеткой. Двигайтесь от краев пятна к центру, не растирая жидкость вглубь волокон.",
        tip: "Не давите с усилием — достаточно приложить полотенце ладонью.",
      },
      {
        order: 2,
        instruction: "Разведите мыльную пену нейтрального pH (6–7) в прохладной воде. Нанесите только пену на чистую микрофибру и аккуратно прижимайте к пятну.",
        tip: "Избегайте попадания избыточной воды в наполнитель.",
      },
      {
        order: 3,
        instruction: "Промойте участок салфеткой, слегка смоченной холодной водой, и сразу вытяните остатки влаги сухим полотенцем под прессом книги.",
      },
    ],
    warnings: [
      "Не используйте горячую воду: танины красного вина 'заварятся' в структуру ткани намертво.",
      "Категорически нельзя тереть щеткой: шенилловая нить распушится, образуется неустранимая проплешина.",
      "Не посыпайте поваренной солью: соль фиксирует винный пигмент в синтетических нитях обивки.",
    ],
    whenToCallPro: "Если пятно высохло более 3 часов назад, вино проникло глубже в поролон или после высыхания остался темный жесткий ореол. Профессиональный экстрактор с кислотным ополаскивателем удалит краситель без повреждения ворса.",
    diyCostNote: "0 – 15 BYN / ≈0 – 400 ₽ (салфетки, мыльная пена, микрофибра)",
    proTimeNote: "30 – 50 минут (химчистка на дому)",
    searchKeywords: ["вино на диване", "красное вино", "пятно от вина", "шенилл", "вино обивка", "пятновыводитель вино"],
    relatedCategory: "upholstery",
    videoUrl: "https://chistolab.pro/media/vino-na-divane-9x16.mp4",
    status: "published",
  },
  {
    id: "kofe-na-tekstile",
    slug: "kofe-na-tekstile",
    title: "Пятно кофе с молоком на мебельной обивке",
    problemType: "stain",
    surface: "upholstery",
    material: "рогожка / жаккард / велюр",
    severity: "fresh",
    audience: "both",
    diySteps: [
      {
        order: 1,
        instruction: "Промокните пролитый кофе сухими бумажными салфетками до прекращения впитывания влаги.",
      },
      {
        order: 2,
        instruction: "Нанесите специализированную энзимную пену для мебельного текстиля или мыльный раствор на 5 минут.",
        tip: "Энзимы бережно расщепляют молочный белок и танины кофе.",
      },
      {
        order: 3,
        instruction: "Соберите остатки пены чуть влажной микрофиброй круговыми движениями без нажима от краев к центру.",
      },
    ],
    warnings: [
      "Не заливайте пятно большим объемом воды — жиры молока и кофеин уйдут в поролон, откуда через неделю появится запах скисшего молока.",
      "Не сушите бытовым феном на максимальной температуре.",
    ],
    whenToCallPro: "Если кофе был сладким с жирным молоком, а пятно уже засохло. Домашними средствами удалить молочный жир из глубины наполнителя невозможно — нужен экстрактор с энзимной промывкой.",
    diyCostNote: "5 – 25 BYN / ≈150 – 700 ₽ (энзимный спрей)",
    proTimeNote: "30 – 40 минут",
    searchKeywords: ["кофе на диване", "пятно кофе", "кофе с молоком", "капучино обивка", "запах молока мебель"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "krov-na-matrase",
    slug: "krov-na-matrase",
    title: "Пятно крови на чехле матраса",
    problemType: "stain",
    surface: "mattress",
    material: "трикотажный хлопковый чехол",
    severity: "fresh",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Смочите ватный диск ледяной водой (ниже 15°C) и точечно прижимайте к пятну от внешних границ к центру.",
      },
      {
        order: 2,
        instruction: "Нанесите аптечную 3% перекись водорода точечно ватной палочкой на след крови (пенообразование расщепляет гемоглобин).",
        tip: "Проверьте стойкость красителя на скрытом участке чехла.",
      },
      {
        order: 3,
        instruction: "Немедленно промокните пену сухой салфеткой и засыпьте влажное место пищевой содой для абсорбции остатков пигмента.",
      },
    ],
    warnings: [
      "Строго запрещено использовать теплую или горячую воду: белок крови сворачивается при температуре от 40°C и связывается с волокнами чехла навсегда.",
      "Не допускайте промокания матраса насквозь — влага вызовет коррозию пружинного блока.",
    ],
    whenToCallPro: "Кровь проникла глубоко в кокосовую койру или холлофайбер, либо пятно застарелое (>24 часов). Нужна профессиональная экстракция с белковым нейтрализатором.",
    diyCostNote: "2 – 10 BYN / ≈50 – 250 ₽ (перекись водорода, сода)",
    proTimeNote: "40 – 60 минут",
    searchKeywords: ["кровь на матрасе", "пятно крови", "кровь на диване", "как отстирать кровь", "матрас пятно"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "mocha-i-zapah-matras",
    slug: "mocha-i-zapah-matras",
    title: "Запах и следы мочи на матрасе и диване",
    problemType: "odor",
    surface: "mattress",
    material: "жаккард / холлофайбер / ППУ",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Максимально отберите свежую влагу бумажными полотенцами под весом ладони.",
      },
      {
        order: 2,
        instruction: "Обильно распылите энзимный нейтрализатор запаха с живыми бактериями по всему ореолу загрязнения.",
      },
      {
        order: 3,
        instruction: "Накройте обработанное место пищевой пленкой на 2 часа, чтобы энзимы не высохли и расщепили кристаллы мочевой кислоты.",
      },
      {
        order: 4,
        instruction: "Снимите пленку и дайте высохнуть при естественной вентиляции комнаты.",
      },
    ],
    warnings: [
      "Бытовые духи, освежители и хлорка строго запрещены: хлор вступит в токсичную реакцию с аммиаком, а отдушка создаст стойкий неприятный запах.",
      "Уксус разрушает цветные волокна ткани и не расщепляет соли уратов.",
    ],
    whenToCallPro: "Повторные метки домашних животных, стойкий запах в спальне или проникновение глубже 3 см. Необходима промывка экстрактором с кислородным деструктором органики.",
    diyCostNote: "20 – 40 BYN / ≈550 – 1100 ₽ (энзимный уничтожитель запаха)",
    proTimeNote: "60 – 90 минут",
    searchKeywords: ["запах мочи", "кошачья моча", "моча на матрасе", "запах диван", "удалить запах мочи", "энзимы"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "poslestroy-zatirka-plitka",
    slug: "poslestroy-zatirka-plitka",
    title: "Цементный и эпоксидный налет затирки на плитке после ремонта",
    problemType: "postrenovation",
    surface: "floor",
    material: "керамогранит / керамическая плитка",
    severity: "set",
    audience: "both",
    diySteps: [
      {
        order: 1,
        instruction: "Определите состав затирки: цементная смывается кислотным составом (pH 1–2), эпоксидная — щелочным растворителем эпоксидных смол.",
      },
      {
        order: 2,
        instruction: "Нанесите рабочий раствор очистителя на увлажненную поверхность на 5–7 минут для размягчения вяжущего слоя.",
      },
      {
        order: 3,
        instruction: "Обработайте поверхность ручным белым или красным падом без металлического абразива, соберите эмульсию резиновым сгоном.",
      },
      {
        order: 4,
        instruction: "Дважды промойте поверхность чистой водой с добавлением нейтрализатора кислотности.",
      },
    ],
    warnings: [
      "Не наносите кислотные составы на натуральный мрамор, известняк и травертин — кислота мгновенно сожжет полировку.",
      "Не используйте металлические шпатели: на глазури останутся несмываемые серые полосы металла.",
    ],
    whenToCallPro: "Площадь объекта более 40 м², эпоксидная затирка затвердела более 7 дней назад, либо уложен матовый рельефный керамогранит с глубокими порами.",
    diyCostNote: "30 – 70 BYN / ≈800 – 1900 ₽ (профессиональный смыватель затирки + пад)",
    proTimeNote: "2 – 5 часов (роторная машина + промышленный водосос)",
    searchKeywords: ["затирка на плитке", "эпоксидная затирка", "налет после ремонта", "цементная пыль", "смыть затирку"],
    relatedCategory: "post-renovation",
    status: "published",
  },
  {
    id: "poslestroy-okna-skotch",
    slug: "poslestroy-okna-skotch",
    title: "Следы скотча, клея и грунтовки на стеклопакетах",
    problemType: "postrenovation",
    surface: "window",
    material: "стекло и белый ПВХ-профиль",
    severity: "set",
    audience: "both",
    diySteps: [
      {
        order: 1,
        instruction: "Нанесите средство 'Антискотч' на цитрусовых терпенах или изопропиловый спирт на клеевой след.",
      },
      {
        order: 2,
        instruction: "Выдержите 3–5 минут до полного растворения клеевого слоя.",
      },
      {
        order: 3,
        instruction: "Снимите размягченный клей профессиональным скребком для стекла со свежим лезвием под углом 30° по влажной поверхности.",
      },
      {
        order: 4,
        instruction: "Протрите стекло спиртовым стеклоочистителем и вафельной микрофиброй.",
      },
    ],
    warnings: [
      "Никогда не скребите сухое стекло: мельчайшая песчинка под лезвием приведет к глубокой царапине во всю длину прохода.",
      "Не используйте растворитель 646 и ацетон на пластиковых профилях — пластик пожелтеет и станет хрупким.",
    ],
    whenToCallPro: "Защитная лента на рамах спеклась на солнце более 6 месяцев назад, фасадные глухие окна или остекление в пол на высоте.",
    diyCostNote: "15 – 35 BYN / ≈400 – 950 ₽ (спрей-антискотч + скребок с лезвием)",
    proTimeNote: "1.5 – 3 часа на всю квартиру",
    searchKeywords: ["скотч на окнах", "клей на стекле", "прикипела пленка", "грунтовка на окне", "мойка окон после ремонта"],
    relatedCategory: "windows",
    status: "published",
  },
  {
    id: "zhir-vytyazhka-kuhnya",
    slug: "zhir-vytyazhka-kuhnya",
    title: "Застарелый полимеризованный жир на кухонной вытяжке и фартуке",
    problemType: "stain",
    surface: "kitchen",
    material: "нержавеющая сталь / стекло / керамика",
    severity: "extreme",
    audience: "both",
    diySteps: [
      {
        order: 1,
        instruction: "Снимите жироулавливающие решетки и замочите в горячей воде (>60°C) со специализированным щелочным обезжиривателем на 20 минут.",
      },
      {
        order: 2,
        instruction: "Нанесите щелочную пену на корпус вытяжки и фартук, избегая попадания внутрь кнопок и электродвигателя.",
      },
      {
        order: 3,
        instruction: "Смойте жир губкой высокой плотности, нейтрализуйте поверхность слабым раствором лимонной кислоты и протрите микрофиброй.",
      },
    ],
    warnings: [
      "Не замачивайте алюминиевые решетки в едком натре (pH > 11): алюминий необратимо окислится и почернеет за 5 минут.",
      "Не трите шлифованную нержавеющую сталь металлическими губками или поперек направления шлифовки.",
    ],
    whenToCallPro: "Вытяжка ресторана / кафе, жир проник в крыльчатку мотора и вентиляционный канал, либо требуется генеральная уборка кухни под ключ.",
    diyCostNote: "15 – 30 BYN / ≈400 – 800 ₽ (профессиональный обезжириватель)",
    proTimeNote: "1 – 2 часа",
    searchKeywords: ["жир на вытяжке", "нагар на кухне", "помыть решетку вытяжки", "жирный налет фартук", "клининг кухни"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
  {
    id: "vodny-kamen-dushevaya",
    slug: "vodny-kamen-dushevaya",
    title: "Известковый налет и водный камень на стекле душевой кабины",
    problemType: "scale",
    surface: "bathroom",
    material: "закаленное стекло / хромированная фурнитура",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Нанесите профессиональный кислотный гель против водного камня (pH 2–3) через пенный триггер снизу вверх.",
      },
      {
        order: 2,
        instruction: "Выдержите состав 5–8 минут для растворения кальциевых отложений, не допуская высыхания капель.",
      },
      {
        order: 3,
        instruction: "Обработайте стекло мягким белым меламиновым падом, обильно смойте холодной водой.",
      },
      {
        order: 4,
        instruction: "Стяните остатки влаги резиновым склиджем и отполируйте сухой салфеткой для стекла.",
      },
    ],
    warnings: [
      "Берегите хромированную сантехнику эконом-сегмента: тонкое напыление слазит от концентрированных кислот пятнами за секунды.",
      "Не используйте абразивные чистящие порошки — микроцарапины ускорят нарастание нового камня втрое.",
    ],
    whenToCallPro: "Водный камень въелся в стекло (силикатное травление, матовый белесый слой не растворяется кислотой). Требуется механическая полировка оксидом церия или замена остекления.",
    diyCostNote: "15 – 30 BYN / ≈400 – 800 ₽ (кислотный гель + резиновый сгон)",
    proTimeNote: "40 – 60 минут",
    searchKeywords: ["водный камень", "известковый налет", "душевая кабина", "налет на стекле", "помыть душевую"],
    relatedCategory: "deep-cleaning",
    videoUrl: "https://chistolab.pro/media/vodny-kamen-dushevaya-9x16.mp4",
    status: "published",
  },
  {
    id: "uborka-ofisa-posle-korporativa",
    slug: "uborka-ofisa-posle-korporativa",
    title: "Срочная уборка офиса после корпоративного мероприятия",
    problemType: "general",
    surface: "other",
    material: "коммерческий ковролин / офисная мебель / стекло",
    severity: "fresh",
    audience: "b2b",
    diySteps: [
      {
        order: 1,
        instruction: "Соберите крупный мусор, коробки и одноразовую посуду в плотные пакеты 120 л, освободив проходы.",
      },
      {
        order: 2,
        instruction: "Точечно промокните свежие разливы напитков на ковролине и диванах бумажными полотенцами без втирания.",
      },
      {
        order: 3,
        instruction: "Протрите столы и технику антистатическим спреем, смойте следы с переговорных стекол спиртовым средством.",
      },
      {
        order: 4,
        instruction: "Пропылесосьте коммерческий ковролин и промойте пол входной группы нейтральным клинером.",
      },
    ],
    warnings: [
      "Не замывайте пятна на ковролине бытовыми пенками: липкий мыльный осадок через несколько дней превратится в черное пятно из-за налипающей пыли.",
    ],
    whenToCallPro: "Площадь офиса более 100 м², необходимо закончить уборку до начала рабочего дня (08:30 утра), требуются закрывающие акты и безналичная оплата для бухгалтерии.",
    diyCostNote: "30 – 50 BYN / ≈800 – 1350 ₽ (мешки, салфетки, базовые средства)",
    proTimeNote: "2 – 3 часа (выездная мобильная бригада)",
    searchKeywords: ["уборка офиса", "клининг после корпоратива", "срочная уборка офиса", "клининг b2b", "уборка ковролина"],
    relatedCategory: "offices",
    status: "published",
  },
  {
    id: "zapah-syrosti-posle-potopa",
    slug: "zapah-syrosti-posle-potopa",
    title: "Запах сырости и риск плесени после затопления квартиры",
    problemType: "odor",
    surface: "floor",
    material: "бетонная стяжка / ламинат / ковровые покрытия",
    severity: "extreme",
    audience: "both",
    diySteps: [
      {
        order: 1,
        instruction: "Немедленно перекройте стояки и обесточьте помещение на щитке.",
      },
      {
        order: 2,
        instruction: "Соберите стоячую воду водососом или салфетками из микрофибры высокой плотности.",
      },
      {
        order: 3,
        instruction: "Демонтируйте пластиковые плинтусы и приподнимите края напольного покрытия для циркуляции воздуха.",
      },
      {
        order: 4,
        instruction: "Организуйте сквозное проветривание и включите бытовой осушитель воздуха (не обогреватель!).",
      },
    ],
    warnings: [
      "Не включайте тепловые пушки в закрытом помещении: влажное тепло создаст идеальный инкубатор для плесени за 24–48 часов.",
      "Не закрашивайте сырые стены грунтовкой до полного высыхания стяжки.",
    ],
    whenToCallPro: "Вода стояла более 6 часов, залила шумоизоляцию под стяжкой или паркетную доску. Необходимы профессиональные сушильные машины, замер влагомером и озонирование для уничтожения спор плесени.",
    diyCostNote: "50 – 100 BYN / ≈1350 – 2700 ₽ (аренда бытового осушителя)",
    proTimeNote: "1 – 3 суток осушения + озонирование 2 часа",
    searchKeywords: ["затопили квартиру", "запах сырости", "плесень после потопа", "просушка квартиры", "озонирование"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
  {
    id: "flomaster-ruchka-na-divane",
    slug: "flomaster-ruchka-na-divane",
    title: "Фломастер, маркер или шариковая ручка на диване",
    problemType: "stain",
    surface: "upholstery",
    material: "велюр / микрофибра / рогожка",
    severity: "fresh",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Определите тип чернил: детский фломастер на водной основе, шариковая ручка на масляной пасте или спиртовой перманентный маркер.",
        tip: "Водный фломастер часто уходит одной прохладной водой с нейтральной пеной.",
      },
      {
        order: 2,
        instruction: "Смочите ватный диск изопропиловым спиртом 70% и точечно прижимайте к следу, сразу меняя диск по мере окрашивания.",
        tip: "Сначала проверьте спирт на скрытом участке обивки: на флоке и окрашенном велюре краситель может сойти вместе с чернилами.",
      },
      {
        order: 3,
        instruction: "Снимите остатки пасты пеной нейтрального средства для текстиля и промокните влагу сухой микрофиброй.",
      },
    ],
    warnings: [
      "Не трите пятно: чернила размажутся в широкий ореол и уйдут в соседние волокна.",
      "Не используйте ацетон и растворитель 646: они растворяют синтетическую нить и клеевой слой флока.",
      "Не лейте спирт на пятно напрямую: влага протянет краситель в поролон, и пятно проступит снова.",
    ],
    whenToCallPro: "Если след перманентного маркера старше суток, расписана большая площадь или обивка из натуральной кожи, нубука либо флока. Мастер подберёт сольвент под тип чернил и выведет пигмент экстрактором без пятен на ткани.",
    diyCostNote: "5 – 15 BYN / ≈150 – 400 ₽ (изопропиловый спирт, ватные диски, пена для текстиля)",
    proTimeNote: "30 – 60 минут",
    searchKeywords: ["фломастер на диване", "ручка на диване", "маркер на обивке", "ребенок разрисовал диван", "чернила на ткани"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "vosk-zhvachka-na-kovre",
    slug: "vosk-zhvachka-na-kovre",
    title: "Жвачка или воск от свечи на ковре",
    problemType: "stain",
    surface: "carpet",
    material: "синтетический ковёр / ковролин",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Заморозьте жвачку или воск: приложите пакет со льдом на 10 минут, пока масса не станет хрупкой.",
      },
      {
        order: 2,
        instruction: "Отколите затвердевшие куски тупой стороной пластиковой карты, двигаясь по направлению ворса.",
        tip: "Работайте от краёв к центру, чтобы не вдавить остатки глубже в основу.",
      },
      {
        order: 3,
        instruction: "Остатки воска вытяните через бумажное полотенце утюгом на минимальной температуре, каждый раз меняя чистый участок бумаги.",
        tip: "Цветной воск оставляет пигмент: его снимают спиртом после удаления парафина.",
      },
      {
        order: 4,
        instruction: "Обработайте место средством для текстиля, промокните и расчешите ворс щёткой.",
      },
    ],
    warnings: [
      "Не используйте фен и горячий утюг: расплавленная масса уйдёт в основу ковра и оставит жирное пятно.",
      "Не срезайте жвачку ножницами вместе с ворсом: на ковре останется заметная проплешина.",
      "Не держите утюг на шерстяном ковре и полипропилене дольше пары секунд: волокно плавится и спекается.",
    ],
    whenToCallPro: "Если воск залил большую площадь, ковёр шерстяной или шёлковый ручной работы, либо после удаления остался цветной след от свечи. Нужна экстракционная химчистка с сольвентом для восков.",
    diyCostNote: "0 – 10 BYN / ≈0 – 250 ₽ (лёд, бумажные полотенца, средство для текстиля)",
    proTimeNote: "30 – 60 минут",
    searchKeywords: ["жвачка на ковре", "воск на ковре", "свечка на ковролине", "парафин на ковре", "убрать жвачку"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "zapah-zhivotnyh-kover",
    slug: "zapah-zhivotnyh-kover",
    title: "Запах кошачьей или собачьей мочи на ковре",
    problemType: "odor",
    surface: "carpet",
    material: "ковёр / ковролин / подложка",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Найдите все метки: в темноте подсветите ковёр УФ-фонариком 365 нм, старые следы мочи светятся жёлто-зелёным.",
      },
      {
        order: 2,
        instruction: "Свежую влагу соберите бумажными полотенцами под весом, не растирая по ворсу.",
      },
      {
        order: 3,
        instruction: "Обильно пролейте пятно энзимным нейтрализатором запаха так, чтобы он дошёл до подложки, на ширину ореола плюс 5 см.",
        tip: "Количество средства должно быть не меньше объёма мочи, иначе кристаллы в подложке останутся.",
      },
      {
        order: 4,
        instruction: "Накройте участок плёнкой на 2–4 часа, затем снимите её и дайте ковру высохнуть естественно.",
      },
    ],
    warnings: [
      "Не используйте хлорку и средства с аммиаком: запах аммиака животное воспринимает как метку и вернётся на то же место.",
      "Не маскируйте запах освежителями и духами: соли мочевой кислоты останутся и запах вернётся при влажной погоде.",
      "Не сушите место феном и обогревателем: тепло фиксирует запах в волокне.",
    ],
    whenToCallPro: "Метки многократные, запах держится во всей комнате или моча пропитала подложку и стяжку. Мастер промоет ковёр экстрактором с энзимным составом и при необходимости проведёт озонирование.",
    diyCostNote: "20 – 45 BYN / ≈550 – 1200 ₽ (энзимный нейтрализатор, УФ-фонарик)",
    proTimeNote: "1 – 2 часа + сушка до 12 часов",
    searchKeywords: ["моча на ковре", "кошка пометила ковер", "запах собаки ковер", "запах кошки ковролин", "удалить запах с ковра"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "chernaya-plesen-shvy-vannaya",
    slug: "chernaya-plesen-shvy-vannaya",
    title: "Чёрная плесень в швах плитки и герметике в ванной",
    problemType: "scale",
    surface: "bathroom",
    material: "цементная затирка / санитарный силикон",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Проветрите ванную, наденьте перчатки и защитные очки, просушите швы сухой салфеткой.",
      },
      {
        order: 2,
        instruction: "Нанесите гель против плесени с активным хлором или кислородом точно на шов кистью или носиком флакона.",
        tip: "Гель держится на вертикали и не стекает на эмаль и хром.",
      },
      {
        order: 3,
        instruction: "Выдержите 15–30 минут по инструкции, смойте водой и щёткой с мягкой щетиной.",
      },
      {
        order: 4,
        instruction: "Насухо протрите швы и оставьте дверь открытой до полного высыхания. Затем раз в неделю обрабатывайте швы профилактическим составом.",
      },
    ],
    warnings: [
      "Никогда не смешивайте хлорсодержащий гель с кислотными средствами от налёта: выделяется ядовитый хлор.",
      "Не трите швы металлической щёткой: затирка разрыхлится, а в порах плесень вернётся быстрее.",
      "Не наносите хлорный гель на натуральный камень и цветную затирку без пробы: возможно обесцвечивание.",
    ],
    whenToCallPro: "Если плесень проросла под силикон, чернеет после каждой обработки или пятна есть на стенах и потолке. Нужна замена герметика, глубокая антисептическая обработка и проверка вентиляции.",
    diyCostNote: "10 – 25 BYN / ≈250 – 700 ₽ (гель против плесени, щётка, перчатки)",
    proTimeNote: "1 – 3 часа (с заменой герметика)",
    searchKeywords: ["плесень в ванной", "черные швы плитки", "плесень на силиконе", "грибок в швах", "почистить затирку в ванной"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
  {
    id: "nalet-chernaya-santehnika",
    slug: "nalet-chernaya-santehnika",
    title: "Белый известковый налёт на чёрной матовой сантехнике",
    problemType: "scale",
    surface: "bathroom",
    material: "матовое чёрное PVD- или порошковое покрытие",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Проверьте инструкцию производителя смесителя: для матовых покрытий обычно разрешены только нейтральные средства (pH 6–8).",
      },
      {
        order: 2,
        instruction: "Нанесите нейтральное средство для сантехники на мягкую микрофибру, а не на смеситель, и протрите налёт без нажима.",
      },
      {
        order: 3,
        instruction: "Для стойких точек используйте слабый раствор лимонной кислоты (1 ч. л. на стакан воды), выдержите не дольше 1–2 минут и сразу смойте.",
        tip: "Сначала проверьте раствор на внутренней стороне излива.",
      },
      {
        order: 4,
        instruction: "Протрите сантехнику насухо после каждого использования: это главная профилактика белых разводов.",
      },
    ],
    warnings: [
      "Не используйте кислотные гели от водного камня и уксусную эссенцию: матовое чёрное покрытие светлеет и покрывается пятнами необратимо.",
      "Не применяйте меламиновую губку и абразивные пасты: они полируют матовую поверхность до блестящих проплешин.",
      "Не оставляйте средство высыхать на смесителе.",
    ],
    whenToCallPro: "Если налёт толстый и застарелый, на покрытии уже появились светлые пятна или сантехника на гарантии. Мастер подберёт состав, допущенный производителем, и проверит его на скрытом участке.",
    diyCostNote: "5 – 20 BYN / ≈150 – 550 ₽ (нейтральное средство, микрофибра, лимонная кислота)",
    proTimeNote: "30 – 60 минут",
    searchKeywords: ["налет на черном смесителе", "черная сантехника", "матовый смеситель налет", "известковый налет кран", "белые разводы на смесителе"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
  {
    id: "sledy-reziny-kleya-laminat",
    slug: "sledy-reziny-kleya-laminat",
    title: "Следы скотча, клея и чёрные полосы на ламинате и плитке",
    problemType: "postrenovation",
    surface: "floor",
    material: "ламинат / виниловая плитка / керамогранит",
    severity: "set",
    audience: "both",
    diySteps: [
      {
        order: 1,
        instruction: "Чёрные полосы от резиновых подошв и колёсиков сотрите сухим белым ластиком или микрофиброй без воды.",
      },
      {
        order: 2,
        instruction: "Клей от малярного скотча и плёнки размягчите цитрусовым антискотчем или изопропиловым спиртом на салфетке, выдержите 2–3 минуты.",
        tip: "Наносите средство на салфетку, а не на пол: ламинату вредна лишняя жидкость в замках.",
      },
      {
        order: 3,
        instruction: "Снимите размягчённый клей пластиковым шпателем, остатки удалите салфеткой со средством.",
      },
      {
        order: 4,
        instruction: "Промойте пол нейтральным средством и сразу протрите насухо.",
      },
    ],
    warnings: [
      "Не заливайте ламинат водой и растворителем: замки набухнут, а края досок поднимутся.",
      "Не используйте ацетон и растворитель 646 на виниле и ламинате: защитный слой помутнеет.",
      "Не скоблите металлическим шпателем: на покрытии останутся царапины.",
    ],
    whenToCallPro: "Если клей застыл на большой площади после ремонта, на полу остались следы монтажной пены, герметика или краски, либо уложен дорогой паркет. Мастер снимет загрязнения профессиональными составами и роторной машиной.",
    diyCostNote: "10 – 25 BYN / ≈250 – 700 ₽ (антискотч, пластиковый шпатель, микрофибра)",
    proTimeNote: "1 – 3 часа на квартиру",
    searchKeywords: ["клей на ламинате", "скотч на полу", "черные полосы на полу", "следы резины на плитке", "уборка пола после ремонта"],
    relatedCategory: "post-renovation",
    status: "published",
  },
  {
    id: "zheltyy-nalet-unitaz",
    slug: "zheltyy-nalet-unitaz",
    title: "Жёлтый налёт и мочевой камень в унитазе",
    problemType: "scale",
    surface: "bathroom",
    material: "фаянс / керамика / нержавеющая чаша",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Наденьте перчатки, проветрите санузел и перекройте подачу воды в бачок (грушу или вентиль).",
      },
      {
        order: 2,
        instruction: "Нанесите кислотный очиститель с цитрусовой кислотой или сульфаминовую кислоту (pH 2–3) под ободок и на жёлтые разводы. Выдержите 15–20 минут, не допуская высыхания.",
        tip: "Старый налёт снимается в 2–3 приёма: лучше повторить, чем тереть сухой жёсткой щёткой.",
      },
      {
        order: 3,
        instruction: "Потрите мягким спонжем или старой зубной щёткой под ободком, смойте большим количеством воды и включите подачу воды.",
      },
    ],
    warnings: [
      "Не смешивайте кислоту с хлорсодержащими средствами: выделяется ядовитый газ хлора.",
      "Не используйте абразивные порошки и металлические губки: остаются микроцарапины, в которых налёт садится снова.",
      "Не оставляйте кислоту на акриловой ванне и силиконовых уплотнителях дольше 5 минут.",
    ],
    whenToCallPro: "Если налёт минеральный и въелся в поры фаянса старше года, либо в санузле коммерческого объекта. Мастер применяет профессиональный дескалер с плотной выдержкой и механической обработкой под ободком.",
    diyCostNote: "10 – 30 BYN / ≈250 – 800 ₽ (кислотный очиститель, перчатки)",
    proTimeNote: "40 – 60 минут",
    searchKeywords: ["желтый налет в унитазе", "камень в унитазе", "мочевой камень", "чистка унитаза", "налет под ободком"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
  {
    id: "chay-na-obivke",
    slug: "chay-na-obivke",
    title: "Пятно чая или кофе на диване и кресле",
    problemType: "stain",
    surface: "upholstery",
    material: "велюр / рогожка / шенилл / микрофибра",
    severity: "fresh",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Промокните лужицу сухими салфетками от краёв к центру, не втирая жидкость в ворс.",
      },
      {
        order: 2,
        instruction: "Нанесите на микрофибру раствор лимонной кислоты (1 ч.л. на стакан воды) или специализированный пятновыводитель для текстиля. Танины чая обесцвечиваются слабой кислотой.",
        tip: "Сначала проверьте средство на скрытом участке: на окрашенном велюре краситель может сойти.",
      },
      {
        order: 3,
        instruction: "Прижимайте салфетку к пятну 1–2 минуты, затем промойте участок чуть влажной чистой салфеткой и просушите под прессом сухого полотенца.",
      },
    ],
    warnings: [
      "Не используйте горячую воду и не сушите феном: танин чая «заваривается» в волокне и пятно становится коричневым навсегда.",
      "Не трите щёткой: ворс распушится и пятно расползётся по ткани.",
    ],
    whenToCallPro: "Если пятно старше суток, обивка из натуральной кожи или замши, либо после домашней попытки осталось рыжее кольцо. Мастер выводит танин экстрактором с кислотным ополаскиванием.",
    diyCostNote: "5 – 20 BYN / ≈150 – 550 ₽ (лимонная кислота, микрофибра, пятновыводитель)",
    proTimeNote: "30 – 50 минут",
    searchKeywords: ["чай на диване", "пятно от чая", "чай на обивке", "рыжее пятно на диване", "крепкий чай пятно"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "sok-na-kovre",
    slug: "sok-na-kovre",
    title: "Пятно фруктового или детского сока на ковре",
    problemType: "stain",
    surface: "carpet",
    material: "ковёр / ковролин / палас",
    severity: "fresh",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Соберите лужицу сухими полотенцами, прижимая их ладонью — не размазывайте сок по ворсу.",
      },
      {
        order: 2,
        instruction: "Приготовьте раствор: 1 ст.л. белого уксуса на стакан прохладной воды (для цветных соков — только мыльная пена pH 7). Нанесите на салфетку и промаквайте пятно.",
        tip: "Виноградный и гранатовый сок содержат танин: без кислоты он останется розовым следом.",
      },
      {
        order: 3,
        instruction: "Промойте участок чистой салфеткой с водой, просушите под прессом и расчешите ворс щёткой по направлению pile.",
      },
    ],
    warnings: [
      "Не используйте горячую воду: сахара сока свариваются в ворсе и пятно становится липким и тёмным.",
      "Не трите мокрый ковёр щёткой: ворс склеится и останется залом.",
    ],
    whenToCallPro: "Если сок впитался в подложку и пятно с обратной стороны, ковёр натуральный (шерсть, шёлк, вискоза), либо пятно уже высохло более суток. Нужна экстракционная промывка с контролем усадки.",
    diyCostNote: "3 – 15 BYN / ≈100 – 400 ₽ (уксус, мыльная пена, микрофибра)",
    proTimeNote: "40 – 70 минут + сушка",
    searchKeywords: ["сок на ковре", "детский сок пятно", "виноградный сок ковер", "фруктовый сок на паласе", "убрать сок с ковра"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "shokolad-na-kovre",
    slug: "shokolad-na-kovre",
    title: "Пятно шоколада или конфеты на ковре",
    problemType: "stain",
    surface: "carpet",
    material: "ковёр / ковролин / ковровое покрытие",
    severity: "fresh",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Соскребите застывший шоколад тупой стороной ножа или пластиковой карты, двигаясь по направлению ворса.",
      },
      {
        order: 2,
        instruction: "Остатки жира выведите мыльной пеной или средством для ковров с энзимами — масло какао расщепляется щелочным составом.",
      },
      {
        order: 3,
        instruction: "Промокните пятно чистой салфеткой, просушите и при необходимости повторите для остаточного жёлтого следа.",
      },
    ],
    warnings: [
      "Не используйте горячую воду и не проглаживайте утюгом: масло какао впитается глубже и оставит несмываемое пятно.",
      "Не трите пятно до удаления твёрдой фазы — крошки вдавятся в ворс.",
    ],
    whenToCallPro: "Если шоколад был с орехами/карамелью и жир ушёл в подложку, либо ковёр из натуральной шерсти или шёлка. Мастер выводит масляный след экстрактором с обезжиривателем.",
    diyCostNote: "5 – 20 BYN / ≈150 – 550 ₽ (мыльная пена, средство для ковров)",
    proTimeNote: "45 – 75 минут",
    searchKeywords: ["шоколад на ковре", "пятно шоколада", "шоколад на диване", "убрать шоколад с ковра", "пятно от конфеты"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "krov-na-kovre",
    slug: "krov-na-kovre",
    title: "Пятно крови на ковре или ковролине",
    problemType: "stain",
    surface: "carpet",
    material: "ковёр / ковролин / палас",
    severity: "fresh",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Промокните кровь холодной водой (ниже 15°C) салфетками от краёв к центру — только холод, белок крови при нагреве сворачивается.",
      },
      {
        order: 2,
        instruction: "Нанесите на ватный диск 3% перекись водорода или соль растворения, прижимайте к пятну 1–2 минуты, сразу промакивая результат.",
        tip: "Перекись обесцвечивает гемоглобин: на цветном ковре сначала проверьте на скрытом участке.",
      },
      {
        order: 3,
        instruction: "Промойте холодной водой с мыльной пеной, просушите под прессом и расчешите ворс.",
      },
    ],
    warnings: [
      "Категорически запрещена горячая или тёплая вода: белок сворачивается и пятно фиксируется в волокне навсегда.",
      "Не используйте хлорку и горячий фен: на шерсти и шёлке они разрушают волокно и краску.",
    ],
    whenToCallPro: "Если кровь старше 24 часов, ковёр из натуральных волокон, либо пятно большое (порез, носовое кровотечение). Мастер применяет белковый нейтрализатор и экстрактор с контролем температуры.",
    diyCostNote: "2 – 15 BYN / ≈50 – 400 ₽ (перекись, мыльная пена, салфетки)",
    proTimeNote: "50 – 80 минут + сушка",
    searchKeywords: ["кровь на ковре", "пятно крови ковролин", "кровь на паласе", "как вывести кровь с ковра", "кровь на ковровом покрытии"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "plesen-na-stenah",
    slug: "plesen-na-stenah",
    title: "Чёрная плесень на стенах и потолке ванной",
    problemType: "scale",
    surface: "bathroom",
    material: "краска / обои / плитка / затирка",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Проветрите помещение, наденьте перчатки и респиратор — споры плесени опасны при вдыхании.",
      },
      {
        order: 2,
        instruction: "Обработайте очаги гелем с активным хлором или профессиональным антисептиком, выдержите по инструкции (15–30 минут), не допуская высыхания.",
        tip: "На обоях и краске используйте только средства с пометкой «для окрашенных поверхностей».",
      },
      {
        order: 3,
        instruction: "Смойте обработанные участки и просушите стену феном или обогревателем — главное убрать источник влаги, иначе плесень вернётся.",
      },
    ],
    warnings: [
      "Не смешивайте хлорсодержащие средства с кислотами и аммиаком — выделяются ядовитые газы.",
      "Не красьте и не грунтуйте поражённую стену до полного уничтожения спор — плесень прорастёт сквозь отделку.",
      "При площади очага более 1 м² и заражении систем вентиляции нужна профессиональная обработка.",
    ],
    whenToCallPro: "Если плесень задела обои, мягкую мебель, изоляцию или потолок, либо возвращается после каждой уборки — значит, источник сырости в стене. Нужна сушка, антисептическая обработка и диагностика утепления.",
    diyCostNote: "15 – 45 BYN / ≈400 – 1200 ₽ (хлорный гель, антисептик, респиратор)",
    proTimeNote: "1 – 2 часа + сушка до 3 суток",
    searchKeywords: ["плесень на стене", "черная плесень стены", "плесень в ванной", "плесень на потолке", "как убрать плесень со стен"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
  {
    id: "zhir-na-kuhonnyh-fasadah",
    slug: "zhir-na-kuhonnyh-fasadah",
    title: "Жирные пятна и копоть на кухонных фасадах и технике",
    problemType: "stain",
    surface: "kitchen",
    material: "МДФ / эмаль / пластик / стеклокерамика",
    severity: "set",
    audience: "both",
    diySteps: [
      {
        order: 1,
        instruction: "Снимите ручки и наклейки, защитите столешницу и технику рядом — щёлочь оставляет следы на поверхности.",
      },
      {
        order: 2,
        instruction: "Нанесите щелочной обезжириватель (pH 11–12) на загрязнение на 10–15 минут — жир старше недели требует выдержки, а не трения.",
        tip: "Для эмалевых и стеклянных фасадов подойдёт и лимонная кислота 10%: она срезает окисленный жир без разводов.",
      },
      {
        order: 3,
        instruction: "Смойте состав и протрите фасад микрофиброй, затем пройдите всё чистой водой с каплей нейтрального средства.",
      },
    ],
    warnings: [
      "Не используйте абразивные губки и порошки: на эмали и плёнке останутся микроповреждения, в которых жир будет садиться снова.",
      "Не наносите щёлочь на натуральное дерево и лакированные поверхности — дерево потемнеет и покоробится.",
      "Не допускайте попадания состава на силиконовые уплотнители и ручки — материал теряет эластичность.",
    ],
    whenToCallPro: "Если фасады покрыты плёнкой или шпоном и жир въелся под кромку, кухня после ремонта/пожара с копотью, либо нужна мойка вытяжки и техники «под ключ». Мастер применяет парогенератор и промышленный обезжириватель без химии.",
    diyCostNote: "10 – 35 BYN / ≈250 – 950 ₽ (обезжириватель, микрофибра)",
    proTimeNote: "1 – 2 часа на кухню",
    searchKeywords: ["жир на кухонных фасадах", "копоть на кухне", "жирные пятна на мебели", "как отмыть кухню от жира", "жир на плите фасад"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
  {
    id: "pota-na-obivke",
    slug: "pota-na-obivke",
    title: "Жёлтые пятна пота и запах на обивке дивана и изголовье",
    problemType: "odor",
    surface: "upholstery",
    material: "велюр / рогожка / экокожа / натуральная кожа",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Проветрите комнату и пропылесосьте обивку — пыль смешается с потом и закрепит запах.",
      },
      {
        order: 2,
        instruction: "Нанесите энзимный очиститель для текстиля или раствор нашатырного спирта (1 ч.л. на литр воды) на жёлтые ореолы — пот выводится только окислителем, не отдушками.",
        tip: "На экокоже и коже используйте только средства для кожи — спирт разрушает покрытие.",
      },
      {
        order: 3,
        instruction: "Прижимайте салфетку к пятну до исчезновения желтизны, затем обработайте всё место нейтрализатором запаха и просушите.",
      },
    ],
    warnings: [
      "Не используйте хлорку и горячую воду: на белковых загрязнениях они сворачивают пятно и оставляют жёлтый след.",
      "Не маскируйте запах освежителями — бактерии пота продолжат разлагаться и запах усилится.",
    ],
    whenToCallPro: "Если пот впитался в поролон изголовья или дивана, пятна старше недели, либо обивка натуральная кожа/замша. Нужна промывка экстрактором с ферментным составом и нейтрализация запаха озоном.",
    diyCostNote: "20 – 45 BYN / ≈550 – 1200 ₽ (энзимный очиститель, нейтрализатор запаха)",
    proTimeNote: "60 – 90 минут + сушка",
    searchKeywords: ["пот на диване", "желтые пятна на обивке", "запах пота мебель", "пятна на изголовье", "убрать запах с дивана"],
    relatedCategory: "upholstery",
    status: "published",
  },
  {
    id: "mel-flomaster-na-oboyah",
    slug: "mel-flomaster-na-oboyah",
    title: "Мел или фломастер на обоях",
    problemType: "stain",
    surface: "wall",
    material: "бумажные / флизелиновые / виниловые обои, окрашенные стены",
    severity: "set",
    audience: "b2c",
    diySteps: [
      {
        order: 1,
        instruction: "Определите тип покрытия и маркера: бумажные и флизелиновые обои переносят только сухое удаление и слабый мыльный раствор, винил допускает спирт. Сначала проверьте выбранное средство на скрытом участке — за плинтусом или за мебелью.",
        tip: "Мел и вода — плохая пара: сначала уберите мел полностью сухим способом, иначе он превратится в серое пятно.",
      },
      {
        order: 2,
        instruction: "Мел смахните мягкой сухой щёткой или ластиком для обоев по направлению рисунка, затем пропылесосьте стену — не мочите её до полного удаления мела.",
      },
      {
        order: 3,
        instruction: "Фломастер: свежие чернила промокните сухой салфеткой, не размазывая. Водные маркеры ототрите чуть влажной микрофиброй с мыльной пеной pH 7. Перманентные маркеры выводятся изопропиловым спиртом точечно — только на виниловых и плотных обоях.",
        tip: "Спирт наносите на ватную палочку, а не на стену: чем меньше жидкости, тем меньше риск подтёка клея.",
      },
      {
        order: 4,
        instruction: "Промокните обработанное место чистой сухой салфеткой, дайте стене высохнуть и при необходимости повторите процедуру. Не трите круговыми движениями — так чернила только глубже въедутся в бумагу.",
      },
    ],
    warnings: [
      "Не мочите обои и не трите щёткой: размокает клей, чернила расплывутся ореолом, а край обои может отклеиться от стены.",
      "Не используйте ацетон, растворитель 646 и хлорку на бумажных и флизелиновых обоях — растворится верхний слой и краска рисунка.",
      "Не применяйте спирт и агрессивные составы без теста на скрытом участке: цвет и фактура обоев могут измениться необратимо.",
    ],
    whenToCallPro: "Закрашена большая площадь стены, перманентный маркер въелся в флизелин или бумагу, обои уже отходят от стены, либо это не обои, а фактурная краска — специалист подберёт состав под конкретное покрытие и снимет след без подтёков клея.",
    diyCostNote: "0 – 30 BYN / ≈0 – 800 ₽ (ластик для обоев, мыльная пена, изопропиловый спирт)",
    proTimeNote: "30 – 60 минут на стену",
    searchKeywords: ["мел на обоях", "фломастер на стене", "маркер на обоях", "как отмыть мел", "ручка на стене", "пятно от фломастера", "детские рисунки на обоях", "отмыть маркер со стены"],
    relatedCategory: "apartments",
    status: "published",
  },
];

export const seedSolutionProducts: SeedSolutionProduct[] = [
  { id: "sp-1", solutionId: "vino-na-divane", brandId: "prochem", role: "alternative", note: "Prochem Stain Pro — только после обязательного теста на незаметном участке; после щелочного состава обязательно кислотное ополаскивание (pH 10.5)" },
  { id: "sp-2", solutionId: "vino-na-divane", brandId: "prochem", role: "recommended", note: "Prochem Neutral Pro-Spotter — основной деликатный вариант для танинов вина (pH 7.5)" },
  { id: "sp-3", solutionId: "kofe-na-tekstile", brandId: "prochem", role: "recommended", note: "Prochem Neutral Pro-Spotter — кофе и чай, пищевые пятна (pH 7.5)" },
  { id: "sp-4", solutionId: "kofe-na-tekstile", brandId: "prochem", role: "alternative", note: "Prochem Stain Pro — щелочной комплекс для свежих пятен (pH 10.5)" },
  { id: "sp-5", solutionId: "krov-na-matrase", brandId: "prochem", role: "recommended", note: "Prochem Stain Pro — белковые пятна: кровь и рвота (pH 10.5)" },
  { id: "sp-6", solutionId: "krov-na-matrase", brandId: "karcher", role: "alternative", note: "Kärcher Puzzi 10/1 — экстрактор для промывки и сушки матраса" },
  { id: "sp-7", solutionId: "mocha-i-zapah-matras", brandId: "prochem", role: "recommended", note: "Prochem Urine Neutraliser — нейтрализация мочи и запаха (pH 3.5)" },
  { id: "sp-8", solutionId: "mocha-i-zapah-matras", brandId: "kiehl", role: "alternative", note: "Kiehl Omni-fresh — микробиологический нейтрализатор запахов для текстиля" },
  { id: "sp-9", solutionId: "poslestroy-zatirka-plitka", brandId: "grass", role: "recommended", note: "Grass Cement Cleaner — кислотный концентрат для цемента и затирки (pH 2)" },
  { id: "sp-10", solutionId: "poslestroy-zatirka-plitka", brandId: "kiehl", role: "alternative", note: "Kiehl Torvan Concentrate — нейтральная финишная мойка после кислотной обработки" },
  { id: "sp-11", solutionId: "poslestroy-okna-skotch", brandId: "grass", role: "recommended", note: "Grass Antigraffiti — растворитель для скотча, клея и маркера" },
  { id: "sp-12", solutionId: "poslestroy-okna-skotch", brandId: "kiehl", role: "alternative", note: "Kiehl Tablefit — пятновыводитель для маркера и клея на твёрдых поверхностях (pH 9.5)" },
  { id: "sp-13", solutionId: "zhir-vytyazhka-kuhnya", brandId: "grass", role: "recommended", note: "Grass Azelit-Gel — щелочной гель против нагара и жира (pH 11–12)" },
  { id: "sp-14", solutionId: "zhir-vytyazhka-kuhnya", brandId: "kiehl", role: "alternative", note: "Kiehl Grasset-plus — обезжириватель для пищевых зон (pH 11)" },
  { id: "sp-15", solutionId: "vodny-kamen-dushevaya", brandId: "kiehl", role: "alternative", note: "Kiehl Sanikal-eco — альтернатива только для лёгкого мыльного налёта (концентрат pH 9, раствор ~pH 7)" },
  { id: "sp-16", solutionId: "vodny-kamen-dushevaya", brandId: "grass", role: "recommended", note: "Grass Gloss Gel — основной кислотный гель против водного камня по шагу 1 (pH 2–3)" },
  { id: "sp-17", solutionId: "uborka-ofisa-posle-korporativa", brandId: "vileda-pro", role: "recommended", note: "Vileda UltraSpeed Pro — быстрая система отжима для больших площадей" },
  { id: "sp-18", solutionId: "uborka-ofisa-posle-korporativa", brandId: "bosch", role: "alternative", note: "Bosch GAS 18V-10 L — аккумуляторный пылесос для пыли и мусора" },
  { id: "sp-19", solutionId: "zapah-syrosti-posle-potopa", brandId: "karcher", role: "recommended", note: "Kärcher NT 30/1 — водосос для удаления влаги и ила" },
  { id: "sp-20", solutionId: "zapah-syrosti-posle-potopa", brandId: "prochem", role: "alternative", note: "Prochem Odour Fresh — дезодорант для обработки после просушки (pH 7.5)" },
  { id: "sp-21", solutionId: "flomaster-ruchka-na-divane", brandId: "prochem", role: "recommended", note: "Prochem Ink Solv — микроэмульсия для маркеров и чернил на ткани (pH 7.5)" },
  { id: "sp-22", solutionId: "flomaster-ruchka-na-divane", brandId: "prochem", role: "alternative", note: "Prochem Solvall Spotter — сольвент для жирных и клеевых пятен" },
  { id: "sp-23", solutionId: "vosk-zhvachka-na-kovre", brandId: "prochem", role: "recommended", note: "Prochem Solvall Spotter — растворитель для жвачки, смолы и клея" },
  { id: "sp-24", solutionId: "vosk-zhvachka-na-kovre", brandId: "karcher", role: "alternative", note: "Kärcher Puzzi 10/1 — экстракция после удаления жвачки" },
  { id: "sp-25", solutionId: "zapah-zhivotnyh-kover", brandId: "prochem", role: "recommended", note: "Prochem Urine Neutraliser — нейтрализация запаха мочи животных (pH 3.5)" },
  { id: "sp-26", solutionId: "zapah-zhivotnyh-kover", brandId: "ecolab", role: "alternative", note: "Ecolab Bio-Enzymatic Odor Eliminator — ферментный нейтрализатор запахов животных" },
  { id: "sp-27", solutionId: "chernaya-plesen-shvy-vannaya", brandId: "grass", role: "recommended", note: "Grass Dos-Gel — хлорный гель для дезинфекции швов и удаления плесени (pH 11)" },
  { id: "sp-28", solutionId: "chernaya-plesen-shvy-vannaya", brandId: "vileda-pro", role: "alternative", note: "Vileda MicroTuff — микрофибра для механического снятия налёта без абразива" },
  { id: "sp-29", solutionId: "nalet-chernaya-santehnika", brandId: "kiehl", role: "recommended", note: "Kiehl Torvan Concentrate — нейтральный клинер для деликатных покрытий (в растворе ~pH 7.5)" },
  { id: "sp-30", solutionId: "nalet-chernaya-santehnika", brandId: "vileda-pro", role: "alternative", note: "Vileda MicroTuff — микрофибра без абразива для деликатных поверхностей" },
  { id: "sp-31", solutionId: "sledy-reziny-kleya-laminat", brandId: "grass", role: "recommended", note: "Grass Antigraffiti — удаление клеевого слоя и следов резины" },
  { id: "sp-32", solutionId: "sledy-reziny-kleya-laminat", brandId: "kiehl", role: "alternative", note: "Kiehl Tablefit — пятновыводитель для клея и маркера (pH 9.5)" },
  { id: "sp-33", solutionId: "zheltyy-nalet-unitaz", brandId: "kiehl", role: "recommended", note: "Kiehl Powerfix-Gel — сильнокислотный гель для унитазов и писсуаров (pH 0.5)" },
  { id: "sp-34", solutionId: "zheltyy-nalet-unitaz", brandId: "grass", role: "alternative", note: "Grass Gloss Gel — лимонная кислота для фаянса и хрома (pH 2–3)" },
  { id: "sp-35", solutionId: "chay-na-obivke", brandId: "prochem", role: "alternative", note: "Prochem Stain Pro — только после обязательного теста на незаметном участке; после щелочного состава обязательно кислотное ополаскивание (pH 10.5)" },
  { id: "sp-36", solutionId: "chay-na-obivke", brandId: "prochem", role: "recommended", note: "Prochem Neutral Pro-Spotter — основной деликатный вариант для танинов чая и кофе (pH 7.5)" },
  { id: "sp-37", solutionId: "sok-na-kovre", brandId: "prochem", role: "recommended", note: "Prochem Stain Pro — пятновыводитель для пищевых и соковых пятен" },
  { id: "sp-38", solutionId: "sok-na-kovre", brandId: "prochem", role: "alternative", note: "Prochem Neutral Pro-Spotter — нейтральный универсальный spotter (pH 7.5)" },
  { id: "sp-39", solutionId: "shokolad-na-kovre", brandId: "prochem", role: "recommended", note: "Prochem Stain Pro — масляно-белковые пищевые пятна (pH 10.5)" },
  { id: "sp-40", solutionId: "shokolad-na-kovre", brandId: "prochem", role: "alternative", note: "Prochem Neutral Pro-Spotter — щадящий вариант для деликатных волокон" },
  { id: "sp-41", solutionId: "krov-na-kovre", brandId: "prochem", role: "recommended", note: "Prochem Stain Pro — щелочной комплекс для белковых пятен (pH 10.5)" },
  { id: "sp-42", solutionId: "krov-na-kovre", brandId: "karcher", role: "alternative", note: "Kärcher Puzzi 10/1 — экстрактор для промывки ковра после обработки" },
  { id: "sp-43", solutionId: "plesen-na-stenah", brandId: "grass", role: "recommended", note: "Grass Dos-Gel — хлорный гель против плесени на плитке и швах (pH 11)" },
  { id: "sp-44", solutionId: "plesen-na-stenah", brandId: "vileda-pro", role: "alternative", note: "Vileda MicroTuff — микрофибра для механической обработки стен" },
  { id: "sp-45", solutionId: "zhir-na-kuhonnyh-fasadah", brandId: "grass", role: "recommended", note: "Grass Azelit-Gel — щелочной антижир для кухонных фасадов (pH 11–12)" },
  { id: "sp-46", solutionId: "zhir-na-kuhonnyh-fasadah", brandId: "kiehl", role: "alternative", note: "Kiehl Grasset-plus — обезжиривание поверхностей (pH 11)" },
  { id: "sp-47", solutionId: "pota-na-obivke", brandId: "prochem", role: "recommended", note: "Prochem Neutral Pro-Spotter — деликатная обработка пота на обивке (pH 7.5; кожу — только спецсредством)" },
  { id: "sp-48", solutionId: "pota-na-obivke", brandId: "kiehl", role: "alternative", note: "Kiehl Omni-fresh — микробиологический нейтрализатор запаха пота для текстиля" },
  { id: "sp-49", solutionId: "mel-flomaster-na-oboyah", brandId: "prochem", role: "recommended", note: "Prochem Ink Solv — деликатная водная микроэмульсия для чернил (pH 7.5); на моющихся виниловых обоях и краске только точечно после теста" },
  { id: "sp-50", solutionId: "mel-flomaster-na-oboyah", brandId: "kiehl", role: "alternative", note: "Kiehl Tablefit — только для твёрдых моющихся поверхностей после теста; не для бумажных и флизелиновых обоев (pH 9.5)" },
];

export const seedIntentKeywords: SeedIntentKeyword[] = [
  // B2C: мебель, пятна, квартиры, дом
  { id: "ik-1", keyword: "диван", intent: "b2c", weight: 10, targetKind: "category", targetSlug: "upholstery" },
  { id: "ik-2", keyword: "химчистка дивана", intent: "b2c", weight: 10, targetKind: "category", targetSlug: "upholstery" },
  { id: "ik-3", keyword: "пятно на диване", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "vino-na-divane" },
  { id: "ik-4", keyword: "вино на диване", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "vino-na-divane" },
  { id: "ik-5", keyword: "красное вино", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "vino-na-divane" },
  { id: "ik-6", keyword: "пятно от вина", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "vino-na-divane" },
  { id: "ik-7", keyword: "кофе на обивке", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "kofe-na-tekstile" },
  { id: "ik-8", keyword: "пролил кофе", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "kofe-na-tekstile" },
  { id: "ik-9", keyword: "пятно крови", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "krov-na-matrase" },
  { id: "ik-10", keyword: "кровь на матрасе", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "krov-na-matrase" },
  { id: "ik-11", keyword: "запах мочи", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "mocha-i-zapah-matras" },
  { id: "ik-12", keyword: "кошачья моча", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "mocha-i-zapah-matras" },
  { id: "ik-13", keyword: "запах матраса", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "mocha-i-zapah-matras" },
  { id: "ik-14", keyword: "водный камень", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "vodny-kamen-dushevaya" },
  { id: "ik-15", keyword: "налет в душевой", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "vodny-kamen-dushevaya" },
  { id: "ik-16", keyword: "жир на вытяжке", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "zhir-vytyazhka-kuhnya" },
  { id: "ik-17", keyword: "нагар на кухне", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "zhir-vytyazhka-kuhnya" },
  { id: "ik-18", keyword: "уборка квартиры", intent: "b2c", weight: 10, targetKind: "category", targetSlug: "apartments" },
  { id: "ik-19", keyword: "уборка дома", intent: "b2c", weight: 9, targetKind: "category", targetSlug: "apartments" },
  { id: "ik-20", keyword: "генеральная уборка", intent: "b2c", weight: 10, targetKind: "category", targetSlug: "deep-cleaning" },
  { id: "ik-21", keyword: "мытье окон", intent: "b2c", weight: 10, targetKind: "category", targetSlug: "windows" },
  { id: "ik-22", keyword: "окна в квартире", intent: "b2c", weight: 8, targetKind: "category", targetSlug: "windows" },
  { id: "ik-23", keyword: "клинер на дом", intent: "b2c", weight: 8, targetKind: "category", targetSlug: "apartments" },
  { id: "ik-24", keyword: "поддерживающая уборка", intent: "b2c", weight: 8, targetKind: "category", targetSlug: "apartments" },
  { id: "ik-25", keyword: "почистить ковер", intent: "b2c", weight: 9, targetKind: "category", targetSlug: "upholstery" },
  { id: "ik-26", keyword: "химчистка матраса", intent: "b2c", weight: 9, targetKind: "category", targetSlug: "upholstery" },
  { id: "ik-27", keyword: "затопили квартиру", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "zapah-syrosti-posle-potopa" },
  { id: "ik-28", keyword: "плесень после потопа", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "zapah-syrosti-posle-potopa" },

  // B2B: офисы, склады, юрлица, коммерция
  { id: "ik-29", keyword: "офис", intent: "b2b", weight: 10, targetKind: "category", targetSlug: "offices" },
  { id: "ik-30", keyword: "уборка офиса", intent: "b2b", weight: 10, targetKind: "category", targetSlug: "offices" },
  { id: "ik-31", keyword: "клининг офиса", intent: "b2b", weight: 10, targetKind: "category", targetSlug: "offices" },
  { id: "ik-32", keyword: "клининг b2b", intent: "b2b", weight: 10, targetKind: "category", targetSlug: "offices" },
  { id: "ik-33", keyword: "коммерческий клининг", intent: "b2b", weight: 10, targetKind: "category", targetSlug: "offices" },
  { id: "ik-34", keyword: "уборка склада", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "offices" },
  { id: "ik-35", keyword: "клининг бизнес центра", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "offices" },
  { id: "ik-36", keyword: "клининг по безналу", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "offices" },
  { id: "ik-37", keyword: "договор клининга", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "offices" },
  { id: "ik-38", keyword: "ежедневная уборка офиса", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "offices" },
  { id: "ik-39", keyword: "клининг после ремонта офис", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "post-renovation" },
  { id: "ik-40", keyword: "уборка после ремонта", intent: "b2b", weight: 8, targetKind: "category", targetSlug: "post-renovation" },
  { id: "ik-41", keyword: "затирка на плитке", intent: "b2b", weight: 8, targetKind: "solution", targetSlug: "poslestroy-zatirka-plitka" },
  { id: "ik-42", keyword: "эпоксидная затирка", intent: "b2b", weight: 8, targetKind: "solution", targetSlug: "poslestroy-zatirka-plitka" },
  { id: "ik-43", keyword: "скотч на окнах", intent: "b2b", weight: 8, targetKind: "solution", targetSlug: "poslestroy-okna-skotch" },
  { id: "ik-44", keyword: "следы клея стекло", intent: "b2b", weight: 8, targetKind: "solution", targetSlug: "poslestroy-okna-skotch" },
  { id: "ik-45", keyword: "уборка после корпоратива", intent: "b2b", weight: 9, targetKind: "solution", targetSlug: "uborka-ofisa-posle-korporativa" },
  { id: "ik-46", keyword: "клининг мероприятия", intent: "b2b", weight: 8, targetKind: "solution", targetSlug: "uborka-ofisa-posle-korporativa" },
  { id: "ik-47", keyword: "мойка фасадов", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "windows" },
  { id: "ik-48", keyword: "витражи", intent: "b2b", weight: 8, targetKind: "category", targetSlug: "windows" },
  { id: "ik-49", keyword: "промышленный клининг", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "offices" },
  { id: "ik-50", keyword: "клининг ресторана", intent: "b2b", weight: 9, targetKind: "category", targetSlug: "deep-cleaning" },

  // PRO: бренды, техника, химия, инвентарь
  { id: "ik-51", keyword: "kiehl", intent: "pro", weight: 10, targetKind: "brand", targetSlug: "kiehl" },
  { id: "ik-52", keyword: "karcher", intent: "pro", weight: 10, targetKind: "brand", targetSlug: "karcher" },
  { id: "ik-53", keyword: "керхер", intent: "pro", weight: 10, targetKind: "brand", targetSlug: "karcher" },
  { id: "ik-54", keyword: "dyson", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "dyson" },
  { id: "ik-55", keyword: "bosch", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "bosch" },
  { id: "ik-56", keyword: "vileda", intent: "pro", weight: 10, targetKind: "brand", targetSlug: "vileda-professional" },
  { id: "ik-57", keyword: "виледа", intent: "pro", weight: 10, targetKind: "brand", targetSlug: "vileda-professional" },
  { id: "ik-58", keyword: "ecolab", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "ecolab" },
  { id: "ik-59", keyword: "эколаб", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "ecolab" },
  { id: "ik-60", keyword: "grass", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "grass" },
  { id: "ik-61", keyword: "грасс", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "grass" },
  { id: "ik-62", keyword: "prochem", intent: "pro", weight: 10, targetKind: "brand", targetSlug: "prochem" },
  { id: "ik-63", keyword: "прохем", intent: "pro", weight: 10, targetKind: "brand", targetSlug: "prochem" },
  { id: "ik-64", keyword: "экстрактор", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "karcher" },
  { id: "ik-65", keyword: "профессиональная химия", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "kiehl" },
  { id: "ik-66", keyword: "инвентарь vileda", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "vileda-professional" },
  { id: "ik-67", keyword: "пятновыводитель kiehl", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "kiehl" },
  { id: "ik-68", keyword: "поломоечная машина", intent: "pro", weight: 9, targetKind: "brand", targetSlug: "karcher" },

  // Этап 4: новые протоколы
  { id: "ik-69", keyword: "фломастер на диване", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "flomaster-ruchka-na-divane" },
  { id: "ik-70", keyword: "ручка на диване", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "flomaster-ruchka-na-divane" },
  { id: "ik-71", keyword: "маркер на обивке", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "flomaster-ruchka-na-divane" },
  { id: "ik-72", keyword: "жвачка на ковре", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "vosk-zhvachka-na-kovre" },
  { id: "ik-73", keyword: "воск на ковре", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "vosk-zhvachka-na-kovre" },
  { id: "ik-74", keyword: "моча на ковре", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "zapah-zhivotnyh-kover" },
  { id: "ik-75", keyword: "кошка пометила ковер", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "zapah-zhivotnyh-kover" },
  { id: "ik-76", keyword: "плесень в ванной", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "chernaya-plesen-shvy-vannaya" },
  { id: "ik-77", keyword: "черные швы плитки", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "chernaya-plesen-shvy-vannaya" },
  { id: "ik-78", keyword: "черный смеситель", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "nalet-chernaya-santehnika" },
  { id: "ik-79", keyword: "налет на смесителе", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "nalet-chernaya-santehnika" },
  { id: "ik-80", keyword: "клей на ламинате", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "sledy-reziny-kleya-laminat" },
  { id: "ik-81", keyword: "черные полосы на полу", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "sledy-reziny-kleya-laminat" },
  { id: "ik-82", keyword: "запах на ковре", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "zapah-zhivotnyh-kover" },
  { id: "ik-83", keyword: "почистить матрас", intent: "b2c", weight: 9, targetKind: "category", targetSlug: "upholstery" },

  // Этап 5: протоколы nalet/sok/shokolad/krov/plesen/zhir/pot
  { id: "ik-84", keyword: "желтый налет в унитазе", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "zheltyy-nalet-unitaz" },
  { id: "ik-85", keyword: "камень в унитазе", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "zheltyy-nalet-unitaz" },
  { id: "ik-86", keyword: "мочевой камень", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "zheltyy-nalet-unitaz" },
  { id: "ik-87", keyword: "чай на диване", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "chay-na-obivke" },
  { id: "ik-88", keyword: "пятно от чая", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "chay-na-obivke" },
  { id: "ik-89", keyword: "чай на обивке", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "chay-na-obivke" },
  { id: "ik-90", keyword: "сок на ковре", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "sok-na-kovre" },
  { id: "ik-91", keyword: "детский сок пятно", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "sok-na-kovre" },
  { id: "ik-92", keyword: "виноградный сок ковер", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "sok-na-kovre" },
  { id: "ik-93", keyword: "шоколад на ковре", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "shokolad-na-kovre" },
  { id: "ik-94", keyword: "пятно шоколада", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "shokolad-na-kovre" },
  { id: "ik-95", keyword: "шоколад на диване", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "shokolad-na-kovre" },
  { id: "ik-96", keyword: "кровь на ковре", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "krov-na-kovre" },
  { id: "ik-97", keyword: "пятно крови ковролин", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "krov-na-kovre" },
  { id: "ik-98", keyword: "плесень на стене", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "plesen-na-stenah" },
  { id: "ik-99", keyword: "черная плесень стены", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "plesen-na-stenah" },
  { id: "ik-100", keyword: "плесень на потолке", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "plesen-na-stenah" },
  { id: "ik-101", keyword: "жир на кухонных фасадах", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "zhir-na-kuhonnyh-fasadah" },
  { id: "ik-102", keyword: "копоть на кухне", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "zhir-na-kuhonnyh-fasadah" },
  { id: "ik-103", keyword: "жирные пятна на мебели", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "zhir-na-kuhonnyh-fasadah" },
  { id: "ik-104", keyword: "пот на диване", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "pota-na-obivke" },
  { id: "ik-105", keyword: "желтые пятна на обивке", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "pota-na-obivke" },
  { id: "ik-106", keyword: "запах пота мебель", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "pota-na-obivke" },
  { id: "ik-107", keyword: "пятна на изголовье", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "pota-na-obivke" },

  // Этап 6: протокол «Мел или фломастер на обоях»
  { id: "ik-108", keyword: "мел на обоях", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "mel-flomaster-na-oboyah" },
  { id: "ik-109", keyword: "фломастер на стене", intent: "b2c", weight: 10, targetKind: "solution", targetSlug: "mel-flomaster-na-oboyah" },
  { id: "ik-110", keyword: "маркер на обоях", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "mel-flomaster-na-oboyah" },
  { id: "ik-111", keyword: "как отмыть мел", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "mel-flomaster-na-oboyah" },
  { id: "ik-112", keyword: "ручка на стене", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "mel-flomaster-na-oboyah" },
  { id: "ik-113", keyword: "пятно от фломастера", intent: "b2c", weight: 9, targetKind: "solution", targetSlug: "mel-flomaster-na-oboyah" },
  { id: "ik-114", keyword: "детские рисунки на стене", intent: "b2c", weight: 8, targetKind: "solution", targetSlug: "mel-flomaster-na-oboyah" },
];

export const seedPriceEstimates: SeedPriceEstimate[] = [
  // Решение 1: vino-na-divane
  { id: "pe-1", solutionId: "vino-na-divane", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 60, priceMax: 120, unit: "диван", note: "Химчистка посадочного места и удаление пятна экстрактором" },
  { id: "pe-2", solutionId: "vino-na-divane", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2500, priceMax: 5000, unit: "диван", note: "Химчистка и вывод винного пигмента" },
  { id: "pe-3", solutionId: "vino-na-divane", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 12000, priceMax: 25000, unit: "диван", note: "Экстракционная химчистка с нейтрализатором" },

  // Решение 2: kofe-na-tekstile
  { id: "pe-4", solutionId: "kofe-na-tekstile", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 50, priceMax: 100, unit: "место", note: "Энзимная химчистка с удалением молочных жиров" },
  { id: "pe-5", solutionId: "kofe-na-tekstile", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2000, priceMax: 4500, unit: "место", note: "Экстракция кофейного пятна" },
  { id: "pe-6", solutionId: "kofe-na-tekstile", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 10000, priceMax: 22000, unit: "место", note: "Профессиональная промывка" },

  // Решение 3: krov-na-matrase
  { id: "pe-7", solutionId: "krov-na-matrase", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 70, priceMax: 140, unit: "матрас", note: "Глубокая экстракция с расщеплением белка" },
  { id: "pe-8", solutionId: "krov-na-matrase", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 3000, priceMax: 6000, unit: "матрас", note: "Белковый нейтрализатор + экстрактор" },
  { id: "pe-9", solutionId: "krov-na-matrase", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 15000, priceMax: 30000, unit: "матрас", note: "Вывод застарелых белковых пятен" },

  // Решение 4: mocha-i-zapah-matras
  { id: "pe-10", solutionId: "mocha-i-zapah-matras", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 80, priceMax: 160, unit: "матрас", note: "Полная дезинфекция и удаление запаха озоном / энзимами" },
  { id: "pe-11", solutionId: "mocha-i-zapah-matras", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 3500, priceMax: 7000, unit: "матрас", note: "Промывка наполнения + нейтрализация уратов" },
  { id: "pe-12", solutionId: "mocha-i-zapah-matras", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 18000, priceMax: 35000, unit: "матрас", note: "Глубокая экстракция запаха" },

  // Решение 5: poslestroy-zatirka-plitka
  { id: "pe-13", solutionId: "poslestroy-zatirka-plitka", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 5, priceMax: 12, unit: "м²", note: "Роторная размывка пола со смывкой затирки" },
  { id: "pe-14", solutionId: "poslestroy-zatirka-plitka", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 200, priceMax: 450, unit: "м²", note: "Очистка керамогранита от затирок" },
  { id: "pe-15", solutionId: "poslestroy-zatirka-plitka", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 1000, priceMax: 2200, unit: "м²", note: "Механическая очистка пола" },

  // Решение 6: poslestroy-okna-skotch
  { id: "pe-16", solutionId: "poslestroy-okna-skotch", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 20, priceMax: 40, unit: "окно", note: "Снятие прикипевшей пленки и клея с рамы и стекла" },
  { id: "pe-17", solutionId: "poslestroy-okna-skotch", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 800, priceMax: 1600, unit: "окно", note: "Удаление скотча и очистка стеклопакета" },
  { id: "pe-18", solutionId: "poslestroy-okna-skotch", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 4000, priceMax: 8000, unit: "окно", note: "Мойка окон после ремонта" },

  // Решение 7: zhir-vytyazhka-kuhnya
  { id: "pe-19", solutionId: "zhir-vytyazhka-kuhnya", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 70, priceMax: 150, unit: "кухня", note: "Глубокое обезжиривание вытяжки, решеток и фартука" },
  { id: "pe-20", solutionId: "zhir-vytyazhka-kuhnya", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 3000, priceMax: 6500, unit: "кухня", note: "Очистка зоны готовки и вытяжки" },
  { id: "pe-21", solutionId: "zhir-vytyazhka-kuhnya", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 15000, priceMax: 32000, unit: "кухня", note: "Комплексное обезжиривание" },

  // Решение 8: vodny-kamen-dushevaya
  { id: "pe-22", solutionId: "vodny-kamen-dushevaya", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 45, priceMax: 90, unit: "кабина", note: "Удаление водного камня со стекол и хрома душевой" },
  { id: "pe-23", solutionId: "vodny-kamen-dushevaya", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 1800, priceMax: 3800, unit: "кабина", note: "Очистка известкового налета" },
  { id: "pe-24", solutionId: "vodny-kamen-dushevaya", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 9000, priceMax: 19000, unit: "кабина", note: "Снятие камня со стекол" },

  // Решение 9: uborka-ofisa-posle-korporativa
  { id: "pe-25", solutionId: "uborka-ofisa-posle-korporativa", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 4, priceMax: 8, unit: "м²", note: "Срочный ночной / утренний клининг офиса с безналом" },
  { id: "pe-26", solutionId: "uborka-ofisa-posle-korporativa", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 150, priceMax: 300, unit: "м²", note: "Экспресс-уборка коммерческих помещений" },
  { id: "pe-27", solutionId: "uborka-ofisa-posle-korporativa", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 700, priceMax: 1500, unit: "м²", note: "Срочная уборка офисных площадей" },

  // Решение 10: zapah-syrosti-posle-potopa
  { id: "pe-28", solutionId: "zapah-syrosti-posle-potopa", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 8, priceMax: 18, unit: "м²", note: "Откачка воды, аренда промышленных сушилок, озонирование" },
  { id: "pe-29", solutionId: "zapah-syrosti-posle-potopa", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 300, priceMax: 700, unit: "м²", note: "Просушка помещений и антиплесневая обработка" },
  { id: "pe-30", solutionId: "zapah-syrosti-posle-potopa", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 1500, priceMax: 3500, unit: "м²", note: "Аварийная просушка квартиры" },

  // Решение 11: flomaster-ruchka-na-divane
  { id: "pe-31", solutionId: "flomaster-ruchka-na-divane", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 50, priceMax: 110, unit: "диван", note: "Вывод чернил и маркера сольвентом с экстракцией" },
  { id: "pe-32", solutionId: "flomaster-ruchka-na-divane", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2200, priceMax: 4800, unit: "диван", note: "Удаление следов ручки и фломастера" },
  { id: "pe-33", solutionId: "flomaster-ruchka-na-divane", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 11000, priceMax: 24000, unit: "диван", note: "Химчистка обивки от чернил" },

  // Решение 12: vosk-zhvachka-na-kovre
  { id: "pe-34", solutionId: "vosk-zhvachka-na-kovre", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 3, priceMax: 7, unit: "м²", note: "Удаление воска и жвачки, экстракционная чистка ковра" },
  { id: "pe-35", solutionId: "vosk-zhvachka-na-kovre", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 150, priceMax: 350, unit: "м²", note: "Чистка ковра от воска и жвачки" },
  { id: "pe-36", solutionId: "vosk-zhvachka-na-kovre", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 800, priceMax: 1800, unit: "м²", note: "Химчистка ковра на дому" },

  // Решение 13: zapah-zhivotnyh-kover
  { id: "pe-37", solutionId: "zapah-zhivotnyh-kover", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 4, priceMax: 9, unit: "м²", note: "Энзимная промывка ковра и нейтрализация запаха мочи" },
  { id: "pe-38", solutionId: "zapah-zhivotnyh-kover", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 200, priceMax: 450, unit: "м²", note: "Удаление запаха животных из ковра" },
  { id: "pe-39", solutionId: "zapah-zhivotnyh-kover", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 1000, priceMax: 2300, unit: "м²", note: "Чистка ковра от меток животных" },

  // Решение 14: chernaya-plesen-shvy-vannaya
  { id: "pe-40", solutionId: "chernaya-plesen-shvy-vannaya", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 60, priceMax: 140, unit: "санузел", note: "Антисептическая обработка швов и замена герметика" },
  { id: "pe-41", solutionId: "chernaya-plesen-shvy-vannaya", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2500, priceMax: 6000, unit: "санузел", note: "Удаление плесени в ванной" },
  { id: "pe-42", solutionId: "chernaya-plesen-shvy-vannaya", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 12000, priceMax: 30000, unit: "санузел", note: "Обработка швов от грибка" },

  // Решение 15: nalet-chernaya-santehnika
  { id: "pe-43", solutionId: "nalet-chernaya-santehnika", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 40, priceMax: 90, unit: "санузел", note: "Бережная очистка матовой сантехники допущенными составами" },
  { id: "pe-44", solutionId: "nalet-chernaya-santehnika", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 1800, priceMax: 4000, unit: "санузел", note: "Удаление налёта с чёрной сантехники" },
  { id: "pe-45", solutionId: "nalet-chernaya-santehnika", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 9000, priceMax: 20000, unit: "санузел", note: "Очистка сантехники от налёта" },

  // Решение 16: sledy-reziny-kleya-laminat
  { id: "pe-46", solutionId: "sledy-reziny-kleya-laminat", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 3, priceMax: 7, unit: "м²", note: "Удаление клея, скотча и следов резины с пола" },
  { id: "pe-47", solutionId: "sledy-reziny-kleya-laminat", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 120, priceMax: 300, unit: "м²", note: "Очистка пола после ремонта" },
  { id: "pe-48", solutionId: "sledy-reziny-kleya-laminat", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 700, priceMax: 1600, unit: "м²", note: "Уборка пола от клея и скотча" },

  // Этап 5: новые протоколы
  { id: "pe-49", solutionId: "zheltyy-nalet-unitaz", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 40, priceMax: 80, unit: "унитаз", note: "Дескейлинг чаши и обработка под ободком" },
  { id: "pe-50", solutionId: "zheltyy-nalet-unitaz", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 1500, priceMax: 3500, unit: "унитаз", note: "Удаление минеральных отложений" },
  { id: "pe-51", solutionId: "zheltyy-nalet-unitaz", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 7000, priceMax: 15000, unit: "унитаз", note: "Чистка унитаза от камня" },
  { id: "pe-52", solutionId: "chay-na-obivke", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 50, priceMax: 110, unit: "место", note: "Вывод танинного пятна с обивки" },
  { id: "pe-53", solutionId: "chay-na-obivke", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2000, priceMax: 4500, unit: "место", note: "Экстракция пятна чая" },
  { id: "pe-54", solutionId: "chay-na-obivke", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 10000, priceMax: 22000, unit: "место", note: "Химчистка обивки" },
  { id: "pe-55", solutionId: "sok-na-kovre", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 60, priceMax: 120, unit: "ковёр", note: "Экстракционная промывка пятна сока" },
  { id: "pe-56", solutionId: "sok-na-kovre", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2500, priceMax: 5500, unit: "ковёр", note: "Вывод пятна с ковра" },
  { id: "pe-57", solutionId: "sok-na-kovre", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 12000, priceMax: 26000, unit: "ковёр", note: "Химчистка ковра" },
  { id: "pe-58", solutionId: "shokolad-na-kovre", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 60, priceMax: 120, unit: "ковёр", note: "Удаление масляно-белкового пятна" },
  { id: "pe-59", solutionId: "shokolad-na-kovre", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2500, priceMax: 5000, unit: "ковёр", note: "Вывод шоколада с ковра" },
  { id: "pe-60", solutionId: "shokolad-na-kovre", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 12000, priceMax: 25000, unit: "ковёр", note: "Чистка ковра от пятна" },
  { id: "pe-61", solutionId: "krov-na-kovre", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 70, priceMax: 140, unit: "ковёр", note: "Белковый нейтрализатор + экстрактор" },
  { id: "pe-62", solutionId: "krov-na-kovre", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 3000, priceMax: 6000, unit: "ковёр", note: "Вывод крови с ковра" },
  { id: "pe-63", solutionId: "krov-na-kovre", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 15000, priceMax: 30000, unit: "ковёр", note: "Удаление кровяного пятна" },
  { id: "pe-64", solutionId: "plesen-na-stenah", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 8, priceMax: 18, unit: "м²", note: "Антисептическая обработка стен и потолка" },
  { id: "pe-65", solutionId: "plesen-na-stenah", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 350, priceMax: 800, unit: "м²", note: "Уничтожение плесени на стенах" },
  { id: "pe-66", solutionId: "plesen-na-stenah", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 1800, priceMax: 4000, unit: "м²", note: "Обработка от плесени" },
  { id: "pe-67", solutionId: "zhir-na-kuhonnyh-fasadah", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 60, priceMax: 140, unit: "кухня", note: "Обезжиривание фасадов и техники" },
  { id: "pe-68", solutionId: "zhir-na-kuhonnyh-fasadah", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2500, priceMax: 5500, unit: "кухня", note: "Чистка кухни от жира и копоти" },
  { id: "pe-69", solutionId: "zhir-na-kuhonnyh-fasadah", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 12000, priceMax: 28000, unit: "кухня", note: "Мойка кухонных фасадов" },
  { id: "pe-70", solutionId: "pota-na-obivke", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 60, priceMax: 130, unit: "место", note: "Вывод пота и запаха с обивки" },
  { id: "pe-71", solutionId: "pota-na-obivke", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2500, priceMax: 5500, unit: "место", note: "Химчистка от пота" },
  { id: "pe-72", solutionId: "pota-na-obivke", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 12000, priceMax: 26000, unit: "место", note: "Удаление запаха с мебели" },

  // Решение 25: mel-flomaster-na-oboyah
  { id: "pe-73", solutionId: "mel-flomaster-na-oboyah", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 40, priceMax: 90, unit: "стена", note: "Удаление следов мела и маркера с обоев с проверкой покрытия" },
  { id: "pe-74", solutionId: "mel-flomaster-na-oboyah", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 1500, priceMax: 3500, unit: "стена", note: "Вывод маркера и мела со стен и обоев" },
  { id: "pe-75", solutionId: "mel-flomaster-na-oboyah", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 8000, priceMax: 18000, unit: "стена", note: "Чистка обоев от детских рисунков" },

  // Сметы по категориям для быстрого вывода
  { id: "pe-cat-1", categoryId: "apartments", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 80, priceMax: 200, unit: "уборку", note: "Поддерживающая уборка 1–3-комнатной квартиры" },
  { id: "pe-cat-2", categoryId: "apartments", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 3000, priceMax: 8000, unit: "уборку", note: "Уборка квартиры" },
  { id: "pe-cat-3", categoryId: "apartments", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 15000, priceMax: 40000, unit: "уборку", note: "Уборка жилых помещений" },
  { id: "pe-cat-4", categoryId: "offices", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 3, priceMax: 7, unit: "м²", note: "Регулярный клининг офиса по договору" },
  { id: "pe-cat-5", categoryId: "offices", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 120, priceMax: 280, unit: "м²", note: "Уборка офисов" },
  { id: "pe-cat-6", categoryId: "offices", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 600, priceMax: 1400, unit: "м²", note: "Клининг офисов" },
  { id: "pe-cat-7", categoryId: "upholstery", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 50, priceMax: 130, unit: "изделие", note: "Химчистка диванов, матрасов, ковров" },
  { id: "pe-cat-8", categoryId: "upholstery", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 2200, priceMax: 5500, unit: "изделие", note: "Выездная химчистка мебели" },
  { id: "pe-cat-9", categoryId: "upholstery", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 11000, priceMax: 26000, unit: "изделие", note: "Химчистка мебели" },
  { id: "pe-cat-10", categoryId: "windows", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 15, priceMax: 35, unit: "окно", note: "Мойка окон с двух сторон со створками" },
  { id: "pe-cat-11", categoryId: "windows", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 600, priceMax: 1400, unit: "окно", note: "Сезонная мойка окон" },
  { id: "pe-cat-12", categoryId: "windows", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 3000, priceMax: 7000, unit: "окно", note: "Мытье окон" },
  { id: "pe-cat-13", categoryId: "post-renovation", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 5, priceMax: 10, unit: "м²", note: "Обеспыливание, смывка затирки, мойка окон после ремонта" },
  { id: "pe-cat-14", categoryId: "post-renovation", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 200, priceMax: 400, unit: "м²", note: "Послестроительный клининг" },
  { id: "pe-cat-15", categoryId: "post-renovation", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 1000, priceMax: 2000, unit: "м²", note: "Уборка после ремонта" },
  { id: "pe-cat-16", categoryId: "deep-cleaning", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 6, priceMax: 12, unit: "м²", note: "Генеральный клининг всей квартиры с кухней и санузлом" },
  { id: "pe-cat-17", categoryId: "deep-cleaning", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 250, priceMax: 500, unit: "м²", note: "Генеральная уборка" },
  { id: "pe-cat-18", categoryId: "deep-cleaning", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 1200, priceMax: 2500, unit: "м²", note: "Генеральная уборка" },
];

export interface SeedProduct {
  id: string;
  brandId: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  ph?: number;
  compatibleSurfaces?: string[];
  prohibitedSurfaces?: string[];
  /** Подтверждённые материалы (точное совпадение с solution.material) — только по техкарте производителя */
  compatibleMaterials?: string[];
  compatibilityVerified?: boolean;
  compatibilitySource?: string;
  status: "draft" | "published" | "archived";
}

export const seedProducts: SeedProduct[] = [
  {
    id: "prod-prochem-stainpro",
    brandId: "prochem",
    slug: "prochem-stain-pro",
    name: "Prochem Stain Pro",
    category: "chemistry",
    description: "Щелочной белковый пятновыводитель (pH 10.5) для крови, рвоты, вина, чернил и пищевых пятен на коврах и обивке",
    ph: 10.5,
    compatibleSurfaces: ["upholstery", "carpet", "mattress"],
    prohibitedSurfaces: ["silk", "leather"],
    compatibleMaterials: ["шенилл / рогожка", "рогожка / жаккард / велюр", "ковёр / ковролин / палас", "трикотажный хлопковый чехол"],
    compatibilityVerified: true,
    compatibilitySource: "Prochem TDS B144 (pssb144.pdf): water/solvent alkaline spotter для ковров и тканей, incl. wool с pre-test",
    status: "published",
  },
  {
    id: "prod-prochem-spotter",
    brandId: "prochem",
    slug: "prochem-neutral-pro-spotter",
    name: "Prochem Neutral Pro-Spotter",
    category: "chemistry",
    description: "Нейтральный универсальный пятновыводитель (pH 7.5) для кофе, чая, соков и большинства водных пятен; WoolSafe",
    ph: 7.5,
    compatibleSurfaces: ["upholstery", "carpet", "mattress"],
    prohibitedSurfaces: ["silk"],
    compatibleMaterials: ["шенилл / рогожка", "рогожка / жаккард / велюр", "ковёр / ковролин / палас", "велюр / рогожка / шенилл / микрофибра", "ковёр / ковролин / подложка", "ковёр / ковролин / ковровое покрытие"],
    compatibilityVerified: true,
    compatibilitySource: "Prochem TDS B109/E840: WoolSafe-approved neutral spotter для ковров и обивочных тканей",
    status: "published",
  },
  {
    id: "prod-prochem-inksolv",
    brandId: "prochem",
    slug: "prochem-ink-solv",
    name: "Prochem Ink Solv",
    category: "chemistry",
    description: "Водная микроэмульсия (pH 7.5) для маркеров, чернил, лака и клея ПВА на коврах, тканях и твёрдых поверхностях",
    ph: 7.5,
    compatibleSurfaces: ["upholstery", "carpet", "floor"],
    prohibitedSurfaces: ["silk", "leather"],
    status: "published",
  },
  {
    id: "prod-prochem-solvall",
    brandId: "prochem",
    slug: "prochem-solvall-spotter",
    name: "Prochem Solvall Spotter",
    category: "chemistry",
    description: "Летучий сольвент-пятновыводитель для жира, клея, смолы, гудрона и жвачки на коврах и тканях",
    compatibleSurfaces: ["upholstery", "carpet", "floor"],
    prohibitedSurfaces: ["natural_wood", "silk", "leather"],
    status: "published",
  },
  {
    id: "prod-prochem-odourfresh",
    brandId: "prochem",
    slug: "prochem-odour-fresh",
    name: "Prochem Odour Fresh",
    category: "chemistry",
    description: "Концентрированный дезодорант (pH 7.5) для ковров, обивки и твёрдых поверхностей — добавляется в любой чистящий раствор",
    ph: 7.5,
    compatibleSurfaces: ["upholstery", "carpet", "mattress", "floor"],
    prohibitedSurfaces: ["silk", "leather"],
    status: "published",
  },
  {
    id: "prod-prochem-fibreshampoo",
    brandId: "prochem",
    slug: "prochem-fibre-shampoo",
    name: "Prochem Fibre Shampoo",
    category: "chemistry",
    description: "Пенный шампунь для ковров и обивки: концентрат pH 5.5, в рабочем растворе около pH 7 — деликатная чистка ворса",
    ph: 7.0,
    compatibleSurfaces: ["upholstery", "carpet", "floor"],
    prohibitedSurfaces: ["leather", "silk"],
    status: "published",
  },
  {
    id: "prod-prochem-urine",
    brandId: "prochem",
    slug: "prochem-urine-neutraliser",
    name: "Prochem Urine Neutraliser",
    category: "chemistry",
    description: "Кислотный нейтрализатор и дезодорант (pH 3.5) для мочи и запаха на коврах, обивке и пористых покрытиях",
    ph: 3.5,
    compatibleSurfaces: ["mattress", "carpet", "upholstery"],
    prohibitedSurfaces: ["marble", "limestone", "silk"],
    status: "published",
  },
  {
    id: "prod-grass-cement",
    brandId: "grass",
    slug: "grass-cement-cleaner",
    name: "Grass Cement Cleaner",
    category: "chemistry",
    description: "Кислотный концентрат (pH 2) для удаления остатков цемента, строительной затирки, ржавчины и высолов после ремонта",
    ph: 2.0,
    compatibleSurfaces: ["floor", "bathroom"],
    prohibitedSurfaces: ["upholstery", "carpet", "mattress", "marble"],
    status: "published",
  },
  {
    id: "prod-grass-azelit",
    brandId: "grass",
    slug: "grass-azelit-gel",
    name: "Grass Azelit-Gel",
    category: "chemistry",
    description: "Густой щелочной гель (pH 11–12) для нагара, жира и копоти на эмалированных и хромированных поверхностях кухни",
    ph: 11.5,
    compatibleSurfaces: ["kitchen"],
    prohibitedSurfaces: ["upholstery", "carpet", "mattress", "aluminum", "natural_wood"],
    status: "published",
  },
  {
    id: "prod-grass-dosgel",
    brandId: "grass",
    slug: "grass-dos-gel",
    name: "Grass Dos-Gel",
    category: "chemistry",
    description: "Гель с активным хлором (pH 11) для дезинфекции, отбеливания и удаления плесени в санузлах",
    ph: 11.0,
    compatibleSurfaces: ["bathroom"],
    prohibitedSurfaces: ["marble", "natural_wood", "upholstery"],
    status: "published",
  },
  {
    id: "prod-grass-gloss",
    brandId: "grass",
    slug: "grass-gloss-gel",
    name: "Grass Gloss Gel",
    category: "chemistry",
    description: "Кислотный гель на лимонной кислоте (pH 2–3) от известкового налёта и ржавчины для ванн, душа и фаянса",
    ph: 3.0,
    compatibleSurfaces: ["bathroom", "floor"],
    prohibitedSurfaces: ["marble", "limestone", "enamel"],
    status: "published",
  },
  {
    id: "prod-grass-antigraffiti",
    brandId: "grass",
    slug: "grass-antigraffiti",
    name: "Grass Antigraffiti",
    category: "chemistry",
    description: "Готовый сольвент (органические растворители) для скотча, клея, маркера, жвачки и граффити на твёрдых поверхностях",
    compatibleSurfaces: ["floor", "window", "bathroom"],
    prohibitedSurfaces: ["natural_wood", "silk", "leather"],
    status: "published",
  },
  {
    id: "prod-karcher-puzzi",
    brandId: "karcher",
    slug: "karcher-puzzi-10-1",
    name: "Kärcher Puzzi 10/1",
    category: "extractors",
    description: "Профессиональный моющий пылесос-экстрактор для химчистки мягкой мебели и ковровых покрытий",
    compatibleSurfaces: ["upholstery", "carpet", "mattress", "floor"],
    status: "published",
  },
  {
    id: "prod-kiehl-powerfix",
    brandId: "kiehl",
    slug: "kiehl-powerfix-gel",
    name: "Kiehl Powerfix-Gel",
    category: "chemistry",
    description: "Сильнокислотный гель (pH 0.5, фосфорная кислота) для унитазов и писсуаров — известковый налёт и мочевой камень",
    ph: 0.5,
    compatibleSurfaces: ["bathroom"],
    prohibitedSurfaces: ["marble", "limestone", "enamel", "natural_wood"],
    status: "published",
  },
  {
    id: "prod-kiehl-sanikal",
    brandId: "kiehl",
    slug: "kiehl-sanikal-eco",
    name: "Kiehl Sanikal-eco",
    category: "chemistry",
    description: "Кислотно- и хлорсвободный слабощелочной очиститель (концентрат pH 9, рабочий раствор ~pH 7) от известковых и мыльных отложений",
    ph: 9.0,
    compatibleSurfaces: ["bathroom"],
    prohibitedSurfaces: ["marble", "limestone"],
    status: "published",
  },
  {
    id: "prod-kiehl-tablefit",
    brandId: "kiehl",
    slug: "kiehl-tablefit",
    name: "Kiehl Tablefit",
    category: "chemistry",
    description: "Готовый пятновыводитель (pH 9.5) для маркера, клея и загрязнений на твёрдых поверхностях",
    ph: 9.5,
    compatibleSurfaces: ["window", "floor"],
    prohibitedSurfaces: ["upholstery", "natural_wood", "silk"],
    status: "published",
  },
  {
    id: "prod-kiehl-torvan",
    brandId: "kiehl",
    slug: "kiehl-torvan-concentrate",
    name: "Kiehl Torvan Concentrate",
    category: "chemistry",
    description: "Нейтральный клинер для регулярной уборки (концентрат pH 9.5, в растворе ~pH 7.5) — без разводов и липкого слоя",
    ph: 9.5,
    compatibleSurfaces: ["floor", "window", "kitchen", "bathroom"],
    status: "published",
  },
  {
    id: "prod-kiehl-omnifresh",
    brandId: "kiehl",
    slug: "kiehl-omni-fresh",
    name: "Kiehl Omni-fresh",
    category: "chemistry",
    description: "Микробиологический нейтрализатор запахов (pH 9) для текстиля, обивки, полов и сточных точек — без CLP-маркировки",
    ph: 9.0,
    compatibleSurfaces: ["upholstery", "carpet", "floor", "bathroom"],
    prohibitedSurfaces: ["silk"],
    status: "published",
  },
  {
    id: "prod-kiehl-grassetplus",
    brandId: "kiehl",
    slug: "kiehl-grasset-plus",
    name: "Kiehl Grasset-plus",
    category: "chemistry",
    description: "Щелочной обезжириватель (pH 11) растительных и животных жиров для кухонь и пищевых зон",
    ph: 11.0,
    compatibleSurfaces: ["kitchen"],
    prohibitedSurfaces: ["upholstery", "natural_wood", "aluminum"],
    status: "published",
  },
  {
    id: "prod-kiehl-carpacryl",
    brandId: "kiehl",
    slug: "kiehl-carp-acryl",
    name: "Kiehl Carp-Acryl",
    category: "chemistry",
    description: "Ковровый шампунь (pH 8) с защитой ворса и антизагрязняющим эффектом — пена собирает грязь и убирается пылесосом",
    ph: 8.0,
    compatibleSurfaces: ["carpet", "floor"],
    prohibitedSurfaces: ["upholstery", "leather", "silk"],
    status: "published",
  },
  {
    id: "prod-ecolab-odor",
    brandId: "ecolab",
    slug: "ecolab-bio-enzymatic-odor",
    name: "Ecolab Bio-Enzymatic Odor Eliminator",
    category: "chemistry",
    description: "Био-энзимный нейтрализатор запахов (моча, животные, мусор) для твёрдых и мягких поверхностей",
    compatibleSurfaces: ["mattress", "carpet", "upholstery", "floor"],
    prohibitedSurfaces: ["leather", "silk"],
    status: "published",
  },
];

export interface SeedCampaign {
  id: string;
  brandId: string;
  productId?: string;
  name: string;
  placement: AdPlacement;
  status: CampaignStatus;
  startsAt?: number;
  endsAt?: number;
  targetCountries?: string[];
  targetCategories?: string[];
  targetSurfaces?: string[];
  targetSolutions?: string[];
  maxImpressions?: number;
  maxClicks?: number;
  currentImpressions: number;
  currentClicks: number;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  ctaType: AdCtaType;
  badgeText?: string;
  /** Токен маркировки erid (ОРД) — без него кампания не показывается в РФ */
  erid?: string;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  mediaPoster?: string;
  mediaAlt?: string;
  /** Промокод дилера — выводится чипом в дилерских слотах */
  promoCode?: string;
  priority: number;
}

/**
 * Шаблоны кампаний для разработки рекламных слотов. Все в статусе draft: реальные бренды
 * с маркировкой «Реклама» и внешними ссылками публикуются только после подписанного договора.
 */
export const seedCampaigns: SeedCampaign[] = [
  {
    id: "camp-prochem-stainpro",
    brandId: "prochem",
    productId: "prod-prochem-stainpro",
    name: "Prochem Stain Pro (Решения / Текстиль)",
    placement: "solution.sponsored_product",
    status: "draft",
    startsAt: 1767225600000, // 2026-01-01
    endsAt: 1798761599000,   // 2026-12-31
    targetCountries: ["BY", "RU", "KZ"],
    targetSurfaces: ["upholstery", "carpet"],
    targetSolutions: ["vino-na-divane", "kofe-na-tekstile"],
    currentImpressions: 0,
    currentClicks: 0,
    title: "Prochem Stain Pro — проверенный пятновыводитель для обивки и ковров",
    description: "Щелочной состав pH 10.5 для белковых и пищевых пятен: вино, кровь, кофе, еда. Тест на незаметном участке перед применением.",
    ctaText: "Где купить",
    ctaUrl: "https://www.prochem.co.uk/",
    ctaType: "where_to_buy",
    badgeText: "Спонсорский проверенный вариант",
    priority: 10,
  },
  {
    id: "camp-grass-offices",
    brandId: "grass",
    name: "GRASS Professional — генеральный партнёр категории офисов",
    placement: "rating.category_partner",
    status: "draft",
    startsAt: 1767225600000, // 2026-01-01
    endsAt: 1798761599000,   // 2026-12-31
    targetCategories: ["offices"],
    targetCountries: ["BY", "RU", "KZ"],
    currentImpressions: 340,
    currentClicks: 28,
    title: "GRASS Professional — комплексная химия и диспенсерные системы для офисов",
    description: "Специальные условия и контрактные цены для клининговых компаний и корпоративных клиентов.",
    ctaText: "Запросить оптовый прайс",
    ctaUrl: "https://grass.su",
    ctaType: "request_quote",
    badgeText: "Партнёр категории",
    priority: 10,
  },
  {
    id: "camp-karcher-home",
    brandId: "karcher",
    name: "Kärcher — партнёр сезона чистоты ChistoLab",
    placement: "home.editorial_partner",
    status: "draft",
    startsAt: 1767225600000, // 2026-01-01
    endsAt: 1798761599000,   // 2026-12-31
    targetCountries: ["BY", "RU", "KZ"],
    currentImpressions: 890,
    currentClicks: 72,
    title: "Kärcher — эталон немецких технологий чистоты",
    description: "Профессиональные экстракторы и пароочистители с сервисной поддержкой в Беларуси, России и Казахстане.",
    ctaText: "Найти авторизованный центр",
    ctaUrl: "https://karcher.by",
    ctaType: "where_to_buy",
    badgeText: "Партнёр сезона",
    priority: 10,
  },
];

export const seedAffiliateProducts: AffiliateProduct[] = [
  {
    id: "p-prochem-stainpro",
    slug: "prochem-stain-pro",
    brandId: "prochem",
    name: "Prochem Stain Pro",
    category: "chemistry",
    badge: "Выбор профи",
    pros: ["Белковые и пищевые пятна", "Вино и кофе в списке применения", "Сайт производителя"],
    affiliateUrl: "https://www.prochem.co.uk/",
  },
  {
    id: "p1",
    slug: "karcher-puzzi-10-1",
    brandId: "karcher",
    name: "Kärcher Puzzi 10/1",
    category: "extractors",
    badge: "Выбор профи",
    pros: ["Экстракция за 1 проход", "Бак 10 л", "Для ковров и мебели"],
    affiliateUrl: "https://www.karcher.by/puzzi-10-1",
  },
  {
    id: "p2",
    slug: "grass-azelit-gel",
    brandId: "grass",
    name: "Grass Azelit-Gel",
    category: "chemistry",
    badge: "Хит продаж",
    pros: ["Нагар и копоть на кухне", "Щелочной гель pH 11–12", "Не для алюминия и хрома"],
    affiliateUrl: "https://grass.by/",
  },
  {
    id: "p3",
    slug: "dreame-l10s-pro",
    brandId: "dreame",
    name: "Dreame L10s Pro",
    category: "robots",
    badge: "Новинка",
    pros: ["Сухая и влажная уборка", "Самоочистка станции", "Умное картирование"],
    affiliateUrl: "https://www.onliner.by/catalog/dreame/l10s-pro",
  },
  {
    id: "p4",
    slug: "vileda-windomatic-power",
    brandId: "vileda-pro",
    name: "Vileda Windomatic Power",
    category: "windows",
    pros: ["Бесшнуровой оконный пылесос", "Сбор воды без разводов", "Окна, зеркала и душевые"],
    affiliateUrl: "https://www.vileda-professional.com/",
  },
  {
    id: "p5",
    slug: "ecolab-bio-enzymatic-odor",
    brandId: "ecolab",
    name: "Ecolab Bio-Enzymatic Odor Eliminator",
    category: "chemistry",
    pros: ["Ферментный нейтрализатор запахов", "Моча, животные, мусор", "Твёрдые и мягкие поверхности"],
    affiliateUrl: "https://www.ecolab.com/",
  },
  {
    id: "p6",
    slug: "bosch-gas-18v",
    brandId: "bosch",
    name: "Bosch GAS 18V-10 L",
    category: "extractors",
    pros: ["Аккумуляторный, без шнура", "Компактный корпус", "Для офисной уборки"],
    affiliateUrl: "https://www.bosch-professional.com/by/ru/gas-18v-10-l",
  },
  {
    id: "p7",
    slug: "dyson-v15-detect",
    brandId: "dyson",
    name: "Dyson V15 Detect",
    category: "robots",
    badge: "Выбор профи",
    pros: ["Лазерная подсветка пыли", "До 60 мин работы", "HEPA-фильтрация"],
    affiliateUrl: "https://www.21vek.by/dyson/v15-detect",
  },
];


