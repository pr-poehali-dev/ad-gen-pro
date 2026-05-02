import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { adminApi, AiInsight } from "./adminApi";

const TYPE_ICONS: Record<string, string> = {
  cold_users: "Snowflake",
  abandoned_carts: "ShoppingCart",
  vip_clients: "Crown",
  hot_leads: "Flame",
};

const TYPE_COLORS: Record<string, string> = {
  cold_users: "hsl(200,100%,55%)",
  abandoned_carts: "hsl(15,80%,60%)",
  vip_clients: "hsl(45,100%,55%)",
  hot_leads: "hsl(0,80%,60%)",
};

export default function AdminAI() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.insights().then((d) => setInsights(d.insights)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Icon name="Sparkles" size={24} className="text-neon-cyan" />
          ИИ-инсайты
        </h1>
        <p className="text-sm text-muted-foreground">Что важно сделать прямо сейчас, чтобы заработать больше</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Icon name="Loader2" size={24} className="animate-spin text-neon-cyan" /></div>
      ) : insights.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Icon name="CheckCircle2" size={40} className="mx-auto mb-3 text-neon-green" />
          <div className="font-heading font-bold text-foreground text-lg mb-1">Всё под контролем!</div>
          <div className="text-sm text-muted-foreground">Срочных задач нет — продолжай в том же духе</div>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="glass rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: TYPE_COLORS[ins.type] || "hsl(185,100%,55%)" }} />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${TYPE_COLORS[ins.type]}20`, border: `1px solid ${TYPE_COLORS[ins.type]}40` }}>
                  <Icon name={TYPE_ICONS[ins.type] || "Lightbulb"} size={22} style={{ color: TYPE_COLORS[ins.type] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-heading font-bold text-foreground">{ins.title}</h3>
                    {ins.priority === "high" && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded text-background"
                        style={{ background: "hsl(0,70%,55%)" }}>Срочно</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{ins.description}</p>
                  {ins.items && ins.items.length > 0 && (
                    <div className="space-y-1.5">
                      {ins.items.slice(0, 5).map((item, j) => (
                        <div key={j} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground truncate">
                              {String(item.name || item.user_email || item.email || "—")}
                            </div>
                            {item.email && item.name && (
                              <div className="text-[10px] text-muted-foreground truncate">{String(item.email)}</div>
                            )}
                            {item.service && <div className="text-[10px] text-muted-foreground truncate">{String(item.service)}</div>}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            {item.amount !== undefined && (
                              <span className="text-neon-green font-bold">{Number(item.amount).toLocaleString("ru-RU")} ₽</span>
                            )}
                            {item.total !== undefined && (
                              <span className="text-neon-green font-bold">{Number(item.total).toLocaleString("ru-RU")} ₽</span>
                            )}
                            {item.phone && (
                              <a href={`tel:${item.phone}`} className="text-neon-cyan hover:underline" title={String(item.phone)}>
                                <Icon name="Phone" size={12} />
                              </a>
                            )}
                            {item.email && (
                              <a href={`mailto:${item.email}`} className="text-neon-cyan hover:underline">
                                <Icon name="Mail" size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      {ins.items.length > 5 && (
                        <div className="text-[11px] text-muted-foreground pl-3">и ещё {ins.items.length - 5}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
