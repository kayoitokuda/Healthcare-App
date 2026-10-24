import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ReferralsProvider } from './data/ReferralsContext';
import Dashboard from './pages/Dashboard';
import ReferralDetail from './pages/ReferralDetail';
import MessageComposer from './pages/MessageComposer';
import Confirmation from './pages/Confirmation';
import Help from './pages/Help';
import SignIn from './pages/SignIn';

function AppRoutes() {
  const { user, loading, configured } = useAuth();

  if (configured && loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-sm text-navy-500">
        Loading your account…
      </main>
    );
  }

  if (configured && !user) return <SignIn />;

  return (
    <ReferralsProvider>
      <div className="mx-auto min-h-screen max-w-2xl bg-paper">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/referral/:id" element={<ReferralDetail />} />
          <Route path="/referral/:id/message" element={<MessageComposer />} />
          <Route path="/referral/:id/confirmation" element={<Confirmation />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ReferralsProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
