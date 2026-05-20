import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Eye, FileText, ExternalLink, RefreshCw, Calendar, Radio } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const T   = '#b56a56';
const S   = '#8ba888';
const card = 'bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6 shadow-sm';

type Periodo = '1' | '7' | '30' | '90' | 'custom';

interface Range { from: string; to: string }

function getRange(periodo: Periodo, custom: Range): { from: Date; to: Date } {
  const to  = new Date();
  to.setHours(23, 59, 59, 999);
  if (periodo === 'custom') {
    return {
      from: new Date(custom.from + 'T00:00:00'),
      to:   new Date(custom.to   + 'T23:59:59'),
    };
  }
  const from = new Date();
  from.setDate(from.getDate() - parseInt(periodo) + 1);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

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
  const [periodo, setPeriodo]   = useState<Periodo>('7');
  const [custom, setCustom]     = useState<Range>({ from: '', to: '' });
  const [loading, setLoading]   = useState(true);
  const [totaleVisite, setTotale]       = useState(0);
  const [pagineUniche, setPagineUniche] = useState(0);
  const [visitiGiorno, setPerGiorno]   = useState<{ data: string; visite: number }[]>([]);
  const [topPagine, setTopPagine]       = useState<{ path: string; count: number }[]>([]);
  const [topReferrer, setTopReferrer]   = useState<{ ref: string; count: number }[]>([]);

  // ── Live visitors ──
  const [liveCount, setLiveCount] = useState(0);
  const [livePages, setLivePages] = useState<string[]>([]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const connect = () => {
      channel = supabase.channel('live_visitors');
      channel
        .on('presence', { event: 'sync' }, () => {
          if (!channel) return;
          const state = channel.presenceState();
          const all   = Object.values(state).flat() as any[];
          setLiveCount(all.length);
          setLivePages(all.map(v => v.page).filter(Boolean));
        })
        .subscribe();
    };

    connect();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const load = useCallback(async () => {
    if (periodo === 'custom' && (!custom.from || !custom.to)) return;
    setLoading(true);

    const { from, to } = getRange(periodo, custom);
    const fromISO = from.toISOString();
    const toISO   = to.toISOString();

    const { data: visite } = await supabase
      .from('page_views')
      .select('path, referrer, created_at')
      .gte('created_at', fromISO)
      .lte('created_at', toISO)
      .order('created_at', { ascending: true });

    if (!visite) { setLoading(false); return; }

    // Totale
    setTotale(visite.length);

    // Pagine uniche
    const paths = new Set(visite.map(v => v.path));
    setPagineUniche(paths.size);

    // Visite per giorno
    const perGiorno: Record<string, number> = {};
    const days = Math.ceil((to.getTime() - from.getTime()) / 86400000);
    for (let i = 0; i <= days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
      perGiorno[key] = 0;
    }
    visite.forEach(v => {
      const d = new Date(v.created_at);
      const key = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
      if (key in perGiorno) perGiorno[key]++;
    });
    setPerGiorno(Object.entries(perGiorno).map(([data, visite]) => ({ data, visite })));

    // Top pagine
    const pagineCount: Record<string, number> = {};
    visite.forEach(v => { pagineCount[v.path] = (pagineCount[v.path] || 0) + 1; });
    setTopPagine(
      Object.entries(pagineCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([path, count]) => ({ path, count }))
    );

    // Top referrer
    const refCount: Record<string, number> = {};
    visite.forEach(v => {
      const ref = v.referrer ? new URL(v.referrer).hostname : 'Diretto';
      refCount[ref] = (refCount[ref] || 0) + 1;
    });
    setTopReferrer(
      Object.entries(refCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([ref, count]) => ({ ref, count }))
    );

    setLoading(false);
  }, [periodo, custom]);

  useEffect(() => { load(); }, [load]);

  const periodi: { id: Periodo; label: string }[] = [
    { id: '1',  label: 'Oggi' },
    { id: '7',  label: '7 giorni' },
    { id: '30', label: '30 giorni' },
    { id: '90', label: '90 giorni' },
    { id: 'custom', label: 'Personalizzato' },
  ];

  const maxPagine  = topPagine[0]?.count  || 1;
  const maxReferrer = topReferrer[0]?.count || 1;

  return (
    <div className="space-y-6">

      {/* Selettore periodo */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          {periodi.map(p => (
            <button key={p.id} onClick={() => setPeriodo(p.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${periodo === p.id ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-on-surface'}`}
            >
              {p.id === 'custom' && <Calendar size={12} />}
              {p.label}
            </button>
          ))}
        </div>
        {periodo === 'custom' && (
          <div className="flex gap-2 items-center">
            <input type="date" value={custom.from} onChange={e => setCustom(c => ({ ...c, from: e.target.value }))}
              className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary" />
            <span className="text-xs text-on-surface-variant">→</span>
            <input type="date" value={custom.to} onChange={e => setCustom(c => ({ ...c, to: e.target.value }))}
              className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary" />
            <button onClick={load} className="bg-primary text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all">
              Applica
            </button>
          </div>
        )}
        <button onClick={load} className="sm:ml-auto text-on-surface-variant hover:text-primary transition-colors" title="Aggiorna">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Widget live */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border bg-surface-container-low border-outline-variant/30"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: liveCount > 0 ? '#8ba888' : '#ccc' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: liveCount > 0 ? '#8ba888' : '#ccc' }} />
            </span>
            <Radio size={14} className="text-on-surface-variant" strokeWidth={1.5} />
            <span className="text-sm font-bold text-on-surface">
              {liveCount === 0 ? 'Nessun visitatore' : liveCount === 1 ? '1 persona sul sito ora' : `${liveCount} persone sul sito ora`}
            </span>
          </div>
          {livePages.length > 0 && (
            <div className="flex gap-2 flex-wrap ml-2">
              {Object.entries(
                livePages.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }), {})
              ).map(([page, count]) => (
                <span key={page} className="text-[11px] px-2.5 py-1 rounded-full bg-surface border border-outline-variant/30 text-on-surface-variant">
                  {page === '/' ? 'Home' : page} {count > 1 ? `×${count}` : ''}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-on-surface-variant">
          <RefreshCw size={20} className="animate-spin mr-3 text-primary" />
          <span className="font-serif italic">Caricamento analytics...</span>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Visite totali',  value: totaleVisite.toLocaleString('it-IT'),  icon: Eye },
              { label: 'Pagine visitate', value: String(pagineUniche), icon: FileText },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`${card} flex flex-col gap-4`}>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <k.icon size={17} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-3xl font-serif font-bold text-on-surface">{k.value}</p>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5">{k.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Grafico visite per giorno */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className={card}>
            <h3 className="font-serif text-xl text-on-surface mb-1">Andamento visite</h3>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Visite per giorno nel periodo selezionato</p>
            {visitiGiorno.length === 0 || totaleVisite === 0 ? (
              <div className="flex items-center justify-center h-40 text-on-surface-variant font-serif italic text-sm">Nessuna visita nel periodo</div>
            ) : (
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitiGiorno} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#efebdf" vertical={false} />
                    <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false}
                      interval={visitiGiorno.length > 14 ? Math.floor(visitiGiorno.length / 7) : 0} />
                    <YAxis tick={{ fontSize: 10, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="visite" name="Visite" stroke={T} strokeWidth={2.5} fill="url(#gA)" dot={false} activeDot={{ r: 5, fill: T }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Top pagine + Referrer */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Top pagine */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className={card}>
              <h3 className="font-serif text-xl text-on-surface mb-1">Pagine più visitate</h3>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Per numero di visite</p>
              {topPagine.length === 0 ? (
                <div className="text-center py-8 font-serif italic text-on-surface-variant text-sm">Nessun dato</div>
              ) : (
                <div className="space-y-3">
                  {topPagine.map((p, i) => (
                    <div key={p.path} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-on-surface-variant w-5 flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-on-surface truncate">{p.path === '/' ? 'Home' : p.path}</span>
                          <span className="text-on-surface-variant ml-2 flex-shrink-0">{p.count}</span>
                        </div>
                        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(p.count / maxPagine) * 100}%`, background: i === 0 ? T : S, opacity: 1 - i * 0.1 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Sorgenti */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className={card}>
              <h3 className="font-serif text-xl text-on-surface mb-1">Sorgenti di traffico</h3>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Da dove arrivano i visitatori</p>
              {topReferrer.length === 0 ? (
                <div className="text-center py-8 font-serif italic text-on-surface-variant text-sm">Nessun dato</div>
              ) : (
                <div className="space-y-4">
                  {topReferrer.map((r, i) => (
                    <div key={r.ref} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? T : S }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-on-surface flex items-center gap-1 truncate">
                            {r.ref !== 'Diretto' && <ExternalLink size={10} className="flex-shrink-0" />}
                            {r.ref}
                          </span>
                          <span className="text-on-surface-variant ml-2 flex-shrink-0">{r.count}</span>
                        </div>
                        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(r.count / maxReferrer) * 100}%`, background: i === 0 ? T : S }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Grafico a barre top pagine */}
          {topPagine.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }} className={card}>
              <h3 className="font-serif text-xl text-on-surface mb-1">Distribuzione visite</h3>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Visite per pagina</p>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPagine.map(p => ({ ...p, path: p.path === '/' ? 'Home' : p.path }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#efebdf" vertical={false} />
                    <XAxis dataKey="path" tick={{ fontSize: 10, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#5a544c', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Visite" fill={T} fillOpacity={0.85} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-2 p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
            <Eye size={14} className="text-primary flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-on-surface-variant">
              Le visite vengono registrate automaticamente ad ogni accesso al sito. Le sessioni della dashboard admin non vengono conteggiate.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
