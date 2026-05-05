import Icon from "@/components/ui/icon";
import { Service, RequestForm } from "./types";

interface RequestModalProps {
  activeService: Service | null;
  form: RequestForm;
  setForm: React.Dispatch<React.SetStateAction<RequestForm>>;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RequestModal({ activeService, form, setForm, submitting, onClose, onSubmit }: RequestModalProps) {
  if (!activeService) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={() => !submitting && onClose()}>
      <div onClick={e => e.stopPropagation()}
        className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${activeService.color}20`, border: `1px solid ${activeService.color}40` }}>
              <Icon name={activeService.icon} size={20} style={{ color: activeService.color }} />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-foreground text-base">Заявка на услугу</h2>
              <div className="text-xs text-muted-foreground truncate">{activeService.title} · {activeService.price}</div>
            </div>
          </div>
          <button onClick={onClose} disabled={submitting}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ваше имя *</label>
            <input type="text" value={form.name} autoFocus
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Иван Иванов"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Телефон</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@company.ru"
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Комментарий</label>
            <textarea value={form.comment} rows={3}
              onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
              placeholder="Кратко опишите задачу или бюджет"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Отмена
          </button>
          <button onClick={onSubmit} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(185,100%,55%), hsl(260,80%,65%))' }}>
            {submitting ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
            {submitting ? "Отправка..." : "Отправить заявку"}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
        </p>
      </div>
    </div>
  );
}
