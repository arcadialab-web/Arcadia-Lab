import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Eye, Users, MousePointerClick, Clock } from 'lucide-react';

const T = '#b56a56';
const S = '#8ba888';

const visitiSettimanali = [
  { giorno: 'Lun', visite: 42, unici: 31 },
  { giorno: 'Mar', visite: 58, unici: 44 },
  { giorno: 'Mer', visite: 75, unici: 60 },
  { giorno: 'Gio', visite: 61, unici: 48 },
  { giorno: 'Ven', visite: 89, unici: 72 },
  { giorno: 'Sab', visite: 112, unici: 94 },
  { giorno: 'Dom', visite: 67, unici: 55 },
];

const visitiMensili = [
  { mese: 'Gen', visite: 820 }, { mese: 'Feb', visite: 940 },
  { mese: 'Mar', visite: 1120 }, { mese: 'Apr', visite: 980 },
  { mese: 'Mag', visite: 1340 }, { mese: 'Giu', visite: 1580 },
  { mese: 'Lug', visite: 1420 }, { mese: 'Ago', visite: 1100 },
  { mese: 'Set', visite: 1680 }, { mese: 'Ott', visite: 1890 },
  { mese: 'Nov', visite: 2100 }, { mese: 'Dic', visite: 1760 },
];

const pagineTop = [
  { pagina: 'Home', visite: 3420, bounce: '42%' },
  { pagina: 'Corsi', visite: 1840, bounce: '35%' },
  { pagina: 'Abbonamenti', visite: 1560, bounce: '28%' },
  { pagina: 'Workshop', visite: 980, bounce: '51%' },
  { pagina: 'Chi sono', visite: 760, bounce: '38%' },
];

const dispositivi = [
  { name: 'Mobile', value: 62, color: T },
  { name: 'Desktop', value: 31, color: S },
  { name: 'Tablet', value: 7, color: '#c4a882' },
];

const sorgenti = [
  { name: 'Instagram', visite: 1840, color: T },
  { name: 'Ricerca Google', visite: 1420, color: S },
  { name: 'Diretto', visite: 980, color: '#c4a882' },
  { name: 'Referral', visite: 340, color: '#d2ccb6' },
];

const kpis = [
  { label: 'Visite totali (mese)', value: '4.580', icon: Eye, delta: '+18%', positive: true },
  { label: 'Utenti unici', value: '3.241', icon: Users, delta: '+22%', positive: true },
  { label: 'Tasso di conversione', value: '3.2%', icon: MousePointerClick, delta: '+0.8%', positive: true },
  { label: 'Tempo medio sul sito', value: '2m 47s', icon: Clock, delta: '+12s', positive: true },
];

const card = 'bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6 shadow-sm';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-outline-variant/40 rounded-2xl px-4 py-3 shadow-xl text-sm">
      <p className="font-label uppercase tracking-widest text-on-surface-variant text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? T }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPanel() {
  return (
    <div className="space-y-6">

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={`${card} flex flex-col gap-4`}>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <kpi.icon size={17} className="text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${S}22`, color: S }}>{kpi.delta}</span>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-on-surface">{kpi.value}</p>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visite mensili */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className={card}>
        <h3 className="font-serif text-xl text-on-surface mb-1">Visite mensili</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-6">Anno corrente</p>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitiMensili} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={T} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#efebdf" vertical={false} />
              <XAxis dataKey="mese" tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visite" name="Visite" stroke={T} strokeWidth={2.5} fill="url(#gradAnalytics)" dot={{ fill: T, strokeWidth: 0, r: 3 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row: visite settimana + dispositivi */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className={card}>
          <h3 className="font-serif text-xl text-on-surface mb-1">Visite per giorno</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-6">Ultima settimana</p>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitiSettimanali} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={22} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#efebdf" vertical={false} />
                <XAxis dataKey="giorno" tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visite" name="Visite totali" fill={T} fillOpacity={0.8} radius={[6, 6, 0, 0]} />
                <Bar dataKey="unici" name="Utenti unici" fill={S} fillOpacity={0.7} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }} className={card}>
          <h3 className="font-serif text-xl text-on-surface mb-1">Dispositivi</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">Tipologia di accesso</p>
          <div className="flex items-center gap-6">
            <div style={{ height: 180, flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dispositivi} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {dispositivi.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {dispositivi.map((d) => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <div>
                    <p className="text-xs font-bold text-on-surface">{d.name}</p>
                    <p className="text-xs text-on-surface-variant">{d.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row: pagine top + sorgenti */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }} className={card}>
          <h3 className="font-serif text-xl text-on-surface mb-1">Pagine più visitate</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Top 5 pagine del sito</p>
          <div className="space-y-3">
            {pagineTop.map((p, i) => (
              <div key={p.pagina} className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-on-surface">{p.pagina}</span>
                    <span className="text-on-surface-variant">{p.visite.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(p.visite / pagineTop[0].visite) * 100}%`, background: i === 0 ? T : S, opacity: 1 - i * 0.12 }} />
                  </div>
                </div>
                <span className="text-[10px] text-on-surface-variant font-label">bounce {p.bounce}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 }} className={card}>
          <h3 className="font-serif text-xl text-on-surface mb-1">Sorgenti di traffico</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Da dove arrivano i visitatori</p>
          <div className="space-y-4">
            {sorgenti.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-on-surface">{s.name}</span>
                    <span className="text-on-surface-variant">{s.visite.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.visite / sorgenti[0].visite) * 100}%`, background: s.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 bg-surface rounded-2xl border border-outline-variant/20">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Suggerimento</p>
            <p className="text-xs text-on-surface">Instagram genera il 40% del traffico — continua a pubblicare contenuti regolarmente.</p>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-xs text-on-surface-variant/40 font-label">
        * Dati di esempio. Integra Google Analytics o Plausible per dati reali.
      </p>
    </div>
  );
}
