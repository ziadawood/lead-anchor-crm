import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './features/auth/use-auth';

import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import AuthCallback from './features/auth/AuthCallback';
import OnboardingWizard from './features/onboarding/OnboardingWizard';
import PipelineBoard from './features/pipeline/PipelineBoard';
import ContactsPage from './features/contacts/ContactsPage';
import ContactProfile from './features/contacts/ContactProfile';
import CallLogs from './features/telephony/CallLogs';
import { GhostLeadToast } from './features/pipeline/GhostLeadToast';
import ChatWidget from './features/chat-widget/ChatWidget';
import PaymentsPage from './features/billing/PaymentsPage';
import WebsiteSettings from './features/website-builder/WebsiteSettings';
import PublicWebsite from './features/website-builder/PublicWebsite';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-100 p-8">
    <GhostLeadToast />
    <ChatWidget />
    {children}
  </div>
);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};

function App() {
  const initializeAuth = useAuth(state => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Public Website Route */}
          <Route path="/:slug" element={<PublicWebsite />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route index element={<Navigate to="/pipeline" replace />} />
                  <Route path="onboarding" element={<OnboardingWizard />} />
                  <Route path="pipeline" element={<PipelineBoard />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="contacts/:id" element={<ContactProfile />} />
                  <Route path="calls" element={<CallLogs />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="website" element={<WebsiteSettings />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
