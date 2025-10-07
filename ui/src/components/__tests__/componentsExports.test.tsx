import PaginationControls from '../PaginationControls';
import Title from '../Title';
import NotificationBell from '../Notifications/NotificationBell';
import PermissionsModal from '../Permissions/PermissionsModal';
import PermissionTree from '../Permissions/PermissionTree';
import JsonEditModal from '../Permissions/JsonEditModal';
import LinkToMasterTicketModal from '../RaiseTicket/LinkToMasterTicketModal';
import RaiseTicketRequestorDetails from '../RaiseTicket/RequestorDetails';
import RequestDetails from '../RaiseTicket/RequestDetails';
import SuccessfulModal from '../RaiseTicket/SuccessfulModal';
import TicketDetails from '../RaiseTicket/TicketDetails';
import FeedbackModal from '../Feedback/FeedbackModal';
import StarRating from '../Feedback/StarRating';
import TicketCard from '../AllTickets/TicketCard';
import TicketsTable from '../AllTickets/TicketsTable';
import AssigneeDropdown from '../AllTickets/AssigneeDropdown';
import AllTicketsRequestorDetails from '../AllTickets/RequestorDetails';
import AdvancedAssignmentOptionsDialog from '../AllTickets/AdvancedAssignmentOptionsDialog';
import TicketsList from '../AllTickets/TicketsList';
import ViewTicket from '../AllTickets/ViewTicket';
import CustomFieldset from '../CustomFieldset';
import CommentsSection from '../Comments/CommentsSection';
import SlaProgressChart from '../TicketView/SlaProgressChart';
import TicketView from '../TicketView/TicketView';
import HistorySidebar from '../TicketView/HistorySidebar';
import SlaProgressBar from '../TicketView/SlaProgressBar';
import RootCauseAnalysisModal from '../TicketView/RootCauseAnalysisModal';
import ChildTicketsList from '../TicketView/ChildTicketsList';
import SlaDetails from '../TicketView/SlaDetails';
import StatusHistory from '../StatusHistory';
import SidebarLayout from '../Layout/SidebarLayout';
import Header from '../Layout/Header';
import Sidebar from '../Layout/Sidebar';
import UserMenu from '../Layout/UserMenu';
import AssignmentHistory from '../AssignmentHistory';
import ChildTicketsTable from '../Ticket/ChildTicketsTable';

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({})),
}), { virtual: true });

jest.mock('@monaco-editor/react', () => () => null, { virtual: true });
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(() => jest.fn()),
}), { virtual: true });
jest.mock('@mui/lab', () => ({
  Timeline: () => null,
  TimelineItem: () => null,
  TimelineSeparator: () => null,
  TimelineDot: () => null,
  TimelineConnector: () => null,
  TimelineContent: () => null,
}), { virtual: true });
jest.mock('echarts-for-react', () => () => null, { virtual: true });

describe('component module exports', () => {
  it('exports pagination controls', () => {
    expect(PaginationControls).toBeTruthy();
  });

  it('exports title component', () => {
    expect(Title).toBeTruthy();
  });

  it('exports notification bell', () => {
    expect(NotificationBell).toBeTruthy();
  });

  it('exports permissions components', () => {
    expect(PermissionsModal).toBeTruthy();
    expect(PermissionTree).toBeTruthy();
    expect(JsonEditModal).toBeTruthy();
  });

  it('exports raise ticket components', () => {
    expect(LinkToMasterTicketModal).toBeTruthy();
    expect(RaiseTicketRequestorDetails).toBeTruthy();
    expect(RequestDetails).toBeTruthy();
    expect(SuccessfulModal).toBeTruthy();
    expect(TicketDetails).toBeTruthy();
  });

  it('exports feedback components', () => {
    expect(FeedbackModal).toBeTruthy();
    expect(StarRating).toBeTruthy();
  });

  it('exports all tickets components', () => {
    expect(TicketCard).toBeTruthy();
    expect(TicketsTable).toBeTruthy();
    expect(AssigneeDropdown).toBeTruthy();
    expect(AllTicketsRequestorDetails).toBeTruthy();
    expect(AdvancedAssignmentOptionsDialog).toBeTruthy();
    expect(TicketsList).toBeTruthy();
    expect(ViewTicket).toBeTruthy();
  });

  it('exports ticket view components', () => {
    expect(SlaProgressChart).toBeTruthy();
    expect(TicketView).toBeTruthy();
    expect(HistorySidebar).toBeTruthy();
    expect(SlaProgressBar).toBeTruthy();
    expect(RootCauseAnalysisModal).toBeTruthy();
    expect(ChildTicketsList).toBeTruthy();
    expect(SlaDetails).toBeTruthy();
  });

  it('exports misc components', () => {
    expect(CustomFieldset).toBeTruthy();
    expect(CommentsSection).toBeTruthy();
    expect(StatusHistory).toBeTruthy();
    expect(SidebarLayout).toBeTruthy();
    expect(Header).toBeTruthy();
    expect(Sidebar).toBeTruthy();
    expect(UserMenu).toBeTruthy();
    expect(AssignmentHistory).toBeTruthy();
    expect(ChildTicketsTable).toBeTruthy();
  });
});
