import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AbbonamentoOption {
  value: string;
  label: string;
  group?: string;
}

export const DEFAULT_TESSERA_PREZZO = 20;

export const DEFAULT_ABBONAMENTO_OPTIONS: AbbonamentoOption[] = [
  { value: 'carnet_10', label: '10 Ingressi (€ 135)' },
  { value: '1x_mensile', label: 'Mensile — 1 volta/sett. (€ 49)', group: '1 volta / settimana' },
  { value: '1x_trimestrale', label: 'Trimestrale — 1 volta/sett. (€ 133)', group: '1 volta / settimana' },
  { value: '1x_stagionale', label: 'Stagionale — 1 volta/sett. (€ 380)', group: '1 volta / settimana' },
  { value: '2x_mensile', label: 'Mensile — 2 volte/sett. (€ 80)', group: '2 volte / settimana' },
  { value: '2x_trimestrale', label: 'Trimestrale — 2 volte/sett. (€ 213)', group: '2 volte / settimana' },
  { value: '2x_stagionale', label: 'Stagionale — 2 volte/sett. (€ 590)', group: '2 volte / settimana' },
  { value: '3x_mensile', label: 'Mensile — 3 volte/sett. (€ 108)', group: '3 volte / settimana' },
  { value: '3x_trimestrale', label: 'Trimestrale — 3 volte/sett. (€ 290)', group: '3 volte / settimana' },
  { value: '3x_stagionale', label: 'Stagionale — 3 volte/sett. (€ 820)', group: '3 volte / settimana' },
  { value: 'prova', label: 'Lezione Singola di prova (€ 20)' },
];

interface SiteSettings {
  preLancio: boolean;
  requireMedicalCert: boolean;
  abbonamentoOptions: AbbonamentoOption[];
  tesseraPrezzo: number;
}

const SiteSettingsContext = createContext<SiteSettings>({ preLancio: false, requireMedicalCert: true, abbonamentoOptions: DEFAULT_ABBONAMENTO_OPTIONS, tesseraPrezzo: DEFAULT_TESSERA_PREZZO });

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({ preLancio: false, requireMedicalCert: true, abbonamentoOptions: DEFAULT_ABBONAMENTO_OPTIONS, tesseraPrezzo: DEFAULT_TESSERA_PREZZO });

  useEffect(() => {
    supabase.from('site_settings').select('key, value')
      .in('key', ['pre_lancio', 'require_medical_cert', 'abbonamento_options', 'tessera_prezzo'])
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(data.map(r => [r.key, r.value]));

        let abbonamentoOptions = DEFAULT_ABBONAMENTO_OPTIONS;
        if (map['abbonamento_options']) {
          try {
            const parsed = JSON.parse(map['abbonamento_options']);
            if (Array.isArray(parsed) && parsed.length > 0) abbonamentoOptions = parsed;
          } catch { /* ignora JSON non valido, usa i valori di default */ }
        }

        let tesseraPrezzo = DEFAULT_TESSERA_PREZZO;
        if (map['tessera_prezzo']) {
          const parsed = Number(map['tessera_prezzo']);
          if (!Number.isNaN(parsed) && parsed > 0) tesseraPrezzo = parsed;
        }

        setSettings({
          preLancio: map['pre_lancio'] === 'true',
          requireMedicalCert: map['require_medical_cert'] !== 'false',
          abbonamentoOptions,
          tesseraPrezzo,
        });
      });
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
