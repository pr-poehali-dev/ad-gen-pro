import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: number;
  name: string;
  category: "sale" | "brand" | "info" | "promo" | "retargeting";
  title: string;
  description: string;
  ctaText: string;
  industry: string;
  uses: number;
  isFavorite: boolean;
}

const initialTemplates: Template[] = [
  { id: 1, name: "Сезонная распродажа", category: "sale", title: "Скидки до 70% — только до конца недели!", description: "Самые популярные товары по выгодным ценам. Бесплатная доставка по всей России. Успейте купить!", ctaText: "Купить со скидкой", industry: "Ритейл", uses: 1248, isFavorite: true },
  { id: 2, name: "Бренд-формирование", category: "brand", title: "{brand} — №1 в своей категории с 2010 года", description: "Доверие миллионов клиентов. Сертифицированное качество. Гарантия 5 лет на все товары.", ctaText: "Узнать больше", industry: "Универсальное", uses: 824, isFavorite: false },
  { id: 3, name: "Информационная статья", category: "info", title: "Как выбрать {product}? Полное руководство 2026", description: "Эксперты собрали главные критерии выбора. Сравнение моделей, рейтинги, отзывы покупателей.", ctaText: "Читать гайд", industry: "Контент", uses: 615, isFavorite: false },
  { id: 4, name: "Чёрная пятница", category: "promo", title: "Чёрная пятница: -50% на ВСЁ. Один день!", description: "Самый низкие цены года. Тысячи товаров со скидкой. Только 29 ноября!", ctaText: "Поймать скидку", industry: "Ритейл", uses: 2104, isFavorite: true },
  { id: 5, name: "Возврат брошенной корзины", category: "retargeting", title: "Вы забыли товары в корзине!", description: "Оформите заказ сегодня и получите промокод на скидку 10%. Доставка завтра.", ctaText: "Завершить заказ", industry: "E-commerce", uses: 1567, isFavorite: false },
  { id: 6, name: "Запуск нового продукта", category: "promo", title: "Только что вышло: {product} новой коллекции", description: "Эксклюзивный дизайн. Премиальные материалы. Ограниченный тираж — успейте первыми.", ctaText: "Смотреть новинку", industry: "Мода", uses: 423, isFavorite: false },
  { id: 7, name: "Скидка по промокоду", category: "sale", title: "Промокод SAVE20 = скидка 20%", description: "Действует 24 часа. На весь ассортимент магазина. Минимальная сумма заказа — 1000 ₽.", ctaText: "Применить код", industry: "Универсальное", uses: 938, isFavorite: false },
  { id: 8, name: "Бесплатная консультация", category: "info", title: "Получите бесплатную консультацию эксперта", description: "Подберём решение под вашу задачу за 15 минут. Без обязательств. Удобное время для звонка.", ctaText: "Получить консультацию", industry: "B2B / Услуги", uses: 712, isFavorite: false },
];

const categoryMeta = {
  sale: { label: "Распродажа", icon: "Tag", color: "hsl(0,75%,60%)" },
  brand: { label: "Бренд", icon: "Award", color: "hsl(260,80%,65%)" },
  info: { label: "Контент", icon: "BookOpen", color: "hsl(185,100%,55%)" },
  promo: { label: "Акция", icon: "Zap", color: "hsl(30,100%,60%)" },
  retargeting: { label: "Возврат", icon: "RotateCcw", color: "hsl(145,70%,50%)" },
};

export default function Templates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(null);

  const filtered = templates.filter(t => {
    const matchCat = filter === "all" || filter === "favorites" ? (filter === "favorites" ? t.isFavorite : true) : t.category === filter;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleFavorite = (id: number) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const applyTemplate = (t: Template) => {
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, uses: x.uses + 1 } : x));
    toast({ title: "Шаблон применён", description: `«${t.name}» скопирован в редактор` });
  };

  const copyText = (t: Template) => {
    navigator.clipboard.writeText(`${t.title}\n${t.description}\n→ ${t.ctaText}`);
    toast({ title: "Скопировано в буфер" });
  };

  const preview = previewId !== null ? templates.find(t => t.id === previewId) : null;
  const favoritesCount = templates.filter(t => t.isFavorite).length;

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Библиотека шаблонов</h1>
          <p className="text-muted-foreground text-sm mt-1">Готовые объявления, проверенные тысячами рекламодателей</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">{templates.length}</strong> шаблонов · <strong className="text-foreground">{favoritesCount}</strong> в избранном
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[
          { id: "all", label: "Все", icon: "LayoutGrid" },
          { id: "favorites", label: "Избранное", icon: "Star" },
          { id: "sale", label: "Распродажа", icon: "Tag" },
          { id: "promo", label: "Акция", icon: "Zap" },
          { id: "brand", label: "Бренд", icon: "Award" },
          { id: "info", label: "Контент", icon: "BookOpen" },
          { id: "retargeting", label: "Возврат", icon: "RotateCcw" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f.id ? "text-background" : "glass text-muted-foreground hover:text-foreground"
            }`}
            style={filter === f.id ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}
          >
            <Icon name={f.icon} size={13} />
            {f.label}
          </button>
        ))}
        <div className="md:ml-auto relative w-full md:w-auto">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск шаблонов..."
            className="pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 w-full md:w-52 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => {
          const meta = categoryMeta[t.category];
          return (
            <div key={t.id} className="glass glass-hover rounded-2xl p-5 group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}>
                    <Icon name={meta.icon} size={14} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: meta.color }}>{meta.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.industry}</div>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(t.id)}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors">
                  <Icon name={t.isFavorite ? "Star" : "Star"} size={15}
                    className={t.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"} />
                </button>
              </div>

              <div className="font-heading font-bold text-foreground text-sm mb-1 leading-snug">{t.name}</div>
              <div className="text-sm font-semibold text-foreground/90 mb-2 line-clamp-2">{t.title}</div>
              <div className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{t.description}</div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Icon name="TrendingUp" size={11} />
                  {t.uses.toLocaleString("ru-RU")} применений
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">→ {t.ctaText}</span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/30">
                <button
                  onClick={() => applyTemplate(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-background transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                  <Icon name="Sparkles" size={12} />
                  Применить
                </button>
                <button onClick={() => setPreviewId(t.id)} title="Превью"
                  className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="Eye" size={13} />
                </button>
                <button onClick={() => copyText(t)} title="Копировать"
                  className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="Copy" size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground text-sm">
          Шаблоны не найдены. Попробуйте изменить фильтр или поиск.
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewId(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground text-lg">{preview.name}</h2>
              <button onClick={() => setPreviewId(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="rounded-xl border border-border p-4 bg-muted/20 mb-4">
              <div className="text-base font-bold text-foreground mb-2">{preview.title}</div>
              <div className="text-sm text-foreground/80 mb-3">{preview.description}</div>
              <button className="text-xs font-semibold text-background px-3 py-1.5 rounded-lg"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                {preview.ctaText} →
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { applyTemplate(preview); setPreviewId(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                Применить шаблон
              </button>
              <button onClick={() => copyText(preview)}
                className="px-4 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="Copy" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}