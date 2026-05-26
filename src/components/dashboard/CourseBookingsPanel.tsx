import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

interface Booking {
  id: string;
  data: string;
  stato: string;
  profiles: { nome: string | null; cognome: string | null; email: string } | null;
  courses: { nome: string } | null;
}

interface CourseGroup {
  corso: string;
  bookings: Booking[];
}

export default function CourseBookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dal, setDal]           = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [al, setAl] = useState(() => new Date().toISOString().split('T')[0]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('course_bookings')
      .select('id, data, stato, profiles(nome, cognome, email), courses(nome)')
      .gte('data', dal)
      .lte('data', al)
      .eq('stato', 'confermata')
      .order('data', { ascending: false });
    setBookings((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [dal, al]);

  // Raggruppa per corso
  const grouped: CourseGroup[] = [];
  for (const b of bookings) {
    const corsoNome = b.courses?.nome ?? 'Corso sconosciuto';
    const existing = grouped.find(g => g.corso === corsoNome);
    if (existing) existing.bookings.push(b);
    else grouped.push({ corso: corsoNome, bookings: [b] });
  }
  grouped.sort((a, b) => b.bookings.length - a.bookings.length);

  const totale = bookings.length;
  const corsiUnici = grouped.length;
  const utentiUnici = new Set(bookings.map(b => b.profiles?.email).filter(Boolean)).size;

  const inputClass = "bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-all";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-xl text-on-surface">Prenotazioni corsi</h2>
        <p className="text-xs text-on-surface-variant mt-1">Visualizza chi si è prenotato, in quale periodo e a quale corso.</p>
      </div>

      {/* Filtro periodo */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-5">
        <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3">Periodo</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant">Dal</label>
            <input type="date" className={inputClass} value={dal} onChange={e => setDal(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant">Al</label>
            <input type="date" className={inputClass} value={al} onChange={e => setAl(e.target.value)} />
          </div>
          {/* Scorciatoie */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Oggi', days: 0 },
              { label: '7 giorni', days: 7 },
              { label: '30 giorni', days: 30 },
              { label: '90 giorni', days: 90 },
            ].map(({ label, days }) => (
              <button key={label} onClick={() => {
                const oggi = new Date();
                setAl(oggi.toISOString().split('T')[0]);
                const inizio = new Date(oggi);
                inizio.setDate(oggi.getDate() - days);
                setDal(inizio.toISOString().split('T')[0]);
              }}
                className="text-xs px-3 py-1.5 rounded-full border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Prenotazioni', value: totale },
          { label: 'Corsi coinvolti', value: corsiUnici },
          { label: 'Partecipanti unici', value: utentiUnici },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-on-surface">{loading ? '—' : value}</p>
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Lista per corso */}
      {loading ? (
        <p className="text-xs text-on-surface-variant text-center py-8">Caricamento...</p>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
            <Users size={20} className="text-on-surface-variant" />
          </div>
          <p className="text-sm font-semibold text-on-surface">Nessuna prenotazione nel periodo selezionato</p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map(group => {
            const isOpen = expanded === group.corso;
            return (
              <div key={group.corso} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-surface-container transition-all"
                  onClick={() => setExpanded(isOpen ? null : group.corso)}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users size={15} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{group.corso}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{group.bookings.length} prenotazion{group.bookings.length === 1 ? 'e' : 'i'}</p>
                  </div>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex-shrink-0">
                    {group.bookings.length}
                  </span>
                  {isOpen ? <ChevronUp size={15} className="text-on-surface-variant flex-shrink-0" /> : <ChevronDown size={15} className="text-on-surface-variant flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-outline-variant/20">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-outline-variant/20">
                          <th className="px-4 py-2 text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Partecipante</th>
                          <th className="px-4 py-2 text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Data lezione</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {group.bookings.map(b => {
                          const nome = b.profiles
                            ? [b.profiles.nome, b.profiles.cognome].filter(Boolean).join(' ') || b.profiles.email
                            : '—';
                          const data = new Date(b.data).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                          return (
                            <tr key={b.id} className="hover:bg-surface-container/50 transition-all">
                              <td className="px-4 py-3">
                                <p className="text-sm text-on-surface">{nome}</p>
                                <p className="text-xs text-on-surface-variant">{b.profiles?.email}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-on-surface-variant">{data}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
