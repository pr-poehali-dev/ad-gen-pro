import Icon from "@/components/ui/icon";
import type { YdCampaignListItem } from "../yd/types";
import { ACTION_META } from "./types";
import type { EventAction } from "./types";

interface Props {
  editingId: number | null;
  campaigns: YdCampaignListItem[];
  modalDate: string;
  setModalDate: (v: string) => void;
  modalCampaign: number | null;
  setModalCampaign: (v: number | null) => void;
  modalTime: string;
  setModalTime: (v: string) => void;
  modalAction: EventAction;
  setModalAction: (v: EventAction) => void;
  modalTitle: string;
  setModalTitle: (v: string) => void;
  modalNotes: string;
  setModalNotes: (v: string) => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onRemove: (id: number) => void;
}

export default function EventModal({
  editingId,
  campaigns,
  modalDate, setModalDate,
  modalCampaign, setModalCampaign,
  modalTime, setModalTime,
  modalAction, setModalAction,
  modalTitle, setModalTitle,
  modalNotes, setModalNotes,
  saving,
  onClose,
  onSave,
  onRemove,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">{editingId ? "Изменить событие" : "Новое событие"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Кампания</label>
            <select value={modalCampaign ?? ""} onChange={(e) => setModalCampaign(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
              <option value="">— общее событие —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name || "Без названия"}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Дата</label>
              <input type="date" value={modalDate} onChange={(e) => setModalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Время</label>
              <input type="time" value={modalTime} onChange={(e) => setModalTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Действие</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ACTION_META) as EventAction[]).map((a) => {
                const m = ACTION_META[a];
                const active = modalAction === a;
                return (
                  <button key={a} onClick={() => setModalAction(a)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                      active ? "" : "border-border/40 bg-muted/20"
                    }`}
                    style={active ? { borderColor: m.color, background: `${m.color}15`, color: m.color } : undefined}>
                    <Icon name={m.icon} size={12} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Заголовок (необязательно)
            </label>
            <input value={modalTitle} onChange={(e) => setModalTitle(e.target.value)}
              placeholder="Например: «Вторая волна Ч.Пятницы»"
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Заметки</label>
            <textarea value={modalNotes} onChange={(e) => setModalNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm resize-none" />
          </div>
        </div>

        <div className="flex justify-between gap-2 mt-5">
          {editingId ? (
            <button onClick={() => { onRemove(editingId); onClose(); }}
              className="px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 flex items-center gap-1">
              <Icon name="Trash2" size={12} /> Удалить
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl glass text-sm">Отмена</button>
            <button onClick={onSave} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-background disabled:opacity-50 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
              <Icon name={saving ? "Loader2" : "Check"} size={14} className={saving ? "animate-spin" : ""} />
              {editingId ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
