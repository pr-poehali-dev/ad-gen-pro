import type { YdAd } from "./types";

interface Props {
  ad: YdAd;
  domain?: string;
}

export default function AdPreview({ ad, domain }: Props) {
  const fullDomain = (() => {
    if (ad.display_url) return ad.display_url;
    if (domain) return domain;
    try {
      if (ad.href) return new URL(ad.href).hostname.replace(/^www\./, "");
    } catch {/* noop */}
    return "your-site.ru";
  })();

  const titleFull = [ad.title1, ad.title2].filter(Boolean).join(" — ") || "Заголовок объявления";
  const body = ad.body || "Текст объявления — расскажите, чем выгодно ваше предложение.";

  return (
    <div className="border border-border/40 rounded-2xl p-4 bg-muted/10">
      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-3 tracking-wider">Превью в выдаче Яндекса</div>
      <div className="bg-background rounded-xl p-4 border border-border/30" style={{ fontFamily: "Arial, sans-serif" }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] px-1 py-0.5 rounded bg-muted/50 font-bold text-muted-foreground">Реклама</span>
          <span className="text-[12px] text-muted-foreground">·</span>
          <span className="text-[12px] text-foreground/70">{fullDomain}</span>
        </div>
        <a className="block text-[#3F51B5] hover:underline cursor-pointer text-[18px] leading-tight font-medium">
          {titleFull}
        </a>
        <div className="text-[13px] text-foreground/80 mt-1 leading-snug">
          {body}
        </div>
        {ad.sitelinks && ad.sitelinks.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {ad.sitelinks.slice(0, 4).map((sl, i) => (
              <a key={i} className="text-[13px] text-[#3F51B5] hover:underline cursor-pointer">{sl.title || `Ссылка ${i + 1}`}</a>
            ))}
          </div>
        )}
        {ad.callouts && ad.callouts.length > 0 && (
          <div className="text-[12px] text-muted-foreground mt-1.5">
            {ad.callouts.map((c) => c.text).filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
        <div>Заголовок 1: <span className={`font-semibold ${ad.title1.length > 56 ? "text-destructive" : "text-foreground"}`}>{ad.title1.length}/56</span></div>
        <div>Заголовок 2: <span className={`font-semibold ${ad.title2.length > 30 ? "text-destructive" : "text-foreground"}`}>{ad.title2.length}/30</span></div>
        <div>Текст: <span className={`font-semibold ${ad.body.length > 81 ? "text-destructive" : "text-foreground"}`}>{ad.body.length}/81</span></div>
      </div>
    </div>
  );
}
