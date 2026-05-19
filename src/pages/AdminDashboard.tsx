import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, FileText, BarChart, Settings, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant italic font-serif">Accesso non autorizzato...</p>
      </div>
    );
  }

  const adminStats = [
    { label: 'Utenti Totali', value: '124', icon: Users, color: 'text-primary' },
    { label: 'Nuove Prenotazioni', value: '18', icon: FileText, color: 'text-secondary' },
    { label: 'Visitatori (Mese)', value: '2.4k', icon: BarChart, color: 'text-tertiary' },
  ];

  const adminMenu = [
    { label: 'Gestione Utenti', icon: Users },
    { label: 'Calendario Lezioni', icon: FileText },
    { label: 'Contenuti Sito', icon: LayoutDashboard },
    { label: 'Impostazioni Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest mb-4">
                Pannello Amministrazione
              </div>
              <h1 className="text-5xl font-serif italic text-primary">Admin Console</h1>
            </div>
            <p className="text-on-surface-variant text-sm font-sans max-w-xs text-right">
              Benvenuta, Cinzia. Qui puoi gestire ogni aspetto di Arcadia Lab.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {adminStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-xl border border-white/20 flex items-center gap-6"
              >
                <div className={`w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={32} />
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                  <p className="text-4xl font-serif text-primary">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-serif italic text-primary mb-4 ml-2">Azioni Rapide</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {adminMenu.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="bg-white p-6 rounded-3xl shadow-lg border border-white/20 flex items-center justify-between group hover:bg-primary hover:text-white transition-all overflow-hidden relative"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="relative z-10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:bg-white/10 transition-colors"></div>
                  </motion.button>
                ))}
              </div>

              {/* Activity Feed Placeholder */}
              <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-white/20 mt-12">
                <h3 className="text-xl font-serif italic text-on-surface mb-6">Attività Recente</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex gap-4 items-start pb-6 border-b border-surface-container last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                        <Users size={16} className="text-outline" />
                      </div>
                      <div>
                        <p className="text-sm text-on-surface">
                          <span className="font-bold">Nuovo utente registrato:</span> Marco Polo
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">2 ore fa</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-serif italic text-primary mb-4 ml-2">Manutenzione</h2>
              <div className="bg-primary text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-serif italic mb-4">Ottimizzazione DB</h3>
                  <p className="text-white/80 text-sm mb-6 leading-relaxed">
                    Il database è al 92% della capacità gratuita. Considera di pulire i log vecchi o fare l'upgrade.
                  </p>
                  <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
                    Esegui Pulizia
                  </button>
                </div>
                <LayoutDashboard size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
