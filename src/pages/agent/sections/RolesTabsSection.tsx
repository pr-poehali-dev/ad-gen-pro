import Icon from "@/components/ui/icon";
import { Page } from "@/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RolesTabsSectionProps {
  onNavigate: (page: Page) => void;
}

export default function RolesTabsSection({ onNavigate }: RolesTabsSectionProps) {
  return (
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
  );
}
