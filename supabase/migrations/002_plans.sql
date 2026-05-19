-- ─────────────────────────────────────────────────────────────
-- TABELLA: plans
-- Piani abbonamento gestiti dall'admin (prezzi dinamici)
-- ─────────────────────────────────────────────────────────────
create table public.plans (
  id               uuid default gen_random_uuid() primary key,
  nome             text not null,
  descrizione      text,
  prezzo           numeric(10,2) not null check (prezzo > 0),
  lezioni_totali   integer not null check (lezioni_totali > 0),
  durata_giorni    integer not null check (durata_giorni > 0),
  frequenza_sett   integer check (frequenza_sett between 1 and 7),
  is_attivo        boolean default true,
  ordine           integer default 0,        -- per ordinare i piani nella pagina
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Aggiungi colonna plan_id alla tabella subscriptions esistente
alter table public.subscriptions
  add column if not exists plan_id uuid references public.plans(id),
  add column if not exists stripe_payment_id text,
  add column if not exists stripe_customer_id text;

-- Aggiungi colonna stripe_customer_id alla tabella profiles
alter table public.profiles
  add column if not exists stripe_customer_id text;

-- Trigger: aggiorna updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger plans_updated_at
  before update on public.plans
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.plans enable row level security;

-- Tutti (anche non loggati) possono leggere i piani attivi
create policy "pubblico: legge piani attivi"
  on public.plans for select
  using (is_attivo = true);

-- Admin legge tutti i piani (anche inattivi)
create policy "admin: legge tutti i piani"
  on public.plans for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Solo admin può creare/modificare/eliminare piani
create policy "admin: gestisce i piani"
  on public.plans for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- PIANI DI DEFAULT (puoi modificarli dall'admin)
-- ─────────────────────────────────────────────────────────────
insert into public.plans (nome, descrizione, prezzo, lezioni_totali, durata_giorni, frequenza_sett, ordine) values
  ('1 volta / sett — Mensile',     'Accesso a 1 lezione per settimana',  49,  4,  30, 1, 10),
  ('1 volta / sett — Trimestrale', 'Risparmia € 14 rispetto al mensile', 133, 12, 90, 1, 11),
  ('1 volta / sett — Stagionale',  'Settembre a Maggio — miglior offerta', 380, 36, 270, 1, 12),
  ('2 volte / sett — Mensile',     'Accesso a 2 lezioni per settimana',  80,  8,  30, 2, 20),
  ('2 volte / sett — Trimestrale', 'Risparmia € 27 rispetto al mensile', 213, 24, 90, 2, 21),
  ('2 volte / sett — Stagionale',  'Settembre a Maggio — miglior offerta', 590, 72, 270, 2, 22),
  ('3 volte / sett — Mensile',     'Accesso a 3 lezioni per settimana',  108, 12, 30, 3, 30),
  ('3 volte / sett — Trimestrale', 'Risparmia € 34 rispetto al mensile', 290, 36, 90, 3, 31),
  ('3 volte / sett — Stagionale',  'Settembre a Maggio — miglior offerta', 820, 108, 270, 3, 32),
  ('10 Ingressi',                  'Flessibilità totale. Valido 6 mesi.', 135, 10, 180, null, 40);
