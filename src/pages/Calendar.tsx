import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Campaign } from "@/App";
import { useToast } from "@/hooks/use-toast";

interface CalendarProps {
  campaigns: Campaign[];
}

interface ScheduleItem {
  id: number;
  campaignId: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  action: "launch" | "pause" | "report";
}

const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const weekDays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const optimalSlots = ["09:00", "12:00", "15:00", "18:00", "20:00"];

const initialSchedule: ScheduleItem[] = [
  { id: 1, campaignId: 1, date: new Date().toISOString().split("T")[0], time: "09:00", action: "launch" },
  { id: 2, campaignId: 2, date: new Date().toISOString().split("T")[0], time: "15:00", action: "launch" },
  { id: 3, campaignId: 5, date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], time: "12:00", action: "report" },
];

export default function Calendar({ campaigns }: CalendarProps) {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalCampaign, setModalCampaign] = useState<number | null>(null);
  const [modalTime, setModalTime] = useState("12:00");
  const [modalAction, setModalAction] = useState<"launch" | "pause" | "report">("launch");

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

  const fmtDate = (d: Date) => d.toISOString().split("T")[0];
  const itemsForDate = (d: Date) => schedule.filter(s => s.date === fmtDate(d));

  const openCreate = (date?: Date) => {
    setModalDate(date ? fmtDate(date) : fmtDate(new Date()));
    setModalCampaign(campaigns[0]?.id ?? null);
    setModalTime("12:00");
    setModalAction("launch");
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!modalCampaign) return;
    const newItem: ScheduleItem = {
      id: Date.now(),
      campaignId: modalCampaign,
      date: modalDate,
      time: modalTime,
      action: modalAction,
    };
    setSchedule(prev => [...prev, newItem]);
    const c = campaigns.find(x => x.id === modalCampaign);
    toast({ title: "Запланировано", description: `${c?.name} · ${modalDate} в ${modalTime}` });
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
    toast({ title: "Удалено из плана" });
  };

  const actionMeta = {
    launch: { icon: "Play", label: "Запуск", color: "hsl(145,70%,50%)" },
    pause: { icon: "Pause", label: "Пауза", color: "hsl(30,100%,60%)" },
    report: { icon: "BarChart2", label: "Отчёт", color: "hsl(185,100%,55%)" },
  };

  const monthOffset = (delta: number) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + delta);
    else if (view === "week") d.setDate(d.getDate() + delta * 7);
    else d.setDate(d.getDate() + delta);
    setCurrentDate(d);
  };

  const today = fmtDate(new Date());
  const sortedSchedule = [...schedule].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Планировщик кампаний</h1>
          <p className="text-muted-foreground text-sm mt-1">Запланируйте запуск, паузу и отчёты по датам</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105 self-start md:self-auto"
          style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
        >
          <Icon name="CalendarPlus" size={16} />
          Запланировать
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button onClick={() => monthOffset(-1)} className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 rounded-xl glass text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Сегодня
          </button>
          <button onClick={() => monthOffset(1)} className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ChevronRight" size={16} />
          </button>
          <h2 className="ml-3 font-heading font-bold text-foreground">
            {view === "month"
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : view === "week"
              ? `${weekDates[0].getDate()} ${monthNames[weekDates[0].getMonth()].slice(0,3)} – ${weekDates[6].getDate()} ${monthNames[weekDates[6].getMonth()].slice(0,3)}`
              : currentDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </h2>
        </div>
        <div className="flex glass rounded-xl p-1">
          {[
            { id: "list", label: "Список", icon: "List" },
            { id: "week", label: "Неделя", icon: "CalendarDays" },
            { id: "month", label: "Месяц", icon: "Calendar" },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id as "list" | "week" | "month")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === v.id ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
              style={view === v.id ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}
            >
              <Icon name={v.icon} size={13} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && (
        <div className="glass rounded-2xl p-2 md:p-4">
          <div className="overflow-x-auto">
          <div className="min-w-[560px]">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-muted-foreground uppercase py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="aspect-square" />;
              const items = itemsForDate(d);
              const isToday = fmtDate(d) === today;
              return (
                <button
                  key={i}
                  onClick={() => openCreate(d)}
                  className={`aspect-square rounded-lg p-1.5 text-left transition-all hover:bg-muted/30 group ${
                    isToday ? "ring-1 ring-neon-cyan/50" : "border border-border/30"
                  }`}
                >
                  <div className={`text-xs font-bold mb-1 ${isToday ? "text-neon-cyan" : "text-foreground"}`}>{d.getDate()}</div>
                  <div className="space-y-0.5">
                    {items.slice(0, 2).map(it => {
                      const c = campaigns.find(c => c.id === it.campaignId);
                      const meta = actionMeta[it.action];
                      return (
                        <div key={it.id} className="text-[9px] truncate px-1 py-0.5 rounded"
                          style={{ background: `${meta.color}20`, color: meta.color }}>
                          {it.time} {c?.name.slice(0, 12)}
                        </div>
                      );
                    })}
                    {items.length > 2 && (
                      <div className="text-[9px] text-muted-foreground">+{items.length - 2}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          </div>
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-border/50">
            {weekDates.map((d, i) => {
              const isToday = fmtDate(d) === today;
              return (
                <div key={i} className={`p-3 text-center border-r border-border/30 last:border-r-0 ${isToday ? "bg-neon-cyan/5" : ""}`}>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">{weekDays[i]}</div>
                  <div className={`text-xl font-heading font-bold mt-1 ${isToday ? "text-neon-cyan" : "text-foreground"}`}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDates.map((d, i) => {
              const items = itemsForDate(d);
              return (
                <div key={i} className="p-2 space-y-1.5 border-r border-border/30 last:border-r-0">
                  {items.map(it => {
                    const c = campaigns.find(c => c.id === it.campaignId);
                    const meta = actionMeta[it.action];
                    return (
                      <div key={it.id} className="rounded-lg p-2 text-xs group cursor-pointer"
                        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}40` }}>
                        <div className="flex items-center gap-1 mb-1">
                          <Icon name={meta.icon} size={11} style={{ color: meta.color }} />
                          <span className="font-bold" style={{ color: meta.color }}>{it.time}</span>
                          <button onClick={() => handleDelete(it.id)}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="X" size={11} className="text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                        <div className="text-foreground/80 text-[10px] leading-tight">{c?.name}</div>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => openCreate(d)}
                    className="w-full p-1.5 rounded-lg border border-dashed border-border/30 text-muted-foreground hover:border-neon-cyan/50 hover:text-neon-cyan transition-colors"
                  >
                    <Icon name="Plus" size={12} />
                  </button>
                </div>
              );
            })}
          </div>
          </div>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="glass rounded-2xl overflow-hidden">
          {sortedSchedule.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              План пуст. Нажмите «Запланировать», чтобы добавить событие.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {sortedSchedule.map(it => {
                const c = campaigns.find(c => c.id === it.campaignId);
                const meta = actionMeta[it.action];
                return (
                  <div key={it.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}20` }}>
                      <Icon name={meta.icon} size={16} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{c?.name ?? "Удалённая кампания"}</div>
                      <div className="text-xs text-muted-foreground">{meta.label} · {it.date} в {it.time}</div>
                    </div>
                    <button onClick={() => handleDelete(it.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-foreground text-lg">Запланировать действие</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Кампания</label>
                <select
                  value={modalCampaign ?? ""}
                  onChange={e => setModalCampaign(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Действие</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["launch", "pause", "report"] as const).map(a => {
                    const m = actionMeta[a];
                    return (
                      <button key={a} onClick={() => setModalAction(a)}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-medium transition-all ${
                          modalAction === a ? "text-background" : "glass text-muted-foreground hover:text-foreground"
                        }`}
                        style={modalAction === a ? { background: m.color } : {}}>
                        <Icon name={m.icon} size={13} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Дата</label>
                  <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Время</label>
                  <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50" />
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1.5">⚡ Оптимальное время</div>
                <div className="flex flex-wrap gap-1.5">
                  {optimalSlots.map(t => (
                    <button key={t} onClick={() => setModalTime(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        modalTime === t ? "text-background" : "glass text-muted-foreground hover:text-foreground"
                      }`}
                      style={modalTime === t ? { background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(290,70%,60%))' } : {}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button onClick={handleCreate} disabled={!modalCampaign}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                Запланировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}