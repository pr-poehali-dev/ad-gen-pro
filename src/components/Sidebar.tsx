import { Campaign, Feed, Page } from "@/App";
import Icon from "@/components/ui/icon";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  campaigns: Campaign[];
  feeds: Feed[];
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

export default function Sidebar({ activePage, onNavigate, campaigns, feeds }: SidebarProps) {
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);

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

  return (
    <aside className="w-64 flex flex-col h-full border-r border-border/50 relative overflow-hidden"
      style={{ background: 'hsl(230, 25%, 5%)' }}>
      <div className="absolute top-0 left-0 w-full h-[1px] opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(185,100%,55%), transparent)' }} />

      <div className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%))' }}>
            <Icon name="Zap" size={18} className="text-background font-bold" />
          </div>
          <div>
            <div className="font-heading font-bold text-base text-foreground tracking-tight">AdFlow</div>
            <div className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">AI Agency</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-2 overflow-y-auto space-y-3">
        {groups.map((g, gi) => (
          <div key={gi}>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-3 mb-1">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map(item => {
                const isActive = activePage === item.id;
                const isAI = item.badge === "AI";
                const isLive = item.badge === "Live";
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 relative ${
                      isActive ? "text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))',
                      boxShadow: '0 4px 15px rgba(0, 220, 230, 0.25)'
                    } : {}}>
                    <Icon name={item.icon} size={16} className={isActive ? "text-background" : ""} />
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
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

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

      <div className="px-3 pb-4">
        <button onClick={() => onNavigate("agent")}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl glass cursor-pointer hover:bg-muted/10 transition-colors group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-background relative"
            style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))' }}>
            АП
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-medium text-foreground truncate">Алексей Петров</div>
            <div className="text-[10px] text-muted-foreground truncate">a.petrov@company.ru</div>
          </div>
          <Icon name="MessageSquare" size={13} className="text-muted-foreground group-hover:text-neon-cyan transition-colors" />
        </button>
      </div>
    </aside>
  );
}
