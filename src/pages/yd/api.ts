import { authHeaders } from "@/contexts/AuthContext";
import func2url from "../../../backend/func2url.json";
import type { YdCampaign, YdCampaignListItem, YdCampaignType } from "./types";

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
};
