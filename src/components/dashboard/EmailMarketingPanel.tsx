import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, Check, AlertCircle, ChevronDown, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  nome: string | null;
  cognome: string | null;
  sub_stato?: string;
}

const FILTERS = [
  { id: 'tutti',      label: 'Tutti gli utenti',         desc: 'Ogni profilo registrato' },
  { id: 'attivi',     label: 'Abbonati attivi',           desc: 'Con abbonamento in corso' },
  { id: 'scaduti',    label: 'Ex abbonati',               desc: 'Abbonamento scaduto' },
  { id: 'nessun_sub', label: 'Senza abbonamento',         desc: 'Non hanno mai acquistato' },
  { id: 'manuale',    label: 'Selezione manuale',         desc: 'Scegli utente per utente' },
] as const;

type FilterId = typeof FILTERS[number]['id'];

// ── Selettore utenti manuale ──────────────────────────────────
function UserSelector({ selected, onChange }: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('id, email, nome, cognome').order('email')
      .then(({ data }) => { setProfiles(data || []); setLoading(false); });
  }, []);

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return !q || p.email?.toLowerCase().includes(q) ||
      p.nome?.toLowerCase().includes(q) ||
      p.cognome?.toLowerCase().includes(q);
  });

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);

  const toggleAll = () =>
    onChange(selected.length === filtered.length ? [] : filtered.map(p => p.id));

  return (
    <div className="border border-outline-variant/30 rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-outline-variant/20 flex gap-2 items-center">
        <div className="relative flex-1">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per nome o email..."
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-3 pr-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <button onClick={toggleAll} className="text-xs font-bold text-primary hover:underline whitespace-nowrap px-2">
          {selected.length === filtered.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
        </button>
      </div>
      <div className="max-h-52 overflow-y-auto divide-y divide-outline-variant/10">
        {loading ? (
          <p className="text-center py-6 text-xs text-on-surface-variant">Caricamento...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-6 text-xs text-on-surface-variant">Nessun utente trovato.</p>
        ) : filtered.map(p => (
          <label key={p.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface-container-low transition-all ${selected.includes(p.id) ? 'bg-primary/5' : ''}`}>
            <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected.includes(p.id) ? 'bg-primary border-primary' : 'border-outline-variant/50'}`}>
              {selected.includes(p.id) && <Check size={10} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
            <div className="min-w-0">
              <p className="text-sm text-on-surface truncate">{p.nome} {p.cognome}</p>
              <p className="text-xs text-on-surface-variant truncate">{p.email}</p>
            </div>
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="px-4 py-2.5 bg-primary/5 border-t border-outline-variant/20 text-xs font-bold text-primary">
          {selected.length} selezionati
        </div>
      )}
    </div>
  );
}

// ── Pannello principale ───────────────────────────────────────
export default function EmailMarketingPanel() {
  const [subject, setSubject]   = useState('');
  const [body, setBody]         = useState('');
  const [filter, setFilter]     = useState<FilterId>('tutti');
  const [manualIds, setManualIds] = useState<string[]>([]);
  const [sending, setSending]   = useState(false);
  const [msg, setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const selectedFilter = FILTERS.find(f => f.id === filter)!;
  const canSend = subject.trim() && body.trim() && (filter !== 'manuale' || manualIds.length > 0);

  const handleSend = async () => {
    if (!canSend) return;
    if (!confirm(`Inviare l'email a ${filter === 'manuale' ? `${manualIds.length} utenti selezionati` : `tutti gli utenti "${selectedFilter.label}"`}?`)) return;

    setSending(true);
    setMsg(null);
    const { data, error } = await supabase.functions.invoke('send-admin-email', {
      body: {
        subject: subject.trim(),
        body:    body.trim(),
        filter:  filter === 'manuale' ? 'ids' : filter,
        user_ids: filter === 'manuale' ? manualIds : undefined,
      },
    });

    setSending(false);
    if (error || !data) {
      setMsg({ type: 'error', text: 'Errore durante l\'invio. Riprova.' });
    } else {
      setMsg({ type: 'success', text: `Email inviata a ${data.sent} destinatari.` });
      setSubject(''); setBody(''); setManualIds([]);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-serif text-xl text-on-surface">Email ai tuoi utenti</h2>
        <p className="text-xs text-on-surface-variant mt-1">Scrivi e invia email personalizzate. Il testo viene inviato tramite Resend con il template Arcadia Lab.</p>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${msg.type === 'success' ? 'border border-primary/20 text-primary' : 'bg-red-50 border border-red-200 text-red-600'}`}
            style={msg.type === 'success' ? { background: 'rgba(181,106,86,0.07)' } : {}}
          >
            {msg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destinatari */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-5 space-y-3">
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Destinatari</p>

        {/* Dropdown filtro */}
        <div className="relative">
          <button onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-surface border border-outline-variant/40 rounded-2xl text-sm hover:border-primary/40 transition-all"
          >
            <div className="text-left">
              <p className="font-bold text-on-surface">{selectedFilter.label}</p>
              <p className="text-xs text-on-surface-variant">{selectedFilter.desc}</p>
            </div>
            <ChevronDown size={16} className={`text-on-surface-variant flex-shrink-0 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-full mt-1 left-0 right-0 bg-surface border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden z-10"
              >
                {FILTERS.map(f => (
                  <button key={f.id} onClick={() => { setFilter(f.id); setShowFilters(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-container-low transition-all text-left ${filter === f.id ? 'bg-primary/5' : ''}`}
                  >
                    <div>
                      <p className="font-bold text-on-surface">{f.label}</p>
                      <p className="text-xs text-on-surface-variant">{f.desc}</p>
                    </div>
                    {filter === f.id && <Check size={14} className="text-primary flex-shrink-0" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selezione manuale */}
        {filter === 'manuale' && (
          <UserSelector selected={manualIds} onChange={setManualIds} />
        )}
      </div>

      {/* Oggetto */}
      <div className="space-y-1.5">
        <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Oggetto email *</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Es. Novità da Arcadia Lab. 🧘"
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
        />
      </div>

      {/* Corpo */}
      <div className="space-y-1.5">
        <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Testo email *</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={8}
          placeholder="Scrivi il testo della tua email. Puoi usare a capo per separare i paragrafi."
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
        />
        <p className="text-xs text-on-surface-variant">I testi vengono inviati con il template grafico di Arcadia Lab.</p>
      </div>

      {/* Bottone invia */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSend}
        disabled={!canSend || sending}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {sending
          ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Invio in corso...</>
          : <><Send size={15} /> Invia email</>
        }
      </motion.button>
    </div>
  );
}

// ── Modal notifica evento ─────────────────────────────────────
export function EventNotificationModal({ event, onClose }: {
  event: { id: string; titolo: string; data_evento: string; luogo?: string };
  onClose: () => void;
}) {
  const ctaUrl    = `${window.location.origin}/workshops`;
  const dataFmt   = new Date(event.data_evento).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const [subject, setSubject]   = useState(`Nuovo evento: ${event.titolo}`);
  const [body, setBody]         = useState(
    `Ti scriviamo per informarti di un nuovo evento speciale!\n\n` +
    `📅 ${event.titolo}\n` +
    `🗓 ${dataFmt}` +
    (event.luogo ? `\n📍 ${event.luogo}` : '') +
    `\n\nSe sei interessato/a, puoi acquistare il biglietto direttamente sul nostro sito. ` +
    `I posti sono limitati, quindi ti consigliamo di affrettarti!\n\n` +
    `A presto,\nIl team di Arcadia Lab.`
  );
  const [filter, setFilter]     = useState<FilterId>('attivi');
  const [manualIds, setManualIds] = useState<string[]>([]);
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState<number | null>(null);
  const [error, setError]       = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const selectedFilter = FILTERS.find(f => f.id === filter)!;
  const canSend = subject.trim() && body.trim() && (filter !== 'manuale' || manualIds.length > 0);

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true); setError('');
    const { data, error: fnErr } = await supabase.functions.invoke('send-admin-email', {
      body: {
        subject: subject.trim(),
        body:    body.trim(),
        filter:  filter === 'manuale' ? 'ids' : filter,
        user_ids: filter === 'manuale' ? manualIds : undefined,
        cta_url:   ctaUrl,
        cta_label: 'Acquista il biglietto',
      },
    });
    setSending(false);
    if (fnErr || !data) { setError('Errore durante l\'invio.'); return; }
    setSent(data.sent);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-surface w-full max-w-lg rounded-[1.5rem] shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-outline-variant/20 flex-shrink-0">
          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-primary mb-0.5">Notifica evento</p>
            <h3 className="font-serif text-lg text-on-surface">{event.titolo}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{dataFmt}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {sent !== null ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={28} className="text-green-600" />
            </div>
            <p className="font-serif text-xl text-on-surface">Email inviata!</p>
            <p className="text-sm text-on-surface-variant">Notifica consegnata a <strong>{sent}</strong> utenti.</p>
            <button onClick={onClose} className="mt-2 bg-primary text-white px-8 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest">Chiudi</button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Destinatari */}
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Destinatari</p>
              <div className="relative">
                <button onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-sm hover:border-primary/40 transition-all"
                >
                  <div className="text-left">
                    <p className="font-bold text-on-surface">{selectedFilter.label}</p>
                    <p className="text-xs text-on-surface-variant">{selectedFilter.desc}</p>
                  </div>
                  <ChevronDown size={14} className={`text-on-surface-variant flex-shrink-0 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full mt-1 left-0 right-0 bg-surface border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden z-10"
                    >
                      {FILTERS.map(f => (
                        <button key={f.id} onClick={() => { setFilter(f.id); setShowFilters(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-container-low transition-all text-left ${filter === f.id ? 'bg-primary/5' : ''}`}
                        >
                          <div>
                            <p className="font-bold text-on-surface">{f.label}</p>
                            <p className="text-xs text-on-surface-variant">{f.desc}</p>
                          </div>
                          {filter === f.id && <Check size={14} className="text-primary flex-shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {filter === 'manuale' && (
                <div className="mt-3">
                  <UserSelector selected={manualIds} onChange={setManualIds} />
                </div>
              )}
            </div>

            {/* Oggetto */}
            <div>
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1.5">Oggetto *</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Testo */}
            <div>
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1.5">Testo *</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={7}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
              />
              <p className="text-xs text-on-surface-variant mt-1">Il bottone "Acquista il biglietto" viene aggiunto automaticamente con il link al sito.</p>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSend} disabled={!canSend || sending}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending
                ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Invio...</>
                : <><Send size={15} /> Invia notifica</>
              }
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
