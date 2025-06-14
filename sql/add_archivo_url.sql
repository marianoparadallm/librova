-- sql/add_archivo_url.sql
-- Adds column archivo_url to libros table for digital books
alter table if exists public.libros
    add column if not exists archivo_url text;
