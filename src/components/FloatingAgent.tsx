import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const AGENT_URL = "https://functions.poehali.dev/7c410ad0-0dcc-4514-91c0-69f9b4bee236";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK = [
  "Сделай аудит моих кампаний",
  "Как поднять CTR?",
  "Идеи креативов на эту неделю",
];

export default function FloatingAgent() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const updated = [...messages, { role: "user" as const, content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch(AGENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Ошибка");
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      toast({ title: "Ошибка", description: e instanceof Error ? e.message : "Попробуйте снова" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hint bubble */}
      {!open && showHint && (
        <div className="fixed bottom-24 right-6 z-40 max-w-[240px] glass rounded-2xl p-3 shadow-2xl animate-fade-in">
          <button onClick={() => setShowHint(false)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
            <Icon name="X" size={10} className="text-muted-foreground" />
          </button>
          <div className="text-xs font-bold text-foreground mb-1">👋 Привет, я mat-ad.ru AI</div>
          <div className="text-[11px] text-muted-foreground">Спроси что-нибудь про твою рекламу — отвечу за секунды</div>
          <div className="absolute -bottom-2 right-8 w-4 h-4 rotate-45 glass border-r border-b border-border/50" />
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setShowHint(false); }}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full flex items-center justify-center group transition-all hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%), hsl(320,80%,65%))',
            boxShadow: '0 10px 40px rgba(0, 220, 230, 0.45), 0 0 0 6px rgba(0, 220, 230, 0.08)',
          }}
        >
          <Icon name="Brain" size={28} className="text-background" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-green border-2 border-background animate-pulse-slow" />
          <div className="absolute inset-0 rounded-full opacity-50 animate-ping"
            style={{ background: 'radial-gradient(circle, hsl(185,100%,55%,0.3), transparent 60%)' }} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[400px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-3rem)] flex flex-col glass rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-border/50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.08), hsl(260,80%,65%,0.08))' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                  <Icon name="Brain" size={18} className="text-background" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green border-2 border-card animate-pulse-slow" />
              </div>
              <div>
                <div className="font-heading font-bold text-foreground text-sm">mat-ad.ru AI</div>
                <div className="text-[10px] text-neon-green flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-slow" />
                  Онлайн · GPT-4o
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} title="Новый чат"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <Icon name="RotateCcw" size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Icon name="Minus" size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 ? (
              <div>
                <div className="text-center mb-5 px-2 mt-4">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%,0.2), hsl(260,80%,65%,0.2))' }}>
                    <Icon name="Sparkles" size={26} className="text-neon-cyan" />
                  </div>
                  <div className="font-heading font-bold text-foreground">Чем помочь?</div>
                  <div className="text-xs text-muted-foreground mt-1">Я вижу ваши кампании и фиды</div>
                </div>
                <div className="space-y-2">
                  {QUICK.map((q, i) => (
                    <button key={i} onClick={() => send(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl glass hover:bg-muted/30 transition-colors flex items-center gap-2 text-foreground">
                      <Icon name="Sparkles" size={11} className="text-neon-cyan flex-shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                        <Icon name="Brain" size={12} className="text-background" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                      m.role === "user" ? "text-background" : "glass text-foreground"
                    }`}
                      style={m.role === "user" ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}>
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                      <Icon name="Brain" size={12} className="text-background animate-pulse-slow" />
                    </div>
                    <div className="glass rounded-2xl px-3 py-2 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="px-3 py-3 border-t border-border/30 flex-shrink-0">
            <div className="flex items-center gap-2 glass rounded-2xl p-1.5">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Спросите что-нибудь..."
                disabled={loading}
                className="flex-1 bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground px-2 py-1.5"
              />
              <button type="submit" disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-background transition-all hover:scale-105 disabled:opacity-40 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
                <Icon name={loading ? "Loader" : "ArrowUp"} size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}