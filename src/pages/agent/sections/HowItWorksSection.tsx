import Icon from "@/components/ui/icon";

export default function HowItWorksSection() {
  return (
    <section className="px-4 md:px-12 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-neon-cyan mb-3 uppercase tracking-widest font-bold">
            <Icon name="Workflow" size={13} /> Процесс
          </div>
          <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
            Как мы работаем
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { n: "01", title: "Подключение", desc: "Регистрация и загрузка ваших фидов", icon: "Plug" },
            { n: "02", title: "Шаблоны", desc: "Выбор подходящих шаблонов и сценариев", icon: "Lightbulb" },
            { n: "03", title: "Подготовка", desc: "ИИ помогает создать варианты объявлений", icon: "Sparkles" },
            { n: "04", title: "Проверка", desc: "Вы проверяете и редактируете материалы", icon: "Settings2" },
            { n: "05", title: "Размещение", desc: "Вы самостоятельно размещаете в системах", icon: "Rocket" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 relative">
              <div className="text-[10px] font-bold text-neon-cyan tracking-widest mb-3">{s.n}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, hsl(185,100%,55%,0.2), hsl(260,80%,65%,0.2))" }}>
                <Icon name={s.icon} size={18} className="text-neon-cyan" />
              </div>
              <div className="font-heading font-bold text-foreground text-base mb-1">{s.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
