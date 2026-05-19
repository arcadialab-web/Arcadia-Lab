import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function Pricing() {
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handlePurchase = async (priceId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    setLoadingPriceId(priceId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
          userEmail: session.user.email,
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Errore durante il checkout: ' + err.message);
    } finally {
      setLoadingPriceId(null);
    }
  };

  const subscriptions = [
    {
      num: "1",
      frequency: "volta / settimana",
      options: [
        { formula: "Mensile", price: "49", label: "", priceId: "price_1_msg_mensile" },
        { formula: "Trimestrale", price: "133", label: "risparmia € 14", priceId: "price_1_msg_trimestrale" },
        { formula: "Stagionale", price: "380", label: "miglior offerta", priceId: "price_1_msg_stagionale" },
      ]
    },
    {
      num: "2",
      frequency: "volte / settimana",
      options: [
        { formula: "Mensile", price: "80", label: "", priceId: "price_2_msg_mensile" },
        { formula: "Trimestrale", price: "213", label: "risparmia € 27", priceId: "price_2_msg_trimestrale" },
        { formula: "Stagionale", price: "590", label: "miglior offerta", priceId: "price_2_msg_stagionale" },
      ]
    },
    {
      num: "3",
      frequency: "volte / settimana",
      options: [
        { formula: "Mensile", price: "108", label: "", priceId: "price_3_msg_mensile" },
        { formula: "Trimestrale", price: "290", label: "risparmia € 34", priceId: "price_3_msg_trimestrale" },
        { formula: "Stagionale", price: "820", label: "miglior offerta", priceId: "price_3_msg_stagionale" },
      ]
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-surface overflow-hidden" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-label tracking-[0.2em] uppercase text-sm block mb-4"
          >
            ABBONAMENTI
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif italic mb-6"
          >
            Unisciti ad Arcadia Lab.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-on-surface-variant max-w-xl mx-auto"
          >
            Scegli il ritmo che fa per te. Tutti gli abbonamenti danno accesso a qualsiasi delle lezioni settimanali.
          </motion.p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {subscriptions.map((sub, i) => (
            <motion.div 
              key={sub.frequency + i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col hover:shadow-xl transition-all duration-500 group"
            >
              <div className="flex items-center gap-2 mb-10">
                <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-lg md:text-xl group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  {sub.num}
                </div>
                <h3 className="text-lg md:text-xl lg:text-[1.35rem] font-serif whitespace-nowrap">{sub.frequency}</h3>
              </div>

              <div className="space-y-4 mb-12 flex-grow">
                {sub.options.map((opt) => (
                  <button 
                    key={opt.formula} 
                    onClick={() => handlePurchase(opt.priceId)}
                    disabled={loadingPriceId !== null}
                    className="w-full flex justify-between items-center group/item p-4 rounded-xl hover:bg-surface-container-low transition-colors text-left disabled:opacity-50"
                  >
                    <div>
                      <p className="font-serif text-lg">
                        {opt.formula}
                      </p>
                      <div className="flex flex-col">
                        {opt.formula === "Stagionale" && (
                          <span className="text-[9px] italic text-on-surface-variant/80 font-medium">*(Settembre a Maggio)</span>
                        )}
                        <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">{opt.label}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-on-surface">€ {opt.price}</span>
                      {loadingPriceId === opt.priceId && (
                        <div className="text-[10px] text-primary animate-pulse">Reindirizzamento...</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center text-xs text-on-surface-variant/60 font-medium py-2">
                Scegli una formula sopra per procedere all'acquisto
              </div>
            </motion.div>
          ))}
        </div>

        {/* 10 Entries Package */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="bg-primary-container/10 border-2 border-primary/10 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
            
            <div className="relative z-10 text-center md:text-left">
              <span className="bg-primary text-on-primary text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-widest mb-4 inline-block">Pacchetto Accesso</span>
              <h3 className="text-3xl font-serif mb-3">10 Ingressi</h3>
              <p className="text-on-surface-variant max-w-sm">
                Flessibilità totale per chi ha orari variabili. Valido per tutte le lezioni di Arcadia Lab.
              </p>
            </div>
            
            <div className="relative z-10 text-center md:text-right flex flex-col items-center md:items-end gap-4 min-w-[200px]">
              <div className="text-5xl font-bold text-primary">€ 135</div>
              <motion.button 
                onClick={() => handlePurchase('price_10_ingressi')}
                disabled={loadingPriceId !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-primary text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-lg disabled:opacity-50"
              >
                {loadingPriceId === 'price_10_ingressi' ? 'Caricamento...' : 'Acquista Pacchetto'}
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        <div className="max-w-3xl mx-auto space-y-6 opacity-80">
          <div className="flex items-start gap-4 p-6 bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl text-sm italic group">
            <span className="material-symbols-outlined text-primary group-hover:rotate-12 transition-transform">info</span>
            <p>
              Gli abbonamenti sono nominativi e non rimborsabili. Il numero di lezioni è consecutivo su base settimanale.
            </p>
          </div>
          <div className="flex items-start gap-4 p-6 bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl text-sm group">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">card_membership</span>
            <p>
              <strong className="text-on-surface uppercase tracking-wider text-xs block mb-1">Tessera associativa annuale — € 20</strong>
              Obbligatoria per l'iscrizione. Include copertura assicurativa. È richiesto il certificato medico di buona salute.
            </p>
          </div>
        </div>
        
      </div>
    </section>
  );
}
