import { Campaign, Feed, Page } from "@/App";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import type { SyncStatus } from "@/hooks/useCloudSync";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  campaigns: Campaign[];
  feeds: Feed[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAuth: () => void;
  syncStatus: SyncStatus;
}

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  badge?: string | null;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function Sidebar({
  activePage, onNavigate, campaigns, feeds,
  collapsed, onToggleCollapse, mobileOpen, onCloseMobile,
  onOpenAuth, syncStatus,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);

  const initials = (user?.name || user?.email || "?")
    .split(/[ @.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("");

  const syncMeta: Record<SyncStatus, { color: string; label: string; icon: string; pulse?: boolean }> = {
    idle: { color: "hsl(220,10%,55%)", label: "Не синхронизирован", icon: "Cloud" },
    loading: { color: "hsl(185,100%,55%)", label: "Загружаем данные...", icon: "Loader2", pulse: true },
    saving: { color: "hsl(30,100%,60%)", label: "Сохраняем...", icon: "CloudUpload", pulse: true },
    saved: { color: "hsl(145,70%,50%)", label: "Сохранено в облаке", icon: "CloudCheck" },
    error: { color: "hsl(0,75%,60%)", label: "Ошибка синхронизации", icon: "CloudOff" },
  };
  const sm = syncMeta[syncStatus];

  const groups: NavGroup[] = [
    {
      label: "AI Агентство",
      items: [
        { id: "agent", label: "AI-агент", icon: "Brain", badge: "AI" },
        { id: "insights", label: "Инсайты", icon: "Lightbulb", badge: null },
        { id: "services", label: "Услуги", icon: "Briefcase", badge: null },
      ],
    },
    {
      label: "Творчество",
      items: [
        { id: "ai", label: "Генератор", icon: "Sparkles", badge: null },
        { id: "templates", label: "Шаблоны", icon: "LayoutTemplate", badge: null },
        { id: "feeds", label: "Фиды", icon: "Database", badge: feeds.length > 0 ? String(feeds.length) : null },
      ],
    },
    {
      label: "Управление",
      items: [
        { id: "campaigns", label: "Кампании", icon: "Megaphone", badge: activeCampaigns > 0 ? String(activeCampaigns) : null },
        { id: "calendar", label: "Календарь", icon: "CalendarDays", badge: null },
        { id: "automations", label: "Автоматизации", icon: "Bot", badge: "Live" },
      ],
    },
    {
      label: "Отчётность",
      items: [
        { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard", badge: null },
        { id: "export", label: "Экспорт", icon: "Upload", badge: null },
        { id: "settings", label: "Настройки", icon: "Settings", badge: null },
      ],
    },
  ];

  const handleNav = (id: Page) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in" />
      )}

      <aside
        className={`flex flex-col h-full border-r border-border/50 relative overflow-hidden transition-all duration-300 z-50
          ${collapsed ? "md:w-[72px]" : "md:w-64"}
          ${mobileOpen ? "fixed inset-y-0 left-0 w-64" : "fixed -left-72 md:left-0 md:relative w-64"}
        `}
        style={{ background: 'hsl(230, 25%, 5%)' }}>

        <div className="absolute top-0 left-0 w-full h-[1px] opacity-60"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(185,100%,55%), transparent)' }} />

        {/* Header / Logo */}
        <div className={`pt-5 pb-3 ${collapsed ? "px-3" : "px-5"} flex items-center justify-between gap-2`}>
          <button onClick={() => handleNav("agent")} className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%))' }}>
              <Icon name="Zap" size={18} className="text-background font-bold" />
            </div>
            {!collapsed && (
              <div className="text-left min-w-0">
                <div className="font-heading font-bold text-base text-foreground tracking-tight truncate">mat-ad.ru</div>
                <div className="text-[9px] text-muted-foreground font-medium leading-tight" title="Максимально автоматизированные технологии рекламы">
                  Максимально автоматизированные<br/>технологии рекламы
                </div>
              </div>
            )}
          </button>

          {/* Mobile close */}
          {mobileOpen && (
            <button onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex-shrink-0">
              <Icon name="X" size={18} />
            </button>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          className="hidden md:flex absolute -right-3 top-7 w-6 h-6 rounded-full items-center justify-center text-foreground hover:scale-110 transition-transform z-10 shadow-lg"
          style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
          <Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} size={13} className="text-background" />
        </button>

        {/* Nav */}
        <nav className={`flex-1 ${collapsed ? "px-2" : "px-3"} pb-2 overflow-y-auto space-y-3 mt-2`}>
          {groups.map((g, gi) => (
            <div key={gi}>
              {!collapsed ? (
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-3 mb-1">
                  {g.label}
                </div>
              ) : (
                <div className="h-[1px] bg-muted/20 mx-2 mb-1" />
              )}
              <div className="space-y-0.5">
                {g.items.map(item => {
                  const isActive = activePage === item.id;
                  const isAI = item.badge === "AI";
                  const isLive = item.badge === "Live";
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 ${collapsed ? "px-2 py-2 justify-center" : "px-3 py-2"} rounded-xl transition-all duration-200 relative group ${
                        isActive ? "text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))',
                        boxShadow: '0 4px 15px rgba(0, 220, 230, 0.25)'
                      } : {}}>
                      <div className="relative flex-shrink-0">
                        <Icon name={item.icon} size={16} className={isActive ? "text-background" : ""} />
                        {collapsed && item.badge && (
                          <div className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full"
                            style={{ background: isAI ? 'hsl(260,80%,65%)' : isLive ? 'hsl(145,70%,50%)' : 'hsl(185,100%,55%)' }} />
                        )}
                      </div>
                      {!collapsed && (
                        <>
                          <span className={`flex-1 text-left text-sm font-medium ${isActive ? "text-background" : ""}`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            isAI ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider"
                                style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))', color: 'hsl(230,25%,5%)' }}>
                                {item.badge}
                              </span>
                            ) : isLive ? (
                              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                                style={{ background: 'hsl(145,70%,50%,0.2)', color: 'hsl(145,70%,55%)' }}>
                                <div className="w-1 h-1 rounded-full bg-neon-green animate-pulse-slow" />
                                {item.badge}
                              </span>
                            ) : (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                              }`}>
                                {item.badge}
                              </span>
                            )
                          )}
                        </>
                      )}

                      {/* Tooltip when collapsed */}
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl"
                          style={{ background: 'hsl(230, 25%, 12%)', color: 'hsl(210, 40%, 95%)', border: '1px solid hsl(230, 20%, 18%)' }}>
                          {item.label}
                          {item.badge && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ background: 'hsl(185,100%,55%,0.2)', color: 'hsl(185,100%,65%)' }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Spend block — only when expanded */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl glass">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Расход</span>
              <span className="text-[11px] font-bold text-foreground">₽ {totalSpent.toLocaleString("ru-RU")}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((totalSpent / 200000) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, hsl(185,100%,55%), hsl(260,80%,65%))'
                }} />
            </div>
            <div className="text-[10px] text-muted-foreground">{activeCampaigns} активных · {feeds.length} фидов</div>
          </div>
        )}

        {/* Sync status (только если есть пользователь) */}
        {user && !collapsed && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-lg glass flex items-center gap-2">
            <Icon name={sm.icon} size={12} className={sm.pulse ? "animate-spin" : ""} style={{ color: sm.color }} fallback="Cloud" />
            <span className="text-[10px] font-medium" style={{ color: sm.color }}>{sm.label}</span>
          </div>
        )}

        {/* Admin link — visible only for admins */}
        {user && (user.is_admin || user.role === "admin") && (
          <div className={`${collapsed ? "px-2" : "px-3"} pb-2`}>
            <a
              href="/admin"
              title={collapsed ? "Админка" : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center p-2" : "gap-2 p-2.5"} rounded-xl text-sm font-bold text-background transition-all hover:scale-[1.02]`}
              style={{ background: 'linear-gradient(135deg, hsl(0,75%,60%), hsl(30,100%,55%))', boxShadow: '0 4px 14px rgba(220, 50, 50, 0.25)' }}>
              <Icon name="Shield" size={14} className="text-background" />
              {!collapsed && <span>Супер-Офис (админ)</span>}
            </a>
          </div>
        )}

        {/* Profile / Auth */}
        <div className={`${collapsed ? "px-2" : "px-3"} pb-4`}>
          {user ? (
            <div
              title={collapsed ? user.name || user.email : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center p-2" : "gap-3 p-2.5"} rounded-xl glass`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-background relative flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))' }}>
                {initials || "?"}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
                  style={{ background: sm.color }} />
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-medium text-foreground truncate">{user.name || "Пользователь"}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => logout()}
                    title="Выйти"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors flex-shrink-0">
                    <Icon name="LogOut" size={13} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); onCloseMobile(); }}
              title={collapsed ? "Войти" : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center p-2" : "gap-2 p-2.5"} rounded-xl text-sm font-bold text-background transition-all hover:scale-[1.02]`}
              style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 4px 14px rgba(0, 220, 230, 0.25)' }}>
              <Icon name="LogIn" size={14} className="text-background" />
              {!collapsed && <span>Войти / Регистрация</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}