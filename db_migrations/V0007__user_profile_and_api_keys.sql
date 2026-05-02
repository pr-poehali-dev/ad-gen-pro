-- Поля для профиля (имя/фамилия/телефон уже частично есть)
alter table users add column if not exists first_name varchar(255) default '';
alter table users add column if not exists last_name varchar(255) default '';

-- Таблица API-ключей пользователя для подключения внешних рекламных платформ
create table if not exists user_api_keys (
    id bigserial primary key,
    user_id bigint not null,
    provider varchar(32) not null,
    -- yandex_direct, google_ads, polza_ai, vk_ads
    api_key text not null default '',
    extra jsonb default '{}'::jsonb,
    is_active boolean default true,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create unique index if not exists idx_user_api_keys_unique on user_api_keys(user_id, provider);
create index if not exists idx_user_api_keys_user on user_api_keys(user_id);
