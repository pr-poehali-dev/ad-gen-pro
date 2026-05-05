import Icon from "@/components/ui/icon";
import { Page } from "@/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { integrations, cases } from "./data";

interface AgentSectionsProps {
  onNavigate: (page: Page) => void;
}

export default function AgentSections({ onNavigate }: AgentSectionsProps) {
  return (
    <>
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
    </>
  );
}
