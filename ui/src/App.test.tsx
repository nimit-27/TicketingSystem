import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: ({ element }: { element: React.ReactNode }) => <>{element}</>,
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
}), { virtual: true });

jest.mock('./utils/Utils', () => ({
  getUserDetails: jest.fn(() => null),
  getUserPermissions: jest.fn(() => null),
}));

jest.mock('./context/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./pages/RaiseTicket', () => () => <div>RaiseTicket</div>);
jest.mock('./pages/AllTickets', () => () => <div>AllTickets</div>);
jest.mock('./pages/KnowledgeBase', () => () => <div>KnowledgeBase</div>);
jest.mock('./pages/TicketDetails', () => () => <div>TicketDetails</div>);
jest.mock('./pages/CustomerSatisfactionForm', () => () => <div>CustomerSatisfactionForm</div>);
jest.mock('./pages/CategoriesMaster', () => () => <div>CategoriesMaster</div>);
jest.mock('./pages/EscalationMaster', () => () => <div>EscalationMaster</div>);
jest.mock('./pages/RoleMaster', () => () => <div>RoleMaster</div>);
jest.mock('./pages/RoleDetails', () => () => <div>RoleDetails</div>);
jest.mock('./pages/Login', () => () => <h2>Helpdesk Login</h2>);
jest.mock('./pages/DevLogin', () => () => <div>DevLogin</div>);
jest.mock('./pages/MyTickets', () => () => <div>MyTickets</div>);
jest.mock('./pages/MyWorkload', () => () => <div>MyWorkload</div>);
jest.mock('./pages/Faq', () => () => <div>Faq</div>);
jest.mock('./pages/FaqForm', () => () => <div>FaqForm</div>);
jest.mock('./pages/RootCauseAnalysis', () => () => <div>RootCauseAnalysis</div>);
jest.mock('./components/Layout/SidebarLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);


describe('App routing', () => {
  it('renders the login route for unauthenticated users', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});
