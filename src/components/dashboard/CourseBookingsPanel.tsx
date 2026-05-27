import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, ChevronDown, ChevronUp, Check, X, Filter, RefreshCw } from 'lucide-react';

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

const STATO_STYLE: Record<string, { row: string; badge: string; label: string }> = {
  confermata: { row: '', badge: 'bg-primary/10 text-primary', label: 'Confermata' },
  presente:   { row: 'bg-green-50', badge: 'bg-green-100 text-green-700', label: 'Presente' },
  assente:    { row: 'bg-red-50',   badge: 'bg-red-100 text-red-600',     label: 'Assente' },
};

export default function CourseBookingsPanel() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [dal, setDal]             = useState('');
  const [al, setAl]               = useState('');
  const [expanded, setExpanded]   = useState<string | null>(null);

  const load = async (from?: string, to?: string) => {
    setLoading(true);
    let q = supabase
      .from('course_bookings')
      .select('id, data, stato, profiles(nome, cognome, email), courses(nome)')
      .in('stato', ['confermata', 'presente', 'assente'])
      .order('data', { ascending: false });
    if (from) q = q.gte('data', from);
    if (to)   q = q.lte('data', to);
    const { data } = await q;
    setBookings((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const applyFilter = () => load(dal || undefined, al || undefined);
  const clearFilter = () => { setDal(''); setAl(''); load(); };

  const setStato = async (id: string, nuovoStato: string) => {
    await supabase.from('course_bookings').update({ stato: nuovoStato }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, stato: nuovoStato } : b));
  };

  const grouped: CourseGroup[] = [];
  for (const b of bookings) {
    const corsoNome = b.courses?.nome ?? 'Corso sconosciuto';
    const ex = grouped.find(g => g.corso === corsoNome);
    if (ex) ex.bookings.push(b);
    else grouped.push({ corso: corsoNome, bookings: [b] });
  }
  grouped.sort((a, b) => b.bookings.length - a.bookings.length);

  const totale      = bookings.length;
  const presenti    = bookings.filter(b => b.stato === 'presente').length;
  const corsiUnici  = grouped.length;
  const utentiUnici = new Set(bookings.map(b => b.profiles?.email).filter(Boolean)).size;
  const isFiltered  = dal || al;

  const inp = "bg-white border border-outline-variant/40 rounded-2xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all w-full";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-xl text-on-surface">Prenotazioni corsi</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Tutte le prenotazioni · conferma presenze</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilter(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all ${showFilter || isFiltered ? 'bg-primary text-white border-primary' : 'border-outline-variant/40 text-on-surface-variant hover:text-on-surface'}`}
          >
            <Filter size={13} />
            {isFiltered ? 'Filtro attivo' : 'Filtra'}
          </button>
          <button onClick={() => load(dal || undefined, al || undefined)} className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs border border-outline-variant/40 text-on-surface-variant hover:text-on-surface transition-all">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Filtro collassabile */}
      {showFilter && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-4 space-y-3">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Filtra per data lezione</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1 block">Dal</label>
              <input type="date" className={inp} value={dal} onChange={e => setDal(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1 block">Al</label>
              <input type="date" className={inp} value={al} onChange={e => setAl(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Oggi',     fn: () => { const t = today(); setDal(t); setAl(t); } },
              { label: '7 giorni', fn: () => { setDal(daysAgo(7)); setAl(today()); } },
              { label: '30 giorni',fn: () => { setDal(daysAgo(30)); setAl(today()); } },
              { label: 'Prossimi', fn: () => { setDal(today()); setAl(''); } },
            ].map(({ label, fn }) => (
              <button key={label} onClick={fn}
                className="text-xs px-3 py-1.5 rounded-full border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary transition-all"
              >{label}</button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={applyFilter} className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-opacity-90 transition-all">
              Applica filtro
            </button>
            {isFiltered && (
              <button onClick={clearFilter} className="px-4 py-2 border border-outline-variant/40 text-xs text-on-surface-variant rounded-2xl hover:text-on-surface transition-all">
                Rimuovi
              </button>
            )}
          </div>
        </div>
      )}

      {/* Statistiche */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Prenotazioni', value: totale },
          { label: 'Presenti',     value: presenti },
          { label: 'Corsi',        value: corsiUnici },
          { label: 'Utenti unici', value: utentiUnici },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-on-surface">{loading ? '—' : value}</p>
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento...</div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
            <Users size={20} className="text-on-surface-variant" />
          </div>
          <p className="text-sm font-semibold text-on-surface">Nessuna prenotazione</p>
          {isFiltered && <p className="text-xs text-on-surface-variant">Prova a rimuovere il filtro date</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map(group => {
            const isOpen    = expanded === group.corso;
            const nPresenti = group.bookings.filter(b => b.stato === 'presente').length;
            return (
              <div key={group.corso} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden">
                {/* Header gruppo */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-surface-container transition-all"
                  onClick={() => setExpanded(isOpen ? null : group.corso)}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users size={15} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{group.corso}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {group.bookings.length} prenotazion{group.bookings.length === 1 ? 'e' : 'i'}
                      {nPresenti > 0 && <span className="ml-1.5 text-green-600 font-bold">· {nPresenti} present{nPresenti === 1 ? 'e' : 'i'}</span>}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex-shrink-0">
                    {group.bookings.length}
                  </span>
                  {isOpen ? <ChevronUp size={15} className="text-on-surface-variant flex-shrink-0" /> : <ChevronDown size={15} className="text-on-surface-variant flex-shrink-0" />}
                </button>

                {/* Card partecipanti — mobile-first, niente tabella */}
                {isOpen && (
                  <div className="border-t border-outline-variant/20 divide-y divide-outline-variant/10">
                    {group.bookings.map(b => {
                      const nome = b.profiles
                        ? [b.profiles.nome, b.profiles.cognome].filter(Boolean).join(' ') || b.profiles.email
                        : '—';
                      const data = new Date(b.data + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
                      const s = STATO_STYLE[b.stato] ?? STATO_STYLE.confermata;
                      return (
                        <div key={b.id} className={`px-4 py-3 ${s.row} transition-all`}>
                          <div className="flex items-start justify-between gap-2">
                            {/* Info utente */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-on-surface truncate">{nome}</p>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{s.label}</span>
                              </div>
                              <p className="text-xs text-on-surface-variant truncate mt-0.5">{b.profiles?.email}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5">{data}</p>
                            </div>
                            {/* Pulsanti presenza */}
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => setStato(b.id, b.stato === 'presente' ? 'confermata' : 'presente')}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${b.stato === 'presente' ? 'bg-green-500 text-white' : 'bg-white border border-outline-variant/40 text-on-surface-variant active:bg-green-50'}`}
                              >
                                <Check size={11} /> Presente
                              </button>
                              <button
                                onClick={() => setStato(b.id, b.stato === 'assente' ? 'confermata' : 'assente')}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${b.stato === 'assente' ? 'bg-red-500 text-white' : 'bg-white border border-outline-variant/40 text-on-surface-variant active:bg-red-50'}`}
                              >
                                <X size={11} /> Assente
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
