import Icon from "@/components/ui/icon";
import { integrations } from "../data";

export default function IntegrationsSection() {
  return (
    <section className="px-4 md:px-12 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 text-xs text-neon-cyan mb-3 uppercase tracking-widest font-bold">
            <Icon name="Plug" size={13} /> Интеграции
          </div>
          <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
            Подключается к тому, что у вас уже есть
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            28+ готовых интеграций с рекламными системами, аналитикой, CRM и маркетплейсами. Открытое API для своих сервисов.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
          {integrations.map((int, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform group cursor-pointer aspect-square">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${int.color}20`, border: `1px solid ${int.color}40` }}>
                <Icon name={int.icon} size={18} style={{ color: int.color }} />
              </div>
              <div className="text-[10px] md:text-xs font-medium text-foreground/80 text-center leading-tight">{int.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
