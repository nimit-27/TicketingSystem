import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: ({ element, children }: { element: React.ReactNode; children?: React.ReactNode }) => (
    <>
      {element}
      {children}
    </>
  ),
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
jest.mock('./pages/MISReports', () => () => <div>MISReports</div>);
jest.mock('./pages/SlaReports', () => () => <div>SlaReports</div>);
jest.mock('./pages/TicketSummaryReportPage', () => () => <div>TicketSummary</div>);
jest.mock('./pages/TicketResolutionTimeReportPage', () => () => <div>TicketResolutionTime</div>);
jest.mock('./pages/CustomerSatisfactionReportPage', () => () => <div>CustomerSatisfactionReport</div>);
jest.mock('./pages/ProblemManagementReportPage', () => () => <div>ProblemManagementReport</div>);
jest.mock('./pages/Calendar', () => () => <div>Calendar</div>);
jest.mock('./pages/SupportDashboard', () => () => <div>SupportDashboard</div>);
jest.mock('./pages/FileManagementSystem', () => () => <div>FileManagementSystem</div>);
jest.mock('./pages/Users', () => () => <div>Users</div>);
jest.mock('./pages/UserProfile', () => () => <div>UserProfile</div>);
jest.mock('./pages/MyProfile', () => () => <div>MyProfile</div>);
jest.mock('./pages/PublicFaq', () => () => <div>PublicFaq</div>);
jest.mock('./pages/AddUser', () => () => <div>AddUser</div>);
jest.mock('./components/Layout/SidebarLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);
jest.mock('./components/Layout/PublicLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({}),
}), { virtual: true });


describe('App routing', () => {
  it('renders the login route for unauthenticated users', async () => {
    render(<App />);

    const navigations = await screen.findAllByTestId('navigate');
    expect(navigations.some(nav => nav.getAttribute('data-to') === '/login')).toBe(true);
  });
});
