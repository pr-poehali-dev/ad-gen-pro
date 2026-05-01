import { create } from "zustand";

export type CampaignStatus = "active" | "paused" | "draft";
export type Platform = "yandex" | "google";

export interface Campaign {
  id: number;
  name: string;
  platform: Platform;
  status: CampaignStatus;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  ads: number;
}

export interface Feed {
  id: number;
  name: string;
  type: "YML" | "CSV" | "Excel";
  size: string;
  products: number;
  updated: string;
  status: "ok" | "warning";
}

export interface GeneratedAd {
  title: string;
  description: string;
  predicted_ctr: number;
  quality_score: number;
  keywords: string[];
}

export interface ExportRecord {
  id: number;
  name: string;
  platform: string;
  date: string;
  ads: number;
  status: "done" | "error";
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AppStore {
  campaigns: Campaign[];
  feeds: Feed[];
  generatedAds: GeneratedAd[];
  exportHistory: ExportRecord[];
  user: UserProfile;

  toggleCampaignStatus: (id: number) => void;
  addCampaign: (c: Campaign) => void;

  addFeed: (f: Feed) => void;
  deleteFeed: (id: number) => void;
  refreshFeed: (id: number) => void;

  setGeneratedAds: (ads: GeneratedAd[]) => void;
  addToExportHistory: (rec: ExportRecord) => void;

  updateUser: (u: UserProfile) => void;
}

const now = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) =>
  `${pad(d.getDate())} ${["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"][d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const useStore = create<AppStore>((set) => ({
  campaigns: [
    { id: 1, name: "Зимняя коллекция 2025", platform: "yandex", status: "active", budget: 25000, spent: 12400, impressions: 398220, clicks: 12440, ctr: 3.12, ads: 48 },
    { id: 2, name: "Смартфоны - Март", platform: "google", status: "active", budget: 18000, spent: 9800, impressions: 344770, clicks: 9790, ctr: 2.84, ads: 32 },
    { id: 3, name: "Акция 8 марта", platform: "yandex", status: "paused", budget: 10000, spent: 7100, impressions: 369540, clicks: 7100, ctr: 1.92, ads: 20 },
    { id: 4, name: "Бытовая техника Q1", platform: "google", status: "draft", budget: 30000, spent: 0, impressions: 0, clicks: 0, ctr: 0, ads: 0 },
    { id: 5, name: "Новогодние скидки", platform: "yandex", status: "active", budget: 45000, spent: 21300, impressions: 531120, clicks: 21300, ctr: 4.01, ads: 90 },
    { id: 6, name: "Весенние новинки", platform: "google", status: "draft", budget: 15000, spent: 0, impressions: 0, clicks: 0, ctr: 0, ads: 5 },
  ],

  feeds: [
    { id: 1, name: "Каталог товаров зима 2025", type: "YML", size: "4.2 МБ", products: 1840, updated: "Сегодня, 09:14", status: "ok" },
    { id: 2, name: "Электроника и гаджеты", type: "CSV", size: "1.8 МБ", products: 720, updated: "Вчера, 18:32", status: "ok" },
    { id: 3, name: "Бытовая техника Q1", type: "Excel", size: "3.1 МБ", products: 560, updated: "28 апр, 11:55", status: "warning" },
  ],

  generatedAds: [],

  exportHistory: [
    { id: 1, name: "Зимняя коллекция 2025", platform: "Яндекс Директ", date: "01 Май, 10:22", ads: 48, status: "done" },
    { id: 2, name: "Смартфоны - Март", platform: "Google Ads", date: "29 Апр, 14:05", ads: 32, status: "done" },
    { id: 3, name: "Весенние новинки", platform: "Google Ads", date: "29 Апр, 11:30", ads: 12, status: "error" },
    { id: 4, name: "Новогодние скидки", platform: "Яндекс Директ", date: "28 Апр, 16:18", ads: 90, status: "done" },
  ],

  user: {
    firstName: "Алексей",
    lastName: "Петров",
    email: "a.petrov@company.ru",
    phone: "+7 (900) 123-45-67",
  },

  toggleCampaignStatus: (id) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : c.status === "paused" ? "active" : c.status }
          : c
      ),
    })),

  addCampaign: (c) => set((s) => ({ campaigns: [...s.campaigns, c] })),

  addFeed: (f) => set((s) => ({ feeds: [...s.feeds, f] })),

  deleteFeed: (id) => set((s) => ({ feeds: s.feeds.filter((f) => f.id !== id) })),

  refreshFeed: (id) =>
    set((s) => ({
      feeds: s.feeds.map((f) =>
        f.id === id ? { ...f, updated: `Сегодня, ${pad(now.getHours())}:${pad(now.getMinutes())}`, status: "ok" } : f
      ),
    })),

  setGeneratedAds: (ads) => set({ generatedAds: ads }),

  addToExportHistory: (rec) =>
    set((s) => ({ exportHistory: [rec, ...s.exportHistory] })),

  updateUser: (u) => set({ user: u }),
}));

export function fmt2(d: Date) {
  return fmt(d);
}
