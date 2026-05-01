import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Campaign, Feed, Page } from "@/App";
import { useToast } from "@/hooks/use-toast";

const AGENT_URL = "https://functions.poehali.dev/7c410ad0-0dcc-4514-91c0-69f9b4bee236";

interface AgentProps {
  campaigns: Campaign[];
  feeds: Feed[];
  onNavigate: (page: Page) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const quickPrompts = [
  { icon: "TrendingUp", text: "Как увеличить CTR в моих кампаниях?" },
  { icon: "Target", text: "Предложи стратегию на следующий месяц" },
  { icon: "Wallet", text: "Где я переплачиваю за рекламу?" },
  { icon: "Lightbulb", text: "Идеи креативов для распродажи" },
  { icon: "BarChart3", text: "Сделай аудит активных кампаний" },
  { icon: "Rocket", text: "Помоги запустить новый продукт" },
];

const services = [
  { icon: "MousePointerClick", title: "Контекст", color: "hsl(185,100%,55%)" },
  { icon: "Megaphone", title: "Таргет", color: "hsl(260,80%,65%)" },
  { icon: "Search", title: "SEO", color: "hsl(145,70%,50%)" },
  { icon: "Mail", title: "Email", color: "hsl(30,100%,60%)" },
  { icon: "Sparkles", title: "Креативы", color: "hsl(320,80%,65%)" },
  { icon: "Palette", title: "Дизайн", color: "hsl(15,80%,60%)" },
];

export default function Agent({ campaigns, feeds, onNavigate }: AgentProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { role: "user", content: text, time: now };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch(AGENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          context: { campaigns, feeds },
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Ошибка агента");
      const assistantTime = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, time: assistantTime }]);
    } catch (e) {
      toast({ title: "Ошибка", description: e instanceof Error ? e.message : "Попробуйте ещё раз" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const activeCount = campaigns.filter(c => c.status === "active").length;
  const productsCount = feeds.reduce((s, f) => s + f.products, 0);
  const isEmpty = messages.length === 0;

  return (
    <div className="h-full flex flex-col">
      {/* Hero header */}
      <div className="px-8 pt-8 pb-4 border-b border-border/30 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 70%)' }} />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%))' }}>
                <Icon name="Brain" size={28} className="text-background" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neon-green animate-pulse-slow border-2 border-background" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-foreground">AdFlow Brain</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', color: 'hsl(230,25%,5%)' }}>
                  AI Agent
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Ваш персональный digital-стратег · работает 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
              <span className="text-muted-foreground">GPT-4o · polza.ai</span>
            </div>
          </div>
        </div>

        {/* Live context */}
        <div className="relative mt-5 grid grid-cols-4 gap-3">
          <div className="glass rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Активных кампаний</div>
            <div className="text-lg font-heading font-bold text-foreground">{activeCount}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Расход</div>
            <div className="text-lg font-heading font-bold text-foreground">₽ {totalSpent.toLocaleString("ru-RU")}</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Товаров в фидах</div>
            <div className="text-lg font-heading font-bold text-foreground">{productsCount.toLocaleString("ru-RU")}</div>
          </div>
          <div className="glass rounded-xl p-3 flex items-center gap-2">
            <Icon name="Zap" size={14} className="text-neon-cyan" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Услуг агентства</div>
              <div className="text-lg font-heading font-bold text-foreground">{services.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
        {isEmpty ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
                Добро пожаловать в <span style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AdFlow</span>
              </h2>
              <p className="text-muted-foreground">Спросите что угодно про вашу рекламу — я проанализирую и предложу решение</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {services.map((s, i) => (
                <button key={i} onClick={() => onNavigate("services")}
                  className="glass glass-hover rounded-2xl p-4 text-left group transition-all hover:scale-[1.02]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                    <Icon name={s.icon} size={16} style={{ color: s.color }} />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Услуга агентства</div>
                </button>
              ))}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Icon name="Sparkles" size={13} className="text-neon-cyan" />
                Быстрые запросы
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((p, i) => (
                  <button key={i} onClick={() => send(p.text)}
                    className="glass glass-hover rounded-xl p-3 flex items-center gap-3 text-left transition-all hover:scale-[1.01] group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.15), hsl(260,80%,65%,0.15))' }}>
                      <Icon name={p.icon} size={14} className="text-neon-cyan" />
                    </div>
                    <span className="text-sm text-foreground/90">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                    <Icon name="Brain" size={16} className="text-background" />
                  </div>
                )}
                <div className={`max-w-[78%] ${m.role === "user" ? "order-1" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "text-background"
                      : "glass text-foreground"
                  }`}
                    style={m.role === "user" ? {
                      background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))',
                    } : {}}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                  <div className={`text-[10px] text-muted-foreground mt-1 ${m.role === "user" ? "text-right" : ""}`}>
                    {m.role === "assistant" ? "AdFlow Brain · " : ""}{m.time}
                  </div>
                </div>
                {m.role === "user" && (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-background"
                    style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))' }}>
                    Я
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                  <Icon name="Brain" size={16} className="text-background animate-pulse-slow" />
                </div>
                <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">Обдумываю...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-border/30 bg-background/80 backdrop-blur">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-1.5 flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Спросите про CTR, бюджет, креативы, запуск кампании..."
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 resize-none max-h-32"
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-background transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
              <Icon name={loading ? "Loader" : "ArrowUp"} size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <span className="text-[10px] text-muted-foreground">
              ⌘+Enter — отправить · агент видит ваши кампании и фиды
            </span>
            {messages.length > 0 && (
              <button type="button" onClick={() => setMessages([])}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Icon name="RotateCcw" size={11} />
                Новый чат
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
