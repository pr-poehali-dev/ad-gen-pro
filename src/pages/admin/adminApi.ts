import { authHeaders } from "@/contexts/AuthContext";
import func2url from "../../../backend/func2url.json";

export const ADMIN_URL = (func2url as Record<string, string>).admin;

async function call<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ADMIN_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка запроса");
  return data as T;
}

export const adminApi = {
  overview: () => call<{
    stats: Record<string, number>;
    revenue_chart: { day: string; revenue: number; count: number }[];
    users_chart: { day: string; count: number }[];
    top_products: { name: string; count: number; revenue: number }[];
  }>("?action=overview"),

  clients: (params: { search?: string; stage?: string; limit?: number } = {}) => {
    const q = new URLSearchParams({ action: "clients", ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])) });
    return call<{ clients: AdminClient[] }>(`?${q.toString()}`);
  },

  client: (id: number) => call<{ user: AdminClient; orders: AdminOrder[]; leads: AdminLead[] }>(`?action=client&id=${id}`),

  updateClient: (data: { id: number; notes?: string; tags?: string; lifecycle_stage?: string; plan?: string }) =>
    call<{ ok: boolean }>("?action=update_client", { method: "POST", body: JSON.stringify(data) }),

  orders: (params: { status?: string; search?: string } = {}) => {
    const q = new URLSearchParams({ action: "orders", ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])) });
    return call<{ orders: AdminOrder[] }>(`?${q.toString()}`);
  },

  leads: (params: { stage?: string } = {}) => {
    const q = new URLSearchParams({ action: "leads", ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])) });
    return call<{ leads: AdminLead[] }>(`?${q.toString()}`);
  },

  updateLead: (data: { id: number; pipeline_stage?: string; status?: string; notes?: string; amount?: number }) =>
    call<{ ok: boolean }>("?action=update_lead", { method: "POST", body: JSON.stringify(data) }),

  tasks: () => call<{ tasks: AdminTask[] }>("?action=tasks"),

  createTask: (data: { title: string; description?: string; priority?: string; due_at?: string; related_user_id?: number; related_lead_id?: number }) =>
    call<{ ok: boolean; id: number }>("?action=create_task", { method: "POST", body: JSON.stringify(data) }),

  completeTask: (id: number, completed: boolean) =>
    call<{ ok: boolean }>("?action=complete_task", { method: "POST", body: JSON.stringify({ id, completed }) }),

  events: () => call<{ events: AdminEvent[] }>("?action=events"),

  insights: () => call<{ insights: AiInsight[] }>("?action=ai_insights"),
};

export interface AdminClient {
  id: number;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  last_login_at?: string;
  is_admin?: boolean;
  role?: string;
  plan?: string;
  notes?: string;
  tags?: string;
  lifecycle_stage?: string;
  paid_count?: number;
  total_spent?: number;
  avatar_url?: string;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  user_email: string;
  user_name?: string;
  user_phone?: string;
  amount: number;
  status: string;
  yookassa_payment_id?: string;
  payment_url?: string;
  created_at: string;
  paid_at?: string;
}

export interface AdminLead {
  id: number;
  source?: string;
  service?: string;
  name: string;
  email?: string;
  phone?: string;
  comment?: string;
  status: string;
  pipeline_stage?: string;
  amount?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminTask {
  id: number;
  title: string;
  description?: string;
  due_at?: string;
  completed_at?: string;
  priority: string;
  related_user_id?: number;
  related_user_name?: string;
  related_user_email?: string;
  related_lead_id?: number;
  created_at: string;
}

export interface AdminEvent {
  id: number;
  event_type: string;
  target_type?: string;
  target_id?: string;
  description?: string;
  created_at: string;
  admin_email?: string;
  admin_name?: string;
}

export interface AiInsight {
  type: string;
  priority: string;
  title: string;
  description: string;
  items: Record<string, unknown>[];
}
