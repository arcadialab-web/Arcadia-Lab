import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, Euro, CalendarCheck, ArrowUpRight } from 'lucide-react';

const T = '#b56a56';
const S = '#8ba888';

const revenueData = [
  { mese: 'Gen', ricavi: 1200 }, { mese: 'Feb', ricavi: 1450 },
  { mese: 'Mar', ricavi: 1800 }, { mese: 'Apr', ricavi: 1600 },
  { mese: 'Mag', ricavi: 2100 }, { mese: 'Giu', ricavi: 2400 },
  { mese: 'Lug', ricavi: 2200 }, { mese: 'Ago', ricavi: 1900 },
  { mese: 'Set', ricavi: 2600 }, { mese: 'Ott', ricavi: 2800 },
  { mese: 'Nov', ricavi: 3100 }, { mese: 'Dic', ricavi: 2900 },
];

const planData = [
  { name: 'Mensile', value: 38, color: T },
  { name: 'Trimestrale', value: 29, color: S },
  { name: 'Annuale', value: 21, color: '#c4a882' },
  { name: 'Singola', value: 12, color: '#d2ccb6' },
];

const attendanceData = [
  { g: 'Lun', p: 12 }, { g: 'Mar', p: 8 }, { g: 'Mer', p: 15 },
  { g: 'Gio', p: 10 }, { g: 'Ven', p: 18 }, { g: 'Sab', p: 22 }, { g: 'Dom', p: 6 },
];

const kpis = [
  { label: 'Abbonati attivi', value: '47', icon: Users, delta: '+12%', sub: 'vs mese scorso' },
  { label: 'Ricavi mensili', value: '€ 2.900', icon: Euro, delta: '+8%', sub: 'vs mese scorso' },
  { label: 'Lezioni questo mese', value: '24', icon: CalendarCheck, delta: '+3', sub: 'vs mese scorso' },
  { label: 'Tasso rinnovo', value: '84%', icon: TrendingUp, delta: '+5%', sub: 'vs mese scorso' },
];

const ultimeAttivita = [
  { testo: 'Giulia Ferretti ha rinnovato l\'abbonamento mensile', tempo: '2 ore fa', tipo: 'rinnovo' },
  { testo: 'Nuova prenotazione: Vinyasa Flow — Mercoledì 18:30', tempo: '4 ore fa', tipo: 'prenotazione' },
  { testo: 'Marta Conti ha acquistato il piano trimestrale', tempo: '1 giorno fa', tipo: 'acquisto' },
  { testo: 'L\'abbonamento di Laura Ricci è scaduto', tempo: '2 giorni fa', tipo: 'scadenza' },
];

const card = 'bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6 shadow-sm';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-outline-variant/40 rounded-2xl px-4 py-3 shadow-xl text-sm">
      <p className="font-label uppercase tracking-widest text-on-surface-variant text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? T }} className="font-bold">
          {p.name?.toLowerCase().includes('ricav') ? `€ ${Number(p.value).toLocaleString('it-IT')}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const totaleAnno = revenueData.reduce((a, b) => a + b.ricavi, 0);

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
              <div className="flex items-center gap-1 text-xs font-bold" style={{ color: S }}>
                <ArrowUpRight size={13} />
                {kpi.delta}
              </div>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-on-surface">{kpi.value}</p>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5">{kpi.label}</p>
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ricavi anno + Totale */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className={card}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl text-on-surface">Ricavi annuali</h3>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5">Anno corrente</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-serif font-bold text-primary">€ {totaleAnno.toLocaleString('it-IT')}</p>
            <p className="text-xs text-on-surface-variant">Totale anno</p>
          </div>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#efebdf" vertical={false} />
              <XAxis dataKey="mese" tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ricavi" name="Ricavi" stroke={T} strokeWidth={2.5} fill="url(#gR)" dot={{ fill: T, strokeWidth: 0, r: 3 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row: presenze + piani */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className={card}>
          <h3 className="font-serif text-xl text-on-surface mb-1">Presenze settimanali</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Lezioni per giorno</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#efebdf" vertical={false} />
                <XAxis dataKey="g" tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="p" name="Presenze" radius={[8, 8, 0, 0]}>
                  {attendanceData.map((_, i) => <Cell key={i} fill={i === 5 ? T : S} fillOpacity={i === 5 ? 1 : 0.6} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }} className={card}>
          <h3 className="font-serif text-xl text-on-surface mb-1">Piani abbonamento</h3>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">Distribuzione abbonati</p>
          <div className="flex items-center gap-4">
            <div style={{ height: 190, flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {planData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Quota']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {planData.map(p => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <div>
                    <p className="text-xs font-bold text-on-surface">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">{p.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ultime attività */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }} className={card}>
        <h3 className="font-serif text-xl text-on-surface mb-1">Attività recente</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Ultimi eventi dello studio</p>
        <div className="space-y-3">
          {ultimeAttivita.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-outline-variant/10 last:border-0">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.tipo === 'scadenza' ? '#e57373' : a.tipo === 'rinnovo' ? S : T }} />
              <div className="flex-1">
                <p className="text-sm text-on-surface">{a.testo}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{a.tempo}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-xs text-on-surface-variant/40 font-label">* Dati di esempio. Collega Supabase per dati reali.</p>
    </div>
  );
}
