import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useYookassa, openPaymentPage } from "@/components/extensions/yookassa/useYookassa";
import func2url from "../../backend/func2url.json";

const YOOKASSA_API_URL = (func2url as Record<string, string>)["yookassa-yookassa"];

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  period: string;
  color: string;
  badge?: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Старт",
    tagline: "Для одного специалиста",
    price: 1490,
    period: "месяц",
    color: "hsl(185,100%,55%)",
    features: [
      "До 500 объявлений в месяц",
      "1 рекламный канал",
      "ИИ-генерация на русском",
      "Базовые шаблоны",
      "Email-поддержка",
    ],
    cta: "Подключить Старт",
  },
  {
    id: "pro",
    name: "Профи",
    tagline: "Для агентств и команд",
    price: 4900,
    period: "месяц",
    color: "hsl(260,80%,65%)",
    badge: "Хит",
    popular: true,
    features: [
      "Безлимит объявлений",
      "Все рекламные каналы",
      "ИИ на 12 языках + кастом TOV",
      "Все шаблоны и автоматизации",
      "Командный доступ (до 5 чел.)",
      "Приоритетная поддержка",
    ],
    cta: "Подключить Профи",
  },
  {
    id: "business",
    name: "Бизнес",
    tagline: "Для крупных проектов",
    price: 14900,
    period: "месяц",
    color: "hsl(320,80%,65%)",
    features: [
      "Всё из тарифа Профи",
      "Команда без ограничений",
      "Персональный менеджер",
      "Интеграции по API",
      "SLA и выделенный канал",
      "Белая метка (white label)",
    ],
    cta: "Подключить Бизнес",
  },
];

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const { createPayment } = useYookassa({
    apiUrl: YOOKASSA_API_URL,
    onError: (err) => {
      toast({ title: "Не удалось создать платёж", description: err.message });
      setBusyPlan(null);
    },
  });

  const handlePay = async (plan: Plan) => {
    if (!user) {
      toast({ title: "Нужно войти", description: "Сначала создайте аккаунт или войдите — это займёт 30 секунд" });
      return;
    }
    setBusyPlan(plan.id);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const response = await createPayment({
      amount: plan.price,
      userEmail: user.email,
      userName: user.name || undefined,
      description: `Подписка mat-ad.ru — тариф ${plan.name}`,
      returnUrl: `${origin}/payment-success`,
      cartItems: [{ id: plan.id, name: `Тариф «${plan.name}»`, price: plan.price, quantity: 1 }],
    });
    if (response?.payment_url) {
      openPaymentPage(response.payment_url);
    }
    setBusyPlan(null);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
        <Icon name="Crown" size={13} />
        Подписка на сервис
      </div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
        Тарифы с моментальной активацией
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Оплата картой через ЮKassa. Доступ откроется автоматически сразу после оплаты.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`glass rounded-3xl p-6 relative overflow-hidden flex flex-col ${
              p.popular ? "ring-2 ring-neon-cyan/50 scale-[1.01]" : ""
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: p.color }} />

            {p.badge && (
              <div
                className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))",
                  color: "hsl(230,25%,5%)",
                }}
              >
                {p.badge}
              </div>
            )}

            <div className="mb-4">
              <div className="font-heading font-bold text-foreground text-xl">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.tagline}</div>
            </div>

            <div className="mb-5 flex items-baseline gap-1.5">
              <span
                className="font-heading font-bold text-4xl"
                style={{
                  background: `linear-gradient(135deg, ${p.color}, hsl(260,80%,65%))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {p.price.toLocaleString("ru-RU")} ₽
              </span>
              <span className="text-xs text-muted-foreground">/ {p.period}</span>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              {p.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <Icon name="Check" size={14} style={{ color: p.color }} className="mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handlePay(p)}
              disabled={busyPlan === p.id}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-background transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: p.popular
                  ? "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))"
                  : `linear-gradient(135deg, ${p.color}, ${p.color})`,
                boxShadow: p.popular ? "0 8px 24px rgba(0, 220, 230, 0.25)" : "none",
              }}
            >
              {busyPlan === p.id ? (
                <>
                  <Icon name="Loader2" size={15} className="animate-spin" />
                  Создаём счёт...
                </>
              ) : (
                <>
                  <Icon name="CreditCard" size={15} />
                  {p.cta}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={12} className="text-neon-green" />
          Безопасная оплата ЮKassa
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="RefreshCw" size={12} className="text-neon-cyan" />
          Отмена подписки в один клик
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Receipt" size={12} className="text-neon-purple" />
          Электронный чек по 54-ФЗ
        </div>
      </div>
    </div>
  );
}
