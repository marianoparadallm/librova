-- sql/add_mediodia_franja.sql
-- Adds "mediodía" as a valid value for franja in cuidapp_turnos
alter table if exists public.cuidapp_turnos
    drop constraint if exists cuidapp_turnos_franja_check;

alter table if exists public.cuidapp_turnos
    add constraint cuidapp_turnos_franja_check
    check (franja in ('mañana','mediodía','tarde','noche'));
