import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // Parallax effects - softened for smoother transition and to avoid gaps
  const y1 = useTransform(scrollY, [0, 800], [0, 150]);
  const y2 = useTransform(scrollY, [0, 800], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.05]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springX = useSpring(mousePos.x * 50, { stiffness: 100, damping: 30 });
  const springY = useSpring(mousePos.y * 50, { stiffness: 100, damping: 30 });

  return (
    <header 
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-surface" 
      id="hero"
    >
      {/* Immersive Background Elements */}
      <motion.div 
        style={{ x: springX, y: springY, opacity: 0.4 }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-0"
      />
      <motion.div 
        style={{ x: useTransform(springX, (v) => -v * 0.5), y: useTransform(springY, (v) => -v * 0.5), opacity: 0.3 }}
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[100px] -z-0"
      />

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            <span className="text-primary font-label tracking-[0.3em] uppercase text-xs mb-4 block">Arcadia Lab Yoga</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-on-surface leading-[1.05] font-serif">
              Respira dove <br />
              <motion.span 
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="italic text-primary"
              >
                l'anima
              </motion.span> trova casa.
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-xl md:text-2xl text-on-surface-variant max-w-lg font-light leading-relaxed"
          >
            Accademia di Yoga — Pratiche che integrano biomeccanica, adattabilità e forza interiore per trasformare corpo ed emozioni e ritrovare chiarezza.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <motion.a
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary text-white px-10 py-5 rounded-full font-bold tracking-wide shadow-2xl transition-all duration-300 flex items-center gap-3 border-none group hover:bg-opacity-90"
              href="#pricing"
            >
              <span>Inizia ora</span>
              <motion.span 
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="material-symbols-outlined"
              >
                arrow_forward
              </motion.span>
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div 
          style={{ y: y1, opacity, scale }}
          className="relative group lg:perspective-container"
        >
          {/* Main Hero Image */}
          <motion.div 
            style={{ 
              rotateX: useTransform(springY, (v) => v * -0.2),
              rotateY: useTransform(springX, (v) => v * 0.2),
            }}
            className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-outline-variant/30 relative"
          >
            <motion.img
              alt="Yoga Session"
              className="w-full h-full object-cover"
              src="https://fnvchbtcytugkrtnrvyj.supabase.co/storage/v1/object/sign/Foto%20sito/sito.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NzE2NTYwMS0yY2YzLTQzODUtOGE1Ni04ODdkZDI3MGY0OTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJGb3RvIHNpdG8vc2l0by53ZWJwIiwiaWF0IjoxNzc3NTM2NDg5LCJleHAiOjI3MjM2MTY0ODl9.FXMGiOxz81zw03squQ7WoP2-eHYnz8Mn7YsBrUnrGmQ"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Precise replication of the label from the image - Adjusted size and position for visibility */}
          <motion.div 
            style={{ 
              x: useTransform(springX, (v) => v - 20), 
              y: useTransform(springY, (v) => v + 20),
              background: "radial-gradient(circle at 30% 30%, #e2ded5 0%, #c4bdb0 100%)",
              opacity: 0.98
            }}
            className="absolute bottom-[5px] -left-12 w-48 h-48 md:w-52 md:h-52 rounded-full flex flex-col items-center justify-center p-8 text-center shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-20 backdrop-blur-md border border-white/40 group/label"
          >
            <p className="text-[9px] md:text-[10px] font-label tracking-[0.4em] uppercase text-on-surface-variant/70 font-semibold leading-relaxed">
              Elasticità, Forza <br />
              ed Equilibrio
            </p>
          </motion.div>

          {/* Decorative Floating Element - Moved to foreground with text */}
          <motion.div 
            style={{ y: y2, x: useTransform(springX, (v) => -v * 0.8) }}
            className="absolute -top-12 -right-12 w-32 h-32 md:w-36 md:h-36 bg-primary/20 backdrop-blur-xl rounded-full border border-white/40 z-30 animate-float flex items-center justify-center text-center p-4 shadow-xl shadow-primary/10"
          >
            <p className="font-serif italic text-primary text-xs md:text-sm font-medium leading-tight">
              Yoga è <br />
              stupore!
            </p>
          </motion.div>
        </motion.div>
      </div>


      {/* Storytelling line */}
      <motion.div 
        style={{ height: useTransform(scrollY, [0, 1000], [0, 400]) }}
        className="absolute left-1/2 bottom-0 w-[1px] bg-gradient-to-b from-primary to-transparent"
      />
    </header>
  );
}

