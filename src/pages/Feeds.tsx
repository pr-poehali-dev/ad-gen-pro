import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Feed } from "@/App";

interface FeedsProps {
  feeds: Feed[];
  onDelete: (id: number) => void;
  onRefresh: (id: number) => void;
  onAdd: (feed: Omit<Feed, "id">) => void;
}

export default function Feeds({ feeds, onDelete, onRefresh, onAdd }: FeedsProps) {
  const [dragging, setDragging] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalProducts = feeds.reduce((s, f) => s + f.products, 0);
  const lastUpdated = feeds.length > 0 ? feeds[0].updated : "—";

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const type: Feed["type"] = ext === "yml" || ext === "xml" ? "YML" : ext === "csv" ? "CSV" : "Excel";
    const sizeMb = (file.size / 1024 / 1024).toFixed(1) + " МБ";
    const now = new Date();
    const updated = `Сегодня, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    onAdd({
      name: file.name.replace(/\.[^.]+$/, ""),
      type,
      size: sizeMb,
      products: 0,
      updated,
      status: "ok",
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleRefresh = async (id: number) => {
    setRefreshingId(id);
    await new Promise(r => setTimeout(r, 800));
    onRefresh(id);
    setRefreshingId(null);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Загрузка фидов</h1>
          <p className="text-muted-foreground text-sm mt-1">Поддерживаются форматы YML, CSV, Excel</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
        >
          <Icon name="Plus" size={16} />
          Добавить фид
        </button>
        <input ref={fileInputRef} type="file" accept=".yml,.xml,.csv,.xlsx,.xls" className="hidden" onChange={handleFileInput} />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative mb-8 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${
          dragging ? "border-neon-cyan bg-neon-cyan/5 scale-[1.01]" : "border-border/50 hover:border-muted-foreground/30 hover:bg-muted/5"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.15), hsl(260,80%,65%,0.15))' }}>
            <Icon name="UploadCloud" size={32} className="text-neon-cyan" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground mb-1">
              {dragging ? "Отпустите файл" : "Перетащите файл сюда"}
            </p>
            <p className="text-sm text-muted-foreground">или <span className="text-neon-cyan">выберите файл</span> с компьютера</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {["YML", "CSV", "XLSX", "XLS"].map(fmt => (
              <span key={fmt} className="px-2.5 py-1 rounded-lg bg-muted border border-border font-medium">{fmt}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Максимальный размер файла: 50 МБ</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-heading font-bold text-foreground">Загруженные фиды</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-neon-green" />
            Автообновление: каждые 6 ч
          </div>
        </div>

        {feeds.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">
            Нет загруженных фидов. Перетащите файл или нажмите «Добавить фид».
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Название", "Формат", "Товаров", "Размер", "Обновлён", "Статус", ""].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
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
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {feed.products > 0 ? feed.products.toLocaleString("ru-RU") : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{feed.size}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{feed.updated}</td>
                  <td className="px-6 py-4">
                    {feed.status === 'ok' ? (
                      <span className="status-active text-xs px-2.5 py-1 rounded-lg font-semibold">Активен</span>
                    ) : (
                      <span className="status-paused text-xs px-2.5 py-1 rounded-lg font-semibold">Предупреждение</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRefresh(feed.id)}
                        title="Обновить"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                        <Icon name="RefreshCw" size={15} className={refreshingId === feed.id ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={() => setDeleteId(feed.id)}
                        title="Удалить"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="px-6 py-3 border-t border-border/30 flex items-center gap-6 text-xs text-muted-foreground">
          <span>Итого фидов: <strong className="text-foreground">{feeds.length}</strong></span>
          <span>Всего товаров: <strong className="text-foreground">{totalProducts.toLocaleString("ru-RU")}</strong></span>
          <span>Последнее обновление: <strong className="text-foreground">{lastUpdated}</strong></span>
        </div>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Icon name="Trash2" size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground">Удалить фид?</h2>
                <p className="text-xs text-muted-foreground">«{feeds.find(f => f.id === deleteId)?.name}»</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button
                onClick={() => { onDelete(deleteId); setDeleteId(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, hsl(0,80%,55%), hsl(15,80%,50%))' }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
