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

// La lezione di prova è l'unico piano da una sola lezione.
export const isLezioneProva = (plan: { lezioni_totali?: number | null } | null | undefined) =>
  (plan?.lezioni_totali ?? 0) === 1;

// Abbonamento ancora utilizzabile: in attesa di attivazione, oppure attivo, non scaduto e con lezioni rimaste.
export function abbonamentoInCorso(sub: {
  stato?: string | null;
  data_scadenza?: string | null;
  lezioni_totali?: number | null;
  lezioni_usate?: number | null;
} | null | undefined): boolean {
  if (!sub) return false;
  if (sub.stato === 'in_attesa') return true;
  if (sub.stato !== 'attivo') return false;
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const oggi = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const nonScaduto = !sub.data_scadenza || sub.data_scadenza >= oggi;
  const lezioniRimaste = (sub.lezioni_usate ?? 0) < (sub.lezioni_totali ?? 0);
  return nonScaduto && lezioniRimaste;
}

export const MSG_PROVA_NON_DISPONIBILE =
  'La lezione di prova è riservata a chi non ha un abbonamento in corso. Per regalarla a un amico o a un parente, chiedigli di registrarsi oppure contatta lo studio: arcadialabyoga@gmail.com';

// Nota salvata sulla prenotazione quando la lezione disdetta apparteneva a un abbonamento
// precedente: la lezione viene restituita sull'abbonamento attuale, così l'admin capisce il conteggio.
export function notaDisdettaAltroAbbonamento(): string {
  const oggi = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Disdetta il ${oggi}: lezione prenotata con un abbonamento precedente, restituita sull'abbonamento attuale.`;
}
