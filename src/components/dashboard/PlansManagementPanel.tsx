import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Plan {
  id: string;
  nome: string;
  descrizione: string;
  prezzo: number;
  lezioni_totali: number;
  durata_giorni: number;
  frequenza_sett: number | null;
  is_attivo: boolean;
  ordine: number;
}

const empty: Omit<Plan, 'id'> = {
  nome: '', descrizione: '', prezzo: 0,
  lezioni_totali: 0, durata_giorni: 30,
  frequenza_sett: null, is_attivo: true, ordine: 0,
};

const input = 'w-full bg-surface border border-outline-variant rounded-2xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all';
const label = 'block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5';
const T = '#b56a56';
const S = '#8ba888';

function Modal({ plan, onClose, onSave }: {
  plan: Partial<Plan> | null;
  onClose: () => void;
  onSave: (p: Omit<Plan, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<Plan, 'id'>>(plan ? { ...empty, ...plan } : { ...empty });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface w-full max-w-lg rounded-[1.5rem] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
          <h3 className="font-serif text-lg text-on-surface">
            {plan?.id ? 'Modifica piano' : 'Nuovo piano'}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className={label}>Nome piano *</label>
            <input className={input} required placeholder="Es. Mensile 2 volte/sett" value={form.nome} onChange={e => set('nome', e.target.value)} />
          </div>
          <div>
            <label className={label}>Descrizione *</label>
            <input className={input} required placeholder="Breve descrizione del piano" value={form.descrizione} onChange={e => set('descrizione', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Prezzo (€) *</label>
              <input className={input} type="number" required min="1" step="0.01" placeholder="0.00"
                value={form.prezzo || ''} onChange={e => set('prezzo', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className={label}>N° lezioni incluse *</label>
              <input className={input} type="number" required min="1" placeholder="12"
                value={form.lezioni_totali || ''} onChange={e => set('lezioni_totali', parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Durata (giorni) *</label>
              <input className={input} type="number" required min="1" placeholder="30"
                value={form.durata_giorni || ''} onChange={e => set('durata_giorni', parseInt(e.target.value) || 30)} />
            </div>
            <div>
              <label className={label}>Frequenza sett. (opz.)</label>
              <select className={input} value={form.frequenza_sett ?? ''} onChange={e => set('frequenza_sett', e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">— Nessuna —</option>
                <option value="1">1 volta/sett</option>
                <option value="2">2 volte/sett</option>
                <option value="3">3 volte/sett</option>
                <option value="4">4 volte/sett</option>
                <option value="5">5 volte/sett</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Ordine visualizzazione</label>
              <input className={input} type="number" min="0" placeholder="0"
                value={form.ordine || 0} onChange={e => set('ordine', parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex flex-col justify-end">
              <label className={label}>Stato</label>
              <button type="button" onClick={() => set('is_attivo', !form.is_attivo)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${form.is_attivo ? 'border-primary/30 bg-primary/8 text-primary' : 'border-outline-variant bg-surface-container text-on-surface-variant'}`}
                style={form.is_attivo ? { background: 'rgba(181,106,86,0.08)' } : {}}>
                {form.is_attivo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {form.is_attivo ? 'Attivo' : 'Inattivo'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-outline-variant text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all">
              Annulla
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? 'Salvataggio...' : <><Check size={15} /> Salva piano</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function PlansManagementPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPlan, setModalPlan] = useState<Partial<Plan> | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const notify = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('ordine', { ascending: true });
    if (!error && data) setPlans(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: Omit<Plan, 'id'>) => {
    if (modalPlan?.id) {
      const { error } = await supabase.from('plans').update(form).eq('id', modalPlan.id);
      if (error) { notify('error', 'Errore durante il salvataggio.'); return; }
      notify('success', 'Piano aggiornato con successo.');
    } else {
      const { error } = await supabase.from('plans').insert(form);
      if (error) { notify('error', 'Errore durante la creazione.'); return; }
      notify('success', 'Nuovo piano creato con successo.');
    }
    setModalPlan(undefined);
    load();
  };

  const handleToggle = async (plan: Plan) => {
    const { error } = await supabase.from('plans').update({ is_attivo: !plan.is_attivo }).eq('id', plan.id);
    if (!error) load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminare questo piano? L\'operazione è irreversibile.')) return;
    setDeletingId(id);
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) notify('error', 'Impossibile eliminare il piano.');
    else { notify('success', 'Piano eliminato.'); load(); }
    setDeletingId(null);
  };

  const checkoutUrl = (plan: Plan) =>
    `${window.location.origin}/checkout?plan=${plan.id}`;

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5">
            {plans.length} piani · {plans.filter(p => p.is_attivo).length} attivi
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModalPlan(null)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg"
        >
          <Plus size={15} /> Nuovo piano
        </motion.button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${msg.type === 'success' ? 'border border-primary/20 text-primary' : 'bg-red-50 border border-red-200 text-red-600'}`}
            style={msg.type === 'success' ? { background: 'rgba(181,106,86,0.07)' } : {}}
          >
            {msg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans grid */}
      {loading ? (
        <div className="text-center py-16 text-on-surface-variant font-serif italic">Caricamento piani...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-on-surface-variant font-serif italic mb-4">Nessun piano creato.</p>
          <button onClick={() => setModalPlan(null)} className="text-primary text-sm font-bold hover:underline">
            + Crea il primo piano
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-surface-container-low border rounded-[1.5rem] p-5 flex flex-col gap-4 transition-all ${plan.is_attivo ? 'border-outline-variant/30' : 'border-outline-variant/15 opacity-60'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-on-surface leading-tight">{plan.nome}</p>
                  {plan.descrizione && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{plan.descrizione}</p>}
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: plan.is_attivo ? `${S}18` : 'rgba(0,0,0,0.06)',
                    color: plan.is_attivo ? S : '#999',
                  }}>
                  {plan.is_attivo ? 'Attivo' : 'Inattivo'}
                </span>
              </div>

              {/* Prezzo */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-on-surface">€ {plan.prezzo.toFixed(0)}</span>
                {plan.prezzo % 1 !== 0 && <span className="text-lg font-bold text-on-surface">{(plan.prezzo % 1).toFixed(2).slice(1)}</span>}
              </div>

              {/* Dettagli */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: `${plan.lezioni_totali} lezioni` },
                  { label: `${plan.durata_giorni} giorni` },
                  ...(plan.frequenza_sett ? [{ label: `${plan.frequenza_sett}x/sett` }] : []),
                ].map(tag => (
                  <span key={tag.label} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant uppercase tracking-wider">
                    {tag.label}
                  </span>
                ))}
              </div>

              {/* Link pagamento */}
              <button
                onClick={() => { navigator.clipboard.writeText(checkoutUrl(plan)); notify('success', 'Link copiato negli appunti!'); }}
                className="flex items-center gap-2 text-[11px] font-label text-on-surface-variant hover:text-primary transition-colors truncate"
              >
                <ExternalLink size={12} />
                <span className="truncate">{checkoutUrl(plan)}</span>
              </button>

              {/* Azioni */}
              <div className="flex gap-2 pt-1 border-t border-outline-variant/20">
                <button
                  onClick={() => handleToggle(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-outline-variant/40 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all"
                >
                  {plan.is_attivo ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                  {plan.is_attivo ? 'Disattiva' : 'Attiva'}
                </button>
                <button
                  onClick={() => setModalPlan(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-outline-variant/40 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all"
                >
                  <Pencil size={13} /> Modifica
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  disabled={deletingId === plan.id}
                  className="p-2 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:border-red-300 hover:text-red-500 transition-all disabled:opacity-40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Nota Stripe */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex gap-3">
        <span className="text-lg flex-shrink-0">💳</span>
        <div>
          <p className="text-xs font-bold text-on-surface mb-0.5">Pagamenti Stripe</p>
          <p className="text-xs text-on-surface-variant">
            Ogni piano genera automaticamente un link di pagamento Stripe con il prezzo che hai impostato.
            Puoi condividere il link direttamente o incorporarlo nelle email.
            Nessun prodotto da creare manualmente su Stripe.
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalPlan !== undefined && (
          <Modal
            plan={modalPlan}
            onClose={() => setModalPlan(undefined)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
