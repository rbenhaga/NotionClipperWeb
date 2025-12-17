import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { Spinner } from './components/ui';

const HomePage = lazy(() => import('./pages/HomePage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess'));
const AuthError = lazy(() => import('./pages/AuthError'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const NotionEmailPage = lazy(() => import('./pages/NotionEmailPage'));
const VerifyNotionPage = lazy(() => import('./pages/VerifyNotionPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const ProductivityAnalyticsPage = lazy(() => import('./pages/ProductivityAnalyticsPage'));
const ReferralRedirect = lazy(() => import('./pages/ReferralRedirect'));

function App() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-notion-gray-50 dark:bg-notion-gray-900">
            <Spinner className="w-8 h-8 text-notion-gray-400" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/billing" element={<BillingPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/activity" element={<ActivityPage />} />
          <Route path="/dashboard/analytics" element={<ProductivityAnalyticsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/auth/email" element={<NotionEmailPage />} />
          <Route path="/auth/verify-notion" element={<VerifyNotionPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/r/:code" element={<ReferralRedirect />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;