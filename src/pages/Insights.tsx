import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Campaign, Page } from "@/App";
import { useToast } from "@/hooks/use-toast";

interface InsightsProps {
  campaigns: Campaign[];
  onNavigate: (page: Page) => void;
}

interface Insight {
  id: number;
  severity: "warning" | "opportunity" | "tip";
  title: string;
  description: string;
  action: string;
  impact: string;
}

export default function Insights({ campaigns, onNavigate }: InsightsProps) {
  const { toast } = useToast();
  const [resolved, setResolved] = useState<Set<number>>(new Set());

  // Генерируем инсайты на основе реальных данных
  const insights: Insight[] = [];
  let id = 1;

  campaigns.forEach(c => {
    if (c.status === "active" && c.ctr > 0 && c.ctr < 2) {
      insights.push({
        id: id++,
        severity: "warning",
        title: `Низкий CTR в «${c.name}»`,
        description: `CTR ${c.ctr}% ниже среднего (2.5%). Возможно, заголовки не цепляют аудиторию или таргетинг слишком широкий.`,
        action: "Сгенерировать новые объявления",
        impact: "+30-50% к CTR",
      });
    }
    if (c.budget > 0 && c.spent / c.budget > 0.85 && c.status === "active") {
      insights.push({
        id: id++,
        severity: "warning",
        title: `Бюджет «${c.name}» на исходе`,
        description: `Потрачено ₽${c.spent.toLocaleString("ru-RU")} из ₽${c.budget.toLocaleString("ru-RU")} (${Math.round(c.spent/c.budget*100)}%). Скоро кампания остановится.`,
        action: "Увеличить бюджет",
        impact: "Не потерять трафик",
      });
    }
    if (c.status === "draft" && c.ads === 0) {
      insights.push({
        id: id++,
        severity: "opportunity",
        title: `Запустите «${c.name}»`,
        description: "Кампания в черновиках без объявлений. AI может сгенерировать креативы за 1 минуту.",
        action: "Создать объявления",
        impact: "Запуск за 5 минут",
      });
    }
    if (c.status === "paused") {
      insights.push({
        id: id++,
        severity: "tip",
        title: `«${c.name}» на паузе`,
        description: "Возможно, стоит вернуть кампанию или удалить, если не актуальна.",
        action: "Проверить",
        impact: "Освободить ресурсы",
      });
    }
  });

  if (insights.length === 0) {
    insights.push({
      id: id++,
      severity: "tip",
      title: "Всё работает отлично!",
      description: "AI-агент не нашёл проблем в ваших кампаниях. Можно запустить новые направления.",
      action: "Подобрать стратегию",
      impact: "Рост на 20-40%",
    });
  }

  // добавим всегда-полезные tips
  insights.push({
    id: id++,
    severity: "opportunity",
    title: "Подключите ретаргетинг по корзинам",
    description: "Из вашей CRM можно вернуть 18-25% брошенных корзин с конверсией в 3-4 раза выше холодного трафика.",
    action: "Включить автоматизацию",
    impact: "+15% к выручке",
  });
  insights.push({
    id: id++,
    severity: "tip",
    title: "Лучшее время запуска: вторник 10:00",
    description: "По данным AdFlow, ваша аудитория активнее всего во вторник утром. Запланируйте старт акций на этот слот.",
    action: "Открыть планировщик",
    impact: "+12% к CTR",
  });

  const visible = insights.filter(i => !resolved.has(i.id));

  const severityMeta = {
    warning: { color: "hsl(0,75%,60%)", icon: "AlertTriangle", label: "Внимание" },
    opportunity: { color: "hsl(145,70%,50%)", icon: "Sparkles", label: "Возможность" },
    tip: { color: "hsl(185,100%,55%)", icon: "Lightbulb", label: "Совет" },
  };

  const handleAction = (i: Insight) => {
    if (i.action.includes("объявления") || i.action.includes("Сгенерировать")) {
      onNavigate("ai");
    } else if (i.action.includes("автоматизац")) {
      onNavigate("automations");
    } else if (i.action.includes("планировщик")) {
      onNavigate("calendar");
    } else if (i.action.includes("стратегию") || i.action.includes("Поговорить")) {
      onNavigate("agent");
    } else {
      onNavigate("campaigns");
    }
  };

  const dismiss = (insightId: number) => {
    setResolved(prev => new Set(prev).add(insightId));
    toast({ title: "Инсайт отмечен решённым" });
  };

  const counts = {
    warning: visible.filter(i => i.severity === "warning").length,
    opportunity: visible.filter(i => i.severity === "opportunity").length,
    tip: visible.filter(i => i.severity === "tip").length,
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
          <Icon name="Brain" size={13} />
          AI-инсайты обновляются в реальном времени
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Инсайты и рекомендации</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-агент проанализировал ваши кампании и нашёл точки роста</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(0,75%,60%,0.15)', border: '1px solid hsl(0,75%,60%,0.4)' }}>
              <Icon name="AlertTriangle" size={16} style={{ color: 'hsl(0,75%,60%)' }} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Требует внимания</div>
              <div className="text-2xl font-heading font-bold text-foreground">{counts.warning}</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(145,70%,50%,0.15)', border: '1px solid hsl(145,70%,50%,0.4)' }}>
              <Icon name="Sparkles" size={16} style={{ color: 'hsl(145,70%,50%)' }} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Возможностей роста</div>
              <div className="text-2xl font-heading font-bold text-foreground">{counts.opportunity}</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(185,100%,55%,0.15)', border: '1px solid hsl(185,100%,55%,0.4)' }}>
              <Icon name="Lightbulb" size={16} style={{ color: 'hsl(185,100%,55%)' }} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Советов от AI</div>
              <div className="text-2xl font-heading font-bold text-foreground">{counts.tip}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Icon name="CheckCircle2" size={40} className="text-neon-green mx-auto mb-3" />
            <div className="font-heading font-bold text-foreground mb-1">Всё под контролем</div>
            <div className="text-sm text-muted-foreground">Все инсайты обработаны. AI-агент следит за изменениями.</div>
          </div>
        ) : (
          visible.map(i => {
            const meta = severityMeta[i.severity];
            return (
              <div key={i.id} className="glass rounded-2xl p-5 flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}>
                  <Icon name={meta.icon} size={18} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded"
                      style={{ background: `${meta.color}15`, color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">→ {i.impact}</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">{i.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{i.description}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleAction(i)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-background transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)` }}>
                    <Icon name="ArrowRight" size={12} />
                    {i.action}
                  </button>
                  <button onClick={() => dismiss(i.id)} title="Отметить решённым"
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100">
                    <Icon name="Check" size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-6 glass rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
            <Icon name="MessageSquare" size={20} className="text-background" />
          </div>
          <div>
            <div className="font-heading font-bold text-foreground">Хотите глубже разобрать ситуацию?</div>
            <div className="text-sm text-muted-foreground">AI-агент проведёт стратегическую сессию по вашим кампаниям</div>
          </div>
        </div>
        <button onClick={() => onNavigate("agent")}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
          Начать чат
        </button>
      </div>
    </div>
  );
}
