export type YdCampaignType = "text" | "network" | "master";

export type YdStrategyType =
  | "manual_cpc"
  | "max_clicks"
  | "max_clicks_with_budget"
  | "max_conversions"
  | "target_cpa"
  | "target_roas";

export type YdStatus = "draft" | "ready" | "exported" | "sent";

export type YdMatchType = "broad" | "phrase" | "exact";

export interface YdSitelink {
  title: string;
  url: string;
  description?: string;
}

export interface YdCallout {
  text: string;
}

export interface YdAd {
  id?: number;
  ad_type: "text" | "dynamic" | "network_image";
  title1: string;
  title2: string;
  body: string;
  display_url: string;
  href: string;
  image_url?: string;
  sitelinks: YdSitelink[];
  callouts: YdCallout[];
}

export interface YdKeyword {
  id?: number;
  phrase: string;
  bid: number;
  match_type: YdMatchType;
}

export interface YdAdGroup {
  id?: number;
  name: string;
  geo: string[];
  devices: string[];
  audience_targets: string[];
  ads: YdAd[];
  keywords: YdKeyword[];
}

export interface YdSchedule {
  timezone?: string;
  hours?: { day: number; from: number; to: number }[];
}

export interface YdCampaign {
  id?: number;
  name: string;
  campaign_type: YdCampaignType;
  status: YdStatus;
  strategy_type: YdStrategyType;
  strategy_settings: Record<string, unknown>;
  daily_budget: number;
  weekly_budget: number;
  currency: string;
  counter_id: string;
  counter_goals: string;
  schedule: YdSchedule;
  regions: string[];
  negative_keywords: string;
  utm_template: string;
  notes: string;
  step: number;
  groups: YdAdGroup[];
  created_at?: string;
  updated_at?: string;
}

export interface YdCampaignListItem {
  id: number;
  name: string;
  campaign_type: YdCampaignType;
  status: YdStatus;
  strategy_type: YdStrategyType;
  daily_budget: number;
  weekly_budget: number;
  step: number;
  created_at: string;
  updated_at: string;
  groups_count: number;
  ads_count: number;
  keywords_count: number;
}

export const CAMPAIGN_TYPE_META: Record<
  YdCampaignType,
  { label: string; icon: string; description: string; color: string }
> = {
  text: {
    label: "Текстово-графическая",
    icon: "FileText",
    description: "Реклама на Поиске и в РСЯ. Универсальный формат для любого бизнеса.",
    color: "hsl(185,100%,55%)",
  },
  network: {
    label: "Реклама в сетях (РСЯ)",
    icon: "Image",
    description: "Графические и текстовые объявления на партнёрских сайтах Яндекса.",
    color: "hsl(260,80%,65%)",
  },
  master: {
    label: "Мастер кампаний",
    icon: "Sparkles",
    description: "Автоматическая кампания на основе целей и материалов. Минимум настроек.",
    color: "hsl(320,80%,65%)",
  },
};

export const STRATEGY_META: Record<
  YdStrategyType,
  { label: string; description: string; needsBid: boolean; needsBudget: boolean }
> = {
  manual_cpc: {
    label: "Ручное управление ставками",
    description: "Вы задаёте ставки сами, ЯД не оптимизирует.",
    needsBid: true,
    needsBudget: false,
  },
  max_clicks: {
    label: "Максимум кликов",
    description: "ЯД получает максимум кликов в рамках бюджета.",
    needsBid: false,
    needsBudget: true,
  },
  max_clicks_with_budget: {
    label: "Максимум кликов с бюджетом",
    description: "Ограничение по недельному бюджету.",
    needsBid: false,
    needsBudget: true,
  },
  max_conversions: {
    label: "Максимум конверсий",
    description: "Оптимизация на цель Метрики. Нужен счётчик и цель.",
    needsBid: false,
    needsBudget: true,
  },
  target_cpa: {
    label: "Оплата за конверсии (CPA)",
    description: "Платите за достигнутую цель. Нужен счётчик и цель.",
    needsBid: false,
    needsBudget: true,
  },
  target_roas: {
    label: "Целевая доля рекламных расходов (ДРР)",
    description: "Оптимизация по доле расходов от выручки.",
    needsBid: false,
    needsBudget: true,
  },
};

export const REGIONS = [
  "Россия",
  "Москва и Московская область",
  "Санкт-Петербург и Ленинградская область",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Уфа",
  "Ростов-на-Дону",
  "Краснодар",
  "Воронеж",
  "Пермь",
  "Волгоград",
  "Красноярск",
  "Омск",
];

export const DEVICES = ["desktop", "mobile", "tablet"] as const;

export const DEVICE_LABEL: Record<string, string> = {
  desktop: "Десктопы",
  mobile: "Мобильные",
  tablet: "Планшеты",
};

export const STATUS_LABEL: Record<YdStatus, string> = {
  draft: "Черновик",
  ready: "Готова",
  exported: "Экспортирована",
  sent: "Отправлена в ЯД",
};

export const STATUS_COLOR: Record<YdStatus, string> = {
  draft: "hsl(220,10%,55%)",
  ready: "hsl(185,100%,55%)",
  exported: "hsl(260,80%,65%)",
  sent: "hsl(145,70%,50%)",
};

export const MATCH_TYPE_LABEL: Record<YdMatchType, string> = {
  broad: "Широкое",
  phrase: "Фразовое",
  exact: "Точное",
};

export function emptyAd(): YdAd {
  return {
    ad_type: "text",
    title1: "",
    title2: "",
    body: "",
    display_url: "",
    href: "",
    image_url: "",
    sitelinks: [],
    callouts: [],
  };
}

export function emptyGroup(idx = 1): YdAdGroup {
  return {
    name: `Группа ${idx}`,
    geo: [],
    devices: ["desktop", "mobile", "tablet"],
    audience_targets: [],
    ads: [emptyAd()],
    keywords: [],
  };
}

export function emptyCampaign(): YdCampaign {
  return {
    name: "",
    campaign_type: "text",
    status: "draft",
    strategy_type: "manual_cpc",
    strategy_settings: {},
    daily_budget: 0,
    weekly_budget: 0,
    currency: "RUB",
    counter_id: "",
    counter_goals: "",
    schedule: {},
    regions: ["Россия"],
    negative_keywords: "",
    utm_template:
      "utm_source=yandex&utm_medium=cpc&utm_campaign={campaign_name_lat}&utm_term={keyword}&utm_content={ad_id}",
    notes: "",
    step: 1,
    groups: [emptyGroup(1)],
  };
}
