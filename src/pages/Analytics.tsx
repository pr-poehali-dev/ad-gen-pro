import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Campaign } from "@/App";

interface AnalyticsProps {
  campaigns: Campaign[];
}

export default function Analytics({ campaigns }: AnalyticsProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "yandex" | "google">("all");

  const filtered = campaigns.filter(c => selectedPlatform === "all" || c.platform === selectedPlatform);

  const totalImpressions = filtered.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = filtered.reduce((s, c) => s + c.clicks, 0);
  const totalSpent = filtered.reduce((s, c) => s + c.spent, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";
  const cpc = totalClicks > 0 ? (totalSpent / totalClicks).toFixed(0) : "0";
  const cpm = totalImpressions > 0 ? ((totalSpent / totalImpressions) * 1000).toFixed(0) : "0";

  // Топ объявлений (по CTR)
  const topByCtr = [...filtered].sort((a, b) => b.ctr - a.ctr).slice(0, 5);
  const topBySpend = [...filtered].sort((a, b) => b.spent - a.spent).slice(0, 5);

  // График — 7 точек
  const points = 7;
  const series = Array.from({ length: points }, (_, i) => {
    const base = totalClicks / points;
    return Math.max(10, Math.round(base + Math.sin(i * 0.9) * base * 0.4));
  });
  const max = Math.max(...series, 1);

  const periodLabels = { "7d": "Последние 7 дней", "30d": "Последние 30 дней", "90d": "Последние 90 дней" };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Аналитика</h1>
          <p className="text-muted-foreground text-sm mt-1">Глубокий анализ эффективности рекламных кампаний</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            {(["7d", "30d", "90d"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? "text-background" : "text-muted-foreground hover:text-foreground"}`}
                style={period === p ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}>
                {p === "7d" ? "7 дней" : p === "30d" ? "30 дней" : "90 дней"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: "all" as const, label: "Все площадки" },
          { id: "yandex" as const, label: "🟡 Яндекс Директ" },
          { id: "google" as const, label: "🔵 Google Ads" },
        ].map(t => (
          <button key={t.id} onClick={() => setSelectedPlatform(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedPlatform === t.id ? "text-background" : "glass text-muted-foreground hover:text-foreground"}`}
            style={selectedPlatform === t.id ? { background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(290,70%,60%))' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {[
          { label: "Показы", value: totalImpressions > 1000 ? (totalImpressions / 1000).toFixed(0) + "k" : String(totalImpressions), icon: "Eye", color: 'hsl(185,100%,55%)' },
          { label: "Клики", value: totalClicks > 1000 ? (totalClicks / 1000).toFixed(1) + "k" : String(totalClicks), icon: "MousePointerClick", color: 'hsl(260,80%,65%)' },
          { label: "CTR", value: avgCtr + "%", icon: "Percent", color: 'hsl(30,100%,60%)' },
          { label: "Расход", value: "₽" + (totalSpent / 1000).toFixed(1) + "k", icon: "Wallet", color: 'hsl(145,70%,50%)' },
          { label: "Цена клика", value: "₽" + cpc, icon: "TrendingDown", color: 'hsl(0,75%,60%)' },
          { label: "Цена 1k показов", value: "₽" + cpm, icon: "BarChart3", color: 'hsl(200,80%,55%)' },
        ].map((m, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${m.color}20`, border: `1px solid ${m.color}40` }}>
                <Icon name={m.icon} size={14} style={{ color: m.color }} />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{m.label}</span>
            </div>
            <div className="font-heading text-lg font-bold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Динамика */}
        <div className="col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading font-bold text-foreground">Динамика кликов</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{periodLabels[period]}</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-44">
            {series.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg relative group cursor-pointer transition-all hover:opacity-80"
                  style={{
                    height: `${(v / max) * 100}%`,
                    background: 'linear-gradient(180deg, hsl(185,100%,55%) 0%, hsl(260,80%,55%) 100%)',
                  }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-card border border-border px-1.5 py-0.5 rounded text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {v.toLocaleString("ru-RU")}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{`Д${i + 1}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soруrces */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading font-bold text-foreground mb-1">Источники конверсий</h3>
          <p className="text-xs text-muted-foreground mb-5">по UTM-меткам</p>
          <div className="space-y-3">
            {[
              { name: "Поиск", pct: 48, color: 'hsl(185,100%,55%)' },
              { name: "Сети", pct: 32, color: 'hsl(260,80%,65%)' },
              { name: "Ретаргетинг", pct: 14, color: 'hsl(30,100%,60%)' },
              { name: "Прямые", pct: 6, color: 'hsl(145,70%,50%)' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%`, background: s.color, boxShadow: `0 0 8px ${s.color}50` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top performers */}
      <div className="grid grid-cols-2 gap-5">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
            <Icon name="TrendingUp" size={16} className="text-neon-green" />
            <h3 className="font-heading font-bold text-foreground">Топ по CTR</h3>
          </div>
          {topByCtr.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <div className="divide-y divide-border/20">
              {topByCtr.map((c, i) => (
                <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-background"
                    style={{ background: i === 0 ? 'linear-gradient(135deg, hsl(45,100%,55%), hsl(30,100%,55%))' : 'hsl(220, 15%, 30%)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.platform === "yandex" ? "Яндекс" : "Google"}</div>
                  </div>
                  <span className="text-sm font-bold metric-up">{c.ctr > 0 ? c.ctr + "%" : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
            <Icon name="Wallet" size={16} className="text-neon-cyan" />
            <h3 className="font-heading font-bold text-foreground">Топ по расходу</h3>
          </div>
          {topBySpend.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <div className="divide-y divide-border/20">
              {topBySpend.map((c, i) => (
                <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-background"
                    style={{ background: i === 0 ? 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,55%))' : 'hsl(220, 15%, 30%)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.platform === "yandex" ? "Яндекс" : "Google"}</div>
                  </div>
                  <span className="text-sm font-bold text-foreground">₽{(c.spent / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
