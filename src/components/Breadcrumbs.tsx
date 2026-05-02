import { useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Page } from "@/App";

interface PageMeta {
  label: string;
  group?: string;
  groupId?: Page;
  title: string;
  description: string;
}

const pageMeta: Record<Page, PageMeta> = {
  agent: {
    label: "AI-агент",
    title: "mat-ad.ru — AI-агентство digital-маркетинга: контекст, таргет, SEO",
    description: "Digital-агентство с AI-агентом 24/7. ROAS +340%, запуск за 48 часов.",
  },
  insights: {
    label: "Инсайты",
    group: "AI-агентство",
    groupId: "agent",
    title: "AI-инсайты по рекламным кампаниям · mat-ad.ru",
    description: "AI-агент анализирует ваши кампании и находит точки роста в реальном времени.",
  },
  services: {
    label: "Услуги",
    group: "AI-агентство",
    groupId: "agent",
    title: "Услуги digital-маркетинга: контекст, таргет, SEO · mat-ad.ru",
    description: "Контекстная реклама от 35 000 ₽, таргет, SEO, email-маркетинг, автоматизация. Запуск за 48 часов.",
  },
  ai: {
    label: "ИИ-генератор",
    group: "Творчество",
    title: "ИИ-генерация рекламных объявлений · mat-ad.ru",
    description: "Создавайте поисковые объявления, баннеры и товарные креативы за секунды на базе вашего фида.",
  },
  templates: {
    label: "Шаблоны",
    group: "Творчество",
    title: "Шаблоны рекламных объявлений · mat-ad.ru",
    description: "Готовые шаблоны для распродаж, акций, бренда и ретаргетинга — проверены тысячами рекламодателей.",
  },
  feeds: {
    label: "Фиды",
    group: "Творчество",
    title: "Загрузка товарных фидов YML, CSV, Excel · mat-ad.ru",
    description: "Загружайте YML, CSV и Excel-фиды до 50 МБ для генерации объявлений.",
  },
  campaigns: {
    label: "Кампании",
    group: "Управление",
    title: "Рекламные кампании · mat-ad.ru",
    description: "Управление и мониторинг рекламных кампаний в Яндекс Директ и Google Ads.",
  },
  calendar: {
    label: "Календарь",
    group: "Управление",
    title: "Календарь запусков рекламы · mat-ad.ru",
    description: "Планирование запуска кампаний, пауз и отчётов по расписанию.",
  },
  automations: {
    label: "Автоматизации",
    group: "Управление",
    title: "Автоматизации рекламных процессов · mat-ad.ru",
    description: "AI-сценарии 24/7: автопауза, оптимизация ставок, A/B-тесты, минус-слова, алерты в Telegram.",
  },
  dashboard: {
    label: "Дашборд",
    group: "Отчётность",
    title: "Дашборд рекламных кампаний · mat-ad.ru",
    description: "Сводная аналитика по показам, кликам, CTR и расходу по всем платформам.",
  },
  export: {
    label: "Экспорт",
    group: "Отчётность",
    title: "Экспорт кампаний в Яндекс Директ и Google Ads · mat-ad.ru",
    description: "Выгружайте готовые кампании в CSV для Яндекс Директ и Google Ads.",
  },
  settings: {
    label: "Настройки",
    group: "Отчётность",
    title: "Настройки аккаунта · mat-ad.ru",
    description: "Профиль, API-ключи, воркспейсы, лимиты использования.",
  },
};

interface BreadcrumbsProps {
  page: Page;
  onNavigate: (page: Page) => void;
  className?: string;
}

const SITE_URL = "https://mat-ad.ru";

export default function Breadcrumbs({ page, onNavigate, className = "" }: BreadcrumbsProps) {
  const meta = pageMeta[page];

  // Обновляем title, description, canonical и JSON-LD при смене страницы
  useEffect(() => {
    document.title = meta.title;

    let descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.name = "description";
      document.head.appendChild(descTag);
    }
    descTag.content = meta.description;

    const canonicalUrl = page === "agent" ? `${SITE_URL}/` : `${SITE_URL}/${page}`;
    let linkTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkTag) {
      linkTag = document.createElement("link");
      linkTag.rel = "canonical";
      document.head.appendChild(linkTag);
    }
    linkTag.href = canonicalUrl;

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (ogTitle) ogTitle.content = meta.title;
    const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (ogDesc) ogDesc.content = meta.description;
    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (ogUrl) ogUrl.content = canonicalUrl;

    // JSON-LD BreadcrumbList
    const items = [
      { name: "Главная", url: `${SITE_URL}/` },
      ...(meta.group ? [{ name: meta.group, url: meta.groupId ? (meta.groupId === "agent" ? `${SITE_URL}/` : `${SITE_URL}/${meta.groupId}`) : canonicalUrl }] : []),
      { name: meta.label, url: canonicalUrl },
    ];
    const ldData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: it.url,
      })),
    };
    const id = "ld-breadcrumb";
    let scriptTag = document.getElementById(id) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = id;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(ldData);
  }, [page, meta]);

  if (page === "agent") return null;

  return (
    <nav aria-label="Хлебные крошки" className={`flex items-center flex-wrap gap-1.5 text-xs ${className}`}>
      <button onClick={() => onNavigate("agent")}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
        <Icon name="Home" size={12} />
        <span>Главная</span>
      </button>
      {meta.group && (
        <>
          <Icon name="ChevronRight" size={12} className="text-muted-foreground/50" />
          {meta.groupId ? (
            <button onClick={() => meta.groupId && onNavigate(meta.groupId)}
              className="text-muted-foreground hover:text-foreground transition-colors">
              {meta.group}
            </button>
          ) : (
            <span className="text-muted-foreground">{meta.group}</span>
          )}
        </>
      )}
      <Icon name="ChevronRight" size={12} className="text-muted-foreground/50" />
      <span className="text-foreground font-medium" aria-current="page">{meta.label}</span>
    </nav>
  );
}
