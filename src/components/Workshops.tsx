import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function Workshops() {
  const handleScrollToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('register');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          {/* Decorative background elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ repeat: Infinity, duration: 20 }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
          />
          
          <div className="relative z-10 max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 0.8, x: 0 }}
              transition={{ delay: 0.4 }}
              className="font-label tracking-[0.3em] uppercase text-xs block mb-8"
            >
              Eventi Speciali
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-6xl font-serif mb-10 leading-tight"
            >
              Oltre le lezioni — <br />
              <span className="italic opacity-80">Workshop domenicali</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl opacity-90 leading-relaxed mb-12 font-light"
            >
              Approfondimenti mensili dedicati a temi specifici. Un tempo dilatato per la tua crescita.
            </motion.p>
            
            <Link 
              to="/#register"
              onClick={handleScrollToRegister}
            >
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-primary px-10 md:px-14 py-5 rounded-full font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] transition-all flex items-center gap-3 group border-none"
              >
                <span>Calendario Workshop</span>
                <Calendar size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>


          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 0.3, x: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 right-0 w-1/2 h-full hidden lg:block"
          >
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 10 }}
              alt="Workshop atmosphere"
              className="w-full h-full object-cover mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO0wl3tObgzBkeO2FZfOo7kNhKs2q4Wf95sOiJKthQEjeWuK_9yOa55kovnHMqJ7avEZM4gE5Kng-DjUnHeDjHKgfA8w9SAVTU42G9X-7r2-qVp5re6Ri0zgiQC-8DtzTsD1cjGR0gveCB17ypSyA8gksZZTm85garXjb95oK65Tr00xmt-Px7cBK7swMGQQeVX8qZSLIPBfGb6rSbQKsbT21DIQr6wj7A5BAIMa7qB3sDX2MkdoK69cYtXOgkhzYjr4zVgKFlldB6"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

