declare global {
  interface Window {
    ym?: (counter: number, action: string, ...args: unknown[]) => void;
  }
}

export const YM_COUNTER = 109015002;

export type MetrikaGoal =
  | "lead_form_open"
  | "lead_form_submit"
  | "service_request"
  | "subscription_click"
  | "subscription_payment_created"
  | "payment_success"
  | "registration"
  | "login"
  | "ai_agent_message"
  | "ad_generated"
  | "campaign_created"
  | "feed_uploaded"
  | "export_done";

export function reachGoal(goal: MetrikaGoal, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.ym) return;
  try {
    window.ym(YM_COUNTER, "reachGoal", goal, params);
  } catch {
    /* noop */
  }
}

export function trackPageHit(url?: string): void {
  if (typeof window === "undefined" || !window.ym) return;
  try {
    window.ym(YM_COUNTER, "hit", url || window.location.href, { referer: document.referrer });
  } catch {
    /* noop */
  }
}
