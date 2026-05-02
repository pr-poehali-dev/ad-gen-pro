import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { adminApi, AdminClient, AdminOrder, AdminLead } from "./adminApi";

const STAGES = [
  { id: "new", label: "Новый", color: "hsl(200,100%,55%)" },
  { id: "active", label: "Активный", color: "hsl(145,70%,50%)" },
  { id: "vip", label: "VIP", color: "hsl(45,100%,55%)" },
  { id: "churned", label: "Ушёл", color: "hsl(0,70%,55%)" },
];

const stageLabel = (s?: string) => STAGES.find((x) => x.id === s)?.label || "—";

export default function AdminClients() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.clients({ search, stage }).then((d) => setClients(d.clients)).finally(() => setLoading(false));
  }, [search, stage]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">Клиенты</h1>
          <p className="text-sm text-muted-foreground">{clients.length} в списке</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по email, имени, телефону..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
          />
        </div>
        <button onClick={() => setStage("")} className={`px-3 py-2 rounded-xl text-xs font-semibold ${stage === "" ? "bg-neon-cyan/20 text-neon-cyan" : "glass text-muted-foreground hover:text-foreground"}`}>
          Все
        </button>
        {STAGES.map((s) => (
          <button key={s.id} onClick={() => setStage(s.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold ${stage === s.id ? "text-background" : "glass text-muted-foreground hover:text-foreground"}`}
            style={stage === s.id ? { background: s.color } : undefined}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" /></div>
      ) : clients.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          <Icon name="Users" size={32} className="mx-auto mb-2 text-muted-foreground/50" />
          Клиенты не найдены
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/40">
                <tr className="text-left">
                  <th className="px-4 py-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Клиент</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground hidden md:table-cell">Стадия</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground hidden lg:table-cell">Тариф</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground text-right">Оплат</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground text-right">Сумма</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold tracking-wider text-muted-foreground hidden md:table-cell">Регистрация</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{c.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-1 rounded-md bg-muted/40 text-foreground/80">{stageLabel(c.lifecycle_stage)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{c.plan || "free"}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{c.paid_count || 0}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-neon-green">{(c.total_spent || 0).toLocaleString("ru-RU")} ₽</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("ru-RU")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(c.id)} className="text-xs text-neon-cyan hover:underline">Открыть</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <ClientModal id={selected} onClose={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function ClientModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [data, setData] = useState<{ user: AdminClient; orders: AdminOrder[]; leads: AdminLead[] } | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [stage, setStage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.client(id).then((d) => {
      setData(d);
      setNotes(d.user.notes || "");
      setTags(d.user.tags || "");
      setStage(d.user.lifecycle_stage || "new");
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateClient({ id, notes, tags, lifecycle_stage: stage });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 md:p-7">
        {!data ? (
          <div className="flex items-center justify-center py-10"><Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" /></div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="min-w-0">
                <div className="font-heading font-bold text-xl text-foreground">{data.user.name || "Без имени"}</div>
                <div className="text-sm text-muted-foreground truncate">{data.user.email}</div>
                {data.user.phone && <div className="text-sm text-muted-foreground">{data.user.phone}</div>}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/30"><Icon name="X" size={18} /></button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
              <Stat label="Оплат" value={`${data.orders.filter(o => o.status === "paid").length}`} />
              <Stat label="Сумма" value={`${data.orders.filter(o => o.status === "paid").reduce((s, o) => s + o.amount, 0).toLocaleString("ru-RU")} ₽`} />
              <Stat label="Заявок" value={`${data.leads.length}`} />
              <Stat label="Регистрация" value={new Date(data.user.created_at).toLocaleDateString("ru-RU")} />
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Стадия жизненного цикла</label>
                <div className="flex gap-1.5 flex-wrap">
                  {STAGES.map((s) => (
                    <button key={s.id} onClick={() => setStage(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${stage === s.id ? "text-background" : "glass text-muted-foreground"}`}
                      style={stage === s.id ? { background: s.color } : undefined}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Теги (через запятую)</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Заметки менеджера</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm" />
              </div>
            </div>

            {data.orders.length > 0 && (
              <div className="mb-5">
                <h4 className="font-heading font-bold text-sm text-foreground mb-2">Платежи</h4>
                <div className="space-y-1.5">
                  {data.orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-xs glass rounded-lg p-2.5">
                      <div className="flex items-center gap-2">
                        <Icon name={o.status === "paid" ? "CheckCircle" : "Clock"} size={13} className={o.status === "paid" ? "text-neon-green" : "text-muted-foreground"} />
                        <span className="font-mono">{o.order_number}</span>
                      </div>
                      <span className="font-semibold text-foreground">{o.amount.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg glass text-sm">Отмена</button>
              <button onClick={save} disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-bold text-background"
                style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                {saving ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-2.5">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="font-bold text-foreground text-sm mt-0.5">{value}</div>
    </div>
  );
}
