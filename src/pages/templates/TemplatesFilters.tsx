import Icon from "@/components/ui/icon";
import type { YdCampaignType } from "../yd/types";
import { NICHE_META, TYPE_LABEL } from "./data";
import type { CampaignTemplate } from "./data";
import { FilterChip } from "./ui";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  niche: string;
  setNiche: (v: string) => void;
  type: string;
  setType: (v: string) => void;
}

export default function TemplatesFilters({ search, setSearch, niche, setNiche, type, setType }: Props) {
  return (
    <div className="flex flex-col gap-3 mb-5">
      <div className="relative">
        <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm" />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={niche === "all"} onClick={() => setNiche("all")}>Все ниши</FilterChip>
        {(Object.keys(NICHE_META) as CampaignTemplate["niche"][]).map((k) => {
          const m = NICHE_META[k];
          return (
            <FilterChip key={k} active={niche === k} onClick={() => setNiche(k)} color={m.color}>
              <Icon name={m.icon} size={11} /> {m.label}
            </FilterChip>
          );
        })}
        <div className="w-[1px] bg-border/40 mx-1" />
        <FilterChip active={type === "all"} onClick={() => setType("all")}>Все типы</FilterChip>
        {(["text", "network", "master"] as YdCampaignType[]).map((t) => (
          <FilterChip key={t} active={type === t} onClick={() => setType(t)}>
            {TYPE_LABEL[t]}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
