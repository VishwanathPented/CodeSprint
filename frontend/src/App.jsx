import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DayDetail from './pages/DayDetail';
import Subscription from './pages/Subscription';
import AdminDashboard from './pages/AdminDashboard';
import PublicProfile from './pages/PublicProfile';
import AssessmentList from './pages/AssessmentList';
import LiveAssessment from './pages/LiveAssessment';
import SqlTrack from './pages/SqlTrack';
import SqlLesson from './pages/SqlLesson';
import AptitudeTrack from './pages/AptitudeTrack';
import AptitudePractice from './pages/AptitudePractice';
import TheoryTrack from './pages/TheoryTrack';
import TheoryPractice from './pages/TheoryPractice';
import HrPrep from './pages/HrPrep';
import DsaTrack from './pages/DsaTrack';
import DsaProblem from './pages/DsaProblem';
import ReviewDeck from './pages/ReviewDeck';
import JavaTrack from './pages/JavaTrack';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

// Intercepts admins trying to view the normal dashboard
const DashboardRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin' || user.isAdmin) return <Navigate to="/admin" />;
  
  return children;
};

// Simple Layout wrapper
const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <Navbar />
    <main className="flex-grow flex flex-col pt-16">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />
          
          <Route path="/dashboard" element={
            <DashboardRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </DashboardRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route path="/day/:id" element={
            <ProtectedRoute>
              <Layout>
                <DayDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/subscribe" element={
            <ProtectedRoute>
              <Layout>
                <Subscription />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/assessments" element={
            <ProtectedRoute>
              <Layout>
                <AssessmentList />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/assessments/:id" element={
            <ProtectedRoute>
              {/* No Layout wrapper for LiveAssessment to ensure full-screen focused proctoring */}
              <LiveAssessment />
            </ProtectedRoute>
          } />

          <Route path="/sql" element={
            <ProtectedRoute>
              <Layout>
                <SqlTrack />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/sql/lesson/:lessonNumber" element={
            <ProtectedRoute>
              <Layout>
                <SqlLesson />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/aptitude" element={
            <ProtectedRoute>
              <Layout>
                <AptitudeTrack />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/aptitude/practice" element={
            <ProtectedRoute>
              <Layout>
                <AptitudePractice />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/theory" element={
            <ProtectedRoute>
              <Layout>
                <TheoryTrack />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/theory/practice" element={
            <ProtectedRoute>
              <Layout>
                <TheoryPractice />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/hr" element={
            <ProtectedRoute>
              <Layout>
                <HrPrep />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/dsa" element={
            <ProtectedRoute>
              <Layout>
                <DsaTrack />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/dsa/:slug" element={
            <ProtectedRoute>
              <Layout>
                <DsaProblem />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/review" element={
            <ProtectedRoute>
              <Layout>
                <ReviewDeck />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/java" element={
            <ProtectedRoute>
              <Layout>
                <JavaTrack />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/u/:username" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
