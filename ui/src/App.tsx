import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import RaiseTicket from './pages/RaiseTicket';
import AllTickets from './pages/AllTickets';
import KnowledgeBase from './pages/KnowledgeBase';
import SidebarLayout from './components/Layout/SidebarLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SidebarLayout />}> 
        <Route index element={<Navigate to="/create-ticket" replace />} />
        <Route path="create-ticket" element={<RaiseTicket />} />
        <Route path="tickets" element={<AllTickets />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
      </Route>
    </Routes>
  );
}

export default App;
