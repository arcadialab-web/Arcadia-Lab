import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DEFAULTS = {
  label:       'Eventi Speciali',
  titolo:      'Oltre le lezioni — Workshop domenicali',
  sottotitolo: 'Approfondimenti mensili dedicati a temi specifici. Un tempo dilatato per la tua crescita.',
  bottone:     'Scopri gli eventi',
};

export default function Workshops() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [texts, setTexts] = useState(DEFAULTS);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').in('key', [
      'events_hero_image', 'events_label', 'events_titolo', 'events_sottotitolo', 'events_bottone',
    ]).then(({ data }) => {
      if (!data) return;
      const s: Record<string, string> = {};
      data.forEach(r => { s[r.key] = r.value; });
      if (s['events_hero_image']) setHeroImage(s['events_hero_image']);
      setTexts({
        label:       s['events_label']       ?? DEFAULTS.label,
        titolo:      s['events_titolo']      ?? DEFAULTS.titolo,
        sottotitolo: s['events_sottotitolo'] ?? DEFAULTS.sottotitolo,
        bottone:     s['events_bottone']     ?? DEFAULTS.bottone,
      });
    });
  }, []);

  return (
    <section className="py-32 bg-surface overflow-hidden" id="workshops">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="bg-primary rounded-[40px] p-12 md:p-24 text-on-primary relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(181,106,86,0.3)]"
        >
          {/* Elemento decorativo animato */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ repeat: Infinity, duration: 20 }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
          />

          {/* Immagine hero (se presente) */}
          {heroImage && (
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute top-0 right-0 w-1/2 h-full hidden lg:block"
            >
              <img
                src={heroImage}
                alt="Workshop"
                className="w-full h-full object-cover object-center"
                style={{ opacity: 0.55 }}
              />
              {/* sfumatura laterale sinistra per blend naturale col testo */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            </motion.div>
          )}

          {/* Contenuto */}
          <div className="relative z-10 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 0.8, x: 0 }}
              transition={{ delay: 0.4 }}
              className="font-label tracking-[0.3em] uppercase text-xs block mb-8"
            >
              {texts.label}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-6xl font-serif mb-10 leading-tight"
            >
              {texts.titolo}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl opacity-90 leading-relaxed mb-12 font-light"
            >
              {texts.sottotitolo}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Link to="/workshops">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-primary px-10 md:px-14 py-5 rounded-full font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] transition-all flex items-center gap-3 group border-none"
                >
                  <span>{texts.bottone}</span>
                  <Calendar size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
