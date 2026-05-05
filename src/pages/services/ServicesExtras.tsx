import Icon from "@/components/ui/icon";
import { Page } from "@/App";

interface ServicesExtrasProps {
  onNavigate: (page: Page) => void;
}

export default function ServicesExtras({ onNavigate }: ServicesExtrasProps) {
  return (
    <>
      {/* Comparison table */}
      <div className="mt-10 md:mt-14">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
            <Icon name="Table2" size={13} /> Сравнение тарифов
          </div>
          <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)" }}>
            Что входит в каждый тариф
          </h2>
        </div>

        <div className="glass rounded-3xl p-3 md:p-5 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-3 text-xs uppercase tracking-widest text-muted-foreground font-bold">Возможности</th>
                <th className="text-center py-3 px-3 text-xs uppercase tracking-widest font-bold" style={{ color: "hsl(185,100%,55%)" }}>Старт</th>
                <th className="text-center py-3 px-3 text-xs uppercase tracking-widest font-bold relative" style={{ color: "hsl(260,80%,65%)" }}>
                  Профи
                  <span className="absolute -top-1 right-0 text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))", color: "hsl(230,25%,5%)" }}>
                    Хит
                  </span>
                </th>
                <th className="text-center py-3 px-3 text-xs uppercase tracking-widest font-bold" style={{ color: "hsl(30,100%,60%)" }}>Команда</th>
              </tr>
            </thead>
            <tbody>
              {[
                { f: "ИИ-генерация объявлений", v: ["100/мес", "Безлимит", "Безлимит"] },
                { f: "Шаблоны кампаний", v: ["Базовые", "Все", "Все + кастом"] },
                { f: "Работа с фидами YML/CSV", v: ["3 фида", "20 фидов", "Безлимит"] },
                { f: "Автоматизации и правила", v: [false, true, true] },
                { f: "Интеграции с CRM/Метрикой", v: ["Базовые", "Все", "Все + API"] },
                { f: "Сводный дашборд ROMI/LTV", v: [false, true, true] },
                { f: "Совместная работа", v: ["1 чел.", "до 3 чел.", "Безлимит"] },
                { f: "Поддержка", v: ["Email", "Чат 24/7", "Персональный менеджер"] },
                { f: "Стоимость", v: ["от 18 000 ₽", "от 35 000 ₽", "от 90 000 ₽"], bold: true },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 text-foreground/85 font-medium">{row.f}</td>
                  {row.v.map((cell, ci) => (
                    <td key={ci} className={`py-3 px-3 text-center ${row.bold ? "font-heading font-bold text-foreground" : "text-foreground/80"}`}>
                      {cell === true ? (
                        <Icon name="Check" size={16} className="text-neon-green inline" />
                      ) : cell === false ? (
                        <Icon name="Minus" size={16} className="text-muted-foreground/40 inline" />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mt-10 md:mt-14">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
            <Icon name="Quote" size={13} /> Отзывы
          </div>
          <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)" }}>
            Что говорят клиенты
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Анна К.", role: "Маркетолог · E-commerce", text: "За первый месяц подготовили в 3 раза больше объявлений. ИИ-генератор экономит часы рутины — освободилось время на стратегию.", avatar: "А", color: "hsl(185,100%,55%)" },
            { name: "Дмитрий С.", role: "Руководитель · Агентство", text: "Дашборд закрыл боль с отчётами клиентам. Видим всё в одном месте, легко собирать сводки. Команда довольна.", avatar: "Д", color: "hsl(260,80%,65%)" },
            { name: "Ольга М.", role: "Email-маркетолог · DTC", text: "Шаблоны автоворонок и сегменты — то, что искали год. Запустили реактивацию за два дня вместо двух недель.", avatar: "О", color: "hsl(320,80%,65%)" },
          ].map((t, i) => (
            <div key={i} className="glass rounded-2xl p-6 relative">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Icon key={si} name="Star" size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-background"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)` }}>
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

      {/* FAQ */}
      <div className="mt-10 md:mt-14">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
            <Icon name="HelpCircle" size={13} /> Частые вопросы по тарифам
          </div>
          <h2 className="font-heading font-bold text-foreground leading-tight" style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)" }}>
            Коротко о главном
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { q: "Можно сменить тариф?", a: "Да, в любой момент через личный кабинет. При апгрейде — пересчёт по дням, при даунгрейде — со следующего периода." },
            { q: "Есть ли тестовый период?", a: "Да. После регистрации доступен ознакомительный период с базовыми возможностями. Без привязки карты." },
            { q: "Что входит в индивидуальные пакеты?", a: "Это услуги «под ключ» — наш специалист помогает настроить и сопроводить вашу работу. Состав согласовывается индивидуально." },
            { q: "Как оплачивать?", a: "Юр. лицам — счёт и закрывающие документы. Физ. лицам — карта или СБП через защищённый платёжный шлюз." },
            { q: "Можно ли отказаться?", a: "Да. Подписка отменяется в один клик в кабинете. Возврат за неиспользованный период — по запросу в поддержку." },
            { q: "Какие гарантии по результату рекламы?", a: "Сервис — программный инструмент для подготовки материалов. Результат рекламы зависит от множества внешних факторов и не гарантируется." },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="font-heading font-bold text-foreground text-sm mb-2 flex items-start gap-2">
                <Icon name="MessageCircle" size={14} className="text-neon-cyan flex-shrink-0 mt-0.5" />
                {f.q}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed pl-6">{f.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA - call agent */}
      <div className="mt-10 md:mt-14 glass rounded-2xl p-6 relative overflow-hidden">
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
    </>
  );
}
