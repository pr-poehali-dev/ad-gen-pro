import { useState } from "react";
import Icon from "@/components/ui/icon";

const tabs = [
  { id: "account", label: "Аккаунт", icon: "User" },
  { id: "api", label: "API ключи", icon: "Key" },
  { id: "tenants", label: "Мультитенант", icon: "Building2" },
  { id: "limits", label: "Лимиты", icon: "Shield" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground text-sm mt-1">Управление аккаунтом, API и параметрами платформы</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 space-y-1 flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              style={activeTab === t.id ? {
                background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))',
                boxShadow: '0 4px 15px rgba(0,220,230,0.25)'
              } : {}}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {activeTab === "account" && (
            <>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-5">Профиль</h3>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-background"
                    style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(320,80%,65%))' }}>
                    АП
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-base">Алексей Петров</div>
                    <div className="text-sm text-muted-foreground">Администратор · Workspace Alpha</div>
                    <button className="text-xs text-neon-cyan hover:underline mt-1">Изменить фото</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Имя", value: "Алексей" },
                    { label: "Фамилия", value: "Петров" },
                    { label: "Email", value: "a.petrov@company.ru" },
                    { label: "Телефон", value: "+7 (900) 123-45-67" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                      <input
                        type="text"
                        defaultValue={f.value}
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-background"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
                >
                  Сохранить изменения
                </button>
              </div>
            </>
          )}

          {activeTab === "api" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-5">API ключи платформ</h3>
              <div className="space-y-4">
                {[
                  { name: "Яндекс Директ API", key: "ya_•••••••••••••••••4f2c", icon: "🟡", status: "ok" },
                  { name: "Google Ads API", key: "AIza•••••••••••••••••Xk8", icon: "🔵", status: "ok" },
                  { name: "OpenAI API (ИИ-генерация)", key: "sk-•••••••••••••••••••••abc", icon: "🤖", status: "ok" },
                  { name: "VK Реклама API", key: "Не подключён", icon: "🟣", status: "empty" },
                ].map((api, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <span className="text-xl flex-shrink-0">{api.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{api.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{api.key}</div>
                    </div>
                    {api.status === 'ok' ? (
                      <span className="status-active text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0">Активен</span>
                    ) : (
                      <span className="status-draft text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0">Не подключён</span>
                    )}
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0">
                      <Icon name="Edit3" size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-background"
                style={{ background: 'linear-gradient(135deg, hsl(260,80%,65%), hsl(290,70%,60%))' }}
              >
                <Icon name="Plus" size={16} />
                Добавить API ключ
              </button>
            </div>
          )}

          {activeTab === "tenants" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-foreground">Воркспейсы / Клиенты</h3>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background"
                  style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
                >
                  <Icon name="Plus" size={15} />
                  Добавить
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Workspace Alpha", role: "Владелец", campaigns: 6, status: "active" },
                  { name: "ООО «ТехноМаркет»", role: "Администратор", campaigns: 12, status: "active" },
                  { name: "ИП Смирнова А.В.", role: "Менеджер", campaigns: 4, status: "active" },
                  { name: "Агентство Digital+", role: "Только чтение", campaigns: 8, status: "pending" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-background flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(${185 + i * 25},80%,55%), hsl(${200 + i * 20},70%,50%))` }}>
                      {t.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role} · {t.campaigns} кампаний</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${
                      t.status === 'active' ? 'status-active' : 'status-paused'
                    }`}>
                      {t.status === 'active' ? 'Активен' : 'Ожидает'}
                    </span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                        <Icon name="Settings" size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
              <h3 className="font-heading font-bold text-foreground mb-5">Лимиты и ресурсы</h3>
              <div className="space-y-5">
                {[
                  { label: "API запросы (месяц)", used: 7240, total: 10000, color: 'hsl(185,100%,55%)' },
                  { label: "Сгенерированных объявлений", used: 2840, total: 5000, color: 'hsl(260,80%,65%)' },
                  { label: "Загруженных фидов", used: 3, total: 10, color: 'hsl(30,100%,60%)' },
                  { label: "Активных кампаний", used: 3, total: 20, color: 'hsl(145,70%,50%)' },
                ].map((lim, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">{lim.label}</span>
                      <span className="text-sm font-bold text-foreground">
                        {lim.used.toLocaleString('ru-RU')} / {lim.total.toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(lim.used / lim.total) * 100}%`,
                          background: lim.color,
                          boxShadow: `0 0 8px ${lim.color}50`
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Осталось: {(lim.total - lim.used).toLocaleString('ru-RU')} ({Math.round((1 - lim.used / lim.total) * 100)}%)
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl border border-neon-cyan/20"
                style={{ background: 'rgba(0,220,230,0.05)' }}>
                <div className="flex items-center gap-3">
                  <Icon name="Zap" size={18} className="text-neon-cyan flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Автомасштабирование включено</div>
                    <div className="text-xs text-muted-foreground">При превышении 90% лимита ресурсы расширяются автоматически</div>
                  </div>
                  <div className="ml-auto w-10 h-5 rounded-full flex items-center p-0.5 flex-shrink-0"
                    style={{ background: 'hsl(185,100%,55%)' }}>
                    <div className="w-4 h-4 rounded-full bg-background translate-x-5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
