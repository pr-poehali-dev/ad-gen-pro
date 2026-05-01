import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Automation {
  id: number;
  name: string;
  description: string;
  category: "monitoring" | "optimization" | "creative" | "reporting";
  icon: string;
  color: string;
  enabled: boolean;
  triggers: number;
  saved: string;
}

const initialAutomations: Automation[] = [
  { id: 1, name: "Автопауза при перерасходе", description: "Останавливает кампанию, если CPL вырос на 30% от среднего за неделю", category: "monitoring", icon: "Pause", color: "hsl(0,75%,60%)", enabled: true, triggers: 14, saved: "₽ 47 200" },
  { id: 2, name: "Оптимизация ставок ИИ", description: "Каждый час корректирует ставки по Bid Modifier для максимизации CTR", category: "optimization", icon: "TrendingUp", color: "hsl(185,100%,55%)", enabled: true, triggers: 524, saved: "₽ 89 400" },
  { id: 3, name: "A/B-тесты заголовков", description: "Запускает 4 варианта заголовков параллельно, оставляет победителя", category: "creative", icon: "Split", color: "hsl(260,80%,65%)", enabled: true, triggers: 38, saved: "+24% CTR" },
  { id: 4, name: "Алерты в Telegram", description: "Шлёт уведомление в чат при падении CTR ниже 1.5% или CPC выше 50 ₽", category: "monitoring", icon: "Bell", color: "hsl(30,100%,60%)", enabled: true, triggers: 7, saved: "—" },
  { id: 5, name: "Ретаргетинг по корзинам", description: "Каждый день обновляет аудиторию из CRM и запускает ретаргет", category: "optimization", icon: "RotateCcw", color: "hsl(145,70%,50%)", enabled: false, triggers: 0, saved: "—" },
  { id: 6, name: "Еженедельные отчёты", description: "По понедельникам в 10:00 присылает PDF-отчёт по всем активным кампаниям", category: "reporting", icon: "FileText", color: "hsl(200,100%,55%)", enabled: true, triggers: 12, saved: "—" },
  { id: 7, name: "Авто-генерация креативов", description: "ИИ создаёт новые объявления каждые 7 дней на основе топовых запросов", category: "creative", icon: "Sparkles", color: "hsl(320,80%,65%)", enabled: false, triggers: 0, saved: "—" },
  { id: 8, name: "Минус-слова из поиска", description: "Парсит поисковые запросы и автоматически добавляет нерелевантные в минус", category: "optimization", icon: "Filter", color: "hsl(280,80%,65%)", enabled: true, triggers: 142, saved: "₽ 28 600" },
];

const categoryMeta = {
  monitoring: { label: "Мониторинг", icon: "Eye" },
  optimization: { label: "Оптимизация", icon: "Sliders" },
  creative: { label: "Креативы", icon: "Sparkles" },
  reporting: { label: "Отчёты", icon: "FileText" },
};

export default function Automations() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? automations : automations.filter(a => a.category === filter);

  const enabledCount = automations.filter(a => a.enabled).length;
  const totalTriggers = automations.reduce((s, a) => s + a.triggers, 0);

  const toggle = (id: number) => {
    setAutomations(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next = !a.enabled;
      toast({ title: next ? "Автоматизация запущена" : "Автоматизация отключена", description: a.name });
      return { ...a, enabled: next };
    }));
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
            <Icon name="Bot" size={13} />
            AI-автоматизации работают 24/7
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Автоматизация процессов</h1>
          <p className="text-muted-foreground text-sm mt-1">Включите сценарии — AI-агент сам управляет вашими кампаниями</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(145,70%,50%,0.2)', border: '1px solid hsl(145,70%,50%,0.4)' }}>
              <Icon name="Zap" size={16} style={{ color: 'hsl(145,70%,50%)' }} />
            </div>
            <div className="text-xs text-muted-foreground">Активных</div>
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">{enabledCount} / {automations.length}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(185,100%,55%,0.2)', border: '1px solid hsl(185,100%,55%,0.4)' }}>
              <Icon name="Activity" size={16} style={{ color: 'hsl(185,100%,55%)' }} />
            </div>
            <div className="text-xs text-muted-foreground">Срабатываний</div>
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">{totalTriggers}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(30,100%,60%,0.2)', border: '1px solid hsl(30,100%,60%,0.4)' }}>
              <Icon name="Wallet" size={16} style={{ color: 'hsl(30,100%,60%)' }} />
            </div>
            <div className="text-xs text-muted-foreground">Сэкономлено</div>
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">₽ 165 200</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(260,80%,65%,0.2)', border: '1px solid hsl(260,80%,65%,0.4)' }}>
              <Icon name="Clock" size={16} style={{ color: 'hsl(260,80%,65%)' }} />
            </div>
            <div className="text-xs text-muted-foreground">Часов в неделю</div>
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">28 ч</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            filter === "all" ? "text-background" : "glass text-muted-foreground hover:text-foreground"
          }`}
          style={filter === "all" ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}>
          Все ({automations.length})
        </button>
        {(Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).map(cat => {
          const m = categoryMeta[cat];
          const count = automations.filter(a => a.category === cat).length;
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === cat ? "text-background" : "glass text-muted-foreground hover:text-foreground"
              }`}
              style={filter === cat ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}>
              <Icon name={m.icon} size={12} />
              {m.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Automations list */}
      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className={`glass rounded-2xl p-5 flex items-center gap-5 transition-all ${
            a.enabled ? "" : "opacity-60"
          }`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.color}20`, border: `1px solid ${a.color}40` }}>
              <Icon name={a.icon} size={20} style={{ color: a.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-semibold text-foreground">{a.name}</div>
                {a.enabled && (
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold"
                    style={{ background: 'hsl(145,70%,50%,0.15)', color: 'hsl(145,70%,55%)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-slow" />
                    Live
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{a.description}</div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Срабатываний</div>
              <div className="text-sm font-bold text-foreground">{a.triggers}</div>
            </div>

            <div className="text-right flex-shrink-0 min-w-[80px]">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Эффект</div>
              <div className={`text-sm font-bold ${a.saved.startsWith("+") ? "metric-up" : "text-foreground"}`}>{a.saved}</div>
            </div>

            <button onClick={() => toggle(a.id)}
              className={`w-12 h-6 rounded-full transition-all flex items-center p-0.5 flex-shrink-0 ${
                a.enabled ? "" : "bg-muted"
              }`}
              style={a.enabled ? { background: a.color } : {}}>
              <div className={`w-5 h-5 rounded-full bg-background shadow-md transition-all ${
                a.enabled ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
