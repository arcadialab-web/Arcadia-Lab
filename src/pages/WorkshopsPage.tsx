import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
import { X, ArrowRight } from 'lucide-react';

function TicketModal({ evento, onClose, isAbbonato }: {
  evento: SpecialEvent;
  onClose: () => void;
  isAbbonato: boolean;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nome:    user?.user_metadata?.nome ?? '',
    cognome: user?.user_metadata?.cognome ?? '',
    email:   user?.email ?? '',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const prezzoExt = isAbbonato ? 0 : evento.prezzo_extra_non_abbonato;
  const prezzoTot = evento.prezzo_base + prezzoExt;
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('create-event-checkout', {
        body: { event_id: evento.id, nome: form.nome, cognome: form.cognome, email: form.email, telefono: form.telefono },
      });
      if (fnErr || !data?.url) throw new Error();
      window.location.href = data.url;
    } catch {
      setError('Errore. Riprova o contattaci.');
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
              {prezzoExt > 0 && <span className="text-xs font-normal text-on-surface-variant ml-2">(abbonati: € {evento.prezzo_base.toFixed(0)})</span>}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface mt-1"><X size={20} /></button>
        </div>

        <form onSubmit={handleBuy} className="px-7 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Nome *</label><input className={inp} required type="text" value={form.nome} onChange={e => set('nome', e.target.value)} /></div>
            <div><label className={lbl}>Cognome</label><input className={inp} type="text" value={form.cognome} onChange={e => set('cognome', e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Email *</label><input className={inp} required type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label className={lbl}>Telefono *</label><input className={inp} required type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+39 333 000 0000" /></div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Preparazione...</> : <><ArrowRight size={16} /> {prezzoTot === 0 ? 'Conferma' : 'Procedi al pagamento'}</>}
          </motion.button>
          <p className="text-center text-xs text-on-surface-variant">Pagamento sicuro tramite Stripe 🔒</p>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Pagina principale ─────────────────────────────────────────
const WORKSHOP_DEFAULTS = {
  titolo:      'Oltre le lezioni — Workshop domenicali',
  sottotitolo: 'Approfondimenti mensili dedicati a temi specifici. Un tempo dilatato per la tua crescita personale e la tua pratica.',
};

export default function WorkshopsPage() {
  const { user }    = useAuth();
  const { preLancio } = useSiteSettings();
  const [events, setEvents]       = useState<SpecialEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isAbbonato, setAbbonato] = useState(false);
  const [selected, setSelected]   = useState<SpecialEvent | null>(null);
  const [pageTexts, setPageTexts] = useState(WORKSHOP_DEFAULTS);

  const handleSelect = (ev: SpecialEvent) => {
    if (preLancio) { window.location.href = '/#register'; return; }
    setSelected(ev);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: ev }, subRes, { data: settings }] = await Promise.all([
        supabase.from('special_events').select('*').eq('is_attivo', true).gte('data_evento', new Date().toISOString()).order('data_evento', { ascending: true }),
        user ? supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('stato', 'attivo') : Promise.resolve({ count: 0 }),
        supabase.from('site_settings').select('key, value').in('key', ['workshops_titolo', 'workshops_sottotitolo']),
      ]);
      setEvents(ev ?? []);
      setAbbonato((subRes.count ?? 0) > 0);
      const s: Record<string, string> = {};
      (settings ?? []).forEach(r => { s[r.key] = r.value; });
      setPageTexts({
        titolo:      s['workshops_titolo']      ?? WORKSHOP_DEFAULTS.titolo,
        sottotitolo: s['workshops_sottotitolo'] ?? WORKSHOP_DEFAULTS.sottotitolo,
      });
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      {/* Decorazioni */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary-container/4 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 pt-32 pb-24 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-16">
            <Link to="/#workshops" className="inline-flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mb-8">
              <ArrowLeft size={14} /> Torna alla home
            </Link>
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.7, x: 0 }} transition={{ delay: 0.2 }}
              className="block font-label tracking-[0.3em] uppercase text-xs text-primary mb-4"
            >
              Eventi Speciali
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-serif text-on-surface leading-tight mb-6"
            >
              {pageTexts.titolo}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-xl text-on-surface-variant max-w-2xl font-light leading-relaxed"
            >
              {pageTexts.sottotitolo}
            </motion.p>
          </div>

          {/* Lista eventi */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin h-7 w-7 text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-serif italic text-on-surface-variant text-xl mb-3">Nessun evento in programma al momento.</p>
              <p className="text-sm text-on-surface-variant">Torna a trovarci presto — stiamo preparando qualcosa di speciale!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((ev, i) => {
                const prezzoExt = isAbbonato ? 0 : ev.prezzo_extra_non_abbonato;
                const prezzoTot = ev.prezzo_base + prezzoExt;
                const dataFmt   = new Date(ev.data_evento);
                return (
                  <motion.div key={ev.id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col group"
                  >
                    {ev.immagine_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img src={ev.immagine_url} alt={ev.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <span className="font-serif italic text-6xl text-primary/30">✦</span>
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
                          <p className="text-2xl font-bold text-on-surface">{prezzoTot === 0 ? 'Gratuito' : `€ ${prezzoTot.toFixed(0)}`}</p>
                          {!isAbbonato && ev.prezzo_extra_non_abbonato > 0 && (
                            <p className="text-[10px] text-on-surface-variant">abbonati: € {ev.prezzo_base.toFixed(0)}</p>
                          )}
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelect(ev)}
                          className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all"
                        >
                          {preLancio ? 'Iscriviti' : prezzoTot === 0 ? 'Prenota' : 'Acquista'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selected && <TicketModal evento={selected} isAbbonato={isAbbonato} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
