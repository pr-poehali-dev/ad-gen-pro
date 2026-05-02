import { useEffect, useRef, useState } from "react";
import { useAuth, DATA_API_URL, authHeaders } from "@/contexts/AuthContext";
import type { Campaign, Feed, ExportRecord } from "@/App";

export type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

interface UseCloudSyncProps {
  campaigns: Campaign[];
  feeds: Feed[];
  exportHistory: ExportRecord[];
  setCampaigns: (c: Campaign[]) => void;
  setFeeds: (f: Feed[]) => void;
}

export function useCloudSync({
  campaigns, feeds, exportHistory, setCampaigns, setFeeds,
}: UseCloudSyncProps) {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const initialLoadDone = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const lastPayload = useRef<string>("");

  // 1. При входе — забираем данные из облака
  useEffect(() => {
    if (!token || !user) {
      initialLoadDone.current = false;
      return;
    }
    if (initialLoadDone.current) return;

    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const res = await fetch(`${DATA_API_URL}?resource=all`, {
          method: "GET",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Не удалось загрузить данные");
        const data = await res.json();
        if (cancelled) return;

        const cloudCampaigns = (data.campaigns || []) as Array<{
          client_id?: string; name: string; platform: string; status: string;
          budget: number; spent: number; impressions: number; clicks: number;
          data?: Record<string, unknown>;
        }>;
        if (cloudCampaigns.length > 0) {
          const mapped: Campaign[] = cloudCampaigns.map((c, i) => {
            const d = (c.data || {}) as Partial<Campaign>;
            return {
              id: Number(c.client_id) || Date.now() + i,
              name: c.name,
              platform: (c.platform === "google" ? "google" : "yandex") as "yandex" | "google",
              status: (c.status === "active" || c.status === "paused" ? c.status : "draft") as Campaign["status"],
              budget: Number(c.budget) || 0,
              spent: Number(c.spent) || 0,
              impressions: Number(c.impressions) || 0,
              clicks: Number(c.clicks) || 0,
              ctr: Number(d.ctr) || 0,
              ads: Number(d.ads) || 0,
            };
          });
          setCampaigns(mapped);
        }

        const cloudFeeds = (data.feeds || []) as Array<{
          client_id?: string; name: string; format: string; products: number;
          status: string; data?: Record<string, unknown>;
        }>;
        if (cloudFeeds.length > 0) {
          const mapped: Feed[] = cloudFeeds.map((f, i) => {
            const d = (f.data || {}) as Partial<Feed>;
            return {
              id: Number(f.client_id) || Date.now() + i,
              name: f.name,
              type: (["YML", "CSV", "Excel"].includes(f.format) ? f.format : "YML") as Feed["type"],
              size: String(d.size || "—"),
              products: Number(f.products) || 0,
              updated: String(d.updated || "—"),
              status: (f.status === "warning" ? "warning" : "ok") as Feed["status"],
            };
          });
          setFeeds(mapped);
        }

        initialLoadDone.current = true;
        setStatus("saved");
        setLastSyncAt(Date.now());
      } catch {
        setStatus("error");
        initialLoadDone.current = true;
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  // 2. При изменениях — дебаунс-сохранение в облако
  useEffect(() => {
    if (!token || !user || !initialLoadDone.current) return;

    const payload = JSON.stringify({ campaigns, feeds, exportHistory });
    if (payload === lastPayload.current) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      setStatus("saving");
      try {
        const res = await fetch(`${DATA_API_URL}?resource=sync`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            campaigns: campaigns.map(c => ({ ...c, format: undefined })),
            feeds: feeds.map(f => ({ ...f, format: f.type })),
            state: { exportHistory },
          }),
        });
        if (!res.ok) throw new Error("save failed");
        lastPayload.current = payload;
        setStatus("saved");
        setLastSyncAt(Date.now());
      } catch {
        setStatus("error");
      }
    }, 1500);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [campaigns, feeds, exportHistory, token, user]);

  return { status, lastSyncAt };
}
