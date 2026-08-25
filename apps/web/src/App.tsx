import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
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

import {
  Anchor,
  LayoutDashboard,
  Users,
  Phone,
  CreditCard,
  Globe,
  LogOut,
  Zap
} from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/pipeline', icon: LayoutDashboard, label: 'Pipeline' },
    { to: '/contacts', icon: Users, label: 'Contacts' },
    { to: '/calls', icon: Phone, label: 'Call Logs' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/website', icon: Globe, label: 'Website' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8 mt-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Anchor className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            LeadAnchor
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
          <div className="px-3 mb-3">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="sidebar-link w-full text-red-400/70 hover:text-red-400"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <GhostLeadToast />
        <ChatWidget />
        {children}
      </main>
    </div>
  );
};

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Zap className="w-4 h-4 animate-pulse" />
            Loading...
          </div>
        </div>
      </div>
    );
  }

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
          <Route path="/site/:slug" element={<PublicWebsite />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/pipeline" element={
            <ProtectedRoute>
              <DashboardLayout><PipelineBoard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          } />
          <Route path="/contacts" element={
            <ProtectedRoute>
              <DashboardLayout><ContactsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/contacts/:id" element={
            <ProtectedRoute>
              <DashboardLayout><ContactProfile /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/calls" element={
            <ProtectedRoute>
              <DashboardLayout><CallLogs /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <DashboardLayout><PaymentsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/website" element={
            <ProtectedRoute>
              <DashboardLayout><WebsiteSettings /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/pipeline" replace />} />
          <Route path="*" element={<Navigate to="/pipeline" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
