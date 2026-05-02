alter table feeds add column if not exists user_id bigint;
alter table feeds add column if not exists s3_key text default '';
alter table feeds add column if not exists cdn_url text default '';
alter table feeds add column if not exists original_filename varchar(500) default '';
alter table feeds add column if not exists size_bytes bigint default 0;
alter table feeds add column if not exists parse_error text default '';

create index if not exists idx_feeds_user on feeds(user_id);

create table if not exists feed_items (
    id bigserial primary key,
    feed_id bigint not null,
    sku varchar(255) default '',
    name varchar(1000) default '',
    price numeric(12,2) default 0,
    currency varchar(8) default 'RUB',
    category varchar(500) default '',
    vendor varchar(255) default '',
    description text default '',
    url text default '',
    image_url text default '',
    available boolean default true,
    extra jsonb default '{}'::jsonb,
    created_at timestamp not null default now()
);

create index if not exists idx_feed_items_feed on feed_items(feed_id);
create index if not exists idx_feed_items_category on feed_items(category);
