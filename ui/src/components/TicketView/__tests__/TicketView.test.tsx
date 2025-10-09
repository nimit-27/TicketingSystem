import React from 'react';
import { render, waitFor, screen, within } from '@testing-library/react';
import TicketView from '../TicketView';
import { useApi } from '../../../hooks/useApi';
import { getTicketSla } from '../../../services/TicketService';
import { getPriorities } from '../../../services/PriorityService';
import { getSeverities } from '../../../services/SeverityService';
import { getCategories, getAllSubCategoriesByCategory } from '../../../services/CategoryService';
import { getFeedback } from '../../../services/FeedbackService';
import { getStatusWorkflowMappings } from '../../../services/StatusService';
import Histories from '../../../pages/Histories';
import ChildTicketsList from '../ChildTicketsList';
import { getStatusNameById } from '../../../utils/Utils';

const mockTicket = {
  id: 'T-1',
  subject: 'Test Subject',
  description: 'Test Description',
  priority: 'High',
  priorityId: 'P1',
  severity: 'Critical',
  recommendedSeverity: '',
  category: 'Category',
  subCategory: 'SubCategory',
  categoryId: 'cat-1',
  subCategoryId: 'sub-1',
  assignedToName: 'Agent',
  assignedTo: 'agent',
  requestorName: 'Requester',
  userId: 'user-1',
  reportedDate: '2024-01-01T00:00:00Z',
  lastModified: '2024-01-02T00:00:00Z',
  updatedBy: 'Updater',
  masterId: 'T-1',
  isMaster: true,
  statusLabel: 'Open',
  statusId: '1',
  attachmentPaths: [],
  rcaStatus: 'IN_PROGRESS',
  feedbackStatus: 'PENDING',
};

const mockSla = {
  breachedByMinutes: -5,
  timeTillDueDate: 10,
  totalSlaMinutes: 100,
  elapsedTimeMinutes: 20,
  responseTimeMinutes: 5,
  resolutionTimeMinutes: 10,
  idleTimeMinutes: 5,
  dueAt: '2024-01-02T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
} as any;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/tickets/T-1' }),
}));

jest.mock('../../../hooks/useApi', () => ({
  useApi: jest.fn(),
}));

jest.mock('../../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: jest.fn() }),
}));

jest.mock('../../../services/TicketService', () => ({
  getTicket: jest.fn(async () => ({ data: { body: { data: mockTicket } } })),
  updateTicket: jest.fn(),
  addAttachments: jest.fn(),
  deleteAttachment: jest.fn(),
  getTicketSla: jest.fn(async () => ({ status: 200, data: { body: { data: mockSla } } })),
  getChildTickets: jest.fn(),
  unlinkTicketFromMaster: jest.fn(),
}));

jest.mock('../../../services/RootCauseAnalysisService', () => ({
  getRootCauseAnalysisTicketById: jest.fn(),
}));

jest.mock('../../../services/PriorityService', () => ({
  getPriorities: jest.fn(() => Promise.resolve({ data: { body: { data: [] } } })),
}));

jest.mock('../../../services/SeverityService', () => ({
  getSeverities: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('../../../services/CategoryService', () => ({
  getCategories: jest.fn(() => Promise.resolve({ data: { body: { data: [] } } })),
  getAllSubCategoriesByCategory: jest.fn(() => Promise.resolve({ data: { body: { data: [] } } })),
}));

jest.mock('../../../services/FeedbackService', () => ({
  getFeedback: jest.fn(() => Promise.resolve({ data: null })),
}));

jest.mock('../../../services/StatusService', () => ({
  getStatusWorkflowMappings: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../../utils/permissions', () => ({
  checkAccessMaster: jest.fn(() => true),
  checkFieldAccess: jest.fn(() => true),
}));

jest.mock('../../../utils/Utils', () => ({
  getDropdownOptions: jest.fn((items: any[], label: string, value: string) =>
    (items || []).map(item => ({ label: item[label], value: item[value] }))),
  getStatusNameById: jest.fn(() => 'Open'),
}));

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: jest.fn(() => ({
    username: 'test-user',
    userId: 'user-1',
    role: ['1'],
  })),
}));

jest.mock('../../UI/UserAvatar/UserAvatar', () => () => <div data-testid="avatar" />);
jest.mock('../../UI/Button', () => ({ children, onClick, type, disabled }: any) => (
  <button type={type ?? 'button'} onClick={onClick} disabled={disabled}>
    {children}
  </button>
));

jest.mock('../../UI/IconButton/CustomIconButton', () => ({ icon, onClick }: any) => (
  <button type="button" data-testid={`icon-${icon}`} onClick={onClick}>
    {icon}
  </button>
));

jest.mock('../../UI/Dropdown/GenericDropdown', () => ({ options, value, onChange }: any) => (
  <select data-testid="generic-dropdown" value={value || ''} onChange={e => onChange?.(e.target.value)}>
    {(options || []).map((option: any) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
));

jest.mock('../../UI/Remark/RemarkComponent', () => ({ onSubmit, onCancel }: any) => (
  <div>
    <button type="button" onClick={() => onSubmit?.('remark')}>submit-remark</button>
    <button type="button" onClick={onCancel}>cancel-remark</button>
  </div>
));

jest.mock('../../UI/FileUpload', () => ({ onFilesChange }: any) => (
  <div>
    <button type="button" onClick={() => onFilesChange?.([])}>upload</button>
  </div>
));

jest.mock('../../UI/Icons/InfoIcon', () => () => <span data-testid="info-icon" />);

jest.mock('../../CustomFieldset', () => ({ title, children }: any) => (
  <section data-testid={`fieldset-${title}`}>{children}</section>
));

jest.mock('../../Comments/CommentsSection', () => () => <div data-testid="comments" />);

jest.mock('../../Feedback/FeedbackModal', () => ({ open }: any) => (
  open ? <div data-testid="feedback-modal" /> : null
));

jest.mock('../../RaiseTicket/LinkToMasterTicketModal', () => ({ open }: any) => (
  open ? <div data-testid="link-master-modal" /> : null
));

const mockSlaProgressChart = jest.fn(() => <div data-testid="sla-chart" />);
jest.mock('../SlaProgressChart', () => ({
  __esModule: true,
  default: (props: any) => {
    mockSlaProgressChart(props);
    return <div data-testid="sla-chart" />;
  },
}));

const mockHistories = jest.fn(() => <div data-testid="histories" />);
jest.mock('../../../pages/Histories', () => ({
  __esModule: true,
  default: (props: any) => mockHistories(props),
}));

const mockChildTicketsList = jest.fn(() => <div data-testid="child-tickets" />);
jest.mock('../ChildTicketsList', () => ({
  __esModule: true,
  default: (props: any) => mockChildTicketsList(props),
}));

jest.mock('../RootCauseAnalysisModal', () => () => <div data-testid="rca-modal" />);

const useApiMock = useApi as jest.MockedFunction<typeof useApi>;
const getStatusNameByIdMock = getStatusNameById as jest.MockedFunction<typeof getStatusNameById>;
const getPrioritiesMock = getPriorities as jest.Mock;
const getSeveritiesMock = getSeverities as jest.Mock;
const getCategoriesMock = getCategories as jest.Mock;
const getAllSubCategoriesByCategoryMock = getAllSubCategoriesByCategory as jest.Mock;
const getFeedbackMock = getFeedback as jest.Mock;
const getStatusWorkflowMappingsMock = getStatusWorkflowMappings as jest.Mock;
const getTicketSlaMock = getTicketSla as jest.Mock;

describe('TicketView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useApiMock.mockReset();
    getStatusNameByIdMock.mockReturnValue('Open');
    mockTicket.statusLabel = 'Open';
    mockTicket.statusId = '1';

    getPrioritiesMock.mockResolvedValue({ data: { body: { data: [] } } });
    getSeveritiesMock.mockResolvedValue({ data: [] });
    getCategoriesMock.mockResolvedValue({ data: { body: { data: [] } } });
    getAllSubCategoriesByCategoryMock.mockResolvedValue({ data: { body: { data: [] } } });
    getFeedbackMock.mockResolvedValue({ data: null });
    getStatusWorkflowMappingsMock.mockResolvedValue({});

    const defaultResponse = {
      data: null,
      pending: false,
      success: false,
      error: null,
      apiHandler: (cb: () => Promise<any>) => Promise.resolve(cb()),
    } as any;

    const useApiResponses = [
      { ...defaultResponse, data: mockTicket, success: true },
      { ...defaultResponse },
      { ...defaultResponse, data: { '1': [] }, success: true },
    ];
    let callIndex = 0;
    useApiMock.mockImplementation(() => {
      const response = useApiResponses[callIndex] ?? defaultResponse;
      callIndex = (callIndex + 1) % useApiResponses.length;
      return response;
    });

    getTicketSlaMock.mockResolvedValue({ status: 200, data: { body: { data: mockSla } } });
  });

  it('renders history and SLA information for master tickets', async () => {
    render(<TicketView ticketId="T-1" showHistory sidebar />);

    await waitFor(() => expect(mockHistories).toHaveBeenCalled());
    const historyProps = mockHistories.mock.calls[0][0];
    expect(historyProps.ticketId).toBe('T-1');

    await waitFor(() => expect(getTicketSlaMock).toHaveBeenCalled());

    const breachedLabel = await screen.findByText('Breached By (mins)');
    const breachedRow = breachedLabel.closest('tr');
    expect(breachedRow).not.toBeNull();
    expect(within(breachedRow!).getByText('0')).toBeInTheDocument();

    const timeTillDueLabel = await screen.findByText('Time Till Due Date (mins)');
    const timeTillDueRow = timeTillDueLabel.closest('tr');
    expect(timeTillDueRow).not.toBeNull();
    expect(within(timeTillDueRow!).getByText('5')).toBeInTheDocument();

    await waitFor(() => expect(mockChildTicketsList).toHaveBeenCalled());
    const childProps = mockChildTicketsList.mock.calls[0][0];
    expect(childProps.parentId).toBe('T-1');
  });

  it('hides link to master ticket button when ticket is resolved', async () => {
    getStatusNameByIdMock.mockReturnValue('Resolved');
    mockTicket.statusLabel = 'Resolved';
    render(<TicketView ticketId="T-1" showHistory sidebar />);

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Link to a Master Ticket' })).not.toBeInTheDocument()
    );
  });

  it('hides link to master ticket button when ticket is closed', async () => {
    getStatusNameByIdMock.mockReturnValue('Closed');
    mockTicket.statusLabel = 'Closed';
    render(<TicketView ticketId="T-1" showHistory sidebar />);

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Link to a Master Ticket' })).not.toBeInTheDocument()
    );
  });
});
