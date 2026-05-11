import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';

export default function Registration() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://hook.eu1.make.com/ghwzhmg4ehib5enfeegc2qcghqqxdx48', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          submittedAt: new Date().toISOString(),
          source: window.location.href
        }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        throw new Error('Errore durante l\'invio. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Si è verificato un errore imprevisto.');
    }
  };

  if (status === 'success') {
    return (
      <section className="py-32 bg-surface" id="register">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <div className="bg-surface-container-lowest p-12 rounded-2xl shadow-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-primary mb-6 animate-bounce">check_circle</span>
            <h2 className="text-4xl font-serif italic mb-6">Grazie per la tua richiesta!</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
              Abbiamo ricevuto i tuoi dati correttamente. Ti contatteremo via email o telefono entro le prossime 24-48 ore per confermare la tua iscrizione.
            </p>
            <button 
              onClick={() => setStatus('idle')}
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Invia un'altra richiesta
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-surface" id="register">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
            <span className="font-label tracking-[0.2em] uppercase text-xs opacity-80 block text-primary font-bold">Iscrizione</span>
            <h2 className="text-4xl md:text-5xl font-serif italic mb-6">Inizia il tuo percorso.</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Compila il modulo per richiedere la tua iscrizione e prenotare il tuo tappetino.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Una volta inviata la richiesta, ti contatteremo a breve per confermare la disponibilità del posto e fornirti i dettagli per il saldo del tuo abbonamento.
            </p>
            
            <div className="p-8 bg-surface-container-low border border-outline-variant/30 rounded-xl mt-12 bg-opacity-50">
              <h4 className="font-serif text-xl mb-3">Hai ancora dubbi?</h4>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Scrivici direttamente per un consiglio su quale abbonamento si adatta meglio alle tue esigenze.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary font-light">phone_iphone</span>
                  <p className="font-medium">+39 346 677 0909</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary font-light">mail</span>
                  <a href="mailto:arcadialabyoga@gmail.com" className="font-medium hover:text-primary transition-colors">arcadialabyoga@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-12 rounded-2xl shadow-xl border border-outline-variant/20 relative z-10">
            <form className="space-y-8" onSubmit={handleSubmit}>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2 relative group">
                  <label htmlFor="nome" className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold transition-colors group-focus-within:text-primary">Nome *</label>
                  <input id="nome" name="nome" type="text" required className="bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none text-on-surface w-full" placeholder="Il tuo nome" />
                </div>
                <div className="flex flex-col gap-2 relative group">
                  <label htmlFor="cognome" className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold transition-colors group-focus-within:text-primary">Cognome *</label>
                  <input id="cognome" name="cognome" type="text" required className="bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none text-on-surface w-full" placeholder="Il tuo cognome" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2 relative group">
                  <label htmlFor="email" className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold transition-colors group-focus-within:text-primary">Email *</label>
                  <input id="email" name="email" type="email" required className="bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none text-on-surface w-full" placeholder="latua@email.com" />
                </div>
                <div className="flex flex-col gap-2 relative group">
                  <label htmlFor="telefono" className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold transition-colors group-focus-within:text-primary">Telefono *</label>
                  <input id="telefono" name="telefono" type="tel" required className="bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none text-on-surface w-full" placeholder="+39 000 0000000" />
                </div>
              </div>

              <div className="flex flex-col gap-2 relative group">
                <label htmlFor="abbonamento" className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold transition-colors group-focus-within:text-primary">Abbonamento richiesto *</label>
                <div className="relative">
                  <select id="abbonamento" name="abbonamento" required defaultValue="" className="bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none text-on-surface appearance-none w-full cursor-pointer rounded-none">
                    <option value="" disabled>Seleziona un'opzione...</option>
                    <option value="carnet_10">10 Ingressi (€ 135)</option>
                    <optgroup label="1 volta / settimana">
                      <option value="1x_mensile">Mensile — 1 volta/sett. (€ 49)</option>
                      <option value="1x_trimestrale">Trimestrale — 1 volta/sett. (€ 133)</option>
                      <option value="1x_stagionale">Stagionale — 1 volta/sett. (€ 380)</option>
                    </optgroup>
                    <optgroup label="2 volte / settimana">
                      <option value="2x_mensile">Mensile — 2 volte/sett. (€ 80)</option>
                      <option value="2x_trimestrale">Trimestrale — 2 volte/sett. (€ 213)</option>
                      <option value="2x_stagionale">Stagionale — 2 volte/sett. (€ 590)</option>
                    </optgroup>
                    <optgroup label="3 volte / settimana">
                      <option value="3x_mensile">Mensile — 3 volte/sett. (€ 108)</option>
                      <option value="3x_trimestrale">Trimestrale — 3 volte/sett. (€ 290)</option>
                      <option value="3x_stagionale">Stagionale — 3 volte/sett. (€ 820)</option>
                    </optgroup>
                    <option value="prova">Lezione Singola di prova (€ 20)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-outline-variant group-focus-within:text-primary transition-colors">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 relative group">
                <label htmlFor="note" className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold transition-colors group-focus-within:text-primary">Note aggiuntive (Esperienza pregressa, infortuni, etc.)</label>
                <textarea id="note" name="note" rows={3} className="bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none text-on-surface w-full resize-none" placeholder="Scrivi qui eventuali comunicazioni..."></textarea>
              </div>

              <div className="space-y-5 pt-8 border-t border-outline-variant/20">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input type="checkbox" name="accetto_certificato" required className="peer appearance-none w-5 h-5 border border-outline-variant rounded-sm checked:bg-primary checked:border-primary transition-colors cursor-pointer" />
                    <span className="material-symbols-outlined absolute text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold">check</span>
                  </div>
                  <span className="text-sm text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors">
                    Ho compreso che per completare l'iscrizione è <strong>obbligatorio</strong> presentare un certificato medico di sana e robusta costituzione.
                  </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input type="checkbox" name="accetto_privacy" required className="peer appearance-none w-5 h-5 border border-outline-variant rounded-sm checked:bg-primary checked:border-primary transition-colors cursor-pointer" />
                    <span className="material-symbols-outlined absolute text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold">check</span>
                  </div>
                  <span className="text-sm text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors">
                    Ho letto e accetto la <Link to="/privacy-policy" className="text-primary hover:underline underline-offset-4">Privacy Policy</Link> e i <Link to="/terms-of-service" className="text-primary hover:underline underline-offset-4">Termini e Condizioni</Link> *
                  </span>
                </label>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                  {errorMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className={`w-full py-4 bg-primary text-on-primary rounded-md font-bold mt-8 shadow-xl shadow-primary/20 hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-3 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {status === 'loading' ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                    Invio in corso...
                  </>
                ) : (
                  'Invia Richiesta'
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
