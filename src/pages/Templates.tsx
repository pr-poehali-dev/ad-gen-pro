import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Page } from "@/App";
import { ydApi } from "./yd/api";
import type { YdCampaign } from "./yd/types";
import { emptyCampaign } from "./yd/types";
import { TEMPLATES } from "./templates/data";
import type { CampaignTemplate } from "./templates/data";
import TemplatesFilters from "./templates/TemplatesFilters";
import TemplateCard from "./templates/TemplateCard";
import TemplatePreviewModal from "./templates/TemplatePreviewModal";

interface TemplatesProps {
  onNavigate: (page: Page) => void;
}

export default function Templates({ onNavigate }: TemplatesProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [niche, setNiche] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchNiche = niche === "all" || t.niche === niche;
    const matchType = type === "all" || t.campaign_type === type;
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.short.toLowerCase().includes(search.toLowerCase());
    return matchNiche && matchType && matchSearch;
  });

  const apply = async (t: CampaignTemplate) => {
    if (!user) {
      toast({ title: "Войдите в аккаунт", description: "Шаблон создаст кампанию в вашем кабинете" });
      return;
    }
    setApplying(t.id);
    try {
      const created = await ydApi.create(`Шаблон: ${t.name}`, t.campaign_type);
      const cid = created.id;

      const fullCampaign: Partial<YdCampaign> & { id: number } = {
        id: cid,
        name: `Шаблон: ${t.name}`,
        campaign_type: t.campaign_type,
        strategy_type: t.strategy,
        daily_budget: t.daily_budget,
        weekly_budget: t.daily_budget * 7,
        negative_keywords: t.negative_keywords,
        regions: ["Россия"],
        step: 2,
        groups: t.groups.map((g) => ({
          name: g.name,
          geo: [],
          devices: ["desktop", "mobile", "tablet"],
          audience_targets: [],
          ads: g.ads.map((a) => ({
            ad_type: t.campaign_type === "network" ? "network_image" : "text",
            title1: a.title1,
            title2: a.title2,
            body: a.body,
            display_url: "",
            href: "",
            image_url: "",
            sitelinks: [],
            callouts: [],
          })),
          keywords: g.keywords.map((k) => ({ phrase: k, bid: 0, match_type: "broad" })),
        })),
        // Заполняем недостающие обязательные поля по умолчанию
        ...{ counter_id: "", counter_goals: "", schedule: {}, notes: `Создано из шаблона «${t.name}»`,
             utm_template: emptyCampaign().utm_template, currency: "RUB",
             strategy_settings: {}, status: "draft" as const },
      };

      await ydApi.save(fullCampaign);
      toast({
        title: "Шаблон применён",
        description: `Открываем кампанию «${t.name}» в редакторе...`,
      });
      try {
        localStorage.setItem("matad_open_campaign", String(cid));
      } catch {/* noop */}
      onNavigate("campaigns");
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setApplying(null);
    }
  };

  const preview = previewId ? TEMPLATES.find((t) => t.id === previewId) : null;

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-xs text-neon-cyan mb-2 uppercase tracking-widest font-bold">
          <Icon name="LayoutTemplate" size={13} /> Профессиональные шаблоны кампаний
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Шаблоны Яндекс Директ</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Готовые кампании со структурой, фразами, минусами и объявлениями. Применение — создание кампании в кабинете.
        </p>
      </div>

      <TemplatesFilters
        search={search} setSearch={setSearch}
        niche={niche} setNiche={setNiche}
        type={type} setType={setType}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((t) => (
          <TemplateCard
            key={t.id}
            t={t}
            applying={applying}
            onPreview={setPreviewId}
            onApply={apply}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="SearchX" size={32} className="text-muted-foreground/50 mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">По фильтрам ничего не найдено</div>
        </div>
      )}

      {preview && (
        <TemplatePreviewModal
          preview={preview}
          applying={applying}
          onClose={() => setPreviewId(null)}
          onApply={apply}
        />
      )}
    </div>
  );
}
