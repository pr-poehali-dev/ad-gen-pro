import { useState, useMemo, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import { ydApi } from "./yd/api";
import type { YdCampaignListItem } from "./yd/types";
import {
  SCHEDULE_URL,
  fmtDate,
  trimTime,
} from "./calendar/types";
import type { EventAction, ScheduleEvent } from "./calendar/types";
import CalendarViews from "./calendar/CalendarViews";
import CalendarSidebar from "./calendar/CalendarSidebar";
import EventModal from "./calendar/EventModal";

export default function Calendar() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<YdCampaignListItem[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalDate, setModalDate] = useState("");
  const [modalCampaign, setModalCampaign] = useState<number | null>(null);
  const [modalTime, setModalTime] = useState("12:00");
  const [modalAction, setModalAction] = useState<EventAction>("launch");
  const [modalTitle, setModalTitle] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [campRes, evRes] = await Promise.all([
        ydApi.list(),
        fetch(`${SCHEDULE_URL}?action=list`, { headers: authHeaders() }).then((r) => r.json()),
      ]);
      setCampaigns(campRes.campaigns || []);
      if (evRes.error) throw new Error(evRes.error);
      setEvents(evRes.events || []);
    } catch (e) {
      toast({ title: "Не удалось загрузить", description: String(e) });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startOffset = (first.getDay() + 6) % 7;
    const days: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentDate]);

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    const dow = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const itemsForDate = (d: Date) => events.filter((e) => e.event_date === fmtDate(d));

  const openCreate = (date?: Date) => {
    setEditingId(null);
    setModalDate(date ? fmtDate(date) : fmtDate(new Date()));
    setModalCampaign(campaigns[0]?.id ?? null);
    setModalTime("12:00");
    setModalAction("launch");
    setModalTitle("");
    setModalNotes("");
    setShowModal(true);
  };

  const openEdit = (e: ScheduleEvent) => {
    setEditingId(e.id);
    setModalDate(e.event_date);
    setModalCampaign(e.campaign_id);
    setModalTime(trimTime(e.event_time));
    setModalAction(e.action);
    setModalTitle(e.title || "");
    setModalNotes(e.notes || "");
    setShowModal(true);
  };

  const save = async () => {
    if (!modalDate) {
      toast({ title: "Укажите дату" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: editingId || undefined,
        campaign_id: modalCampaign,
        event_date: modalDate,
        event_time: modalTime + ":00",
        action: modalAction,
        title: modalTitle,
        notes: modalNotes,
      };
      const url = `${SCHEDULE_URL}?action=${editingId ? "update" : "create"}`;
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({ title: editingId ? "Событие обновлено" : "Событие добавлено" });
      setShowModal(false);
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить событие?")) return;
    try {
      const res = await fetch(`${SCHEDULE_URL}?action=delete`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      setEvents(events.filter((e) => e.id !== id));
      toast({ title: "Удалено" });
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    }
  };

  const toggleDone = async (e: ScheduleEvent) => {
    try {
      const res = await fetch(`${SCHEDULE_URL}?action=update`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id: e.id, done: !e.done }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      setEvents(events.map((x) => (x.id === e.id ? { ...x, done: !x.done } : x)));
    } catch (err) {
      toast({ title: "Ошибка", description: String(err) });
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Расписание сохраняется в личном кабинете</div>
        </div>
      </div>
    );
  }

  const today = fmtDate(new Date());
  const upcoming = [...events]
    .filter((e) => e.event_date >= today && !e.done)
    .sort((a, b) => (a.event_date + a.event_time).localeCompare(b.event_date + b.event_time))
    .slice(0, 8);

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Календарь кампаний</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Запланируйте запуск, паузу или отчёт по любой кампании
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-muted/30 rounded-xl p-1">
            {(["month", "week", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  view === v ? "bg-background shadow text-foreground" : "text-muted-foreground"
                }`}>
                {v === "month" ? "Месяц" : v === "week" ? "Неделя" : "Список"}
              </button>
            ))}
          </div>
          <button onClick={() => openCreate()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Plus" size={14} /> Событие
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <CalendarViews
            view={view}
            setView={setView}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            monthDays={monthDays}
            weekDates={weekDates}
            events={events}
            itemsForDate={itemsForDate}
            today={today}
            openCreate={openCreate}
            openEdit={openEdit}
            toggleDone={toggleDone}
            remove={remove}
          />

          <CalendarSidebar
            upcoming={upcoming}
            events={events}
            openEdit={openEdit}
          />
        </div>
      )}

      {showModal && (
        <EventModal
          editingId={editingId}
          campaigns={campaigns}
          modalDate={modalDate} setModalDate={setModalDate}
          modalCampaign={modalCampaign} setModalCampaign={setModalCampaign}
          modalTime={modalTime} setModalTime={setModalTime}
          modalAction={modalAction} setModalAction={setModalAction}
          modalTitle={modalTitle} setModalTitle={setModalTitle}
          modalNotes={modalNotes} setModalNotes={setModalNotes}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={save}
          onRemove={remove}
        />
      )}
    </div>
  );
}
