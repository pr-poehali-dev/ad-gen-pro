import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Feeds from "./pages/Feeds";
import AiGenerator from "./pages/AiGenerator";
import YdCampaigns from "./pages/yd/YdCampaigns";
import Export from "./pages/Export";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import Templates from "./pages/Templates";
import Agent from "./pages/Agent";
import Services from "./pages/Services";
import Automations from "./pages/Automations";
import Insights from "./pages/Insights";
import Sidebar from "./components/Sidebar";
import FloatingAgent from "./components/FloatingAgent";
import Icon from "./components/ui/icon";
import Breadcrumbs from "./components/Breadcrumbs";
import LegalDisclaimer from "./components/LegalDisclaimer";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminLayout from "./pages/admin/AdminLayout";
import useSwipeGesture from "./hooks/useSwipeGesture";
import { useCloudSync } from "./hooks/useCloudSync";
import { useAuth } from "./contexts/AuthContext";

const VALID_PAGES: Page[] = [
  "agent","dashboard","insights","feeds","ai","templates",
  "campaigns","calendar","automations","services","export","settings"
];

function getPageFromPath(): Page {
  if (typeof window === "undefined") return "agent";
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  if (!slug) return "agent";
  return (VALID_PAGES as string[]).includes(slug) ? (slug as Page) : "agent";
}

export type Page =
  | "agent" | "dashboard" | "insights"
  | "feeds" | "ai" | "templates"
  | "campaigns" | "calendar" | "automations"
  | "services" | "export" | "settings";

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
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (path.startsWith("/payment-success")) {
    return (
      <TooltipProvider>
        <Toaster />
        <PaymentSuccess />
      </TooltipProvider>
    );
  }
  if (path.startsWith("/admin")) {
    return (
      <TooltipProvider>
        <Toaster />
        <AdminLayout />
      </TooltipProvider>
    );
  }
  return <MainApp />;
}

function MainApp() {
  useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [activePage, setActivePageState] = useState<Page>(getPageFromPath);

  const setActivePage = (page: Page) => {
    setActivePageState(page);
    const path = page === "agent" ? "/" : `/${page}`;
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.pushState({ page }, "", path);
    }
  };

  useEffect(() => {
    const onPop = () => setActivePageState(getPageFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [feeds, setFeeds] = useState<Feed[]>(initialFeeds);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>(initialExportHistory);

  const sync = useCloudSync({
    campaigns, feeds, exportHistory,
    setCampaigns, setFeeds,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("adflow_sidebar_collapsed") === "1";
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Свайп от левого края → открыть меню; свайп влево по открытому меню → закрыть
  useSwipeGesture({
    enabled: !mobileSidebarOpen,
    edgeOnly: true,
    edgeWidth: 30,
    onSwipeRight: () => setMobileSidebarOpen(true),
  });
  useSwipeGesture({
    enabled: mobileSidebarOpen,
    onSwipeLeft: () => setMobileSidebarOpen(false),
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("adflow_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

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

  const handleDuplicateCampaign = (id: number) => {
    setCampaigns(prev => {
      const original = prev.find(c => c.id === id);
      if (!original) return prev;
      return [...prev, {
        ...original,
        id: Date.now(),
        name: `${original.name} (копия)`,
        status: "draft",
        spent: 0, impressions: 0, clicks: 0, ctr: 0,
      }];
    });
  };

  const handleDeleteFeed = (id: number) => setFeeds(prev => prev.filter(f => f.id !== id));

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
      case "agent":
        return <Agent campaigns={campaigns} feeds={feeds} onNavigate={setActivePage} />;
      case "dashboard":
        return <Dashboard campaigns={campaigns} onNavigate={setActivePage} />;
      case "insights":
        return <Insights campaigns={campaigns} onNavigate={setActivePage} />;
      case "services":
        return <Services onNavigate={setActivePage} />;
      case "automations":
        return <Automations />;
      case "feeds":
        return <Feeds feeds={feeds} onDelete={handleDeleteFeed} onRefresh={handleRefreshFeed} onAdd={handleAddFeed} />;
      case "ai":
        return <AiGenerator feeds={feeds} campaigns={campaigns} setCampaigns={setCampaigns} />;
      case "templates":
        return <Templates />;
      case "campaigns":
        return <YdCampaigns />;
      case "calendar":
        return <Calendar campaigns={campaigns} />;
      case "export":
        return <Export campaigns={campaigns} exportHistory={exportHistory} onExport={handleExport} />;
      case "settings":
        return <Settings />;
    }
  };

  const isAgentPage = activePage === "agent";

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          campaigns={campaigns}
          feeds={feeds}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenAuth={() => setAuthOpen(true)}
          syncStatus={sync.status}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-30 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
            <Icon name="Menu" size={20} className="text-background" />
          </button>

          {!isAgentPage && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.18]"
                style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
              <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.15]"
                style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 70%)' }} />
              <div className="absolute top-[40%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.12]"
                style={{ background: 'radial-gradient(circle, hsl(30,100%,60%), transparent 70%)' }} />
            </div>
          )}
          {!isAgentPage && (
            <div className="relative z-10 px-4 md:px-8 pt-16 md:pt-6 pb-1">
              <Breadcrumbs page={activePage} onNavigate={setActivePage} />
            </div>
          )}
          {isAgentPage && <Breadcrumbs page={activePage} onNavigate={setActivePage} />}
          <div className={`relative z-10 ${!isAgentPage ? "[&>div]:pt-2 [&>div]:md:pt-2" : ""}`}>{renderPage()}</div>

          <LegalDisclaimer />

          <footer className="relative z-10 mt-2 px-6 py-5 border-t border-border/40">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                  <Icon name="Sparkles" size={13} className="text-background" />
                </div>
                <span>
                  <span className="text-foreground font-medium">mat-ad.ru</span> — интеллектуальный продукт компании{" "}
                  <span className="text-foreground font-semibold">ООО «МАТ-Лабс»</span>
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground/70">
                © {new Date().getFullYear()} ООО «МАТ-Лабс». Все права защищены.
              </div>
            </div>
          </footer>
        </main>
        {!isAgentPage && <FloatingAgent campaigns={campaigns} feeds={feeds} />}
        {authOpen && <Auth onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
      </div>
    </TooltipProvider>
  );
}