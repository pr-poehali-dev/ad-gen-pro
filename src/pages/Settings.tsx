import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { id: "account", label: "Аккаунт", icon: "User" },
  { id: "api", label: "API ключи", icon: "Key" },
  { id: "tenants", label: "Мультитенант", icon: "Building2" },
  { id: "limits", label: "Лимиты", icon: "Shield" },
];

const initialProfile = { firstName: "Алексей", lastName: "Петров", email: "a.petrov@company.ru", phone: "+7 (900) 123-45-67" };

const initialApiKeys = [
  { id: 1, name: "Яндекс Директ API", key: "", masked: "ya_•••••••••••••••••4f2c", icon: "🟡", status: "ok" as const },
  { id: 2, name: "Google Ads API", key: "", masked: "AIza•••••••••••••••••Xk8", icon: "🔵", status: "ok" as const },
  { id: 3, name: "polza.ai API (ИИ-генерация)", key: "", masked: "pk-•••••••••••••••••••••", icon: "🤖", status: "ok" as const },
  { id: 4, name: "VK Реклама API", key: "", masked: "Не подключён", icon: "🟣", status: "empty" as const },
];

const initialTenants = [
  { id: 1, name: "Workspace Alpha", role: "Владелец", campaigns: 6, status: "active" as const },
  { id: 2, name: "ООО «ТехноМаркет»", role: "Администратор", campaigns: 12, status: "active" as const },
  { id: 3, name: "ИП Смирнова А.В.", role: "Менеджер", campaigns: 4, status: "active" as const },
  { id: 4, name: "Агентство Digital+", role: "Только чтение", campaigns: 8, status: "pending" as const },
];

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState(initialProfile);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [tenants, setTenants] = useState(initialTenants);
  const [editingKeyId, setEditingKeyId] = useState<number | null>(null);
  const [editingKeyValue, setEditingKeyValue] = useState("");
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [deleteTenantId, setDeleteTenantId] = useState<number | null>(null);

  const handleSaveProfile = () => {
    toast({ title: "Профиль сохранён", description: `${profile.firstName} ${profile.lastName}` });
  };

  const handleSaveKey = (id: number) => {
    const val = editingKeyValue.trim();
    setApiKeys(prev => prev.map(k => k.id === id ? {
      ...k,
      key: val,
      masked: val ? val.slice(0, 4) + "•".repeat(12) + val.slice(-4) : "Не подключён",
      status: val ? "ok" : "empty"
    } : k));
    toast({ title: "API ключ обновлён" });
    setEditingKeyId(null);
    setEditingKeyValue("");
  };

  const handleAddTenant = () => {
    const name = newTenantName.trim();
    if (!name) return;
    setTenants(prev => [...prev, { id: Date.now(), name, role: "Менеджер", campaigns: 0, status: "pending" }]);
    toast({ title: "Воркспейс добавлен", description: name });
    setNewTenantName("");
    setShowAddTenant(false);
  };

  const handleDeleteTenant = (id: number) => {
    const t = tenants.find(x => x.id === id);
    setTenants(prev => prev.filter(x => x.id !== id));
    if (t) toast({ title: "Воркспейс удалён", description: t.name });
    setDeleteTenantId(null);
  };

  const initials = (profile.firstName[0] || "") + (profile.lastName[0] || "");

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground text-sm mt-1">Управление аккаунтом, API и параметрами платформы</p>
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
          {activeTab === "account" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-5">Профиль</h3>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-background"
                  style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))' }}>
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-base">{profile.firstName} {profile.lastName}</div>
                  <div className="text-sm text-muted-foreground">Администратор · Workspace Alpha</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Имя", key: "firstName" as const },
                  { label: "Фамилия", key: "lastName" as const },
                  { label: "Email", key: "email" as const },
                  { label: "Телефон", key: "phone" as const },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                    <input
                      type="text"
                      value={profile[f.key]}
                      onChange={e => setProfile(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveProfile}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                Сохранить изменения
              </button>
            </div>
          )}

          {activeTab === "api" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-5">API ключи платформ</h3>
              <div className="space-y-4">
                {apiKeys.map((api) => (
                  <div key={api.id} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <span className="text-xl flex-shrink-0">{api.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{api.name}</div>
                        {editingKeyId === api.id ? (
                          <input
                            type="text"
                            value={editingKeyValue}
                            onChange={e => setEditingKeyValue(e.target.value)}
                            placeholder="Вставьте API ключ..."
                            autoFocus
                            className="mt-1 w-full px-3 py-1.5 rounded-lg bg-muted/50 border border-neon-cyan/40 text-xs text-foreground focus:outline-none font-mono"
                          />
                        ) : (
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{api.masked}</div>
                        )}
                      </div>
                      {api.status === 'ok' ? (
                        <span className="status-active text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0">Активен</span>
                      ) : (
                        <span className="status-draft text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0">Не подключён</span>
                      )}
                      {editingKeyId === api.id ? (
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => handleSaveKey(api.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-background transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, hsl(145,70%,50%), hsl(165,70%,45%))' }}>
                            Сохранить
                          </button>
                          <button onClick={() => { setEditingKeyId(null); setEditingKeyValue(""); }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            <Icon name="X" size={15} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingKeyId(api.id); setEditingKeyValue(api.key); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0">
                          <Icon name="Edit3" size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tenants" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h3 className="font-heading font-bold text-foreground">Воркспейсы / Клиенты</h3>
                <button onClick={() => setShowAddTenant(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105 self-start sm:self-auto"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                  <Icon name="Plus" size={15} />
                  Добавить
                </button>
              </div>
              <div className="space-y-3">
                {tenants.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-background flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(${185 + i * 25},80%,55%), hsl(${200 + i * 20},70%,50%))` }}>
                      {t.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role} · {t.campaigns} кампаний</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${t.status === 'active' ? 'status-active' : 'status-paused'}`}>
                      {t.status === 'active' ? 'Активен' : 'Ожидает'}
                    </span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setDeleteTenantId(t.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "limits" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-5">Лимиты использования</h3>
              <div className="space-y-5">
                {[
                  { label: "API запросы", used: 7240, total: 10000, color: 'hsl(185,100%,55%)' },
                  { label: "Сгенерированные объявления", used: 2840, total: 5000, color: 'hsl(260,80%,65%)' },
                  { label: "Загруженные фиды", used: 3, total: 10, color: 'hsl(30,100%,60%)' },
                  { label: "Активные кампании", used: 3, total: 20, color: 'hsl(145,70%,50%)' },
                ].map((l, i) => {
                  const pct = Math.round((l.used / l.total) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-foreground font-medium">{l.label}</span>
                        <span className="text-xs text-muted-foreground">{l.used.toLocaleString("ru-RU")} / {l.total.toLocaleString("ru-RU")} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: l.color, boxShadow: `0 0 8px ${l.color}50` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-5 border-t border-border/50 flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(145,70%,50%)20' }}>
                  <Icon name="Zap" size={16} style={{ color: 'hsl(145,70%,50%)' }} />
                </div>
                <span className="text-muted-foreground">Автомасштабирование при <strong className="text-foreground">90%</strong> использования</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-foreground">Добавить воркспейс</h2>
              <button onClick={() => setShowAddTenant(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Название</label>
              <input
                type="text"
                value={newTenantName}
                onChange={e => setNewTenantName(e.target.value)}
                placeholder="Например: ООО Ромашка"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddTenant(false)}
                className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button onClick={handleAddTenant} disabled={!newTenantName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTenantId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Icon name="Trash2" size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground">Удалить воркспейс?</h2>
                <p className="text-xs text-muted-foreground">«{tenants.find(t => t.id === deleteTenantId)?.name}»</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTenantId(null)}
                className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button onClick={() => handleDeleteTenant(deleteTenantId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, hsl(0,80%,55%), hsl(15,80%,50%))' }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}