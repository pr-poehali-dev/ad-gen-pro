-- Расписание событий по кампаниям (запуск/пауза/отчёт)
create table if not exists schedule_events (
    id bigserial primary key,
    user_id bigint not null,
    campaign_id bigint,
    -- ссылка на yd_campaigns.id, может быть null если событие общее
    event_date date not null,
    event_time time not null default '12:00:00',
    action varchar(16) not null default 'launch',
    -- launch, pause, report, custom
    title varchar(255) default '',
    notes text default '',
    done boolean default false,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index if not exists idx_schedule_user on schedule_events(user_id);
create index if not exists idx_schedule_date on schedule_events(event_date);
create index if not exists idx_schedule_campaign on schedule_events(campaign_id);
