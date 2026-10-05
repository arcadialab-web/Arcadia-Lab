-- ─────────────────────────────────────────────────────────────
-- POSTI DISPONIBILI PER LEZIONE
-- Funzione che restituisce SOLO il conteggio aggregato delle
-- prenotazioni confermate per corso/data (mai dati dei singoli
-- utenti), così un utente può vedere i posti rimasti su una
-- lezione senza poter leggere le prenotazioni altrui (bloccate
-- dalle policy RLS su course_bookings).
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_posti_prenotati()
returns table (course_id uuid, data date, prenotati bigint)
language sql
security definer
set search_path = public
as $$
  select course_id, data, count(*) as prenotati
  from public.course_bookings
  where stato = 'confermata'
    and data >= current_date
  group by course_id, data;
$$;

grant execute on function public.get_posti_prenotati() to authenticated;

-- Impostazione admin per attivare/disattivare la visualizzazione
insert into public.site_settings (key, value)
values ('mostra_posti_disponibili', 'true')
on conflict (key) do nothing;
