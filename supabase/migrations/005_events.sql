-- ─────────────────────────────────────────────────────────────
-- EVENTI SPECIALI
-- ─────────────────────────────────────────────────────────────
create table public.special_events (
  id                        uuid default gen_random_uuid() primary key,
  titolo                    text not null,
  descrizione               text,
  data_evento               timestamptz not null,
  luogo                     text,
  prezzo_base               numeric(10,2) default 0 check (prezzo_base >= 0),
  prezzo_extra_non_abbonato numeric(10,2) default 0 check (prezzo_extra_non_abbonato >= 0),
  posti_totali              integer,
  immagine_url              text,
  is_attivo                 boolean default true,
  created_at                timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- BIGLIETTI EVENTI
-- ─────────────────────────────────────────────────────────────
create table public.event_tickets (
  id                uuid default gen_random_uuid() primary key,
  event_id          uuid references public.special_events(id) on delete cascade not null,
  user_id           uuid references public.profiles(id) on delete set null,
  nome              text not null,
  cognome           text,
  email             text not null,
  telefono          text,
  codice_ref        text not null unique,
  stripe_payment_id text,
  prezzo_pagato     numeric(10,2),
  stato             text default 'confermato' check (stato in ('confermato', 'cancellato', 'presente')),
  is_abbonato       boolean default false,
  created_at        timestamptz default now()
);

create index event_tickets_event_id_idx on public.event_tickets (event_id);
create index event_tickets_user_id_idx  on public.event_tickets (user_id);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.special_events enable row level security;
alter table public.event_tickets   enable row level security;

-- Events: chiunque legge gli eventi attivi
create policy "pubblico legge eventi attivi"
  on public.special_events for select using (is_attivo = true);
create policy "admin legge tutti gli eventi"
  on public.special_events for select using (get_my_role() = 'admin');
create policy "admin gestisce eventi"
  on public.special_events for all using (get_my_role() = 'admin');

-- Tickets: utenti loggati vedono i propri
create policy "utente vede propri biglietti"
  on public.event_tickets for select using (auth.uid() = user_id);
create policy "admin vede tutti i biglietti"
  on public.event_tickets for all using (get_my_role() = 'admin');
-- Service role può inserire biglietti (via webhook)
create policy "service role inserisce biglietti"
  on public.event_tickets for insert with check (true);
