import Icon from "@/components/ui/icon";

export default function LegalDisclaimer() {
  return (
    <div className="px-4 md:px-12 pb-10 pt-2 text-[11px] text-muted-foreground/80 leading-relaxed">
      <div className="max-w-6xl mx-auto rounded-2xl border border-border/40 bg-muted/10 p-4 md:p-5">
        <div className="flex items-start gap-2 mb-2">
          <Icon name="Info" size={14} className="mt-0.5 text-muted-foreground" />
          <strong className="text-foreground/80">Информация о сервисе и реклама</strong>
        </div>
        <p className="mb-2">
          mat-ad.ru — программный сервис, помогающий специалистам готовить и сопровождать рекламные материалы.
          Сервис не оказывает рекламные услуги конечным потребителям, не размещает рекламу самостоятельно
          и не гарантирует достижения каких-либо коммерческих результатов рекламных кампаний (продажи, ROAS, CTR,
          позиции в поисковой выдаче и пр.). Все примеры и числовые ориентиры на сайте — справочные.
        </p>
        <p className="mb-2">
          Рекламодатель самостоятельно несёт ответственность за соответствие размещаемой им рекламы Федеральному
          закону № 38-ФЗ «О рекламе», требованиям маркировки рекламы (ст. 18.1 ФЗ-38, ЕРИР), законодательству
          о защите конкуренции, защите прав потребителей и иным нормативным актам РФ.
        </p>
        <p className="mb-2">
          Информация на сайте не является публичной офертой (ст. 437 ГК РФ). Цены ориентировочные, итоговые условия
          фиксируются в договоре. Обработка персональных данных осуществляется в соответствии с
          ФЗ № 152-ФЗ «О персональных данных» и нашей политикой обработки данных.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-border/30 mt-2">
          <span>© {new Date().getFullYear()} ООО «МАТ-Лабс»</span>
          <span className="text-foreground/70"><strong>mat-ad.ru</strong> — Максимально автоматизированные технологии рекламы</span>
          <span>ИНН / ОГРН: указаны в реквизитах</span>
          <span>hello@mat-ad.ru</span>
        </div>
      </div>
    </div>
  );
}