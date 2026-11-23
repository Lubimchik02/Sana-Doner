// src/config/brand.ts
// ─────────────────────────────────────────────────────────────
// ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ ДЛЯ БИЗНЕСА
// Меняете тут — меняется весь сайт. Ничего не хардкодим в компонентах.
// Меню и цены — с бумажного меню Sana Doner (Актобе), ноябрь 2026.
// ─────────────────────────────────────────────────────────────

/* ───────────── Режим работы ───────────── */

/**
 * true  — интерактивная презентация (заказы не отправляются, показываем демо-окна)
 * false — боевой режим (заказы уходят в Telegram по токенам из .env)
 * Переключается одной переменной NEXT_PUBLIC_DEMO_MODE в .env
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/* ───────────── Типы ───────────── */

export type MenuDirection = "classic" | "healthy";

export type Tag = "hit" | "new" | "spicy" | "deal" | "green" | "protein";

export interface Nutrition {
  kcal: number;
  protein: number; // г
  fat: number; // г
  carbs: number; // г
}

export interface DishVariant {
  id: string; // уникален внутри блюда
  label: string; // "Өлшем 1", "Өлшем 1,5", "0,5 л", "Zero"
  price: number; // ₸
  weight?: string;
  nutrition?: Nutrition;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  image: string; // путь в /public/images/menu/...
  variants: DishVariant[]; // готовые версии, без конструктора
  tags?: Tag[];
  available?: boolean; // false — «временно нет», карточка серая
}

export interface MenuCategory {
  id: string;
  title: string;
  emoji?: string;
  dishes: Dish[];
}

export interface DirectionTheme {
  /** Градиент фона страницы (from → to) */
  bgFrom: string;
  bgTo: string;
  /** Основной акцент: кнопки, активные табы, цены */
  accent: string;
  /** Мягкий акцент: бейджи, ховеры */
  accentSoft: string;
  /** Текст на акцентных кнопках */
  onAccent: string;
  /** Цвет заголовков и текста прямо на фоне страницы */
  fg: string;
  /** Приглушённый текст на фоне страницы */
  fgMuted: string;
}

export interface MenuSection {
  direction: MenuDirection;
  title: string;
  subtitle: string;
  theme: DirectionTheme;
  categories: MenuCategory[];
}

export interface DeliveryZone {
  name: string;
  freeFrom: number; // бесплатно от суммы, ₸
  price: number; // стоимость доставки ниже порога, ₸
  eta: string;
}

/* ───────────── Бренд и контакты ───────────── */

export const brand = {
  name: "Sana Doner",
  slogan: "Jana dengeidegi dam",
  description: "Донер на вертеле в Актобе: классика, комбо до 20% выгоднее и фитнес-меню.",
  city: "Актобе",
  timeZone: "Asia/Aqtobe",
  currency: "₸",
  locale: "ru-KZ",

  contacts: {
    phone: "+7 700 419 2020",
    phoneRaw: "+77004192020", // для tel:
    whatsapp: "77004192020", // для wa.me — проверьте, что на номере есть WhatsApp
    instagram: "sanadoner_aktobe",
    twoGis: "https://2gis.kz/aktobe/search/Sana%20Doner", // TODO: заменить на прямую ссылку филиала
  },

  pickup: {
    address: "Актобе, пр. Тәуелсіздік, 11а",
    hours: "Ежедневно 10:00 – 23:00", // TODO: уточнить у владельца
    lat: 50.2839, // TODO: точные координаты точки
    lng: 57.167,
    /**
     * Ссылка для iframe карты. Пусто — строится Яндекс-карта по координатам.
     * Для 2GIS: 2gis.kz → «Поделиться» → «Виджет на сайт» → вставьте src.
     */
    mapEmbed: "",
  },

  // TODO: районы и стоимость доставки — заглушки, уточнить у владельца
  delivery: {
    freeFrom: 3000,
    zones: [
      { name: "Центр", freeFrom: 3000, price: 500, eta: "25–40 мин" },
      { name: "Батыс-2", freeFrom: 3000, price: 700, eta: "35–50 мин" },
      { name: "Нур Актобе", freeFrom: 3000, price: 700, eta: "35–50 мин" },
      { name: "Жилгородок", freeFrom: 3000, price: 600, eta: "30–45 мин" },
    ] satisfies DeliveryZone[],
  },
} as const;

/* ───────────── Темы направлений ───────────── */
// Цвета взяты с бумажного меню:
//  • classic — фирменный красно-оранжевый фон + жёлтые ценники (главный цвет сайта)
//  • healthy — сине-зелёный градиент Fitness Menu

export const themes: Record<MenuDirection, DirectionTheme> = {
  classic: {
    bgFrom: "#F25C2A",
    bgTo: "#E4412B",
    accent: "#FFE01A",
    accentSoft: "#FFF3A6",
    onAccent: "#1A1A1A",
    fg: "#FFFFFF",
    fgMuted: "rgba(255,255,255,0.82)",
  },
  healthy: {
    bgFrom: "#22A9D6",
    bgTo: "#6FCF97",
    accent: "#FFE01A",
    accentSoft: "#E3F7C8",
    onAccent: "#1A1A1A",
    fg: "#FFFFFF",
    fgMuted: "rgba(255,255,255,0.88)",
  },
};

/* ───────────── Меню ───────────── */

const IMG = "/images/menu";

/** «Өлшем 1» / «Өлшем 1,5» — как на бумажном меню */
const sizes = (p1: number, p15?: number): DishVariant[] =>
  p15
    ? [
        { id: "s1", label: "Өлшем 1", price: p1 },
        { id: "s15", label: "Өлшем 1,5", price: p15 },
      ]
    : [{ id: "s1", label: "Өлшем 1", price: p1 }];

export const menu: Record<MenuDirection, MenuSection> = {
  /* ═══════════ CLASSIC MENU ═══════════ */
  classic: {
    direction: "classic",
    title: "Classic menu",
    subtitle: "Тот самый донер с вертела",
    theme: themes.classic,
    categories: [
      {
        id: "combo",
        title: "Комбо",
        emoji: "🔥",
        dishes: [
          {
            id: "combo-doner-beef",
            name: "Комбо донер · Сиыр еті",
            description: "Донер с говядиной + картоп фри + Coca-Cola + соус",
            image: `${IMG}/combo-doner-beef.webp`,
            tags: ["deal"],
            variants: sizes(3490, 3690),
          },
          {
            id: "combo-doner-chicken",
            name: "Комбо донер · Тауық еті",
            description: "Донер с курицей + картоп фри + Coca-Cola + соус",
            image: `${IMG}/combo-doner-chicken.webp`,
            tags: ["deal", "hit"],
            variants: sizes(3090, 3390),
          },
          {
            id: "combo-doner-mix",
            name: "Комбо донер · Ассорти",
            description: "Донер ассорти + картоп фри + Coca-Cola + соус",
            image: `${IMG}/combo-doner-mix.webp`,
            tags: ["deal"],
            variants: sizes(3390, 3590),
          },
          {
            id: "combo-baget-beef",
            name: "Комбо багет · Сиыр еті",
            description: "Багет с говядиной + картоп фри + Coca-Cola + соус",
            image: `${IMG}/combo-baget-beef.webp`,
            tags: ["deal"],
            variants: sizes(3390),
          },
          {
            id: "combo-baget-chicken",
            name: "Комбо багет · Тауық еті",
            description: "Багет с курицей + картоп фри + Coca-Cola + соус",
            image: `${IMG}/combo-baget-chicken.webp`,
            tags: ["deal"],
            variants: sizes(3190),
          },
          {
            id: "combo-baget-mix",
            name: "Комбо багет · Ассорти",
            description: "Багет ассорти + картоп фри + Coca-Cola + соус",
            image: `${IMG}/combo-baget-mix.webp`,
            tags: ["deal"],
            variants: sizes(3290),
          },
        ],
      },
      {
        id: "doner",
        title: "Донер",
        emoji: "🌯",
        dishes: [
          {
            id: "doner-beef",
            name: "Донер · Сиыр еті",
            description: "Говядина с вертела в лаваше на гриле",
            image: `${IMG}/classic-doner-beef.webp`,
            variants: sizes(2090, 2290),
          },
          {
            id: "doner-chicken",
            name: "Донер · Тауық еті",
            description: "Курица с вертела в лаваше на гриле",
            image: `${IMG}/classic-doner-chicken.webp`,
            tags: ["hit"],
            variants: sizes(1790, 1990),
          },
          {
            id: "doner-mix",
            name: "Донер · Ассорти",
            description: "Говядина и курица с вертела в лаваше на гриле",
            image: `${IMG}/classic-doner-mix.webp`,
            variants: sizes(1990, 2190),
          },
        ],
      },
      {
        id: "baget",
        title: "Багет",
        emoji: "🥖",
        dishes: [
          {
            id: "baget-beef",
            name: "Багет · Сиыр еті",
            description: "Говядина с вертела в хрустящем багете",
            image: `${IMG}/classic-baget-beef.webp`,
            variants: sizes(2090),
          },
          {
            id: "baget-chicken",
            name: "Багет · Тауық еті",
            description: "Курица с вертела в хрустящем багете",
            image: `${IMG}/classic-baget-chicken.webp`,
            variants: sizes(1890),
          },
          {
            id: "baget-mix",
            name: "Багет · Ассорти",
            description: "Говядина и курица в хрустящем багете",
            image: `${IMG}/classic-baget-mix.webp`,
            variants: sizes(1990),
          },
        ],
      },
      {
        id: "sides",
        title: "Закуски",
        emoji: "🍟",
        dishes: [
          {
            id: "nuggets",
            name: "Наггетсы",
            description: "8 штук",
            image: `${IMG}/nuggets.webp`,
            tags: ["hit"],
            variants: [{ id: "8", label: "8 дана", price: 1490 }],
          },
          {
            id: "fries",
            name: "Картоп фри",
            description: "Хрустящий картофель фри",
            image: `${IMG}/fries.webp`,
            tags: ["hit"],
            variants: [{ id: "std", label: "Порция", price: 890 }],
          },
          {
            id: "wedges",
            name: "Картоп долька",
            description: "Картофельные дольки",
            image: `${IMG}/fries.webp`, // TODO: своё фото
            variants: [{ id: "std", label: "Порция", price: 890 }],
          },
        ],
      },
      {
        id: "sauces",
        title: "Соусы и добавки",
        emoji: "🥫",
        dishes: [
          { id: "sauce-cheese", name: "Соус сырный", description: "Доп. соус", image: `${IMG}/sauce.webp`, variants: [{ id: "std", label: "1 шт", price: 150 }] },
          { id: "sauce-tomato", name: "Соус томатный", description: "Доп. соус", image: `${IMG}/sauce.webp`, variants: [{ id: "std", label: "1 шт", price: 150 }] },
          { id: "sauce-white", name: "Соус белый", description: "Доп. соус", image: `${IMG}/sauce.webp`, variants: [{ id: "std", label: "1 шт", price: 150 }] },
          { id: "sauce-fitness", name: "Соус фитнес", description: "Доп. соус", image: `${IMG}/sauce.webp`, tags: ["green"], variants: [{ id: "std", label: "1 шт", price: 150 }] },
          { id: "pepper", name: "Перчик / халапеньо", description: "Острая добавка", image: `${IMG}/sauce.webp`, tags: ["spicy"], variants: [{ id: "std", label: "1 шт", price: 100 }] },
          { id: "kraft-bag", name: "Крафт пакет", description: "Пакет для заказа с собой", image: `${IMG}/sauce.webp`, variants: [{ id: "std", label: "1 шт", price: 150 }] },
        ],
      },
      {
        id: "drinks",
        title: "Сусындар",
        emoji: "🥤",
        dishes: [
          {
            id: "coca-cola",
            name: "Coca-Cola",
            description: "0,5 л",
            image: `${IMG}/cola.webp`,
            variants: [
              { id: "classic", label: "Classic", price: 650 },
              { id: "zero", label: "Zero", price: 650 },
            ],
          },
          { id: "sprite", name: "Sprite", description: "0,5 л", image: `${IMG}/cola.webp`, variants: [{ id: "05", label: "0,5 л", price: 650 }] },
          { id: "fanta", name: "Fanta", description: "0,5 л", image: `${IMG}/cola.webp`, variants: [{ id: "05", label: "0,5 л", price: 650 }] },
          {
            id: "fuse-tea",
            name: "Fuse Tea",
            description: "0,5 л · выберите вкус",
            image: `${IMG}/cola.webp`,
            variants: [
              { id: "mango-pineapple", label: "Манго-ананас", price: 650 },
              { id: "peach", label: "Персик", price: 650 },
              { id: "berry", label: "Ягодный", price: 650 },
              { id: "lemon", label: "Лимон", price: 650 },
              { id: "mango-chamomile", label: "Манго-ромашка", price: 650 },
            ],
          },
          { id: "bonaqua", name: "BonAqua", description: "0,5 л", image: `${IMG}/cola.webp`, variants: [{ id: "05", label: "0,5 л", price: 400 }] },
          { id: "ayran", name: "Айран", description: "0,2 л", image: `${IMG}/cola.webp`, variants: [{ id: "02", label: "0,2 л", price: 450 }] },
        ],
      },
    ],
  },

  /* ═══════════ FITNESS MENU ═══════════ */
  healthy: {
    direction: "healthy",
    title: "Fitness menu",
    subtitle: "Green: больше свежих овощей и соус фитнес",
    theme: themes.healthy,
    categories: [
      {
        id: "fit-doner",
        title: "Фитнес-донер",
        emoji: "🥬",
        dishes: [
          {
            id: "fit-doner-beef",
            name: "Фитнес-донер · Сиыр еті",
            description: "Говядина, свежие овощи, соус фитнес",
            image: `${IMG}/fit-doner-beef.webp`,
            tags: ["green"],
            variants: sizes(2090, 2290),
          },
          {
            id: "fit-doner-chicken",
            name: "Фитнес-донер · Тауық еті",
            description: "Курица, свежие овощи, соус фитнес",
            image: `${IMG}/fit-doner-chicken.webp`,
            tags: ["green", "hit"],
            variants: sizes(1790, 1990),
          },
          {
            id: "fit-doner-mix",
            name: "Фитнес-донер · Ассорти",
            description: "Говядина и курица, свежие овощи, соус фитнес",
            image: `${IMG}/fit-doner-mix.webp`,
            tags: ["green"],
            variants: sizes(1990, 2190),
          },
        ],
      },
      {
        id: "fit-baget",
        title: "Фитнес-багет",
        emoji: "🥖",
        dishes: [
          {
            id: "fit-baget-beef",
            name: "Фитнес-багет · Сиыр еті",
            description: "Говядина, свежие овощи, соус фитнес",
            image: `${IMG}/fit-baget-beef.webp`,
            tags: ["green"],
            variants: sizes(2190),
          },
          {
            id: "fit-baget-chicken",
            name: "Фитнес-багет · Тауық еті",
            description: "Курица, свежие овощи, соус фитнес",
            image: `${IMG}/fit-baget-chicken.webp`,
            tags: ["green"],
            variants: sizes(1890),
          },
          {
            id: "fit-baget-mix",
            name: "Фитнес-багет · Ассорти",
            description: "Говядина и курица, свежие овощи, соус фитнес",
            image: `${IMG}/fit-baget-mix.webp`,
            tags: ["green"],
            variants: sizes(2090),
          },
        ],
      },
    ],
  },
};

/* ───────────── Хелперы ───────────── */

export const formatPrice = (value: number) =>
  `${value.toLocaleString("ru-RU")} ${brand.currency}`;

export const whatsappLink = (text = "") =>
  `https://wa.me/${brand.contacts.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** Плоский список всех блюд — для поиска, корзины, SEO */
export const allDishes = (Object.values(menu) as MenuSection[]).flatMap((section) =>
  section.categories.flatMap((cat) =>
    cat.dishes.map((dish) => ({ ...dish, direction: section.direction, categoryId: cat.id })),
  ),
);

export const findDish = (id: string) => allDishes.find((d) => d.id === id);
