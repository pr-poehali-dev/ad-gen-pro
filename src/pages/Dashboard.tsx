import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import { Page } from "@/App";
import { CAMPAIGN_TYPE_META, STATUS_LABEL, STATUS_COLOR } from "./yd/types";
import func2url from "../../backend/func2url.json";

const DASHBOARD_URL = (func2url as Record<string, string>).dashboard;

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

interface Overview {
  campaigns: {
    total: number;
    by_status: { draft: number; ready: number; exported: number; sent: number };
    by_type: { text: number; network: number; master: number };
    total_daily_budget: number;
    total_weekly_budget: number;
  };
  structure: { groups: number; ads: number; keywords: number };
  feeds: { count: number; products: number };
  schedule: { upcoming: number; overdue: number; done: number };
  next_events: {
    id: number;
    event_date: string;
    event_time: string;
    action: string;
    title: string;
    campaign_name?: string;
  }[];
  automations: { total: number; enabled: number; total_runs: number; total_triggers: number };
  recent_runs: {
    id: number;
    triggered: boolean;
    target_label: string;
    metric_value: number;
    action_taken: string;
    created_at: string;
    rule_name: string;
    metric: string;
    action_type: string;
  }[];
  leads: { total: number; last_week: number; new: number; won: number; won_amount: number };
  activity: { day: string; count: number }[];
}

const ACTION_ICON: Record<string, { icon: string; color: string; label: string }> = {
  launch: { icon: "Play", color: "hsl(145,70%,50%)", label: "Запуск" },
  pause: { icon: "Pause", color: "hsl(30,100%,60%)", label: "Пауза" },
  report: { icon: "FileText", color: "hsl(185,100%,55%)", label: "Отчёт" },
  custom: { icon: "Circle", color: "hsl(260,80%,65%)", label: "Другое" },
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    fetch(`${DASHBOARD_URL}?action=overview`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d as Overview);
      })
      .catch((e) => toast({ title: "Не удалось загрузить", description: String(e) }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Чтобы видеть свой дашборд</div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
        </div>
      </div>
    );
  }

  const totalCampaigns = data.campaigns.total;
  const totalGroups = data.structure.groups;
  const totalAds = data.structure.ads;
  const totalKw = data.structure.keywords;
  const dailyBudget = data.campaigns.total_daily_budget;
  const triggerRate = data.automations.total_runs > 0
    ? Math.round((data.automations.total_triggers * 100) / data.automations.total_runs)
    : 0;

  const last14Days: { day: string; count: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = data.activity.find((a) => a.day === key);
    last14Days.push({ day: key, count: found?.count || 0 });
  }
  const activityMax = Math.max(1, ...last14Days.map((a) => a.count));

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Дашборд</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Сводка по кампаниям, фидам, расписанию, автоматизациям и лидам
          </p>
        </div>
        <button onClick={() => onNavigate("campaigns")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))" }}>
          <Icon name="Megaphone" size={15} /> Все кампании
        </button>
      </div>

      {totalCampaigns === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="Megaphone" size={40} className="text-muted-foreground/50 mx-auto mb-3" />
          <div className="font-heading font-bold text-foreground mb-1">Пока нет кампаний</div>
          <div className="text-sm text-muted-foreground mb-4">Создайте первую — мастер за 6 шагов</div>
          <button onClick={() => onNavigate("campaigns")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Plus" size={14} /> Создать кампанию
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
            <Metric icon="Megaphone" grad="bg-grad-cyan" label="Кампаний" value={totalCampaigns}
              sub={`${data.campaigns.by_status.draft} в работе · ${data.campaigns.by_status.ready} готовы`} />
            <Metric icon="Layers" grad="bg-grad-violet" label="Группы / Объявл." value={`${totalGroups} / ${totalAds}`}
              sub={`${totalKw.toLocaleString("ru-RU")} ключ. фраз`} />
            <Metric icon="Wallet" grad="bg-grad-orange" label="Бюджет/день" value={`₽ ${Math.round(dailyBudget).toLocaleString("ru-RU")}`}
              sub={`~ ₽ ${Math.round(dailyBudget * 30).toLocaleString("ru-RU")} в месяц`} />
            <Metric icon="Database" grad="bg-grad-green" label="Товаров в фидах" value={data.feeds.products.toLocaleString("ru-RU")}
              sub={`${data.feeds.count} ${data.feeds.count === 1 ? "фид" : "фидов"}`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="md:col-span-2 glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-foreground">Статусы кампаний</h3>
                  <p className="text-xs text-muted-foreground">Распределение по этапам</p>
                </div>
                <button onClick={() => onNavigate("campaigns")} className="text-[11px] px-2 py-1 rounded-lg text-muted-foreground hover:bg-muted/30">
                  открыть →
                </button>
              </div>
              <div className="space-y-3">
                {(["draft", "ready", "exported", "sent"] as const).map((st) => {
                  const v = data.campaigns.by_status[st];
                  const pct = totalCampaigns > 0 ? Math.round((v / totalCampaigns) * 100) : 0;
                  return (
                    <div key={st}>
                      <div className="flex justify-between items-center mb-1">
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
              <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-2 text-center">
                {(["text", "network", "master"] as const).map((t) => {
                  const m = CAMPAIGN_TYPE_META[t];
                  return (
                    <div key={t} className="bg-muted/20 rounded-lg p-2">
                      <Icon name={m.icon} size={14} style={{ color: m.color }} className="mx-auto mb-0.5" />
                      <div className="text-base font-heading font-bold text-foreground">{data.campaigns.by_type[t]}</div>
                      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">
                        {t === "text" ? "Поиск" : t === "network" ? "РСЯ" : "Мастер"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="font-heading font-bold text-foreground mb-1">Активность</h3>
              <p className="text-xs text-muted-foreground mb-4">Изменения кампаний за 14 дней</p>
              <div className="flex items-end gap-1 h-24">
                {last14Days.map((a, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full rounded-t-md transition-opacity relative cursor-pointer"
                      style={{
                        height: `${Math.max(2, (a.count / activityMax) * 100)}%`,
                        background: a.count > 0 ? "linear-gradient(180deg, hsl(185,100%,55%), hsl(260,80%,65%))" : "hsl(220,10%,30%)",
                        opacity: a.count > 0 ? 1 : 0.3,
                      }} title={`${new Date(a.day).toLocaleDateString("ru-RU")}: ${a.count}`} />
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground text-center mt-2">
                {new Date(last14Days[0].day).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                {" — "}
                {new Date(last14Days[13].day).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <Panel
              icon="CalendarDays"
              color="hsl(185,100%,55%)"
              title="Расписание"
              onOpen={() => onNavigate("calendar")}
              metrics={[
                { label: "Предстоит", value: data.schedule.upcoming, color: "hsl(185,100%,55%)" },
                { label: "Просрочено", value: data.schedule.overdue, color: "hsl(0,75%,60%)" },
                { label: "Готово", value: data.schedule.done, color: "hsl(145,70%,50%)" },
              ]}>
              {data.next_events.length === 0 ? (
                <div className="text-[11px] text-muted-foreground text-center py-1">Событий нет</div>
              ) : (
                <div className="space-y-1.5">
                  {data.next_events.slice(0, 3).map((e) => {
                    const m = ACTION_ICON[e.action] || ACTION_ICON.custom;
                    return (
                      <div key={e.id} className="flex items-center gap-2 text-[11px]">
                        <Icon name={m.icon} size={10} style={{ color: m.color }} />
                        <span className="truncate flex-1 text-foreground">{e.campaign_name || e.title || m.label}</span>
                        <span className="text-muted-foreground">
                          {new Date(e.event_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel
              icon="Bot"
              color="hsl(260,80%,65%)"
              title="Автоматизации"
              onOpen={() => onNavigate("automations")}
              metrics={[
                { label: "Активных", value: data.automations.enabled, color: "hsl(145,70%,50%)" },
                { label: "Проверок", value: data.automations.total_runs, color: "hsl(185,100%,55%)" },
                { label: "Триггеров", value: data.automations.total_triggers, color: "hsl(0,75%,60%)" },
              ]}>
              <div className="text-[11px] text-muted-foreground">
                Конверсия в действие:{" "}
                <span className="font-bold text-foreground">{triggerRate}%</span>
              </div>
            </Panel>

            <Panel
              icon="Users"
              color="hsl(30,100%,60%)"
              title="Лиды"
              onOpen={() => onNavigate("services")}
              metrics={[
                { label: "Всего", value: data.leads.total, color: "hsl(220,10%,55%)" },
                { label: "За нед.", value: data.leads.last_week, color: "hsl(185,100%,55%)" },
                { label: "Сделок", value: data.leads.won, color: "hsl(145,70%,50%)" },
              ]}>
              {data.leads.won_amount > 0 ? (
                <div className="text-[11px] text-muted-foreground">
                  Выручка: <span className="font-bold text-neon-green">₽ {data.leads.won_amount.toLocaleString("ru-RU")}</span>
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground">Заявки приходят с лендинга</div>
              )}
            </Panel>

            <Panel
              icon="Database"
              color="hsl(145,70%,50%)"
              title="Товарные фиды"
              onOpen={() => onNavigate("feeds")}
              metrics={[
                { label: "Фидов", value: data.feeds.count, color: "hsl(185,100%,55%)" },
                { label: "Товаров", value: data.feeds.products, color: "hsl(145,70%,50%)" },
              ]}>
              <div className="text-[11px] text-muted-foreground">
                {data.feeds.count > 0 ? "Используются для генерации объявлений" : "Загрузите YML или CSV"}
              </div>
            </Panel>
          </div>

          {data.recent_runs.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                <h3 className="font-heading font-bold text-foreground">Последние срабатывания автоматизаций</h3>
                <button onClick={() => onNavigate("automations")} className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/30">
                  Все правила →
                </button>
              </div>
              <div className="divide-y divide-border/20">
                {data.recent_runs.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: r.triggered ? "hsl(0,75%,60%,0.2)" : "hsl(145,70%,50%,0.15)",
                        color: r.triggered ? "hsl(0,75%,60%)" : "hsl(145,70%,50%)",
                      }}>
                      <Icon name={r.triggered ? "Zap" : "Check"} size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{r.rule_name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.target_label} · {r.metric}: {r.metric_value} · {r.action_taken}
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ icon, grad, label, value, sub }: {
  icon: string; grad: string; label: string; value: string | number; sub: string;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 relative overflow-hidden">
      <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${grad}`} style={{ opacity: 0.9 }}>
        <Icon name={icon} size={18} className="text-background" />
      </div>
      <div className="text-xs text-muted-foreground font-medium mb-2">{label}</div>
      <div className="font-heading text-2xl font-bold text-foreground mb-1">
        {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
      </div>
      <div className="text-xs text-muted-foreground truncate">{sub}</div>
    </div>
  );
}

function Panel({ icon, color, title, onOpen, metrics, children }: {
  icon: string; color: string; title: string; onOpen: () => void;
  metrics: { label: string; value: number; color: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <Icon name={icon} size={14} style={{ color }} />
          </div>
          <div className="font-heading font-bold text-sm text-foreground">{title}</div>
        </div>
        <button onClick={onOpen} className="text-[10px] text-muted-foreground hover:text-foreground">
          →
        </button>
      </div>
      <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}>
        {metrics.map((m, i) => (
          <div key={i} className="bg-muted/20 rounded-lg p-1.5 text-center">
            <div className="text-base font-heading font-bold" style={{ color: m.color }}>
              {m.value.toLocaleString("ru-RU")}
            </div>
            <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{m.label}</div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
