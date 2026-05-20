import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function EventSuccess() {
  const [params]      = useSearchParams();
  const { user }      = useAuth();
  const sessionId     = params.get('session_id');
  const [ticket, setTicket] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !sessionId) { setLoading(false); return; }
    // Cerca il biglietto dell'utente loggato creato di recente
    supabase.from('event_tickets')
      .select('*, special_events(titolo, data_evento, luogo)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { setTicket(data); setLoading(false); });
  }, [user, sessionId]);

  const copy = () => {
    if (ticket?.codice_ref) {
      navigator.clipboard.writeText(ticket.codice_ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const evento = ticket?.special_events;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-2xl shadow-primary/8 border border-outline-variant/20 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-10 pb-6 text-center border-b border-outline-variant/10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle2 size={40} className="text-primary" strokeWidth={1.5} />
              </motion.div>
              <p className="text-xs font-label uppercase tracking-[0.3em] text-primary mb-2">Biglietto confermato</p>
              <h1 className="text-3xl font-serif text-on-surface mb-2">Ci vediamo lì!</h1>
              <p className="text-sm text-on-surface-variant">
                Controlla la tua email — ti abbiamo inviato il codice di riferimento.
              </p>
            </div>

            <div className="px-8 py-7 space-y-4">
              {loading ? (
                <p className="text-center font-serif italic text-on-surface-variant">Caricamento...</p>
              ) : ticket ? (
                <>
                  {/* Codice riferimento */}
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 text-center">
                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Codice di riferimento</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono text-3xl font-black text-primary tracking-widest">{ticket.codice_ref}</span>
                      <button onClick={copy} className="text-on-surface-variant hover:text-primary transition-colors">
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2">Presentalo all'ingresso insieme al certificato medico</p>
                  </div>

                  {/* Dettagli evento */}
                  {evento && (
                    <div className="border border-outline-variant/20 rounded-2xl p-4 space-y-1">
                      <p className="font-bold text-sm text-on-surface">{evento.titolo}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(evento.data_evento).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {new Date(evento.data_evento).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {evento.luogo && <p className="text-xs text-on-surface-variant">📍 {evento.luogo}</p>}
                    </div>
                  )}

                  {/* Avviso certificato */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(181,106,86,0.06)', border: '1px solid rgba(181,106,86,0.15)' }}>
                    <span className="text-lg flex-shrink-0">⚕️</span>
                    <p className="text-xs text-on-surface leading-relaxed">
                      Ricordati di portare il <strong>certificato medico di buona salute</strong> insieme al codice di riferimento.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-on-surface-variant">Controlla la tua email per il codice di riferimento.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {user && (
                  <Link to="/dashboard/events"
                    className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl text-sm text-center shadow-lg hover:bg-opacity-90 transition-all"
                  >
                    Vedi nel tuo account
                  </Link>
                )}
                <Link to="/"
                  className="flex-1 py-3.5 border border-outline-variant text-on-surface font-bold rounded-2xl text-sm text-center hover:bg-surface-container transition-all"
                >
                  Torna al sito
                </Link>
              </div>
            </div>

            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-on-surface-variant">
                Per info: <a href="mailto:arcadialabyoga@gmail.com" className="text-primary hover:underline">arcadialabyoga@gmail.com</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
