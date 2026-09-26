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
    priceFrom: 6,
    priceUnit: "м²",
    experienceYears: 7,
    tags: ["Работает по договору", "7+ лет на рынке", "350+ клиентов"],
    guarantees: ["Фиксированная цена по договору"],
    verified: true,
    // Демо-спонсор: показывает золотую плашку «Спонсор» в каталоге. На оценку не влияет.
    promoted: true,
    categories: ["offices", "post-renovation", "deep-cleaning", "windows", "upholstery", "apartments"],
    equipment: ["karcher"],
    ratingSource: "google",
    rating: { source: "google", sourceUrl: "https://www.google.com/maps", rating: 4.8, reviewCount: 12 },
  },
  {
    id: "freshclean",
    slug: "freshclean",
    name: "FreshClean",
    city: "Минск",
    description:
      "Уборка квартир, домов, офисов и коммерческой недвижимости по всей Беларуси. Итоговая стоимость рассчитывается индивидуально в зависимости от площади и степени загрязнения.",
    websiteUrl: "https://freshclean.by",
    phone: "+375 25 525-76-10",
    email: "info@freshclean.by",
    priceFrom: 3,
    priceUnit: "м²",
    experienceYears: 5,
    tags: ["Работает по всей Беларуси", "Индивидуальный расчёт стоимости"],
    verified: true,
    promoted: false,
    categories: ["apartments", "offices", "post-renovation", "deep-cleaning"],
    equipment: [],
    ratingSource: "yandex",
    rating: { source: "yandex", sourceUrl: "https://yandex.by/maps", rating: 4.5, reviewCount: 8 },
  },
  {
    id: "kitt",
    slug: "chistiy-kit",
    name: "Чистый Кит (CleanWhale)",
    city: "Минск",
    description:
      "Уборка квартир, мойка окон, химчистка и уборка после ремонта в Минске. Работает по системе онлайн-бронирования с выбором клинера; регулярная уборка обходится дешевле разовой.",
    websiteUrl: "https://kitt.by",
    priceFrom: 94.99,
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
    priceFrom: 100,
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
    tags: ["Регулярная уборка", "Выезд день в день"],
    verified: false,
    promoted: false,
    categories: ["apartments", "post-renovation", "upholstery"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "skyclean",
    slug: "skyclean",
    name: "SkyClean",
    city: "Минск",
    description:
      "Уборка квартир, коттеджей и офисов в Минске и Минской области. Работа строго по предварительной записи, застрахованная ответственность.",
    websiteUrl: "https://skyclean.by",
    phone: "+375 29 66 33 555",
    email: "info@skyclean.by",
    priceFrom: 100,
    experienceYears: 10,
    tags: ["Минск и область", "Опыт более 10 лет", "Застрахованная ответственность"],
    verified: false,
    promoted: false,
    categories: ["apartments", "offices", "deep-cleaning", "post-renovation", "windows", "upholstery"],
    equipment: ["karcher", "vileda-pro"],
    ratingSource: "unverified",
  },
  {
    id: "sauber",
    slug: "sauber",
    name: "SAUBER GRUPPE",
    city: "Минск",
    address: "ул. Ленина, 50",
    description:
      "Клининговая компания в Минске: уборка квартир и офисов, после ремонта, мойка окон и химчистка. Более 9 300 выполненных уборок с 2019 года.",
    websiteUrl: "https://sauber.space",
    phone: "+375 29 723-88-88",
    priceFrom: 18,
    priceUnit: "окно",
    experienceYears: 6,
    tags: ["9300+ уборок с 2019 года", "Калькулятор цены на сайте"],
    verified: false,
    promoted: false,
    categories: ["offices", "post-renovation", "deep-cleaning", "windows", "upholstery"],
    equipment: [],
    ratingSource: "google",
    rating: { source: "google", sourceUrl: "https://zoon.by/minsk/utility_service/kliningovaya_kompaniya_sauber/", rating: 4.6, reviewCount: 24 },
  },
  // --- Новые компании из веб-исследования ---
  {
    id: "ladyclean",
    slug: "ladyclean",
    name: "LADYCLEAN",
    city: "Минск",
    description:
      "Клининговая компания Минска с 2020 года. Генеральная уборка, уборка после ремонта, химчистка мебели, мойка окон и офисов. ISO 9001:2015, 50+ клинеров, более 1000 клиентов.",
    websiteUrl: "https://ladyclean.by",
    phone: "+375 33 682-11-00",
    priceFrom: 64,
    experienceYears: 4,
    tags: ["ISO 9001:2015", "50+ клинеров", "Выезд за 2 часа", "Круглосуточно"],
    guarantees: ["Гарантия 100%", "Сертификат ISO 9001:2015"],
    verified: false,
    promoted: false,
    categories: ["apartments", "deep-cleaning", "post-renovation", "upholstery", "windows", "offices"],
    equipment: [],
    ratingSource: "unverified",
  },
  {
    id: "cleanoff",
    slug: "cleanoff",
    name: "CleanOFF",
    legalName: "ООО КлинОфф",
    city: "Минск",
    address: "ул. К. Цеткин, 51, пом. 9B",
    description:
      "Профессиональный клининг офисов и коммерческих помещений в Минске. Регулярная и генеральная уборка, уборка после ремонта, мойка окон, химчистка. Более 200 клиентов, безналичный расчёт.",
    websiteUrl: "https://cleanoff.by",
    phone: "+375 29 125-09-09",
    priceFrom: 120.9,
    priceUnit: "BYN/мес",
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
    priceFrom: 5,
    priceUnit: "м²",
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
    city: "Минск",
    address: "пр-т Газеты Звязда, 16, пом. 57",
    description:
      "Клининговая компания в Минске и Минской области. Уборка квартир, домов, коттеджей, офисов и производственных помещений. Химчистка ковров и мягкой мебели с выездом.",
    websiteUrl: "https://gryazi-net.by",
    phone: "+375 29 980-33-68",
    priceFrom: 2,
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
      "Клининг для бизнеса в Минске с 2019 года. Регулярная и генеральная уборка офисов, уборка после ремонта, сезонная мойка окон. Более 1000 клиентов, работаем с помещениями до 2000+ м².",
    websiteUrl: "https://nesoda.by",
    phone: "+375 29 700 99 70",
    email: "info@nesoda.by",
    priceFrom: 20,
    priceUnit: "м²",
    experienceYears: 5,
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
    priceFrom: 2,
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
  status: "draft" | "published" | "archived";
}

export interface SeedSolutionProduct {
  id: string;
  solutionId: string;
  brandId?: string;
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
    diyCostNote: "0 – 15 BYN (салфетки, мыльная пена, микрофибра)",
    proTimeNote: "30 – 50 минут (химчистка на дому)",
    searchKeywords: ["вино на диване", "красное вино", "пятно от вина", "шенилл", "вино обивка", "пятновыводитель вино"],
    relatedCategory: "upholstery",
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
    diyCostNote: "5 – 25 BYN (энзимный спрей)",
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
    diyCostNote: "2 – 10 BYN (перекись водорода, сода)",
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
    diyCostNote: "20 – 40 BYN (энзимный уничтожитель запаха)",
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
    diyCostNote: "30 – 70 BYN (профессиональный смыватель затирки + пад)",
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
    diyCostNote: "15 – 35 BYN (спрей-антискотч + скребок с лезвием)",
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
    diyCostNote: "15 – 30 BYN (профессиональный обезжириватель)",
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
    diyCostNote: "15 – 30 BYN (кислотный гель + резиновый сгон)",
    proTimeNote: "40 – 60 минут",
    searchKeywords: ["водный камень", "известковый налет", "душевая кабина", "налет на стекле", "помыть душевую"],
    relatedCategory: "deep-cleaning",
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
    diyCostNote: "30 – 50 BYN (мешки, салфетки, базовые средства)",
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
    diyCostNote: "50 – 100 BYN (аренда бытового осушителя)",
    proTimeNote: "1 – 3 суток осушения + озонирование 2 часа",
    searchKeywords: ["затопили квартиру", "запах сырости", "плесень после потопа", "просушка квартиры", "озонирование"],
    relatedCategory: "deep-cleaning",
    status: "published",
  },
];

export const seedSolutionProducts: SeedSolutionProduct[] = [
  { id: "sp-1", solutionId: "vino-na-divane", brandId: "kiehl", role: "recommended", note: "Kiehl Arenas-exet 3 (удаление танинов и растительных пигментов)" },
  { id: "sp-2", solutionId: "vino-na-divane", brandId: "prochem", role: "alternative", note: "Prochem Stain Pro (нейтрализатор пятен)" },
  { id: "sp-3", solutionId: "kofe-na-tekstile", brandId: "prochem", role: "recommended", note: "Prochem Coffee Stain Remover" },
  { id: "sp-4", solutionId: "kofe-na-tekstile", brandId: "kiehl", role: "alternative", note: "Kiehl Omniclean" },
  { id: "sp-5", solutionId: "krov-na-matrase", brandId: "prochem", role: "recommended", note: "Prochem Stain Pro (щелочной энзимный комплекс)" },
  { id: "sp-6", solutionId: "krov-na-matrase", brandId: "ecolab", role: "alternative", note: "Ecolab Taxat Clean" },
  { id: "sp-7", solutionId: "mocha-i-zapah-matras", brandId: "prochem", role: "recommended", note: "Prochem Urine Neutraliser" },
  { id: "sp-8", solutionId: "mocha-i-zapah-matras", brandId: "ecolab", role: "alternative", note: "Ecolab OdoGone" },
  { id: "sp-9", solutionId: "poslestroy-zatirka-plitka", brandId: "kiehl", role: "recommended", note: "Kiehl Powerfix-Gel (кислотный очиститель остатков цемента)" },
  { id: "sp-10", solutionId: "poslestroy-zatirka-plitka", brandId: "grass", role: "alternative", note: "Grass Cement Cleaner" },
  { id: "sp-11", solutionId: "poslestroy-okna-skotch", brandId: "kiehl", role: "recommended", note: "Kiehl Tablefit (растворитель синтетических смол и скотча)" },
  { id: "sp-12", solutionId: "poslestroy-okna-skotch", brandId: "grass", role: "alternative", note: "Grass Antigraffiti" },
  { id: "sp-13", solutionId: "zhir-vytyazhka-kuhnya", brandId: "grass", role: "recommended", note: "Grass Azelit Professional (мощный щелочной антижир)" },
  { id: "sp-14", solutionId: "zhir-vytyazhka-kuhnya", brandId: "kiehl", role: "alternative", note: "Kiehl Grasset-plus" },
  { id: "sp-15", solutionId: "vodny-kamen-dushevaya", brandId: "kiehl", role: "recommended", note: "Kiehl Sanikal-eco (экологичный гель против водного камня)" },
  { id: "sp-16", solutionId: "vodny-kamen-dushevaya", brandId: "grass", role: "alternative", note: "Grass Gloss (кислотный клинер для ванн)" },
  { id: "sp-17", solutionId: "uborka-ofisa-posle-korporativa", brandId: "vileda-pro", role: "recommended", note: "Vileda UltraSpeed Pro (профессиональный моп и система отжима)" },
  { id: "sp-18", solutionId: "uborka-ofisa-posle-korporativa", brandId: "bosch", role: "alternative", note: "Bosch Professional GAS (промышленный пылесос)" },
  { id: "sp-19", solutionId: "zapah-syrosti-posle-potopa", brandId: "karcher", role: "recommended", note: "Kärcher NT 30/1 (профессиональный водосос)" },
  { id: "sp-20", solutionId: "zapah-syrosti-posle-potopa", brandId: "prochem", role: "alternative", note: "Prochem Odour Fresh (деструктор запаха сырости)" },
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

  // Сметы по категориям для быстрого вывода
  { id: "pe-cat-1", categoryId: "apartments", countryCode: "BY", city: "Минск", currency: "BYN", priceMin: 80, priceMax: 200, unit: "уборка", note: "Поддерживающая уборка 1–3-комнатной квартиры" },
  { id: "pe-cat-2", categoryId: "apartments", countryCode: "RU", city: "Москва", currency: "RUB", priceMin: 3000, priceMax: 8000, unit: "уборка", note: "Уборка квартиры" },
  { id: "pe-cat-3", categoryId: "apartments", countryCode: "KZ", city: "Алматы", currency: "KZT", priceMin: 15000, priceMax: 40000, unit: "уборка", note: "Уборка жилых помещений" },
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
  status: "draft" | "published" | "archived";
}

export const seedProducts: SeedProduct[] = [
  {
    id: "prod-kiehl-arenas",
    brandId: "kiehl",
    slug: "kiehl-arenas-exet-3",
    name: "Kiehl Arenas-exet 3",
    category: "chemistry",
    description: "Профессиональный пятновыводитель для удаления таниновых и растительных пятен (вино, кофе, чай) с текстиля",
    ph: 7.0,
    compatibleSurfaces: ["upholstery", "carpet", "mattress"],
    prohibitedSurfaces: ["leather"],
    status: "published",
  },
  {
    id: "prod-prochem-stainpro",
    brandId: "prochem",
    slug: "prochem-stain-pro",
    name: "Prochem Stain Pro",
    category: "chemistry",
    description: "Энзимный нейтрализатор и пятновыводитель для белковых и пищевых пятен (кровь, молоко, еда)",
    ph: 8.5,
    compatibleSurfaces: ["upholstery", "carpet", "mattress"],
    prohibitedSurfaces: ["silk"],
    status: "published",
  },
  {
    id: "prod-grass-cement",
    brandId: "grass",
    slug: "grass-cement-cleaner",
    name: "Grass Cement Cleaner",
    category: "chemistry",
    description: "Кислотный концентрат для удаления остатков цемента, строительной затирки и солевых высолов",
    ph: 1.5,
    compatibleSurfaces: ["floor", "bathroom"],
    prohibitedSurfaces: ["upholstery", "carpet", "mattress", "marble"],
    status: "published",
  },
  {
    id: "prod-grass-azelit",
    brandId: "grass",
    slug: "grass-azelit-pro",
    name: "Grass Azelit Professional",
    category: "chemistry",
    description: "Концентрированное щелочное средство для удаления застарелого нагара и жира",
    ph: 11.5,
    compatibleSurfaces: ["kitchen"],
    prohibitedSurfaces: ["upholstery", "carpet", "mattress", "aluminum", "natural_wood"],
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
  priority: number;
}

export const seedCampaigns: SeedCampaign[] = [
  {
    id: "camp-kiehl-upholstery",
    brandId: "kiehl",
    productId: "prod-kiehl-arenas",
    name: "Kiehl Arenas-exet 3 (Решения / Текстиль)",
    placement: "solution.sponsored_product",
    status: "active",
    startsAt: 1767225600000, // 2026-01-01
    endsAt: 1798761599000,   // 2026-12-31
    targetCountries: ["BY", "RU", "KZ"],
    targetSurfaces: ["upholstery", "carpet"],
    targetSolutions: ["vino-na-divane", "kofe-na-tekstile"],
    currentImpressions: 120,
    currentClicks: 14,
    title: "Kiehl Arenas-exet 3 — доказанная формула удаления танинов",
    description: "Нейтральный состав pH 7.0 для велюра, шенилла и рогожки. Безопасен для волокон и цвета обивки.",
    ctaText: "Купить у официального дилера",
    ctaUrl: "https://kiehl.ru",
    ctaType: "where_to_buy",
    badgeText: "Спонсорский проверенный вариант",
    priority: 10,
  },
  {
    id: "camp-grass-offices",
    brandId: "grass",
    name: "GRASS Professional — генеральный партнёр категории офисов",
    placement: "rating.category_partner",
    status: "active",
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
    name: "Kärcher — партнёр сезона чистоты CLEANHUB",
    placement: "home.editorial_partner",
    status: "active",
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


