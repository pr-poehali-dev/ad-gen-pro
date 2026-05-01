import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface SavedLink {
  id: number;
  name: string;
  url: string;
  date: string;
}

const presets = [
  { id: "yandex", label: "Яндекс Директ", source: "yandex", medium: "cpc" },
  { id: "google", label: "Google Ads", source: "google", medium: "cpc" },
  { id: "vk", label: "ВКонтакте", source: "vk", medium: "social" },
  { id: "telegram", label: "Telegram Ads", source: "telegram", medium: "social" },
  { id: "email", label: "Email-рассылка", source: "newsletter", medium: "email" },
];

const validate = (s: string) => /^https?:\/\/.+/.test(s);

export default function UtmBuilder() {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("https://example.com/landing");
  const [source, setSource] = useState("yandex");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("winter_sale");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([
    { id: 1, name: "Зимняя распродажа · Я.Директ", url: "https://example.com/winter?utm_source=yandex&utm_medium=cpc&utm_campaign=winter_sale", date: "Сегодня, 10:14" },
  ]);

  const buildUrl = () => {
    if (!baseUrl) return "";
    const params = new URLSearchParams();
    if (source) params.set("utm_source", source);
    if (medium) params.set("utm_medium", medium);
    if (campaign) params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    if (term) params.set("utm_term", term);
    const sep = baseUrl.includes("?") ? "&" : "?";
    return baseUrl + sep + params.toString();
  };

  const url = buildUrl();
  const valid = validate(baseUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Скопировано", description: "Ссылка с UTM-метками в буфере обмена" });
  };

  const handleSave = () => {
    if (!valid) return;
    const now = new Date();
    const date = `Сегодня, ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    setSavedLinks(prev => [{ id: Date.now(), name: campaign || "Без имени", url, date }, ...prev]);
    toast({ title: "Ссылка сохранена" });
  };

  const handlePreset = (p: typeof presets[0]) => {
    setSource(p.source);
    setMedium(p.medium);
  };

  const handleDelete = (id: number) => {
    setSavedLinks(prev => prev.filter(l => l.id !== id));
  };

  const fields = [
    { label: "URL целевой страницы *", value: baseUrl, set: setBaseUrl, ph: "https://example.com/landing", hint: "Адрес, куда ведёт реклама" },
    { label: "Источник (utm_source) *", value: source, set: setSource, ph: "yandex", hint: "Откуда трафик: yandex, google, vk" },
    { label: "Канал (utm_medium) *", value: medium, set: setMedium, ph: "cpc", hint: "Тип рекламы: cpc, social, email" },
    { label: "Кампания (utm_campaign) *", value: campaign, set: setCampaign, ph: "winter_sale", hint: "Название кампании" },
    { label: "Креатив (utm_content)", value: content, set: setContent, ph: "banner_300x250", hint: "Идентификатор объявления" },
    { label: "Ключ (utm_term)", value: term, set: setTerm, ph: "купить+куртку", hint: "Поисковый запрос/ключ" },
  ];

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">UTM-генератор</h1>
        <p className="text-muted-foreground text-sm mt-1">Создавайте размеченные ссылки для отслеживания эффективности кампаний</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Presets */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-3">Быстрые шаблоны</h3>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                    source === p.source && medium === p.medium
                      ? "text-background"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                  style={source === p.source && medium === p.medium
                    ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }
                    : {}}
                >
                  <Icon name="Zap" size={13} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="glass rounded-2xl p-6 space-y-4">
            {fields.map((f, i) => (
              <div key={i}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>{f.label}</span>
                  <span className="text-[10px] text-muted-foreground/60">{f.hint}</span>
                </label>
                <input
                  type="text"
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-foreground">Готовая ссылка</h3>
              {valid ? (
                <span className="status-active text-[10px] px-2 py-0.5 rounded-md font-semibold">Валидно</span>
              ) : (
                <span className="status-paused text-[10px] px-2 py-0.5 rounded-md font-semibold">Неверный URL</span>
              )}
            </div>
            <div className="bg-muted/40 rounded-xl p-4 mb-4 break-all text-sm font-mono text-foreground border border-border/50 max-h-32 overflow-y-auto">
              {url || "—"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!valid}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
              >
                <Icon name="Copy" size={15} />
                Скопировать
              </button>
              <button
                onClick={handleSave}
                disabled={!valid}
                className="px-4 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Bookmark" size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Saved */}
        <div className="glass rounded-2xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-heading font-bold text-foreground">Сохранённые ссылки</h3>
            <span className="text-xs text-muted-foreground">{savedLinks.length}</span>
          </div>
          {savedLinks.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">Пока ничего не сохранено</div>
          ) : (
            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
              {savedLinks.map(l => (
                <div key={l.id} className="px-5 py-4 hover:bg-muted/10 transition-colors group">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground truncate flex-1 mr-2">{l.name}</span>
                    <button onClick={() => handleDelete(l.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all">
                      <Icon name="X" size={13} />
                    </button>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono break-all line-clamp-2 mb-1.5">{l.url}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{l.date}</span>
                    <button onClick={() => { navigator.clipboard.writeText(l.url); toast({ title: "Скопировано" }); }}
                      className="text-[10px] text-neon-cyan hover:underline">Копировать</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
