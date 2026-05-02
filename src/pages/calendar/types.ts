import func2url from "../../../backend/func2url.json";

export const SCHEDULE_URL = (func2url as Record<string, string>).schedule;

export type EventAction = "launch" | "pause" | "report" | "custom";

export interface ScheduleEvent {
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

export const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const ACTION_META: Record<EventAction, { label: string; icon: string; color: string }> = {
  launch: { label: "Запуск", icon: "Play", color: "hsl(145,70%,50%)" },
  pause: { label: "Пауза", icon: "Pause", color: "hsl(30,100%,60%)" },
  report: { label: "Отчёт", icon: "FileText", color: "hsl(185,100%,55%)" },
  custom: { label: "Другое", icon: "Circle", color: "hsl(260,80%,65%)" },
};

export const fmtDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

export const trimTime = (t: string) => (t || "12:00").slice(0, 5);
