-- Расширяем user_api_keys для хранения OAuth-данных Яндекса
-- (refresh_token, expires_at, scope, account_login)
alter table user_api_keys add column if not exists refresh_token text default '';
alter table user_api_keys add column if not exists token_expires_at timestamp;
alter table user_api_keys add column if not exists scope varchar(500) default '';
alter table user_api_keys add column if not exists account_login varchar(255) default '';

-- Поля для отправки кампании в ЯД
alter table yd_campaigns add column if not exists yd_external_id varchar(64) default '';
alter table yd_campaigns add column if not exists yd_sent_at timestamp;
alter table yd_campaigns add column if not exists yd_sync_error text default '';
alter table yd_campaigns add column if not exists yd_last_stats_at timestamp;
alter table yd_campaigns add column if not exists yd_stats jsonb default '{}'::jsonb;

-- Лог отправок и синхронизаций
create table if not exists yd_api_logs (
    id bigserial primary key,
    user_id bigint not null,
    campaign_id bigint,
    operation varchar(32) not null default 'send',
    -- send, fetch_stats, oauth_connect, oauth_refresh
    success boolean default false,
    response_code integer,
    error_message text default '',
    request_summary text default '',
    created_at timestamp not null default now()
);

create index if not exists idx_yd_api_logs_user on yd_api_logs(user_id);
create index if not exists idx_yd_api_logs_campaign on yd_api_logs(campaign_id);
create index if not exists idx_yd_api_logs_date on yd_api_logs(created_at);
