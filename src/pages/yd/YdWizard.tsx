import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { ydApi } from "./api";
import {
  CAMPAIGN_TYPE_META,
  STRATEGY_META,
  REGIONS,
  DEVICES,
  DEVICE_LABEL,
  MATCH_TYPE_LABEL,
  emptyAd,
  emptyGroup,
  emptyCampaign,
} from "./types";
import type { YdCampaign, YdCampaignType, YdStrategyType, YdMatchType, YdAdGroup, YdAd, YdKeyword } from "./types";
import AdPreview from "./AdPreview";

const STEPS = [
  { n: 1, label: "Тип и стратегия", icon: "Settings2" },
  { n: 2, label: "Группы", icon: "Layers" },
  { n: 3, label: "Объявления", icon: "FileText" },
  { n: 4, label: "Фразы и минусы", icon: "KeyRound" },
  { n: 5, label: "Регионы и время", icon: "Globe" },
  { n: 6, label: "Бюджет и ставки", icon: "Wallet" },
];

interface Props {
  campaignId: number;
  onClose: () => void;
}

export default function YdWizard({ campaignId, onClose }: Props) {
  const { toast } = useToast();
  const [c, setC] = useState<YdCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  useEffect(() => {
    ydApi.get(campaignId)
      .then((d) => {
        const initial: YdCampaign = {
          ...emptyCampaign(),
          ...d,
          groups: (d.groups && d.groups.length > 0) ? d.groups.map((g) => ({
            ...emptyGroup(),
            ...g,
            ads: g.ads && g.ads.length > 0 ? g.ads : [emptyAd()],
            keywords: g.keywords || [],
          })) : [emptyGroup(1)],
        };
        setC(initial);
      })
      .catch((e) => toast({ title: "Ошибка загрузки", description: String(e) }))
      .finally(() => setLoading(false));
  }, [campaignId, toast]);

  const setStep = (n: number) => {
    if (!c) return;
    setC({ ...c, step: n });
  };

  const save = async (close = false) => {
    if (!c) return;
    setSaving(true);
    try {
      await ydApi.save({ ...c, id: campaignId });
      toast({ title: "Сохранено", description: `Шаг ${c.step}/6` });
      if (close) onClose();
    } catch (e) {
      toast({ title: "Ошибка сохранения", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!c) return;
    const newStep = Math.min(6, c.step + 1);
    setC({ ...c, step: newStep });
    await save();
  };

  const prev = () => {
    if (!c) return;
    setC({ ...c, step: Math.max(1, c.step - 1) });
  };

  if (loading || !c) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon name="Loader2" size={32} className="animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
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

      {/* Steps */}
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

      {/* Body */}
      <div className="glass rounded-2xl p-4 md:p-6">
        {c.step === 1 && <Step1 c={c} setC={setC} />}
        {c.step === 2 && <Step2 c={c} setC={setC} activeGroupIdx={activeGroupIdx} setActiveGroupIdx={setActiveGroupIdx} />}
        {c.step === 3 && <Step3 c={c} setC={setC} activeGroupIdx={activeGroupIdx} setActiveGroupIdx={setActiveGroupIdx} />}
        {c.step === 4 && <Step4 c={c} setC={setC} activeGroupIdx={activeGroupIdx} setActiveGroupIdx={setActiveGroupIdx} />}
        {c.step === 5 && <Step5 c={c} setC={setC} />}
        {c.step === 6 && <Step6 c={c} setC={setC} />}
      </div>

      {/* Footer nav */}
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
    </div>
  );
}

// ============================ STEP 1 ============================
function Step1({ c, setC }: { c: YdCampaign; setC: (c: YdCampaign) => void }) {
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
function Step2({ c, setC, activeGroupIdx, setActiveGroupIdx }: {
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

// ============================ STEP 3 ============================
function Step3({ c, setC, activeGroupIdx, setActiveGroupIdx }: {
  c: YdCampaign; setC: (c: YdCampaign) => void;
  activeGroupIdx: number; setActiveGroupIdx: (i: number) => void;
}) {
  const g = c.groups[activeGroupIdx] || c.groups[0];
  const updateAds = (ads: YdAd[]) => {
    setC({ ...c, groups: c.groups.map((gr, idx) => idx === activeGroupIdx ? { ...gr, ads } : gr) });
  };
  const addAd = () => updateAds([...g.ads, emptyAd()]);
  const removeAd = (i: number) => g.ads.length > 1 && updateAds(g.ads.filter((_, idx) => idx !== i));
  const updateAd = (i: number, patch: Partial<YdAd>) => updateAds(g.ads.map((a, idx) => idx === i ? { ...a, ...patch } : a));
  const addSitelink = (i: number) => updateAd(i, { sitelinks: [...(g.ads[i].sitelinks || []), { title: "", url: "" }] });
  const updateSitelink = (i: number, si: number, patch: Partial<{ title: string; url: string }>) => {
    const sl = (g.ads[i].sitelinks || []).map((s, sidx) => sidx === si ? { ...s, ...patch } : s);
    updateAd(i, { sitelinks: sl });
  };
  const removeSitelink = (i: number, si: number) => updateAd(i, { sitelinks: (g.ads[i].sitelinks || []).filter((_, sidx) => sidx !== si) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-heading font-bold text-lg">Объявления</h2>
          <div className="text-xs text-muted-foreground">Группа: <span className="text-foreground font-semibold">{g.name}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <select value={activeGroupIdx} onChange={(e) => setActiveGroupIdx(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs">
            {c.groups.map((gr, i) => <option key={i} value={i}>{gr.name}</option>)}
          </select>
          <button onClick={addAd} className="px-3 py-2 rounded-lg glass text-xs font-semibold text-neon-cyan hover:bg-muted/30 flex items-center gap-1">
            <Icon name="Plus" size={12} /> Объявление
          </button>
        </div>
      </div>

      {g.ads.map((ad, i) => (
        <div key={i} className="border border-border/40 rounded-2xl p-4 bg-muted/10 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Объявление #{i + 1}</div>
              {g.ads.length > 1 && (
                <button onClick={() => removeAd(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                  <Icon name="Trash2" size={12} />
                </button>
              )}
            </div>
            <Input label="Заголовок 1 (до 56 символов)" value={ad.title1} onChange={(v) => updateAd(i, { title1: v.slice(0, 56) })} />
            <Input label="Заголовок 2 (до 30)" value={ad.title2} onChange={(v) => updateAd(i, { title2: v.slice(0, 30) })} />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Текст объявления (до 81)</label>
              <textarea value={ad.body} onChange={(e) => updateAd(i, { body: e.target.value.slice(0, 81) })} rows={2}
                className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm resize-none" />
            </div>
            <Input label="Ссылка" value={ad.href} onChange={(v) => updateAd(i, { href: v })} placeholder="https://example.com/landing" />
            <Input label="Отображаемая ссылка" value={ad.display_url} onChange={(v) => updateAd(i, { display_url: v.slice(0, 20) })} placeholder="example.ru" />

            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">Быстрые ссылки</label>
                <button onClick={() => addSitelink(i)} className="text-neon-cyan text-xs flex items-center gap-1 hover:underline">
                  <Icon name="Plus" size={11} /> добавить
                </button>
              </div>
              {(ad.sitelinks || []).map((sl, si) => (
                <div key={si} className="grid grid-cols-[1fr_1fr_auto] gap-1.5 mb-1">
                  <input value={sl.title} onChange={(e) => updateSitelink(i, si, { title: e.target.value })} placeholder="Текст"
                    className="px-2 py-1.5 rounded bg-muted/30 border border-border text-xs" />
                  <input value={sl.url} onChange={(e) => updateSitelink(i, si, { url: e.target.value })} placeholder="https://..."
                    className="px-2 py-1.5 rounded bg-muted/30 border border-border text-xs" />
                  <button onClick={() => removeSitelink(i, si)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded">
                    <Icon name="X" size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <AdPreview ad={ad} />
        </div>
      ))}
    </div>
  );
}

// ============================ STEP 4 ============================
function Step4({ c, setC, activeGroupIdx, setActiveGroupIdx }: {
  c: YdCampaign; setC: (c: YdCampaign) => void;
  activeGroupIdx: number; setActiveGroupIdx: (i: number) => void;
}) {
  const g = c.groups[activeGroupIdx] || c.groups[0];
  const updateKeywords = (keywords: YdKeyword[]) => {
    setC({ ...c, groups: c.groups.map((gr, idx) => idx === activeGroupIdx ? { ...gr, keywords } : gr) });
  };
  const [bulkInput, setBulkInput] = useState("");
  const addBulk = () => {
    const lines = bulkInput.split("\n").map((l) => l.trim()).filter(Boolean);
    const fresh: YdKeyword[] = lines.map((l) => ({ phrase: l, bid: 0, match_type: "broad" }));
    updateKeywords([...g.keywords, ...fresh]);
    setBulkInput("");
  };
  const removeKeyword = (i: number) => updateKeywords(g.keywords.filter((_, idx) => idx !== i));
  const updateKeyword = (i: number, patch: Partial<YdKeyword>) =>
    updateKeywords(g.keywords.map((k, idx) => idx === i ? { ...k, ...patch } : k));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-heading font-bold text-lg">Ключевые фразы и минусы</h2>
        <select value={activeGroupIdx} onChange={(e) => setActiveGroupIdx(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs">
          {c.groups.map((gr, i) => <option key={i} value={i}>{gr.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Добавить фразы (одна фраза в строке)
          </label>
          <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} rows={5}
            placeholder="купить ноутбук&#10;ноутбук acer&#10;ноутбук недорого"
            className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm resize-none" />
          <button onClick={addBulk} disabled={!bulkInput.trim()}
            className="mt-2 px-4 py-2 rounded-lg text-xs font-bold text-background disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            Добавить в группу
          </button>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Минус-фразы кампании (через запятую или с новой строки)
          </label>
          <textarea value={c.negative_keywords} onChange={(e) => setC({ ...c, negative_keywords: e.target.value })} rows={5}
            placeholder="бесплатно, скачать, своими руками"
            className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm resize-none" />
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Фразы группы ({g.keywords.length})
        </div>
        {g.keywords.length === 0 ? (
          <div className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">Добавьте хотя бы одну фразу</div>
        ) : (
          <div className="space-y-1 max-h-[420px] overflow-y-auto">
            {g.keywords.map((k, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_100px_auto] gap-2 items-center">
                <input value={k.phrase} onChange={(e) => updateKeyword(i, { phrase: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
                <select value={k.match_type} onChange={(e) => updateKeyword(i, { match_type: e.target.value as YdMatchType })}
                  className="px-2 py-2 rounded-lg bg-muted/30 border border-border text-xs">
                  {(Object.keys(MATCH_TYPE_LABEL) as YdMatchType[]).map((m) => (
                    <option key={m} value={m}>{MATCH_TYPE_LABEL[m]}</option>
                  ))}
                </select>
                <input type="number" value={k.bid || ""} onChange={(e) => updateKeyword(i, { bid: parseFloat(e.target.value) || 0 })}
                  placeholder="Ставка ₽" className="px-2 py-2 rounded-lg bg-muted/30 border border-border text-xs text-right" />
                <button onClick={() => removeKeyword(i)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                  <Icon name="X" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================ STEP 5 ============================
function Step5({ c, setC }: { c: YdCampaign; setC: (c: YdCampaign) => void }) {
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
function Step6({ c, setC }: { c: YdCampaign; setC: (c: YdCampaign) => void }) {
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

// ============================ HELPERS ============================
function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <input type="number" value={value || ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="text-lg font-heading font-bold text-foreground">{value}</div>
    </div>
  );
}
