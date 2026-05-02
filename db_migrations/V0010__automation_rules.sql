-- Правила автоматизации управления ставками и кампаниями
create table if not exists automation_rules (
    id bigserial primary key,
    user_id bigint not null,
    name varchar(255) not null,
    description text default '',
    rule_type varchar(32) not null default 'bid_adjust',
    -- bid_adjust, pause_campaign, alert, add_negative
    enabled boolean default true,
    target_scope varchar(16) default 'all',
    -- all, campaign, group
    target_campaign_id bigint,
    metric varchar(32) not null default 'ctr',
    -- ctr, cpc, cpa, spend, impressions, clicks, conversions, position
    operator varchar(8) not null default '<',
    -- <, <=, >, >=, ==, !=
    threshold numeric(14,4) default 0,
    period varchar(16) default '7d',
    -- 1d, 3d, 7d, 14d, 30d
    action_type varchar(32) not null default 'notify',
    -- notify, decrease_bid, increase_bid, pause, set_bid
    action_value numeric(10,2) default 0,
    notify_email boolean default true,
    notify_telegram boolean default false,
    last_run_at timestamp,
    runs_count integer default 0,
    triggers_count integer default 0,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index if not exists idx_automation_user on automation_rules(user_id);
create index if not exists idx_automation_enabled on automation_rules(enabled);

-- Журнал срабатываний автоматизаций
create table if not exists automation_runs (
    id bigserial primary key,
    rule_id bigint not null,
    user_id bigint not null,
    triggered boolean not null default false,
    target_label varchar(500) default '',
    metric_value numeric(14,4) default 0,
    action_taken varchar(255) default '',
    details text default '',
    created_at timestamp not null default now()
);

create index if not exists idx_automation_runs_rule on automation_runs(rule_id);
create index if not exists idx_automation_runs_user on automation_runs(user_id);
create index if not exists idx_automation_runs_date on automation_runs(created_at);
