import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import func2url from "../../backend/func2url.json";

const SETTINGS_URL = (func2url as Record<string, string>).settings;

const tabs = [
  { id: "account", label: "Аккаунт", icon: "User" },
  { id: "api", label: "API ключи", icon: "Key" },
  { id: "limits", label: "Лимиты", icon: "Shield" },
];

interface Provider {
  id: "yandex_direct" | "google_ads" | "polza_ai" | "vk_ads";
  name: string;
  icon: string;
  hint: string;
}

const PROVIDERS: Provider[] = [
  { id: "yandex_direct", name: "Яндекс Директ API", icon: "🟡", hint: "OAuth-токен из Яндекс.Паспорта" },
  { id: "google_ads", name: "Google Ads API", icon: "🔵", hint: "Developer token + OAuth client" },
  { id: "polza_ai", name: "polza.ai (ИИ-генерация)", icon: "🤖", hint: "Ключ для ИИ-генерации объявлений" },
  { id: "vk_ads", name: "VK Реклама API", icon: "🟣", hint: "Access token VK Ads" },
];

interface ApiKeyState {
  provider: string;
  masked: string;
  has_value: boolean;
  is_active: boolean;
  updated_at?: string;
}

interface ProfileState {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  name: string;
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({
    email: "", first_name: "", last_name: "", phone: "", company: "", name: "",
  });
  const [apiKeys, setApiKeys] = useState<ApiKeyState[]>([]);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editingKeyValue, setEditingKeyValue] = useState("");

  const load = useCallback(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    fetch(`${SETTINGS_URL}?action=me`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        const u = d.user || {};
        setProfile({
          email: u.email || "",
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          phone: u.phone || "",
          company: u.company || "",
          name: u.name || "",
        });
        setApiKeys(d.api_keys || []);
      })
      .catch((e) => toast({ title: "Не удалось загрузить", description: String(e) }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const fullName = `${profile.first_name} ${profile.last_name}`.trim();
      const res = await fetch(`${SETTINGS_URL}?action=save_profile`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          company: profile.company,
          name: fullName || profile.name,
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({ title: "Профиль сохранён", description: fullName || profile.email });
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const saveApiKey = async (provider: string) => {
    const value = editingKeyValue.trim();
    if (!value) {
      toast({ title: "Введите ключ" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${SETTINGS_URL}?action=save_api_key`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ provider, api_key: value }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({ title: "API-ключ сохранён" });
      setEditingProvider(null);
      setEditingKeyValue("");
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const deleteApiKey = async (provider: string) => {
    if (!confirm("Отключить ключ для этой платформы?")) return;
    try {
      const res = await fetch(`${SETTINGS_URL}?action=delete_api_key`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ provider }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error || "Ошибка");
      toast({ title: "Ключ отключён" });
      load();
    } catch (e) {
      toast({ title: "Ошибка", description: String(e) });
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <Icon name="Lock" size={32} className="text-neon-cyan mx-auto mb-3" />
          <div className="font-bold text-foreground mb-1">Войдите в аккаунт</div>
          <div className="text-sm text-muted-foreground">Настройки сохраняются в личном кабинете</div>
        </div>
      </div>
    );
  }

  const initials = ((profile.first_name[0] || "") + (profile.last_name[0] || "")) ||
    (profile.email[0] || "?").toUpperCase();

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground text-sm mt-1">Профиль и API-ключи рекламных платформ</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="md:w-48 flex md:flex-col gap-1 md:space-y-1 md:flex-shrink-0 overflow-x-auto md:overflow-visible -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === t.id ? "text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              style={activeTab === t.id ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))', boxShadow: '0 4px 15px rgba(0,220,230,0.25)' } : {}}>
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Icon name="Loader2" size={28} className="animate-spin text-neon-cyan" />
            </div>
          ) : (
            <>
              {activeTab === "account" && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-foreground mb-5">Профиль</h3>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-background uppercase"
                      style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))' }}>
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-base">
                        {`${profile.first_name} ${profile.last_name}`.trim() || profile.name || profile.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.is_admin || user.role === "admin" ? "Администратор · " : ""}{profile.company || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Имя" value={profile.first_name} onChange={(v) => setProfile({ ...profile, first_name: v })} />
                    <Field label="Фамилия" value={profile.last_name} onChange={(v) => setProfile({ ...profile, last_name: v })} />
                    <Field label="Email" value={profile.email} disabled />
                    <Field label="Телефон" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} placeholder="+7 (___) ___-__-__" />
                    <div className="sm:col-span-2">
                      <Field label="Компания" value={profile.company} onChange={(v) => setProfile({ ...profile, company: v })} />
                    </div>
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                    <Icon name={saving ? "Loader2" : "Save"} size={14} className={saving ? "animate-spin" : ""} />
                    Сохранить изменения
                  </button>
                </div>
              )}

              {activeTab === "api" && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-foreground mb-2">API-ключи рекламных платформ</h3>
                  <p className="text-xs text-muted-foreground mb-5">
                    Ключи нужны для прямой отправки кампаний в платформы. Хранятся только у вас в аккаунте.
                  </p>
                  <div className="space-y-3">
                    {PROVIDERS.map((p) => {
                      const saved = apiKeys.find((k) => k.provider === p.id);
                      const isActive = saved?.is_active && saved?.has_value;
                      const isEditing = editingProvider === p.id;
                      return (
                        <div key={p.id} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <span className="text-xl flex-shrink-0">{p.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">{p.name}</div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingKeyValue}
                                  onChange={(e) => setEditingKeyValue(e.target.value)}
                                  placeholder="Вставьте API-ключ..."
                                  autoFocus
                                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-muted/50 border border-neon-cyan/40 text-xs text-foreground focus:outline-none font-mono"
                                />
                              ) : (
                                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                  {saved?.masked ? saved.masked : <span className="italic">{p.hint}</span>}
                                </div>
                              )}
                            </div>
                            {isActive ? (
                              <span className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 bg-neon-green/15 text-neon-green">Активен</span>
                            ) : (
                              <span className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 bg-muted text-muted-foreground">Не подключён</span>
                            )}
                            {isEditing ? (
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button onClick={() => saveApiKey(p.id)} disabled={saving}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-background"
                                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                                  Сохранить
                                </button>
                                <button onClick={() => { setEditingProvider(null); setEditingKeyValue(""); }}
                                  className="px-3 py-1.5 rounded-lg text-xs glass">Отмена</button>
                              </div>
                            ) : (
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button onClick={() => { setEditingProvider(p.id); setEditingKeyValue(""); }}
                                  className="px-3 py-1.5 rounded-lg text-xs glass hover:bg-muted/50 flex items-center gap-1">
                                  <Icon name="Pencil" size={11} /> {isActive ? "Изменить" : "Подключить"}
                                </button>
                                {isActive && (
                                  <button onClick={() => deleteApiKey(p.id)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10">
                                    <Icon name="Trash2" size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "limits" && (
                <div className="glass rounded-2xl p-6 space-y-3">
                  <h3 className="font-heading font-bold text-foreground mb-2">Лимиты тарифа</h3>
                  <div className="text-sm text-muted-foreground">
                    Тариф: <span className="font-semibold text-foreground">{user.plan || "Бесплатный"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Расширенные лимиты появятся после подключения подписки
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, disabled }: {
  label: string; value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
