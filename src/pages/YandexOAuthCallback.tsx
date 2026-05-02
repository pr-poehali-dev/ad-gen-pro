import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { ydApiClient } from "./yd/ydApiClient";

export default function YandexOAuthCallback() {
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState("Завершаем подключение к Яндекс Директу...");
  const [account, setAccount] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");
    if (err) {
      setStatus("error");
      setMessage(`Яндекс отклонил подключение: ${err}`);
      return;
    }
    if (!code) {
      setStatus("error");
      setMessage("Не получен code от Яндекса");
      return;
    }
    const redirectUri = `${window.location.origin}/yandex-oauth-callback`;
    ydApiClient.callback(code, redirectUri)
      .then((d) => {
        setStatus("ok");
        setAccount(d.account_login || "");
        setMessage("Аккаунт Яндекс Директ подключён");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(String(e));
      });
  }, []);

  const goBack = () => {
    window.location.href = "/settings";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(185,100%,55%), transparent 70%)" }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(260,80%,65%), transparent 70%)" }} />
      </div>

      <div className="relative glass rounded-3xl p-8 max-w-md w-full text-center">
        {status === "working" && (
          <>
            <Icon name="Loader2" size={40} className="animate-spin text-neon-cyan mx-auto mb-4" />
            <div className="font-heading font-bold text-foreground mb-1">Завершаем подключение</div>
            <div className="text-sm text-muted-foreground">{message}</div>
          </>
        )}
        {status === "ok" && (
          <>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(145,70%,50%), hsl(185,100%,55%))" }}>
              <Icon name="Check" size={28} className="text-background" />
            </div>
            <div className="font-heading font-bold text-foreground mb-1">{message}</div>
            {account && (
              <div className="text-sm text-muted-foreground mb-5">
                Аккаунт: <span className="font-mono text-foreground">{account}</span>
              </div>
            )}
            <button onClick={goBack}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-background w-full justify-center"
              style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
              <Icon name="ArrowRight" size={14} /> Вернуться в настройки
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "hsl(0,75%,60%,0.2)", border: "1px solid hsl(0,75%,60%,0.4)" }}>
              <Icon name="AlertTriangle" size={28} className="text-destructive" />
            </div>
            <div className="font-heading font-bold text-foreground mb-1">Не удалось подключить</div>
            <div className="text-sm text-muted-foreground mb-5">{message}</div>
            <button onClick={goBack} className="px-5 py-3 rounded-xl glass text-sm w-full">
              Назад в настройки
            </button>
          </>
        )}
      </div>
    </div>
  );
}
