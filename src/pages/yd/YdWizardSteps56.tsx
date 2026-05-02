import Icon from "@/components/ui/icon";
import { REGIONS, STRATEGY_META } from "./types";
import type { YdCampaign } from "./types";
import { Input, NumberInput, Stat } from "./YdWizardLayout";

// ============================ STEP 5 ============================
export function Step5({ c, setC }: { c: YdCampaign; setC: (c: YdCampaign) => void }) {
  const toggleRegion = (r: string) => {
    setC({ ...c, regions: c.regions.includes(r) ? c.regions.filter((x) => x !== r) : [...c.regions, r] });
  };
  const schedule = c.schedule || {};
  const hours: { day: number; from: number; to: number }[] = (schedule.hours || []) as { day: number; from: number; to: number }[];
  const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const setDay = (day: number, from: number, to: number) => {
    const next = hours.filter((h) => h.day !== day);
    if (from < to) next.push({ day, from, to });
    setC({ ...c, schedule: { ...schedule, hours: next } });
  };
  const dayValue = (day: number) => hours.find((h) => h.day === day) || { day, from: 0, to: 24 };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-lg mb-2">Регионы показа</h2>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => {
            const active = c.regions.includes(r);
            return (
              <button key={r} onClick={() => toggleRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${active ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border bg-muted/20 text-muted-foreground"}`}>
                {active && <Icon name="Check" size={11} className="inline mr-1" />}
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading font-bold text-lg mb-2">Временной таргетинг</h2>
        <div className="space-y-1">
          {dayLabels.map((d, i) => {
            const v = dayValue(i);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 text-xs font-bold text-muted-foreground">{d}</div>
                <input type="number" min="0" max="24" value={v.from}
                  onChange={(e) => setDay(i, parseInt(e.target.value || "0"), v.to)}
                  className="w-16 px-2 py-1.5 rounded bg-muted/30 border border-border text-xs text-center" />
                <span className="text-muted-foreground">—</span>
                <input type="number" min="0" max="24" value={v.to}
                  onChange={(e) => setDay(i, v.from, parseInt(e.target.value || "0"))}
                  className="w-16 px-2 py-1.5 rounded bg-muted/30 border border-border text-xs text-center" />
                <span className="text-xs text-muted-foreground">часов</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================ STEP 6 ============================
export function Step6({ c, setC }: { c: YdCampaign; setC: (c: YdCampaign) => void }) {
  const meta = STRATEGY_META[c.strategy_type];
  const totalKw = c.groups.reduce((s, g) => s + g.keywords.length, 0);
  const avgBid = totalKw > 0
    ? c.groups.flatMap((g) => g.keywords).reduce((s, k) => s + (k.bid || 0), 0) / totalKw
    : 0;

  return (
    <div className="space-y-5">
      <h2 className="font-heading font-bold text-lg">Бюджет, ставки и счётчик Метрики</h2>

      <div className="glass rounded-xl p-4 bg-muted/10">
        <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Стратегия</div>
        <div className="text-sm font-semibold">{meta.label}</div>
        <div className="text-xs text-muted-foreground mt-1">{meta.description}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meta.needsBudget && (
          <>
            <NumberInput label="Дневной бюджет, ₽" value={c.daily_budget} onChange={(v) => setC({ ...c, daily_budget: v })} />
            <NumberInput label="Недельный бюджет, ₽" value={c.weekly_budget} onChange={(v) => setC({ ...c, weekly_budget: v })} />
          </>
        )}
        {meta.needsBid && (
          <div className="md:col-span-2 glass rounded-xl p-3 bg-muted/10 text-xs">
            Ручное управление ставками — задайте ставки для каждой фразы на шаге «Фразы и минусы».
            Сейчас задано фраз: <span className="font-bold text-foreground">{totalKw}</span>,
            средняя ставка: <span className="font-bold text-foreground">{avgBid.toFixed(2)} ₽</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Номер счётчика Метрики" value={c.counter_id} onChange={(v) => setC({ ...c, counter_id: v })} placeholder="например, 12345678" />
        <Input label="ID целей через запятую" value={c.counter_goals} onChange={(v) => setC({ ...c, counter_goals: v })} placeholder="goal_1, goal_2" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">UTM-шаблон ссылки</label>
        <input value={c.utm_template} onChange={(e) => setC({ ...c, utm_template: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm font-mono" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Заметки менеджера</label>
        <textarea value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} rows={3}
          className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
      </div>

      <div className="glass rounded-xl p-4 bg-neon-cyan/5 border border-neon-cyan/30">
        <div className="text-xs font-bold uppercase tracking-wider text-neon-cyan mb-2">Сводка кампании</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat label="Групп" value={c.groups.length} />
          <Stat label="Объявлений" value={c.groups.reduce((s, g) => s + g.ads.length, 0)} />
          <Stat label="Фраз" value={totalKw} />
          <Stat label="Регионов" value={c.regions.length} />
        </div>
      </div>
    </div>
  );
}
