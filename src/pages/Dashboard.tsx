import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Page } from "@/App";
import { ydApi } from "./yd/api";
import { CAMPAIGN_TYPE_META, STATUS_LABEL, STATUS_COLOR } from "./yd/types";
import type { YdCampaignListItem } from "./yd/types";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<YdCampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    ydApi.list()
      .then((d) => setItems(d.campaigns))
      .catch((e) => toast({ title: "Не удалось загрузить", description: String(e) }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Чтобы видеть свои кампании на дашборде</div>
        </div>
      </div>
    );
  }

  const total = items.length;
  const byStatus = {
    draft: items.filter((c) => c.status === "draft").length,
    ready: items.filter((c) => c.status === "ready").length,
    exported: items.filter((c) => c.status === "exported").length,
    sent: items.filter((c) => c.status === "sent").length,
  };
  const totalGroups = items.reduce((s, c) => s + (c.groups_count || 0), 0);
  const totalAds = items.reduce((s, c) => s + (c.ads_count || 0), 0);
  const totalKw = items.reduce((s, c) => s + (c.keywords_count || 0), 0);
  const totalDailyBudget = items.reduce((s, c) => s + (c.daily_budget || 0), 0);
  const totalWeeklyBudget = items.reduce((s, c) => s + (c.weekly_budget || 0), 0);

  const byType = {
    text: items.filter((c) => c.campaign_type === "text").length,
    network: items.filter((c) => c.campaign_type === "network").length,
    master: items.filter((c) => c.campaign_type === "master").length,
  };

  const recent = [...items]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const metrics = [
    { label: "Кампаний", value: total, icon: "Megaphone", grad: "bg-grad-cyan", sub: `${byStatus.draft} в черновике` },
    { label: "Групп", value: totalGroups, icon: "Layers", grad: "bg-grad-violet", sub: "во всех кампаниях" },
    { label: "Объявлений", value: totalAds, icon: "FileText", grad: "bg-grad-orange", sub: "во всех группах" },
    { label: "Фраз", value: totalKw, icon: "KeyRound", grad: "bg-grad-green", sub: "ключевых слов" },
  ];

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Дашборд</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Кампании Яндекс Директ из вашего кабинета
          </p>
        </div>
        <button onClick={() => onNavigate("campaigns")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))" }}>
          <Icon name="Megaphone" size={15} /> Все кампании
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
        </div>
      ) : total === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="Megaphone" size={40} className="text-muted-foreground/50 mx-auto mb-3" />
          <div className="font-heading font-bold text-foreground mb-1">Пока нет кампаний</div>
          <div className="text-sm text-muted-foreground mb-4">Создайте первую — пройдёте мастер за 6 шагов</div>
          <button onClick={() => onNavigate("campaigns")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Plus" size={14} /> Создать кампанию
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
            {metrics.map((m, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-5 relative overflow-hidden">
                <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${m.grad}`} style={{ opacity: 0.9 }}>
                  <Icon name={m.icon} size={18} className="text-background" />
                </div>
                <div className="text-xs text-muted-foreground font-medium mb-2">{m.label}</div>
                <div className="font-heading text-2xl font-bold text-foreground mb-1">{m.value.toLocaleString("ru-RU")}</div>
                <div className="text-xs text-muted-foreground">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
            {/* Распределение по статусам */}
            <div className="md:col-span-2 glass rounded-2xl p-4 md:p-6">
              <h3 className="font-heading font-bold text-foreground mb-1">Статусы кампаний</h3>
              <p className="text-xs text-muted-foreground mb-5">Распределение по этапам</p>
              <div className="space-y-3">
                {(["draft", "ready", "exported", "sent"] as const).map((st) => {
                  const v = byStatus[st];
                  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return (
                    <div key={st}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-foreground font-medium">{STATUS_LABEL[st]}</span>
                        <span className="text-xs text-muted-foreground">{v} · {pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: STATUS_COLOR[st], boxShadow: `0 0 8px ${STATUS_COLOR[st]}50` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Бюджеты */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-1">Бюджеты</h3>
              <p className="text-xs text-muted-foreground mb-5">Сумма по всем кампаниям</p>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Дневной</div>
                  <div className="font-heading text-2xl font-bold text-foreground">
                    ₽ {Math.round(totalDailyBudget).toLocaleString("ru-RU")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Недельный</div>
                  <div className="font-heading text-2xl font-bold text-foreground">
                    ₽ {Math.round(totalWeeklyBudget).toLocaleString("ru-RU")}
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
                {(["text", "network", "master"] as const).map((t) => {
                  const m = CAMPAIGN_TYPE_META[t];
                  return (
                    <div key={t} className="bg-muted/20 rounded-lg p-2">
                      <Icon name={m.icon} size={14} style={{ color: m.color }} className="mx-auto mb-0.5" />
                      <div className="text-base font-heading font-bold text-foreground">{byType[t]}</div>
                      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">
                        {t === "text" ? "Поиск" : t === "network" ? "РСЯ" : "Мастер"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Последние кампании */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h3 className="font-heading font-bold text-foreground">Последние изменения</h3>
              <button onClick={() => onNavigate("campaigns")}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                Все кампании →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border/30">
                    {["Название", "Тип", "Группы", "Объявл.", "Фразы", "Статус", "Обновлено"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c) => {
                    const meta = CAMPAIGN_TYPE_META[c.campaign_type] || CAMPAIGN_TYPE_META.text;
                    return (
                      <tr key={c.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3">
                          <button onClick={() => onNavigate("campaigns")} className="text-sm font-medium text-foreground hover:text-neon-cyan text-left">
                            {c.name || "Без названия"}
                          </button>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-xs px-2 py-1 rounded font-medium" style={{ background: `${meta.color}20`, color: meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-foreground">{c.groups_count}</td>
                        <td className="px-6 py-3 text-sm text-foreground">{c.ads_count}</td>
                        <td className="px-6 py-3 text-sm text-foreground">{c.keywords_count}</td>
                        <td className="px-6 py-3">
                          <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                            style={{ background: `${STATUS_COLOR[c.status]}20`, color: STATUS_COLOR[c.status] }}>
                            {STATUS_LABEL[c.status]}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {new Date(c.updated_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
