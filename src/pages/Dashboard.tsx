import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Calendar, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant italic font-serif">Caricamento...</p>
      </div>
    );
  }

  const menuItems = [
    { icon: Calendar, label: 'Le mie prenotazioni', description: 'Visualizza e gestisci le tue lezioni.' },
    { icon: User, label: 'Profilo Personale', description: 'Aggiorna i tuoi dati e contatti.' },
    { icon: Settings, label: 'Impostazioni', description: 'Gestisci preferenze e sicurezza.' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-serif italic text-primary mb-2">
              Ciao, {profile?.full_name || user.email?.split('@')[0]}
            </h1>
            <p className="text-on-surface-variant font-sans tracking-wide uppercase text-xs font-bold ring-offset-2">
              Benvenuto nella tua area riservata Arcadia Lab.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar / Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-white/20 h-fit"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border-4 border-white shadow-lg">
                  <User size={40} />
                </div>
                <h2 className="text-xl font-serif italic text-on-surface">{profile?.full_name || 'Utente'}</h2>
                <p className="text-on-surface-variant text-sm truncate w-full">{user.email}</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-on-surface-variant hover:bg-red-50 hover:text-red-600 py-3 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.div>

            {/* Main Content Areas */}
            <div className="md:col-span-2 space-y-6">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="w-full bg-white rounded-3xl p-6 shadow-lg border border-white/20 flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all text-left"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif italic text-xl text-on-surface">{item.label}</h3>
                      <p className="text-on-surface-variant text-sm">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-outline group-hover:text-primary transition-colors" />
                </motion.button>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-primary/5 rounded-3xl p-8 border border-primary/10"
              >
                <h4 className="font-serif italic text-2xl text-primary mb-4">News dalla Community</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  Stiamo preparando nuovi workshop per la stagione estiva. 
                  Resta sintonizzato per scoprire le date in anteprima!
                </p>
                <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">
                  Leggi di più
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
