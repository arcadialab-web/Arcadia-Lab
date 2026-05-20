import { useEffect } from 'react';
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

// Traccia ogni cambio di pagina
function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    // Non traccia le sezioni admin/dashboard
    if (location.pathname.startsWith('/dashboard')) return;
    supabase.from('page_views').insert({
      path:     location.pathname || '/',
      referrer: document.referrer || null,
    }).then(() => {});
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <PageTracker />
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
