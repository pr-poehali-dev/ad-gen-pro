import { useState } from "react";
import Icon from "@/components/ui/icon";

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

export default function ROICalculatorSection() {
  return (
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
  );
}
