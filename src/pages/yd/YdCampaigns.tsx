import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ydApi } from "./api";
import { CAMPAIGN_TYPE_META, STATUS_LABEL, STATUS_COLOR } from "./types";
import type { YdCampaignListItem, YdCampaignType } from "./types";
import YdWizard from "./YdWizard";

export default function YdCampaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<YdCampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<YdCampaignType>("text");

  const load = useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    ydApi.list()
      .then((d) => setItems(d.campaigns))
      .catch((e) => toast({ title: "Не удалось загрузить", description: String(e) }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  // Авто-открытие кампании по запросу извне (например, после применения шаблона)
  useEffect(() => {
    try {
      const pending = localStorage.getItem("matad_open_campaign");
      if (pending) {
        const id = parseInt(pending, 10);
        if (id > 0) setEditingId(id);
        localStorage.removeItem("matad_open_campaign");
      }
    } catch {/* noop */}
  }, []);

  const create = async () => {
    if (!newName.trim()) {
      toast({ title: "Введите название" });
      return;
    }
    try {
      const { id } = await ydApi.create(newName.trim(), newType);
      setNewName("");
      setCreating(false);
      setEditingId(id);
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить кампанию вместе со всеми группами и фразами?")) return;
    try {
      await ydApi.remove(id);
      setItems(items.filter((c) => c.id !== id));
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Кампании сохраняются в вашем личном кабинете</div>
        </div>
      </div>
    );
  }

  if (editingId) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <YdWizard campaignId={editingId} onClose={() => { setEditingId(null); load(); }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neon-cyan mb-1 uppercase tracking-widest font-bold">
            <Icon name="Zap" size={13} /> Эксперт-режим
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Кампании Яндекс Директ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Полная настройка как в кабинете ЯД: типы, стратегии, группы, объявления, фразы, регионы и бюджеты
          </p>
        </div>
        <button onClick={() => setCreating(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-background flex items-center gap-2 self-start"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
          <Icon name="Plus" size={14} /> Новая кампания
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Icon name="Megaphone" size={40} className="mx-auto mb-3 text-muted-foreground/50" />
          <div className="font-heading font-bold text-foreground mb-1">Пока нет кампаний</div>
          <div className="text-sm text-muted-foreground mb-4">Создайте первую кампанию — пройдёте мастер за 6 шагов</div>
          <button onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Plus" size={14} /> Создать
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c) => {
            const meta = CAMPAIGN_TYPE_META[c.campaign_type] || CAMPAIGN_TYPE_META.text;
            return (
              <div key={c.id} className="glass rounded-2xl p-4 hover:border-neon-cyan/40 border border-transparent transition-colors">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}>
                      <Icon name={meta.icon} size={16} style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">{c.name || "Без названия"}</div>
                      <div className="text-[11px] text-muted-foreground">{meta.label}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                    style={{ background: `${STATUS_COLOR[c.status]}20`, color: STATUS_COLOR[c.status] }}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Mini label="Групп" value={c.groups_count} />
                  <Mini label="Объявл." value={c.ads_count} />
                  <Mini label="Фраз" value={c.keywords_count} />
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                  <div className="text-[10px] text-muted-foreground">
                    Шаг {c.step}/6 · {new Date(c.updated_at).toLocaleDateString("ru-RU")}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(c.id)} title="Открыть"
                      className="p-1.5 rounded-lg glass text-neon-cyan hover:bg-muted/30">
                      <Icon name="Pencil" size={13} />
                    </button>
                    <button onClick={() => remove(c.id)} title="Удалить"
                      className="p-1.5 rounded-lg glass text-destructive hover:bg-destructive/10">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Новая кампания</h2>
              <button onClick={() => setCreating(false)} className="p-1.5 rounded-lg hover:bg-muted/30">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Название</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Например, Поиск Москва — март"
                  className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Тип кампании</label>
                <div className="space-y-1.5">
                  {(Object.keys(CAMPAIGN_TYPE_META) as YdCampaignType[]).map((t) => {
                    const meta = CAMPAIGN_TYPE_META[t];
                    const active = newType === t;
                    return (
                      <button key={t} onClick={() => setNewType(t)}
                        className={`w-full text-left p-3 rounded-xl flex items-start gap-3 border transition-all ${active ? "" : "border-border/40 bg-muted/20 hover:border-border"}`}
                        style={active ? { borderColor: meta.color, background: `${meta.color}15` } : undefined}>
                        <Icon name={meta.icon} size={18} style={{ color: meta.color }} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">{meta.label}</div>
                          <div className="text-[11px] text-muted-foreground leading-snug">{meta.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setCreating(false)} className="px-4 py-2 rounded-xl glass text-sm">Отмена</button>
              <button onClick={create} className="px-4 py-2 rounded-xl text-sm font-bold text-background"
                style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                Создать и настроить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/20 rounded-lg p-2 text-center">
      <div className="text-base font-heading font-bold text-foreground">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  );
}