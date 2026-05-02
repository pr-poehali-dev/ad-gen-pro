import Icon from "@/components/ui/icon";
import { NICHE_META, TYPE_LABEL } from "./data";
import type { CampaignTemplate } from "./data";
import { Mini } from "./ui";

interface Props {
  t: CampaignTemplate;
  applying: string | null;
  onPreview: (id: string) => void;
  onApply: (t: CampaignTemplate) => void;
}

export default function TemplateCard({ t, applying, onPreview, onApply }: Props) {
  const m = NICHE_META[t.niche];
  return (
    <div className="glass rounded-2xl p-4 hover:border-neon-cyan/40 border border-transparent transition-colors flex flex-col">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${m.color}20`, border: `1px solid ${m.color}40` }}>
          <Icon name={m.icon} size={18} style={{ color: m.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-sm text-foreground leading-tight">{t.name}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${m.color}15`, color: m.color }}>
              {m.label}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
              {TYPE_LABEL[t.campaign_type]}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-3 flex-1">{t.short}</div>

      <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
        <Mini label="Групп" value={t.groups.length} />
        <Mini label="Объявл." value={t.groups.reduce((s, g) => s + g.ads.length, 0)} />
        <Mini label="Фраз" value={t.groups.reduce((s, g) => s + g.keywords.length, 0) || "—"} />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3 pb-2 border-b border-border/30">
        <span>~ {t.daily_budget.toLocaleString("ru-RU")} ₽/день</span>
        <span>CTR {t.recommended_ctr}</span>
      </div>

      <div className="flex gap-1.5">
        <button onClick={() => onPreview(t.id)}
          className="flex-1 px-3 py-2 rounded-xl glass text-xs font-semibold hover:bg-muted/30 flex items-center justify-center gap-1">
          <Icon name="Eye" size={12} /> Превью
        </button>
        <button onClick={() => onApply(t)} disabled={applying === t.id}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-background flex items-center justify-center gap-1 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))" }}>
          {applying === t.id ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Wand2" size={12} />}
          Применить
        </button>
      </div>
    </div>
  );
}
