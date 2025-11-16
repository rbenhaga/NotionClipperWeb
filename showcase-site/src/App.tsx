import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import AuthSuccess from './pages/AuthSuccess';
import AuthError from './pages/AuthError';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/error" element={<AuthError />} />
      </Routes>
    </div>
  );
}

export default App;
