import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import ComparePage from './pages/ComparePage';
import ChangelogPage from './pages/ChangelogPage';
import AuthSuccess from './pages/AuthSuccess';
import AuthError from './pages/AuthError';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LegalPage from './pages/LegalPage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/error" element={<AuthError />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/legal" element={<LegalPage />} />
      </Routes>
    </div>
  );
}

export default App;