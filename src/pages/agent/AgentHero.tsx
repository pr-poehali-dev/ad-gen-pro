import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Page } from "@/App";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";
import Counter from "./Counter";

interface AgentHeroProps {
  onNavigate: (page: Page) => void;
}

function HeroDashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(i);
  }, []);

  const areaData = [
    { name: "Пн", v: 32 + (tick % 3) * 4 },
    { name: "Вт", v: 48 + (tick % 4) * 3 },
    { name: "Ср", v: 41 + (tick % 2) * 5 },
    { name: "Чт", v: 67 + (tick % 3) * 4 },
    { name: "Пт", v: 73 + (tick % 4) * 3 },
    { name: "Сб", v: 85 + (tick % 3) * 5 },
    { name: "Вс", v: 92 + (tick % 4) * 4 },
  ];
  const barData = [
    { name: "Директ", v: 64 },
    { name: "VK", v: 48 },
    { name: "Метрика", v: 78 },
    { name: "CRM", v: 56 },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle at 30% 30%, hsl(185,100%,55%,0.5), transparent 60%), radial-gradient(circle at 70% 70%, hsl(260,80%,65%,0.5), transparent 60%)" }} />
      <div className="relative glass rounded-3xl p-4 md:p-5 border border-white/30" style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">mat-ad.ru/dashboard</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Расход", value: "1.2М ₽", color: "hsl(185,100%,55%)" },
            { label: "Заявки", value: "847", color: "hsl(260,80%,65%)" },
            { label: "ROMI", value: "248%", color: "hsl(145,70%,50%)" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-2.5 bg-background/40 border border-white/20">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</div>
              <div className="font-heading font-bold text-base mt-0.5" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3 bg-background/40 border border-white/20 mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Заявки за неделю</div>
            <div className="text-[10px] text-neon-green font-bold flex items-center gap-1"><Icon name="TrendingUp" size={10} />+34%</div>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="grad-hero" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(185,100%,55%)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="hsl(260,80%,65%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="hsl(185,100%,55%)" strokeWidth={2} fill="url(#grad-hero)" isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl p-3 bg-background/40 border border-white/20">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Источники</div>
            <div className="text-[10px] text-muted-foreground">live</div>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <Bar dataKey="v" fill="hsl(260,80%,65%)" radius={[4, 4, 0, 0]} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(220,15%,55%)" }} axisLine={false} tickLine={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -top-3 -left-4 glass rounded-2xl px-3 py-2 border border-white/30 shadow-xl hidden sm:flex items-center gap-2 animate-pulse-slow">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(145,70%,50%,0.2)" }}>
          <Icon name="CheckCircle2" size={14} style={{ color: "hsl(145,70%,50%)" }} />
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground font-bold uppercase">ИИ-генерация</div>
          <div className="text-xs font-bold text-foreground">120 объявлений</div>
        </div>
      </div>
      <div className="absolute -bottom-3 -right-4 glass rounded-2xl px-3 py-2 border border-white/30 shadow-xl hidden sm:flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(30,100%,60%,0.2)" }}>
          <Icon name="Zap" size={14} style={{ color: "hsl(30,100%,60%)" }} />
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground font-bold uppercase">Авто-правила</div>
          <div className="text-xs font-bold text-foreground">12 запущено</div>
        </div>
      </div>
    </div>
  );
}

export default function AgentHero({ onNavigate }: AgentHeroProps) {
  return (
    <>
      {/* HERO */}
      <section className="px-4 md:px-12 pt-12 md:pt-16 pb-12 md:pb-16 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-5 md:mb-6">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
              <span className="text-xs font-medium text-foreground">100+ команд уже работают с сервисом</span>
            </div>

            <h1 className="font-heading font-bold text-foreground leading-[1.05] md:leading-[0.95] tracking-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}>
              Реклама без рутины. <br />
              <span style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Решения — за вами.
              </span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground mt-5 md:mt-6 max-w-2xl leading-relaxed">
              Платформа для специалистов по рекламе: ИИ-генерация объявлений, шаблоны для Директа и VK,
              работа с фидами и автоматизация рутины. Освободите 60% времени и принимайте решения на свежей голове.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 md:mt-8">
              <button onClick={() => onNavigate("services")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-background transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))", boxShadow: "0 10px 40px rgba(0, 220, 230, 0.3)" }}>
                <Icon name="Rocket" size={18} />
                Попробовать бесплатно
              </button>
              <button onClick={() => onNavigate("ai")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl glass text-sm font-bold text-foreground hover:bg-muted/30 transition-colors">
                <Icon name="PlayCircle" size={18} />
                Посмотреть демо
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-neon-green" /> Без карты</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-neon-green" /> 14 дней доступа</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-neon-green" /> Поддержка 24/7</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* KEY METRICS */}
      <section className="px-4 md:px-12 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[
              { label: "Команд работают", value: <Counter to={100} suffix="+" />, color: "hsl(185,100%,55%)", icon: "Users" },
              { label: "Снижение CPL до", value: <Counter to={32} suffix="%" />, color: "hsl(260,80%,65%)", icon: "TrendingDown" },
              { label: "Экономия времени", value: <Counter to={60} suffix="%" />, color: "hsl(145,70%,50%)", icon: "Clock" },
              { label: "Интеграций", value: <Counter to={28} suffix="+" />, color: "hsl(30,100%,60%)", icon: "Plug" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-3xl p-5 md:p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: s.color }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}20` }}>
                  <Icon name={s.icon} size={18} style={{ color: s.color }} />
                </div>
                <div className="font-heading font-bold text-foreground" style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: s.color }}>{s.value}</div>
                <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
