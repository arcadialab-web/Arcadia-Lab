import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
            <h1 className="text-5xl font-serif italic text-primary">Privacy Policy</h1>
            <p className="text-on-surface-variant italic">Ultimo aggiornamento: 27 Aprile 2026</p>
          </header>

          <section className="prose prose-stone max-w-none text-on-surface-variant leading-relaxed space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">1. Informazioni generali</h2>
              <p>
                Benvenuti su Arcadia Lab. (www.arcadialab.it). La tua privacy è estremamente importante per noi. Questa politica descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali quando visiti il nostro sito e utilizzi i nostri servizi.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">2. Titolare del Trattamento</h2>
              <p>
                Il titolare del trattamento dei dati è Cinzia [Cognome], P.IVA 04712510983, con sede operativa a Brescia, Italia. Email di contatto: <a href="mailto:arcadialabyoga@gmail.com" className="text-primary hover:underline">arcadialabyoga@gmail.com</a>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">3. Dati raccolti</h2>
              <p>Raccogliamo diverse tipologie di dati:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dati di contatto:</strong> Nome, email, numero di telefono forniti tramite moduli di prenotazione o contatto.</li>
                <li><strong>Dati di navigazione:</strong> Indirizzo IP, tipo di browser, orari di accesso raccolti automaticamente tramite cookie tecnici.</li>
                <li><strong>Dati sensibili:</strong> Certificati medici di buona salute necessari per l'attività sportiva (gestiti in conformità con le normative sanitarie).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">4. Finalità del trattamento</h2>
              <p>I dati vengono utilizzati per:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestire le prenotazioni e le iscrizioni ai corsi.</li>
                <li>Comunicare aggiornamenti sulle attività del laboratorio.</li>
                <li>Adempiere ad obblighi di legge e assicurativi.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-on-surface">5. I tuoi diritti</h2>
              <p>
                In conformità con il GDPR (UE 2016/679), hai il diritto di accedere ai tuoi dati, chiederne la rettifica, la cancellazione o la limitazione del trattamento. Per esercitare questi diritti, scrivici a <a href="mailto:arcadialabyoga@gmail.com" className="text-primary hover:underline">arcadialabyoga@gmail.com</a>.
              </p>
            </div>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
