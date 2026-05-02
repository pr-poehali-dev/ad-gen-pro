import func2url from "../../../backend/func2url.json";

export const AUTOMATIONS_URL = (func2url as Record<string, string>).automations;

export type RuleType = "bid_adjust" | "pause_campaign" | "alert" | "add_negative";
export type Metric = "ctr" | "cpc" | "cpa" | "spend" | "impressions" | "clicks" | "conversions" | "position";
export type Operator = "<" | "<=" | ">" | ">=" | "==" | "!=";
export type Period = "1d" | "3d" | "7d" | "14d" | "30d";
export type ActionType = "notify" | "decrease_bid" | "increase_bid" | "pause" | "set_bid";
export type Scope = "all" | "campaign" | "group";

export interface AutomationRule {
  id: number;
  name: string;
  description: string;
  rule_type: RuleType;
  enabled: boolean;
  target_scope: Scope;
  target_campaign_id: number | null;
  campaign_name?: string | null;
  metric: Metric;
  operator: Operator;
  threshold: number;
  period: Period;
  action_type: ActionType;
  action_value: number;
  notify_email: boolean;
  notify_telegram: boolean;
  last_run_at?: string | null;
  runs_count: number;
  triggers_count: number;
  created_at: string;
  updated_at: string;
}

export interface AutomationRun {
  id: number;
  rule_id: number;
  triggered: boolean;
  target_label: string;
  metric_value: number;
  action_taken: string;
  details: string;
  created_at: string;
}

export const RULE_TYPE_META: Record<RuleType, { label: string; icon: string; color: string; hint: string }> = {
  bid_adjust: { label: "Управление ставками", icon: "TrendingUp", color: "hsl(185,100%,55%)", hint: "Корректирует ставки по условию" },
  pause_campaign: { label: "Пауза кампании", icon: "Pause", color: "hsl(0,75%,60%)", hint: "Останавливает кампанию при триггере" },
  alert: { label: "Уведомление", icon: "Bell", color: "hsl(30,100%,60%)", hint: "Шлёт алерт без действий" },
  add_negative: { label: "Минус-фразы", icon: "Filter", color: "hsl(260,80%,65%)", hint: "Добавляет минус-фразы по правилу" },
};

export const METRIC_META: Record<Metric, { label: string; unit: string }> = {
  ctr: { label: "CTR", unit: "%" },
  cpc: { label: "CPC", unit: "₽" },
  cpa: { label: "CPA", unit: "₽" },
  spend: { label: "Расход", unit: "₽" },
  impressions: { label: "Показы", unit: "" },
  clicks: { label: "Клики", unit: "" },
  conversions: { label: "Конверсии", unit: "" },
  position: { label: "Позиция", unit: "" },
};

export const ACTION_META: Record<ActionType, { label: string; needsValue: boolean; valueLabel?: string }> = {
  notify: { label: "Только уведомить", needsValue: false },
  decrease_bid: { label: "Понизить ставку", needsValue: true, valueLabel: "%" },
  increase_bid: { label: "Повысить ставку", needsValue: true, valueLabel: "%" },
  set_bid: { label: "Установить ставку", needsValue: true, valueLabel: "₽" },
  pause: { label: "Поставить на паузу", needsValue: false },
};

export const PERIOD_LABEL: Record<Period, string> = {
  "1d": "За день",
  "3d": "За 3 дня",
  "7d": "За неделю",
  "14d": "За 2 недели",
  "30d": "За 30 дней",
};

export const OPERATOR_LABEL: Record<Operator, string> = {
  "<": "меньше",
  "<=": "меньше или равно",
  ">": "больше",
  ">=": "больше или равно",
  "==": "равно",
  "!=": "не равно",
};
