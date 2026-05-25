import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Phone, Mail, MessageSquare, Calendar } from 'lucide-react';

interface Lead {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefono: string | null;
  messaggio: string | null;
}

export default function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('contact_leads').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setLeads(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <p className="text-xs text-on-surface-variant py-8 text-center">Caricamento contatti...</p>;

  if (leads.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
        <User size={20} className="text-on-surface-variant" />
      </div>
      <p className="text-sm font-semibold text-on-surface">Nessun contatto ricevuto</p>
      <p className="text-xs text-on-surface-variant">I contatti dal formulario della home appariranno qui.</p>
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="font-serif text-xl text-on-surface">Contatti ricevuti</h2>
        <p className="text-xs text-on-surface-variant mt-1">{leads.length} contatt{leads.length === 1 ? 'o' : 'i'} dal formulario della home page.</p>
      </div>

      <div className="space-y-2">
        {leads.map(lead => {
          const date = new Date(lead.created_at);
          const dateStr = date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
          const timeStr = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
          const isOpen = expanded === lead.id;

          return (
            <div key={lead.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-surface-container transition-all"
                onClick={() => setExpanded(isOpen ? null : lead.id)}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{lead.nome}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 truncate">{lead.email}{lead.telefono ? ` · ${lead.telefono}` : ''}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-on-surface">{dateStr}</p>
                  <p className="text-xs text-on-surface-variant">{timeStr}</p>
                </div>
                <span className={`text-on-surface-variant transition-transform flex-shrink-0 text-lg leading-none ${isOpen ? 'rotate-180' : ''}`} style={{ display: 'inline-block' }}>›</span>
              </button>

              {isOpen && (
                <div className="border-t border-outline-variant/20 px-4 py-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-primary flex-shrink-0" />
                      <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline truncate">{lead.email}</a>
                    </div>
                    {lead.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-on-surface-variant flex-shrink-0" />
                        <a href={`tel:${lead.telefono}`} className="text-sm text-on-surface hover:underline">{lead.telefono}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-on-surface-variant flex-shrink-0" />
                      <span className="text-sm text-on-surface-variant">{dateStr} alle {timeStr}</span>
                    </div>
                  </div>
                  {lead.messaggio && (
                    <div className="flex gap-2 pt-1">
                      <MessageSquare size={13} className="text-on-surface-variant flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{lead.messaggio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
