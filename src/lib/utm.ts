const UTM_KEY = "matad_utm";
const UTM_TTL_DAYS = 30;

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  yclid?: string;
  fbclid?: string;
  referrer?: string;
  landing?: string;
  capturedAt: string;
}

const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "yclid",
  "fbclid",
] as const;

export function captureUtm(): UtmData | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const data: Partial<UtmData> = {};
    let hasAny = false;
    for (const f of UTM_FIELDS) {
      const v = params.get(f);
      if (v) {
        (data as Record<string, string>)[f] = v;
        hasAny = true;
      }
    }
    const stored = readUtm();
    if (!hasAny) return stored;
    const fresh: UtmData = {
      ...data,
      referrer: document.referrer || undefined,
      landing: window.location.href,
      capturedAt: new Date().toISOString(),
    };
    localStorage.setItem(UTM_KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    return null;
  }
}

export function readUtm(): UtmData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(UTM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UtmData;
    if (!parsed.capturedAt) return null;
    const ageMs = Date.now() - new Date(parsed.capturedAt).getTime();
    if (ageMs > UTM_TTL_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(UTM_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearUtm(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UTM_KEY);
}

export function utmSummary(u: UtmData | null): string {
  if (!u) return "—";
  const src = u.utm_source || (u.yclid ? "yandex" : u.gclid ? "google" : u.fbclid ? "facebook" : "");
  const cmp = u.utm_campaign ? ` / ${u.utm_campaign}` : "";
  const term = u.utm_term ? ` (${u.utm_term})` : "";
  return src ? `${src}${cmp}${term}` : (u.referrer ? `ref: ${u.referrer}` : "—");
}
