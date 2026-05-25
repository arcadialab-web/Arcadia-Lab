import { useState } from 'react';
import { Instagram, Send, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MAKE_WEBHOOK = 'https://hook.eu1.make.com/ghwzhmg4ehib5enfeegc2qcghqqxdx48';

const inputClass = "w-full bg-surface border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all";
const labelClass = "block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5";

export default function Footer() {
  const [form, setForm] = useState({ nome: '', email: '', telefono: '', messaggio: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) return;
    setStatus('loading');

    const payload = {
      ...form,
      ricevuto_il: new Date().toISOString(),
    };

    try {
      await Promise.all([
        // Webhook Make
        fetch(MAKE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        // Salva su Supabase
        supabase.from('contact_leads').insert({
          nome:      form.nome.trim(),
          email:     form.email.trim().toLowerCase(),
          telefono:  form.telefono.trim() || null,
          messaggio: form.messaggio.trim() || null,
        }),
      ]);
      setStatus('success');
      setForm({ nome: '', email: '', telefono: '', messaggio: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-surface-container w-full mt-24 border-t border-outline-variant/20" id="contacts">
      <div className="container mx-auto">
        <div className="max-w-4xl px-6 md:px-12 pt-20 pb-16">
          <div className="space-y-12">
            <div>
              <h2 className="text-5xl font-serif italic text-primary mb-4">Arcadia Lab.</h2>
              <p className="text-on-surface-variant text-lg">Inizia il tuo percorso con Arcadia Lab.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="font-label uppercase text-xs tracking-widest font-bold text-on-surface">Indirizzo</h4>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sala+Energic+Ambiente+Largo+Torrelunga+7+Brescia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-on-surface-variant leading-relaxed hover:text-primary transition-colors block"
                >
                  Arcadia Lab. · Sala Energic.ambiente<br/>
                  (sopra Mondo Liquido)<br/>
                  C/O Parco Dell'Acqua<br/>
                  Largo Torrelunga 7, Brescia
                </a>
              </div>
              <div className="space-y-4">
                <h4 className="font-label uppercase text-xs tracking-widest font-bold text-on-surface">Contatti</h4>
                <div className="space-y-2">
                  <div className="text-on-surface-variant leading-relaxed">
                    <a href="tel:+393466770909" className="hover:text-primary transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">call</span>
                      +39 346 677 0909
                    </a>
                    <a href="mailto:arcadialabyoga@gmail.com" className="hover:text-primary transition-colors flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-sm">mail</span>
                      arcadialabyoga@gmail.com
                    </a>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <a
                      href="https://www.instagram.com/arcadialab.cinzia/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-on-surface-variant hover:text-primary transition-all flex items-center gap-2 group"
                    >
                      <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">@arcadialab.cinzia</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form di contatto */}
            <div>
              <h4 className="font-label uppercase text-xs tracking-widest font-bold text-on-surface mb-6">Scrivici</h4>
              {status === 'success' ? (
                <div className="flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4" style={{ background: 'rgba(181,106,86,0.07)' }}>
                  <Check size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Messaggio inviato!</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Ti risponderemo il prima possibile.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nome *</label>
                      <input className={inputClass} type="text" placeholder="Es. Lucia" required
                        value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Email *</label>
                      <input className={inputClass} type="email" placeholder="lucia@email.com" required
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Telefono</label>
                    <input className={inputClass} type="tel" placeholder="+39 333 000 0000"
                      value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Messaggio</label>
                    <textarea className={`${inputClass} resize-none`} rows={4}
                      placeholder="Come possiamo aiutarti?"
                      value={form.messaggio} onChange={e => setForm(f => ({ ...f, messaggio: e.target.value }))} />
                  </div>
                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                      <AlertCircle size={13} />
                      Errore durante l'invio. Riprova o scrivici via email.
                    </div>
                  )}
                  <button type="submit" disabled={status === 'loading'}
                    className="flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
                  >
                    {status === 'loading'
                      ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" /> Invio...</>
                      : <><Send size={13} /> Invia messaggio</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-10 w-full gap-6 border-t border-outline-variant/20">
          <div className="flex flex-col space-y-1 text-center md:text-left">
            <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant/70">
              © {new Date().getFullYear()} Arcadia Lab.
            </p>
            <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant/50">
              P.IVA: 04712510983
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link className="font-label text-xs tracking-widest uppercase text-on-surface-variant/70 hover:text-primary transition-colors" to="/privacy-policy">Privacy Policy</Link>
            <Link className="font-label text-xs tracking-widest uppercase text-on-surface-variant/70 hover:text-primary transition-colors" to="/terms-of-service">Terms of Service</Link>
            <Link className="font-label text-xs tracking-widest uppercase text-on-surface-policy transition-colors" to="/cookie-policy">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
