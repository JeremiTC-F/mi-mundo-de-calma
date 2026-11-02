create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text not null default '',
  salon text not null default '',
  rol text not null default 'docente' check (rol in ('docente', 'directora')),
  estado text not null default 'aprobado' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  creado timestamptz not null default now(),
  revisado timestamptz
);
alter table public.perfiles enable row level security;

create or replace function public.es_directora() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'directora' and estado = 'aprobado');
$$;
create or replace function public.esta_aprobado() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and estado = 'aprobado');
$$;

create or replace function public.nuevo_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre, salon)
  values (new.id, new.email,
          left(coalesce(new.raw_user_meta_data ->> 'nombre', ''), 80),
          left(coalesce(new.raw_user_meta_data ->> 'salon', ''), 40))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.nuevo_perfil();

drop policy if exists "ver perfil propio o todos si directora" on public.perfiles;
drop policy if exists "directora actualiza perfiles" on public.perfiles;
create policy "ver perfil propio o todos si directora" on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_directora());
create policy "directora actualiza perfiles" on public.perfiles for update to authenticated
  using (public.es_directora()) with check (public.es_directora());

create table if not exists public.materiales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre text not null,
  tipo text not null default '',
  tamano bigint not null default 0,
  ruta text not null,
  creado timestamptz not null default now()
);
alter table public.materiales enable row level security;

drop policy if exists "ver los propios" on public.materiales;
drop policy if exists "crear los propios" on public.materiales;
drop policy if exists "borrar los propios" on public.materiales;
create policy "ver los propios" on public.materiales for select to authenticated
  using (user_id = auth.uid() and public.esta_aprobado());
create policy "crear los propios" on public.materiales for insert to authenticated
  with check (user_id = auth.uid() and public.esta_aprobado());
create policy "borrar los propios" on public.materiales for delete to authenticated
  using (user_id = auth.uid() and public.esta_aprobado());

insert into storage.buckets (id, name, public, file_size_limit)
values ('materiales', 'materiales', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "materiales: ver propios" on storage.objects;
drop policy if exists "materiales: subir propios" on storage.objects;
drop policy if exists "materiales: borrar propios" on storage.objects;
create policy "materiales: ver propios" on storage.objects for select to authenticated
  using (bucket_id = 'materiales' and (storage.foldername(name))[1] = auth.uid()::text and public.esta_aprobado());
create policy "materiales: subir propios" on storage.objects for insert to authenticated
  with check (bucket_id = 'materiales' and (storage.foldername(name))[1] = auth.uid()::text and public.esta_aprobado());
create policy "materiales: borrar propios" on storage.objects for delete to authenticated
  using (bucket_id = 'materiales' and (storage.foldername(name))[1] = auth.uid()::text and public.esta_aprobado());

create table if not exists public.pines (
  id uuid primary key references auth.users(id) on delete cascade,
  pin text not null,
  actualizado timestamptz not null default now()
);
alter table public.pines enable row level security;
drop policy if exists "pin propio: ver" on public.pines;
drop policy if exists "pin propio: crear" on public.pines;
drop policy if exists "pin propio: cambiar" on public.pines;
create policy "pin propio: ver" on public.pines for select to authenticated using (id = auth.uid());
create policy "pin propio: crear" on public.pines for insert to authenticated with check (id = auth.uid() and public.esta_aprobado());
create policy "pin propio: cambiar" on public.pines for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and public.esta_aprobado());

alter table public.perfiles alter column estado set default 'aprobado';
update public.perfiles set estado = 'aprobado' where estado = 'pendiente';
