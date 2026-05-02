import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Page } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { reachGoal } from "@/lib/metrika";
import { readUtm } from "@/lib/utm";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import func2url from "../../backend/func2url.json";

const ADMIN_URL = (func2url as Record<string, string>).admin;

interface ServicesProps {
  onNavigate: (page: Page) => void;
}

interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const services: Service[] = [
  {
    id: "context",
    title: "Помощь в контекстной рекламе",
    tagline: "Подготовка для Яндекс Директ и Google Ads",
    description: "Сервис помогает специалисту: ИИ генерирует варианты объявлений, шаблоны, структуру кампаний. Размещение и решения остаются за пользователем.",
    icon: "MousePointerClick",
    color: "hsl(185,100%,55%)",
    price: "от 35 000 ₽/мес*",
    features: ["Аудит ниши (по запросу)", "ИИ-генерация вариантов объявлений", "Шаблоны структуры кампаний", "Подготовка A/B-вариантов", "Сводные отчёты по вашим данным"],
    popular: true,
  },
  {
    id: "target",
    title: "Помощь в таргете",
    tagline: "Подготовка для VK · MyTarget",
    description: "Шаблоны для сегментации, описания аудиторий, заготовки креативов под форматы площадок.",
    icon: "Target",
    color: "hsl(260,80%,65%)",
    price: "от 30 000 ₽/мес*",
    features: ["Шаблоны сегментации аудиторий", "Заготовки для ретаргетинга", "Шаблоны описаний look-alike", "Заготовки креативов под форматы", "Памятки по подключению пикселя"],
  },
  {
    id: "seo",
    title: "Помощь в SEO",
    tagline: "Структура контента и техаудит",
    description: "Сервис помогает структурировать семантику и контент-план. Позиции в поисковой выдаче зависят от множества внешних факторов и не гарантируются.",
    icon: "Search",
    color: "hsl(145,70%,50%)",
    price: "от 50 000 ₽/мес*",
    features: ["Сбор и структура семантики", "Чек-лист технического аудита", "Шаблоны контент-плана", "Памятки по линкбилдингу", "Сводная аналитика по вашим данным"],
  },
  {
    id: "content",
    title: "Помощь в контент-маркетинге",
    tagline: "Шаблоны постов, статей, видео",
    description: "ИИ помогает готовить варианты текстов под ваш tone of voice, шаблоны для дизайнеров. Финальную правку выполняет редактор.",
    icon: "PenLine",
    color: "hsl(30,100%,60%)",
    price: "от 25 000 ₽/мес*",
    features: ["Шаблон tone of voice", "Шаблоны контент-плана", "ИИ-черновики под редактуру", "Расписание публикаций", "Сводка по охватам"],
  },
  {
    id: "email",
    title: "Помощь в email-маркетинге",
    tagline: "Шаблоны цепочек и рассылок",
    description: "Готовые шаблоны автоворонок, welcome-цепочек и реактивации, заготовки сегментации.",
    icon: "Mail",
    color: "hsl(320,80%,65%)",
    price: "от 18 000 ₽/мес*",
    features: ["Шаблоны автоворонок", "Шаблоны сегментации", "Заготовки A/B-тестов темы и CTA", "Описание интеграции с CRM", "Сводка по открываемости"],
  },
  {
    id: "design",
    title: "Помощь с креативами",
    tagline: "Шаблоны баннеров и страниц",
    description: "Шаблоны для дизайнеров и черновики ИИ-визуалов. Финальную доработку выполняет дизайнер заказчика.",
    icon: "Palette",
    color: "hsl(15,80%,60%)",
    price: "от 12 000 ₽/проект*",
    features: ["ИИ-черновики визуалов", "Адаптивные шаблоны баннеров", "Шаблоны лендингов", "Заготовки motion-сценариев", "Чек-лист брендбука"],
  },
  {
    id: "analytics",
    title: "Помощь в аналитике",
    tagline: "Сводные дашборды по вашим данным",
    description: "Сервис помогает свести данные ваших источников в один интерфейс. Внешние интеграции выполняются по согласованию.",
    icon: "LineChart",
    color: "hsl(200,100%,55%)",
    price: "от 22 000 ₽/мес*",
    features: ["Подключение источников", "Сводный дашборд", "Расчёт ROMI и LTV по вашим данным", "Воронки по каналам", "Уведомления в Telegram"],
  },
  {
    id: "automation",
    title: "Автоматизация рутины",
    tagline: "Сценарии и интеграции",
    description: "Сценарии для уведомлений и автоматических напоминаний по правилам, заданным пользователем. Решения о паузе/корректировке принимает рекламодатель.",
    icon: "Bot",
    color: "hsl(280,80%,65%)",
    price: "от 15 000 ₽/мес*",
    features: ["Уведомления о перерасходе", "Шаблоны A/B-сценариев", "Подсказки по ставкам", "Алерты в Telegram/Slack", "API для интеграций"],
  },
];

export default function Services({ onNavigate }: ServicesProps) {
  const { toast } = useToast();
  const [requestedIds, setRequestedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem("matad_requested_services") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const requestService = (s: Service) => {
    setActiveService(s);
    setForm({ name: "", phone: "", email: "", comment: "" });
    reachGoal("lead_form_open", { service: s.id });
  };

  const submitRequest = async () => {
    if (!activeService) return;
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      toast({ title: "Заполните контакты", description: "Имя и телефон или email обязательны" });
      return;
    }
    setSubmitting(true);
    const utm = readUtm();
    const next = new Set(requestedIds).add(activeService.id);
    setRequestedIds(next);
    try {
      localStorage.setItem("matad_requested_services", JSON.stringify(Array.from(next)));
      const all = JSON.parse(localStorage.getItem("matad_leads") || "[]");
      all.push({
        service: activeService.title,
        ...form,
        utm,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("matad_leads", JSON.stringify(all));
    } catch {/* noop */}
    try {
      await fetch(`${ADMIN_URL}?action=submit_lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          comment: form.comment,
          service: activeService.title,
          source: "website",
          utm,
        }),
      });
    } catch {/* noop — лид останется в localStorage */}
    reachGoal("lead_form_submit", { service: activeService.id });
    reachGoal("service_request", { service: activeService.id });
    toast({ title: "Заявка отправлена", description: `Менеджер свяжется по «${activeService.title}» в течение 30 минут` });
    setSubmitting(false);
    setActiveService(null);
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
          <Icon name="Zap" size={13} />
          Тарифы и пакеты сервиса
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Тарифы <span style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>mat-ad.ru</span>
        </h1>
        <p className="text-muted-foreground">
          Сервис помогает специалистам готовить рекламные материалы и автоматизировать рутину. Размещение рекламы и финальные решения остаются за пользователем.
        </p>
        <p className="text-[11px] text-muted-foreground/80 mt-2">
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

      <SubscriptionPlans />

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
                  onClick={() => requestService(s)}
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

      {/* CTA - call agent */}
      <div className="mt-6 glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
              <Icon name="Brain" size={28} className="text-background" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground text-lg">Не уверены, что подходит?</h3>
              <p className="text-sm text-muted-foreground">Спросите AI-агента — он подберёт услуги под вашу задачу за минуту</p>
            </div>
          </div>
          <button onClick={() => onNavigate("agent")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
            <Icon name="MessageSquare" size={16} />
            Поговорить с агентом
          </button>
        </div>
      </div>

      {/* Request form modal */}
      {activeService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => !submitting && setActiveService(null)}>
          <div onClick={e => e.stopPropagation()}
            className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${activeService.color}20`, border: `1px solid ${activeService.color}40` }}>
                  <Icon name={activeService.icon} size={20} style={{ color: activeService.color }} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading font-bold text-foreground text-base">Заявка на услугу</h2>
                  <div className="text-xs text-muted-foreground truncate">{activeService.title} · {activeService.price}</div>
                </div>
              </div>
              <button onClick={() => setActiveService(null)} disabled={submitting}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ваше имя *</label>
                <input type="text" value={form.name} autoFocus
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Телефон</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@company.ru"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Комментарий</label>
                <textarea value={form.comment} rows={3}
                  onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Кратко опишите задачу или бюджет"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setActiveService(null)} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button onClick={submitRequest} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                {submitting ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
                {submitting ? "Отправка..." : "Отправить заявку"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </div>
        </div>
      )}
    </div>
  );
}