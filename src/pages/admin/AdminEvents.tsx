import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { adminApi, AdminEvent } from "./adminApi";

const EVENT_LABELS: Record<string, string> = {
  client_updated: "Клиент обновлён",
  lead_updated: "Лид обновлён",
  task_created: "Задача создана",
};

export default function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.events().then((d) => setEvents(d.events)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">Журнал действий</h1>
        <p className="text-sm text-muted-foreground">Что происходило в админке — кто и что менял</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" /></div>
      ) : events.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          <Icon name="ScrollText" size={32} className="mx-auto mb-2 text-muted-foreground/50" />
          Действий пока не было
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-border/30">
          {events.map((e) => (
            <div key={e.id} className="p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
                <Icon name="Activity" size={14} className="text-neon-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">
                  <span className="font-semibold">{e.admin_name || e.admin_email || "Админ"}</span>
                  <span className="text-muted-foreground"> · {EVENT_LABELS[e.event_type] || e.event_type}</span>
                </div>
                {e.description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{e.description}</div>}
                <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(e.created_at).toLocaleString("ru-RU")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
