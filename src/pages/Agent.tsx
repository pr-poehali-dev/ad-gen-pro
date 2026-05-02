import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Campaign, Feed, Page } from "@/App";

interface AgentProps {
  campaigns: Campaign[];
  feeds: Feed[];
  onNavigate: (page: Page) => void;
}

const cases = [
  {
    client: "GadgetMarket",
    industry: "E-commerce · Электроника",
    color: "hsl(185,100%,55%)",
    accent: "linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))",
    challenge: "CPA вырос на 40% за квартал, нужен срочный pivot",
    solution: "AI-генерация 240 объявлений + автооптимизация ставок 24/7",
    metrics: [
      { label: "ROAS", value: "+340%", up: true },
      { label: "CPA", value: "−52%", up: true },
      { label: "Заказов", value: "12.8K", up: true },
    ],
    period: "за 3 месяца",
  },
  {
    client: "BeautyClub",
    industry: "Beauty · Подписочный сервис",
    color: "hsl(320,80%,65%)",
    accent: "linear-gradient(135deg, hsl(320,80%,65%), hsl(0,75%,60%))",
    challenge: "Высокий churn в первый месяц, низкая reactivation",
    solution: "Email-цепочки + ретаргет с динамическими креативами",
    metrics: [
      { label: "Retention 30d", value: "+78%", up: true },
      { label: "LTV", value: "₽ 8.4K", up: true },
      { label: "CR в подписку", value: "5.2%", up: true },
    ],
    period: "за 6 недель",
  },
  {
    client: "ProTools.ru",
    industry: "B2B · Промышленный инструмент",
    color: "hsl(30,100%,60%)",
    accent: "linear-gradient(135deg, hsl(30,100%,60%), hsl(15,100%,60%))",
    challenge: "Длинный цикл сделки, низкое качество лидов",
    solution: "SEO-стратегия + контекст по low-funnel запросам",
    metrics: [
      { label: "Лидов/мес", value: "+420", up: true },
      { label: "MQL→SQL", value: "62%", up: true },
      { label: "Cost per lead", value: "−38%", up: true },
    ],
    period: "за 4 месяца",
  },
];

const testimonials = [
  {
    name: "Олег К.",
    role: "Founder, GadgetMarket",
    text: "mat-ad.ru знает наши товары лучше нашего же маркетолога. ROAS вырос в 3.4 раза. Это как нанять senior-команду за цену стажёра.",
    avatar: "О",
    accent: "hsl(185,100%,55%)",
  },
  {
    name: "Мария Л.",
    role: "CMO, BeautyClub",
    text: "Раньше создание 50 креативов занимало неделю. Теперь — час. И конверсия выше: AI попадает в боли точнее редакторов.",
    avatar: "М",
    accent: "hsl(320,80%,65%)",
  },
  {
    name: "Денис В.",
    role: "Head of Growth, ProTools",
    text: "Интегрировали за 2 дня. Через месяц — поток квалифицированных лидов и прозрачная аналитика по всем каналам.",
    avatar: "Д",
    accent: "hsl(30,100%,60%)",
  },
];

const clientLogos = ["Selectel", "Ozon", "AliExpress", "X5 Group", "Yandex", "VK", "Skyeng", "Gloria Jeans"];

const expertise = [
  { icon: "MousePointerClick", title: "Контекст", desc: "Яндекс · Google", color: "hsl(185,100%,55%)" },
  { icon: "Target", title: "Таргет", desc: "VK · MyTarget · TikTok", color: "hsl(260,80%,65%)" },
  { icon: "Search", title: "SEO", desc: "ТОП-10 за 3 месяца", color: "hsl(145,70%,50%)" },
  { icon: "Mail", title: "Email", desc: "Автоворонки + CRM", color: "hsl(30,100%,60%)" },
  { icon: "Sparkles", title: "Креативы", desc: "AI + дизайнеры", color: "hsl(320,80%,65%)" },
  { icon: "LineChart", title: "Аналитика", desc: "ROMI прозрачен", color: "hsl(200,100%,55%)" },
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

export default function Agent({ campaigns, feeds, onNavigate }: AgentProps) {
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const activeCount = campaigns.filter(c => c.status === "active").length;
  const productsCount = feeds.reduce((s, f) => s + f.products, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);

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
      <section className="px-12 pt-12 pb-16 relative">
        <div className="max-w-6xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
            <span className="text-xs font-medium text-foreground">Online · 50+ клиентов · 7 лет на рынке</span>
          </div>

          <h1 className="font-heading font-bold text-foreground leading-[0.95] tracking-tight" style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)" }}>
            Digital-агентство,<br />
            <span style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              где маркетинг делает ИИ
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mt-6 max-w-2xl leading-relaxed">
            От идеи до запуска кампании — за 48 часов. Команда из 15 маркетологов и AI-агент работают 24/7,
            пока вы спите.
          </p>

          <div className="flex items-center gap-3 mt-8">
            <button onClick={() => onNavigate("services")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-background transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 10px 40px rgba(0, 220, 230, 0.3)' }}>
              <Icon name="Rocket" size={18} />
              Получить аудит бесплатно
            </button>
            <button onClick={() => onNavigate("ai")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass text-sm font-bold text-foreground hover:bg-muted/30 transition-colors">
              <Icon name="PlayCircle" size={18} />
              Демо за 2 минуты
            </button>
          </div>

          {/* Live ticker stats */}
          <div className="grid grid-cols-4 gap-4 mt-12">
            {[
              { label: "Управляемый бюджет", value: <Counter to={487} suffix=" М ₽" />, color: "hsl(185,100%,55%)" },
              { label: "Кампаний запущено", value: <Counter to={12450} />, color: "hsl(260,80%,65%)" },
              { label: "Средний рост ROAS", value: <Counter to={340} suffix="%" prefix="+" />, color: "hsl(145,70%,50%)" },
              { label: "Часов экономии/нед", value: <Counter to={28} />, color: "hsl(30,100%,60%)" },
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

      {/* CLIENTS LOGOS */}
      <section className="px-12 py-8 border-y border-border/20">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-center mb-5">
          Нам доверяют
        </div>
        <div className="flex items-center justify-center gap-x-12 gap-y-4 flex-wrap">
          {clientLogos.map((logo, i) => (
            <div key={i} className="font-heading font-bold text-muted-foreground/60 hover:text-foreground transition-colors text-lg tracking-tight">
              {logo}
            </div>
          ))}
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="px-12 py-16">
        <div className="max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
                <Icon name="Trophy" size={13} />
                Реальные результаты
              </div>
              <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
                Кейсы наших клиентов
              </h2>
            </div>
            <button onClick={() => onNavigate("services")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Все кейсы <Icon name="ArrowRight" size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {cases.map((c, i) => (
              <div key={i} className="glass glass-hover rounded-3xl p-6 grid grid-cols-12 gap-6 group">
                <div className="col-span-3 flex flex-col justify-center">
                  <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: c.color }}>
                    {c.industry}
                  </div>
                  <div className="font-heading font-bold text-foreground text-2xl mb-1">{c.client}</div>
                  <div className="text-xs text-muted-foreground">{c.period}</div>
                </div>

                <div className="col-span-5 flex flex-col justify-center space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Задача</div>
                    <div className="text-sm text-foreground/80">{c.challenge}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Решение</div>
                    <div className="text-sm text-foreground/80">{c.solution}</div>
                  </div>
                </div>

                <div className="col-span-4 grid grid-cols-3 gap-2">
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
      <section className="px-12 py-16">
        <div className="max-w-6xl">
          <div className="flex items-end justify-between mb-10">
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

          <div className="grid grid-cols-3 gap-4">
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
      <section className="px-12 py-16">
        <div className="max-w-6xl">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
              <Icon name="Quote" size={13} />
              Отзывы клиентов
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Что говорят о нас
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
      <section className="px-12 py-16">
        <div className="max-w-6xl">
          <div className="glass rounded-3xl p-8 grid grid-cols-2 gap-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[10px] font-bold uppercase tracking-widest text-neon-cyan mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-slow" />
                Live · Ваш аккаунт
              </div>
              <h3 className="font-heading font-bold text-foreground text-3xl mb-3 leading-tight">
                Текущая картина по вашим кампаниям
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Мы видим всё в реальном времени и можем подстроиться под изменения рынка за минуты, а не дни.
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
                { label: "Активных кампаний", value: activeCount, icon: "Megaphone", color: "hsl(145,70%,50%)" },
                { label: "Расход", value: `₽ ${(totalSpent / 1000).toFixed(0)}k`, icon: "Wallet", color: "hsl(30,100%,60%)" },
                { label: "Показов", value: `${(totalImpressions / 1000).toFixed(0)}k`, icon: "Eye", color: "hsl(185,100%,55%)" },
                { label: "Товаров в фидах", value: productsCount.toLocaleString("ru-RU"), icon: "Package", color: "hsl(260,80%,65%)" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-5"
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${s.color}20` }}>
                    <Icon name={s.icon} size={16} style={{ color: s.color }} />
                  </div>
                  <div className="font-heading font-bold text-foreground text-2xl">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-12 py-16">
        <div className="max-w-6xl">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
              <Icon name="Workflow" size={13} />
              Процесс
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Как мы работаем
            </h2>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { n: "01", title: "Аудит", desc: "Анализ ниши, конкурентов, ваших данных", icon: "Search" },
              { n: "02", title: "Стратегия", desc: "AI + команда строят план роста", icon: "Lightbulb" },
              { n: "03", title: "Запуск", desc: "Креативы и кампании за 48 часов", icon: "Rocket" },
              { n: "04", title: "Оптимизация", desc: "Автоматизации работают 24/7", icon: "Settings2" },
              { n: "05", title: "Рост", desc: "Прозрачные отчёты и масштабирование", icon: "TrendingUp" },
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
      <section className="px-12 py-16 pb-20">
        <div className="max-w-6xl">
          <div className="rounded-3xl p-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.12), hsl(260,80%,65%,0.12), hsl(320,80%,65%,0.12))' }}>
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 60%)' }} />

            <div className="relative grid grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                    <Icon name="Brain" size={20} className="text-background" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-neon-cyan">AdFlow Brain · 24/7</span>
                </div>
                <h3 className="font-heading font-bold text-foreground leading-tight mb-3" style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}>
                  Готовы расти быстрее?
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Бесплатный аудит за 24 часа. Покажем, где вы теряете деньги и как удвоить ROI с AI-агентом.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => onNavigate("services")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-background transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 10px 40px rgba(0, 220, 230, 0.35)' }}>
                  <Icon name="Sparkles" size={18} />
                  Получить бесплатный аудит
                </button>
                <button onClick={() => onNavigate("ai")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass text-sm font-medium text-foreground hover:bg-muted/30 transition-colors">
                  Или попробуйте AI-генератор объявлений
                  <Icon name="ArrowRight" size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 text-xs text-muted-foreground">
            <span>© 2026 AdFlow Agency · Powered by polza.ai · GPT-4o</span>
            <div className="flex gap-4">
              <span>hello@adflow.io</span>
              <span>+7 (495) 123-45-67</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}