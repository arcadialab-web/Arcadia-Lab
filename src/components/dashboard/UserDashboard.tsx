import { motion } from 'motion/react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CalendarCheck, Clock, Flame, Star } from 'lucide-react';

const T = '#b56a56';
const S = '#8ba888';

const lezioniRimanenti = 7;
const lezioniTotali = 12;
const lezioniUsate = lezioniTotali - lezioniRimanenti;
const scadenzaAbbonamento = new Date('2025-07-15');
const oggi = new Date();
const giorniRimasti = Math.ceil((scadenzaAbbonamento.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24));

const presenzeMensili = [
  { settimana: 'Sett 1', presenze: 2 },
  { settimana: 'Sett 2', presenze: 3 },
  { settimana: 'Sett 3', presenze: 1 },
  { settimana: 'Sett 4', presenze: 3 },
];

const prossimeLezioni = [
  { giorno: 'Lun 23 Giu', ora: '09:00', tipo: 'Hatha Yoga', posti: 3 },
  { giorno: 'Mer 25 Giu', ora: '18:30', tipo: 'Vinyasa Flow', posti: 1 },
  { giorno: 'Ven 27 Giu', ora: '09:00', tipo: 'Yin Yoga', posti: 5 },
];

const lezioniDonut = [
  { name: 'Usate', value: lezioniUsate, fill: T },
  { name: 'Rimanenti', value: lezioniRimanenti, fill: `${S}55` },
];

const percentualeLezioni = Math.round((lezioniRimanenti / lezioniTotali) * 100);
const card = 'bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6 shadow-sm';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-outline-variant/40 rounded-2xl px-4 py-3 shadow-xl text-sm">
      <p className="font-label uppercase tracking-widest text-on-surface-variant text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: T }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function UserDashboard({ userName }: { userName: string }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Benvenuto — compatto */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low"
      >
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm font-serif italic text-primary font-bold flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">Bentornata/o, <span className="text-primary">{userName}</span></p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border flex-shrink-0" style={{ borderColor: `${T}30`, background: `${T}0a` }}>
          <Star size={11} style={{ color: T }} fill={T} strokeWidth={0} />
          <span className="text-[11px] font-bold" style={{ color: T }}>Piano Mensile</span>
        </div>
      </motion.div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Lezioni rimaste', value: `${lezioniRimanenti}/${lezioniTotali}`, icon: CalendarCheck, color: T, delta: `${percentualeLezioni}% disp.` },
          { label: 'Giorni alla scadenza', value: `${giorniRimasti}`, icon: Clock, color: S, delta: scadenzaAbbonamento.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) },
          { label: 'Presenze mese', value: '9', icon: Flame, color: '#c4a882', delta: '+2 vs mese scorso' },
          { label: 'Lezioni totali', value: '34', icon: Star, color: T, delta: 'dall\'inizio' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-4 sm:p-6 shadow-sm flex flex-col gap-3"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}15` }}>
              <stat.icon size={16} style={{ color: stat.color }} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-serif font-bold text-on-surface">{stat.value}</p>
              <p className="text-[10px] sm:text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5 leading-tight">{stat.label}</p>
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{stat.delta}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row: donut lezioni + presenze */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Donut */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-4 sm:p-6 shadow-sm">
          <h3 className="font-serif text-base sm:text-xl text-on-surface mb-0.5">Utilizzo abbonamento</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">Lezioni correnti</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={lezioniDonut} cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {lezioniDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-serif font-bold text-on-surface">{percentualeLezioni}%</span>
                <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant">rimaste</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: 'Usate', count: lezioniUsate, color: T },
                { label: 'Rimanenti', count: lezioniRimanenti, color: S },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-on-surface-variant font-label uppercase tracking-wider">{b.label}</span>
                    <span className="font-bold text-on-surface">{b.count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(b.count / lezioniTotali) * 100}%`, background: b.color }} />
                  </div>
                </div>
              ))}
              <div className="pt-2.5 border-t border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">Scadenza</p>
                <p className="font-bold text-xs sm:text-sm text-on-surface mt-0.5">{scadenzaAbbonamento.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs mt-0.5 font-semibold" style={{ color: giorniRimasti < 10 ? '#e57373' : S }}>
                  {giorniRimasti > 0 ? `${giorniRimasti} giorni rimasti` : 'Abbonamento scaduto'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Presenze */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }} className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-4 sm:p-6 shadow-sm">
          <h3 className="font-serif text-base sm:text-xl text-on-surface mb-0.5">Presenze mensili</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">Lezioni frequentate — Giugno</p>
          <div style={{ height: 170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={presenzeMensili} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={S} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={S} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#efebdf" vertical={false} />
                <XAxis dataKey="settimana" tick={{ fontSize: 10, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="presenze" name="Presenze" stroke={S} strokeWidth={2.5} fill="url(#gU)" dot={{ fill: S, strokeWidth: 0, r: 5 }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Prossime lezioni */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }} className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-4 sm:p-6 shadow-sm">
        <h3 className="font-serif text-base sm:text-xl text-on-surface mb-0.5">Prossime lezioni</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">I tuoi prossimi appuntamenti</p>
        <div className="space-y-2">
          {prossimeLezioni.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.07 }}
              className="flex items-center justify-between p-3 sm:p-4 bg-surface rounded-2xl border border-outline-variant/20 hover:border-primary/30 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${T}12` }}>
                  <CalendarCheck size={14} style={{ color: T }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors">{l.tipo}</p>
                  <p className="text-[10px] sm:text-xs text-on-surface-variant">{l.giorno} · {l.ora}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] sm:text-[10px] font-label uppercase tracking-wider text-on-surface-variant">Posti</p>
                <p className="font-bold text-sm mt-0.5" style={{ color: l.posti <= 2 ? '#e57373' : S }}>{l.posti}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-xs text-on-surface-variant/40 font-label">* Dati di esempio. Collega Supabase per dati reali.</p>
    </div>
  );
}
