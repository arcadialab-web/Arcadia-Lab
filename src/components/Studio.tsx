import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Studio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section ref={containerRef} className="py-32 bg-surface overflow-hidden" id="studio">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-serif">Un luogo, non solo uno spazio.</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Situato all’interno del <span className="text-primary font-semibold">Parco dell’Acqua a Brescia</span>, Arcadia Lab si trova nella Sala Energic Ambiente, con accesso diretto dal parco. Uno spazio luminoso e accogliente, dove il legno naturale delle travi, la luce che filtra dalle finestre affacciate sul verde e la quiete del parco creano un ambiente ideale per muoversi, respirare e ritrovare equilibrio.
            </p>
            
            <div className="space-y-6 pt-4">
              <motion.div 
                whileHover={{ x: 10 }}
                className="flex items-center gap-6 p-4 rounded-2xl glass-dark border-none shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div>
                  <p className="font-serif">Sala Energic Ambiente</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest">Largo Torrelunga 7, Brescia</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ x: 10 }}
                className="flex items-center gap-6 p-4 rounded-2xl glass border border-outline-variant/30 shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">directions_walk</span>
                </div>
                <p className="text-sm text-on-surface-variant tracking-wide">Accesso diretto alla sala dall’ingresso del parco.</p>
              </motion.div>
            </div>
          </motion.div>

          <div className="lg:col-span-7 perspective-container">
            <motion.div 
              style={{ y: imageY }}
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="rounded-3xl overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] relative border border-white/20"
            >
              <motion.img
                alt="Parco dell'Acqua - Arcadia Lab"
                className="w-full h-auto object-contain"
                src="https://fnvchbtcytugkrtnrvyj.supabase.co/storage/v1/object/sign/Foto%20sito/Parco%20dell%20acqua.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NzE2NTYwMS0yY2YzLTQzODUtOGE1Ni04ODdkZDI3MGY0OTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJGb3RvIHNpdG8vUGFyY28gZGVsbCBhY3F1YS5qcGciLCJpYXQiOjE3NzY5NjYwNzIsImV4cCI6MTkzNDY0NjA3Mn0.btjOrExqjHJaG8IbH5uhcZXmRaphDw3v7XL6MVOJYrg"
                referrerPolicy="no-referrer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8 }}
              />
              
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

