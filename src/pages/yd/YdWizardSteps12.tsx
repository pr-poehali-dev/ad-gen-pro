import Icon from "@/components/ui/icon";
import {
  CAMPAIGN_TYPE_META,
  STRATEGY_META,
  DEVICES,
  DEVICE_LABEL,
  emptyGroup,
} from "./types";
import type { YdCampaign, YdCampaignType, YdStrategyType, YdAdGroup } from "./types";

// ============================ STEP 1 ============================
export function Step1({ c, setC }: { c: YdCampaign; setC: (c: YdCampaign) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-lg mb-3">Тип кампании</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.keys(CAMPAIGN_TYPE_META) as YdCampaignType[]).map((t) => {
            const meta = CAMPAIGN_TYPE_META[t];
            const active = c.campaign_type === t;
            return (
              <button key={t} onClick={() => setC({ ...c, campaign_type: t })}
                className={`text-left p-4 rounded-2xl border transition-all ${active ? "" : "border-border/40 hover:border-border bg-muted/20"}`}
                style={active ? { borderColor: meta.color, background: `${meta.color}15` } : undefined}>
                <Icon name={meta.icon} size={22} style={{ color: meta.color }} />
                <div className="font-bold text-sm text-foreground mt-2">{meta.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-snug">{meta.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading font-bold text-lg mb-3">Стратегия показов</h2>
        <div className="space-y-2">
          {(Object.keys(STRATEGY_META) as YdStrategyType[]).map((s) => {
            const meta = STRATEGY_META[s];
            const active = c.strategy_type === s;
            return (
              <button key={s} onClick={() => setC({ ...c, strategy_type: s })}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all ${active ? "border-neon-cyan bg-neon-cyan/5" : "border-border/40 hover:border-border bg-muted/20"}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${active ? "border-neon-cyan" : "border-muted-foreground"}`}>
                  {active && <div className="w-2 h-2 rounded-full bg-neon-cyan m-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{meta.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{meta.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================ STEP 2 ============================
export function Step2({ c, setC, activeGroupIdx, setActiveGroupIdx }: {
  c: YdCampaign; setC: (c: YdCampaign) => void;
  activeGroupIdx: number; setActiveGroupIdx: (i: number) => void;
}) {
  const addGroup = () => {
    const idx = c.groups.length + 1;
    setC({ ...c, groups: [...c.groups, emptyGroup(idx)] });
    setActiveGroupIdx(c.groups.length);
  };
  const removeGroup = (i: number) => {
    if (c.groups.length === 1) return;
    setC({ ...c, groups: c.groups.filter((_, idx) => idx !== i) });
    setActiveGroupIdx(0);
  };
  const updateGroup = (i: number, patch: Partial<YdAdGroup>) => {
    setC({ ...c, groups: c.groups.map((g, idx) => idx === i ? { ...g, ...patch } : g) });
  };
  const g = c.groups[activeGroupIdx] || c.groups[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-sm">Группы ({c.groups.length})</h2>
          <button onClick={addGroup} className="p-1.5 rounded-lg glass text-neon-cyan hover:bg-muted/30">
            <Icon name="Plus" size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {c.groups.map((gr, i) => (
            <div key={i} onClick={() => setActiveGroupIdx(i)}
              className={`group cursor-pointer p-2.5 rounded-xl flex items-center justify-between gap-2 ${activeGroupIdx === i ? "bg-neon-cyan/10 border border-neon-cyan/40" : "bg-muted/20 border border-transparent hover:border-border"}`}>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{gr.name}</div>
                <div className="text-[10px] text-muted-foreground">{gr.ads.length} объявл. · {gr.keywords.length} фраз</div>
              </div>
              {c.groups.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); removeGroup(i); }} className="opacity-0 group-hover:opacity-100 p-1 rounded text-destructive hover:bg-destructive/10">
                  <Icon name="Trash2" size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Название группы</label>
          <input value={g.name} onChange={(e) => updateGroup(activeGroupIdx, { name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Устройства</label>
          <div className="flex flex-wrap gap-2">
            {DEVICES.map((d) => {
              const active = g.devices.includes(d);
              return (
                <button key={d} onClick={() => updateGroup(activeGroupIdx, {
                  devices: active ? g.devices.filter((x) => x !== d) : [...g.devices, d]
                })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${active ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border bg-muted/20 text-muted-foreground"}`}>
                  {DEVICE_LABEL[d]}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Аудитория (теги ретаргетинга, через запятую)
          </label>
          <input value={g.audience_targets.join(", ")}
            onChange={(e) => updateGroup(activeGroupIdx, { audience_targets: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            placeholder="например: посетители, корзина, vip"
            className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
        </div>
      </div>
    </div>
  );
}
