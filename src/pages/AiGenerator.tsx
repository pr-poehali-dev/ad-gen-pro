import { useState } from "react";
import Icon from "@/components/ui/icon";

const templates = [
  { id: "search", label: "Поисковые", icon: "Search" },
  { id: "banner", label: "Баннеры", icon: "Image" },
  { id: "product", label: "Товарные", icon: "ShoppingBag" },
  { id: "smart", label: "Смарт-баннеры", icon: "Sparkles" },
];

const generated = [
  {
    title: "Зимние куртки — скидки до 40%",
    desc: "Тёплые куртки для суровой зимы. Выбирайте из 500+ моделей. Быстрая доставка. Примерка дома!",
    ctr: "3.4%",
    score: 92,
  },
  {
    title: "Куртки от 2 490 ₽ — акция",
    desc: "Огромный выбор мужских и женских курток. Закажите онлайн и получите бесплатную доставку уже завтра.",
    ctr: "2.8%",
    score: 87,
  },
  {
    title: "Куртка зима — купить выгодно",
    desc: "Сравните цены, читайте отзывы. Более 200 брендов. Возврат в течение 30 дней без вопросов.",
    ctr: "2.1%",
    score: 78,
  },
];

export default function AiGenerator() {
  const [activeTemplate, setActiveTemplate] = useState("search");
  const [feedSelected, setFeedSelected] = useState("Каталог товаров зима 2025");
  const [tone, setTone] = useState("Продажи");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const handleGenerate = () => {
    setIsGenerating(true);
    setShowResults(false);
    setTimeout(() => {
      setIsGenerating(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">ИИ-генерация объявлений</h1>
          <p className="text-muted-foreground text-sm mt-1">Создайте сотни объявлений за секунды на основе вашего каталога</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs">
          <div className="w-2 h-2 rounded-full animate-pulse-slow bg-neon-violet" />
          <span className="text-muted-foreground">GPT-4o · Токенов: <strong className="text-foreground">48 240</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Config panel */}
        <div className="col-span-2 space-y-5">
          {/* Ad type */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-4">Тип объявления</h3>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${
                    activeTemplate === t.id
                      ? "text-background"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                  style={activeTemplate === t.id ? {
                    background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(290,70%,60%))',
                    boxShadow: '0 4px 15px rgba(140,100,240,0.3)'
                  } : {}}
                >
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed selection */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-4">Источник данных</h3>
            <div className="space-y-2">
              {["Каталог товаров зима 2025", "Электроника и гаджеты", "Бытовая техника Q1"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFeedSelected(f)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${
                    feedSelected === f
                      ? "border border-neon-cyan/40 text-foreground"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                  style={feedSelected === f ? { background: 'rgba(0,220,230,0.08)' } : {}}
                >
                  <Icon name="Database" size={15} className={feedSelected === f ? "text-neon-cyan" : ""} />
                  <span className="flex-1 text-left">{f}</span>
                  {feedSelected === f && <Icon name="Check" size={14} className="text-neon-cyan" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-4">Тон текста</h3>
            <div className="flex flex-wrap gap-2">
              {["Продажи", "Экспертный", "Дружелюбный", "Срочность", "Выгода"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tone === t
                      ? "text-background"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                  style={tone === t ? {
                    background: 'linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))'
                  } : {}}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-heading font-bold text-sm text-foreground mb-3">Количество вариантов</h3>
            <div className="flex items-center gap-3">
              {[3, 5, 10, 20].map((n) => (
                <button key={n} className="flex-1 py-2 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Generate btn */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-background font-heading font-bold text-base transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 8px 30px rgba(0,220,230,0.3)' }}
          >
            {isGenerating ? (
              <>
                <Icon name="Loader" size={20} className="animate-spin" />
                Генерирую...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={20} />
                Сгенерировать объявления
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="col-span-3">
          {showResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-foreground">Сгенерированные варианты</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="Download" size={13} />
                  Экспортировать все
                </button>
              </div>
              {generated.map((ad, i) => (
                <div key={i} className="glass glass-hover rounded-2xl p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Заголовок</div>
                      <div className="text-base font-bold text-foreground group-hover:gradient-cyan-violet transition-all">{ad.title}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">Прогноз CTR</div>
                        <div className="text-sm font-bold metric-up">{ad.ctr}</div>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-background"
                        style={{
                          background: ad.score >= 90
                            ? 'linear-gradient(135deg, hsl(145,70%,50%), hsl(165,70%,45%))'
                            : ad.score >= 80
                            ? 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))'
                            : 'linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))'
                        }}
                      >
                        {ad.score}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1 font-medium">Описание</div>
                  <p className="text-sm text-foreground/80 mb-4">{ad.desc}</p>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-background transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                      <Icon name="Plus" size={13} />
                      Добавить в кампанию
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Copy" size={13} />
                      Копировать
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Edit3" size={13} />
                      Редактировать
                    </button>
                    <button className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] glass rounded-2xl">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse-slow"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.2), hsl(260,80%,65%,0.2))' }}>
                <Icon name="Sparkles" size={32} className="text-neon-cyan animate-spin" />
              </div>
              <p className="font-heading font-bold text-foreground mb-1">Генерирую объявления...</p>
              <p className="text-sm text-muted-foreground">ИИ анализирует ваш каталог товаров</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
