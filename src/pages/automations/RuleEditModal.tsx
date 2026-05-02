import Icon from "@/components/ui/icon";
import type { YdCampaignListItem } from "../yd/types";
import {
  ACTION_META,
  METRIC_META,
  OPERATOR_LABEL,
  PERIOD_LABEL,
  RULE_TYPE_META,
} from "./types";
import type {
  ActionType, AutomationRule, Metric, Operator, Period, RuleType,
} from "./types";

interface Props {
  draft: AutomationRule;
  setDraft: (r: AutomationRule) => void;
  campaigns: YdCampaignListItem[];
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onRemove: (id: number) => void;
}

export default function RuleEditModal({
  draft, setDraft, campaigns, saving, onClose, onSave, onRemove,
}: Props) {
  const metricMeta = METRIC_META[draft.metric];
  const actionMeta = ACTION_META[draft.action_type];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg">Правило автоматизации</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="overflow-auto flex-1 p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Название</label>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Тип правила</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(RULE_TYPE_META) as RuleType[]).map((rt) => {
                const m = RULE_TYPE_META[rt];
                const active = draft.rule_type === rt;
                return (
                  <button key={rt} onClick={() => setDraft({ ...draft, rule_type: rt })}
                    className={`text-left p-2.5 rounded-lg flex items-start gap-2 border transition-all ${
                      active ? "" : "border-border/40 bg-muted/20"
                    }`}
                    style={active ? { borderColor: m.color, background: `${m.color}15` } : undefined}>
                    <Icon name={m.icon} size={14} style={{ color: m.color }} className="mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">{m.hint}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Применять к</label>
            <select
              value={draft.target_scope === "campaign" && draft.target_campaign_id ? String(draft.target_campaign_id) : "all"}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "all") setDraft({ ...draft, target_scope: "all", target_campaign_id: null });
                else setDraft({ ...draft, target_scope: "campaign", target_campaign_id: parseInt(v, 10) });
              }}
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
              <option value="all">Все мои кампании</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name || `Кампания #${c.id}`}</option>
              ))}
            </select>
          </div>

          <div className="border border-border/40 rounded-xl p-3 bg-muted/10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Условие</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Метрика</label>
                <select value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value as Metric })}
                  className="w-full px-2 py-2 rounded-lg bg-muted/30 border border-border text-xs">
                  {(Object.keys(METRIC_META) as Metric[]).map((m) => (
                    <option key={m} value={m}>{METRIC_META[m].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Оператор</label>
                <select value={draft.operator} onChange={(e) => setDraft({ ...draft, operator: e.target.value as Operator })}
                  className="w-full px-2 py-2 rounded-lg bg-muted/30 border border-border text-xs">
                  {(Object.keys(OPERATOR_LABEL) as Operator[]).map((o) => (
                    <option key={o} value={o}>{o} ({OPERATOR_LABEL[o]})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Значение {metricMeta.unit && `(${metricMeta.unit})`}</label>
                <input type="number" step="0.01" value={draft.threshold}
                  onChange={(e) => setDraft({ ...draft, threshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-2 rounded-lg bg-muted/30 border border-border text-xs" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Период</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
                  <button key={p} onClick={() => setDraft({ ...draft, period: p })}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                      draft.period === p ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border bg-muted/20 text-muted-foreground"
                    }`}>
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-border/40 rounded-xl p-3 bg-muted/10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Действие</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ACTION_META) as ActionType[]).map((a) => {
                const m = ACTION_META[a];
                const active = draft.action_type === a;
                return (
                  <button key={a} onClick={() => setDraft({ ...draft, action_type: a })}
                    className={`p-2 rounded-lg text-xs font-semibold border ${
                      active ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border bg-muted/20 text-muted-foreground"
                    }`}>
                    {m.label}
                  </button>
                );
              })}
            </div>
            {actionMeta.needsValue && (
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">
                  Значение ({actionMeta.valueLabel})
                </label>
                <input type="number" step="0.01" value={draft.action_value}
                  onChange={(e) => setDraft({ ...draft, action_value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-2 rounded-lg bg-muted/30 border border-border text-xs" />
              </div>
            )}
          </div>

          <div className="border border-border/40 rounded-xl p-3 bg-muted/10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Уведомления</div>
            <Toggle label="Email" value={draft.notify_email} onChange={(v) => setDraft({ ...draft, notify_email: v })} />
            <Toggle label="Telegram (нужен бот)" value={draft.notify_telegram} onChange={(v) => setDraft({ ...draft, notify_telegram: v })} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Описание (необязательно)</label>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm resize-none" />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/40 flex justify-between gap-2">
          <button onClick={() => onRemove(draft.id)}
            className="px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 flex items-center gap-1">
            <Icon name="Trash2" size={12} /> Удалить правило
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl glass text-sm">Отмена</button>
            <button onClick={onSave} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-background disabled:opacity-50 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
              <Icon name={saving ? "Loader2" : "Check"} size={14} className={saving ? "animate-spin" : ""} />
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/20">
      <span className="text-xs text-foreground">{label}</span>
      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${value ? "bg-neon-cyan" : "bg-muted"}`}>
        <div className={`w-4 h-4 rounded-full bg-background transition-transform ${value ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}
