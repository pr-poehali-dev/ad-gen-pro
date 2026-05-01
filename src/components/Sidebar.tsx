import { Page } from "@/App";
import Icon from "@/components/ui/icon";

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
  { id: "feeds", label: "Фиды", icon: "Database", badge: "3" },
  { id: "ai", label: "ИИ-генерация", icon: "Sparkles" },
  { id: "campaigns", label: "Кампании", icon: "Megaphone", badge: "12" },
  { id: "export", label: "Экспорт", icon: "Upload" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 flex flex-col h-full border-r border-border/50 relative overflow-hidden"
      style={{ background: 'hsl(230, 25%, 5%)' }}>
      {/* Sidebar glow */}
      <div className="absolute top-0 left-0 w-full h-[1px] opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(185,100%,55%), transparent)' }} />

      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
            <Icon name="Zap" size={18} className="text-background font-bold" />
          </div>
          <div>
            <div className="font-heading font-bold text-base text-foreground tracking-tight">AdFlow</div>
            <div className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Pro Platform</div>
          </div>
        </div>
      </div>

      {/* Workspace badge */}
      <div className="mx-4 mb-5 px-3 py-2 rounded-lg glass">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-foreground">Workspace Alpha</div>
            <div className="text-[10px] text-muted-foreground">Тариф: Business</div>
          </div>
          <div className="w-2 h-2 rounded-full animate-pulse-slow bg-neon-green" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              style={isActive ? {
                background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))',
                boxShadow: '0 4px 15px rgba(0, 220, 230, 0.3)'
              } : {}}
            >
              <Icon name={item.icon} size={18} className={isActive ? "text-background" : ""} />
              <span className={`flex-1 text-left text-sm font-medium ${isActive ? "text-background" : ""}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* API Usage */}
      <div className="mx-4 mb-4 p-3 rounded-xl glass">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-muted-foreground">API запросов</span>
          <span className="text-[11px] font-bold text-foreground">7 240 / 10k</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: '72%',
              background: 'linear-gradient(90deg, hsl(185,100%,55%), hsl(260,80%,65%))'
            }}
          />
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">Обновится через 18 дней</div>
      </div>

      {/* User */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl glass cursor-pointer hover:bg-muted/10 transition-colors">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-background"
            style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))' }}>
            АП
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">Алексей Петров</div>
            <div className="text-[10px] text-muted-foreground truncate">a.petrov@company.ru</div>
          </div>
          <Icon name="ChevronUp" size={14} className="text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
