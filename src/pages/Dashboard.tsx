import Icon from "@/components/ui/icon";

const metrics = [
  {
    label: "Показы",
    value: "4 821 340",
    change: "+18.4%",
    up: true,
    icon: "Eye",
    color: "cyan",
    grad: "bg-grad-cyan",
  },
  {
    label: "Клики",
    value: "128 740",
    change: "+7.2%",
    up: true,
    icon: "MousePointerClick",
    color: "violet",
    grad: "bg-grad-violet",
  },
  {
    label: "CTR",
    value: "2.67%",
    change: "-0.3%",
    up: false,
    icon: "Percent",
    color: "orange",
    grad: "bg-grad-orange",
  },
  {
    label: "Расход",
    value: "₽ 84 230",
    change: "+22.1%",
    up: false,
    icon: "Wallet",
    color: "green",
    grad: "bg-grad-green",
  },
];

const recentCampaigns = [
  { name: "Зимняя коллекция 2025", platform: "Яндекс Директ", status: "active", ctr: "3.12%", spend: "₽ 12 400", impressions: "398 220" },
  { name: "Смартфоны - Март", platform: "Google Ads", status: "active", ctr: "2.84%", spend: "₽ 9 800", impressions: "344 770" },
  { name: "Акция 8 марта", platform: "Яндекс Директ", status: "paused", ctr: "1.92%", spend: "₽ 7 100", impressions: "369 540" },
  { name: "Бытовая техника Q1", platform: "Google Ads", status: "draft", ctr: "—", spend: "₽ 0", impressions: "—" },
  { name: "Новогодние скидки", platform: "Яндекс Директ", status: "active", ctr: "4.01%", spend: "₽ 21 300", impressions: "531 120" },
];

const chartData = [42, 67, 55, 80, 91, 78, 95, 88, 102, 115, 108, 124];
const chartLabels = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const maxVal = Math.max(...chartData);

export default function Dashboard() {
  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Дашборд</h1>
          <p className="text-muted-foreground text-sm mt-1">Обзор рекламных кампаний · Май 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Calendar" size={15} />
            Последние 30 дней
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
          >
            <Icon name="RefreshCw" size={15} />
            Обновить
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="glass glass-hover rounded-2xl p-5 relative overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Icon bg */}
            <div
              className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${m.grad}`}
              style={{ opacity: 0.9 }}
            >
              <Icon name={m.icon} size={18} className="text-background" />
            </div>
            <div className="text-xs text-muted-foreground font-medium mb-2">{m.label}</div>
            <div className="font-heading text-xl font-bold text-foreground mb-1">{m.value}</div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${m.up ? "metric-up" : "metric-down"}`}>
              <Icon name={m.up ? "TrendingUp" : "TrendingDown"} size={13} />
              {m.change} к прошлому месяцу
            </div>
            {/* Bottom glow line */}
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

      {/* Chart + Activity */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {/* Chart */}
        <div className="col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-foreground">Клики по месяцам</h3>
              <p className="text-xs text-muted-foreground mt-0.5">тысяч кликов · 2025–2026</p>
            </div>
            <div className="flex gap-2">
              {["Клики", "Показы", "CTR"].map((t, i) => (
                <button key={i} className={`text-xs px-3 py-1 rounded-lg transition-all ${
                  i === 0
                    ? "text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                  style={i === 0 ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Bar chart */}
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
                    {val}k
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground">{chartLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform split */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-heading font-bold text-foreground mb-1">Площадки</h3>
          <p className="text-xs text-muted-foreground mb-5">Расход по платформам</p>
          <div className="space-y-4">
            {[
              { name: "Яндекс Директ", pct: 58, color: 'hsl(30,100%,60%)', spend: "₽ 48 900" },
              { name: "Google Ads", pct: 34, color: 'hsl(185,100%,55%)', spend: "₽ 28 700" },
              { name: "VK Реклама", pct: 8, color: 'hsl(260,80%,65%)', spend: "₽ 6 630" },
            ].map((p, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-foreground font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.pct}% · {p.spend}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.pct}%`, background: p.color, boxShadow: `0 0 8px ${p.color}50` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Итого расход</span>
              <span className="font-heading font-bold text-foreground">₽ 84 230</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h3 className="font-heading font-bold text-foreground">Активные кампании</h3>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            Все кампании →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              {["Название", "Платформа", "Статус", "CTR", "Расход", "Показы"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentCampaigns.map((c, i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">{c.platform}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    c.status === 'active' ? 'status-active'
                    : c.status === 'paused' ? 'status-paused'
                    : 'status-draft'
                  }`}>
                    {c.status === 'active' ? 'Активна' : c.status === 'paused' ? 'Пауза' : 'Черновик'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-medium">{c.ctr}</td>
                <td className="px-6 py-4 text-sm text-foreground">{c.spend}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{c.impressions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
