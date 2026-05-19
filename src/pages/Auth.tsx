import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'register' | 'recovery';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMessage(null);
  };

  const switchMode = (newMode: Mode) => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Le password non coincidono.' });
          return;
        }
        if (password.length < 6) {
          setMessage({ type: 'error', text: 'La password deve essere di almeno 6 caratteri.' });
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Registrazione completata! Controlla la tua email per confermare l\'account.' });
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Email inviata! Controlla la tua casella di posta per reimpostare la password.' });
        setEmail('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Si è verificato un errore. Riprova.';
      setMessage({ type: 'error', text: translateError(msg) });
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    login: 'Bentornato',
    register: 'Crea il tuo account',
    recovery: 'Recupera la password',
  };

  const subtitles: Record<Mode, string> = {
    login: 'Accedi alla tua area riservata',
    register: 'Unisciti alla comunità di Arcadia Lab.',
    recovery: 'Ti invieremo un link via email',
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-primary-container/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <Link to="/" className="flex flex-col items-center gap-2">
          <img
            src="https://fnvchbtcytugkrtnrvyj.supabase.co/storage/v1/object/public/Logo%20piattaforma/ARCADIA%20LAB%20(1).png"
            alt="Arcadia Lab."
            className="h-16 object-contain"
          />
          <span className="text-2xl font-serif italic text-primary tracking-tight">Arcadia Lab.</span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-surface-container-low border border-outline-variant/40 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-primary/5"
      >
        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container p-1 rounded-2xl mb-8">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-label uppercase tracking-widest font-bold transition-all duration-300 ${
                mode === m
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {m === 'login' ? 'Accedi' : 'Registrati'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-serif text-on-surface mb-1">{titles[mode]}</h1>
            <p className="text-sm text-on-surface-variant mb-8">{subtitles[mode]}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="la-tua@email.com"
                  className="w-full bg-surface border border-outline-variant rounded-2xl px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                />
              </div>

              {/* Password */}
              {mode !== 'recovery' && (
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface border border-outline-variant rounded-2xl px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                  />
                </div>
              )}

              {/* Conferma password (solo registrazione) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
                    Conferma Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface border border-outline-variant rounded-2xl px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                  />
                </div>
              )}

              {/* Link recupero password */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('recovery')}
                    className="text-xs text-primary hover:underline transition-all"
                  >
                    Password dimenticata?
                  </button>
                </div>
              )}

              {/* Messaggio feedback */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      message.type === 'success'
                        ? 'bg-primary-container/20 text-primary border border-primary/20'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-opacity-90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Caricamento...
                  </span>
                ) : mode === 'login' ? 'Accedi' : mode === 'register' ? 'Crea account' : 'Invia email'}
              </motion.button>
            </form>

            {/* Back to login (solo recovery) */}
            {mode === 'recovery' && (
              <p className="text-center text-sm text-on-surface-variant mt-6">
                <button onClick={() => switchMode('login')} className="text-primary hover:underline">
                  ← Torna al login
                </button>
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Back to site */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Link to="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
          ← Torna al sito
        </Link>
      </motion.div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o password non corretti.';
  if (msg.includes('Email not confirmed')) return 'Devi prima confermare la tua email.';
  if (msg.includes('User already registered')) return 'Questa email è già registrata. Prova ad accedere.';
  if (msg.includes('rate limit')) return 'Troppi tentativi. Riprova tra qualche minuto.';
  return msg;
}
