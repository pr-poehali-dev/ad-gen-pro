import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import { Page } from "@/App";
import { ydApi } from "./yd/api";
import type { YdGroupListItem } from "./yd/api";
import func2url from "../../backend/func2url.json";

const GENERATE_ADS_URL = (func2url as Record<string, string>)["generate-ads"];
const FEEDS_URL = (func2url as Record<string, string>).feeds;

interface AiGeneratorProps {
  onNavigate: (page: Page) => void;
}

interface FeedRow {
  id: number;
  name: string;
  type: string;
  products: number;
}

const TEMPLATES = [
  { id: "search", label: "Поиск", icon: "Search", desc: "Текстовое объявление в поиске" },
  { id: "product", label: "Товары", icon: "ShoppingBag", desc: "С ценой и характеристиками" },
  { id: "banner", label: "Баннер", icon: "Image", desc: "Медийный баннер" },
  { id: "smart", label: "Смарт", icon: "Sparkles", desc: "Динамический баннер" },
];

const TONES = ["Продажи", "Экспертный", "Дружелюбный", "Срочность", "Выгода"];

interface GeneratedAd {
  title1: string;
  title2: string;
  body: string;
  predicted_ctr: number;
  quality_score: number;
  keywords: string[];
}

export default function AiGenerator({ onNavigate }: AiGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<FeedRow[]>([]);
  const [groups, setGroups] = useState<YdGroupListItem[]>([]);
  const [feedId, setFeedId] = useState<number | null>(null);
  const [customContext, setCustomContext] = useState("");
  const [tone, setTone] = useState("Продажи");
  const [adType, setAdType] = useState("search");
  const [count, setCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedAd[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [feedsRes, groupsRes] = await Promise.all([
        fetch(`${FEEDS_URL}?action=list`, { headers: authHeaders() }).then((r) => r.json()),
        ydApi.groups(),
      ]);
      const list: FeedRow[] = feedsRes.feeds || [];
      setFeeds(list);
      if (list.length > 0 && !feedId) setFeedId(list[0].id);
      setGroups(groupsRes.groups || []);
      if (groupsRes.groups && groupsRes.groups.length > 0 && !targetGroupId) {
        setTargetGroupId(groupsRes.groups[0].id);
      }
    } catch (e) {
      toast({ title: "Не удалось загрузить", description: String(e) });
    }
  }, [user, toast, feedId, targetGroupId]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    setResults([]);
    setSelected(new Set());
    setError(null);
    try {
      const feed = feeds.find((f) => f.id === feedId);
      const body: Record<string, unknown> = {
        ad_type: adType,
        tone,
        count,
        feed_name: feed?.name || "каталог",
        context: customContext || undefined,
      };
      if (feedId) body.feed_id = feedId;
      const res = await fetch(GENERATE_ADS_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка генерации");
      setResults(d.ads || []);
      toast({ title: "Сгенерировано", description: `${d.count} объявлений` });
    } catch (e) {
      const msg = String(e);
      setError(msg);
      toast({ title: "Ошибка", description: msg });
    } finally {
      setGenerating(false);
    }
  };

  const toggle = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((_, i) => i)));
  };

  const saveToCampaign = async () => {
    if (!targetGroupId) {
      toast({ title: "Выберите группу" });
      return;
    }
    if (selected.size === 0) {
      toast({ title: "Отметьте объявления" });
      return;
    }
    setSaving(true);
    try {
      const adsToSave = Array.from(selected).map((i) => results[i]).map((a) => ({
        ad_type: adType === "banner" || adType === "smart" ? "network_image" : "text",
        title1: a.title1,
        title2: a.title2,
        body: a.body,
        display_url: "",
        href: "",
        sitelinks: [],
        callouts: [],
      }));
      const allKeywords = Array.from(selected)
        .flatMap((i) => results[i].keywords || [])
        .filter(Boolean);
      const uniqueKw = Array.from(new Set(allKeywords));

      const res = await ydApi.addAds(targetGroupId, adsToSave, uniqueKw);
      toast({
        title: "Сохранено в группу",
        description: `Добавлено объявлений: ${res.inserted}, фраз: ${uniqueKw.length}`,
      });
      try {
        localStorage.setItem("matad_open_campaign", String(res.campaign_id));
      } catch {/* noop */}
      onNavigate("campaigns");
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const copyAd = (a: GeneratedAd) => {
    const text = `${a.title1} — ${a.title2}\n${a.body}\n\nКлючевые: ${(a.keywords || []).join(", ")}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано в буфер" });
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Генерация объявлений работает с вашими фидами и кампаниями</div>
        </div>
      </div>
    );
  }

  const targetGroup = groups.find((g) => g.id === targetGroupId);

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
          <Icon name="Sparkles" size={13} /> AI-генерация на GPT-4o
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Генератор объявлений</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Подгружает товары из фида, генерирует объявления и сохраняет их прямо в группу кампании
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        {/* Левая панель: настройки */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-heading font-bold text-foreground mb-3">1. Источник</h3>
            {feeds.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs">
                <div className="font-bold text-amber-500 mb-1">Нет фидов</div>
                <div className="text-muted-foreground mb-2">Загрузите YML или CSV — товары попадут в промпт.</div>
                <button onClick={() => onNavigate("feeds")} className="text-neon-cyan hover:underline text-xs">
                  → Загрузить фид
                </button>
              </div>
            ) : (
              <select value={feedId ?? ""} onChange={(e) => setFeedId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
                {feeds.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} · {f.products} товаров</option>
                ))}
              </select>
            )}
            <textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Доп. контекст: УТП, скидки, бренд (необязательно)"
              rows={2}
              className="mt-2 w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs resize-none" />
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-heading font-bold text-foreground mb-3">2. Тип объявления</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map((t) => {
                const active = adType === t.id;
                return (
                  <button key={t.id} onClick={() => setAdType(t.id)}
                    className={`text-left p-2.5 rounded-lg border ${active ? "border-neon-cyan bg-neon-cyan/10" : "border-border/40 bg-muted/20"}`}>
                    <Icon name={t.icon} size={14} className={active ? "text-neon-cyan" : "text-muted-foreground"} />
                    <div className={`text-xs font-bold mt-1 ${active ? "text-neon-cyan" : "text-foreground"}`}>{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-heading font-bold text-foreground mb-3">3. Тон и количество</h3>
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5 block">Тон</label>
                <div className="flex flex-wrap gap-1">
                  {TONES.map((t) => (
                    <button key={t} onClick={() => setTone(t)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                        tone === t ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border bg-muted/20 text-muted-foreground"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5 block">
                  Количество: <span className="text-neon-cyan">{count}</span>
                </label>
                <input type="range" min="1" max="10" value={count} onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan" />
              </div>
            </div>
          </div>

          <button onClick={generate} disabled={generating}
            className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-background flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            {generating ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Wand2" size={16} />}
            {generating ? "Генерируем..." : "Сгенерировать"}
          </button>
        </div>

        {/* Правая панель: результаты */}
        <div className="space-y-3">
          {error && (
            <div className="glass rounded-2xl p-4 bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 text-destructive font-bold mb-1">
                <Icon name="AlertTriangle" size={14} /> Ошибка
              </div>
              <div className="text-xs text-muted-foreground">{error}</div>
            </div>
          )}

          {generating && (
            <div className="glass rounded-2xl p-12 text-center">
              <Icon name="Loader2" size={32} className="animate-spin text-neon-cyan mx-auto mb-3" />
              <div className="text-sm text-muted-foreground">GPT-4o пишет объявления — обычно 10-25 секунд...</div>
            </div>
          )}

          {!generating && results.length === 0 && !error && (
            <div className="glass rounded-2xl p-12 text-center">
              <Icon name="Sparkles" size={36} className="text-muted-foreground/50 mx-auto mb-3" />
              <div className="font-heading font-bold text-foreground mb-1">Готово к генерации</div>
              <div className="text-sm text-muted-foreground">
                Выберите фид и тип, нажмите «Сгенерировать»
              </div>
            </div>
          )}

          {results.length > 0 && (
            <>
              {/* Шапка с действиями */}
              <div className="glass rounded-2xl p-3 flex items-center gap-2 flex-wrap">
                <button onClick={toggleAll}
                  className="px-3 py-1.5 rounded-lg glass text-xs font-semibold hover:bg-muted/30 flex items-center gap-1">
                  <Icon name={selected.size === results.length ? "CheckSquare" : "Square"} size={12} />
                  {selected.size === results.length ? "Снять все" : "Выбрать все"}
                </button>
                <div className="text-xs text-muted-foreground">
                  Выбрано: <span className="font-bold text-foreground">{selected.size}</span> из {results.length}
                </div>
                <div className="flex-1" />
                <select value={targetGroupId ?? ""} onChange={(e) => setTargetGroupId(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-xs flex-1 min-w-[200px]">
                  <option value="">— выберите группу —</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.campaign_name} → {g.name} ({g.ads_count})
                    </option>
                  ))}
                </select>
                <button onClick={saveToCampaign} disabled={saving || selected.size === 0 || !targetGroupId}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-background flex items-center gap-1 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                  {saving ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Save" size={12} />}
                  В группу
                </button>
              </div>

              {targetGroup === undefined && groups.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs flex items-center gap-2">
                  <Icon name="Info" size={14} className="text-amber-500" />
                  <div>
                    <span className="text-foreground">Нет групп для сохранения. </span>
                    <button onClick={() => onNavigate("campaigns")} className="text-neon-cyan hover:underline">
                      Создайте кампанию
                    </button>
                  </div>
                </div>
              )}

              {/* Карточки объявлений */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {results.map((a, i) => {
                  const isSelected = selected.has(i);
                  const titleFull = `${a.title1} — ${a.title2}`.trim();
                  return (
                    <div key={i}
                      className={`glass rounded-2xl p-4 border-2 transition-colors cursor-pointer ${
                        isSelected ? "border-neon-cyan" : "border-transparent hover:border-border"
                      }`}
                      onClick={() => toggle(i)}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            isSelected ? "border-neon-cyan bg-neon-cyan" : "border-muted-foreground"
                          }`}>
                            {isSelected && <Icon name="Check" size={11} className="text-background" />}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                            Вариант #{i + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: "hsl(145,70%,50%,0.15)", color: "hsl(145,70%,50%)" }}>
                            CTR ~{a.predicted_ctr}%
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: "hsl(185,100%,55%,0.15)", color: "hsl(185,100%,55%)" }}>
                            QS {a.quality_score}
                          </span>
                        </div>
                      </div>

                      <div className="bg-background rounded-lg p-3 border border-border/30 mb-2">
                        <div className="text-[#3F51B5] text-base font-medium leading-snug">{titleFull}</div>
                        <div className="text-sm text-foreground/80 mt-1 leading-snug">{a.body}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 mb-2 text-[10px] text-muted-foreground">
                        <div>T1: <span className={`font-bold ${a.title1.length > 56 ? "text-destructive" : "text-foreground"}`}>
                          {a.title1.length}/56
                        </span></div>
                        <div>T2: <span className={`font-bold ${a.title2.length > 30 ? "text-destructive" : "text-foreground"}`}>
                          {a.title2.length}/30
                        </span></div>
                        <div>Текст: <span className={`font-bold ${a.body.length > 81 ? "text-destructive" : "text-foreground"}`}>
                          {a.body.length}/81
                        </span></div>
                      </div>

                      {a.keywords && a.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {a.keywords.slice(0, 5).map((k, ki) => (
                            <span key={ki} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 font-mono text-muted-foreground">
                              {k}
                            </span>
                          ))}
                        </div>
                      )}

                      <button onClick={(e) => { e.stopPropagation(); copyAd(a); }}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <Icon name="Copy" size={10} /> Скопировать
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
