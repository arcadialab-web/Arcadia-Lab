import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const S = '#8ba888';

export default function MyLessonsPanel() {
  const { user } = useAuth();
  const [loading, setLoading]       = useState(true);
  const [storico, setStorico]       = useState<any[]>([]);
  const [prossime, setProssime]     = useState<any[]>([]);
  const [stats, setStats]           = useState({ presenze: 0, assenze: 0 });

  const load = async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: bookings }, { data: lessons }] = await Promise.all([
      // Storico prenotazioni con dettaglio lezione
      supabase.from('bookings')
        .select('id, presenza, stato, created_at, lessons(id, titolo, data_ora)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      // Prossime lezioni disponibili
      supabase.from('lessons')
        .select('*')
        .eq('is_attiva', true)
        .gte('data_ora', new Date().toISOString())
        .order('data_ora', { ascending: true })
        .limit(4),
    ]);

    const presenze = bookings?.filter(b => b.presenza).length || 0;
    const assenze  = bookings?.filter(b => !b.presenza && b.stato !== 'cancellata').length || 0;

    setStorico(bookings || []);
    setProssime(lessons || []);
    setStats({ presenze, assenze });
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const pct = stats.presenze + stats.assenze > 0
    ? Math.round((stats.presenze / (stats.presenze + stats.assenze)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-on-surface-variant">
        <RefreshCw size={20} className="animate-spin mr-3 text-primary" />
        <span className="font-serif italic">Caricamento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Presenze', count: stats.presenze,    color: S },
          { label: 'Assenze',  count: stats.assenze,     color: '#e57373' },
          { label: '% presenze', count: `${pct}%`,       color: '#b56a56' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-5 text-center">
            <p className="text-3xl font-serif font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Prossime lezioni */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
        <h3 className="font-serif text-xl text-on-surface mb-1">Prossime lezioni</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Calendario sessioni disponibili</p>
        {prossime.length === 0 ? (
          <p className="text-center py-8 font-serif italic text-on-surface-variant text-sm">Nessuna lezione programmata al momento</p>
        ) : (
          <div className="space-y-3">
            {prossime.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/20 hover:border-primary/30 group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck size={16} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{l.titolo}</p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(l.data_ora).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} · {new Date(l.data_ora).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Posti liberi</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: l.posti_disponibili <= 2 ? '#e57373' : S }}>
                    {l.posti_disponibili}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Storico */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
        <h3 className="font-serif text-xl text-on-surface mb-1">Storico prenotazioni</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Ultime {storico.length} prenotazioni</p>
        {storico.length === 0 ? (
          <p className="text-center py-8 font-serif italic text-on-surface-variant text-sm">Nessuna prenotazione ancora</p>
        ) : (
          <div className="space-y-2">
            {storico.map((b, i) => {
              const lesson = b.lessons as any;
              return (
                <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {b.presenza
                      ? <CheckCircle2 size={16} style={{ color: S }} strokeWidth={1.5} />
                      : <XCircle size={16} className="text-red-400" strokeWidth={1.5} />
                    }
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{lesson?.titolo ?? 'Lezione'}</p>
                      <p className="text-xs text-on-surface-variant">
                        {lesson?.data_ora
                          ? new Date(lesson.data_ora).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })
                          : new Date(b.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
                        }
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                    background: b.presenza ? 'rgba(139,168,136,0.15)' : 'rgba(229,115,115,0.1)',
                    color:      b.presenza ? S : '#e57373',
                  }}>
                    {b.presenza ? 'Presente' : b.stato === 'cancellata' ? 'Cancellata' : 'Assente'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
