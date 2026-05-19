import { motion } from 'motion/react';
import { CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

const storico = [
  { data: '2025-06-16', ora: '09:00', tipo: 'Hatha Yoga', stato: 'presente' },
  { data: '2025-06-14', ora: '18:30', tipo: 'Vinyasa Flow', stato: 'presente' },
  { data: '2025-06-11', ora: '09:00', tipo: 'Yin Yoga', stato: 'assente' },
  { data: '2025-06-09', ora: '10:00', tipo: 'Yoga & Meditazione', stato: 'presente' },
  { data: '2025-06-07', ora: '09:00', tipo: 'Hatha Yoga', stato: 'presente' },
  { data: '2025-06-04', ora: '18:30', tipo: 'Vinyasa Flow', stato: 'presente' },
  { data: '2025-06-02', ora: '09:00', tipo: 'Yin Yoga', stato: 'presente' },
  { data: '2025-05-31', ora: '10:00', tipo: 'Yoga & Meditazione', stato: 'assente' },
];

const prossime = [
  { data: '2025-06-23', ora: '09:00', tipo: 'Hatha Yoga', posti: 3 },
  { data: '2025-06-25', ora: '18:30', tipo: 'Vinyasa Flow', posti: 1 },
  { data: '2025-06-27', ora: '09:00', tipo: 'Yin Yoga', posti: 5 },
  { data: '2025-06-28', ora: '10:00', tipo: 'Yoga & Meditazione', posti: 2 },
];

const T = '#b56a56';
const S = '#8ba888';

export default function MyLessonsPanel() {
  const presenze = storico.filter(s => s.stato === 'presente').length;
  const assenzeN = storico.filter(s => s.stato === 'assente').length;

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Presenze', value: presenze, color: S },
          { label: 'Assenze', value: assenzeN, color: '#e57373' },
          { label: '% presenze', value: `${Math.round((presenze / storico.length) * 100)}%`, color: T },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-5 text-center">
            <p className="text-3xl font-serif font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Prossime lezioni */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
        <h3 className="font-serif text-xl text-on-surface mb-1">Prossime lezioni</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Calendario delle prossime sessioni</p>
        <div className="space-y-3">
          {prossime.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/20 hover:border-primary/30 group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${T}15` }}>
                  <CalendarCheck size={16} style={{ color: T }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{l.tipo}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(l.data).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} · {l.ora}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Posti liberi</p>
                <p className="font-bold text-sm" style={{ color: l.posti <= 2 ? '#e57373' : S }}>{l.posti}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Storico */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
        <h3 className="font-serif text-xl text-on-surface mb-1">Storico presenze</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Ultime lezioni</p>
        <div className="space-y-2">
          {storico.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0"
            >
              <div className="flex items-center gap-3">
                {s.stato === 'presente'
                  ? <CheckCircle2 size={16} style={{ color: S }} strokeWidth={1.5} />
                  : <XCircle size={16} className="text-red-400" strokeWidth={1.5} />
                }
                <div>
                  <p className="text-sm font-semibold text-on-surface">{s.tipo}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(s.data).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })} · {s.ora}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                background: s.stato === 'presente' ? `${S}18` : 'rgba(229,115,115,0.1)',
                color: s.stato === 'presente' ? S : '#e57373',
              }}>
                {s.stato === 'presente' ? 'Presente' : 'Assente'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
