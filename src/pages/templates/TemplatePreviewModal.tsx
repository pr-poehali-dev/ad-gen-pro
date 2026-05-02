import Icon from "@/components/ui/icon";
import { NICHE_META, TYPE_LABEL } from "./data";
import type { CampaignTemplate } from "./data";
import { Mini } from "./ui";

interface Props {
  preview: CampaignTemplate;
  applying: string | null;
  onClose: () => void;
  onApply: (t: CampaignTemplate) => void;
}

export default function TemplatePreviewModal({ preview, applying, onClose, onApply }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-heading font-bold truncate">{preview.name}</div>
            <div className="text-xs text-muted-foreground">
              {NICHE_META[preview.niche].label} · {TYPE_LABEL[preview.campaign_type]}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/30">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="overflow-auto flex-1 p-5 space-y-5">
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Описание</div>
            <div className="text-sm text-foreground">{preview.description}</div>
          </div>

          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-2">Почему работает</div>
            <ul className="space-y-1.5">
              {preview.whyWorks.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Icon name="Check" size={14} className="text-neon-green flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {preview.groups.map((g, gi) => (
            <div key={gi} className="border border-border/40 rounded-xl p-3 bg-muted/10">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Layers" size={13} className="text-neon-cyan" />
                <div className="font-semibold text-sm">{g.name}</div>
              </div>

              {g.keywords.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Ключевые фразы</div>
                  <div className="flex flex-wrap gap-1">
                    {g.keywords.map((k, ki) => (
                      <span key={ki} className="text-[11px] px-2 py-0.5 rounded bg-muted/40 font-mono">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {g.ads.map((a, ai) => (
                  <div key={ai} className="bg-background rounded-lg p-3 border border-border/30">
                    <div className="text-[#3F51B5] text-base font-medium">{a.title1} — {a.title2}</div>
                    <div className="text-sm text-foreground/80 mt-1">{a.body}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {preview.negative_keywords && (
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Минус-фразы</div>
              <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 font-mono">
                {preview.negative_keywords}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/30">
            <Mini label="Бюджет/день" value={`${preview.daily_budget.toLocaleString("ru-RU")} ₽`} />
            <Mini label="Стратегия" value={preview.strategy === "manual_cpc" ? "Ручная" : "Авто"} />
            <Mini label="Ожидаемый CTR" value={preview.recommended_ctr} />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/40 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl glass text-sm">Закрыть</button>
          <button onClick={() => { onClose(); onApply(preview); }}
            disabled={applying === preview.id}
            className="px-4 py-2 rounded-xl text-sm font-bold text-background flex items-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
            <Icon name="Wand2" size={14} /> Создать кампанию
          </button>
        </div>
      </div>
    </div>
  );
}
