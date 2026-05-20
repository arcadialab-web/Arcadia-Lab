-- ─────────────────────────────────────────────────────────────
-- CORSI RICORRENTI
-- giorno_settimana: 0=Dom, 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab
-- ─────────────────────────────────────────────────────────────
create table public.courses (
  id                 uuid default gen_random_uuid() primary key,
  nome               text not null,
  descrizione        text,
  giorno_settimana   integer not null check (giorno_settimana between 0 and 6),
  ora_inizio         time not null,
  ora_fine           time not null,
  posti_max          integer default 15,
  colore             text default '#b56a56',
  is_attivo          boolean default true,
  created_at         timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- DATE CANCELLATE (eccezioni al calendario ricorrente)
-- ─────────────────────────────────────────────────────────────
create table public.course_exceptions (
  id         uuid default gen_random_uuid() primary key,
  course_id  uuid references public.courses(id) on delete cascade not null,
  data       date not null,
  motivo     text,
  created_at timestamptz default now(),
  unique(course_id, data)
);

-- ─────────────────────────────────────────────────────────────
-- PRENOTAZIONI AI CORSI
-- ─────────────────────────────────────────────────────────────
create table public.course_bookings (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  course_id       uuid references public.courses(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id),
  data            date not null,
  stato           text default 'confermata' check (stato in ('confermata', 'cancellata')),
  created_at      timestamptz default now(),
  unique(user_id, course_id, data)
);

-- ─────────────────────────────────────────────────────────────
-- AGGIORNA PROFILES
-- ─────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists prenotazioni_sbloccate boolean default false,
  add column if not exists certificato_ricevuto_at timestamptz;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.courses           enable row level security;
alter table public.course_exceptions enable row level security;
alter table public.course_bookings   enable row level security;

-- Courses
create policy "tutti leggono corsi attivi"
  on public.courses for select using (is_attivo = true);
create policy "admin legge tutti i corsi"
  on public.courses for select using (get_my_role() = 'admin');
create policy "admin gestisce corsi"
  on public.courses for all using (get_my_role() = 'admin');

-- Exceptions
create policy "tutti leggono eccezioni"
  on public.course_exceptions for select using (true);
create policy "admin gestisce eccezioni"
  on public.course_exceptions for all using (get_my_role() = 'admin');

-- Course bookings
create policy "utente legge proprie prenotazioni"
  on public.course_bookings for select using (auth.uid() = user_id);
create policy "utente prenota"
  on public.course_bookings for insert with check (auth.uid() = user_id);
create policy "utente aggiorna propria prenotazione"
  on public.course_bookings for update using (auth.uid() = user_id);
create policy "admin gestisce tutte le prenotazioni corsi"
  on public.course_bookings for all using (get_my_role() = 'admin');

-- ─────────────────────────────────────────────────────────────
-- CORSI DI DEFAULT
-- ─────────────────────────────────────────────────────────────
insert into public.courses (nome, descrizione, giorno_settimana, ora_inizio, ora_fine, colore) values
  ('Vinyasa Foundations',   'Flusso dinamico adatto a tutti i livelli',    2, '19:30', '20:30', '#b56a56'),
  ('Katonah Yoga Inspired', 'Pratica che integra geometria e archetipi',   3, '19:00', '20:00', '#8ba888'),
  ('Vinyasa Expansion',     'Sequenze avanzate per praticanti esperti',    4, '19:00', '20:00', '#c4a882');
