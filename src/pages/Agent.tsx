import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Page } from "@/App";

interface AgentProps {
  onNavigate: (page: Page) => void;
}

const cases = [
  {
    client: "Магазин электроники",
    industry: "E-commerce · Пример использования",
    color: "hsl(185,100%,55%)",
    accent: "linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))",
    challenge: "Рутина при создании большого числа объявлений и ручная корректировка ставок",
    solution: "Сервис помог сгенерировать варианты текстов и подготовить структуру кампаний",
    metrics: [
      { label: "Вариантов текстов", value: "240", up: true },
      { label: "Время подготовки", value: "−70%", up: true },
      { label: "Каналов", value: "3", up: true },
    ],
    period: "пример использования сервиса",
  },
  {
    client: "Подписочный сервис",
    industry: "Beauty · Пример использования",
    color: "hsl(320,80%,65%)",
    accent: "linear-gradient(135deg, hsl(320,80%,65%), hsl(0,75%,60%))",
    challenge: "Долгая ручная подготовка email-цепочек и креативов для ретаргета",
    solution: "Подготовка контента, шаблонов и сегментов в одном интерфейсе",
    metrics: [
      { label: "Шаблонов писем", value: "12", up: true },
      { label: "Сегментов", value: "8", up: true },
      { label: "Время на запуск", value: "−60%", up: true },
    ],
    period: "пример использования сервиса",
  },
  {
    client: "Производитель инструмента",
    industry: "B2B · Пример использования",
    color: "hsl(30,100%,60%)",
    accent: "linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))",
    challenge: "Сложно одновременно вести SEO-задачи и контекст по low-funnel запросам",
    solution: "Сервис помогает структурировать задачи, шаблоны и фиды в одном месте",
    metrics: [
      { label: "Шаблонов задач", value: "30+", up: true },
      { label: "Фидов в работе", value: "5", up: true },
      { label: "Каналов", value: "4", up: true },
    ],
    period: "пример использования сервиса",
  },
];

const testimonials = [
  {
    name: "Маркетолог",
    role: "Интернет-магазин",
    text: "Сервис помогает быстрее готовить варианты объявлений — экономит время на рутине.",
    avatar: "М",
    accent: "hsl(185,100%,55%)",
  },
  {
    name: "Специалист по рекламе",
    role: "Агентство",
    text: "Раньше подготовка большой партии креативов занимала несколько дней — теперь намного быстрее.",
    avatar: "С",
    accent: "hsl(320,80%,65%)",
  },
  {
    name: "Менеджер проекта",
    role: "B2B-компания",
    text: "Удобно держать фиды, шаблоны и задачи в одном интерфейсе. Решение о запуске мы принимаем сами.",
    avatar: "П",
    accent: "hsl(30,100%,60%)",
  },
];

const expertise = [
  { icon: "MousePointerClick", title: "Контекст", desc: "Подготовка для Яндекс · Google", color: "hsl(185,100%,55%)" },
  { icon: "Target", title: "Таргет", desc: "Шаблоны для VK · MyTarget", color: "hsl(260,80%,65%)" },
  { icon: "Search", title: "SEO", desc: "Помощь в структуре контента", color: "hsl(145,70%,50%)" },
  { icon: "Mail", title: "Email", desc: "Шаблоны автоворонок", color: "hsl(30,100%,60%)" },
  { icon: "Sparkles", title: "Креативы", desc: "ИИ-генерация вариантов", color: "hsl(320,80%,65%)" },
  { icon: "LineChart", title: "Аналитика", desc: "Сводка по вашим данным", color: "hsl(200,100%,55%)" },
];

const useCounter = (target: number, duration = 1500) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p === 1) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [target, duration]);
  return v;
};

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const v = useCounter(to);
  return <>{prefix}{v.toLocaleString("ru-RU")}{suffix}</>;
}

export default function Agent({ onNavigate }: AgentProps) {

  return (
    <div className="relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full opacity-[0.25] animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
        <div className="absolute bottom-[-5%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.22] animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 70%)', animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full opacity-[0.18]"
          style={{ background: 'radial-gradient(circle, hsl(320,80%,65%), transparent 70%)' }} />
      </div>

      {/* HERO */}
      <section className="px-4 md:px-12 pt-16 md:pt-12 pb-12 md:pb-16 relative">
        <div className="max-w-6xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-5 md:mb-6">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
            <span className="text-xs font-medium text-foreground">Сервис для специалистов по рекламе</span>
          </div>

          <h1 className="font-heading font-bold text-foreground leading-[1.05] md:leading-[0.95] tracking-tight" style={{ fontSize: "clamp(2rem, 5.5vw, 5rem)" }}>
            Сервис, который<br />
            <span style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              помогает настраивать рекламу
            </span>
          </h1>

          <p className="text-base md:text-xl text-muted-foreground mt-5 md:mt-6 max-w-2xl leading-relaxed">
            ИИ-генерация вариантов объявлений, шаблоны, работа с фидами и автоматизация рутины.
            Сервис помогает специалисту, но не размещает рекламу самостоятельно — все решения принимает пользователь.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 md:mt-8">
            <button onClick={() => onNavigate("services")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-background transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 10px 40px rgba(0, 220, 230, 0.3)' }}>
              <Icon name="Rocket" size={18} />
              Посмотреть тарифы
            </button>
            <button onClick={() => onNavigate("ai")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl glass text-sm font-bold text-foreground hover:bg-muted/30 transition-colors">
              <Icon name="PlayCircle" size={18} />
              Попробовать ИИ-генератор
            </button>
          </div>

          {/* Live ticker stats — характеристики сервиса (не результаты рекламы) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12">
            {[
              { label: "Шаблонов объявлений", value: <Counter to={120} suffix="+" />, color: "hsl(185,100%,55%)" },
              { label: "Поддерживаемых форматов", value: <Counter to={9} />, color: "hsl(260,80%,65%)" },
              { label: "Языков ИИ-генерации", value: <Counter to={12} />, color: "hsl(145,70%,50%)" },
              { label: "Размер фида, до", value: <Counter to={50} suffix=" МБ" />, color: "hsl(30,100%,60%)" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: s.color, opacity: 0.6 }} />
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">{s.label}</div>
                <div className="font-heading font-bold text-foreground" style={{ fontSize: "1.6rem" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative AI orb */}
        <div className="absolute top-12 right-12 hidden xl:block">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), hsl(260,80%,65%))' }} />
            <div className="absolute inset-4 rounded-full flex items-center justify-center"
              style={{
                background: 'conic-gradient(from 0deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%), hsl(185,100%,55%))',
                animation: 'spin 12s linear infinite',
              }}>
              <div className="w-[90%] h-[90%] rounded-full flex items-center justify-center"
                style={{ background: 'hsl(0, 0%, 100%)' }}>
                <Icon name="Brain" size={64} style={{ color: 'hsl(185, 90%, 42%)' }} />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', color: 'hsl(230,25%,5%)' }}>
              AI Brain
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 md:mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
                <Icon name="Lightbulb" size={13} />
                Примеры использования
              </div>
              <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                Как сервисом пользуются специалисты
              </h2>
              <p className="text-xs text-muted-foreground mt-2 max-w-xl">
                Гипотетические сценарии. Цифры приведены как ориентир по объёму работы внутри сервиса и не являются гарантией результатов рекламных кампаний.
              </p>
            </div>
            <button onClick={() => onNavigate("services")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Все возможности <Icon name="ArrowRight" size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {cases.map((c, i) => (
              <div key={i} className="glass glass-hover rounded-3xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 group">
                <div className="md:col-span-3 flex flex-col justify-center">
                  <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: c.color }}>
                    {c.industry}
                  </div>
                  <div className="font-heading font-bold text-foreground text-2xl mb-1">{c.client}</div>
                  <div className="text-xs text-muted-foreground">{c.period}</div>
                </div>

                <div className="md:col-span-5 flex flex-col justify-center space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Задача</div>
                    <div className="text-sm text-foreground/80">{c.challenge}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Решение</div>
                    <div className="text-sm text-foreground/80">{c.solution}</div>
                  </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-3 gap-2">
                  {c.metrics.map((m, mi) => (
                    <div key={mi} className="rounded-2xl p-3 text-center"
                      style={{ background: `${c.color}15`, border: `1px solid ${c.color}40` }}>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{m.label}</div>
                      <div className="font-heading font-bold text-lg" style={{ color: c.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE GRID */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 md:mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
                <Icon name="Layers" size={13} />
                Полный цикл маркетинга
              </div>
              <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                Все каналы под одной крышей
              </h2>
            </div>
            <button onClick={() => onNavigate("services")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Подробно об услугах <Icon name="ArrowRight" size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {expertise.map((s, i) => (
              <button key={i} onClick={() => onNavigate("services")}
                className="glass glass-hover rounded-2xl p-6 text-left group transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                  <Icon name={s.icon} size={22} style={{ color: s.color }} />
                </div>
                <div className="font-heading font-bold text-foreground text-lg mb-1">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: s.color }}>
                  Подключить <Icon name="ArrowRight" size={11} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-6xl">
          <div className="mb-8 md:mb-10">
            <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
              <Icon name="Quote" size={13} />
              Отзывы клиентов
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Что говорят о нас
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-6 relative">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Icon key={si} name="Star" size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-background"
                    style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}cc)` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YOUR DATA SECTION */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-6xl">
          <div className="glass rounded-3xl p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[10px] font-bold uppercase tracking-widest text-neon-cyan mb-4">
                <Icon name="LayoutDashboard" size={11} />
                Ваш кабинет
              </div>
              <h3 className="font-heading font-bold text-foreground text-2xl md:text-3xl mb-3 leading-tight">
                Все ваши данные в одном месте
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Дашборд собирает кампании, группы, объявления, фразы, фиды, расписание и автоматизации в один экран —
                чтобы можно было быстро принимать решения.
              </p>
              <button onClick={() => onNavigate("dashboard")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-background transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                <Icon name="LayoutDashboard" size={16} />
                Открыть дашборд
              </button>
            </div>

            <div className="relative grid grid-cols-2 gap-3">
              {[
                { label: "Кампании", desc: "Эксперт-режим как в ЯД", icon: "Megaphone", color: "hsl(145,70%,50%)" },
                { label: "Бюджеты", desc: "Дневные и недельные", icon: "Wallet", color: "hsl(30,100%,60%)" },
                { label: "Автоматизации", desc: "Правила управления", icon: "Bot", color: "hsl(185,100%,55%)" },
                { label: "Фиды", desc: "YML и CSV каталоги", icon: "Package", color: "hsl(260,80%,65%)" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-5"
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${s.color}20` }}>
                    <Icon name={s.icon} size={16} style={{ color: s.color }} />
                  </div>
                  <div className="font-heading font-bold text-foreground text-base">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-6xl">
          <div className="mb-8 md:mb-10">
            <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
              <Icon name="Workflow" size={13} />
              Процесс
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Как мы работаем
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { n: "01", title: "Подключение", desc: "Регистрация и загрузка ваших фидов", icon: "Search" },
              { n: "02", title: "Шаблоны", desc: "Выбор подходящих шаблонов и сценариев", icon: "Lightbulb" },
              { n: "03", title: "Подготовка", desc: "ИИ помогает создать варианты объявлений", icon: "Rocket" },
              { n: "04", title: "Проверка", desc: "Вы проверяете и редактируете материалы", icon: "Settings2" },
              { n: "05", title: "Размещение", desc: "Вы самостоятельно размещаете в рекламных системах", icon: "TrendingUp" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-5 relative">
                <div className="text-[10px] font-bold text-neon-cyan tracking-widest mb-3">{s.n}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.2), hsl(260,80%,65%,0.2))' }}>
                  <Icon name={s.icon} size={18} className="text-neon-cyan" />
                </div>
                <div className="font-heading font-bold text-foreground text-base mb-1">{s.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="px-4 md:px-12 py-12 md:py-16 pb-16 md:pb-20">
        <div className="max-w-6xl">
          <div className="rounded-3xl p-6 md:p-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.12), hsl(260,80%,65%,0.12), hsl(320,80%,65%,0.12))' }}>
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 60%)' }} />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                    <Icon name="Brain" size={20} className="text-background" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-neon-cyan">mat-ad.ru AI · 24/7</span>
                </div>
                <h3 className="font-heading font-bold text-foreground leading-tight mb-3" style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}>
                  Хотите попробовать?
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Зарегистрируйтесь и оцените возможности сервиса для подготовки рекламных материалов. Сервис не размещает рекламу самостоятельно — итоговые решения принимает пользователь.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => onNavigate("services")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-background transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 10px 40px rgba(0, 220, 230, 0.35)' }}>
                  <Icon name="Sparkles" size={18} />
                  Посмотреть тарифы
                </button>
                <button onClick={() => onNavigate("ai")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass text-sm font-medium text-foreground hover:bg-muted/30 transition-colors">
                  Или попробуйте ИИ-генератор объявлений
                  <Icon name="ArrowRight" size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-10 p-4 md:p-5 rounded-2xl border border-border/40 bg-muted/20 text-[11px] md:text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground/80">Важно.</strong> Сервис mat-ad.ru является программным инструментом, который помогает специалистам готовить рекламные материалы и автоматизировать рутинные задачи.
            Сервис не оказывает рекламные услуги конечным пользователям, не размещает рекламу самостоятельно и не гарантирует достижения каких-либо коммерческих результатов рекламных кампаний (рост продаж, ROAS, CTR, позиции в поисковой выдаче и т.п.).
            Все приведённые на сайте показатели и описания — справочные. Ответственность за соответствие размещаемой рекламы Федеральному закону «О рекламе» № 38-ФЗ, требованиям маркировки рекламы и иным нормативным актам РФ несёт рекламодатель.
            Используя сервис, вы соглашаетесь с пользовательским соглашением и политикой обработки персональных данных.
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-6 md:mt-8 text-xs text-muted-foreground text-center md:text-left">
            <span>© {new Date().getFullYear()} ООО «МАТ-Лабс» · mat-ad.ru</span>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-4">
              <span>ИНН / ОГРН: указаны в реквизитах</span>
              <span>hello@mat-ad.ru</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}