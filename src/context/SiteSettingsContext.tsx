import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SiteSettings {
  preLancio: boolean;
  requireMedicalCert: boolean;
}

const SiteSettingsContext = createContext<SiteSettings>({ preLancio: false, requireMedicalCert: true });

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({ preLancio: false, requireMedicalCert: true });

  useEffect(() => {
    supabase.from('site_settings').select('key, value')
      .in('key', ['pre_lancio', 'require_medical_cert'])
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(data.map(r => [r.key, r.value]));
        setSettings({
          preLancio: map['pre_lancio'] === 'true',
          requireMedicalCert: map['require_medical_cert'] !== 'false',
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
