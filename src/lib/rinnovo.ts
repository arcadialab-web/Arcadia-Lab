// Data da cui far partire un rinnovo: il webhook Stripe imposta inizio = renewal_from + 1 giorno.
// Se il vecchio abbonamento ha esaurito le lezioni o è già scaduto, si parte da oggi (riferimento = ieri),
// altrimenti si accoda alla scadenza per non far perdere al cliente le lezioni ancora disponibili.
export function dataRiferimentoRinnovo(sub: {
  data_scadenza?: string | null;
  lezioni_totali?: number | null;
  lezioni_usate?: number | null;
} | null | undefined): string | undefined {
  if (!sub?.data_scadenza) return undefined;

  const ieriDate = new Date();
  ieriDate.setDate(ieriDate.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const ieri = `${ieriDate.getFullYear()}-${pad(ieriDate.getMonth() + 1)}-${pad(ieriDate.getDate())}`;

  const lezioniEsaurite = (sub.lezioni_totali ?? 0) > 0 && (sub.lezioni_usate ?? 0) >= (sub.lezioni_totali ?? 0);
  if (lezioniEsaurite || sub.data_scadenza < ieri) return ieri;
  return sub.data_scadenza;
}

// Nota salvata sulla prenotazione quando la lezione disdetta apparteneva a un abbonamento
// precedente: la lezione viene restituita sull'abbonamento attuale, così l'admin capisce il conteggio.
export function notaDisdettaAltroAbbonamento(): string {
  const oggi = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Disdetta il ${oggi}: lezione prenotata con un abbonamento precedente, restituita sull'abbonamento attuale.`;
}
