-- ==========================================================================
-- UNLOCK STUDIO // Esquema de Supabase
-- Cópialo y pégalo en:  Supabase → tu proyecto → SQL Editor → New query → Run
-- Crea la tabla de modelos, la lista de admins, la seguridad y el almacén.
-- Es seguro ejecutarlo varias veces (idempotente).
-- ==========================================================================

-- 1) Tabla de modelos ------------------------------------------------------
create table if not exists public.assets (
    id          uuid primary key default gen_random_uuid(),
    slug        text unique not null,
    nombre      text not null,
    tag         text not null,
    img_url     text,
    img_path    text,
    glb_url     text,
    glb_path    text,
    poligonos   text,
    materiales  text,
    peso        text,
    orden       integer default 0,
    created_at  timestamptz default now()
);

-- 2) Admins: quién puede administrar el catálogo ---------------------------
-- Cada persona con su propio correo. Para agregar o quitar un admin, basta un
-- insert / delete en esta tabla — no hay que volver a tocar las políticas.
create table if not exists public.admins (
    email      text primary key,
    created_at timestamptz default now()
);

-- La tabla admins NO es accesible por la API (RLS activo y sin políticas).
-- Solo la función is_admin() la consulta por dentro.
alter table public.admins enable row level security;

-- ¿El usuario de la sesión actual es admin? (SECURITY DEFINER → ignora RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (select 1 from public.admins where email = auth.email());
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 👉 Correos admin. Agrega o quita los que quieras (uno por línea).
insert into public.admins (email) values
    ('jhazieloria@gmail.com'),
    ('andrtarazona11@gmail.com')
    ('dailethblend@gmail.com'),
on conflict (email) do nothing;

-- 3) Seguridad de la tabla de modelos (RLS) --------------------------------
-- Cualquiera puede LEER el catálogo (la web es pública).
-- Solo un ADMIN puede CREAR / EDITAR / BORRAR.
alter table public.assets enable row level security;

drop policy if exists "assets_select_public" on public.assets;
create policy "assets_select_public"
    on public.assets for select
    using (true);

drop policy if exists "assets_write_auth"  on public.assets;
drop policy if exists "assets_write_admin" on public.assets;
create policy "assets_write_admin"
    on public.assets for all
    to authenticated
    using      ( public.is_admin() )
    with check ( public.is_admin() );

-- 4) Almacén de archivos (Storage) -----------------------------------------
-- Bucket público "assets" para los .glb y las fotos.
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;

-- Lectura pública de los archivos.
drop policy if exists "assets_files_read" on storage.objects;
create policy "assets_files_read"
    on storage.objects for select
    using (bucket_id = 'assets');

-- Subir / reemplazar / borrar archivos: solo un ADMIN.
drop policy if exists "assets_files_insert" on storage.objects;
create policy "assets_files_insert"
    on storage.objects for insert
    to authenticated
    with check ( bucket_id = 'assets' and public.is_admin() );

drop policy if exists "assets_files_update" on storage.objects;
create policy "assets_files_update"
    on storage.objects for update
    to authenticated
    using ( bucket_id = 'assets' and public.is_admin() );

drop policy if exists "assets_files_delete" on storage.objects;
create policy "assets_files_delete"
    on storage.objects for delete
    to authenticated
    using ( bucket_id = 'assets' and public.is_admin() );
