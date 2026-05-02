import Icon from "@/components/ui/icon";
import {
  ACTION_META,
  fmtDate,
  monthNames,
  trimTime,
  weekDays,
} from "./types";
import type { ScheduleEvent } from "./types";

type View = "list" | "week" | "month";

interface Props {
  view: View;
  setView: (v: View) => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  monthDays: (Date | null)[];
  weekDates: Date[];
  events: ScheduleEvent[];
  itemsForDate: (d: Date) => ScheduleEvent[];
  today: string;
  openCreate: (date?: Date) => void;
  openEdit: (e: ScheduleEvent) => void;
  toggleDone: (e: ScheduleEvent) => void;
  remove: (id: number) => void;
}

export default function CalendarViews({
  view,
  currentDate,
  setCurrentDate,
  monthDays,
  weekDates,
  events,
  itemsForDate,
  today,
  openCreate,
  openEdit,
  toggleDone,
  remove,
}: Props) {
  return (
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
  );
}
