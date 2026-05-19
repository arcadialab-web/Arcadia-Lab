import { useState } from 'react';
import {
  LayoutDashboard, BarChart2, CreditCard, Users,
  Settings, CalendarCheck, BookOpen, Star, PackagePlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

// Pannello utenti (placeholder professionale)
function UsersPanel() {
  const utenti = [
    { email: 'giulia.f@email.it', nome: 'Giulia Ferretti', iscrizione: '2024-11-03', piano: 'Mensile', stato: 'attivo' },
    { email: 'marta.c@email.it', nome: 'Marta Conti', iscrizione: '2024-09-15', piano: 'Trimestrale', stato: 'attivo' },
    { email: 'sara.b@email.it', nome: 'Sara Bianchi', iscrizione: '2024-01-20', piano: 'Annuale', stato: 'attivo' },
    { email: 'laura.r@email.it', nome: 'Laura Ricci', iscrizione: '2025-05-01', piano: 'Mensile', stato: 'scaduto' },
    { email: 'anna.m@email.it', nome: 'Anna Moretti', iscrizione: '2025-04-10', piano: 'Mensile', stato: 'attivo' },
    { email: 'elena.r@email.it', nome: 'Elena Russo', iscrizione: '2024-12-05', piano: 'Trimestrale', stato: 'attivo' },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {['Utente', 'Iscrizione', 'Piano', 'Stato'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {utenti.map((u, i) => (
                <tr key={i} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {u.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{u.nome}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(u.iscrizione).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{u.piano}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{
                      background: u.stato === 'attivo' ? 'rgba(139,168,136,0.15)' : 'rgba(229,115,115,0.1)',
                      color: u.stato === 'attivo' ? '#8ba888' : '#e57373',
                    }}>
                      {u.stato === 'attivo' ? 'Attivo' : 'Scaduto'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-center text-xs text-on-surface-variant/40 font-label">* Dati di esempio. Collega Supabase per dati reali.</p>
    </div>
  );
}

// Pannello abbonamento utente
function MyPlanPanel() {
  const scadenza = new Date('2025-07-15');
  const giorniRimasti = Math.ceil((scadenza.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-gradient-to-br from-primary/8 to-transparent border border-primary/20 rounded-[1.5rem] p-6" style={{ background: 'linear-gradient(135deg, rgba(181,106,86,0.08), rgba(139,168,136,0.04))' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Piano attivo</p>
            <h3 className="text-3xl font-serif text-on-surface mt-1">Mensile</h3>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">Attivo</span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20">
          {[
            { label: 'Lezioni incluse', value: '12' },
            { label: 'Lezioni rimaste', value: '7' },
            { label: 'Giorni rimasti', value: `${giorniRimasti}` },
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
            <span className="font-bold text-on-surface">5/12 lezioni</span>
          </div>
          <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: '41.6%' }} />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Scadenza: {scadenza.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      {/* Piani disponibili */}
      <div>
        <h3 className="font-serif text-lg text-on-surface mb-4">Cambia piano</h3>
        <div className="grid gap-3">
          {[
            { nome: 'Piano Mensile', prezzo: '€ 80', lezioni: '12 lezioni', desc: 'Ideale per chi pratica 3 volte a settimana' },
            { nome: 'Piano Trimestrale', prezzo: '€ 210', lezioni: '36 lezioni', desc: 'Risparmia il 12% rispetto al mensile' },
            { nome: 'Piano Annuale', prezzo: '€ 720', lezioni: '144 lezioni', desc: 'La scelta migliore per praticanti regolari' },
            { nome: 'Lezione singola', prezzo: '€ 15', lezioni: '1 lezione', desc: 'Perfetto per chi vuole provare' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl hover:border-primary/30 transition-all group">
              <div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{p.nome}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{p.lezioni} · {p.desc}</p>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-on-surface">{p.prezzo}</p>
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1 hover:underline">Scegli →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-on-surface-variant/40 font-label">* Dati di esempio. Collega Supabase per dati reali.</p>
    </div>
  );
}

// Pannello prenotazioni utente
function BookingsPanel() {
  const prenotazioni = [
    { data: '2025-06-23', ora: '09:00', tipo: 'Hatha Yoga', stato: 'confermata' },
    { data: '2025-06-25', ora: '18:30', tipo: 'Vinyasa Flow', stato: 'confermata' },
    { data: '2025-06-27', ora: '09:00', tipo: 'Yin Yoga', stato: 'in-attesa' },
  ];
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-[1.5rem] p-6 space-y-3">
        {prenotazioni.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={16} className="text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">{p.tipo}</p>
                <p className="text-xs text-on-surface-variant">
                  {new Date(p.data).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} · {p.ora}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{
                background: p.stato === 'confermata' ? 'rgba(139,168,136,0.15)' : 'rgba(240,165,0,0.1)',
                color: p.stato === 'confermata' ? '#8ba888' : '#f0a500',
              }}>
                {p.stato === 'confermata' ? 'Confermata' : 'In attesa'}
              </span>
              <button className="text-xs text-on-surface-variant hover:text-red-500 transition-colors font-label uppercase tracking-wider">Disdici</button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-on-surface-variant/40 font-label">* Dati di esempio. Collega Supabase per dati reali.</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const admin = ADMIN_EMAILS.includes(user?.email ?? '');
  const nav = admin ? adminNav : userNav;
  const [section, setSection] = useState('overview');

  const renderContent = () => {
    if (admin) {
      switch (section) {
        case 'overview':       return <AdminDashboard />;
        case 'analytics':     return <AnalyticsPanel />;
        case 'plans':         return <PlansManagementPanel />;
        case 'subscriptions': return <SubscriptionsPanel />;
        case 'users':         return <UsersPanel />;
        case 'settings':      return <SettingsPanel isAdmin />;
        default:              return <AdminDashboard />;
      }
    } else {
      switch (section) {
        case 'overview':  return <UserDashboard userName={user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Utente'} />;
        case 'lessons':   return <MyLessonsPanel />;
        case 'plan':      return <MyPlanPanel />;
        case 'bookings':  return <BookingsPanel />;
        case 'settings':  return <SettingsPanel isAdmin={false} />;
        default:          return <UserDashboard userName={user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Utente'} />;
      }
    }
  };

  return (
    <DashboardLayout
      navItems={nav}
      activeSection={section}
      onSectionChange={setSection}
      isAdmin={admin}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
