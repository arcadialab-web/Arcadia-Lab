import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, BarChart2, CreditCard, Users,
  Settings, CalendarCheck, BookOpen, Star, PackagePlus,
  CheckCircle2, XCircle, Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel';
import SubscriptionsPanel from '../components/dashboard/SubscriptionsPanel';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import MyLessonsPanel from '../components/dashboard/MyLessonsPanel';
import PlansManagementPanel from '../components/dashboard/PlansManagementPanel';
import CoursesManagementPanel from '../components/dashboard/CoursesManagementPanel';
import EventsManagementPanel from '../components/dashboard/EventsManagementPanel';

const ADMIN_EMAILS = ['ai.danielcorso@gmail.com', 'arcadialabyoga@gmail.com'];

const adminNav = [
  { id: 'overview',       label: 'Panoramica',        icon: <LayoutDashboard size={17} strokeWidth={1.5} /> },
  { id: 'analytics',      label: 'Analytics sito',    icon: <BarChart2 size={17} strokeWidth={1.5} /> },
  { id: 'plans',          label: 'Piani & Prezzi',    icon: <PackagePlus size={17} strokeWidth={1.5} /> },
  { id: 'courses',        label: 'Corsi',             icon: <CalendarCheck size={17} strokeWidth={1.5} /> },
  { id: 'events',         label: 'Eventi Speciali',   icon: <Star size={17} strokeWidth={1.5} /> },
  { id: 'subscriptions',  label: 'Abbonamenti',       icon: <CreditCard size={17} strokeWidth={1.5} /> },
  { id: 'users',          label: 'Utenti',            icon: <Users size={17} strokeWidth={1.5} /> },
  { id: 'settings',       label: 'Impostazioni',      icon: <Settings size={17} strokeWidth={1.5} /> },
];

const userNav = [
  { id: 'overview',  label: 'Il mio spazio',  icon: <LayoutDashboard size={17} strokeWidth={1.5} /> },
  { id: 'lessons',   label: 'Le mie lezioni', icon: <CalendarCheck size={17} strokeWidth={1.5} /> },
  { id: 'plan',      label: 'Abbonamento',    icon: <Star size={17} strokeWidth={1.5} /> },
  { id: 'bookings',  label: 'Prenotazioni',   icon: <BookOpen size={17} strokeWidth={1.5} /> },
  { id: 'events',    label: 'I miei eventi',  icon: <BarChart2 size={17} strokeWidth={1.5} /> },
  { id: 'settings',  label: 'Impostazioni',   icon: <Settings size={17} strokeWidth={1.5} /> },
];

function UsersPanel() {
  const [utenti, setUtenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase
      .from('profiles')
      .select('id, nome, cognome, email, created_at, role, prenotazioni_sbloccate')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setUtenti(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const togglePrenotazioni = async (id: string, current: boolean) => {
    await supabase.from('profiles').update({ prenotazioni_sbloccate: !current }).eq('id', id);
    load();
  };

  if (loading) return <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento utenti...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800">
        <Lock size={14} className="flex-shrink-0 mt-0.5 text-blue-600" strokeWidth={1.5} />
        <p>Una volta ricevuto il <strong>certificato medico</strong> di un utente, clicca su <strong>"Sblocca prenotazioni"</strong> per permettergli di prenotare le lezioni.</p>
      </div>
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {['Utente', 'Iscrizione', 'Ruolo', 'Prenotazioni'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {utenti.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 font-serif italic text-on-surface-variant">Nessun utente registrato</td></tr>
              ) : utenti.map((u) => {
                const displayName = u.nome ? `${u.nome} ${u.cognome || ''}`.trim() : (u.email ?? 'Utente');
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{displayName}</p>
                          <p className="text-xs text-on-surface-variant">{u.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{
                        background: isAdmin ? 'rgba(181,106,86,0.12)' : 'rgba(139,168,136,0.15)',
                        color:      isAdmin ? '#b56a56' : '#8ba888',
                      }}>
                        {isAdmin ? 'Admin' : 'Utente'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isAdmin ? (
                        <span className="text-xs text-on-surface-variant">—</span>
                      ) : (
                        <button onClick={() => togglePrenotazioni(u.id, u.prenotazioni_sbloccate)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${u.prenotazioni_sbloccate ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-amber-50 text-amber-700 hover:bg-green-100 hover:text-green-700'}`}
                        >
                          {u.prenotazioni_sbloccate
                            ? <><CheckCircle2 size={12} /> Sbloccate</>
                            : <><XCircle size={12} /> Bloccate — Sblocca</>
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MyPlanPanel() {
  const { user } = useAuth();
  const [sub, setSub]     = useState<any>(null);
  const [piani, setPiani] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('subscriptions').select('*, plans(nome, descrizione)').eq('user_id', user.id).eq('stato', 'attivo').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('plans').select('*').eq('is_attivo', true).order('ordine'),
    ]).then(([{ data: s }, { data: p }]) => {
      setSub(s); setPiani(p || []); setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento...</div>;

  const lezioniTotali = sub?.lezioni_totali || 0;
  const lezioniUsate  = sub?.lezioni_usate  || 0;
  const pct = lezioniTotali > 0 ? Math.round((lezioniUsate / lezioniTotali) * 100) : 0;
  const scadenza = sub?.data_scadenza ? new Date(sub.data_scadenza) : null;
  const giorniRimasti = scadenza ? Math.ceil((scadenza.getTime() - Date.now()) / 86400000) : 0;
  const planNome = sub?.plans?.nome?.split('—')[1]?.trim() ?? sub?.plans?.nome ?? '—';

  return (
    <div className="space-y-6 max-w-2xl">
      {!sub ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-amber-800 mb-1">Nessun abbonamento attivo</p>
          <p className="text-xs text-amber-700">Acquista un abbonamento dalla <a href="/#pricing" className="underline font-bold">pagina principale</a>.</p>
        </div>
      ) : (
        <div className="border border-primary/20 rounded-[1.5rem] p-6" style={{ background: 'linear-gradient(135deg, rgba(181,106,86,0.08), rgba(139,168,136,0.04))' }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Piano attivo</p>
              <h3 className="text-3xl font-serif text-on-surface mt-1">{planNome}</h3>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">Attivo</span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20">
            {[
              { label: 'Lezioni incluse',  value: String(lezioniTotali) },
              { label: 'Lezioni rimaste',  value: String(lezioniTotali - lezioniUsate) },
              { label: 'Giorni rimasti',   value: String(Math.max(giorniRimasti, 0)) },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-serif font-bold text-on-surface">{s.value}</p>
                <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-on-surface-variant font-label uppercase tracking-wider">Utilizzo</span>
              <span className="font-bold text-on-surface">{lezioniUsate}/{lezioniTotali} lezioni</span>
            </div>
            <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Scadenza: {scadenza?.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '—'}
            </p>
          </div>
        </div>
      )}

      {piani.length > 0 && (
        <div>
          <h3 className="font-serif text-lg text-on-surface mb-4">Piani disponibili</h3>
          <div className="grid gap-3">
            {piani.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl hover:border-primary/30 transition-all group">
                <div>
                  <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{p.nome}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{p.lezioni_totali} lezioni · {p.durata_giorni} giorni</p>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold text-on-surface">€ {p.prezzo.toFixed(0)}</p>
                  <a href="/#pricing" className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1 hover:underline block">Acquista →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const GIORNI_IT = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];

function generateSlots(courses: any[], exceptions: any[], weeksAhead = 4) {
  const slots: { course: any; date: Date; dateStr: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let w = 0; w < weeksAhead; w++) {
    for (const course of courses) {
      const d = new Date(today);
      const diff = (course.giorno_settimana - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff + w * 7);
      if (d < today) continue;
      const dateStr = d.toISOString().split('T')[0];
      const isException = exceptions.some(e => e.course_id === course.id && e.data === dateStr);
      if (isException) continue;
      slots.push({ course, date: d, dateStr });
    }
  }
  return slots.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function BookingsPanel() {
  const { user } = useAuth();
  const [courses, setCourses]         = useState<any[]>([]);
  const [exceptions, setExceptions]   = useState<any[]>([]);
  const [myBookings, setMyBookings]   = useState<any[]>([]);
  const [sub, setSub]                 = useState<any>(null);
  const [unlocked, setUnlocked]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [booking, setBooking]         = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [
      { data: c }, { data: ex }, { data: b },
      { data: s }, { data: p },
    ] = await Promise.all([
      supabase.from('courses').select('*').eq('is_attivo', true).order('giorno_settimana'),
      supabase.from('course_exceptions').select('*'),
      supabase.from('course_bookings').select('*').eq('user_id', user.id).eq('stato', 'confermata'),
      supabase.from('subscriptions').select('id, lezioni_totali, lezioni_usate').eq('user_id', user.id).eq('stato', 'attivo').maybeSingle(),
      supabase.from('profiles').select('prenotazioni_sbloccate').eq('id', user.id).single(),
    ]);
    setCourses(c || []);
    setExceptions(ex || []);
    setMyBookings(b || []);
    setSub(s ?? null);
    setUnlocked(p?.prenotazioni_sbloccate ?? false);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const prenota = async (slot: { course: any; dateStr: string }) => {
    if (!user || !sub) return;
    if (sub.lezioni_usate >= sub.lezioni_totali) {
      alert('Hai esaurito le lezioni del tuo abbonamento.'); return;
    }
    setBooking(slot.course.id + slot.dateStr);
    const { error } = await supabase.from('course_bookings').insert({
      user_id: user.id, course_id: slot.course.id,
      data: slot.dateStr, subscription_id: sub.id,
    });
    if (!error) {
      await supabase.from('subscriptions')
        .update({ lezioni_usate: sub.lezioni_usate + 1 })
        .eq('id', sub.id);
    } else if (error.code === '23505') {
      alert('Hai già prenotato questa lezione.');
    }
    setBooking(null);
    load();
  };

  const disdici = async (bookingId: string, subId: string, lezioniUsate: number) => {
    if (!confirm('Vuoi disdire questa prenotazione?')) return;
    await supabase.from('course_bookings').update({ stato: 'cancellata' }).eq('id', bookingId);
    await supabase.from('subscriptions')
      .update({ lezioni_usate: Math.max(0, lezioniUsate - 1) })
      .eq('id', subId);
    load();
  };

  if (loading) return <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento...</div>;

  const lezioniRimaste = sub ? sub.lezioni_totali - sub.lezioni_usate : 0;
  const slots = generateSlots(courses, exceptions, 4);

  if (!sub) return (
    <div className="text-center py-16 max-w-md mx-auto">
      <p className="font-serif italic text-on-surface-variant mb-3">Nessun abbonamento attivo.</p>
      <a href="/#pricing" className="text-primary font-bold text-sm hover:underline">Acquista un abbonamento →</a>
    </div>
  );

  if (!unlocked) return (
    <div className="max-w-lg mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-[1.5rem] p-8 text-center">
        <Lock size={32} className="text-blue-500 mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="font-serif text-xl text-on-surface mb-2">Prenotazioni bloccate</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          Per sbloccare le prenotazioni, invia il tuo <strong>certificato medico di buona salute</strong> a:
        </p>
        <a href="mailto:arcadialabyoga@gmail.com" className="inline-block mt-3 text-blue-700 font-bold text-base hover:underline">
          arcadialabyoga@gmail.com
        </a>
        <p className="text-xs text-blue-600 mt-3">L'admin abiliterà le prenotazioni appena ricevuto il certificato.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Lezioni rimaste */}
      <div className="flex items-center justify-between px-5 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl">
        <span className="text-sm text-on-surface-variant">Lezioni rimaste nell'abbonamento</span>
        <span className="font-serif font-bold text-on-surface text-lg" style={{ color: lezioniRimaste <= 2 ? '#e57373' : '#8ba888' }}>
          {lezioniRimaste} / {sub.lezioni_totali}
        </span>
      </div>

      {/* Slot disponibili */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
        <h3 className="font-serif text-xl text-on-surface mb-1">Corsi disponibili</h3>
        <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-5">Prossime 4 settimane</p>

        {slots.length === 0 ? (
          <p className="text-center py-8 font-serif italic text-on-surface-variant text-sm">Nessuna lezione disponibile</p>
        ) : (
          <div className="space-y-3">
            {slots.map(slot => {
              const key    = slot.course.id + slot.dateStr;
              const booked = myBookings.find(b => b.course_id === slot.course.id && b.data === slot.dateStr);
              const isLoading = booking === key;
              return (
                <div key={key} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${booked ? 'bg-green-50 border-green-200' : 'bg-surface border-outline-variant/20 hover:border-primary/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: slot.course.colore }} />
                    <div>
                      <p className="font-bold text-sm text-on-surface">{slot.course.nome}</p>
                      <p className="text-xs text-on-surface-variant">
                        {GIORNI_IT[slot.course.giorno_settimana]}{' '}
                        {slot.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                        {' · '}{slot.course.ora_inizio.slice(0,5)}–{slot.course.ora_fine.slice(0,5)}
                      </p>
                    </div>
                  </div>
                  {booked ? (
                    <button onClick={() => disdici(booked.id, sub.id, sub.lezioni_usate)}
                      className="text-xs text-green-700 font-bold hover:text-red-500 transition-colors px-3 py-1.5 rounded-full bg-green-100 hover:bg-red-50">
                      ✓ Prenotata — Disdici
                    </button>
                  ) : (
                    <button onClick={() => prenota(slot)} disabled={isLoading || lezioniRimaste <= 0}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary text-white hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? '...' : lezioniRimaste <= 0 ? 'Esaurite' : 'Prenota'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Le mie prenotazioni */}
      {myBookings.length > 0 && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6">
          <h3 className="font-serif text-xl text-on-surface mb-5">Le mie prenotazioni attive</h3>
          <div className="space-y-2">
            {myBookings
              .sort((a, b) => a.data.localeCompare(b.data))
              .map(b => {
                const course = courses.find(c => c.id === b.course_id);
                return (
                  <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-outline-variant/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: course?.colore ?? '#ccc' }} />
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{course?.nome ?? '—'}</p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(b.data + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
                          {course && ` · ${course.ora_inizio.slice(0,5)}–${course.ora_fine.slice(0,5)}`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => disdici(b.id, sub.id, sub.lezioni_usate)}
                      className="text-xs text-on-surface-variant hover:text-red-500 transition-colors font-label uppercase tracking-wider">
                      Disdici
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── I miei eventi (utente) ────────────────────────────────────
function MyEventsPanel() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('event_tickets')
      .select('*, special_events(titolo, data_evento, luogo)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setTickets(data || []); setLoading(false); });
  }, [user]);

  const copy = (codice: string) => {
    navigator.clipboard.writeText(codice);
    setCopied(codice);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento...</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif italic text-on-surface-variant mb-3">Nessun biglietto acquistato.</p>
          <a href="/#workshops" className="text-primary font-bold text-sm hover:underline">Scopri gli eventi →</a>
        </div>
      ) : tickets.map(t => {
        const ev      = t.special_events as any;
        const isPast  = ev?.data_evento ? new Date(ev.data_evento) < new Date() : false;
        return (
          <div key={t.id} className={`bg-surface-container-low border rounded-[1.5rem] p-5 ${isPast ? 'opacity-60 border-outline-variant/15' : 'border-outline-variant/30'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-on-surface">{ev?.titolo ?? '—'}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {ev?.data_evento ? new Date(ev.data_evento).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  {ev?.data_evento && ` · ${new Date(ev.data_evento).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
                {ev?.luogo && <p className="text-xs text-on-surface-variant">📍 {ev.luogo}</p>}
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: t.stato === 'presente' ? 'rgba(139,168,136,0.15)' : isPast ? 'rgba(0,0,0,0.06)' : 'rgba(139,168,136,0.12)', color: t.stato === 'presente' ? '#8ba888' : isPast ? '#999' : '#8ba888' }}>
                {t.stato === 'presente' ? 'Presente' : isPast ? 'Concluso' : 'Confermato'}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between bg-surface rounded-2xl px-4 py-3 border border-outline-variant/20">
              <div>
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-0.5">Codice di riferimento</p>
                <p className="font-mono text-xl font-black text-primary tracking-widest">{t.codice_ref}</p>
              </div>
              <button onClick={() => copy(t.codice_ref)}
                className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                {copied === t.codice_ref ? '✓ Copiato' : '📋 Copia'}
              </button>
            </div>

            {!isPast && (
              <p className="text-[11px] text-on-surface-variant mt-3 flex items-center gap-1.5">
                <span>⚕️</span>
                Porta il certificato medico insieme a questo codice all'evento.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { section = 'overview' } = useParams();
  const navigate = useNavigate();
  const admin = ADMIN_EMAILS.includes(user?.email ?? '');
  const nav = admin ? adminNav : userNav;

  const handleSectionChange = (id: string) => {
    navigate(`/dashboard/${id}`, { replace: true });
  };

  const validAdminSections = ['overview', 'analytics', 'plans', 'courses', 'events', 'subscriptions', 'users', 'settings'];
  const validUserSections  = ['overview', 'lessons', 'plan', 'bookings', 'events', 'settings'];
  const validSections = admin ? validAdminSections : validUserSections;
  const activeSection = validSections.includes(section) ? section : 'overview';

  const renderContent = () => {
    if (admin) {
      switch (activeSection) {
        case 'overview':       return <AdminDashboard />;
        case 'analytics':      return <AnalyticsPanel />;
        case 'plans':          return <PlansManagementPanel />;
        case 'courses':        return <CoursesManagementPanel />;
        case 'events':         return <EventsManagementPanel />;
        case 'subscriptions':  return <SubscriptionsPanel />;
        case 'users':          return <UsersPanel />;
        case 'settings':       return <SettingsPanel isAdmin />;
        default:               return <AdminDashboard />;
      }
    } else {
      const userName = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Utente';
      switch (activeSection) {
        case 'overview':  return <UserDashboard userName={userName} />;
        case 'lessons':   return <MyLessonsPanel />;
        case 'plan':      return <MyPlanPanel />;
        case 'bookings':  return <BookingsPanel />;
        case 'events':    return <MyEventsPanel />;
        case 'settings':  return <SettingsPanel isAdmin={false} />;
        default:          return <UserDashboard userName={userName} />;
      }
    }
  };

  return (
    <DashboardLayout
      navItems={nav}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      isAdmin={admin}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
