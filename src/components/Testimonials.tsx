export default function Testimonials() {
  const reviews = [
    {
      name: "ELENA TODESCHI",
      text: "Cinzia guida nella pratica Yoga con maestria, attenzione e sensibilità... Un dono prezioso partecipare alle sue lezioni🙏🏾",
      rating: 5
    },
    {
      name: "Luisa Patroni",
      text: "Un’esperienza fantastica: non è solo yoga, ma un vero percorso di crescita grazie a Cinza. Con lei, lo yoga ha un’anima.",
      rating: 5
    },
    {
      name: "Gemma Damiani",
      text: "L'atmosfera di Arcadia è leggea ed accogliente. Cinzia è preparata e attenta, sa insegnare con dolcezza, senza forzature, non c'è obbligo ma un aperto invito.",
      rating: 4
    },
    {
      name: "sara anselmo",
      text: "Cinzia e' sempre molto accogliente, gentile e comprensiva, non ti fa mai sentire inadeguata e rispetta i limiti di ognuno. Veramente un' insegnante preparata!!!",
      rating: 5
    },
    {
      name: "Gabriele Romanenghi",
      text: "Cinzia ha un “dono” , ti accompagna con professionalità, dolcezza e grande attenzione ad ogni singolo allievo, nel mondo yoga.",
      rating: 5
    },
    {
      name: "francesco fornari",
      text: "Con Arcadia Lab., Cinzia ha creato qualcosa di davvero speciale. Praticare yoga vinyasa con lei fa bene sia al corpo che alla mente.",
      rating: 5
    },
    {
      name: "camilla paletti",
      text: "Cinzia è un insegnante preparata e intuitiva. Mi piace molto l' attenzione che pone sia alla pratica delle asana che all'allievo.",
      rating: 5
    },
    {
      name: "Małgorzata Puczyńska",
      text: "Praticare con Cinzia fa bene all’anima. Riesce a farti sentire a casa nel tuo corpo e nella tua mente. Un privilegio e una ricarica di energia 🫶🏻",
      rating: 5
    }
  ];

  return (
    <section className="py-32 bg-surface-container-low border-y border-outline-variant/10">
      <div className="container mx-auto px-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-serif italic mb-4">Voci dalla Community</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-on-surface">5.0</span>
              <div className="flex text-[#FBBC05] text-lg">
                ★★★★★
              </div>
              <p className="text-sm text-on-surface-variant ml-2 font-medium">su Google Maps</p>
            </div>
          </div>
          <a 
            href="https://www.google.com/search?q=ARCADIA+LAB.+Rese%C3%B1as" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="shrink-0 text-sm font-label uppercase tracking-widest font-bold text-primary hover:text-on-surface transition-colors pb-1 border-b border-primary/30 hover:border-on-surface"
          >
            Leggi tutte le recensioni
          </a>
        </div>
        
        <div className="flex overflow-x-auto pb-12 -mx-6 px-6 snap-x snap-mandatory hide-scrollbar gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="min-w-[300px] md:min-w-[400px] snap-start bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex text-[#FBBC05] text-sm mb-6">
                  {Array(review.rating).fill('★').join('')}
                </div>
                <p className="text-on-surface-variant leading-relaxed text-sm md:text-base italic mb-8">
                  "{review.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-outline-variant/20 pt-6">
                <div className="w-10 h-10 rounded-full bg-primary-fixed-dim text-on-primary flex items-center justify-center font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="font-label text-sm font-bold text-on-surface truncate max-w-[200px]">{review.name}</div>
                  <div className="text-xs text-on-surface-variant">Recensione Google</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
