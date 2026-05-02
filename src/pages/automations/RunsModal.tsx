import Icon from "@/components/ui/icon";
import type { AutomationRule, AutomationRun } from "./types";

interface Props {
  rule: AutomationRule;
  runs: AutomationRun[];
  loading: boolean;
  onClose: () => void;
}

export default function RunsModal({ rule, runs, loading, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg">История срабатываний</h2>
            <div className="text-xs text-muted-foreground">{rule.name}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="overflow-auto flex-1 p-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" />
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              История пока пуста. Запустите проверку правила.
            </div>
          ) : (
            <div className="space-y-1.5">
              {runs.map((r) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: r.triggered ? "hsl(0,75%,60%,0.2)" : "hsl(145,70%,50%,0.15)",
                      color: r.triggered ? "hsl(0,75%,60%)" : "hsl(145,70%,50%)",
                    }}>
                    <Icon name={r.triggered ? "Zap" : "Check"} size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {r.target_label || "—"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("ru-RU")}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.action_taken}</div>
                    <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{r.details}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
