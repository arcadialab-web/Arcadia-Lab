import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, BarChart2, CreditCard, Users,
  Settings, CalendarCheck, BookOpen, Star, PackagePlus,
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

const ADMIN_EMAILS = ['ai.danielcorso@gmail.com', 'arcadialabyoga@gmail.com'];

const adminNav = [
  { id: 'overview',       label: 'Panoramica',     icon: <LayoutDashboard size={17} strokeWidth={1.5} /> },
  { id: 'analytics',      label: 'Analytics sito', icon: <BarChart2 size={17} strokeWidth={1.5} /> },
  { id: 'plans',          label: 'Piani & Prezzi', icon: <PackagePlus size={17} strokeWidth={1.5} /> },
  { id: 'subscriptions',  label: 'Abbonamenti',    icon: <CreditCard size={17} strokeWidth={1.5} /> },
  { id: 'users',          label: 'Utenti',         icon: <Users size={17} strokeWidth={1.5} /> },
  { id: 'settings',       label: 'Impostazioni',   icon: <Settings size={17} strokeWidth={1.5} /> },
];

const userNav = [
  { id: 'overview',  label: 'Il mio spazio',  icon: <LayoutDashboard size={17} strokeWidth={1.5} /> },
  { id: 'lessons',   label: 'Le mie lezioni', icon: <CalendarCheck size={17} strokeWidth={1.5} /> },
  { id: 'plan',      label: 'Abbonamento',    icon: <Star size={17} strokeWidth={1.5} /> },
  { id: 'bookings',  label: 'Prenotazioni',   icon: <BookOpen size={17} strokeWidth={1.5} /> },
  { id: 'settings',  label: 'Impostazioni',   icon: <Settings size={17} strokeWidth={1.5} /> },
];

function UsersPanel() {
  const [utenti, setUtenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nome, cognome, email, created_at, role')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setUtenti(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento utenti...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {['Utente', 'Iscrizione', 'Ruolo'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {utenti.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-12 font-serif italic text-on-surface-variant">Nessun utente registrato</td></tr>
              ) : utenti.map((u) => {
                const displayName = u.nome ? `${u.nome} ${u.cognome || ''}`.trim() : (u.email ?? 'Utente');
                return (
                  <tr key={u.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{displayName}</p>
                          <p className="text-xs text-on-surface-variant">{u.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{
                        background: u.role === 'admin' ? 'rgba(181,106,86,0.12)' : 'rgba(139,168,136,0.15)',
                        color:      u.role === 'admin' ? '#b56a56' : '#8ba888',
                      }}>
                        {u.role === 'admin' ? 'Admin' : 'Utente'}
                      </span>
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

function BookingsPanel() {
  const { user } = useAuth();
  const [prenotazioni, setPrenotazioni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookings')
      .select('id, stato, presenza, created_at, lessons(titolo, data_ora)')
      .eq('user_id', user.id)
      .neq('stato', 'cancellata')
      .gte('lessons.data_ora', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    setPrenotazioni(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const disdici = async (id: string) => {
    if (!confirm('Vuoi disdire questa prenotazione?')) return;
    await supabase.from('bookings').update({ stato: 'cancellata' }).eq('id', id);
    load();
  };

  if (loading) return <div className="text-center py-16 font-serif italic text-on-surface-variant">Caricamento...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6 space-y-3">
        {prenotazioni.length === 0 ? (
          <p className="text-center py-8 font-serif italic text-on-surface-variant text-sm">Nessuna prenotazione attiva</p>
        ) : prenotazioni.map((p) => {
          const lesson = p.lessons as any;
          return (
            <div key={p.id} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarCheck size={16} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{lesson?.titolo ?? 'Lezione'}</p>
                  <p className="text-xs text-on-surface-variant">
                    {lesson?.data_ora
                      ? new Date(lesson.data_ora).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + new Date(lesson.data_ora).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{
                  background: p.stato === 'confermata' ? 'rgba(139,168,136,0.15)' : 'rgba(240,165,0,0.1)',
                  color:      p.stato === 'confermata' ? '#8ba888' : '#f0a500',
                }}>
                  {p.stato === 'confermata' ? 'Confermata' : 'In attesa'}
                </span>
                <button onClick={() => disdici(p.id)} className="text-xs text-on-surface-variant hover:text-red-500 transition-colors font-label uppercase tracking-wider">Disdici</button>
              </div>
            </div>
          );
        })}
      </div>
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

  const validAdminSections = ['overview', 'analytics', 'plans', 'subscriptions', 'users', 'settings'];
  const validUserSections  = ['overview', 'lessons', 'plan', 'bookings', 'settings'];
  const validSections = admin ? validAdminSections : validUserSections;
  const activeSection = validSections.includes(section) ? section : 'overview';

  const renderContent = () => {
    if (admin) {
      switch (activeSection) {
        case 'overview':       return <AdminDashboard />;
        case 'analytics':      return <AnalyticsPanel />;
        case 'plans':          return <PlansManagementPanel />;
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
