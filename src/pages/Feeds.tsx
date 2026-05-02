import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import func2url from "../../backend/func2url.json";

const FEEDS_URL = (func2url as Record<string, string>).feeds;

interface FeedRow {
  id: number;
  name: string;
  type: string;
  size: string;
  size_bytes: number;
  products: number;
  status: string;
  original_filename: string;
  cdn_url: string;
  parse_error: string;
  created_at: string;
  updated_at: string;
}

interface FeedItem {
  id: number;
  sku: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  vendor: string;
  url: string;
  image_url: string;
  available: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const idx = res.indexOf(",");
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Feeds() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewItems, setPreviewItems] = useState<FeedItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    fetch(`${FEEDS_URL}?action=list`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setFeeds(d.feeds || []);
      })
      .catch((e) => toast({ title: "Не удалось загрузить", description: String(e) }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  const totalProducts = feeds.reduce((s, f) => s + (f.products || 0), 0);

  const uploadFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Файл больше 50 МБ" });
      return;
    }
    setUploading(true);
    try {
      const b64 = await fileToBase64(file);
      const res = await fetch(`${FEEDS_URL}?action=upload`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ filename: file.name, content_base64: b64 }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка загрузки");
      toast({
        title: d.parse_error ? "Загружено с предупреждением" : "Фид загружен",
        description: d.parse_error || `Распознано товаров: ${d.products}`,
      });
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const remove = async (id: number) => {
    try {
      const res = await fetch(`${FEEDS_URL}?action=delete`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({ title: "Фид удалён" });
      setDeleteId(null);
      setFeeds(feeds.filter((f) => f.id !== id));
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    }
  };

  const openPreview = async (id: number) => {
    setPreviewId(id);
    setPreviewItems([]);
    setPreviewLoading(true);
    try {
      const res = await fetch(`${FEEDS_URL}?action=items&id=${id}`, { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      setPreviewItems(d.items || []);
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Фиды и товары хранятся в вашем личном кабинете</div>
        </div>
      </div>
    );
  }

  const previewFeed = feeds.find((f) => f.id === previewId);

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Загрузка фидов</h1>
          <p className="text-muted-foreground text-sm mt-1">YML, CSV — товары парсятся автоматически. До 50 МБ.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105 self-start md:self-auto disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))" }}>
          <Icon name={uploading ? "Loader2" : "Plus"} size={16} className={uploading ? "animate-spin" : ""} />
          {uploading ? "Загружаем..." : "Добавить фид"}
        </button>
        <input ref={fileInputRef} type="file" accept=".yml,.xml,.csv" className="hidden" onChange={handleFileInput} />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative mb-8 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${
          dragging ? "border-neon-cyan bg-neon-cyan/5 scale-[1.01]" : "border-border/50 hover:border-muted-foreground/30 hover:bg-muted/5"
        }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%,0.15), hsl(260,80%,65%,0.15))" }}>
            <Icon name={uploading ? "Loader2" : "UploadCloud"} size={32} className={`text-neon-cyan ${uploading ? "animate-spin" : ""}`} />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground mb-1">
              {uploading ? "Загружаем и парсим..." : dragging ? "Отпустите файл" : "Перетащите файл сюда"}
            </p>
            <p className="text-sm text-muted-foreground">или <span className="text-neon-cyan">выберите файл</span> с компьютера</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {["YML", "XML", "CSV"].map((fmt) => (
              <span key={fmt} className="px-2.5 py-1 rounded-lg bg-muted border border-border font-medium">{fmt}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Максимальный размер файла: 50 МБ</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-heading font-bold text-foreground">Загруженные фиды</h3>
          <div className="text-xs text-muted-foreground">
            Всего фидов: <span className="font-bold text-foreground">{feeds.length}</span> ·
            Товаров: <span className="font-bold text-foreground">{totalProducts.toLocaleString("ru-RU")}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
          </div>
        ) : feeds.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">
            Нет загруженных фидов. Перетащите файл или нажмите «Добавить фид».
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
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
                            background: feed.type === "YML"
                              ? "linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))"
                              : feed.type === "CSV"
                              ? "linear-gradient(135deg, hsl(260,80%,65%), hsl(290,70%,60%))"
                              : "linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))",
                          }}>
                          {feed.type[0]}
                        </div>
                        <div className="min-w-0">
                          <button onClick={() => openPreview(feed.id)} className="text-sm font-medium text-foreground hover:text-neon-cyan text-left truncate max-w-[260px]">
                            {feed.name}
                          </button>
                          {feed.parse_error && (
                            <div className="text-[10px] text-amber-500 truncate max-w-[260px]" title={feed.parse_error}>
                              {feed.parse_error}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-medium">{feed.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {feed.products > 0 ? feed.products.toLocaleString("ru-RU") : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{feed.size}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(feed.updated_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4">
                      {feed.status === "ok" ? (
                        <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-neon-green/15 text-neon-green">Активен</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-amber-500/15 text-amber-500">Предупреждение</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openPreview(feed.id)} title="Просмотр товаров"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                          <Icon name="Eye" size={15} />
                        </button>
                        {feed.cdn_url && (
                          <a href={feed.cdn_url} target="_blank" rel="noreferrer" title="Скачать"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            <Icon name="Download" size={15} />
                          </a>
                        )}
                        <button onClick={() => setDeleteId(feed.id)} title="Удалить"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Icon name="Trash2" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-sm p-5">
            <div className="text-base font-bold mb-2">Удалить фид?</div>
            <div className="text-sm text-muted-foreground mb-4">Файл и все товары будут удалены безвозвратно.</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl glass text-sm">Отмена</button>
              <button onClick={() => remove(deleteId)} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-destructive hover:bg-destructive/90">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {previewId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-heading font-bold truncate">{previewFeed?.name}</div>
                <div className="text-xs text-muted-foreground">
                  Всего товаров: {previewFeed?.products.toLocaleString("ru-RU")} (показаны первые 200)
                </div>
              </div>
              <button onClick={() => setPreviewId(null)} className="p-1.5 rounded-lg hover:bg-muted/30">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="overflow-auto flex-1 p-3">
              {previewLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" />
                </div>
              ) : previewItems.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-10">Товары не распарсились</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {previewItems.map((it) => (
                    <div key={it.id} className="bg-muted/20 rounded-xl p-3 border border-border/30">
                      {it.image_url && (
                        <img src={it.image_url} alt="" className="w-full h-28 object-cover rounded-lg mb-2 bg-muted" loading="lazy" />
                      )}
                      <div className="text-sm font-semibold line-clamp-2 mb-1">{it.name || "—"}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neon-cyan">
                          {it.price > 0 ? `${it.price.toLocaleString("ru-RU")} ${it.currency}` : "—"}
                        </span>
                        {it.sku && <span className="text-muted-foreground font-mono">{it.sku}</span>}
                      </div>
                      {it.vendor && <div className="text-[10px] text-muted-foreground mt-1">{it.vendor}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}