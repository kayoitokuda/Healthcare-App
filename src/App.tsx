import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ReferralsProvider } from './data/ReferralsContext';
import Dashboard from './pages/Dashboard';
import ReferralDetail from './pages/ReferralDetail';
import MessageComposer from './pages/MessageComposer';
import Confirmation from './pages/Confirmation';
import Help from './pages/Help';

export default function App() {
  return (
    <ReferralsProvider>
      <HashRouter>
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
      </HashRouter>
    </ReferralsProvider>
  );
}
