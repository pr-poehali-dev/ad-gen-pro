import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { adminApi, AdminTask } from "./adminApi";

const PRIORITY_COLORS: Record<string, string> = {
  high: "hsl(0,70%,55%)",
  normal: "hsl(185,100%,55%)",
  low: "hsl(145,70%,50%)",
};
const PRIORITY_LABELS: Record<string, string> = { high: "Срочно", normal: "Норма", low: "Не срочно" };

export default function AdminTasks() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueAt, setDueAt] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminApi.tasks().then((d) => setTasks(d.tasks)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!title.trim()) return;
    await adminApi.createTask({ title, description, priority, due_at: dueAt || undefined });
    setTitle(""); setDescription(""); setPriority("normal"); setDueAt(""); setShowForm(false);
    load();
  };

  const toggle = async (t: AdminTask) => {
    await adminApi.completeTask(t.id, !t.completed_at);
    load();
  };

  const open = tasks.filter((t) => !t.completed_at);
  const done = tasks.filter((t) => t.completed_at);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">Мои задачи</h1>
          <p className="text-sm text-muted-foreground">{open.length} активных · {done.length} завершено</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-background"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
          <Icon name={showForm ? "X" : "Plus"} size={14} /> {showForm ? "Отмена" : "Новая задача"}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать?"
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm font-semibold" autoFocus />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Подробности (необязательно)"
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm" />
          <div className="flex gap-2 flex-wrap items-center">
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)}
              className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs" />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs">
              <option value="high">Срочно</option>
              <option value="normal">Норма</option>
              <option value="low">Не срочно</option>
            </select>
            <button onClick={create} disabled={!title.trim()}
              className="ml-auto px-4 py-2 rounded-lg text-xs font-bold text-background disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
              Создать
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" /></div>
      ) : (
        <>
          {open.length > 0 && (
            <div className="space-y-2">
              {open.map((t) => (
                <TaskItem key={t.id} task={t} onToggle={() => toggle(t)} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <details className="glass rounded-2xl">
              <summary className="px-4 py-3 cursor-pointer text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Завершённые ({done.length})
              </summary>
              <div className="p-2 space-y-2">
                {done.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={() => toggle(t)} />
                ))}
              </div>
            </details>
          )}

          {tasks.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
              <Icon name="CheckSquare" size={32} className="mx-auto mb-2 text-muted-foreground/50" />
              Задач пока нет — создай первую
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: AdminTask; onToggle: () => void }) {
  const isDone = !!task.completed_at;
  const overdue = task.due_at && !isDone && new Date(task.due_at) < new Date();
  return (
    <div className={`glass rounded-xl p-3 flex items-start gap-3 ${isDone ? "opacity-50" : ""}`}>
      <button onClick={onToggle}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? "border-neon-green bg-neon-green/20" : "border-border hover:border-neon-cyan"}`}>
        {isDone && <Icon name="Check" size={12} className="text-neon-green" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</div>
        {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority] }}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.due_at && (
            <span className={`text-[10px] flex items-center gap-1 ${overdue ? "text-neon-pink" : "text-muted-foreground"}`}>
              <Icon name="Clock" size={10} /> {new Date(task.due_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              {overdue && " — просрочено"}
            </span>
          )}
          {task.related_user_name && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Icon name="User" size={10} /> {task.related_user_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
