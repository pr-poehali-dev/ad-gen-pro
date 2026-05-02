import { authHeaders } from "@/contexts/AuthContext";
import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["yd-api"];

export interface YdApiStatus {
  oauth_configured: boolean;
  connected: boolean;
  account_login: string;
  token_expires_at: string;
  scope: string;
}

export interface YdApiLog {
  id: number;
  campaign_id: number | null;
  operation: string;
  success: boolean;
  response_code: number | null;
  error_message: string;
  request_summary: string;
  created_at: string;
}

async function call<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error || "Ошибка запроса");
  return data as T;
}

export const ydApiClient = {
  status: () => call<YdApiStatus>("?action=status"),
  connectUrl: (redirect_uri: string) =>
    call<{ auth_url: string }>("?action=connect_url", {
      method: "POST",
      body: JSON.stringify({ redirect_uri }),
    }),
  callback: (code: string, redirect_uri: string) =>
    call<{ ok: boolean; account_login: string }>("?action=callback", {
      method: "POST",
      body: JSON.stringify({ code, redirect_uri }),
    }),
  disconnect: () =>
    call<{ ok: boolean }>("?action=disconnect", { method: "POST" }),
  send: (id: number) =>
    call<{ ok: boolean; yd_campaign_id: string }>("?action=send", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),
  logs: (campaign_id?: number) =>
    call<{ logs: YdApiLog[] }>(
      `?action=logs${campaign_id ? `&campaign_id=${campaign_id}` : ""}`
    ),
};
