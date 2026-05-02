import Icon from "@/components/ui/icon";
import { ACTION_META, trimTime } from "./types";
import type { EventAction, ScheduleEvent } from "./types";

interface Props {
  upcoming: ScheduleEvent[];
  events: ScheduleEvent[];
  openEdit: (e: ScheduleEvent) => void;
}

export default function CalendarSidebar({ upcoming, events, openEdit }: Props) {
  return (
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
  );
}
