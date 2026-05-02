import { authHeaders } from "@/contexts/AuthContext";
import func2url from "../../../backend/func2url.json";
import type { YdCampaign, YdCampaignListItem, YdCampaignType, YdAd } from "./types";

export interface YdGroupListItem {
  id: number;
  name: string;
  campaign_id: number;
  campaign_name: string;
  campaign_type: YdCampaignType;
  ads_count: number;
}

const URL = (func2url as Record<string, string>)["yd-campaigns"];

async function call<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error || "Ошибка запроса");
  return data as T;
}

export const ydApi = {
  list: () => call<{ campaigns: YdCampaignListItem[] }>("?action=list"),
  get: (id: number) => call<YdCampaign>(`?action=get&id=${id}`),
  create: (name: string, campaign_type: YdCampaignType) =>
    call<{ id: number }>("?action=create", {
      method: "POST",
      body: JSON.stringify({ name, campaign_type }),
    }),
  save: (data: Partial<YdCampaign> & { id: number }) =>
    call<{ ok: boolean; id: number }>("?action=save", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    call<{ ok: boolean }>("?action=delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),
  groups: () => call<{ groups: YdGroupListItem[] }>("?action=groups"),
  addAds: (group_id: number, ads: Partial<YdAd>[], keywords?: string[]) =>
    call<{ ok: boolean; inserted: number; group_id: number; campaign_id: number }>("?action=add_ads", {
      method: "POST",
      body: JSON.stringify({ group_id, ads, keywords }),
    }),
};