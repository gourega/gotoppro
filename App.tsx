
import React from 'react';
// @ts-ignore
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import WarRoom from './pages/WarRoom';
import Caisse from './pages/Caisse';
import PilotagePerformance from './pages/PilotagePerformance';
import Magasin from './pages/Magasin';
import MesFormations from './pages/MesFormations';
import MarketingVisuel from './pages/MarketingVisuel';
import Directory from './pages/Directory';
import PublicProfile from './pages/PublicProfile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CoachChat from './components/CoachChat';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement...</p>
        </div>
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
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-900 items-stretch">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow flex flex-col w-full opacity-100 items-stretch">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/avantages" element={<Benefits />} />
          <Route path="/quiz" element={<Diagnostic />} />
          <Route path="/audit-miroir" element={<AuditMiroir />} />
          <Route path="/results" element={<Results />} />
          <Route path="/nos-gerants" element={<Directory />} />
          <Route path="/p/:uid" element={<PublicProfile />} />
          
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

          <Route path="/magasin" element={
            <ProtectedRoute>
              <Magasin />
            </ProtectedRoute>
          } />

          <Route path="/mes-formations" element={
            <ProtectedRoute>
              <MesFormations />
            </ProtectedRoute>
          } />

          <Route path="/marketing" element={
            <ProtectedRoute>
              <MarketingVisuel />
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

          <Route path="/war-room" element={
            <ProtectedRoute adminOnly>
              <WarRoom />
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
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
