import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Users, Search, Phone, Mail, Upload, Image, ChevronDown, ScanLine, UserCheck, UserX, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EventNotificationModal } from './EmailMarketingPanel';

const BUCKET = 'eventi';

// ── Selettore immagine (upload + galleria storage) ────────────
function ImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [tab, setTab]           = useState<'upload' | 'gallery'>('upload');
  const [gallery, setGallery]   = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [open, setOpen]         = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const loadGallery = async () => {
    setLoadingGallery(true);
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
    const items = (data ?? [])
      .filter(f => f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i))
      .map(f => ({
        name: f.name,
        url:  supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      }));
    setGallery(items);
    setLoadingGallery(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext  = file.name.split('.').pop();
    const path = `evento_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      setOpen(false);
    } else {
      alert('Errore upload: ' + error.message);
    }
    setUploading(false);
    e.target.value = '';
  };

  const inp = 'w-full bg-surface border border-outline-variant rounded-2xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all';

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-outline-variant/30">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Bottone apri picker */}
      <button type="button" onClick={() => { setOpen(!open); if (!open) loadGallery(); }}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border border-outline-variant/50 text-sm text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
      >
        <span className="flex items-center gap-2">
          <Image size={15} />
          {value ? 'Cambia immagine' : 'Scegli o carica immagine'}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Picker dropdown */}
      {open && (
        <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-low">
          {/* Tab bar */}
          <div className="flex border-b border-outline-variant/20">
            {(['upload', 'gallery'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${tab === t ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {t === 'upload' ? '⬆ Carica nuova' : '🖼 Dalla galleria'}
              </button>
            ))}
          </div>

          {tab === 'upload' && (
            <div className="p-4">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-outline-variant/40 rounded-2xl hover:border-primary/40 hover:bg-primary/4 transition-all text-on-surface-variant hover:text-primary disabled:opacity-50"
                style={{ background: uploading ? 'rgba(181,106,86,0.04)' : undefined }}
              >
                <Upload size={24} strokeWidth={1.5} />
                <span className="text-sm font-semibold">{uploading ? 'Caricamento...' : 'Clicca per caricare'}</span>
                <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
              </button>
            </div>
          )}

          {tab === 'gallery' && (
            <div className="p-3">
              {loadingGallery ? (
                <p className="text-center py-6 text-xs text-on-surface-variant">Caricamento galleria...</p>
              ) : gallery.length === 0 ? (
                <p className="text-center py-6 text-xs text-on-surface-variant font-serif italic">Nessuna immagine nello storage.<br/>Carica la prima dalla tab "Carica nuova".</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                  {gallery.map(img => (
                    <button key={img.name} type="button"
                      onClick={() => { onChange(img.url); setOpen(false); }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${value === img.url ? 'border-primary' : 'border-transparent hover:border-primary/40'}`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      {value === img.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check size={16} className="text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  is_attivo: boolean;
}

interface Ticket {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  codice_ref: string;
  prezzo_pagato: number;
  is_abbonato: boolean;
  stato: string;
  created_at: string;
}

const inp = 'w-full bg-surface border border-outline-variant rounded-2xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all';
const lbl = 'block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5';

const emptyForm = {
  titolo: '', descrizione: '', data_evento: '', luogo: '',
  prezzo_base: 0, prezzo_extra_non_abbonato: 0,
  posti_totali: '' as any, immagine_url: '', is_attivo: true,
};

// ── Modal crea/modifica evento ────────────────────────────────
function EventModal({ event, onClose, onSave }: {
  event: Partial<SpecialEvent> | null;
  onClose: () => void;
  onSave: (data: typeof emptyForm) => Promise<void>;
}) {
  const toInput = (dt: string) => dt ? dt.slice(0, 16) : '';
  const [form, setForm] = useState({
    ...emptyForm,
    ...(event ? { ...event, data_evento: toInput(event.data_evento ?? ''), posti_totali: event.posti_totali ?? '' } : {}),
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface w-full max-w-lg rounded-[1.5rem] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
          <h3 className="font-serif text-lg text-on-surface">{event?.id ? 'Modifica evento' : 'Nuovo evento'}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><X size={18} /></button>
        </div>

        <form onSubmit={async e => { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false); }}
          className="p-6 space-y-4 max-h-[78vh] overflow-y-auto"
        >
          <div>
            <label className={lbl}>Titolo *</label>
            <input className={inp} required value={form.titolo} onChange={e => set('titolo', e.target.value)} placeholder="Es. Workshop Katonah speciale" />
          </div>
          <div>
            <label className={lbl}>Descrizione</label>
            <textarea className={`${inp} resize-none`} rows={3} value={form.descrizione} onChange={e => set('descrizione', e.target.value)} placeholder="Descrivi l'evento..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Data e ora *</label>
              <input className={inp} required type="datetime-local" value={form.data_evento} onChange={e => set('data_evento', e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Luogo</label>
              <input className={inp} value={form.luogo} onChange={e => set('luogo', e.target.value)} placeholder="Es. Studio Arcadia" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Prezzo base (€)</label>
              <input className={inp} type="number" min="0" step="0.01" value={form.prezzo_base} onChange={e => set('prezzo_base', parseFloat(e.target.value) || 0)} placeholder="0" />
            </div>
            <div>
              <label className={lbl}>Extra non abbonati (€)</label>
              <input className={inp} type="number" min="0" step="0.01" value={form.prezzo_extra_non_abbonato} onChange={e => set('prezzo_extra_non_abbonato', parseFloat(e.target.value) || 0)} placeholder="0" />
              <p className="text-[10px] text-on-surface-variant mt-1">Aggiunto al prezzo base per chi non è abbonato</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Posti disponibili</label>
              <input className={inp} type="number" min="1" value={form.posti_totali} onChange={e => set('posti_totali', e.target.value ? parseInt(e.target.value) : '')} placeholder="Illimitati" />
            </div>
            <div>
              <label className={lbl}>Stato</label>
              <button type="button" onClick={() => set('is_attivo', !form.is_attivo)}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${form.is_attivo ? 'border-primary/30 text-primary' : 'border-outline-variant bg-surface-container text-on-surface-variant'}`}
                style={form.is_attivo ? { background: 'rgba(181,106,86,0.08)' } : {}}
              >
                {form.is_attivo ? '✓ Visibile al pubblico' : '✗ Nascosto'}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Immagine evento</label>
            <ImagePicker value={form.immagine_url ?? ''} onChange={url => set('immagine_url', url)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-outline-variant text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all">Annulla</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? 'Salvataggio...' : <><Check size={15} /> Salva evento</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Pannello partecipanti ─────────────────────────────────────
function ParticipantsPanel({ event, onClose }: { event: SpecialEvent; onClose: () => void }) {
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState<'lista' | 'verifica'>('lista');

  // ── verifica on-site ──
  const [codice, setCodice]         = useState('');
  const [found, setFound]           = useState<Ticket | null | false>(null); // null=idle, false=not found
  const [verifying, setVerifying]   = useState(false);
  const codiceRef                   = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('event_tickets')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }, [event.id]);

  useEffect(() => { load(); }, [load]);

  const setStato = async (id: string, next: string) => {
    await supabase.from('event_tickets').update({ stato: next }).eq('id', id);
    load();
    setFound(f => f && (f as Ticket).id === id ? { ...(f as Ticket), stato: next } : f);
  };

  const verificaCodice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!codice.trim()) return;
    setVerifying(true);
    setFound(null);
    const { data } = await supabase
      .from('event_tickets')
      .select('*')
      .eq('event_id', event.id)
      .ilike('codice_ref', codice.trim())
      .maybeSingle();
    setFound(data ?? false);
    setVerifying(false);
  };

  const resetVerifica = () => {
    setCodice('');
    setFound(null);
    setTimeout(() => codiceRef.current?.focus(), 50);
  };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return !q ||
      t.nome?.toLowerCase().includes(q) ||
      t.cognome?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.telefono?.includes(q) ||
      t.codice_ref?.toLowerCase().includes(q);
  });

  const attivi     = tickets.filter(t => t.stato !== 'cancellato').length;
  const presenti   = tickets.filter(t => t.stato === 'presente').length;
  const assenti    = tickets.filter(t => t.stato === 'assente').length;
  const totIncasso = tickets.filter(t => t.stato !== 'cancellato').reduce((s, t) => s + (t.prezzo_pagato || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-surface w-full max-w-3xl rounded-[1.5rem] shadow-2xl flex flex-col max-h-[90dvh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-outline-variant/20 flex-shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="font-serif text-base sm:text-lg text-on-surface truncate">{event.titolo}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {new Date(event.data_evento).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              {event.luogo && ` · ${event.luogo}`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant flex-shrink-0"><X size={16} /></button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 px-4 sm:px-6 py-3 border-b border-outline-variant/20 flex-shrink-0">
          {[
            { label: 'Iscritti',  value: attivi,                      color: '#8ba888' },
            { label: 'Presenti',  value: presenti,                     color: '#4a9a4a' },
            { label: 'Assenti',   value: assenti,                      color: '#e05050' },
            { label: 'Incasso',   value: `€${totIncasso.toFixed(0)}`,  color: '#2b2927' },
          ].map(s => (
            <div key={s.label} className="text-center bg-surface-container-low rounded-xl p-2">
              <p className="text-lg sm:text-2xl font-serif font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] sm:text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-outline-variant/20 flex-shrink-0">
          {([
            { id: 'lista',    label: 'Lista iscritti', icon: <Users size={13} /> },
            { id: 'verifica', label: 'Verifica codice', icon: <ScanLine size={13} /> },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Lista iscritti ── */}
        {tab === 'lista' && (
          <>
            <div className="px-4 sm:px-6 py-3 border-b border-outline-variant/10 flex-shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" strokeWidth={1.5} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cerca nome, email, codice..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl pl-9 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
              {loading ? (
                <div className="text-center py-12 font-serif italic text-on-surface-variant">Caricamento...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 font-serif italic text-on-surface-variant">
                  {tickets.length === 0 ? 'Nessun iscritto ancora.' : 'Nessun risultato.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(t => (
                    <div key={t.id} className={`rounded-2xl border transition-all ${t.stato === 'presente' ? 'bg-green-50 border-green-200' : t.stato === 'assente' ? 'bg-red-50 border-red-200' : 'bg-surface-container-low border-outline-variant/20'}`}>
                      {/* Riga principale */}
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {(t.nome || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-on-surface truncate">{t.nome} {t.cognome}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="text-[11px] text-on-surface-variant truncate">{t.email}</span>
                            {t.is_abbonato && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(181,106,86,0.12)', color: '#b56a56' }}>Abb.</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-on-surface-variant">{t.codice_ref}</span>
                            <span className="text-[11px] font-bold text-on-surface-variant">· € {(t.prezzo_pagato || 0).toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                      {/* Bottoni azione */}
                      <div className="flex gap-2 px-3 pb-3">
                        <button
                          onClick={() => setStato(t.id, t.stato === 'presente' ? 'confermato' : 'presente')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${t.stato === 'presente' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-outline-variant/40 text-on-surface-variant active:bg-green-50'}`}
                        >
                          {t.stato === 'presente' ? '✓ Presente' : 'Segna presente'}
                        </button>
                        <button
                          onClick={() => setStato(t.id, t.stato === 'assente' ? 'confermato' : 'assente')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${t.stato === 'assente' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-outline-variant/40 text-on-surface-variant active:bg-red-50'}`}
                        >
                          {t.stato === 'assente' ? '✗ Assente' : 'Segna assente'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB: Verifica codice ── */}
        {tab === 'verifica' && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

            {/* Input codice */}
            <form onSubmit={verificaCodice} className="flex gap-2">
              <div className="relative flex-1">
                <ScanLine size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  ref={codiceRef}
                  type="text"
                  value={codice}
                  onChange={e => { setCodice(e.target.value.toUpperCase()); setFound(null); }}
                  placeholder="Es. ARC-AB12CD"
                  autoFocus
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono text-on-surface tracking-widest focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all uppercase"
                />
              </div>
              <button type="submit" disabled={!codice.trim() || verifying}
                className="bg-primary text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all"
              >
                Verifica
              </button>
            </form>

            {/* Risultato */}
            <AnimatePresence mode="wait">
              {found === false && (
                <motion.div key="not-found" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-10 bg-red-50 border border-red-200 rounded-3xl text-center"
                >
                  <UserX size={40} className="text-red-400" strokeWidth={1.5} />
                  <p className="font-serif text-lg text-red-700">Codice non trovato</p>
                  <p className="text-xs text-red-500">Nessun biglietto corrisponde a <span className="font-mono font-bold">{codice}</span></p>
                  <button onClick={resetVerifica} className="mt-2 text-xs font-bold text-red-600 underline underline-offset-2">Riprova</button>
                </motion.div>
              )}

              {found && typeof found === 'object' && (
                <motion.div key="found" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`rounded-3xl border-2 overflow-hidden ${found.stato === 'presente' ? 'border-green-400 bg-green-50' : found.stato === 'assente' ? 'border-red-400 bg-red-50' : 'border-primary/30 bg-white'}`}
                >
                  {/* Badge stato */}
                  <div className={`px-6 py-3 flex items-center gap-2 ${found.stato === 'presente' ? 'bg-green-500' : found.stato === 'assente' ? 'bg-red-500' : 'bg-primary'}`}>
                    {found.stato === 'presente'
                      ? <><Check size={16} className="text-white" /><span className="text-white text-xs font-bold uppercase tracking-widest">Già segnato presente</span></>
                      : found.stato === 'assente'
                      ? <><UserX size={16} className="text-white" /><span className="text-white text-xs font-bold uppercase tracking-widest">Segnato assente</span></>
                      : <><UserCheck size={16} className="text-white" /><span className="text-white text-xs font-bold uppercase tracking-widest">Biglietto valido</span></>
                    }
                  </div>

                  {/* Dati persona */}
                  <div className="px-6 py-5 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                        {(found.nome || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-serif text-xl text-on-surface">{found.nome} {found.cognome}</p>
                        <p className="text-xs font-mono text-primary mt-0.5">{found.codice_ref}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1.5"><Mail size={11} />{found.email}</span>
                      {found.telefono && <span className="flex items-center gap-1.5"><Phone size={11} />{found.telefono}</span>}
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: found.is_abbonato ? '#b56a56' : '#ccc' }} />
                        {found.is_abbonato ? 'Abbonato' : 'Non abbonato'}
                      </span>
                      <span className="flex items-center gap-1.5">💶 € {(found.prezzo_pagato || 0).toFixed(0)}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setStato(found.id, found.stato === 'presente' ? 'confermato' : 'presente')}
                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${found.stato === 'presente' ? 'bg-green-100 text-green-700' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'}`}
                      >
                        {found.stato === 'presente' ? '✓ Presente' : '✓ Segna presente'}
                      </button>
                      <button
                        onClick={() => setStato(found.id, found.stato === 'assente' ? 'confermato' : 'assente')}
                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${found.stato === 'assente' ? 'bg-red-100 text-red-600' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg'}`}
                      >
                        {found.stato === 'assente' ? '✗ Assente' : '✗ Segna assente'}
                      </button>
                      <button onClick={resetVerifica}
                        className="px-4 py-3 rounded-2xl border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all"
                      >
                        Nuovo
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {found === null && !codice && (
              <div className="text-center py-10 text-on-surface-variant">
                <ScanLine size={36} className="mx-auto mb-3 opacity-30" strokeWidth={1} />
                <p className="text-sm font-serif italic">Inserisci il codice mostrato dall'utente</p>
                <p className="text-xs mt-1 opacity-60">Formato: ARC-XXXXXX</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Pannello principale admin ─────────────────────────────────
export default function EventsManagementPanel() {
  const [events, setEvents]     = useState<SpecialEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<Partial<SpecialEvent> | null | undefined>(undefined);
  const [participants, setParticipants] = useState<SpecialEvent | null>(null);
  const [notifyEvent, setNotifyEvent]   = useState<SpecialEvent | null>(null);
  const [msg, setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter]     = useState<'tutti' | 'prossimi' | 'passati'>('prossimi');
  const [heroImage, setHeroImage] = useState('');
  const [savingHero, setSavingHero] = useState(false);

  const notify = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text }); setTimeout(() => setMsg(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const [{ data: ev }, { data: setting }] = await Promise.all([
      supabase.from('special_events').select('*').order('data_evento', { ascending: false }),
      supabase.from('site_settings').select('value').eq('key', 'events_hero_image').single(),
    ]);
    setEvents(ev || []);
    setHeroImage(setting?.value ?? '');
    setLoading(false);
  };

  const saveHeroImage = async (url: string) => {
    setSavingHero(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'events_hero_image', value: url || null }, { onConflict: 'key' });
    setSavingHero(false);
    if (error) {
      notify('error', 'Errore salvataggio immagine: ' + error.message);
    } else {
      notify('success', 'Immagine homepage salvata.');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: typeof emptyForm) => {
    const payload = {
      ...form,
      posti_totali: form.posti_totali !== '' ? parseInt(form.posti_totali) : null,
      immagine_url: form.immagine_url || null,
    };
    if (modal?.id) {
      const { error } = await supabase.from('special_events').update(payload).eq('id', modal.id);
      if (error) { notify('error', 'Errore durante il salvataggio.'); return; }
    } else {
      const { error } = await supabase.from('special_events').insert(payload);
      if (error) { notify('error', 'Errore durante la creazione.'); return; }
    }
    notify('success', 'Evento salvato.');
    setModal(undefined);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo evento? Tutti i biglietti verranno cancellati.')) return;
    await supabase.from('special_events').delete().eq('id', id);
    notify('success', 'Evento eliminato.');
    load();
  };

  const now = new Date().toISOString();
  const filtered = events.filter(e => {
    if (filter === 'prossimi') return e.data_evento >= now;
    if (filter === 'passati')  return e.data_evento < now;
    return true;
  });

  return (
    <div className="space-y-5">

      {/* Immagine homepage sezione eventi */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-5">
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Immagine homepage — sezione "Eventi Speciali"</p>
        <p className="text-xs text-on-surface-variant mb-4">Scegli l'immagine di sfondo che appare nella sezione "Oltre le lezioni" nella home page.</p>
        <ImagePicker value={heroImage} onChange={url => { setHeroImage(url); saveHeroImage(url); }} />
        {savingHero && <p className="text-xs text-primary mt-2">Salvataggio...</p>}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['prossimi', 'tutti', 'passati'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-on-surface'}`}
            >
              {f === 'prossimi' ? 'Prossimi' : f === 'passati' ? 'Passati' : 'Tutti'}
            </button>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModal(null)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg"
        >
          <Plus size={15} /> Nuovo evento
        </motion.button>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${msg.type === 'success' ? 'border border-primary/20 text-primary' : 'bg-red-50 border border-red-200 text-red-600'}`}
            style={msg.type === 'success' ? { background: 'rgba(181,106,86,0.07)' } : {}}
          >
            {msg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento eventi...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif italic text-on-surface-variant mb-4">Nessun evento {filter === 'prossimi' ? 'programmato' : filter === 'passati' ? 'passato' : ''}.</p>
          <button onClick={() => setModal(null)} className="text-primary text-sm font-bold hover:underline">+ Crea il primo evento</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ev, i) => {
            const isPast    = new Date(ev.data_evento) < new Date();
            const dataFmt   = new Date(ev.data_evento);
            return (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-surface-container-low border rounded-[1.5rem] overflow-hidden flex flex-col transition-all ${ev.is_attivo ? 'border-outline-variant/30' : 'border-outline-variant/15 opacity-60'}`}
              >
                {ev.immagine_url && (
                  <div className="h-32 overflow-hidden flex-shrink-0">
                    <img src={ev.immagine_url} alt={ev.titolo} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface leading-tight">{ev.titolo}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {dataFmt.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{dataFmt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {ev.luogo && <p className="text-xs text-on-surface-variant">📍 {ev.luogo}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: ev.is_attivo && !isPast ? 'rgba(139,168,136,0.15)' : 'rgba(0,0,0,0.06)', color: ev.is_attivo && !isPast ? '#8ba888' : '#999' }}>
                        {isPast ? 'Concluso' : ev.is_attivo ? 'Attivo' : 'Nascosto'}
                      </span>
                      <p className="text-sm font-bold text-primary">€ {ev.prezzo_base.toFixed(0)}</p>
                    </div>
                  </div>

                  {ev.prezzo_extra_non_abbonato > 0 && (
                    <p className="text-[11px] text-on-surface-variant">+€ {ev.prezzo_extra_non_abbonato.toFixed(0)} per non abbonati</p>
                  )}

                  <div className="flex gap-2 pt-1 border-t border-outline-variant/20">
                    <button onClick={() => setParticipants(ev)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-outline-variant/40 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all"
                    >
                      <Users size={12} /> Partecipanti
                    </button>
                    <button onClick={() => setNotifyEvent(ev)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-outline-variant/40 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all"
                    >
                      <Bell size={12} /> Notifica
                    </button>
                    <button onClick={() => setModal(ev)}
                      className="p-2 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleDelete(ev.id)}
                      className="p-2 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:border-red-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modal !== undefined && <EventModal event={modal} onClose={() => setModal(undefined)} onSave={handleSave} />}
        {participants && <ParticipantsPanel event={participants} onClose={() => setParticipants(null)} />}
        {notifyEvent && <EventNotificationModal event={notifyEvent} onClose={() => setNotifyEvent(null)} />}
      </AnimatePresence>
    </div>
  );
}
