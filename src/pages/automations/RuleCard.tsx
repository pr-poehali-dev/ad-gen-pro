import Icon from "@/components/ui/icon";
import {
  ACTION_META,
  METRIC_META,
  PERIOD_LABEL,
  RULE_TYPE_META,
} from "./types";
import type { AutomationRule } from "./types";

interface Props {
  rule: AutomationRule;
  running: boolean;
  onToggle: (r: AutomationRule) => void;
  onRun: (r: AutomationRule) => void;
  onEdit: (r: AutomationRule) => void;
  onRemove: (id: number) => void;
  onShowRuns: (r: AutomationRule) => void;
}

export default function RuleCard({ rule, running, onToggle, onRun, onEdit, onRemove, onShowRuns }: Props) {
  const meta = RULE_TYPE_META[rule.rule_type];
  const metricMeta = METRIC_META[rule.metric];
  const actionMeta = ACTION_META[rule.action_type];

  return (
    <div className={`glass rounded-2xl p-4 border transition-colors ${rule.enabled ? "border-transparent hover:border-neon-cyan/40" : "border-border/40 opacity-60"}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}>
          <Icon name={meta.icon} size={18} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-sm text-foreground">{rule.name}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${meta.color}15`, color: meta.color }}>
              {meta.label}
            </span>
            {rule.campaign_name && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                · {rule.campaign_name}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => onToggle(rule)} title={rule.enabled ? "Отключить" : "Включить"}
          className={`w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${rule.enabled ? "bg-neon-cyan" : "bg-muted"}`}>
          <div className={`w-5 h-5 rounded-full bg-background transition-transform ${rule.enabled ? "translate-x-4" : "translate-x-0"}`} />
        </button>
      </div>

      <div className="text-xs bg-muted/20 rounded-lg p-2.5 mb-3 font-mono">
        <span className="text-muted-foreground">ЕСЛИ </span>
        <span className="font-bold text-foreground">{metricMeta.label}</span>
        <span className="text-neon-cyan"> {rule.operator} </span>
        <span className="font-bold text-foreground">{rule.threshold}{metricMeta.unit}</span>
        <span className="text-muted-foreground"> ({PERIOD_LABEL[rule.period]})</span>
        <br />
        <span className="text-muted-foreground">ТО </span>
        <span className="font-bold" style={{ color: meta.color }}>
          {actionMeta.label}
          {actionMeta.needsValue && rule.action_value > 0 && ` (${rule.action_value}${actionMeta.valueLabel || ""})`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
        <div className="bg-muted/20 rounded-lg p-1.5">
          <div className="text-sm font-bold text-foreground">{rule.runs_count}</div>
          <div className="text-[9px] uppercase text-muted-foreground tracking-wider">Проверок</div>
        </div>
        <div className="bg-muted/20 rounded-lg p-1.5">
          <div className="text-sm font-bold text-neon-green">{rule.triggers_count}</div>
          <div className="text-[9px] uppercase text-muted-foreground tracking-wider">Триггеров</div>
        </div>
        <div className="bg-muted/20 rounded-lg p-1.5">
          <div className="text-[10px] text-foreground truncate">
            {rule.last_run_at ? new Date(rule.last_run_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
          </div>
          <div className="text-[9px] uppercase text-muted-foreground tracking-wider">Послед. запуск</div>
        </div>
      </div>

      <div className="flex gap-1.5">
        <button onClick={() => onRun(rule)} disabled={running}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-background flex items-center justify-center gap-1 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
          <Icon name={running ? "Loader2" : "Play"} size={11} className={running ? "animate-spin" : ""} />
          Проверить сейчас
        </button>
        <button onClick={() => onShowRuns(rule)} title="История срабатываний"
          className="px-2.5 py-2 rounded-xl glass hover:bg-muted/30">
          <Icon name="History" size={12} />
        </button>
        <button onClick={() => onEdit(rule)} title="Изменить"
          className="px-2.5 py-2 rounded-xl glass hover:bg-muted/30">
          <Icon name="Pencil" size={12} />
        </button>
        <button onClick={() => onRemove(rule.id)} title="Удалить"
          className="px-2.5 py-2 rounded-xl text-destructive hover:bg-destructive/10">
          <Icon name="Trash2" size={12} />
        </button>
      </div>
    </div>
  );
}
