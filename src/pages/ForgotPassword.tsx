import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Errore nell\'invio della mail');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          {success ? (
            <div className="text-center py-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-serif italic text-primary mb-4">Email Inviata</h1>
              <p className="text-on-surface-variant mb-8 text-sm">
                Abbiamo inviato le istruzioni per il recupero a <strong>{email}</strong> tramite Resend.
              </p>
              <Link to="/login" className="text-primary font-bold hover:underline flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Torna al Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif italic text-primary mb-2">Recupero Password</h1>
                <p className="text-on-surface-variant font-sans text-sm">Inserisci la tua email per ricevere il link di ripristino.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
              )}

              <form onSubmit={handleRecover} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="la-tua@email.com"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Invia Link</>}
                </motion.button>

                <div className="text-center">
                  <Link to="/login" className="text-on-surface-variant text-xs hover:text-primary transition-colors flex items-center justify-center gap-1">
                    <ArrowLeft size={14} /> Torna al Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
