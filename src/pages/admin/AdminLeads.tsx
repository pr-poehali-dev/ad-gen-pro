import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { adminApi, AdminLead } from "./adminApi";

const PIPELINE = [
  { id: "new", label: "Новый", color: "hsl(200,100%,55%)", icon: "Inbox" },
  { id: "contacted", label: "Связались", color: "hsl(45,100%,55%)", icon: "Phone" },
  { id: "qualified", label: "Квалифицирован", color: "hsl(260,80%,65%)", icon: "Target" },
  { id: "proposal", label: "Счёт выставлен", color: "hsl(185,100%,55%)", icon: "FileText" },
  { id: "won", label: "Выиграно", color: "hsl(145,70%,50%)", icon: "Trophy" },
  { id: "lost", label: "Отказ", color: "hsl(0,70%,55%)", icon: "X" },
];

export default function AdminLeads() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<AdminLead | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.leads().then((d) => setLeads(d.leads)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const moveLead = async (lead: AdminLead, newStage: string) => {
    await adminApi.updateLead({ id: lead.id, pipeline_stage: newStage });
    setLeads(leads.map((l) => (l.id === lead.id ? { ...l, pipeline_stage: newStage } : l)));
  };

  const grouped: Record<string, AdminLead[]> = {};
  PIPELINE.forEach((p) => (grouped[p.id] = []));
  leads.forEach((l) => {
    const stage = l.pipeline_stage || "new";
    if (!grouped[stage]) grouped[stage] = [];
    grouped[stage].push(l);
  });

  const totalAmount = (stage: string) => grouped[stage].reduce((s, l) => s + (l.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">CRM воронка</h1>
        <p className="text-sm text-muted-foreground">{leads.length} лидов в работе</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-3 min-h-[400px]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <Icon name={p.icon} size={13} style={{ color: p.color }} />
                  <span className="font-bold text-xs text-foreground">{p.label}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40 font-bold">{grouped[p.id].length}</span>
              </div>
              {totalAmount(p.id) > 0 && (
                <div className="text-[10px] text-neon-green font-bold mb-2">
                  {totalAmount(p.id).toLocaleString("ru-RU")} ₽
                </div>
              )}
              <div className="space-y-2">
                {grouped[p.id].map((l) => (
                  <div key={l.id} onClick={() => setActive(l)}
                    className="bg-muted/20 hover:bg-muted/40 cursor-pointer rounded-lg p-2.5 border border-border/30 transition-colors">
                    <div className="font-semibold text-xs text-foreground truncate">{l.name}</div>
                    {l.service && <div className="text-[10px] text-muted-foreground truncate mt-0.5">{l.service}</div>}
                    {(l.utm_source || l.yclid || l.gclid) && (
                      <div className="text-[9px] text-neon-cyan font-mono truncate mt-0.5 flex items-center gap-0.5">
                        <Icon name="Megaphone" size={9} />
                        {l.utm_source || (l.yclid ? "yandex" : l.gclid ? "google" : "")}
                        {l.utm_campaign && ` / ${l.utm_campaign}`}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleDateString("ru-RU")}</span>
                      {l.amount ? <span className="text-[10px] font-bold text-neon-green">{l.amount.toLocaleString("ru-RU")} ₽</span> : null}
                    </div>
                  </div>
                ))}
                {grouped[p.id].length === 0 && (
                  <div className="text-[11px] text-muted-foreground text-center py-4 opacity-50">пусто</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && <LeadModal lead={active} onClose={() => setActive(null)} onMove={(stage) => { moveLead(active, stage); setActive(null); }} onSave={load} />}
    </div>
  );
}

function LeadModal({ lead, onClose, onMove, onSave }: { lead: AdminLead; onClose: () => void; onMove: (stage: string) => void; onSave: () => void }) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [amount, setAmount] = useState(String(lead.amount || ""));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateLead({ id: lead.id, notes, amount: parseFloat(amount) || 0 });
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-lg p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="font-heading font-bold text-lg text-foreground">{lead.name}</div>
            <div className="text-xs text-muted-foreground">{lead.email} {lead.phone && `· ${lead.phone}`}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30"><Icon name="X" size={18} /></button>
        </div>

        {lead.service && (
          <div className="mb-3">
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-0.5">Услуга</div>
            <div className="text-sm font-semibold text-foreground">{lead.service}</div>
          </div>
        )}
        {lead.comment && (
          <div className="mb-3">
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-0.5">Комментарий клиента</div>
            <div className="text-sm text-foreground">{lead.comment}</div>
          </div>
        )}

        {(lead.utm_source || lead.utm_campaign || lead.utm_term || lead.yclid || lead.gclid || lead.referrer) && (
          <div className="mb-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
            <div className="text-[10px] uppercase text-neon-cyan tracking-wider mb-1.5 flex items-center gap-1">
              <Icon name="Megaphone" size={11} /> Источник трафика
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              {lead.utm_source && <div><span className="text-muted-foreground">source:</span> <span className="text-foreground font-mono">{lead.utm_source}</span></div>}
              {lead.utm_medium && <div><span className="text-muted-foreground">medium:</span> <span className="text-foreground font-mono">{lead.utm_medium}</span></div>}
              {lead.utm_campaign && <div className="col-span-2"><span className="text-muted-foreground">кампания:</span> <span className="text-foreground font-mono">{lead.utm_campaign}</span></div>}
              {lead.utm_term && <div className="col-span-2"><span className="text-muted-foreground">фраза:</span> <span className="text-foreground font-mono">{lead.utm_term}</span></div>}
              {lead.utm_content && <div className="col-span-2"><span className="text-muted-foreground">объявление:</span> <span className="text-foreground font-mono">{lead.utm_content}</span></div>}
              {lead.yclid && <div className="col-span-2"><span className="text-muted-foreground">yclid:</span> <span className="text-foreground font-mono truncate">{lead.yclid}</span></div>}
              {lead.gclid && <div className="col-span-2"><span className="text-muted-foreground">gclid:</span> <span className="text-foreground font-mono truncate">{lead.gclid}</span></div>}
              {lead.referrer && <div className="col-span-2"><span className="text-muted-foreground">referrer:</span> <span className="text-foreground font-mono truncate">{lead.referrer}</span></div>}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Сумма сделки (₽)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number"
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm" />
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Заметки</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm" />
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Передвинуть в:</div>
          <div className="grid grid-cols-3 gap-1.5">
            {PIPELINE.map((p) => (
              <button key={p.id} onClick={() => onMove(p.id)}
                className={`px-2 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 ${lead.pipeline_stage === p.id ? "text-background" : "glass text-foreground hover:bg-muted/40"}`}
                style={lead.pipeline_stage === p.id ? { background: p.color } : undefined}>
                <Icon name={p.icon} size={11} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg glass text-sm">Отмена</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-bold text-background"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}