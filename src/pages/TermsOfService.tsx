import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function TermsOfService() {
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
            <h1 className="text-5xl font-serif italic text-primary">Termini di Servizio</h1>
            <p className="text-on-surface-variant italic">Ultimo aggiornamento: 14 Maggio 2026</p>
          </header>

          <section className="prose prose-stone max-w-none text-on-surface-variant leading-relaxed space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">1. Accettazione dei Termini</h2>
              <p>
                L'accesso e l'uso di Arcadia Lab. (www.arcadialab.it) sono regolati dai presenti Termini di Servizio. Utilizzando il sito e i nostri servizi, accetti integralmente queste condizioni.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">2. Iscrizioni e Abbonamenti</h2>
              <p>
                La partecipazione alle attività richiede il pagamento di una quota associativa annuale di € 20, comprensiva di assicurazione. Gli abbonamenti (Mensile, 10 ingressi, Drop-in) hanno validità limitata come specificato nella sezione Pricing.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">3. Requisiti di Salute</h2>
              <p>
                Per partecipare a tutte le lezioni di Yoga è obbligatorio presentare un certificato medico di buona salute in corso di validità. Arcadia Lab. declina ogni responsabilità per infortuni derivanti dalla mancata segnalazione di condizioni mediche preesistenti.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">4. Cancellazioni</h2>
              <p>
                Le prenotazioni alle lezioni possono essere cancellate fino a 24 ore prima dell'inizio senza addebito. Cancellazioni tardive comporteranno il conteggio della lezione come fruita.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">5. Proprietà Intellettuale</h2>
              <p>
                Tutti i contenuti presenti sul sito (testi, immagini, logo) sono di proprietà di Arcadia Lab. e Cinzia Bellotto e non possono essere riprodotti senza autorizzazione scritta.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">6. Contatti</h2>
              <p>
                Per qualsiasi domanda relativa ai presenti Termini di Servizio, puoi contattarci all'indirizzo <a href="mailto:arcadialabyoga@gmail.com" className="text-primary hover:underline">arcadialabyoga@gmail.com</a>.
              </p>
            </div>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
