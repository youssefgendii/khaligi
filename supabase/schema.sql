-- ============================================================
-- Al Khalejia Fashion — two-table schema
-- products  : items you sell
-- orders    : customer info + what they ordered
-- ============================================================

-- ── helpers ─────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. PRODUCTS ──────────────────────────────────────────────────────────────

create table if not exists public.products (
  id               uuid primary key default uuid_generate_v4(),
  product_code     text not null unique,
  name             text not null,
  slug             text not null unique,
  description      text,
  image_url        text,
  price            numeric(10,2) not null check (price >= 0),
  sale_price       numeric(10,2)        check (sale_price is null or sale_price >= 0),
  stock_quantity   integer not null default 0 check (stock_quantity >= 0),
  available_sizes  text[] not null default '{}',
  available_colors text[] not null default '{}',
  category         text,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  is_new_arrival   boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists products_is_active_idx    on public.products(is_active);
create index if not exists products_is_featured_idx  on public.products(is_featured);
create index if not exists products_slug_idx         on public.products(slug);
create index if not exists products_created_at_idx   on public.products(created_at desc);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (is_active = true);

-- ── 2. ORDERS ────────────────────────────────────────────────────────────────
-- One row per order. Items are stored as a JSONB array (no separate table needed).

create table if not exists public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  order_number        text not null unique,
  -- customer info
  customer_name       text not null,
  customer_phone      text not null,
  customer_email      text,
  -- delivery address
  address             text not null,
  city                text not null,
  notes               text,
  -- items snapshot: [{product_id, name, code, image_url, size, color, price, qty}]
  items               jsonb not null default '[]',
  -- totals
  subtotal            numeric(10,2) not null check (subtotal >= 0),
  delivery_fee        numeric(10,2) not null default 50,
  total               numeric(10,2) not null check (total >= 0),
  -- status
  status              text not null default 'pending'
    check (status in ('pending','confirmed','out_for_delivery','delivered','cancelled')),
  payment_method      text not null default 'cash_on_delivery',
  admin_notes         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists orders_status_idx     on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_phone_idx      on public.orders(customer_phone);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
-- orders readable only via service role (admin API) — no public read policy

-- ── 3. IMAGE STORAGE BUCKET ──────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products', 'products', true, 8388608,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "products_bucket_public_read" on storage.objects;
create policy "products_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'products');
