import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Feeds from "./pages/Feeds";
import AiGenerator from "./pages/AiGenerator";
import Campaigns from "./pages/Campaigns";
import Export from "./pages/Export";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";

export type Page = "dashboard" | "feeds" | "ai" | "campaigns" | "export" | "settings";
export type CampaignStatus = "active" | "paused" | "draft";

export interface Campaign {
  id: number;
  name: string;
  platform: "yandex" | "google";
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

export interface ExportRecord {
  id: number;
  name: string;
  platform: string;
  date: string;
  ads: number;
  status: "done" | "error";
}

const initialCampaigns: Campaign[] = [
  { id: 1, name: "Зимняя коллекция 2025", platform: "yandex", status: "active", budget: 25000, spent: 12400, impressions: 398220, clicks: 12440, ctr: 3.12, ads: 48 },
  { id: 2, name: "Смартфоны - Март", platform: "google", status: "active", budget: 18000, spent: 9800, impressions: 344770, clicks: 9790, ctr: 2.84, ads: 32 },
  { id: 3, name: "Акция 8 марта", platform: "yandex", status: "paused", budget: 10000, spent: 7100, impressions: 369540, clicks: 7100, ctr: 1.92, ads: 20 },
  { id: 4, name: "Бытовая техника Q1", platform: "google", status: "draft", budget: 30000, spent: 0, impressions: 0, clicks: 0, ctr: 0, ads: 0 },
  { id: 5, name: "Новогодние скидки", platform: "yandex", status: "active", budget: 45000, spent: 21300, impressions: 531120, clicks: 21300, ctr: 4.01, ads: 90 },
  { id: 6, name: "Весенние новинки", platform: "google", status: "draft", budget: 15000, spent: 0, impressions: 0, clicks: 0, ctr: 0, ads: 5 },
];

const initialFeeds: Feed[] = [
  { id: 1, name: "Каталог товаров зима 2025", type: "YML", size: "4.2 МБ", products: 1840, updated: "Сегодня, 09:14", status: "ok" },
  { id: 2, name: "Электроника и гаджеты", type: "CSV", size: "1.8 МБ", products: 720, updated: "Вчера, 18:32", status: "ok" },
  { id: 3, name: "Бытовая техника Q1", type: "Excel", size: "3.1 МБ", products: 560, updated: "28 апр, 11:55", status: "warning" },
];

const initialExportHistory: ExportRecord[] = [
  { id: 1, name: "Зимняя коллекция 2025", platform: "Яндекс Директ", date: "01 Май, 10:22", ads: 48, status: "done" },
  { id: 2, name: "Смартфоны - Март", platform: "Google Ads", date: "29 Апр, 14:05", ads: 32, status: "done" },
  { id: 3, name: "Весенние новинки", platform: "Google Ads", date: "29 Апр, 11:30", ads: 12, status: "error" },
  { id: 4, name: "Новогодние скидки", platform: "Яндекс Директ", date: "28 Апр, 16:18", ads: 90, status: "done" },
];

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [feeds, setFeeds] = useState<Feed[]>(initialFeeds);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>(initialExportHistory);

  const handleToggleCampaign = (id: number) => {
    setCampaigns(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: c.status === "active" ? "paused" : c.status === "paused" ? "active" : c.status }
        : c
    ));
  };

  const handleDeleteCampaign = (id: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCampaign = (name: string, platform: "yandex" | "google", budget: number) => {
    setCampaigns(prev => [...prev, {
      id: Date.now(), name, platform, status: "draft",
      budget, spent: 0, impressions: 0, clicks: 0, ctr: 0, ads: 0,
    }]);
  };

  const handleDeleteFeed = (id: number) => {
    setFeeds(prev => prev.filter(f => f.id !== id));
  };

  const handleRefreshFeed = (id: number) => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    setFeeds(prev => prev.map(f =>
      f.id === id ? { ...f, status: "ok", updated: `Сегодня, ${hh}:${mm}` } : f
    ));
  };

  const handleAddFeed = (feed: Omit<Feed, "id">) => {
    setFeeds(prev => [...prev, { id: Date.now(), ...feed }]);
  };

  const handleExport = (campaignIds: number[], platform: string) => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const mon = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"][now.getMonth()];
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const date = `${day} ${mon}, ${hh}:${mm}`;

    const newRecords: ExportRecord[] = campaigns
      .filter(c => campaignIds.includes(c.id))
      .map(c => ({ id: Date.now() + c.id, name: c.name, platform, date, ads: c.ads, status: "done" }));

    setExportHistory(prev => [...newRecords, ...prev]);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard campaigns={campaigns} onNavigate={setActivePage} />;
      case "feeds":
        return <Feeds feeds={feeds} onDelete={handleDeleteFeed} onRefresh={handleRefreshFeed} onAdd={handleAddFeed} />;
      case "ai":
        return <AiGenerator feeds={feeds} campaigns={campaigns} setCampaigns={setCampaigns} />;
      case "campaigns":
        return <Campaigns campaigns={campaigns} onToggle={handleToggleCampaign} onDelete={handleDeleteCampaign} onAdd={handleAddCampaign} onNavigate={setActivePage} />;
      case "export":
        return <Export campaigns={campaigns} exportHistory={exportHistory} onExport={handleExport} />;
      case "settings":
        return <Settings />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} campaigns={campaigns} feeds={feeds} />
        <main className="flex-1 overflow-y-auto relative">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
            <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 70%)' }} />
            <div className="absolute top-[40%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
              style={{ background: 'radial-gradient(circle, hsl(30,100%,60%), transparent 70%)' }} />
          </div>
          <div className="relative z-10">{renderPage()}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
