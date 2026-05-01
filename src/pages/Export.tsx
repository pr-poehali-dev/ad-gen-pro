import { useState } from "react";
import Icon from "@/components/ui/icon";

const exportHistory = [
  { id: 1, name: "Зимняя коллекция 2025", platform: "Яндекс Директ", date: "01 Май, 10:22", ads: 48, status: "done" },
  { id: 2, name: "Смартфоны - Март", platform: "Google Ads", date: "29 Апр, 14:05", ads: 32, status: "done" },
  { id: 3, name: "Весенние новинки", platform: "Google Ads", date: "29 Апр, 11:30", ads: 12, status: "error" },
  { id: 4, name: "Новогодние скидки", platform: "Яндекс Директ", date: "28 Апр, 16:18", ads: 90, status: "done" },
];

export default function Export() {
  const [selectedPlatform, setSelectedPlatform] = useState("yandex");
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([1, 2]);

  const toggleCampaign = (id: number) => {
    setSelectedCampaigns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const campaigns = [
    { id: 1, name: "Зимняя коллекция 2025", ads: 48 },
    { id: 2, name: "Смартфоны - Март", ads: 32 },
    { id: 5, name: "Новогодние скидки", ads: 90 },
  ];

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Экспорт кампаний</h1>
        <p className="text-muted-foreground text-sm mt-1">Выгрузите готовые кампании в Яндекс Директ или Google Ads</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Export config */}
        <div className="col-span-2 space-y-5">
          {/* Platform select */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-bold text-foreground mb-4">Платформа назначения</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "yandex", name: "Яндекс Директ", icon: "🟡", desc: "Экспорт через API Директ", color: 'hsl(30,100%,60%)' },
                { id: "google", name: "Google Ads", icon: "🔵", desc: "Экспорт через Google Ads API", color: 'hsl(185,100%,55%)' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`relative p-5 rounded-xl text-left transition-all ${
                    selectedPlatform === p.id
                      ? "border border-transparent"
                      : "glass hover:bg-muted/30"
                  }`}
                  style={selectedPlatform === p.id ? {
                    background: `${p.color}15`,
                    border: `1px solid ${p.color}50`,
                    boxShadow: `0 0 20px ${p.color}15`
                  } : {}}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-heading font-bold text-foreground">{p.name}</span>
                    {selectedPlatform === p.id && (
                      <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: p.color }}>
                        <Icon name="Check" size={12} className="text-background" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign selection */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-foreground">Выберите кампании</h3>
              <span className="text-xs text-muted-foreground">Выбрано: {selectedCampaigns.length}</span>
            </div>
            <div className="space-y-2">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCampaign(c.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                    selectedCampaigns.includes(c.id)
                      ? "border border-neon-cyan/40"
                      : "glass hover:bg-muted/30"
                  }`}
                  style={selectedCampaigns.includes(c.id) ? { background: 'rgba(0,220,230,0.06)' } : {}}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    selectedCampaigns.includes(c.id)
                      ? "bg-neon-cyan"
                      : "border border-border"
                  }`}>
                    {selectedCampaigns.includes(c.id) && (
                      <Icon name="Check" size={12} className="text-background" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.ads} объявлений</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-bold text-foreground mb-4">Параметры экспорта</h3>
            <div className="space-y-3">
              {[
                { label: "Автоматически запустить после экспорта", checked: false },
                { label: "Уведомить об ошибках по email", checked: true },
                { label: "Создать резервную копию перед экспортом", checked: true },
              ].map((opt, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full transition-all flex items-center p-0.5 ${
                    opt.checked ? "bg-neon-cyan" : "bg-muted"
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-background transition-all ${
                      opt.checked ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </div>
                  <span className="text-sm text-foreground group-hover:text-foreground transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-background font-heading font-bold text-base transition-all hover:scale-[1.01] active:scale-95"
            style={{ background: 'linear-gradient(135deg, hsl(30,100%,60%), hsl(320,80%,65%))', boxShadow: '0 8px 30px rgba(255,160,50,0.3)' }}
          >
            <Icon name="Upload" size={20} />
            Экспортировать {selectedCampaigns.length} кампани{selectedCampaigns.length === 1 ? 'ю' : 'и'}
          </button>
        </div>

        {/* History */}
        <div className="glass rounded-2xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="font-heading font-bold text-foreground">История экспортов</h3>
          </div>
          <div className="divide-y divide-border/30">
            {exportHistory.map((h) => (
              <div key={h.id} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-foreground leading-tight">{h.name}</span>
                  <span className={`ml-2 flex-shrink-0 ${h.status === 'done' ? 'text-neon-green' : 'text-destructive'}`}>
                    <Icon name={h.status === 'done' ? 'CheckCircle' : 'XCircle'} size={16} />
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{h.platform}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{h.ads} объявл.</span>
                  <span>{h.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
