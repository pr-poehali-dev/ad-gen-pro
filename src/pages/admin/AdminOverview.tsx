import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { adminApi } from "./adminApi";

interface OverviewData {
  stats: Record<string, number>;
  revenue_chart: { day: string; revenue: number; count: number }[];
  users_chart: { day: string; count: number }[];
  top_products: { name: string; count: number; revenue: number }[];
}

const fmt = (n: number) => n.toLocaleString("ru-RU");
const fmtRub = (n: number) => `${n.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽`;

export default function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .overview()
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" /></div>;
  if (error) return <div className="glass rounded-2xl p-6 text-neon-pink">{error}</div>;
  if (!data) return null;

  const s = data.stats;
  const maxRev = Math.max(...data.revenue_chart.map((c) => c.revenue), 1);
  const maxUsr = Math.max(...data.users_chart.map((c) => c.count), 1);

  const tiles = [
    { label: "Выручка сегодня", value: fmtRub(s.revenue_today || 0), sub: `${s.orders_today || 0} оплат`, color: "hsl(145,70%,50%)", icon: "Banknote" },
    { label: "Выручка за неделю", value: fmtRub(s.revenue_week || 0), sub: `${s.orders_week || 0} оплат`, color: "hsl(185,100%,55%)", icon: "TrendingUp" },
    { label: "Выручка за месяц", value: fmtRub(s.revenue_month || 0), sub: `${s.orders_month || 0} оплат`, color: "hsl(260,80%,65%)", icon: "Wallet" },
    { label: "Всего выручки", value: fmtRub(s.revenue_total || 0), sub: `${s.orders_paid_total || 0} оплат всего`, color: "hsl(320,80%,65%)", icon: "Crown" },
    { label: "Пользователей всего", value: fmt(s.users_total || 0), sub: `+${s.users_today || 0} сегодня`, color: "hsl(200,100%,55%)", icon: "Users" },
    { label: "Регистраций за неделю", value: fmt(s.users_week || 0), sub: `${s.users_month || 0} за месяц`, color: "hsl(30,100%,60%)", icon: "UserPlus" },
    { label: "Средний чек", value: fmtRub(s.avg_check || 0), sub: `Конверсия ${s.conversion_rate || 0}%`, color: "hsl(170,80%,50%)", icon: "Receipt" },
    { label: "Лиды без обработки", value: fmt(s.leads_new || 0), sub: `${s.leads_total || 0} лидов всего`, color: "hsl(15,80%,60%)", icon: "Inbox" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">Обзор бизнеса</h1>
        <p className="text-sm text-muted-foreground">Ключевые показатели в реальном времени</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t, i) => (
          <div key={i} className="glass rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: t.color }} />
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{t.label}</div>
              <Icon name={t.icon} size={14} style={{ color: t.color }} />
            </div>
            <div className="font-heading font-bold text-xl md:text-2xl text-foreground mb-0.5">{t.value}</div>
            <div className="text-[11px] text-muted-foreground">{t.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="TrendingUp" size={16} className="text-neon-green" />
            <h3 className="font-heading font-bold text-foreground">Выручка за 30 дней</h3>
          </div>
          {data.revenue_chart.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Пока нет оплаченных заказов</div>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {data.revenue_chart.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-t transition-all group-hover:opacity-80"
                    style={{
                      height: `${(c.revenue / maxRev) * 100}%`,
                      minHeight: c.revenue > 0 ? "4px" : "0",
                      background: "linear-gradient(180deg, hsl(145,70%,50%), hsl(185,100%,55%))",
                    }}
                    title={`${c.day}: ${fmtRub(c.revenue)}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Users" size={16} className="text-neon-cyan" />
            <h3 className="font-heading font-bold text-foreground">Регистрации за 30 дней</h3>
          </div>
          {data.users_chart.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Пока нет регистраций</div>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {data.users_chart.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-t transition-all group-hover:opacity-80"
                    style={{
                      height: `${(c.count / maxUsr) * 100}%`,
                      minHeight: c.count > 0 ? "4px" : "0",
                      background: "linear-gradient(180deg, hsl(185,100%,55%), hsl(260,80%,65%))",
                    }}
                    title={`${c.day}: ${c.count}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.top_products.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Trophy" size={16} className="text-neon-purple" />
            <h3 className="font-heading font-bold text-foreground">Топ-5 тарифов по выручке</h3>
          </div>
          <div className="space-y-2">
            {data.top_products.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-background flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.count} продаж</div>
                </div>
                <div className="font-heading font-bold text-foreground text-sm">{fmtRub(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
