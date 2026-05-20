-- Tessera associativa annuale
alter table public.profiles
  add column if not exists tessera_scadenza date;

-- Indice per query veloci su scadenza tessera
create index if not exists profiles_tessera_scadenza_idx
  on public.profiles (tessera_scadenza);
