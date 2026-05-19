import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="container mx-auto px-6 md:px-12 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          <header className="space-y-4">
            <h1 className="text-5xl font-serif italic text-primary">Cookie Policy</h1>
            <p className="text-on-surface-variant italic">Ultimo aggiornamento: 14 Maggio 2026</p>
          </header>

          <section className="prose prose-stone max-w-none text-on-surface-variant leading-relaxed space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">1. Cosa sono i Cookie</h2>
              <p>
                I cookie sono piccoli file di testo che vengono salvati sul tuo dispositivo quando visiti un sito web. Ci aiutano a far funzionare il sito in modo efficiente e a migliorare l'esperienza dell'utente.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">2. Quali Cookie utilizziamo</h2>
              <p>In questo sito utilizziamo:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookie Tecnici:</strong> Necessari per il corretto funzionamento del sito e per ricordare le tue preferenze (come il consenso ai cookie).</li>
                <li><strong>Cookie Analitici:</strong> Utilizzati per raccogliere in forma anonima statistiche di navigazione (es. Google Analytics se abilitato).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">3. Gestione dei Cookie</h2>
              <p>
                Puoi gestire o disattivare i cookie direttamente dalle impostazioni del tuo browser. Se disattivi i cookie tecnici, alcune parti del sito potrebbero non funzionare correttamente.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">4. Contatti</h2>
              <p>
                Per qualsiasi domanda sulla nostra Cookie Policy, puoi contattarci all'indirizzo <a href="mailto:arcadialabyoga@gmail.com" className="text-primary hover:underline">arcadialabyoga@gmail.com</a>.
              </p>
            </div>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
