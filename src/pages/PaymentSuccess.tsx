import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, KeyRound, CalendarCheck, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const isNew = params.get('nuovo') === '1';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      {/* Sfondo decorativo */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary-container/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-[2rem] shadow-2xl shadow-primary/8 border border-outline-variant/20 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-10 pb-6 text-center border-b border-outline-variant/10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle2 size={40} className="text-primary" strokeWidth={1.5} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-xs font-label uppercase tracking-[0.3em] text-primary mb-2">Acquisto completato</p>
                <h1 className="text-3xl font-serif text-on-surface mb-3">
                  Grazie per aver scelto<br />
                  <span className="italic">Arcadia Lab.</span>
                </h1>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm mx-auto">
                  Il tuo abbonamento è attivo.{' '}
                  {isNew
                    ? 'Abbiamo creato il tuo account personale — riceverai a breve le istruzioni via email.'
                    : 'Il tuo account è stato aggiornato con il nuovo abbonamento.'}
                </p>
              </motion.div>
            </div>

            {/* Corpo */}
            <div className="px-8 py-7 space-y-4">

              {/* Prossimi passi */}
              {isNew ? (
                <div className="space-y-3">
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">Cosa fare adesso</p>
                  {[
                    {
                      icon: Mail,
                      title: 'Controlla la tua email',
                      desc: 'Ti abbiamo inviato un\'email con il link per impostare la password del tuo account.',
                    },
                    {
                      icon: AlertCircle,
                      title: 'Controlla anche la cartella Spam',
                      desc: 'Se non trovi l\'email nella casella principale, controlla Spam, Promozioni o Posta indesiderata.',
                    },
                    {
                      icon: KeyRound,
                      title: 'Imposta la tua password',
                      desc: 'Clicca il link nell\'email per scegliere la tua password e accedere al tuo spazio personale.',
                    },
                    {
                      icon: CalendarCheck,
                      title: 'Prenota la tua prima lezione',
                      desc: 'Una volta dentro, potrai vedere il tuo abbonamento e prenotare le lezioni disponibili.',
                    },
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex items-start gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <step.icon size={16} className="text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{step.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck size={16} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Il tuo abbonamento è pronto</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Accedi alla tua area personale per vedere i dettagli e prenotare le lezioni.</p>
                  </div>
                </div>
              )}

              {/* Nota tessera (solo nuovi utenti) */}
              {isNew && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-primary/15"
                  style={{ background: 'rgba(181,106,86,0.05)' }}
                >
                  <span className="text-lg flex-shrink-0">🎫</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Tessera associativa inclusa</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      La tua tessera annuale è stata attivata. Include copertura assicurativa e ti dà accesso a tutte le lezioni di Arcadia Lab. per 365 giorni.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isNew ? 1.0 : 0.5 }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <a
                  href="https://www.arcadialab.it/auth"
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl text-sm text-center shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all"
                >
                  {isNew ? 'Vai alla pagina di accesso' : 'Accedi alla dashboard'}
                </a>
                <Link
                  to="/"
                  className="flex-1 py-3.5 border border-outline-variant text-on-surface font-bold rounded-2xl text-sm text-center hover:bg-surface-container transition-all"
                >
                  Torna al sito
                </Link>
              </motion.div>
            </div>

            {/* Footer card */}
            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-on-surface-variant">
                Per qualsiasi problema scrivici a{' '}
                <a href="mailto:arcadialabyoga@gmail.com" className="text-primary hover:underline">
                  arcadialabyoga@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
