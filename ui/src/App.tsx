import React, { JSX } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import RaiseTicket from './pages/RaiseTicket';
import AllTickets from './pages/AllTickets';
import KnowledgeBase from './pages/KnowledgeBase';
import TicketDetails from './pages/TicketDetails';
import CustomerSatisfactionForm from './pages/CustomerSatisfactionForm';
import CategoriesMaster from './pages/CategoriesMaster';
import EscalationMaster from './pages/EscalationMaster';
import RoleMaster from './pages/RoleMaster';
import RoleDetails from './pages/RoleDetails';
import SidebarLayout from './components/Layout/SidebarLayout';
import Login from './pages/Login';
import MyTickets from './pages/MyTickets';
import Faq from './pages/Faq';
import FaqForm from './pages/FaqForm';
import { getUserDetails, getUserPermissions } from './utils/Utils';

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const user = getUserDetails();
  const perms = getUserPermissions();
  if (!user?.userId || !perms) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><SidebarLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/create-ticket" replace />} />
        <Route path="create-ticket" element={<RaiseTicket />} />
        <Route path="tickets" element={<AllTickets />} />
        <Route path="my-tickets" element={<MyTickets />} />
        <Route path="faq" element={<Faq />} />
        <Route path="faq/new" element={<FaqForm />} />
        <Route path="tickets/:ticketId" element={<TicketDetails />} />
        <Route path="tickets/:ticketId/feedback" element={<CustomerSatisfactionForm />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="categories-master" element={<CategoriesMaster />} />
        <Route path="escalation-master" element={<EscalationMaster />} />
        <Route path="role-master" element={<RoleMaster />} />
        <Route path="role-master/:roleId" element={<RoleDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
