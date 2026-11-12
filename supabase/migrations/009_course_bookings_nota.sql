-- Nota sulla prenotazione, usata quando una lezione prenotata con un
-- abbonamento precedente viene disdetta e la lezione viene restituita
-- sull'abbonamento attuale (così l'admin capisce il conteggio lezioni).
alter table public.course_bookings
  add column if not exists nota text;
