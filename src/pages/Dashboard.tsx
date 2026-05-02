import Icon from "@/components/ui/icon";
import { Campaign, Page } from "@/App";

const chartLabels = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

interface DashboardProps {
  campaigns: Campaign[];
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ campaigns, onNavigate }: DashboardProps) {
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  const yandexSpent = campaigns.filter(c => c.platform === "yandex").reduce((s, c) => s + c.spent, 0);
  const googleSpent = campaigns.filter(c => c.platform === "google").reduce((s, c) => s + c.spent, 0);
  const yandexPct = totalSpent > 0 ? Math.round((yandexSpent / totalSpent) * 100) : 0;
  const googlePct = totalSpent > 0 ? Math.round((googleSpent / totalSpent) * 100) : 0;
  const vkPct = Math.max(0, 100 - yandexPct - googlePct);

  const activeCampaigns = campaigns.filter(c => c.status === "active");

  const chartData = chartLabels.map((_, i) => {
    const base = Math.round(totalClicks / 12);
    const variance = Math.round(base * 0.3);
    return Math.max(1, base + Math.round(Math.sin(i * 0.8) * variance));
  });
  const maxVal = Math.max(...chartData, 1);

  const metrics = [
    { label: "Показы", value: totalImpressions > 0 ? (totalImpressions / 1000).toFixed(0) + "k" : "—", icon: "Eye", color: "cyan", grad: "bg-grad-cyan", sub: `${activeCampaigns.length} актив. кампаний` },
    { label: "Клики", value: totalClicks > 0 ? totalClicks.toLocaleString("ru-RU") : "—", icon: "MousePointerClick", color: "violet", grad: "bg-grad-violet", sub: "за всё время" },
    { label: "CTR", value: avgCtr + "%", icon: "Percent", color: "orange", grad: "bg-grad-orange", sub: "средний по кампаниям" },
    { label: "Расход", value: totalSpent > 0 ? "₽ " + totalSpent.toLocaleString("ru-RU") : "₽ 0", icon: "Wallet", color: "green", grad: "bg-grad-green", sub: "суммарный бюджет" },
  ];

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Дашборд</h1>
          <p className="text-muted-foreground text-sm mt-1">Обзор рекламных кампаний · Май 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("campaigns")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
          >
            <Icon name="Megaphone" size={15} />
            Все кампании
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="glass glass-hover rounded-2xl p-5 relative overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${m.grad}`} style={{ opacity: 0.9 }}>
              <Icon name={m.icon} size={18} className="text-background" />
            </div>
            <div className="text-xs text-muted-foreground font-medium mb-2">{m.label}</div>
            <div className="font-heading text-xl font-bold text-foreground mb-1">{m.value}</div>
            <div className="text-xs text-muted-foreground">{m.sub}</div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl opacity-50"
              style={{
                background: m.color === 'cyan' ? 'hsl(185,100%,55%)'
                  : m.color === 'violet' ? 'hsl(260,80%,65%)'
                  : m.color === 'orange' ? 'hsl(30,100%,60%)'
                  : 'hsl(145,70%,50%)'
              }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="md:col-span-2 glass rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-foreground">Клики по месяцам</h3>
              <p className="text-xs text-muted-foreground mt-0.5">на основе текущих кампаний · 2025–2026</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all hover:opacity-80 relative group cursor-pointer"
                  style={{
                    height: `${(val / maxVal) * 100}%`,
                    background: i === chartData.length - 1
                      ? 'linear-gradient(180deg, hsl(185,100%,55%), hsl(200,100%,50%))'
                      : 'linear-gradient(180deg, hsl(260,80%,65%) 0%, hsl(230,50%,35%) 100%)',
                    opacity: i === chartData.length - 1 ? 1 : 0.7
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-card border border-border px-1 py-0.5 rounded text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val.toLocaleString("ru-RU")}
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground">{chartLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading font-bold text-foreground mb-1">Площадки</h3>
          <p className="text-xs text-muted-foreground mb-5">Расход по платформам</p>
          {totalSpent > 0 ? (
            <div className="space-y-4">
              {[
                { name: "Яндекс Директ", pct: yandexPct, color: 'hsl(30,100%,60%)', spend: "₽ " + yandexSpent.toLocaleString("ru-RU") },
                { name: "Google Ads", pct: googlePct, color: 'hsl(185,100%,55%)', spend: "₽ " + googleSpent.toLocaleString("ru-RU") },
                { name: "VK Реклама", pct: vkPct, color: 'hsl(260,80%,65%)', spend: "₽ 0" },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-foreground font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.pct}% · {p.spend}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${p.pct}%`, background: p.color, boxShadow: `0 0 8px ${p.color}50` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-6">Нет данных о расходах</div>
          )}
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Итого расход</span>
              <span className="font-heading font-bold text-foreground">₽ {totalSpent.toLocaleString("ru-RU")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h3 className="font-heading font-bold text-foreground">Активные кампании</h3>
          <button
            onClick={() => onNavigate("campaigns")}
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Все кампании →
          </button>
        </div>
        {activeCampaigns.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            Нет активных кампаний.{" "}
            <button onClick={() => onNavigate("campaigns")} className="text-neon-cyan hover:underline">Создать кампанию →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border/30">
                {["Кампания", "Платформа", "Статус", "CTR", "Расход", "Показы"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeCampaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{c.platform === "yandex" ? "Яндекс Директ" : "Google Ads"}</td>
                  <td className="px-6 py-4">
                    <span className="status-active text-xs px-2.5 py-1 rounded-lg font-semibold">Активна</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold metric-up">{c.ctr > 0 ? c.ctr + "%" : "—"}</td>
                  <td className="px-6 py-4 text-sm text-foreground">₽ {c.spent.toLocaleString("ru-RU")}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{c.impressions > 0 ? (c.impressions / 1000).toFixed(0) + "k" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}