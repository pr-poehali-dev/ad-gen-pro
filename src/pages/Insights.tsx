import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Page } from "@/App";
import { ydApi } from "./yd/api";
import { CAMPAIGN_TYPE_META } from "./yd/types";
import type { YdCampaignListItem } from "./yd/types";

interface InsightsProps {
  onNavigate: (page: Page) => void;
}

interface Insight {
  id: string;
  severity: "warning" | "opportunity" | "tip";
  title: string;
  description: string;
  action: string;
  impact: string;
  target: Page;
}

const severityMeta = {
  warning: { color: "hsl(0,75%,60%)", icon: "AlertTriangle", label: "Внимание" },
  opportunity: { color: "hsl(145,70%,50%)", icon: "Sparkles", label: "Возможность" },
  tip: { color: "hsl(185,100%,55%)", icon: "Lightbulb", label: "Совет" },
};

export default function Insights({ onNavigate }: InsightsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<YdCampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("matad_resolved_insights");
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    ydApi.list()
      .then((d) => setItems(d.campaigns))
      .catch((e) => toast({ title: "Не удалось загрузить", description: String(e) }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  const dismiss = (id: string) => {
    const next = new Set(resolved).add(id);
    setResolved(next);
    try {
      localStorage.setItem("matad_resolved_insights", JSON.stringify(Array.from(next)));
    } catch {/* noop */}
    toast({ title: "Инсайт отмечен решённым" });
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Инсайты строятся по вашим кампаниям</div>
        </div>
      </div>
    );
  }

  // Реальные инсайты по данным кампаний
  const insights: Insight[] = [];

  // Если кампаний вообще нет
  if (!loading && items.length === 0) {
    insights.push({
      id: "no-campaigns",
      severity: "opportunity",
      title: "Создайте первую кампанию",
      description: "Пройдите мастер за 6 шагов — тип, группы, объявления, фразы, регионы, бюджет.",
      action: "Создать",
      impact: "Старт за 10 минут",
      target: "campaigns",
    });
  }

  items.forEach((c) => {
    // Мало объявлений в кампании — низкое качество и непокрытые группы
    if (c.groups_count > 0 && c.ads_count < c.groups_count * 2) {
      insights.push({
        id: `ads-${c.id}`,
        severity: "warning",
        title: `Мало объявлений в «${c.name || "Без названия"}»`,
        description: `В каждой группе должно быть минимум 2 объявления для A/B теста. Сейчас ${c.ads_count} объявл. на ${c.groups_count} групп.`,
        action: "Добавить объявления",
        impact: "+30% к CTR",
        target: "campaigns",
      });
    }

    // Без ключевых фраз — кампания не покажется
    if (c.groups_count > 0 && c.keywords_count === 0 && c.campaign_type !== "master") {
      insights.push({
        id: `kw-${c.id}`,
        severity: "warning",
        title: `Нет ключевых фраз в «${c.name || "Без названия"}»`,
        description: "Без фраз кампания не получит показов. Добавьте минимум 10–20 фраз на группу.",
        action: "Добавить фразы",
        impact: "Кампания запустится",
        target: "campaigns",
      });
    }

    // Кампания без бюджета
    if (c.daily_budget === 0 && c.weekly_budget === 0 && c.status !== "draft") {
      insights.push({
        id: `budget-${c.id}`,
        severity: "warning",
        title: `Не задан бюджет для «${c.name || "Без названия"}»`,
        description: "Без бюджета ЯД не сможет распределять показы. Укажите дневной или недельный лимит.",
        action: "Указать бюджет",
        impact: "Корректный запуск",
        target: "campaigns",
      });
    }

    // Долгий черновик
    if (c.status === "draft" && c.step < 6) {
      const daysOld = Math.floor((Date.now() - new Date(c.updated_at).getTime()) / 86400000);
      if (daysOld >= 2) {
        insights.push({
          id: `draft-${c.id}`,
          severity: "tip",
          title: `Черновик «${c.name || "Без названия"}» уже ${daysOld} дн.`,
          description: `Кампания осталась на шаге ${c.step}/6. Дозаполните настройки или удалите черновик.`,
          action: "Открыть",
          impact: "Освободить кабинет",
          target: "campaigns",
        });
      }
    }

    // Готовая, но не экспортирована
    if (c.status === "ready") {
      insights.push({
        id: `export-${c.id}`,
        severity: "opportunity",
        title: `«${c.name || "Без названия"}» готова к запуску`,
        description: "Все шаги пройдены. Экспортируйте в Директ Коммандер или отправьте в API ЯД.",
        action: "Экспортировать",
        impact: "Быстрый запуск",
        target: "export",
      });
    }
  });

  // Общие подсказки
  if (items.length > 0 && items.every((c) => c.campaign_type !== "master")) {
    insights.push({
      id: "tip-master",
      severity: "tip",
      title: "Попробуйте «Мастер кампаний»",
      description: "Автоматическая кампания на основе целей и материалов — минимум настроек, ЯД сам подбирает аудиторию.",
      action: "Создать",
      impact: "−70% к ручной работе",
      target: "campaigns",
    });
  }

  if (items.length >= 3) {
    insights.push({
      id: "tip-feeds",
      severity: "opportunity",
      title: "Подключите товарный фид",
      description: "Загрузите YML или CSV с товарами — это даст возможность создавать динамические объявления.",
      action: "Загрузить фид",
      impact: "Сотни объявлений за минуту",
      target: "feeds",
    });
  }

  const visible = insights.filter((i) => !resolved.has(i.id));

  const counts = {
    warning: visible.filter((i) => i.severity === "warning").length,
    opportunity: visible.filter((i) => i.severity === "opportunity").length,
    tip: visible.filter((i) => i.severity === "tip").length,
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
          <Icon name="Brain" size={13} />
          Анализируем ваши кампании
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Инсайты и рекомендации</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI находит проблемы и точки роста по реальным данным из вашего кабинета
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
            <StatCard color="hsl(0,75%,60%)" icon="AlertTriangle" label="Требует внимания" value={counts.warning} />
            <StatCard color="hsl(145,70%,50%)" icon="Sparkles" label="Возможностей" value={counts.opportunity} />
            <StatCard color="hsl(185,100%,55%)" icon="Lightbulb" label="Советов" value={counts.tip} />
          </div>

          <div className="space-y-3">
            {visible.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Icon name="CheckCircle2" size={40} className="text-neon-green mx-auto mb-3" />
                <div className="font-heading font-bold text-foreground mb-1">Всё под контролем</div>
                <div className="text-sm text-muted-foreground">
                  {items.length === 0
                    ? "Создайте кампанию — после этого здесь появятся персональные подсказки"
                    : "Все инсайты обработаны. Возвращайтесь позже"}
                </div>
              </div>
            ) : (
              visible.map((i) => {
                const meta = severityMeta[i.severity];
                return (
                  <div key={i.id} className="glass rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start gap-3 md:gap-4 group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}>
                      <Icon name={meta.icon} size={18} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded"
                          style={{ background: `${meta.color}15`, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">→ {i.impact}</span>
                      </div>
                      <div className="font-heading font-bold text-foreground mb-1">{i.title}</div>
                      <div className="text-sm text-muted-foreground">{i.description}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-stretch sm:self-auto">
                      <button onClick={() => onNavigate(i.target)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-background"
                        style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))" }}>
                        {i.action}
                      </button>
                      <button onClick={() => dismiss(i.id)} title="Скрыть"
                        className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground hover:bg-muted/30">
                        <Icon name="Check" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              {items.slice(0, 3).map((c) => {
                const meta = CAMPAIGN_TYPE_META[c.campaign_type] || CAMPAIGN_TYPE_META.text;
                return (
                  <div key={c.id} className="glass rounded-xl p-3 flex items-center gap-2">
                    <Icon name={meta.icon} size={14} style={{ color: meta.color }} />
                    <div className="text-xs text-muted-foreground truncate flex-1">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">шаг {c.step}/6</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ color, icon, label, value }: { color: string; icon: string; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}26`, border: `1px solid ${color}66` }}>
          <Icon name={icon} size={16} style={{ color }} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-heading font-bold text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}
