import { useState, useEffect } from "react";

export const heroImage = "https://cdn.poehali.dev/projects/2fe697dc-410b-4779-b502-87140077fedf/files/2ecce010-34af-497b-aed5-8884101224bb.jpg";

export const integrations = [
  { name: "Яндекс Директ", icon: "MousePointerClick", color: "hsl(50,100%,55%)" },
  { name: "VK Реклама", icon: "Users", color: "hsl(210,80%,55%)" },
  { name: "MyTarget", icon: "Target", color: "hsl(15,90%,60%)" },
  { name: "Telegram Ads", icon: "Send", color: "hsl(200,90%,55%)" },
  { name: "Яндекс Метрика", icon: "BarChart3", color: "hsl(0,80%,60%)" },
  { name: "Google Analytics", icon: "LineChart", color: "hsl(30,100%,55%)" },
  { name: "AmoCRM", icon: "Database", color: "hsl(190,80%,50%)" },
  { name: "Bitrix24", icon: "Building2", color: "hsl(195,90%,50%)" },
  { name: "Google Sheets", icon: "Table", color: "hsl(145,70%,50%)" },
  { name: "1С", icon: "FileSpreadsheet", color: "hsl(50,100%,50%)" },
  { name: "Mailchimp", icon: "Mail", color: "hsl(45,100%,55%)" },
  { name: "Wildberries", icon: "ShoppingBag", color: "hsl(320,80%,60%)" },
  { name: "Ozon", icon: "Package", color: "hsl(220,90%,60%)" },
  { name: "Tilda", icon: "Globe", color: "hsl(185,100%,50%)" },
  { name: "WordPress", icon: "Newspaper", color: "hsl(210,15%,30%)" },
  { name: "API", icon: "Code2", color: "hsl(260,80%,65%)" },
];

export const cases = [
  {
    client: "Магазин электроники",
    industry: "E-commerce",
    color: "hsl(185,100%,55%)",
    challenge: "Рутинная подготовка сотен объявлений и долгое тестирование креативов",
    solution: "ИИ-генерация вариантов и шаблоны для пакетной выгрузки",
    metrics: [
      { label: "Время на подготовку", value: "−70%" },
      { label: "Вариантов креативов", value: "240" },
      { label: "Каналов запуска", value: "3" },
    ],
    quote: "Раньше команда тратила на подготовку 4 дня — теперь укладываемся в один.",
    author: "Маркетолог",
  },
  {
    client: "Подписочный сервис",
    industry: "Beauty / DTC",
    color: "hsl(320,80%,65%)",
    challenge: "Сложно вручную сегментировать базу и поддерживать email-цепочки",
    solution: "Шаблоны автоворонок и сегменты в одном кабинете",
    metrics: [
      { label: "Сегментов", value: "8" },
      { label: "Шаблонов писем", value: "12" },
      { label: "Время запуска", value: "−60%" },
    ],
    quote: "Шаблоны и сегменты в одном окне — больше не теряем подписчиков по дороге.",
    author: "Email-маркетолог",
  },
  {
    client: "Производитель инструмента",
    industry: "B2B",
    color: "hsl(30,100%,60%)",
    challenge: "SEO и контекст по low-funnel запросам тянули команду в разные стороны",
    solution: "Единое место для задач, шаблонов и фидов с приоритизацией",
    metrics: [
      { label: "Шаблонов задач", value: "30+" },
      { label: "Фидов в работе", value: "5" },
      { label: "Каналов", value: "4" },
    ],
    quote: "Команда наконец видит общий план работ и не дублирует задачи.",
    author: "Руководитель проекта",
  },
];

export const faq = [
  {
    q: "Сервис сам размещает рекламу?",
    a: "Нет. Сервис помогает готовить материалы — генерирует варианты текстов, шаблоны, фиды и сценарии автоматизации. Все решения и размещение в рекламных системах принимает пользователь.",
  },
  {
    q: "С какими рекламными системами работает?",
    a: "Поддерживаем работу с Яндекс Директ, VK Рекламой, MyTarget, Telegram Ads. Также есть интеграции с Метрикой, GA, AmoCRM, Bitrix24, Google Sheets, маркетплейсами и API для своих систем.",
  },
  {
    q: "Можно ли попробовать бесплатно?",
    a: "Да. После регистрации доступен ознакомительный период с базовыми возможностями ИИ-генератора и шаблонов. Платные тарифы открывают пакетную работу, автоматизации и продвинутые отчёты.",
  },
  {
    q: "Кому подходит сервис?",
    a: "Маркетологам и специалистам по рекламе, агентствам, in-house командам, e-commerce и B2B. Для тех, кто работает с большим количеством объявлений, фидов и сценариев — особенно полезно.",
  },
  {
    q: "Что с безопасностью данных?",
    a: "Данные хранятся на защищённых серверах, доступ к кабинету по паролю и сессиям. Сервис не передаёт ваши фиды и материалы третьим лицам. Сторонние API подключаются только по вашему явному согласию.",
  },
  {
    q: "Как считается стоимость?",
    a: "Тарифы фиксированные, по подписке. Подробности — на странице тарифов. Можно сменить тариф в любой момент.",
  },
];

export const useCounter = (target: number, duration = 1500) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p === 1) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [target, duration]);
  return v;
};
