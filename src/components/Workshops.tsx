import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, X, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface SpecialEvent {
  id: string;
  titolo: string;
  descrizione: string;
  data_evento: string;
  luogo: string;
  prezzo_base: number;
  prezzo_extra_non_abbonato: number;
  posti_totali: number | null;
  immagine_url: string | null;
}

// ── Modal acquisto biglietto ──────────────────────────────────
function TicketModal({ evento, onClose, isAbbonato }: {
  evento: SpecialEvent;
  onClose: () => void;
  isAbbonato: boolean;
}) {
  const { user } = useAuth();
  const [form, setForm]   = useState({
    nome:    user ? (user.user_metadata?.nome ?? '') : '',
    cognome: user ? (user.user_metadata?.cognome ?? '') : '',
    email:   user?.email ?? '',
    telefono:'',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const prezzoExtra = isAbbonato ? 0 : evento.prezzo_extra_non_abbonato;
  const prezzoTot   = evento.prezzo_base + prezzoExtra;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('create-event-checkout', {
        body: {
          event_id: evento.id,
          nome:     form.nome,
          cognome:  form.cognome,
          email:    form.email,
          telefono: form.telefono,
          user_id:  user?.id ?? null,
        },
      });
      if (fnErr || !data?.url) throw new Error('Errore nella creazione del pagamento');
      window.location.href = data.url;
    } catch {
      setError('Si è verificato un errore. Riprova.');
      setLoading(false);
    }
  };

  const inp = 'w-full bg-surface border border-outline-variant/50 rounded-2xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all';
  const lbl = 'block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-outline-variant/10">
          <div>
            <p className="text-xs font-label uppercase tracking-[0.25em] text-primary mb-1">Acquista biglietto</p>
            <h3 className="font-serif text-xl text-on-surface">{evento.titolo}</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {new Date(evento.data_evento).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              {evento.luogo && ` · ${evento.luogo}`}
            </p>
            <p className="text-2xl font-bold text-on-surface mt-2">
              {prezzoTot === 0 ? 'Gratuito' : `€ ${prezzoTot.toFixed(0)}`}
              {prezzoExtra > 0 && (
                <span className="text-xs font-normal text-on-surface-variant ml-2">
                  (incl. € {prezzoExtra.toFixed(0)} per non abbonati)
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface mt-1"><X size={20} /></button>
        </div>

        <form onSubmit={handleBuy} className="px-7 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Nome *</label>
              <input className={inp} required type="text" placeholder="Es. Giulia" value={form.nome} onChange={e => set('nome', e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Cognome</label>
              <input className={inp} type="text" placeholder="Es. Rossi" value={form.cognome} onChange={e => set('cognome', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Email *</label>
            <input className={inp} required type="email" placeholder="la-tua@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Telefono *</label>
            <input className={inp} required type="tel" placeholder="+39 333 000 0000" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
          </div>

          {/* Avviso certificato */}
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <span className="flex-shrink-0">⚕️</span>
            <p>Porta il <strong>certificato medico di buona salute</strong> all'evento insieme al codice di riferimento che riceverai via email.</p>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Preparazione...</>
              : <><ArrowRight size={16} /> {prezzoTot === 0 ? 'Conferma prenotazione' : 'Procedi al pagamento'}</>
            }
          </motion.button>
          <p className="text-center text-xs text-on-surface-variant">Pagamento sicuro tramite Stripe 🔒</p>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Componente principale ─────────────────────────────────────
export default function Workshops() {
  const { user }      = useAuth();
  const [events, setEvents]       = useState<SpecialEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isAbbonato, setAbbonato] = useState(false);
  const [selected, setSelected]   = useState<SpecialEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: ev }, subRes] = await Promise.all([
        supabase.from('special_events')
          .select('*')
          .eq('is_attivo', true)
          .gte('data_evento', new Date().toISOString())
          .order('data_evento', { ascending: true }),
        user
          ? supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('stato', 'attivo')
          : Promise.resolve({ count: 0 }),
      ]);
      setEvents(ev ?? []);
      setAbbonato((subRes.count ?? 0) > 0);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <section className="py-32 bg-surface overflow-hidden" id="workshops">
      <div className="container mx-auto px-6">
        {/* Header fisso */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 1.2 }}
          className="bg-primary rounded-[40px] p-12 md:p-20 text-on-primary relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(181,106,86,0.3)] mb-16"
        >
          <motion.div animate={{ scale: [1,1.2,1], rotate: [0,90,0] }} transition={{ repeat: Infinity, duration: 20 }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <motion.span initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 0.8, x: 0 }} transition={{ delay: 0.4 }}
              className="font-label tracking-[0.3em] uppercase text-xs block mb-8"
            >
              Eventi Speciali
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="text-4xl md:text-6xl font-serif mb-10 leading-tight"
            >
              Oltre le lezioni — <br />
              <span className="italic opacity-80">Workshop domenicali</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="text-xl opacity-90 leading-relaxed mb-12 font-light"
            >
              Approfondimenti dedicati a temi specifici. Un tempo dilatato per la tua crescita.
            </motion.p>
          </div>
        </motion.div>

        {/* Lista eventi */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif italic text-on-surface-variant text-lg">Nessun evento in programma al momento.</p>
            <p className="text-sm text-on-surface-variant mt-2">Torna a trovarci presto!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev, i) => {
              const prezzoExt  = isAbbonato ? 0 : ev.prezzo_extra_non_abbonato;
              const prezzoTot  = ev.prezzo_base + prezzoExt;
              const dataFmt    = new Date(ev.data_evento);
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col group"
                >
                  {ev.immagine_url ? (
                    <div className="h-48 overflow-hidden">
                      <img src={ev.immagine_url} alt={ev.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="font-serif italic text-5xl text-primary/30">✦</span>
                    </div>
                  )}
                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3 font-label uppercase tracking-wider">
                      <Calendar size={13} />
                      {dataFmt.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' · '}{dataFmt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <h3 className="font-serif text-xl text-on-surface mb-2 leading-tight">{ev.titolo}</h3>
                    {ev.descrizione && <p className="text-sm text-on-surface-variant leading-relaxed flex-1 mb-4 line-clamp-3">{ev.descrizione}</p>}
                    {ev.luogo && (
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
                        <MapPin size={12} /> {ev.luogo}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                      <div>
                        <p className="text-2xl font-bold text-on-surface">
                          {prezzoTot === 0 ? 'Gratuito' : `€ ${prezzoTot.toFixed(0)}`}
                        </p>
                        {!isAbbonato && ev.prezzo_extra_non_abbonato > 0 && (
                          <p className="text-[10px] text-on-surface-variant">abbonati: € {ev.prezzo_base.toFixed(0)}</p>
                        )}
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setSelected(ev)}
                        className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all"
                      >
                        {prezzoTot === 0 ? 'Prenota' : 'Acquista'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <TicketModal evento={selected} isAbbonato={isAbbonato} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
