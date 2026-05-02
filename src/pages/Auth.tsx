import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AuthProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

type Mode = "login" | "register";

export default function Auth({ onSuccess, onClose }: AuthProps) {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({ title: "Заполните поля", description: "Email и пароль обязательны" });
      return;
    }
    if (mode === "register") {
      if (password.length < 6) {
        toast({ title: "Слишком короткий пароль", description: "Минимум 6 символов" });
        return;
      }
      if (!agree) {
        toast({ title: "Подтвердите согласие", description: "Нужно согласиться с условиями использования" });
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
        toast({ title: "Добро пожаловать", description: "Вход выполнен успешно" });
      } else {
        await register(email.trim(), password, name.trim(), company.trim());
        toast({ title: "Аккаунт создан", description: "Ваши данные сохраняются в облаке" });
      }
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось выполнить запрос";
      toast({ title: "Ошибка", description: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-25 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-md glass rounded-3xl p-6 md:p-8 border border-border/40">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center justify-center transition-colors"
            aria-label="Закрыть">
            <Icon name="X" size={16} />
          </button>
        )}

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
            <Icon name="Zap" size={20} className="text-background" />
          </div>
          <div>
            <div className="font-heading font-bold text-foreground text-lg leading-tight">
              {mode === "login" ? "Вход в mat-ad.ru" : "Создать аккаунт"}
            </div>
            <div className="text-xs text-muted-foreground">
              {mode === "login" ? "Продолжите работу с вашими кампаниями" : "Все данные будут сохранены в облаке"}
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-muted/30 mb-5">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            Войти
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              mode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            Регистрация
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <>
              <label className="block">
                <div className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Имя</div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Как к вам обращаться"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon-cyan/60 transition-colors"
                />
              </label>
              <label className="block">
                <div className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Компания (необязательно)</div>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="ООО «Пример»"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon-cyan/60 transition-colors"
                />
              </label>
            </>
          )}

          <label className="block">
            <div className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.ru"
              autoComplete="email"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon-cyan/60 transition-colors"
            />
          </label>

          <label className="block">
            <div className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Пароль</div>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-muted/30 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon-cyan/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center"
                aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}>
                <Icon name={showPwd ? "EyeOff" : "Eye"} size={14} />
              </button>
            </div>
          </label>

          {mode === "register" && (
            <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-neon-cyan flex-shrink-0"
              />
              <span>
                Соглашаюсь с условиями использования сервиса и обработкой персональных данных
                в соответствии с ФЗ № 152-ФЗ.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-background transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))', boxShadow: '0 8px 24px rgba(0, 220, 230, 0.25)' }}>
            {busy ? (
              <>
                <Icon name="Loader2" size={15} className="animate-spin" />
                Подождите...
              </>
            ) : (
              <>
                <Icon name={mode === "login" ? "LogIn" : "UserPlus"} size={15} />
                {mode === "login" ? "Войти" : "Создать аккаунт"}
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-border/30 text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              Нет аккаунта?{" "}
              <button onClick={() => setMode("register")} className="text-neon-cyan font-medium hover:underline">
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{" "}
              <button onClick={() => setMode("login")} className="text-neon-cyan font-medium hover:underline">
                Войти
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
