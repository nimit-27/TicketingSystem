import React, { JSX, Suspense, lazy, useContext } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getUserDetails, getUserPermissions } from './utils/Utils';
import { NotificationProvider } from './context/NotificationContext';
import { DevModeContext } from './context/DevModeContext';
import ExternalCallback from './pages/ExternalCallback';
import SessionExpiredModal from './components/SessionExpired/SessionExpiredModal';

const SidebarLayout = lazy(() => import('./components/Layout/SidebarLayout'));
const RaiseTicket = lazy(() => import('./pages/RaiseTicket'));
const AllTickets = lazy(() => import('./pages/AllTickets'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const TicketDetails = lazy(() => import('./pages/TicketDetails'));
const CustomerSatisfactionForm = lazy(() => import('./pages/CustomerSatisfactionForm'));
const CategoriesMaster = lazy(() => import('./pages/CategoriesMaster'));
const EscalationMaster = lazy(() => import('./pages/EscalationMaster'));
const RoleMaster = lazy(() => import('./pages/RoleMaster'));
const RoleDetails = lazy(() => import('./pages/RoleDetails'));
const Login = lazy(() => import('./pages/Login'));
const DevLogin = lazy(() => import('./pages/DevLogin'));
const Users = lazy(() => import('./pages/Users'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const MyTickets = lazy(() => import('./pages/MyTickets'));
const MyWorkload = lazy(() => import('./pages/MyWorkload'));
const Faq = lazy(() => import('./pages/Faq'));
const PublicFaq = lazy(() => import('./pages/PublicFaq'));
const FaqForm = lazy(() => import('./pages/FaqForm'));
const RootCauseAnalysis = lazy(() => import('./pages/RootCauseAnalysis'));
const MISReports = lazy(() => import('./pages/MISReports'));
const SlaReports = lazy(() => import('./pages/SlaReports'));
const TicketSummaryReportPage = lazy(() => import('./pages/TicketSummaryReportPage'));
const TicketResolutionTimeReportPage = lazy(() => import('./pages/TicketResolutionTimeReportPage'));
const CustomerSatisfactionReportPage = lazy(() => import('./pages/CustomerSatisfactionReportPage'));
const ProblemManagementReportPage = lazy(() => import('./pages/ProblemManagementReportPage'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const AddUser = lazy(() => import('./pages/AddUser'));
const SupportDashboard = lazy(() => import('./pages/SupportDashboard'));
const FileManagementSystem = lazy(() => import('./pages/FileManagementSystem'));
const PublicLayout = lazy(() => import('./components/Layout/PublicLayout'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const user = getUserDetails();
  const perms = getUserPermissions();
  if (!user?.userId || !perms) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const LoginRoute: React.FC = () => {
  const { devMode } = useContext(DevModeContext);
  return devMode ? <DevLogin /> : <Login />;
};

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionExpiredModal />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/public/faq" element={<PublicFaq />} />
          <Route path="auth/callback" element={<ExternalCallback />} />
        </Route>
        <Route
          path="/"
          element={(
            <RequireAuth>
              <NotificationProvider>
                <SidebarLayout />
              </NotificationProvider>
            </RequireAuth>
          )}
        >
          <Route index element={<Navigate to="/dashboard" replace />} /> {/* Default route */}
          <Route path="dashboard" element={<SupportDashboard />} />
          <Route path="create-ticket" element={<RaiseTicket />} />
          <Route path="tickets" element={<AllTickets />} />
          <Route path="my-tickets" element={<MyTickets />} />
          <Route path="my-workload" element={<MyWorkload />} />
          <Route path="root-cause-analysis" element={<RootCauseAnalysis />} />
          <Route path="faq" element={<Faq />} />
          <Route path="faq/new" element={<FaqForm />} />
          <Route path="faq/:faqId/edit" element={<FaqForm />} />
          <Route path="tickets/:ticketId" element={<TicketDetails />} />
          <Route path="root-cause-analysis/:ticketId" element={<TicketDetails />} />
          <Route path="tickets/:ticketId/feedback" element={<CustomerSatisfactionForm />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="mis-reports" element={<MISReports />} />
          <Route path="sla-reports" element={<SlaReports />} />
          <Route path="mis-reports/ticket-summary" element={<TicketSummaryReportPage />} />
          <Route
            path="mis-reports/resolution-time"
            element={<TicketResolutionTimeReportPage />}
          />
          <Route
            path="mis-reports/customer-satisfaction"
            element={<CustomerSatisfactionReportPage />}
          />
          <Route path="mis-reports/problem-management" element={<ProblemManagementReportPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="modules-master" element={<CategoriesMaster />} />
          <Route path="escalation-master" element={<EscalationMaster />} />
          <Route path="role-master" element={<RoleMaster />} />
          <Route path="role-master/:roleId" element={<RoleDetails />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:type/:userId" element={<UserProfile />} />
          <Route path="users/new" element={<AddUser />} />
          <Route path="my-profile" element={<MyProfile />} />
          <Route path="account/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
