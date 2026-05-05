import Icon from "@/components/ui/icon";

export default function ServicesHero() {
  return (
    <>
      {/* Hero */}
      <div className="relative mb-8 md:mb-10 rounded-3xl overflow-hidden p-6 md:p-10 glass">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 60%)' }} />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 60%)' }} />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-neon-cyan uppercase tracking-widest font-bold mb-4">
              <Icon name="Zap" size={13} /> Тарифы и пакеты
            </div>
            <h1 className="font-heading font-bold text-foreground leading-tight mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}>
              Один сервис вместо{" "}
              <span style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                десятка инструментов
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-4">
              Подписка для специалистов и индивидуальные пакеты услуг. Размещение и финальные решения — всегда за вами.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-neon-green" /> 100+ команд</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-neon-green" /> 28+ интеграций</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-neon-green" /> Поддержка 24/7</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-neon-green" /> Без карты на старте</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Снижение CPL до", value: "32%", color: "hsl(185,100%,55%)", icon: "TrendingDown" },
                { label: "Экономия времени", value: "60%", color: "hsl(260,80%,65%)", icon: "Clock" },
                { label: "Команд", value: "100+", color: "hsl(145,70%,50%)", icon: "Users" },
                { label: "Интеграций", value: "28+", color: "hsl(30,100%,60%)", icon: "Plug" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-4 bg-background/40 border border-white/20">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${s.color}20` }}>
                    <Icon name={s.icon} size={16} style={{ color: s.color }} />
                  </div>
                  <div className="font-heading font-bold" style={{ fontSize: "1.5rem", color: s.color }}>{s.value}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/80 mt-6 pt-6 border-t border-border/30">
          * Указанные цены — ориентировочные начальные значения. Итоговая стоимость определяется индивидуально по запросу и фиксируется в договоре. Не является публичной офертой (ст. 437 ГК РФ).
        </p>
      </div>

      {/* Process timeline */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Как мы работаем</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { n: "01", label: "Аудит", icon: "Search" },
            { n: "02", label: "Стратегия", icon: "Lightbulb" },
            { n: "03", label: "Запуск", icon: "Rocket" },
            { n: "04", label: "Оптимизация", icon: "Settings2" },
            { n: "05", label: "Рост", icon: "TrendingUp" },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-background"
                    style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                    {step.n}
                  </div>
                  <Icon name={step.icon} size={13} className="text-neon-cyan" />
                </div>
                <div className="text-xs font-semibold text-foreground">{step.label}</div>
              </div>
              {i < arr.length - 1 && (
                <Icon name="ChevronRight" size={14} className="text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
