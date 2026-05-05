import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Page } from "@/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AgentProps {
  onNavigate: (page: Page) => void;
}

const heroImage = "https://cdn.poehali.dev/projects/2fe697dc-410b-4779-b502-87140077fedf/files/2ecce010-34af-497b-aed5-8884101224bb.jpg";

const integrations = [
  { name: "Яндекс Директ", icon: "MousePointerClick", color: "hsl(50,100%,55%)" },
  { name: "VK Реклама", icon: "Users", color: "hsl(210,80%,55%)" },
  { name: "MyTarget", icon: "Target", color: "hsl(15,90%,60%)" },
  { name: "Telegram Ads", icon: "Send", color: "hsl(200,90%,55%)" },
  { name: "Яндекс Метрика", icon: "BarChart3", color: "hsl(0,80%,60%)" },
  { name: "Google Analytics", icon: "LineChart", color: "hsl(30,100%,55%)" },
  { name: "AmoCRM", icon: "Database", color: "hsl(190,80%,50%)" },
  { name: "Bitrix24", icon: "Building2", color: "hsl(195,90%,50%)" },
  { name: "Google Sheets", icon: "Table", color: "hsl(145,70%,50%)" },
  { name: "1С", icon: "FileSpreadsheet", color: "hsl(50,100%,50%)" },
  { name: "Mailchimp", icon: "Mail", color: "hsl(45,100%,55%)" },
  { name: "Wildberries", icon: "ShoppingBag", color: "hsl(320,80%,60%)" },
  { name: "Ozon", icon: "Package", color: "hsl(220,90%,60%)" },
  { name: "Tilda", icon: "Globe", color: "hsl(185,100%,50%)" },
  { name: "WordPress", icon: "Newspaper", color: "hsl(210,15%,30%)" },
  { name: "API", icon: "Code2", color: "hsl(260,80%,65%)" },
];

const cases = [
  {
    client: "Магазин электроники",
    industry: "E-commerce",
    color: "hsl(185,100%,55%)",
    challenge: "Рутинная подготовка сотен объявлений и долгое тестирование креативов",
    solution: "ИИ-генерация вариантов и шаблоны для пакетной выгрузки",
    metrics: [
      { label: "Время на подготовку", value: "−70%" },
      { label: "Вариантов креативов", value: "240" },
      { label: "Каналов запуска", value: "3" },
    ],
    quote: "Раньше команда тратила на подготовку 4 дня — теперь укладываемся в один.",
    author: "Маркетолог",
  },
  {
    client: "Подписочный сервис",
    industry: "Beauty / DTC",
    color: "hsl(320,80%,65%)",
    challenge: "Сложно вручную сегментировать базу и поддерживать email-цепочки",
    solution: "Шаблоны автоворонок и сегменты в одном кабинете",
    metrics: [
      { label: "Сегментов", value: "8" },
      { label: "Шаблонов писем", value: "12" },
      { label: "Время запуска", value: "−60%" },
    ],
    quote: "Шаблоны и сегменты в одном окне — больше не теряем подписчиков по дороге.",
    author: "Email-маркетолог",
  },
  {
    client: "Производитель инструмента",
    industry: "B2B",
    color: "hsl(30,100%,60%)",
    challenge: "SEO и контекст по low-funnel запросам тянули команду в разные стороны",
    solution: "Единое место для задач, шаблонов и фидов с приоритизацией",
    metrics: [
      { label: "Шаблонов задач", value: "30+" },
      { label: "Фидов в работе", value: "5" },
      { label: "Каналов", value: "4" },
    ],
    quote: "Команда наконец видит общий план работ и не дублирует задачи.",
    author: "Руководитель проекта",
  },
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

function ROICalculator() {
  const [budget, setBudget] = useState(300000);
  const [hours, setHours] = useState(40);
  const [rate, setRate] = useState(1500);

  const monthlySaving = Math.round(hours * 0.6 * rate);
  const adsBoost = Math.round(budget * 0.18);
  const total = monthlySaving + adsBoost;

  return (
    <div className="glass rounded-3xl p-5 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(145,70%,50%), transparent 60%)" }} />

      <div className="relative space-y-5">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
            Месячный рекламный бюджет
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={50000}
              max={3000000}
              step={50000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="flex-1 accent-neon-cyan"
            />
            <div className="font-heading font-bold text-xl text-foreground min-w-[120px] text-right">
              {budget.toLocaleString("ru-RU")} ₽
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
            Часов на рутину в месяц
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="flex-1 accent-neon-violet"
            />
            <div className="font-heading font-bold text-xl text-foreground min-w-[120px] text-right">
              {hours} ч
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
            Стоимость часа специалиста
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="flex-1 accent-neon-orange"
            />
            <div className="font-heading font-bold text-xl text-foreground min-w-[120px] text-right">
              {rate.toLocaleString("ru-RU")} ₽
            </div>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground leading-relaxed pt-2">
          Расчёт ориентировочный. Учитывает экономию времени на типовых задачах (≈60% рутины) и повышение эффективности кампаний за счёт ИИ-генерации вариантов (≈18% к бюджету).
        </div>
      </div>

      <div className="relative flex flex-col justify-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
          Ориентировочная экономия
        </div>
        <div className="font-heading font-bold leading-none mb-2"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", background: "linear-gradient(135deg, hsl(145,70%,50%), hsl(185,100%,55%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {total.toLocaleString("ru-RU")} ₽
        </div>
        <div className="text-sm text-muted-foreground mb-6">в месяц при том же бюджете</div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/20">
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={14} className="text-neon-violet" />
              <span className="text-sm text-foreground/80">Экономия времени</span>
            </div>
            <span className="font-bold text-foreground">{monthlySaving.toLocaleString("ru-RU")} ₽</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/20">
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" size={14} className="text-neon-cyan" />
              <span className="text-sm text-foreground/80">Эффективность кампаний</span>
            </div>
            <span className="font-bold text-foreground">{adsBoost.toLocaleString("ru-RU")} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const faq = [
  {
    q: "Сервис сам размещает рекламу?",
    a: "Нет. Сервис помогает готовить материалы — генерирует варианты текстов, шаблоны, фиды и сценарии автоматизации. Все решения и размещение в рекламных системах принимает пользователь.",
  },
  {
    q: "С какими рекламными системами работает?",
    a: "Поддерживаем работу с Яндекс Директ, VK Рекламой, MyTarget, Telegram Ads. Также есть интеграции с Метрикой, GA, AmoCRM, Bitrix24, Google Sheets, маркетплейсами и API для своих систем.",
  },
  {
    q: "Можно ли попробовать бесплатно?",
    a: "Да. После регистрации доступен ознакомительный период с базовыми возможностями ИИ-генератора и шаблонов. Платные тарифы открывают пакетную работу, автоматизации и продвинутые отчёты.",
  },
  {
    q: "Кому подходит сервис?",
    a: "Маркетологам и специалистам по рекламе, агентствам, in-house командам, e-commerce и B2B. Для тех, кто работает с большим количеством объявлений, фидов и сценариев — особенно полезно.",
  },
  {
    q: "Что с безопасностью данных?",
    a: "Данные хранятся на защищённых серверах, доступ к кабинету по паролю и сессиям. Сервис не передаёт ваши фиды и материалы третьим лицам. Сторонние API подключаются только по вашему явному согласию.",
  },
  {
    q: "Как считается стоимость?",
    a: "Тарифы фиксированные, по подписке. Подробности — на странице тарифов. Можно сменить тариф в любой момент.",
  },
];

export default function Agent({ onNavigate }: AgentProps) {
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full opacity-[0.25] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, hsl(185,100%,55%), transparent 70%)" }} />
        <div className="absolute bottom-[-5%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.22] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, hsl(260,80%,65%), transparent 70%)", animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full opacity-[0.18]"
          style={{ background: "radial-gradient(circle, hsl(320,80%,65%), transparent 70%)" }} />
      </div>

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

      {/* FOR WHOM (TABS) */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 text-xs text-neon-cyan mb-3 uppercase tracking-widest font-bold">
              <Icon name="Target" size={13} /> Для кого сервис
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Под каждую роль в команде
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
              Маркетологу — скорость. Руководителю — контроль. Собственнику — прозрачность бюджета.
            </p>
          </div>

          <Tabs defaultValue="marketer" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto mb-8 glass p-1 h-auto rounded-2xl">
              <TabsTrigger value="marketer" className="rounded-xl py-2.5 text-xs md:text-sm">Маркетолог</TabsTrigger>
              <TabsTrigger value="head" className="rounded-xl py-2.5 text-xs md:text-sm">Руководитель</TabsTrigger>
              <TabsTrigger value="owner" className="rounded-xl py-2.5 text-xs md:text-sm">Собственник</TabsTrigger>
            </TabsList>

            {[
              {
                value: "marketer",
                title: "Готовь объявления в 3 раза быстрее",
                desc: "ИИ-генератор пишет варианты по фиду или брифу. Шаблоны для Директа и VK уже настроены. Автоправила сами останавливают неэффективные группы.",
                color: "hsl(185,100%,55%)",
                items: [
                  { icon: "Sparkles", text: "ИИ-генерация 100+ вариантов за раз" },
                  { icon: "FileStack", text: "Шаблоны кампаний для Директа и VK" },
                  { icon: "Bot", text: "Автоматические правила управления" },
                  { icon: "Package", text: "Работа с фидами YML и CSV" },
                ],
              },
              {
                value: "head",
                title: "Один экран для всей команды",
                desc: "Видишь, кто над чем работает, какие кампании запущены и какой статус согласования. Без переключения между Директом, VK и Excel.",
                color: "hsl(260,80%,65%)",
                items: [
                  { icon: "LayoutDashboard", text: "Общий дашборд по всем каналам" },
                  { icon: "Users", text: "Распределение задач по специалистам" },
                  { icon: "GitBranch", text: "История изменений и согласований" },
                  { icon: "Bell", text: "Уведомления при отклонениях" },
                ],
              },
              {
                value: "owner",
                title: "Прозрачность бюджета и эффект",
                desc: "ROMI, LTV и стоимость заявки по источникам — без ручных выгрузок. Понимаешь, во что вкладываться, а где резать бюджет.",
                color: "hsl(30,100%,60%)",
                items: [
                  { icon: "TrendingUp", text: "ROMI и LTV по каждому источнику" },
                  { icon: "PieChart", text: "Распределение бюджета онлайн" },
                  { icon: "Receipt", text: "Финансовые отчёты для бухгалтерии" },
                  { icon: "ShieldCheck", text: "Контроль соответствия 38-ФЗ" },
                ],
              },
            ].map((t) => (
              <TabsContent key={t.value} value={t.value} className="mt-0">
                <div className="glass rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold mb-4"
                      style={{ background: `${t.color}20`, color: t.color }}>
                      Главное преимущество
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-2xl md:text-3xl mb-3 leading-tight">{t.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">{t.desc}</p>
                    <button onClick={() => onNavigate("services")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-background transition-all hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}aa)` }}>
                      Подобрать тариф <Icon name="ArrowRight" size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {t.items.map((it, i) => (
                      <div key={i} className="rounded-2xl p-4 bg-background/40 border border-white/20 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${t.color}20` }}>
                          <Icon name={it.icon} size={15} style={{ color: t.color }} />
                        </div>
                        <span className="text-sm text-foreground/85 leading-snug">{it.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* INTEGRATIONS */}
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

      {/* CASES */}
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

      {/* ROI CALCULATOR */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 text-xs text-neon-green mb-3 uppercase tracking-widest font-bold">
              <Icon name="Calculator" size={13} /> Калькулятор окупаемости
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Сколько вы сэкономите с сервисом
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
              Подвиньте ползунки и посмотрите ориентировочную выгоду по вашим вводным.
            </p>
          </div>

          <ROICalculator />
        </div>
      </section>

      {/* HOW IT WORKS */}
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

      {/* FAQ */}
      <section className="px-4 md:px-12 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 text-xs text-neon-cyan mb-3 uppercase tracking-widest font-bold">
              <Icon name="HelpCircle" size={13} /> Частые вопросы
            </div>
            <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Отвечаем коротко и по делу
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faq.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass rounded-2xl px-5 border-none">
                <AccordionTrigger className="font-heading font-bold text-foreground text-base hover:no-underline py-5 text-left">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="px-4 md:px-12 py-12 md:py-16 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl p-6 md:p-12 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%,0.12), hsl(260,80%,65%,0.12), hsl(320,80%,65%,0.12))" }}>
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
              style={{ background: "radial-gradient(circle, hsl(185,100%,55%), transparent 60%)" }} />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
              style={{ background: "radial-gradient(circle, hsl(260,80%,65%), transparent 60%)" }} />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
                    <Icon name="Brain" size={20} className="text-background" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-neon-cyan">mat-ad.ru · 24/7</span>
                </div>
                <h3 className="font-heading font-bold text-foreground leading-tight mb-3" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
                  Готовы освободить 60% времени на рутине?
                </h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-md">
                  Зарегистрируйтесь и попробуйте сервис бесплатно. Без карты, без обязательств.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => onNavigate("services")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-background transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))", boxShadow: "0 10px 40px rgba(0, 220, 230, 0.35)" }}>
                  <Icon name="Sparkles" size={18} />
                  Попробовать бесплатно
                </button>
                <button onClick={() => onNavigate("ai")}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass text-sm font-medium text-foreground hover:bg-muted/30 transition-colors">
                  Сначала посмотрю ИИ-генератор
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

      {/* Sticky CTA */}
      {showStickyCTA && (
        <button onClick={() => onNavigate("services")}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-background transition-all hover:scale-105 animate-fade-in"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))", boxShadow: "0 10px 40px rgba(0, 220, 230, 0.4)" }}>
          <Icon name="Rocket" size={16} />
          <span className="hidden sm:inline">Попробовать бесплатно</span>
        </button>
      )}
    </div>
  );
}
