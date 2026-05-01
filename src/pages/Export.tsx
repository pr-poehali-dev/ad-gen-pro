import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Campaign, ExportRecord } from "@/App";

interface ExportProps {
  campaigns: Campaign[];
  exportHistory: ExportRecord[];
  onExport: (campaignIds: number[], platform: string) => void;
}

export default function Export({ campaigns, exportHistory, onExport }: ExportProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("yandex");
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [options, setOptions] = useState({ autoStart: false, notifyEmail: true, backup: true });
  const [isExporting, setIsExporting] = useState(false);

  const toggleCampaign = (id: number) => {
    setSelectedCampaigns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedCampaigns.length === campaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(campaigns.map(c => c.id));
    }
  };

  const platformName = selectedPlatform === "yandex" ? "Яндекс Директ" : "Google Ads";

  const handleExport = async () => {
    if (selectedCampaigns.length === 0) return;
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1200));
    onExport(selectedCampaigns, platformName);
    setSelectedCampaigns([]);
    setIsExporting(false);
  };

  const totalAds = campaigns.filter(c => selectedCampaigns.includes(c.id)).reduce((s, c) => s + c.ads, 0);

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Экспорт кампаний</h1>
        <p className="text-muted-foreground text-sm mt-1">Выгрузите готовые кампании в Яндекс Директ или Google Ads</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-bold text-foreground mb-4">Платформа назначения</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "yandex", name: "Яндекс Директ", icon: "🟡", desc: "Экспорт через API Директ", color: 'hsl(30,100%,60%)' },
                { id: "google", name: "Google Ads", icon: "🔵", desc: "Экспорт через Google Ads API", color: 'hsl(185,100%,55%)' },
              ].map((p) => (
                <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                  className={`relative p-5 rounded-xl text-left transition-all ${selectedPlatform === p.id ? "border border-transparent" : "glass hover:bg-muted/30"}`}
                  style={selectedPlatform === p.id ? { background: `${p.color}15`, border: `1px solid ${p.color}50`, boxShadow: `0 0 20px ${p.color}15` } : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-heading font-bold text-foreground">{p.name}</span>
                    {selectedPlatform === p.id && (
                      <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: p.color }}>
                        <Icon name="Check" size={12} className="text-background" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-foreground">Выберите кампании</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Выбрано: {selectedCampaigns.length}</span>
                {campaigns.length > 0 && (
                  <button onClick={toggleAll} className="text-xs text-neon-cyan hover:underline">
                    {selectedCampaigns.length === campaigns.length ? "Снять все" : "Выбрать все"}
                  </button>
                )}
              </div>
            </div>
            {campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Нет кампаний. Создайте кампании в разделе «Кампании».</p>
            ) : (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <button key={c.id} onClick={() => toggleCampaign(c.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${selectedCampaigns.includes(c.id) ? "border border-neon-cyan/40" : "glass hover:bg-muted/30"}`}
                    style={selectedCampaigns.includes(c.id) ? { background: 'rgba(0,220,230,0.06)' } : {}}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${selectedCampaigns.includes(c.id) ? "bg-neon-cyan" : "border border-border"}`}>
                      {selectedCampaigns.includes(c.id) && <Icon name="Check" size={12} className="text-background" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.ads} объявлений · {c.platform === "yandex" ? "Яндекс" : "Google"}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 ${c.status === 'active' ? 'status-active' : c.status === 'paused' ? 'status-paused' : 'status-draft'}`}>
                      {c.status === 'active' ? 'Активна' : c.status === 'paused' ? 'Пауза' : 'Черновик'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-bold text-foreground mb-4">Параметры экспорта</h3>
            <div className="space-y-3">
              {[
                { key: "autoStart" as const, label: "Автоматически запустить после экспорта" },
                { key: "notifyEmail" as const, label: "Уведомить об ошибках по email" },
                { key: "backup" as const, label: "Создать резервную копию перед экспортом" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                    className={`w-10 h-5 rounded-full transition-all flex items-center p-0.5 ${options[opt.key] ? "bg-neon-cyan" : "bg-muted"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-background transition-all ${options[opt.key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={selectedCampaigns.length === 0 || isExporting}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-background font-heading font-bold text-base transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, hsl(30,100%,60%), hsl(320,80%,65%))', boxShadow: '0 8px 30px rgba(255,160,50,0.3)' }}
          >
            {isExporting ? (
              <><Icon name="Loader" size={20} className="animate-spin" />Экспортирую...</>
            ) : (
              <>
                <Icon name="Upload" size={20} />
                {selectedCampaigns.length === 0
                  ? "Выберите кампании"
                  : `Экспортировать ${selectedCampaigns.length} кампани${selectedCampaigns.length === 1 ? 'ю' : 'и'} · ${totalAds} объявл.`}
              </>
            )}
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-heading font-bold text-foreground">История экспортов</h3>
            <span className="text-xs text-muted-foreground">{exportHistory.length}</span>
          </div>
          {exportHistory.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">История пуста</div>
          ) : (
            <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
              {exportHistory.map((h) => (
                <div key={h.id} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-foreground leading-tight truncate flex-1 mr-2">{h.name}</span>
                    <span className={`flex-shrink-0 ${h.status === 'done' ? 'text-neon-green' : 'text-destructive'}`}>
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
          )}
        </div>
      </div>
    </div>
  );
}
