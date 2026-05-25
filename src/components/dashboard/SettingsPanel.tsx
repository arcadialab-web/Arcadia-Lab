import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Bell, Shield, Trash2, CheckCircle2, Settings2 } from 'lucide-react';

const card = 'bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6 shadow-sm';

interface SectionProps { title: string; description: string; icon: React.ReactNode; children: React.ReactNode; }
function Section({ title, description, icon, children }: SectionProps) {
  return (
    <div className={card}>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-serif text-lg text-on-surface">{title}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-surface border border-outline-variant rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm";
const labelClass = "block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2";

export default function SettingsPanel({ isAdmin }: { isAdmin: boolean }) {
  const { user, signOut } = useAuth();

  const [profileForm, setProfileForm] = useState({ nome: '', cognome: '', telefono: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ nuova: '', conferma: '' });
  const [notifications, setNotifications] = useState({ emailLezioni: true, emailPromo: false, emailScadenza: true });
  const [requireCert, setRequireCert] = useState(true);
  const [certSaving, setCertSaving]   = useState(false);
  const [preLancio, setPreLancio]     = useState(false);
  const [preLancioSaving, setPreLancioSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('site_settings').select('key, value')
      .in('key', ['require_medical_cert', 'pre_lancio'])
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(data.map(r => [r.key, r.value]));
        if (map['require_medical_cert']) setRequireCert(map['require_medical_cert'] === 'true');
        if (map['pre_lancio'])           setPreLancio(map['pre_lancio'] === 'true');
      });
  }, [isAdmin]);

  const saveRequireCert = async (val: boolean) => {
    setCertSaving(true);
    await supabase.from('site_settings').upsert({ key: 'require_medical_cert', value: String(val) }, { onConflict: 'key' });
    setRequireCert(val);
    setCertSaving(false);
  };

  const savePreLancio = async (val: boolean) => {
    setPreLancioSaving(true);
    await supabase.from('site_settings').upsert({ key: 'pre_lancio', value: String(val) }, { onConflict: 'key' });
    setPreLancio(val);
    setPreLancioSaving(false);
  };

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('profile');
    const { error } = await supabase.auth.updateUser({
      data: { nome: profileForm.nome, cognome: profileForm.cognome, telefono: profileForm.telefono, bio: profileForm.bio },
    });
    setLoading(null);
    setProfileMsg(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Profilo aggiornato con successo.' });
    setTimeout(() => setProfileMsg(null), 4000);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.nuova !== passwordForm.conferma) {
      setPasswordMsg({ type: 'error', text: 'Le password non coincidono.' });
      return;
    }
    if (passwordForm.nuova.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Minimo 6 caratteri.' });
      return;
    }
    setLoading('password');
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.nuova,
      data: { must_change_password: false }, // rimuove il flag dopo il cambio
    });
    setLoading(null);
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: 'Password aggiornata con successo.' });
      setPasswordForm({ nuova: '', conferma: '' });
    }
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  const FeedbackMsg = ({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) =>
    msg ? (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm mt-4 ${msg.type === 'success' ? 'bg-primary/8 text-primary border border-primary/20' : 'bg-red-50 text-red-600 border border-red-200'}`}
        style={msg.type === 'success' ? { background: 'rgba(181,106,86,0.07)' } : {}}
      >
        {msg.type === 'success' && <CheckCircle2 size={15} />}
        {msg.text}
      </motion.div>
    ) : null;

  const SaveBtn = ({ id, label = 'Salva modifiche' }: { id: string; label?: string }) => (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={loading === id}
      className="bg-primary text-white px-7 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60 mt-2"
    >
      {loading === id ? 'Salvataggio...' : label}
    </motion.button>
  );

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Info account */}
      <div className={`${card} flex items-center gap-4`}>
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-xl font-serif italic text-primary font-bold flex-shrink-0">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-on-surface">{user?.email}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Account creato il {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>
          <span className="inline-block mt-1.5 text-[10px] font-label uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: isAdmin ? 'rgba(181,106,86,0.12)' : 'rgba(139,168,136,0.15)', color: isAdmin ? '#b56a56' : '#8ba888' }}>
            {isAdmin ? 'Amministratore' : 'Utente'}
          </span>
        </div>
      </div>

      {/* Dati personali */}
      <Section title="Dati personali" description="Nome, cognome e recapiti associati al tuo account" icon={<User size={17} className="text-primary" strokeWidth={1.5} />}>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome</label>
              <input className={inputClass} type="text" placeholder="Es. Cinzia" value={profileForm.nome} onChange={e => setProfileForm(p => ({ ...p, nome: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Cognome</label>
              <input className={inputClass} type="text" placeholder="Es. Rossi" value={profileForm.cognome} onChange={e => setProfileForm(p => ({ ...p, cognome: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Numero di telefono</label>
            <input className={inputClass} type="tel" placeholder="+39 333 000 0000" value={profileForm.telefono} onChange={e => setProfileForm(p => ({ ...p, telefono: e.target.value }))} />
          </div>
          {isAdmin && (
            <div>
              <label className={labelClass}>Bio / Descrizione studio</label>
              <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Descrizione dello studio..." value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} />
            </div>
          )}
          <FeedbackMsg msg={profileMsg} />
          <SaveBtn id="profile" />
        </form>
      </Section>

      {/* Sicurezza */}
      <Section title="Sicurezza" description="Modifica la password di accesso al tuo account" icon={<Lock size={17} className="text-primary" strokeWidth={1.5} />}>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className={labelClass}>Nuova password</label>
            <input className={inputClass} type="password" placeholder="••••••••" value={passwordForm.nuova} onChange={e => setPasswordForm(p => ({ ...p, nuova: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Conferma nuova password</label>
            <input className={inputClass} type="password" placeholder="••••••••" value={passwordForm.conferma} onChange={e => setPasswordForm(p => ({ ...p, conferma: e.target.value }))} />
          </div>
          <FeedbackMsg msg={passwordMsg} />
          <SaveBtn id="password" label="Aggiorna password" />
        </form>
      </Section>

      {/* Notifiche */}
      <Section title="Notifiche email" description="Scegli quali comunicazioni ricevere via email" icon={<Bell size={17} className="text-primary" strokeWidth={1.5} />}>
        <div className="space-y-4">
          {[
            { key: 'emailLezioni', label: 'Promemoria lezioni', desc: 'Ricevi un promemoria 24h prima di ogni lezione prenotata' },
            { key: 'emailScadenza', label: 'Scadenza abbonamento', desc: 'Avviso 7 giorni prima della scadenza del tuo abbonamento' },
            { key: 'emailPromo', label: 'Offerte e novità', desc: 'Newsletter con nuovi corsi, workshop e promozioni speciali' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4 py-3 border-b border-outline-variant/20 last:border-0">
              <div>
                <p className="text-sm font-semibold text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 ${notifications[key as keyof typeof notifications] ? 'bg-primary' : 'bg-outline'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${notifications[key as keyof typeof notifications] ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-primary text-white px-7 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all mt-2">
            Salva preferenze
          </motion.button>
        </div>
      </Section>

      {/* Privacy & Dati */}
      <Section title="Privacy e dati" description="Gestisci i tuoi dati personali in conformità al GDPR" icon={<Shield size={17} className="text-primary" strokeWidth={1.5} />}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/20">
            <div>
              <p className="text-sm font-semibold text-on-surface">Scarica i tuoi dati</p>
              <p className="text-xs text-on-surface-variant">Esporta tutti i dati associati al tuo account</p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-full hover:bg-primary/5 transition-all">
              Esporta
            </motion.button>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/20">
            <div>
              <p className="text-sm font-semibold text-on-surface">Consenso marketing</p>
              <p className="text-xs text-on-surface-variant">Gestisci il consenso al trattamento per finalità marketing</p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="text-xs font-bold text-on-surface-variant border border-outline-variant px-4 py-2 rounded-full hover:bg-surface-container transition-all">
              Modifica
            </motion.button>
          </div>
        </div>
      </Section>

      {/* Impostazioni admin */}
      {isAdmin && (
        <Section title="Gestione studio" description="Configurazione delle regole operative" icon={<Settings2 size={17} className="text-primary" strokeWidth={1.5} />}>
          <div className="space-y-5 divide-y divide-outline-variant/20">
            <div className="flex items-start justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-semibold text-on-surface">Richiedi certificato medico</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Se attivo, l'abbonamento resta in sospeso finché l'admin non sblocca manualmente l'utente dopo aver ricevuto il certificato.
                </p>
              </div>
              <button
                type="button"
                disabled={certSaving}
                onClick={() => saveRequireCert(!requireCert)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 disabled:opacity-60 ${requireCert ? 'bg-primary' : 'bg-outline'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${requireCert ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 pt-5">
              <div>
                <p className="text-sm font-semibold text-on-surface">Modalità pre-lancio</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Se attivo, il form della home diventa un modulo di iscrizione completo (abbonamento + certificato). Se disattivo, il form diventa un semplice contatto e i bottoni "Inizia ora" rimandano agli abbonamenti.
                </p>
                <span className={`inline-block mt-2 text-[10px] font-label uppercase tracking-widest px-2 py-0.5 rounded-full ${preLancio ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {preLancio ? '● Pre-lancio attivo' : '● Sito in produzione'}
                </span>
              </div>
              <button
                type="button"
                disabled={preLancioSaving}
                onClick={() => savePreLancio(!preLancio)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 disabled:opacity-60 ${preLancio ? 'bg-amber-500' : 'bg-outline'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${preLancio ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* Zona pericolosa */}
      <Section title="Zona pericolosa" description="Azioni irreversibili sull'account" icon={<Trash2 size={17} className="text-red-500" strokeWidth={1.5} />}>
        <div className="p-4 border border-red-200/60 rounded-2xl bg-red-50/30">
          <p className="text-sm font-semibold text-on-surface mb-1">Elimina account</p>
          <p className="text-xs text-on-surface-variant mb-4">Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati permanentemente.</p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="text-xs font-bold text-red-500 border border-red-300 px-5 py-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all"
            onClick={() => window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.') && signOut()}
          >
            Elimina il mio account
          </motion.button>
        </div>
      </Section>
    </div>
  );
}
