import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';

// Pages
import Dashboard from '@/pages/Dashboard';
import MyProjects from '@/pages/MyProjects';
import ProjectDescription from '@/pages/ProjectDescription';
import TeamArchitecture from '@/pages/TeamArchitecture';
import CandidatePipeline from '@/pages/CandidatePipeline';
import ProjectExecution from '@/pages/ProjectExecution';
import InvestorReadiness from '@/pages/InvestorReadiness';
import TeamMembers from '@/pages/TeamMembers';
import Documents from '@/pages/Documents';
import Settings from '@/pages/Settings';
import TeamPerformance from '@/pages/TeamPerformance';
import BudgetRunway from '@/pages/BudgetRunway';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Radah Works...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route element={<Layout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/MyProjects" element={<MyProjects />} />
        <Route path="/ProjectDescription" element={<ProjectDescription />} />
        <Route path="/TeamArchitecture" element={<TeamArchitecture />} />
        <Route path="/CandidatePipeline" element={<CandidatePipeline />} />
        <Route path="/ProjectExecution" element={<ProjectExecution />} />
        <Route path="/InvestorReadiness" element={<InvestorReadiness />} />
        <Route path="/TeamMembers" element={<TeamMembers />} />
        <Route path="/Documents" element={<Documents />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/TeamPerformance" element={<TeamPerformance />} />
        <Route path="/BudgetRunway" element={<BudgetRunway />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;