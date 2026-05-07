import { motion } from 'framer-motion';

export default function Pricing() {
  const subscriptions = [
    {
      frequency: "1 volta / sett.",
      icon: "diversity_1",
      options: [
        { formula: "Mensile", price: "49", label: "" },
        { formula: "Trimestrale", price: "133", label: "risparmia € 14" },
        { formula: "Stagionale", price: "380", label: "miglior offerta" },
      ]
    },
    {
      frequency: "2 volte / sett.",
      icon: "diversity_2",
      options: [
        { formula: "Mensile", price: "80", label: "" },
        { formula: "Trimestrale", price: "213", label: "risparmia € 27" },
        { formula: "Stagionale", price: "590", label: "miglior offerta" },
      ]
    },
    {
      frequency: "3 volte / sett.",
      icon: "diversity_3",
      options: [
        { formula: "Mensile", price: "108", label: "" },
        { formula: "Trimestrale", price: "290", label: "risparmia € 34" },
        { formula: "Stagionale", price: "820", label: "miglior offerta" },
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
            Unisciti ad Arcadia Lab
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-on-surface-variant max-w-xl mx-auto"
          >
            Scegli il ritmo che fa per te. Tutti gli abbonamenti danno accesso a entrambe le lezioni settimanali.
          </motion.p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {subscriptions.map((sub, i) => (
            <motion.div 
              key={sub.frequency}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col hover:shadow-xl transition-all duration-500 group"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <span className="material-symbols-outlined">{sub.icon}</span>
                </div>
                <h3 className="text-2xl font-serif">{sub.frequency}</h3>
              </div>

              <div className="space-y-6 mb-12 flex-grow">
                {sub.options.map((opt) => (
                  <div key={opt.formula} className="flex justify-between items-center group/item p-4 rounded-xl hover:bg-surface-container-low transition-colors">
                    <div>
                      <p className="font-serif text-lg">{opt.formula}</p>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">{opt.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-on-surface">€ {opt.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <motion.a 
                href="#register" 
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 text-center border-2 border-primary/20 hover:border-primary text-primary font-bold rounded-2xl transition-all duration-300"
              >
                Inizia ora
              </motion.a>
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
              <motion.a 
                href="#register" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-primary text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-lg"
              >
                Acquista Pacchetto
              </motion.a>
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
