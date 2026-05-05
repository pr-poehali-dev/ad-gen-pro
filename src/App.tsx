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
import YandexOAuthCallback from "./pages/YandexOAuthCallback";
import AdminLayout from "./pages/admin/AdminLayout";
import useSwipeGesture from "./hooks/useSwipeGesture";
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
  if (path.startsWith("/yandex-oauth-callback")) {
    return (
      <TooltipProvider>
        <Toaster />
        <YandexOAuthCallback />
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
  const [activePage, setActivePageState] = useState<Page>(() => getPageFromPath());

  const setActivePage = (page: Page) => {
    setActivePageState(page);
    const path = page === "agent" ? "/" : `/${page}`;
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.pushState({ page }, "", path);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => setActivePageState(getPageFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
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
      if (typeof window !== "undefined") {
        localStorage.setItem("adflow_sidebar_collapsed", next ? "1" : "0");
      }
      return next;
    });
  };

  const renderPage = () => {
    switch (activePage) {
      case "agent":
        return <Agent onNavigate={setActivePage} />;
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} />;
      case "insights":
        return <Insights onNavigate={setActivePage} />;
      case "services":
        return <Services onNavigate={setActivePage} />;
      case "automations":
        return <Automations />;
      case "feeds":
        return <Feeds />;
      case "ai":
        return <AiGenerator onNavigate={setActivePage} />;
      case "templates":
        return <Templates onNavigate={setActivePage} />;
      case "campaigns":
        return <YdCampaigns />;
      case "calendar":
        return <Calendar />;
      case "export":
        return <Export />;
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
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenAuth={() => setAuthOpen(true)}
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
        {!isAgentPage && <FloatingAgent />}
        {authOpen && <Auth onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
      </div>
    </TooltipProvider>
  );
}