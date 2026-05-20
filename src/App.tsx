import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { supabase } from './lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Traccia visite nel DB (per lo storico) ────────────────────
function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard')) return;
    supabase.from('page_views').insert({
      path:     location.pathname || '/',
      referrer: document.referrer || null,
    }).then(() => {});
  }, [location.pathname]);
  return null;
}

// ── Traccia presenza live (Realtime, nessun DB) ───────────────
function LiveTracker() {
  const location   = useLocation();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const cleanUp = () => {
    if (channelRef.current) {
      channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  useEffect(() => {
    const onDashboard = location.pathname.startsWith('/dashboard');

    if (onDashboard) {
      // L'admin entra nella dashboard → libera il canale
      // così AnalyticsPanel può sottoscriversi senza conflitti
      cleanUp();
      return;
    }

    // Crea il canale solo se non esiste già
    if (!channelRef.current) {
      let visitorId = sessionStorage.getItem('_vid');
      if (!visitorId) {
        visitorId = Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem('_vid', visitorId);
      }

      const channel = supabase.channel('live_visitors', {
        config: { presence: { key: visitorId } },
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ page: location.pathname });
        }
      });

      channelRef.current = channel;
    } else {
      // Aggiorna solo la pagina corrente
      channelRef.current.track({ page: location.pathname });
    }
  }, [location.pathname]);

  // Pulizia finale all'unmount
  useEffect(() => () => cleanUp(), []);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <PageTracker />
        <LiveTracker />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pagamento-ok" element={<PaymentSuccess />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/:section" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
        </Routes>
        <CookieBanner />
      </Router>
    </AuthProvider>
  );
}
