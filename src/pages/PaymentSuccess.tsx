import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

export default function PaymentSuccess() {
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order") || "";
    setOrderNumber(order);
    reachGoal("payment_success", { order });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, hsl(145,70%,50%), transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-lg glass rounded-3xl p-8 md:p-10 border border-border/40 text-center animate-fade-in">
        <div className="mx-auto mb-6 w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(145,70%,50%), hsl(185,100%,55%))', boxShadow: '0 12px 40px rgba(70, 220, 150, 0.35)' }}>
          <Icon name="Check" size={40} className="text-background" />
        </div>

        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Оплата прошла успешно</h1>
        <p className="text-muted-foreground mb-6">
          Спасибо за покупку! Доступ к тарифу активирован, чек отправили на почту.
        </p>

        {orderNumber && (
          <div className="glass rounded-xl px-4 py-3 mb-6 inline-flex items-center gap-2">
            <Icon name="Receipt" size={14} className="text-neon-cyan" />
            <span className="text-xs text-muted-foreground">Номер заказа:</span>
            <span className="text-sm font-mono font-bold text-foreground">{orderNumber}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/agent"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-background transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
            <Icon name="Sparkles" size={15} />
            Перейти к ИИ-агенту
          </a>
          <a href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass text-sm font-bold text-foreground hover:bg-muted/30 transition-colors">
            <Icon name="LayoutDashboard" size={15} />
            Открыть дашборд
          </a>
        </div>
      </div>
    </div>
  );
}