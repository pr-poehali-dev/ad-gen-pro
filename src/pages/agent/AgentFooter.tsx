import Icon from "@/components/ui/icon";
import { Page } from "@/App";

interface AgentFooterProps {
  onNavigate: (page: Page) => void;
  showStickyCTA: boolean;
}

export default function AgentFooter({ onNavigate, showStickyCTA }: AgentFooterProps) {
  return (
    <>
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
    </>
  );
}
