import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import { ydApi } from "./yd/api";
import { CAMPAIGN_TYPE_META, STATUS_LABEL, STATUS_COLOR } from "./yd/types";
import type { YdCampaignListItem } from "./yd/types";
import { reachGoal } from "@/lib/metrika";
import func2url from "../../backend/func2url.json";

const EXPORT_URL = (func2url as Record<string, string>)["yd-export"];

interface Issue {
  type: "error" | "warning";
  msg: string;
}

interface Preview {
  campaign_name: string;
  campaign_type: string;
  groups_count: number;
  ads_count: number;
  keywords_count: number;
  issues: Issue[];
  ready_to_export: boolean;
}

function downloadBase64Xlsx(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Export() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<YdCampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState<number | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exporting, setExporting] = useState<number | null>(null);

  const load = useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    ydApi.list()
      .then((d) => setItems(d.campaigns))
      .catch((e) => toast({ title: "Не удалось загрузить", description: String(e) }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  const openPreview = async (id: number) => {
    setPreviewing(id);
    setPreview(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`${EXPORT_URL}?action=preview&id=${id}`, { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      setPreview(d as Preview);
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setPreviewLoading(false);
    }
  };

  const exportCampaign = async (id: number) => {
    setExporting(id);
    try {
      const res = await fetch(`${EXPORT_URL}?action=export`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      downloadBase64Xlsx(d.content_base64, d.filename);
      reachGoal("export_done", { campaign_id: id, size_kb: Math.round(d.size_bytes / 1024) });
      toast({
        title: "Файл скачан",
        description: `${d.filename} (${Math.round(d.size_bytes / 1024)} КБ)`,
      });
      setPreviewing(null);
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setExporting(null);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Экспорт работает с вашими кампаниями</div>
        </div>
      </div>
    );
  }

  const previewItem = previewing ? items.find((c) => c.id === previewing) : null;

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
          <Icon name="Upload" size={13} /> Экспорт в Директ Коммандер
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Экспорт кампаний</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Скачайте XLSX-файл и загрузите его в Директ Коммандер: «Файл» → «Загрузить кампании из файла». Перед экспортом сделайте пред-проверку на ошибки.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="Megaphone" size={40} className="text-muted-foreground/50 mx-auto mb-3" />
          <div className="font-heading font-bold text-foreground mb-1">Нет кампаний для экспорта</div>
          <div className="text-sm text-muted-foreground">Создайте кампанию в разделе «Кампании»</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((c) => {
            const m = CAMPAIGN_TYPE_META[c.campaign_type] || CAMPAIGN_TYPE_META.text;
            return (
              <div key={c.id} className="glass rounded-2xl p-4 border border-transparent hover:border-neon-cyan/40">
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${m.color}20`, border: `1px solid ${m.color}40` }}>
                    <Icon name={m.icon} size={16} style={{ color: m.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-sm text-foreground truncate">
                      {c.name || "Без названия"}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: m.color }}>{m.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                        style={{ background: `${STATUS_COLOR[c.status]}20`, color: STATUS_COLOR[c.status] }}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
                  <Mini label="Групп" value={c.groups_count} />
                  <Mini label="Объявл." value={c.ads_count} />
                  <Mini label="Фраз" value={c.keywords_count} />
                </div>

                <div className="flex gap-1.5">
                  <button onClick={() => openPreview(c.id)} disabled={previewLoading || exporting === c.id}
                    className="flex-1 px-3 py-2 rounded-xl glass text-xs font-semibold hover:bg-muted/30 flex items-center justify-center gap-1 disabled:opacity-50">
                    <Icon name="ListChecks" size={12} /> Проверить
                  </button>
                  <button onClick={() => exportCampaign(c.id)} disabled={exporting === c.id}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-background flex items-center justify-center gap-1 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                    {exporting === c.id ? (
                      <Icon name="Loader2" size={12} className="animate-spin" />
                    ) : (
                      <Icon name="Download" size={12} />
                    )}
                    Скачать XLSX
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Инструкция */}
      <div className="glass rounded-2xl p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="BookOpen" size={16} className="text-neon-cyan" />
          <h3 className="font-heading font-bold text-foreground">Как загрузить файл в Директ Коммандер</h3>
        </div>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Скачайте и установите <a href="https://yandex.ru/adv/products/direct/commander" target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">Директ Коммандер</a></li>
          <li>Авторизуйтесь под аккаунтом Яндекс</li>
          <li>В меню выберите <span className="font-mono text-foreground">«Файл» → «Импорт» → «Из файла…»</span></li>
          <li>Укажите скачанный <span className="font-mono text-foreground">.xlsx</span> файл</li>
          <li>Проверьте импортированную кампанию и нажмите «Отправить на сервер»</li>
        </ol>
      </div>

      {/* Modal preview */}
      {previewing && previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-heading font-bold truncate">Проверка перед экспортом</div>
                <div className="text-xs text-muted-foreground truncate">{previewItem.name}</div>
              </div>
              <button onClick={() => setPreviewing(null)} className="p-1.5 rounded-lg hover:bg-muted/30">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="overflow-auto flex-1 p-5 space-y-4">
              {previewLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" />
                </div>
              ) : preview ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Mini label="Групп" value={preview.groups_count} />
                    <Mini label="Объявлений" value={preview.ads_count} />
                    <Mini label="Фраз" value={preview.keywords_count} />
                  </div>

                  {preview.ready_to_export ? (
                    <div className="bg-neon-green/10 border border-neon-green/40 rounded-xl p-3 flex items-start gap-2">
                      <Icon name="CheckCircle2" size={18} className="text-neon-green mt-0.5" />
                      <div>
                        <div className="font-bold text-foreground">Готово к экспорту</div>
                        <div className="text-xs text-muted-foreground">
                          Критических ошибок нет. Можно скачивать XLSX.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/40 rounded-xl p-3 flex items-start gap-2">
                      <Icon name="AlertTriangle" size={18} className="text-destructive mt-0.5" />
                      <div>
                        <div className="font-bold text-foreground">Есть критические ошибки</div>
                        <div className="text-xs text-muted-foreground">
                          Директ Коммандер может отклонить файл. Исправьте ошибки в редакторе кампании.
                        </div>
                      </div>
                    </div>
                  )}

                  {preview.issues.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      Замечаний нет
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-1">
                        Замечания ({preview.issues.length})
                      </div>
                      {preview.issues.map((i, idx) => (
                        <div key={idx} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                          i.type === "error" ? "bg-destructive/10 border border-destructive/30" : "bg-amber-500/10 border border-amber-500/30"
                        }`}>
                          <Icon name={i.type === "error" ? "AlertCircle" : "AlertTriangle"}
                            size={13}
                            className={`mt-0.5 ${i.type === "error" ? "text-destructive" : "text-amber-500"}`} />
                          <span className={i.type === "error" ? "text-destructive" : "text-amber-500"}>
                            {i.msg}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <div className="px-5 py-4 border-t border-border/40 flex justify-end gap-2">
              <button onClick={() => setPreviewing(null)} className="px-4 py-2 rounded-xl glass text-sm">
                Закрыть
              </button>
              <button onClick={() => exportCampaign(previewItem.id)}
                disabled={exporting === previewItem.id || !preview}
                className="px-4 py-2 rounded-xl text-sm font-bold text-background flex items-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                {exporting === previewItem.id ? (
                  <Icon name="Loader2" size={14} className="animate-spin" />
                ) : (
                  <Icon name="Download" size={14} />
                )}
                Скачать XLSX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/20 rounded-lg p-2">
      <div className="text-base font-heading font-bold text-foreground">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  );
}