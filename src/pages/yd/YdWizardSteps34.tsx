import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MATCH_TYPE_LABEL, emptyAd } from "./types";
import type { YdCampaign, YdMatchType, YdAd, YdKeyword } from "./types";
import AdPreview from "./AdPreview";
import { Input } from "./YdWizardLayout";

// ============================ STEP 3 ============================
export function Step3({ c, setC, activeGroupIdx, setActiveGroupIdx }: {
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
export function Step4({ c, setC, activeGroupIdx, setActiveGroupIdx }: {
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
