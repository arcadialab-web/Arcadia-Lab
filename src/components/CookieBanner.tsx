import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-surface-container border border-outline-variant/30 rounded-2xl shadow-2xl p-6 md:flex md:items-center md:justify-between gap-6">
            <div className="flex-1 space-y-2 mb-6 md:mb-0">
              <h3 className="text-lg font-serif italic text-primary">Informativa sui Cookie</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito. Continuando a navigare, accetti il nostro utilizzo dei cookie in conformità con la nostra <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={acceptCookies}
                className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-opacity-90 transition-all shadow-lg"
              >
                Accetta
              </button>
              <Link
                to="/cookie-policy"
                className="px-8 py-3 border border-outline-variant text-on-surface-variant text-xs font-bold uppercase tracking-widest rounded-full hover:bg-surface-variant transition-all text-center"
              >
                Scopri di più
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
