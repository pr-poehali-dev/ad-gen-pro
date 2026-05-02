import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import { ydApi } from "./yd/api";
import type { YdCampaignListItem } from "./yd/types";
import {
  AUTOMATIONS_URL,
  RULE_TYPE_META,
} from "./automations/types";
import type { AutomationRule, AutomationRun, RuleType } from "./automations/types";
import RuleCard from "./automations/RuleCard";
import RuleEditModal from "./automations/RuleEditModal";
import RunsModal from "./automations/RunsModal";

export default function Automations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [campaigns, setCampaigns] = useState<YdCampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [editing, setEditing] = useState<AutomationRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [runsRule, setRunsRule] = useState<AutomationRule | null>(null);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        fetch(`${AUTOMATIONS_URL}?action=list`, { headers: authHeaders() }).then((r) => r.json()),
        ydApi.list(),
      ]);
      if (rRes.error) throw new Error(rRes.error);
      setRules(rRes.rules || []);
      setCampaigns(cRes.campaigns || []);
    } catch (e) {
      toast({ title: "Не удалось загрузить", description: String(e) });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      const res = await fetch(`${AUTOMATIONS_URL}?action=create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: "Новое правило", rule_type: "bid_adjust" }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      await load();
      const created = (await fetchOne(d.id));
      if (created) setEditing(created);
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    }
  };

  const fetchOne = async (id: number): Promise<AutomationRule | null> => {
    const res = await fetch(`${AUTOMATIONS_URL}?action=list`, { headers: authHeaders() });
    const d = await res.json();
    return (d.rules as AutomationRule[]).find((r) => r.id === id) || null;
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`${AUTOMATIONS_URL}?action=save`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(editing),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({ title: "Сохранено" });
      setEditing(null);
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить правило вместе с историей срабатываний?")) return;
    try {
      const res = await fetch(`${AUTOMATIONS_URL}?action=delete`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({ title: "Правило удалено" });
      setEditing(null);
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    }
  };

  const toggle = async (rule: AutomationRule) => {
    setRules(rules.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)));
    try {
      await fetch(`${AUTOMATIONS_URL}?action=toggle`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id: rule.id, enabled: !rule.enabled }),
      });
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
      load();
    }
  };

  const runRule = async (rule: AutomationRule) => {
    setRunningId(rule.id);
    try {
      const res = await fetch(`${AUTOMATIONS_URL}?action=run`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id: rule.id }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({
        title: `Проверено целей: ${d.total}`,
        description: `Сработало: ${d.triggered}`,
      });
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setRunningId(null);
    }
  };

  const showRuns = async (rule: AutomationRule) => {
    setRunsRule(rule);
    setRuns([]);
    setRunsLoading(true);
    try {
      const res = await fetch(`${AUTOMATIONS_URL}?action=runs&rule_id=${rule.id}`, { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      setRuns(d.runs || []);
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setRunsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Правила сохраняются в личном кабинете</div>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? rules : rules.filter((r) => r.rule_type === filter);
  const enabledCount = rules.filter((r) => r.enabled).length;
  const totalTriggers = rules.reduce((s, r) => s + (r.triggers_count || 0), 0);
  const totalRuns = rules.reduce((s, r) => s + (r.runs_count || 0), 0);

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neon-cyan mb-1 uppercase tracking-widest font-bold">
            <Icon name="Bot" size={13} /> Правила управления ставками
          </div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Автоматизации</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Триггеры по метрикам кампаний (CTR, CPC, CPA и др.) → автоматические действия со ставками или уведомления
          </p>
        </div>
        <button onClick={create}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-background self-start"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
          <Icon name="Plus" size={14} /> Новое правило
        </button>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat icon="Zap" color="hsl(145,70%,50%)" label="Активных" value={`${enabledCount} / ${rules.length}`} />
        <Stat icon="Activity" color="hsl(185,100%,55%)" label="Проверок" value={totalRuns} />
        <Stat icon="Target" color="hsl(0,75%,60%)" label="Срабатываний" value={totalTriggers} />
        <Stat icon="Bell" color="hsl(30,100%,60%)" label="С уведомлением" value={rules.filter((r) => r.notify_email || r.notify_telegram).length} />
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>Все</FilterBtn>
        {(Object.keys(RULE_TYPE_META) as RuleType[]).map((rt) => {
          const m = RULE_TYPE_META[rt];
          return (
            <FilterBtn key={rt} active={filter === rt} onClick={() => setFilter(rt)} color={m.color}>
              <Icon name={m.icon} size={11} /> {m.label}
            </FilterBtn>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="Bot" size={40} className="text-muted-foreground/50 mx-auto mb-3" />
          <div className="font-heading font-bold text-foreground mb-1">Нет правил</div>
          <div className="text-sm text-muted-foreground mb-4">
            Создайте первое — например, «понизить ставку, если CTR &lt; 2% за 7 дней»
          </div>
          <button onClick={create}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Plus" size={14} /> Создать
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <RuleCard
              key={r.id}
              rule={r}
              running={runningId === r.id}
              onToggle={toggle}
              onRun={runRule}
              onEdit={setEditing}
              onRemove={remove}
              onShowRuns={showRuns}
            />
          ))}
        </div>
      )}

      {editing && (
        <RuleEditModal
          draft={editing}
          setDraft={setEditing}
          campaigns={campaigns}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={save}
          onRemove={remove}
        />
      )}

      {runsRule && (
        <RunsModal
          rule={runsRule}
          runs={runs}
          loading={runsLoading}
          onClose={() => setRunsRule(null)}
        />
      )}
    </div>
  );
}

function Stat({ icon, color, label, value }: { icon: string; color: string; label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}26`, border: `1px solid ${color}66` }}>
          <Icon name={icon} size={14} style={{ color }} />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className="text-xl font-heading font-bold text-foreground">{value}</div>
    </div>
  );
}

function FilterBtn({ active, onClick, children, color }: {
  active: boolean; onClick: () => void; children: React.ReactNode; color?: string;
}) {
  const c = color || "hsl(185,100%,55%)";
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
        active ? "" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
      }`}
      style={active ? { borderColor: c, background: `${c}15`, color: c } : undefined}>
      {children}
    </button>
  );
}
