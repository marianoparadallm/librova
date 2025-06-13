-- sql/create_prestamos.sql
-- Schema for the prestamos table used by LibroVa

-- Table definition
create table if not exists public.prestamos (
    id bigserial primary key,
    libro_id uuid not null references public.libros(id) on delete cascade,
    propietario_id uuid not null references public.usuarios(id),
    prestatario_id uuid not null references public.usuarios(id),
    fecha_prestamo date not null default current_date,
    fecha_limite_devolucion date not null,
    fecha_devolucion date,
    estado text not null check (estado in ('activo','devuelto'))
);

-- Indexes to speed up queries by foreign keys
create index if not exists prestamos_libro_idx on public.prestamos (libro_id);
create index if not exists prestamos_propietario_idx on public.prestamos (propietario_id);
create index if not exists prestamos_prestatario_idx on public.prestamos (prestatario_id);

-- Row Level Security policies
alter table public.prestamos enable row level security;

create policy prestamos_select_policy on public.prestamos
    for select
    using (auth.uid() = propietario_id or auth.uid() = prestatario_id);

create policy prestamos_insert_policy on public.prestamos
    for insert
    with check (auth.uid() = propietario_id or auth.uid() = prestatario_id);

create policy prestamos_update_policy on public.prestamos
    for update
    using (auth.uid() = propietario_id or auth.uid() = prestatario_id);

create policy prestamos_delete_policy on public.prestamos
    for delete
    using (auth.uid() = propietario_id);
