import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Page } from "@/App";
import { ydApi } from "./yd/api";
import type { YdCampaign, YdCampaignType, YdStrategyType } from "./yd/types";
import { emptyCampaign } from "./yd/types";

interface TemplatesProps {
  onNavigate: (page: Page) => void;
}

interface CampaignTemplate {
  id: string;
  name: string;
  niche: "ecom" | "services" | "info" | "local";
  campaign_type: YdCampaignType;
  strategy: YdStrategyType;
  short: string;
  description: string;
  whyWorks: string[];
  groups: {
    name: string;
    keywords: string[];
    ads: { title1: string; title2: string; body: string }[];
  }[];
  negative_keywords: string;
  daily_budget: number;
  recommended_ctr: string;
}

const NICHE_META: Record<CampaignTemplate["niche"], { label: string; icon: string; color: string }> = {
  ecom: { label: "E-commerce", icon: "ShoppingCart", color: "hsl(185,100%,55%)" },
  services: { label: "B2B / Услуги", icon: "Briefcase", color: "hsl(260,80%,65%)" },
  info: { label: "Инфобиз / Курсы", icon: "GraduationCap", color: "hsl(30,100%,60%)" },
  local: { label: "Локальный бизнес", icon: "MapPin", color: "hsl(145,70%,50%)" },
};

const TYPE_LABEL: Record<YdCampaignType, string> = {
  text: "Поиск ЯД",
  network: "РСЯ",
  master: "Мастер кампаний",
};

const TEMPLATES: CampaignTemplate[] = [
  // ==================== E-COMMERCE ====================
  {
    id: "ecom_search_brand",
    name: "Поиск: Брендовый трафик интернет-магазина",
    niche: "ecom",
    campaign_type: "text",
    strategy: "manual_cpc",
    short: "Дешёвый горячий трафик по брендовым запросам",
    description: "Кампания для перехвата собственного брендового трафика — самые дешёвые и конверсионные клики.",
    whyWorks: [
      "CTR 15-30% — пользователи уже знают бренд",
      "Защита от конкурентов на брендовых запросах",
      "Стоимость клика в 5-10 раз ниже общих запросов",
    ],
    groups: [
      {
        name: "Брендовые запросы",
        keywords: [
          "[название бренда]",
          "[название бренда] купить",
          "[название бренда] официальный сайт",
          "[название бренда] интернет магазин",
          "[название бренда] цена",
          "[название бренда] отзывы",
        ],
        ads: [
          {
            title1: "[Бренд] — официальный магазин",
            title2: "Доставка по РФ от 1 дня",
            body: "Гарантия производителя. Скидки до 30%. Бесплатная доставка от 3000 ₽.",
          },
          {
            title1: "[Бренд] онлайн со скидкой −20%",
            title2: "Только официальный сайт",
            body: "Полный ассортимент. Все размеры в наличии. Возврат 30 дней без объяснения причин.",
          },
        ],
      },
    ],
    negative_keywords: "бесплатно, скачать, торрент, википедия, отзывы сотрудников, вакансии",
    daily_budget: 1500,
    recommended_ctr: "15-30%",
  },
  {
    id: "ecom_search_category",
    name: "Поиск: Категория товаров с минусовкой",
    niche: "ecom",
    campaign_type: "text",
    strategy: "max_clicks_with_budget",
    short: "Холодный трафик с фразами вида «купить X»",
    description: "Привлечение новой аудитории по коммерческим запросам. Чистая минусовка от информационщиков.",
    whyWorks: [
      "Высокий объём трафика — горячие коммерческие фразы",
      "Большой набор минус-слов отсекает информационные запросы",
      "Несколько посадочных под разные потребности",
    ],
    groups: [
      {
        name: "Купить — общие",
        keywords: [
          "купить [категория]",
          "[категория] цена",
          "[категория] заказать",
          "[категория] с доставкой",
          "[категория] интернет магазин",
        ],
        ads: [
          { title1: "[Категория] — большой выбор", title2: "Доставка по всей РФ", body: "Тысячи моделей в наличии. Сравнение цен. Гарантия. Возврат 30 дней." },
          { title1: "[Категория] от 990 ₽", title2: "Скидка 15% на первый заказ", body: "Промокод HELLO15. Бесплатная доставка от 3000 ₽. Постоплата." },
        ],
      },
      {
        name: "Купить — недорого",
        keywords: ["[категория] недорого", "[категория] дешево", "[категория] распродажа", "[категория] скидка"],
        ads: [
          { title1: "[Категория] — распродажа −50%", title2: "Только до конца недели", body: "Новая коллекция со скидкой. Большие размеры. Доставка завтра." },
        ],
      },
    ],
    negative_keywords:
      "бесплатно, скачать, фото, картинки, википедия, рисунок, своими руками, как сделать, инструкция, отзывы сотрудников, вакансии, работа, авито, юла",
    daily_budget: 2500,
    recommended_ctr: "5-12%",
  },
  {
    id: "ecom_rsya_retarget",
    name: "РСЯ: Возврат брошенных корзин",
    niche: "ecom",
    campaign_type: "network",
    strategy: "max_conversions",
    short: "Догон пользователей с уходом без покупки",
    description: "Ретаргетинг на пользователей, добавивших товары в корзину но не оформивших заказ.",
    whyWorks: [
      "ROI x3-5 — пользователи уже выбрали товар",
      "Скидка-промокод закрывает возражения по цене",
      "Низкая стоимость показа в РСЯ",
    ],
    groups: [
      {
        name: "Брошенная корзина — без скидки",
        keywords: [],
        ads: [
          { title1: "Вы забыли товары в корзине", title2: "Закажите сегодня", body: "Доставка завтра по всей Москве. Гарантия низкой цены. Отзывы покупателей 4.8★" },
        ],
      },
      {
        name: "Брошенная корзина — со скидкой",
        keywords: [],
        ads: [
          { title1: "Скидка 10% на ваш заказ", title2: "Промокод BACK10", body: "Действует 24 часа. Только для возврата в корзину. Бесплатная доставка." },
        ],
      },
    ],
    negative_keywords: "",
    daily_budget: 800,
    recommended_ctr: "0.4-0.8%",
  },

  // ==================== B2B / УСЛУГИ ====================
  {
    id: "services_search_b2b",
    name: "Поиск: B2B-услуги с лид-магнитом",
    niche: "services",
    campaign_type: "text",
    strategy: "target_cpa",
    short: "Заявки B2B по горячим запросам",
    description: "Конверсия в заявки через бесплатный аудит/консультацию. Оплата за достижение цели.",
    whyWorks: [
      "Лид-магнит «бесплатный аудит» снижает порог входа в 3 раза",
      "Оплата только за заявку — не за клик",
      "Минусовка от ищущих работу/курсы",
    ],
    groups: [
      {
        name: "Услуга — заказать",
        keywords: [
          "[услуга] заказать",
          "[услуга] цена",
          "[услуга] стоимость",
          "[услуга] под ключ",
          "[услуга] для бизнеса",
        ],
        ads: [
          { title1: "[Услуга] под ключ — бесплатный аудит", title2: "Расчёт стоимости за 1 час", body: "10 лет опыта. 200+ проектов. Договор. Гарантия результата. Без предоплаты." },
          { title1: "[Услуга]: фикс цена и сроки", title2: "Оставьте заявку — звоним за 15 мин", body: "Кейсы, лицензии, штат экспертов. Договор с прописанными KPI. Рассрочка 0%." },
        ],
      },
    ],
    negative_keywords: "вакансия, работа, обучение, курсы, своими руками, бесплатно, шаблон, скачать, википедия",
    daily_budget: 3000,
    recommended_ctr: "8-15%",
  },
  {
    id: "services_master",
    name: "Мастер кампаний: лидген на сайт услуг",
    niche: "services",
    campaign_type: "master",
    strategy: "max_conversions",
    short: "Авто-кампания с минимумом настроек",
    description: "Автоматическая кампания ЯД на основе сайта. Подходит для быстрого старта без опыта.",
    whyWorks: [
      "ЯД сам подбирает аудиторию по сайту",
      "Идёт сразу на Поиск и в РСЯ",
      "Рекомендуется для тестов гипотез за 1-2 недели",
    ],
    groups: [
      {
        name: "Авто-группа Мастера",
        keywords: [],
        ads: [
          { title1: "[Услуга] под ключ — без предоплаты", title2: "Бесплатная консультация", body: "Опыт 10+ лет. Кейсы, гарантия результата, договор. Звоним за 15 минут." },
        ],
      },
    ],
    negative_keywords: "вакансия, работа, обучение, курсы, своими руками",
    daily_budget: 1500,
    recommended_ctr: "—",
  },

  // ==================== ИНФОБИЗ / КУРСЫ ====================
  {
    id: "info_search_course",
    name: "Поиск: Онлайн-курс с трипваером",
    niche: "info",
    campaign_type: "text",
    strategy: "max_conversions",
    short: "Трафик на бесплатный вебинар или мини-курс",
    description: "Воронка через бесплатный продукт. Догрев → платный курс. Самая частая модель в инфобизе.",
    whyWorks: [
      "Бесплатный продукт даёт CR 12-25%",
      "Длинный цикл прогрева через email/Telegram",
      "LTV в 5-7 раз выше первого чека",
    ],
    groups: [
      {
        name: "Курс — поиск обучения",
        keywords: [
          "обучение [тема]",
          "курс [тема] онлайн",
          "[тема] с нуля",
          "[тема] обучение",
          "научиться [тема]",
        ],
        ads: [
          { title1: "Бесплатный мини-курс по [тема]", title2: "Старт сегодня — 5 уроков", body: "От практика с 8-летним опытом. Сертификат. Поддержка куратора. Доступ навсегда." },
          { title1: "[Тема] с нуля — за 14 дней", title2: "Бесплатный вебинар → программа", body: "Пошаговый план. Домашки с проверкой. Трудоустройство. Рассрочка от 990 ₽/мес." },
        ],
      },
    ],
    negative_keywords:
      "бесплатно скачать, торрент, реферат, диплом, википедия, для дошкольников, советского периода, ссср, история, биография",
    daily_budget: 2000,
    recommended_ctr: "7-14%",
  },
  {
    id: "info_rsya_warmup",
    name: "РСЯ: Прогрев аудитории курса",
    niche: "info",
    campaign_type: "network",
    strategy: "max_clicks_with_budget",
    short: "Догон холодной аудитории через статьи и кейсы",
    description: "Размещение контентных объявлений на тематических площадках для прогрева холодной аудитории.",
    whyWorks: [
      "Длинный цикл сделки → нужен прогрев",
      "Кейсы и истории успеха повышают доверие",
      "Дёшево — РСЯ показы стоят копейки",
    ],
    groups: [
      {
        name: "Прогрев — кейсы",
        keywords: [],
        ads: [
          { title1: "Как Мария вышла на 200к в месяц", title2: "Кейс ученика курса", body: "Бывшая бухгалтер сменила профессию за 4 месяца. Полная история — в статье." },
        ],
      },
      {
        name: "Прогрев — гайды",
        keywords: [],
        ads: [
          { title1: "5 ошибок начинающих в [тема]", title2: "Бесплатный гайд PDF", body: "Что мешает выйти на доход 100к+. Чек-лист на 12 страниц. Скачать сразу." },
        ],
      },
    ],
    negative_keywords: "",
    daily_budget: 1000,
    recommended_ctr: "0.3-0.7%",
  },

  // ==================== ЛОКАЛЬНЫЙ БИЗНЕС ====================
  {
    id: "local_search_geo",
    name: "Поиск: Локальный бизнес «рядом»",
    niche: "local",
    campaign_type: "text",
    strategy: "manual_cpc",
    short: "Геозависимые запросы для салона/кафе/клиники",
    description: "Перехват аудитории по запросам с географической привязкой. Узкий радиус показа.",
    whyWorks: [
      "Геозапросы конвертируются в 2-3 раза лучше",
      "Низкая конкуренция — далеко не все настраивают гео",
      "Ставка на «рядом со мной» в мобильном поиске",
    ],
    groups: [
      {
        name: "Услуга + район",
        keywords: [
          "[услуга] [район]",
          "[услуга] [метро]",
          "[услуга] рядом",
          "[услуга] недалеко",
          "[услуга] [город]",
          "[услуга] на районе",
        ],
        ads: [
          { title1: "[Услуга] на [район/метро]", title2: "Запись онлайн за 1 минуту", body: "5 минут пешком от метро. Парковка. Отзывы 4.9★. Скидка 20% при первом визите." },
          { title1: "[Услуга] рядом — открыто 24/7", title2: "Звоните прямо сейчас", body: "Без записи. Все услуги в одном месте. Опытные мастера. Гарантия качества." },
        ],
      },
    ],
    negative_keywords: "вакансия, работа, обучение, курсы, своими руками, дешево бесплатно, авито",
    daily_budget: 600,
    recommended_ctr: "10-20%",
  },
  {
    id: "local_master_quick",
    name: "Мастер кампаний: Быстрый старт локально",
    niche: "local",
    campaign_type: "master",
    strategy: "max_conversions",
    short: "Авто-кампания с гео-таргетингом",
    description: "Самый простой способ запуска для локального бизнеса. ЯД сам найдёт целевую аудиторию вокруг.",
    whyWorks: [
      "Не нужно собирать ключевые фразы",
      "Авто-настройка под Карты и Поиск",
      "Идеально для быстрого теста новой точки",
    ],
    groups: [
      {
        name: "Авто-группа",
        keywords: [],
        ads: [
          { title1: "[Бизнес] — открыты сегодня", title2: "Адрес и запись онлайн", body: "Удобное расположение. Парковка. Скидка новым клиентам. Записаться за 30 сек." },
        ],
      },
    ],
    negative_keywords: "",
    daily_budget: 500,
    recommended_ctr: "—",
  },
];

export default function Templates({ onNavigate }: TemplatesProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [niche, setNiche] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchNiche = niche === "all" || t.niche === niche;
    const matchType = type === "all" || t.campaign_type === type;
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.short.toLowerCase().includes(search.toLowerCase());
    return matchNiche && matchType && matchSearch;
  });

  const apply = async (t: CampaignTemplate) => {
    if (!user) {
      toast({ title: "Войдите в аккаунт", description: "Шаблон создаст кампанию в вашем кабинете" });
      return;
    }
    setApplying(t.id);
    try {
      const created = await ydApi.create(`Шаблон: ${t.name}`, t.campaign_type);
      const cid = created.id;

      const fullCampaign: Partial<YdCampaign> & { id: number } = {
        id: cid,
        name: `Шаблон: ${t.name}`,
        campaign_type: t.campaign_type,
        strategy_type: t.strategy,
        daily_budget: t.daily_budget,
        weekly_budget: t.daily_budget * 7,
        negative_keywords: t.negative_keywords,
        regions: ["Россия"],
        step: 2,
        groups: t.groups.map((g) => ({
          name: g.name,
          geo: [],
          devices: ["desktop", "mobile", "tablet"],
          audience_targets: [],
          ads: g.ads.map((a) => ({
            ad_type: t.campaign_type === "network" ? "network_image" : "text",
            title1: a.title1,
            title2: a.title2,
            body: a.body,
            display_url: "",
            href: "",
            image_url: "",
            sitelinks: [],
            callouts: [],
          })),
          keywords: g.keywords.map((k) => ({ phrase: k, bid: 0, match_type: "broad" })),
        })),
        // Заполняем недостающие обязательные поля по умолчанию
        ...{ counter_id: "", counter_goals: "", schedule: {}, notes: `Создано из шаблона «${t.name}»`,
             utm_template: emptyCampaign().utm_template, currency: "RUB",
             strategy_settings: {}, status: "draft" as const },
      };

      await ydApi.save(fullCampaign);
      toast({
        title: "Шаблон применён",
        description: `Открываем кампанию «${t.name}» в редакторе...`,
      });
      try {
        localStorage.setItem("matad_open_campaign", String(cid));
      } catch {/* noop */}
      onNavigate("campaigns");
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setApplying(null);
    }
  };

  const preview = previewId ? TEMPLATES.find((t) => t.id === previewId) : null;

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
          <Icon name="LayoutTemplate" size={13} /> Профессиональные шаблоны кампаний
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Шаблоны Яндекс Директ</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Готовые кампании со структурой, фразами, минусами и объявлениями. Применение — создание кампании в кабинете.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm" />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={niche === "all"} onClick={() => setNiche("all")}>Все ниши</FilterChip>
          {(Object.keys(NICHE_META) as CampaignTemplate["niche"][]).map((k) => {
            const m = NICHE_META[k];
            return (
              <FilterChip key={k} active={niche === k} onClick={() => setNiche(k)} color={m.color}>
                <Icon name={m.icon} size={11} /> {m.label}
              </FilterChip>
            );
          })}
          <div className="w-[1px] bg-border/40 mx-1" />
          <FilterChip active={type === "all"} onClick={() => setType("all")}>Все типы</FilterChip>
          {(["text", "network", "master"] as YdCampaignType[]).map((t) => (
            <FilterChip key={t} active={type === t} onClick={() => setType(t)}>
              {TYPE_LABEL[t]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((t) => {
          const m = NICHE_META[t.niche];
          return (
            <div key={t.id} className="glass rounded-2xl p-4 hover:border-neon-cyan/40 border border-transparent transition-colors flex flex-col">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}20`, border: `1px solid ${m.color}40` }}>
                  <Icon name={m.icon} size={18} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-sm text-foreground leading-tight">{t.name}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${m.color}15`, color: m.color }}>
                      {m.label}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                      {TYPE_LABEL[t.campaign_type]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-3 flex-1">{t.short}</div>

              <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
                <Mini label="Групп" value={t.groups.length} />
                <Mini label="Объявл." value={t.groups.reduce((s, g) => s + g.ads.length, 0)} />
                <Mini label="Фраз" value={t.groups.reduce((s, g) => s + g.keywords.length, 0) || "—"} />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3 pb-2 border-b border-border/30">
                <span>~ {t.daily_budget.toLocaleString("ru-RU")} ₽/день</span>
                <span>CTR {t.recommended_ctr}</span>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => setPreviewId(t.id)}
                  className="flex-1 px-3 py-2 rounded-xl glass text-xs font-semibold hover:bg-muted/30 flex items-center justify-center gap-1">
                  <Icon name="Eye" size={12} /> Превью
                </button>
                <button onClick={() => apply(t)} disabled={applying === t.id}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-background flex items-center justify-center gap-1 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                  {applying === t.id ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Wand2" size={12} />}
                  Применить
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="SearchX" size={32} className="text-muted-foreground/50 mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">По фильтрам ничего не найдено</div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-heading font-bold truncate">{preview.name}</div>
                <div className="text-xs text-muted-foreground">
                  {NICHE_META[preview.niche].label} · {TYPE_LABEL[preview.campaign_type]}
                </div>
              </div>
              <button onClick={() => setPreviewId(null)} className="p-1.5 rounded-lg hover:bg-muted/30">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="overflow-auto flex-1 p-5 space-y-5">
              <div>
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Описание</div>
                <div className="text-sm text-foreground">{preview.description}</div>
              </div>

              <div>
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2">Почему работает</div>
                <ul className="space-y-1.5">
                  {preview.whyWorks.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Icon name="Check" size={14} className="text-neon-green flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {preview.groups.map((g, gi) => (
                <div key={gi} className="border border-border/40 rounded-xl p-3 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Layers" size={13} className="text-neon-cyan" />
                    <div className="font-semibold text-sm">{g.name}</div>
                  </div>

                  {g.keywords.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Ключевые фразы</div>
                      <div className="flex flex-wrap gap-1">
                        {g.keywords.map((k, ki) => (
                          <span key={ki} className="text-[11px] px-2 py-0.5 rounded bg-muted/40 font-mono">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {g.ads.map((a, ai) => (
                      <div key={ai} className="bg-background rounded-lg p-3 border border-border/30">
                        <div className="text-[#3F51B5] text-base font-medium">{a.title1} — {a.title2}</div>
                        <div className="text-sm text-foreground/80 mt-1">{a.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {preview.negative_keywords && (
                <div>
                  <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Минус-фразы</div>
                  <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 font-mono">
                    {preview.negative_keywords}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/30">
                <Mini label="Бюджет/день" value={`${preview.daily_budget.toLocaleString("ru-RU")} ₽`} />
                <Mini label="Стратегия" value={preview.strategy === "manual_cpc" ? "Ручная" : "Авто"} />
                <Mini label="Ожидаемый CTR" value={preview.recommended_ctr} />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-border/40 flex justify-end gap-2">
              <button onClick={() => setPreviewId(null)} className="px-4 py-2 rounded-xl glass text-sm">Закрыть</button>
              <button onClick={() => { const t = preview; setPreviewId(null); apply(t); }}
                disabled={applying === preview.id}
                className="px-4 py-2 rounded-xl text-sm font-bold text-background flex items-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                <Icon name="Wand2" size={14} /> Создать кампанию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children, color }: {
  active: boolean; onClick: () => void; children: React.ReactNode; color?: string;
}) {
  const baseColor = color || "hsl(185,100%,55%)";
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        active ? "text-foreground" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
      }`}
      style={active ? { borderColor: baseColor, background: `${baseColor}15`, color: baseColor } : undefined}>
      {children}
    </button>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/20 rounded-lg p-2">
      <div className="text-sm font-heading font-bold text-foreground">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  );
}
