import Icon from "@/components/ui/icon";
import { Page } from "@/App";
import { cases } from "../data";

interface CasesSectionProps {
  onNavigate: (page: Page) => void;
}

export default function CasesSection({ onNavigate }: CasesSectionProps) {
  return (
    <section className="px-4 md:px-12 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
              <Icon name="Lightbulb" size={13} /> Кейсы
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Как сервисом пользуются команды
            </h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-xl">
              Сценарии и ориентиры по объёму работы внутри сервиса. Не являются гарантией результатов рекламных кампаний.
            </p>
          </div>
          <button onClick={() => onNavigate("services")}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            Все возможности <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {cases.map((c, i) => (
            <div key={i} className="glass rounded-3xl p-6 group hover:scale-[1.02] transition-transform relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-15 blur-3xl"
                style={{ background: c.color }} />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: c.color }}>
                  {c.industry}
                </div>
                <div className="font-heading font-bold text-foreground text-xl mb-4">{c.client}</div>

                <div className="space-y-3 mb-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Задача</div>
                    <div className="text-sm text-foreground/80 leading-snug">{c.challenge}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Решение</div>
                    <div className="text-sm text-foreground/80 leading-snug">{c.solution}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  {c.metrics.map((m, mi) => (
                    <div key={mi} className="rounded-xl p-2.5 text-center"
                      style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">{m.label}</div>
                      <div className="font-heading font-bold text-base" style={{ color: c.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/30">
                  <div className="text-sm text-foreground/85 italic leading-relaxed mb-2">"{c.quote}"</div>
                  <div className="text-xs text-muted-foreground font-medium">— {c.author}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
