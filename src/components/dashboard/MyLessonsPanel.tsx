import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, RefreshCw, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const GREEN = '#8ba888';

export default function MyLessonsPanel() {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [prossime, setProssime] = useState<any[]>([]);
  const [passate, setPassate]   = useState<any[]>([]);
  const [sub, setSub]           = useState<any>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const oggi = new Date().toISOString().split('T')[0];

    const [{ data: bookings }, { data: s }] = await Promise.all([
      supabase
        .from('course_bookings')
        .select('id, data, stato, course_id, subscription_id, courses(nome, ora_inizio, ora_fine, colore)')
        .eq('user_id', user.id)
        .eq('stato', 'confermata')
        .order('data', { ascending: false }),
      supabase
        .from('subscriptions')
        .select('id, lezioni_totali, lezioni_usate, stato')
        .eq('user_id', user.id)
        .in('stato', ['attivo', 'in_attesa'])
        .maybeSingle(),
    ]);

    const all = bookings ?? [];
    setProssime(all.filter(b => b.data >= oggi).sort((a, b) => a.data.localeCompare(b.data)));
    setPassate(all.filter(b => b.data < oggi));
    setSub(s ?? null);
    setLoading(false);
  };

  const disdici = async (bookingId: string) => {
    if (!sub) return;
    // Controlla 24h prima
    const booking = [...prossime, ...passate].find(b => b.id === bookingId);
    if (booking) {
      const lezione = new Date(booking.data + 'T00:00:00');
      const diff = lezione.getTime() - Date.now();
      if (diff < 24 * 60 * 60 * 1000) {
        alert('Non puoi annullare questa prenotazione: mancano meno di 24 ore alla lezione.');
        return;
      }
    }
    if (!confirm('Vuoi disdire questa prenotazione?')) return;
    await supabase.from('course_bookings').update({ stato: 'cancellata' }).eq('id', bookingId);
    await supabase.rpc('decrement_lezioni_usate', { sub_id: sub.id });
    load();
  };

  useEffect(() => { load(); }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-on-surface-variant">
        <RefreshCw size={20} className="animate-spin mr-3 text-primary" />
        <span className="font-serif italic">Caricamento...</span>
      </div>
    );
  }

  const lezioniRimaste = sub ? sub.lezioni_totali - sub.lezioni_usate : null;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Stats abbonamento */}
      {sub && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Lezioni totali',  value: sub.lezioni_totali },
            { label: 'Utilizzate',      value: sub.lezioni_usate },
            { label: 'Rimanenti',       value: lezioniRimaste, color: lezioniRimaste === 0 ? '#e57373' : GREEN },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-5 text-center">
              <p className="text-3xl font-serif font-bold" style={{ color: s.color ?? '#2b2927' }}>{s.value}</p>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Prossime prenotazioni */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
        <h3 className="font-serif text-xl text-on-surface mb-1">Prossime lezioni</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Prenotazioni confermate</p>
        {prossime.length === 0 ? (
          <p className="text-center py-8 font-serif italic text-on-surface-variant text-sm">Nessuna lezione prenotata</p>
        ) : (
          <div className="space-y-3">
            {prossime.map((b, i) => {
              const course = b.courses as any;
              const dataFmt = new Date(b.data + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
              const ore = course ? `${course.ora_inizio?.slice(0,5)}–${course.ora_fine?.slice(0,5)}` : '';
              const diff = new Date(b.data + 'T00:00:00').getTime() - Date.now();
              const puoDisdire = diff >= 24 * 60 * 60 * 1000;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/20 hover:border-primary/30 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: course?.colore ? course.colore + '22' : 'rgba(139,168,136,0.15)' }}>
                      <CalendarCheck size={16} style={{ color: course?.colore ?? GREEN }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{course?.nome ?? '—'}</p>
                      <p className="text-xs text-on-surface-variant">{dataFmt}{ore && ` · ${ore}`}</p>
                    </div>
                  </div>
                  {puoDisdire && (
                    <button onClick={() => disdici(b.id)}
                      className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-red-500 transition-colors font-label uppercase tracking-wider flex-shrink-0 ml-3"
                    >
                      <X size={13} /> Disdici
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Storico */}
      {passate.length > 0 && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
          <h3 className="font-serif text-xl text-on-surface mb-1">Storico lezioni</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Lezioni passate</p>
          <div className="space-y-2">
            {passate.map((b, i) => {
              const course = b.courses as any;
              const dataFmt = new Date(b.data + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' });
              return (
                <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: course?.colore ?? '#ccc' }} />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{course?.nome ?? '—'}</p>
                      <p className="text-xs text-on-surface-variant">{dataFmt}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">Completata</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
