import Icon from "@/components/ui/icon";
import { Service, services } from "./types";

interface ServicesGridProps {
  requestedIds: Set<string>;
  onRequest: (s: Service) => void;
}

export default function ServicesGrid({ requestedIds, onRequest }: ServicesGridProps) {
  return (
    <>
      <div className="my-8 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-border/40" />
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Индивидуальные пакеты услуг
        </div>
        <div className="h-[1px] flex-1 bg-border/40" />
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(s => {
          const isRequested = requestedIds.has(s.id);
          return (
            <div key={s.id}
              className={`glass glass-hover rounded-2xl p-6 relative overflow-hidden ${s.popular ? "ring-1 ring-neon-cyan/40" : ""}`}>
              {s.popular && (
                <div className="absolute top-4 right-4 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', color: 'hsl(230,25%,5%)' }}>
                  ⭐ Хит
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                  <Icon name={s.icon} size={22} style={{ color: s.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-foreground text-lg leading-tight">{s.title}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.tagline}</div>
                </div>
              </div>

              <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{s.description}</p>

              <div className="space-y-1.5 mb-5">
                {s.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                    <Icon name="Check" size={12} style={{ color: s.color }} />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Стоимость</div>
                  <div className="font-heading font-bold text-foreground">{s.price}</div>
                </div>
                <button
                  onClick={() => onRequest(s)}
                  disabled={isRequested}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-background transition-all hover:scale-105 disabled:opacity-70"
                  style={{ background: isRequested
                    ? 'linear-gradient(135deg, hsl(145,70%,50%), hsl(165,70%,45%))'
                    : `linear-gradient(135deg, ${s.color}, ${s.color})`
                  }}>
                  <Icon name={isRequested ? "Check" : "Send"} size={13} />
                  {isRequested ? "Заявка отправлена" : "Подключить"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
