
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Diagnostic from './pages/Diagnostic';
import Results from './pages/Results';
import ModuleView from './pages/ModuleView';
import Profile from './pages/Profile';
import Vision from './pages/Vision';
import Benefits from './pages/Benefits';
import AuditMiroir from './pages/AuditMiroir';
import AdminDashboard from './pages/AdminDashboard';
import Caisse from './pages/Caisse';
import PilotagePerformance from './pages/PilotagePerformance';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CoachChat from './components/CoachChat';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/avantages" element={<Benefits />} />
          <Route path="/quiz" element={<Diagnostic />} />
          <Route path="/audit-miroir" element={<AuditMiroir />} />
          <Route path="/results" element={<Results />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/caisse" element={
            <ProtectedRoute>
              <Caisse />
            </ProtectedRoute>
          } />

          <Route path="/pilotage" element={
            <ProtectedRoute>
              <PilotagePerformance />
            </ProtectedRoute>
          } />
          
          <Route path="/module/:moduleId" element={
            <ProtectedRoute>
              <ModuleView />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {user && <CoachChat />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
