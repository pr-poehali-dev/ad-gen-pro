import { useState } from "react";
import Icon from "@/components/ui/icon";

const campaigns = [
  { id: 1, name: "Зимняя коллекция 2025", platform: "yandex", status: "active", budget: 25000, spent: 12400, impressions: 398220, clicks: 12440, ctr: 3.12, ads: 48 },
  { id: 2, name: "Смартфоны - Март", platform: "google", status: "active", budget: 18000, spent: 9800, impressions: 344770, clicks: 9790, ctr: 2.84, ads: 32 },
  { id: 3, name: "Акция 8 марта", platform: "yandex", status: "paused", budget: 10000, spent: 7100, impressions: 369540, clicks: 7100, ctr: 1.92, ads: 20 },
  { id: 4, name: "Бытовая техника Q1", platform: "google", status: "draft", budget: 30000, spent: 0, impressions: 0, clicks: 0, ctr: 0, ads: 0 },
  { id: 5, name: "Новогодние скидки", platform: "yandex", status: "active", budget: 45000, spent: 21300, impressions: 531120, clicks: 21300, ctr: 4.01, ads: 90 },
  { id: 6, name: "Весенние новинки", platform: "google", status: "draft", budget: 15000, spent: 0, impressions: 0, clicks: 0, ctr: 0, ads: 5 },
];

const platformIcon = { yandex: "🟡", google: "🔵" };
const platformName = { yandex: "Яндекс Директ", google: "Google Ads" };

export default function Campaigns() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Рекламные кампании</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление и мониторинг всех кампаний</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background"
          style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
        >
          <Icon name="Plus" size={16} />
          Новая кампания
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Всего кампаний", value: "6", icon: "Megaphone", color: 'hsl(185,100%,55%)' },
          { label: "Активных", value: "3", icon: "Play", color: 'hsl(145,70%,50%)' },
          { label: "На паузе", value: "1", icon: "Pause", color: 'hsl(30,100%,60%)' },
          { label: "Черновики", value: "2", icon: "FileEdit", color: 'hsl(260,80%,65%)' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
              <Icon name={s.icon} size={17} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-heading font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { id: "all", label: "Все" },
          { id: "active", label: "Активные" },
          { id: "paused", label: "На паузе" },
          { id: "draft", label: "Черновики" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.id
                ? "text-background"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
            style={filter === f.id ? {
              background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))'
            } : {}}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск кампаний..."
              className="pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 w-52 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="glass glass-hover rounded-2xl p-5 flex items-center gap-5">
            {/* Platform + name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{platformIcon[c.platform as keyof typeof platformIcon]}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{platformName[c.platform as keyof typeof platformName]} · {c.ads} объявлений</div>
              </div>
            </div>

            {/* Status */}
            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${
              c.status === 'active' ? 'status-active'
              : c.status === 'paused' ? 'status-paused'
              : 'status-draft'
            }`}>
              {c.status === 'active' ? 'Активна' : c.status === 'paused' ? 'Пауза' : 'Черновик'}
            </span>

            {/* Budget bar */}
            <div className="w-36 flex-shrink-0">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Бюджет</span>
                <span className="text-foreground font-medium">₽{(c.spent/1000).toFixed(1)}k / ₽{(c.budget/1000).toFixed(0)}k</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${c.budget > 0 ? (c.spent / c.budget) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, hsl(185,100%,55%), hsl(260,80%,65%))'
                  }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-6 text-center flex-shrink-0">
              <div>
                <div className="text-xs text-muted-foreground">Показы</div>
                <div className="text-sm font-semibold text-foreground">
                  {c.impressions > 0 ? (c.impressions / 1000).toFixed(0) + 'k' : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Клики</div>
                <div className="text-sm font-semibold text-foreground">
                  {c.clicks > 0 ? (c.clicks / 1000).toFixed(1) + 'k' : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">CTR</div>
                <div className={`text-sm font-semibold ${c.ctr > 0 ? 'metric-up' : 'text-muted-foreground'}`}>
                  {c.ctr > 0 ? c.ctr + '%' : '—'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors">
                <Icon name={c.status === 'active' ? 'Pause' : 'Play'} size={15} />
              </button>
              <button className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="Settings" size={15} />
              </button>
              <button className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="BarChart2" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
