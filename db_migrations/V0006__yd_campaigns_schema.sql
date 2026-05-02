create table if not exists yd_campaigns (
    id bigserial primary key,
    user_id bigint,
    name varchar(255) not null,
    campaign_type varchar(32) not null default 'text',
    status varchar(16) not null default 'draft',
    strategy_type varchar(48) not null default 'manual_cpc',
    strategy_settings jsonb not null default '{}'::jsonb,
    daily_budget numeric(12,2) default 0,
    weekly_budget numeric(12,2) default 0,
    currency varchar(8) default 'RUB',
    counter_id varchar(32) default '',
    counter_goals text default '',
    schedule jsonb default '{}'::jsonb,
    regions jsonb default '[]'::jsonb,
    negative_keywords text default '',
    utm_template text default '',
    notes text default '',
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    step int default 1
);

create index if not exists idx_yd_campaigns_user on yd_campaigns(user_id);
create index if not exists idx_yd_campaigns_status on yd_campaigns(status);

create table if not exists yd_ad_groups (
    id bigserial primary key,
    campaign_id bigint not null,
    name varchar(255) not null,
    geo jsonb default '[]'::jsonb,
    devices jsonb default '[]'::jsonb,
    audience_targets jsonb default '[]'::jsonb,
    sort_order int default 0,
    created_at timestamp not null default now()
);
create index if not exists idx_yd_ad_groups_campaign on yd_ad_groups(campaign_id);

create table if not exists yd_ads (
    id bigserial primary key,
    group_id bigint not null,
    ad_type varchar(32) not null default 'text',
    title1 varchar(56) not null default '',
    title2 varchar(30) default '',
    body varchar(81) not null default '',
    display_url varchar(20) default '',
    href text default '',
    image_url text default '',
    sitelinks jsonb default '[]'::jsonb,
    callouts jsonb default '[]'::jsonb,
    sort_order int default 0,
    created_at timestamp not null default now()
);
create index if not exists idx_yd_ads_group on yd_ads(group_id);

create table if not exists yd_keywords (
    id bigserial primary key,
    group_id bigint not null,
    phrase varchar(4096) not null,
    bid numeric(10,2) default 0,
    match_type varchar(16) default 'broad',
    created_at timestamp not null default now()
);
create index if not exists idx_yd_keywords_group on yd_keywords(group_id);
