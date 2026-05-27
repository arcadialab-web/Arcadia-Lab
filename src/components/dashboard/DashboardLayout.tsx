import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, X, ShieldAlert, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  children: React.ReactNode;
  isAdmin: boolean;
}

const BOOKINGS_SEEN_KEY = 'admin_bookings_last_seen';

export default function DashboardLayout({ navItems, activeSection, onSectionChange, children, isAdmin }: Props) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen]               = useState(false);
  const [prenotazioniSbloccate, setPrenotazioni]    = useState<boolean | null>(null);
  const [hasActiveSub, setHasActiveSub]             = useState(false);
  const [newBookings, setNewBookings]               = useState(0);

  useEffect(() => {
    if (!user || isAdmin) return;
    Promise.all([
      supabase.from('profiles').select('prenotazioni_sbloccate').eq('id', user.id).single(),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('stato', 'attivo'),
    ]).then(([{ data: p }, { count }]) => {
      setPrenotazioni(p?.prenotazioni_sbloccate ?? false);
      setHasActiveSub((count ?? 0) > 0);
    });
  }, [user, isAdmin]);

  // Conta nuove prenotazioni dall'ultima visita alla sezione bookings (solo admin)
  useEffect(() => {
    if (!isAdmin) return;
    const lastSeen = localStorage.getItem(BOOKINGS_SEEN_KEY) ?? new Date(0).toISOString();
    supabase
      .from('course_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('stato', 'confermata')
      .gt('created_at', lastSeen)
      .then(({ count }) => setNewBookings(count ?? 0));
  }, [isAdmin]);

  // Azzera badge quando l'admin apre la sezione prenotazioni
  useEffect(() => {
    if (isAdmin && activeSection === 'bookings') {
      localStorage.setItem(BOOKINGS_SEEN_KEY, new Date().toISOString());
      setNewBookings(0);
    }
  }, [isAdmin, activeSection]);

  const mostraBannerCertificato = !isAdmin && hasActiveSub && prenotazioniSbloccate === false;

  const activeLabel = navItems.find(n => n.id === activeSection)?.label ?? '';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-outline-variant/20">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="https://fnvchbtcytugkrtnrvyj.supabase.co/storage/v1/object/public/Logo%20piattaforma/ARCADIA%20LAB%20(1).png"
            alt="Arcadia Lab."
            className="h-8 object-contain"
          />
          <span className="font-serif italic text-primary text-lg">Arcadia Lab.</span>
        </Link>
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-primary' : 'bg-primary-container'}`} style={{ background: '#8ba888' }} />
          <span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">
            {isAdmin ? 'Pannello Admin' : 'Area Personale'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.id === activeSection;
          return (
            <button
              key={item.id}
              onClick={() => { onSectionChange(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 group ${
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className={`transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold tracking-wide">{item.label}</span>
              {isAdmin && item.id === 'bookings' && newBookings > 0 && !active && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {newBookings > 99 ? '99+' : newBookings}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-6 pt-3 border-t border-outline-variant/20">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-low mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm font-serif italic text-primary font-bold flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{user?.email}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-label">{isAdmin ? 'Amministratore' : 'Utente'}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all duration-200 text-sm font-semibold"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Esci dall'account
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/20 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-surface-container-lowest z-50 lg:hidden shadow-2xl"
            >
              <button onClick={() => setSidebarOpen(false)} className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-on-surface-variant hover:text-primary transition-colors"
          >
            <Menu size={22} />
          </button>
          <div>
            <p className="text-[11px] font-label uppercase tracking-[0.2em] text-on-surface-variant">{activeLabel}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
              ← Torna al sito
            </Link>
          </div>
        </header>

        {/* Banner cambio password obbligatorio */}
        {user?.user_metadata?.must_change_password && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
            <ShieldAlert size={18} className="text-amber-600 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-amber-800 flex-1">
              <strong>Cambia la password temporanea</strong> prima di continuare — vai in{' '}
              <button
                onClick={() => onSectionChange('settings')}
                className="underline font-bold hover:text-amber-900 transition-colors"
              >
                Impostazioni → Sicurezza
              </button>
            </p>
          </div>
        )}

        {/* Banner certificato medico */}
        {mostraBannerCertificato && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-3">
            <FileText size={18} className="text-blue-600 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-blue-800 flex-1">
              <strong>Certificato medico richiesto</strong> — Per sbloccare le prenotazioni, invia il tuo certificato medico di buona salute a{' '}
              <a href="mailto:arcadialabyoga@gmail.com" className="font-bold underline hover:text-blue-900">
                arcadialabyoga@gmail.com
              </a>
              . L'admin provvederà ad abilitare le prenotazioni una volta ricevuto.
            </p>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
