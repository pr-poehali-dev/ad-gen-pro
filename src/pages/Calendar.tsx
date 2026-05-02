import { useState, useMemo, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import { ydApi } from "./yd/api";
import type { YdCampaignListItem } from "./yd/types";
import func2url from "../../backend/func2url.json";

const SCHEDULE_URL = (func2url as Record<string, string>).schedule;

type EventAction = "launch" | "pause" | "report" | "custom";

interface ScheduleEvent {
  id: number;
  campaign_id: number | null;
  campaign_name?: string;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM:SS
  action: EventAction;
  title: string;
  notes: string;
  done: boolean;
}

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const ACTION_META: Record<EventAction, { label: string; icon: string; color: string }> = {
  launch: { label: "Запуск", icon: "Play", color: "hsl(145,70%,50%)" },
  pause: { label: "Пауза", icon: "Pause", color: "hsl(30,100%,60%)" },
  report: { label: "Отчёт", icon: "FileText", color: "hsl(185,100%,55%)" },
  custom: { label: "Другое", icon: "Circle", color: "hsl(260,80%,65%)" },
};

const fmtDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

const trimTime = (t: string) => (t || "12:00").slice(0, 5);

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
          <div className="glass rounded-2xl p-4">
            {/* Навигация */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const d = new Date(currentDate);
                  if (view === "month") d.setMonth(d.getMonth() - 1);
                  else if (view === "week") d.setDate(d.getDate() - 7);
                  else d.setDate(d.getDate() - 1);
                  setCurrentDate(d);
                }} className="p-1.5 rounded-lg glass hover:bg-muted/30">
                  <Icon name="ChevronLeft" size={14} />
                </button>
                <div className="font-heading font-bold text-base">
                  {view === "month"
                    ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    : view === "week"
                    ? `${weekDates[0].getDate()} ${monthNames[weekDates[0].getMonth()].slice(0, 3)} — ${weekDates[6].getDate()} ${monthNames[weekDates[6].getMonth()].slice(0, 3)}`
                    : "Все события"}
                </div>
                <button onClick={() => {
                  const d = new Date(currentDate);
                  if (view === "month") d.setMonth(d.getMonth() + 1);
                  else if (view === "week") d.setDate(d.getDate() + 7);
                  else d.setDate(d.getDate() + 1);
                  setCurrentDate(d);
                }} className="p-1.5 rounded-lg glass hover:bg-muted/30">
                  <Icon name="ChevronRight" size={14} />
                </button>
              </div>
              <button onClick={() => setCurrentDate(new Date())}
                className="text-xs px-3 py-1.5 rounded-lg glass hover:bg-muted/30">
                Сегодня
              </button>
            </div>

            {/* Месяц */}
            {view === "month" && (
              <>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map((d) => (
                    <div key={d} className="text-[10px] uppercase text-center font-bold text-muted-foreground py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((d, i) => {
                    if (!d) return <div key={i} className="aspect-square" />;
                    const items = itemsForDate(d);
                    const isToday = fmtDate(d) === today;
                    return (
                      <div key={i} onClick={() => openCreate(d)}
                        className={`aspect-square p-1.5 rounded-lg cursor-pointer transition-colors border ${
                          isToday ? "border-neon-cyan/60 bg-neon-cyan/5" : "border-transparent bg-muted/10 hover:bg-muted/30 hover:border-border"
                        }`}>
                        <div className={`text-xs font-bold mb-0.5 ${isToday ? "text-neon-cyan" : "text-foreground"}`}>
                          {d.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {items.slice(0, 2).map((e) => {
                            const m = ACTION_META[e.action];
                            return (
                              <div key={e.id} onClick={(ev) => { ev.stopPropagation(); openEdit(e); }}
                                title={`${trimTime(e.event_time)} ${e.campaign_name || e.title || m.label}`}
                                className={`text-[9px] px-1 py-0.5 rounded truncate flex items-center gap-0.5 ${e.done ? "line-through opacity-50" : ""}`}
                                style={{ background: `${m.color}20`, color: m.color }}>
                                <Icon name={m.icon} size={8} />
                                <span className="truncate">{e.campaign_name || e.title || m.label}</span>
                              </div>
                            );
                          })}
                          {items.length > 2 && (
                            <div className="text-[9px] text-muted-foreground">+{items.length - 2}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Неделя */}
            {view === "week" && (
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((d, i) => {
                  const items = itemsForDate(d);
                  const isToday = fmtDate(d) === today;
                  return (
                    <div key={i} onClick={() => openCreate(d)}
                      className={`min-h-[200px] p-2 rounded-xl cursor-pointer border ${
                        isToday ? "border-neon-cyan/60 bg-neon-cyan/5" : "border-border/40 bg-muted/10 hover:bg-muted/20"
                      }`}>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">{weekDays[i]}</div>
                      <div className={`text-base font-bold mb-2 ${isToday ? "text-neon-cyan" : "text-foreground"}`}>
                        {d.getDate()}
                      </div>
                      <div className="space-y-1">
                        {items.map((e) => {
                          const m = ACTION_META[e.action];
                          return (
                            <div key={e.id} onClick={(ev) => { ev.stopPropagation(); openEdit(e); }}
                              className={`text-[10px] p-1.5 rounded ${e.done ? "line-through opacity-50" : ""}`}
                              style={{ background: `${m.color}15`, borderLeft: `2px solid ${m.color}` }}>
                              <div className="font-bold flex items-center gap-1" style={{ color: m.color }}>
                                <Icon name={m.icon} size={9} /> {trimTime(e.event_time)}
                              </div>
                              <div className="text-foreground truncate mt-0.5">{e.campaign_name || e.title || m.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Список */}
            {view === "list" && (
              <div className="space-y-2">
                {events.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-10">
                    Событий нет. Нажмите «Событие», чтобы добавить.
                  </div>
                ) : events.map((e) => {
                  const m = ACTION_META[e.action];
                  return (
                    <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/10 ${e.done ? "opacity-50" : ""}`}>
                      <button onClick={() => toggleDone(e)} className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${e.done ? "border-neon-green bg-neon-green" : "border-muted-foreground"}`}>
                          {e.done && <Icon name="Check" size={11} className="text-background" />}
                        </div>
                      </button>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${m.color}20`, border: `1px solid ${m.color}40` }}>
                        <Icon name={m.icon} size={14} style={{ color: m.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${e.done ? "line-through" : ""}`}>
                          {e.campaign_name || e.title || m.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(e.event_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })} · {trimTime(e.event_time)} · {m.label}
                        </div>
                      </div>
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg glass hover:bg-muted/30">
                        <Icon name="Pencil" size={12} />
                      </button>
                      <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Боковая панель: ближайшие события */}
          <div className="space-y-3">
            <div className="glass rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Ближайшие события
              </div>
              {upcoming.length === 0 ? (
                <div className="text-xs text-muted-foreground py-4 text-center">Запланировано пока ничего нет</div>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((e) => {
                    const m = ACTION_META[e.action];
                    return (
                      <button key={e.id} onClick={() => openEdit(e)}
                        className="w-full text-left p-2 rounded-lg bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name={m.icon} size={11} style={{ color: m.color }} />
                          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: m.color }}>
                            {m.label}
                          </span>
                        </div>
                        <div className="text-xs font-semibold truncate">
                          {e.campaign_name || e.title || "Без названия"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(e.event_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })} в {trimTime(e.event_time)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Всего событий
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {(Object.keys(ACTION_META) as EventAction[]).map((a) => {
                  const cnt = events.filter((e) => e.action === a).length;
                  const m = ACTION_META[a];
                  return (
                    <div key={a} className="bg-muted/20 rounded-lg p-2">
                      <div className="text-base font-heading font-bold" style={{ color: m.color }}>{cnt}</div>
                      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">{editingId ? "Изменить событие" : "Новое событие"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted/30">
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
                <button onClick={() => { remove(editingId); setShowModal(false); }}
                  className="px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 flex items-center gap-1">
                  <Icon name="Trash2" size={12} /> Удалить
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl glass text-sm">Отмена</button>
                <button onClick={save} disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-background disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                  <Icon name={saving ? "Loader2" : "Check"} size={14} className={saving ? "animate-spin" : ""} />
                  {editingId ? "Сохранить" : "Добавить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
