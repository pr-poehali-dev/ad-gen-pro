import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import AdminOverview from "./AdminOverview";
import AdminClients from "./AdminClients";
import AdminOrders from "./AdminOrders";
import AdminLeads from "./AdminLeads";
import AdminTasks from "./AdminTasks";
import AdminAI from "./AdminAI";
import AdminEvents from "./AdminEvents";

type TabId = "overview" | "ai" | "clients" | "orders" | "leads" | "tasks" | "events";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Обзор", icon: "LayoutDashboard" },
  { id: "ai", label: "ИИ-инсайты", icon: "Sparkles" },
  { id: "clients", label: "Клиенты", icon: "Users" },
  { id: "orders", label: "Платежи", icon: "CreditCard" },
  { id: "leads", label: "CRM воронка", icon: "Kanban" },
  { id: "tasks", label: "Задачи", icon: "CheckSquare" },
  { id: "events", label: "Журнал", icon: "ScrollText" },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "") as TabId;
    if (TABS.some((t) => t.id === hash)) setTab(hash);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.location.hash = tab;
  }, [tab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-neon-cyan" />
      </div>
    );
  }

  const isAdmin = !!(user && (user.role === "admin" || user.is_admin));
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 70%)' }} />
        </div>
        <div className="relative glass rounded-3xl p-6 md:p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Shield" size={26} className="text-background" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Вход в Супер-Офис</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Войдите с учётной записью администратора, чтобы открыть админ-кабинет
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-background w-full justify-center"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="LogIn" size={15} /> Войти
          </button>
          <a href="/" className="block mt-3 text-xs text-muted-foreground hover:text-foreground">
            ← вернуться на главную
          </a>
        </div>
        {authOpen && <Auth onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 max-w-md text-center">
          <Icon name="ShieldAlert" size={40} className="text-neon-pink mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-6">Эта страница доступна только администраторам сервиса</p>
          <a href="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-background"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Home" size={15} /> На главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 glass border-b border-border/40 backdrop-blur-xl">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
              <Icon name="Shield" size={20} className="text-background" />
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-foreground text-base md:text-lg leading-tight">Супер-Офис</div>
              <div className="text-[10px] md:text-xs text-muted-foreground truncate">{user.email} · администратор</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs text-foreground hover:bg-muted/30">
              <Icon name="ArrowLeft" size={13} /> К приложению
            </a>
            <button
              onClick={() => logout()}
              title="Выйти"
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs text-foreground hover:bg-muted/30">
              <Icon name="LogOut" size={13} />
              <span className="hidden md:inline">Выйти</span>
            </button>
          </div>
        </div>

        <nav className="px-2 md:px-4 pb-2 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  tab === t.id ? "text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
                style={
                  tab === t.id
                    ? { background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }
                    : undefined
                }
              >
                <Icon name={t.icon} size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {tab === "overview" && <AdminOverview />}
        {tab === "ai" && <AdminAI />}
        {tab === "clients" && <AdminClients />}
        {tab === "orders" && <AdminOrders />}
        {tab === "leads" && <AdminLeads />}
        {tab === "tasks" && <AdminTasks />}
        {tab === "events" && <AdminEvents />}
      </main>
    </div>
  );
}