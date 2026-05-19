import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: '',
            }
          }
        });
        if (error) throw error;
        alert('Controlla la tua email per confermare l\'iscrizione!');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-outline-variant/10"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif italic mb-2">
            {isLogin ? 'Bentornato' : 'Unisciti a noi'}
          </h2>
          <p className="text-on-surface-variant text-sm">
            {isLogin ? 'Accedi al tuo account Arcadia Lab' : 'Crea un account per gestire i tuoi abbonamenti'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant group-focus-within:text-primary transition-colors">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none"
              placeholder="latua@email.com"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant group-focus-within:text-primary transition-colors">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors py-2 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-outline-variant/10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
