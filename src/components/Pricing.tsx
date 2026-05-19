import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Plan {
  id: string;
  nome: string;
  descrizione: string;
  prezzo: number;
  lezioni_totali: number;
  durata_giorni: number;
  frequenza_sett: number | null;
  ordine: number;
}

async function redirectToCheckout(planId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { plan_id: planId },
    });
    if (error || !data?.url) throw new Error('Errore nella creazione del pagamento');
    window.location.href = data.url;
  } catch (err) {
    alert('Si è verificato un errore. Riprova o contattaci direttamente.');
    console.error(err);
  }
}

function PlanButton({ planId, label = 'Inizia ora' }: { planId: string; label?: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await redirectToCheckout(planId);
    setLoading(false);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 text-center border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white text-primary font-bold rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Reindirizzamento...' : label}
    </motion.button>
  );
}

// Raggruppa i piani per frequenza_sett
function groupByFrequenza(plans: Plan[]) {
  const groups: Record<string, Plan[]> = {};
  for (const plan of plans) {
    const key = plan.frequenza_sett ? `${plan.frequenza_sett}` : 'pacchetto';
    if (!groups[key]) groups[key] = [];
    groups[key].push(plan);
  }
  return groups;
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('plans')
      .select('*')
      .eq('is_attivo', true)
      .order('ordine', { ascending: true })
      .then(({ data }) => {
        if (data) setPlans(data);
        setLoading(false);
      });
  }, []);

  const groups = groupByFrequenza(plans);
  const freqGroups = Object.entries(groups).filter(([k]) => k !== 'pacchetto');
  const pacchetti  = groups['pacchetto'] ?? [];

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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="font-serif italic">Caricamento piani...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Piani per frequenza */}
            {freqGroups.length > 0 && (
              <div className="grid lg:grid-cols-3 gap-8 mb-16">
                {freqGroups.map(([freq, groupPlans], i) => (
                  <motion.div
                    key={freq}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col hover:shadow-xl transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-2 mb-10">
                      <div className="flex-shrink-0 w-11 h-11 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        {freq}
                      </div>
                      <h3 className="text-lg md:text-xl font-serif whitespace-nowrap">
                        {freq === '1' ? 'volta' : 'volte'} / settimana
                      </h3>
                    </div>

                    <div className="space-y-4 mb-12 flex-grow">
                      {groupPlans.map((plan) => (
                        <div key={plan.id} className="flex justify-between items-center p-4 rounded-xl hover:bg-surface-container-low transition-colors">
                          <div>
                            <p className="font-serif text-lg">
                              {plan.nome.split('—')[1]?.trim() ?? plan.nome}
                            </p>
                            {plan.descrizione && (
                              <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">
                                {plan.descrizione}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-on-surface">€ {plan.prezzo.toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Un solo bottone per il piano mensile del gruppo */}
                    {groupPlans[0] && <PlanButton planId={groupPlans[0].id} />}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pacchetti / ingressi */}
            {pacchetti.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="max-w-4xl mx-auto mb-10"
              >
                <div className="bg-primary-container/10 border-2 border-primary/10 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                  <div className="relative z-10 text-center md:text-left">
                    <span className="bg-primary text-on-primary text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-widest mb-4 inline-block">
                      Pacchetto Accesso
                    </span>
                    <h3 className="text-3xl font-serif mb-3">{pack.nome}</h3>
                    {pack.descrizione && (
                      <p className="text-on-surface-variant max-w-sm">{pack.descrizione}</p>
                    )}
                  </div>
                  <div className="relative z-10 text-center md:text-right flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                    <div className="text-5xl font-bold text-primary">€ {pack.prezzo.toFixed(0)}</div>
                    <PlanButton planId={pack.id} label="Acquista Pacchetto" />
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {/* Note legali */}
        <div className="max-w-3xl mx-auto space-y-6 opacity-80 mt-8">
          <div className="flex items-start gap-4 p-6 bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl text-sm italic group">
            <span className="material-symbols-outlined text-primary group-hover:rotate-12 transition-transform">info</span>
            <p>Gli abbonamenti sono nominativi e non rimborsabili. Il numero di lezioni è consecutivo su base settimanale.</p>
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
