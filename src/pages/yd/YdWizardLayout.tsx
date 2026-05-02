import Icon from "@/components/ui/icon";
import type { YdCampaign } from "./types";

export const STEPS = [
  { n: 1, label: "Тип и стратегия", icon: "Settings2" },
  { n: 2, label: "Группы", icon: "Layers" },
  { n: 3, label: "Объявления", icon: "FileText" },
  { n: 4, label: "Фразы и минусы", icon: "KeyRound" },
  { n: 5, label: "Регионы и время", icon: "Globe" },
  { n: 6, label: "Бюджет и ставки", icon: "Wallet" },
];

export function WizardHeader({
  c,
  setC,
  onClose,
  saving,
  save,
}: {
  c: YdCampaign;
  setC: (c: YdCampaign) => void;
  onClose: () => void;
  saving: boolean;
  save: (close?: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex-1 min-w-0">
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1">
          <Icon name="ArrowLeft" size={12} /> К списку кампаний
        </button>
        <input
          value={c.name}
          onChange={(e) => setC({ ...c, name: e.target.value })}
          placeholder="Название кампании"
          className="font-heading font-bold text-2xl bg-transparent border-b border-transparent hover:border-border focus:border-neon-cyan focus:outline-none w-full"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={() => save()} disabled={saving}
          className="px-4 py-2 rounded-xl glass text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
          <Icon name={saving ? "Loader2" : "Save"} size={14} className={saving ? "animate-spin" : ""} />
          Сохранить черновик
        </button>
        <button onClick={() => save(true)} disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-bold text-background flex items-center gap-2 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
          <Icon name="Check" size={14} /> Сохранить и выйти
        </button>
      </div>
    </div>
  );
}

export function WizardStepsBar({ c, setStep }: { c: YdCampaign; setStep: (n: number) => void }) {
  return (
    <div className="glass rounded-2xl p-3 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {STEPS.map((s, i) => {
          const isActive = c.step === s.n;
          const isDone = c.step > s.n;
          return (
            <div key={s.n} className="flex items-center">
              <button onClick={() => setStep(s.n)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? "text-background" : isDone ? "text-neon-green hover:bg-muted/30" : "text-muted-foreground hover:bg-muted/30"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" } : undefined}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={isActive ? { background: "rgba(0,0,0,0.2)" } : isDone ? { background: "hsl(145,70%,50%)", color: "white" } : { background: "hsl(220,10%,30%)" }}>
                  {isDone ? <Icon name="Check" size={11} /> : s.n}
                </div>
                <span className="hidden md:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-[1px] bg-border/40 mx-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WizardFooter({
  c,
  saving,
  next,
  prev,
}: {
  c: YdCampaign;
  saving: boolean;
  next: () => void;
  prev: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button onClick={prev} disabled={c.step === 1}
        className="px-4 py-2.5 rounded-xl glass text-sm font-semibold flex items-center gap-2 disabled:opacity-30">
        <Icon name="ChevronLeft" size={14} /> Назад
      </button>
      <div className="text-xs text-muted-foreground">Шаг {c.step} из 6</div>
      <button onClick={next} disabled={c.step === 6 || saving}
        className="px-4 py-2.5 rounded-xl text-sm font-bold text-background flex items-center gap-2 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
        {c.step === 6 ? "Готово" : "Дальше"} <Icon name="ChevronRight" size={14} />
      </button>
    </div>
  );
}

// Shared field helpers used across step components
export function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
    </div>
  );
}

export function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <input type="number" value={value || ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="text-lg font-heading font-bold text-foreground">{value}</div>
    </div>
  );
}
