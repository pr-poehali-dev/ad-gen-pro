import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Campaign, Page } from "@/App";

const platformIcon = { yandex: "🟡", google: "🔵" };
const platformName = { yandex: "Яндекс Директ", google: "Google Ads" };

interface CampaignsProps {
  campaigns: Campaign[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: (name: string, platform: "yandex" | "google", budget: number) => void;
  onNavigate: (page: Page) => void;
}

export default function Campaigns({ campaigns, onToggle, onDelete, onAdd, onNavigate }: CampaignsProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlatform, setNewPlatform] = useState<"yandex" | "google">("yandex");
  const [newBudget, setNewBudget] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = campaigns.filter(c => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: campaigns.length,
    active: campaigns.filter(c => c.status === "active").length,
    paused: campaigns.filter(c => c.status === "paused").length,
    draft: campaigns.filter(c => c.status === "draft").length,
  };

  const handleCreate = () => {
    const name = newName.trim();
    const budget = parseFloat(newBudget);
    if (!name || isNaN(budget) || budget <= 0) return;
    onAdd(name, newPlatform, budget);
    setNewName("");
    setNewBudget("");
    setNewPlatform("yandex");
    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">Рекламные кампании</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление и мониторинг всех кампаний</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-background transition-all hover:scale-105 self-start md:self-auto"
          style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}
        >
          <Icon name="Plus" size={16} />
          Новая кампания
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Всего кампаний", value: counts.all, icon: "Megaphone", color: 'hsl(185,100%,55%)' },
          { label: "Активных", value: counts.active, icon: "Play", color: 'hsl(145,70%,50%)' },
          { label: "На паузе", value: counts.paused, icon: "Pause", color: 'hsl(30,100%,60%)' },
          { label: "Черновики", value: counts.draft, icon: "FileEdit", color: 'hsl(260,80%,65%)' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
              <Icon name={s.icon} size={17} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-heading font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[
          { id: "all", label: `Все (${counts.all})` },
          { id: "active", label: `Активные (${counts.active})` },
          { id: "paused", label: `На паузе (${counts.paused})` },
          { id: "draft", label: `Черновики (${counts.draft})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.id ? "text-background" : "glass text-muted-foreground hover:text-foreground"
            }`}
            style={filter === f.id ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}
          >
            {f.label}
          </button>
        ))}
        <div className="md:ml-auto relative w-full md:w-auto">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск кампаний..."
            className="pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan/50 w-full md:w-52 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
            {search ? `Ничего не найдено по запросу «${search}»` : "Нет кампаний в этой категории"}
          </div>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="glass glass-hover rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{platformIcon[c.platform]}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{platformName[c.platform]} · {c.ads} объявл.</div>
              </div>
            </div>

            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 self-start lg:self-auto ${
              c.status === 'active' ? 'status-active' : c.status === 'paused' ? 'status-paused' : 'status-draft'
            }`}>
              {c.status === 'active' ? 'Активна' : c.status === 'paused' ? 'Пауза' : 'Черновик'}
            </span>

            <div className="w-full lg:w-36 flex-shrink-0">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Бюджет</span>
                <span className="text-foreground font-medium">₽{(c.spent / 1000).toFixed(1)}k / ₽{(c.budget / 1000).toFixed(0)}k</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{
                    width: `${c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0}%`,
                    background: 'linear-gradient(90deg, hsl(185,100%,55%), hsl(260,80%,65%))'
                  }} />
              </div>
            </div>

            <div className="flex items-center gap-6 text-center flex-shrink-0">
              <div>
                <div className="text-xs text-muted-foreground">Показы</div>
                <div className="text-sm font-semibold text-foreground">
                  {c.impressions > 0 ? (c.impressions / 1000).toFixed(0) + 'k' : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Клики</div>
                <div className="text-sm font-semibold text-foreground">
                  {c.clicks > 0 ? (c.clicks / 1000).toFixed(1) + 'k' : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">CTR</div>
                <div className={`text-sm font-semibold ${c.ctr > 0 ? 'metric-up' : 'text-muted-foreground'}`}>
                  {c.ctr > 0 ? c.ctr + '%' : '—'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onToggle(c.id)}
                title={c.status === 'active' ? 'Поставить на паузу' : 'Запустить'}
                className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={c.status === 'active' ? 'Pause' : 'Play'} size={15} />
              </button>
              <button
                onClick={() => onNavigate("export")}
                title="Экспортировать"
                className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="Upload" size={15} />
              </button>
              <button
                onClick={() => setDeleteId(c.id)}
                title="Удалить"
                className="p-2 rounded-xl glass text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-foreground text-lg">Новая кампания</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Название кампании</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Например: Летняя распродажа"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Платформа</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["yandex", "google"] as const).map(p => (
                    <button key={p} onClick={() => setNewPlatform(p)}
                      className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${newPlatform === p ? "text-background" : "glass text-muted-foreground hover:text-foreground"}`}
                      style={newPlatform === p ? { background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' } : {}}>
                      <span>{p === "yandex" ? "🟡" : "🔵"}</span>
                      {p === "yandex" ? "Яндекс Директ" : "Google Ads"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Бюджет (₽)</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={e => setNewBudget(e.target.value)}
                  placeholder="10000"
                  min="1"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || !newBudget}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(200,100%,50%))' }}>
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Icon name="Trash2" size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground">Удалить кампанию?</h2>
                <p className="text-xs text-muted-foreground">«{campaigns.find(c => c.id === deleteId)?.name}»</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Отмена
              </button>
              <button
                onClick={() => { onDelete(deleteId); setDeleteId(null); }}
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