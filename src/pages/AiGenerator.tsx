import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { Feed, Campaign } from "@/App";

const GENERATE_ADS_URL = "https://functions.poehali.dev/d58c6f7e-cbc9-48cc-95b4-6bdcacfbc57c";

const templates = [
  { id: "search", label: "Поисковые", icon: "Search" },
  { id: "banner", label: "Баннеры", icon: "Image" },
  { id: "product", label: "Товарные", icon: "ShoppingBag" },
  { id: "smart", label: "Смарт-баннеры", icon: "Sparkles" },
];

type AdResult = {
  title: string;
  description: string;
  predicted_ctr: number;
  quality_score: number;
  keywords: string[];
};

interface AiGeneratorProps {
  feeds: Feed[];
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export default function AiGenerator({ feeds, campaigns, setCampaigns }: AiGeneratorProps) {
  const { toast } = useToast();
  const [activeTemplate, setActiveTemplate] = useState("search");
  const [feedSelected, setFeedSelected] = useState(feeds[0]?.name || "");
  const [tone, setTone] = useState("Продажи");
  const [count, setCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<AdResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [exportedAll, setExportedAll] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setAddedIds(new Set());
    setExportedAll(false);
    try {
      const resp = await fetch(GENERATE_ADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed_name: feedSelected, ad_type: activeTemplate, tone, count }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Ошибка генерации");
      setResults(data.ads || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка генерации");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (ad: AdResult, idx: number) => {
    const text = `${ad.title}\n${ad.description}`;
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Скопировано!", description: "Объявление скопировано в буфер обмена" });
    });
  };

  const handleAddToCampaign = (ad: AdResult, idx: number) => {
    const draft = campaigns.find(c => c.status === "draft");
    if (draft) {
      setCampaigns(prev => prev.map(c => c.id === draft.id ? { ...c, ads: c.ads + 1 } : c));
      toast({ title: "Добавлено в кампанию", description: `«${ad.title}» → ${draft.name}` });
    } else {
      toast({ title: "Нет черновиков", description: "Создайте кампанию в разделе «Кампании»" });
    }
    setAddedIds(prev => new Set(prev).add(idx));
  };

  const handleExportAll = () => {
    if (results.length === 0) return;
    const text = results.map((ad, i) =>
      `--- Объявление ${i + 1} ---\nЗаголовок: ${ad.title}\nОписание: ${ad.description}\nCTR: ${ad.predicted_ctr}%\nКлючевые слова: ${ad.keywords.join(", ")}`
    ).join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adflow_ads_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedAll(true);
    toast({ title: "Экспорт готов", description: `${results.length} объявлений сохранено в файл` });
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">ИИ-генерация объявлений</h1>
          <p className="text-muted-foreground text-sm mt-1">Создайте объявления за секунды на основе вашего каталога</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs self-start md:self-auto">
          <div className="w-2 h-2 rounded-full animate-pulse-slow bg-neon-violet" />
          <span className="text-muted-foreground">polza.ai · <strong className="text-foreground">GPT-4o</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-4">Тип объявления</h3>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${activeTemplate === t.id ? "text-background" : "glass text-muted-foreground hover:text-foreground"}`}
                  style={activeTemplate === t.id ? { background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(290,70%,60%))', boxShadow: '0 4px 15px rgba(140,100,240,0.3)' } : {}}>
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-4">Источник данных</h3>
            {feeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет загруженных фидов. Добавьте фид в разделе «Фиды».</p>
            ) : (
              <div className="space-y-2">
                {feeds.map((f) => (
                  <button key={f.id} onClick={() => setFeedSelected(f.name)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${feedSelected === f.name ? "border border-neon-cyan/40 text-foreground" : "glass text-muted-foreground hover:text-foreground"}`}
                    style={feedSelected === f.name ? { background: 'rgba(0,220,230,0.08)' } : {}}>
                    <Icon name="Database" size={15} className={feedSelected === f.name ? "text-neon-cyan" : ""} />
                    <span className="flex-1 text-left truncate">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{f.products.toLocaleString("ru-RU")} товаров</span>
                    {feedSelected === f.name && <Icon name="Check" size={14} className="text-neon-cyan" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-4">Тон текста</h3>
            <div className="flex flex-wrap gap-2">
              {["Продажи", "Экспертный", "Дружелюбный", "Срочность", "Выгода"].map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tone === t ? "text-background" : "glass text-muted-foreground hover:text-foreground"}`}
                  style={tone === t ? { background: 'linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))' } : {}}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-3">Количество вариантов</h3>
            <div className="flex items-center gap-3">
              {[3, 5, 10].map((n) => (
                <button key={n} onClick={() => setCount(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${count === n ? "text-background" : "glass text-muted-foreground hover:text-foreground"}`}
                  style={count === n ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' } : {}}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || feeds.length === 0}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-background font-heading font-bold text-base transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 8px 30px rgba(0,220,230,0.3)' }}
          >
            {isGenerating ? (
              <><Icon name="Loader" size={20} className="animate-spin" />Генерирую...</>
            ) : (
              <><Icon name="Sparkles" size={20} />Сгенерировать объявления</>
            )}
          </button>
        </div>

        <div className="lg:col-span-3">
          {error && (
            <div className="glass rounded-2xl p-5 border border-destructive/30 text-destructive text-sm mb-4">{error}</div>
          )}
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] glass rounded-2xl">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse-slow"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.2), hsl(260,80%,65%,0.2))' }}>
                <Icon name="Sparkles" size={32} className="text-neon-cyan animate-spin" />
              </div>
              <p className="font-heading font-bold text-foreground mb-1">Генерирую объявления...</p>
              <p className="text-sm text-muted-foreground">ИИ анализирует ваш каталог товаров</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-foreground">{results.length} вариантов</h3>
                <button
                  onClick={handleExportAll}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${exportedAll ? "text-neon-green glass" : "glass text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon name={exportedAll ? "CheckCircle" : "Download"} size={13} />
                  {exportedAll ? "Экспортировано" : "Экспортировать все"}
                </button>
              </div>
              {results.map((ad, i) => (
                <div key={i} className="glass glass-hover rounded-2xl p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Заголовок</div>
                      <div className="text-base font-bold text-foreground">{ad.title}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">Прогноз CTR</div>
                        <div className="text-sm font-bold metric-up">{ad.predicted_ctr}%</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-background"
                        style={{
                          background: ad.quality_score >= 90
                            ? 'linear-gradient(135deg, hsl(145,70%,50%), hsl(165,70%,45%))'
                            : ad.quality_score >= 80
                            ? 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))'
                            : 'linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))'
                        }}>
                        {ad.quality_score}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1 font-medium">Описание</div>
                  <p className="text-sm text-foreground/80 mb-3">{ad.description}</p>
                  {ad.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {ad.keywords.map((kw, ki) => (
                        <span key={ki} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{kw}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCampaign(ad, i)}
                      disabled={addedIds.has(i)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-background transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: addedIds.has(i) ? 'hsl(145,70%,40%)' : 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                      <Icon name={addedIds.has(i) ? "Check" : "Plus"} size={13} />
                      {addedIds.has(i) ? "Добавлено" : "В кампанию"}
                    </button>
                    <button
                      onClick={() => handleCopy(ad, i)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Copy" size={13} />
                      Копировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] glass rounded-2xl">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.15), hsl(260,80%,65%,0.15))' }}>
                <Icon name="Sparkles" size={32} className="text-neon-cyan" />
              </div>
              <p className="font-heading font-bold text-foreground mb-1">Выберите параметры и нажмите «Сгенерировать»</p>
              <p className="text-sm text-muted-foreground">ИИ создаст объявления на основе вашего фида</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}