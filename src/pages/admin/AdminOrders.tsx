import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { adminApi, AdminOrder } from "./adminApi";

const STATUS_COLORS: Record<string, string> = {
  paid: "hsl(145,70%,50%)",
  pending: "hsl(45,100%,55%)",
  canceled: "hsl(0,70%,55%)",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Оплачен",
  pending: "Ожидает",
  canceled: "Отменён",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.orders({ status, search }).then((d) => setOrders(d.orders)).finally(() => setLoading(false));
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const exportCsv = () => {
    const rows = [
      ["№ заказа", "Email", "Имя", "Сумма", "Статус", "Создан", "Оплачен"],
      ...orders.map((o) => [
        o.order_number,
        o.user_email,
        o.user_name || "",
        String(o.amount),
        STATUS_LABELS[o.status] || o.status,
        new Date(o.created_at).toLocaleString("ru-RU"),
        o.paid_at ? new Date(o.paid_at).toLocaleString("ru-RU") : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">Платежи</h1>
          <p className="text-sm text-muted-foreground">Сумма оплаченных в фильтре: <span className="text-neon-green font-bold">{total.toLocaleString("ru-RU")} ₽</span></p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm font-semibold hover:bg-muted/30">
          <Icon name="Download" size={14} /> Экспорт CSV
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Email или номер заказа..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm" />
        </div>
        <button onClick={() => setStatus("")} className={`px-3 py-2 rounded-xl text-xs font-semibold ${status === "" ? "bg-neon-cyan/20 text-neon-cyan" : "glass text-muted-foreground"}`}>Все</button>
        {Object.keys(STATUS_LABELS).map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold ${status === s ? "text-background" : "glass text-muted-foreground"}`}
            style={status === s ? { background: STATUS_COLORS[s] } : undefined}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" /></div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          <Icon name="CreditCard" size={32} className="mx-auto mb-2 text-muted-foreground/50" />
          Платежей пока нет
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/40">
                <tr className="text-left">
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-muted-foreground">№ заказа</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-muted-foreground">Клиент</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-muted-foreground text-right">Сумма</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-muted-foreground">Статус</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-muted-foreground hidden md:table-cell">Создан</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-foreground">{o.user_name || "—"}</div>
                      <div className="text-[11px] text-muted-foreground">{o.user_email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">{o.amount.toLocaleString("ru-RU")} ₽</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] px-2 py-1 rounded-md font-semibold" style={{ background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ru-RU")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
