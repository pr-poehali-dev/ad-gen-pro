import { useState } from "react";
import Icon from "@/components/ui/icon";

const feeds = [
  { id: 1, name: "Каталог товаров зима 2025", type: "YML", size: "4.2 МБ", products: 1840, updated: "Сегодня, 09:14", status: "ok" },
  { id: 2, name: "Электроника и гаджеты", type: "CSV", size: "1.8 МБ", products: 720, updated: "Вчера, 18:32", status: "ok" },
  { id: 3, name: "Бытовая техника Q1", type: "Excel", size: "3.1 МБ", products: 560, updated: "28 апр, 11:55", status: "warning" },
];

export default function Feeds() {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Загрузка фидов</h1>
          <p className="text-muted-foreground text-sm mt-1">Поддерживаются форматы YML, CSV, Excel</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background"
          style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
        >
          <Icon name="Plus" size={16} />
          Добавить фид
        </button>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        className={`relative mb-8 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${
          dragging
            ? "border-neon-cyan bg-neon-cyan/5"
            : "border-border/50 hover:border-muted-foreground/30"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.15), hsl(260,80%,65%,0.15))' }}>
            <Icon name="UploadCloud" size={32} className="text-neon-cyan" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground mb-1">Перетащите файл сюда</p>
            <p className="text-sm text-muted-foreground">или <span className="text-neon-cyan cursor-pointer hover:underline">выберите файл</span> с компьютера</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {["YML", "CSV", "XLSX", "XLS"].map(fmt => (
              <span key={fmt} className="px-2.5 py-1 rounded-lg bg-muted border border-border font-medium">{fmt}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Максимальный размер файла: 50 МБ</p>
        </div>
      </div>

      {/* Feeds table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-heading font-bold text-foreground">Загруженные фиды</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-neon-green" />
            Автообновление: каждые 6 ч
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              {["Название", "Формат", "Товаров", "Размер", "Обновлён", "Статус", ""].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feeds.map((feed) => (
              <tr key={feed.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-background"
                      style={{
                        background: feed.type === 'YML'
                          ? 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))'
                          : feed.type === 'CSV'
                          ? 'linear-gradient(135deg, hsl(260,80%,65%), hsl(290,70%,60%))'
                          : 'linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))'
                      }}>
                      {feed.type[0]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{feed.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-medium">{feed.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-medium">{feed.products.toLocaleString('ru-RU')}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{feed.size}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{feed.updated}</td>
                <td className="px-6 py-4">
                  {feed.status === 'ok' ? (
                    <span className="status-active text-xs px-2.5 py-1 rounded-lg font-semibold">
                      Активен
                    </span>
                  ) : (
                    <span className="status-paused text-xs px-2.5 py-1 rounded-lg font-semibold">
                      Предупреждение
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      <Icon name="RefreshCw" size={15} />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      <Icon name="Settings" size={15} />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Stats footer */}
        <div className="px-6 py-3 border-t border-border/30 flex items-center gap-6 text-xs text-muted-foreground">
          <span>Итого фидов: <strong className="text-foreground">3</strong></span>
          <span>Всего товаров: <strong className="text-foreground">3 120</strong></span>
          <span>Последнее обновление: <strong className="text-foreground">сегодня в 09:14</strong></span>
        </div>
      </div>
    </div>
  );
}
