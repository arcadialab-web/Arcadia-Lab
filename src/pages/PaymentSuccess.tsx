import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 max-w-md relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-primary" strokeWidth={1.5} />
        </div>

        <div>
          <h1 className="text-3xl font-serif text-on-surface mb-3">Pagamento completato!</h1>
          <p className="text-on-surface-variant leading-relaxed">
            Grazie per aver scelto Arcadia Lab. <br />
            Riceverai a breve un'email con le istruzioni per accedere al tuo account e prenotare le prime lezioni.
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 w-full text-left space-y-2">
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">Prossimi passi</p>
          {[
            'Controlla la tua email (anche spam)',
            'Clicca il link per impostare la password',
            'Accedi e prenota la tua prima lezione',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-on-surface">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to="/auth" className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl text-sm text-center shadow-lg hover:bg-opacity-90 transition-all">
            Accedi al tuo account
          </Link>
          <Link to="/" className="flex-1 py-3.5 border border-outline-variant text-on-surface font-bold rounded-2xl text-sm text-center hover:bg-surface-container transition-all">
            Torna al sito
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
