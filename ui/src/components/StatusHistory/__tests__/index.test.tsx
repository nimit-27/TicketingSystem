import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import StatusHistory from '../index';

const mockApiHandler = jest.fn();
const mockUseApi = jest.fn();
const mockGetAllUsers = jest.fn();
const mockGetStatusHistory = jest.fn();
const mockReportMenu = jest.fn(() => <div data-testid="download-menu" />);

jest.mock('../../../hooks/useApi', () => ({
  useApi: () => mockUseApi(),
}));

jest.mock('../../../services/StatusHistoryService', () => ({
  getStatusHistory: (...args: any[]) => mockGetStatusHistory(...args),
}));

jest.mock('../../../services/UserService', () => ({
  getAllUsers: () => mockGetAllUsers(),
}));

jest.mock('../../UI/ViewToggle', () => ({ value, onChange }: any) => (
  <div>
    <button type="button" onClick={() => onChange('table')} aria-label="table-view">table</button>
    <button type="button" onClick={() => onChange('timeline')} aria-label="timeline-view">timeline</button>
    <span data-testid="view-value">{value}</span>
  </div>
));

jest.mock('../../History/HistoryReportDownloadMenu', () => ({
  __esModule: true,
  default: (props: any) => {
    mockReportMenu(props);
    return <div data-testid="report-menu" />;
  },
}));

jest.mock('../../UI/GenericTable', () => (props: any) => (
  <div data-testid="generic-table">
    {props.dataSource.map((row: any, idx: number) => (
      <div key={row.id} data-testid={`row-${idx}`} data-row-class={props.rowClassName?.(row, idx)}>
        {props.columns.map((column: any) => {
          const value = row[column.dataIndex];
          const text = column.render ? column.render(value, row) : value;
          return <div key={column.key}>{text}</div>;
        })}
      </div>
    ))}
  </div>
));

jest.mock('@mui/lab', () => ({
  Timeline: ({ children }: any) => <div data-testid="timeline">{children}</div>,
  TimelineItem: ({ children }: any) => <div>{children}</div>,
  TimelineSeparator: ({ children }: any) => <div>{children}</div>,
  TimelineDot: ({ children }: any) => <div>{children}</div>,
  TimelineConnector: () => <div data-testid="connector" />,
  TimelineContent: ({ children }: any) => <div>{children}</div>,
}), { virtual: true });

jest.mock('@mui/material', () => ({
  Paper: ({ children }: any) => <div>{children}</div>,
}));

describe('StatusHistory', () => {
  const data = [
    {
      id: '1',
      updatedBy: 'alpha',
      timestamp: '2024-01-02T00:00:00.000Z',
      currentStatus: 'IN_PROGRESS',
      label: 'In Progress',
      remark: 'assigned',
    },
    {
      id: '2',
      updatedBy: 'beta',
      timestamp: '2024-01-01T00:00:00.000Z',
      currentStatus: 'ON_HOLD',
      statusName: 'On Hold',
      remark: '',
    },
    {
      id: '3',
      updatedBy: 'missing',
      timestamp: '2023-12-30T00:00:00.000Z',
      currentStatus: 'WAITING_APPROVAL',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiHandler.mockImplementation((fn: any) => fn());
    mockUseApi.mockReturnValue({ data, apiHandler: mockApiHandler });
    mockGetStatusHistory.mockResolvedValue({ data });
  });

  it('loads status history and user names for table/report rendering', async () => {
    mockGetAllUsers.mockResolvedValue({
      data: [
        { username: 'alpha', name: 'Alpha User' },
        { username: 'beta' },
      ],
    });

    render(<StatusHistory ticketId="T-101" />);

    await waitFor(() => {
      expect(mockApiHandler).toHaveBeenCalled();
      expect(mockGetAllUsers).toHaveBeenCalled();
    });

    expect(mockGetStatusHistory).toHaveBeenCalledWith('T-101');

    expect(screen.getByTestId('row-0')).toHaveAttribute('data-row-class', 'latest-row');
    await waitFor(() => {
      expect(screen.getByText('Alpha User')).toBeInTheDocument();
    });
    expect(screen.getAllByText('beta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('On Hold')).toBeInTheDocument();
    expect(screen.getByText('WAITING APPROVAL')).toBeInTheDocument();

    expect(mockReportMenu).toHaveBeenCalledWith(expect.objectContaining({
      fileBaseName: 'T-101-status-history',
    }));
    const reportRows = mockReportMenu.mock.calls.at(-1)[0].rows;
    expect(reportRows[0].updatedByName).toBe('Alpha User');
    expect(reportRows[1].updatedByName).toBe('beta');
    expect(reportRows[2].updatedByName).toBe('-');
  });

  it('falls back to empty user map when user service fails', async () => {
    mockGetAllUsers.mockRejectedValue(new Error('failed'));

    render(<StatusHistory ticketId="T-102" />);

    await waitFor(() => {
      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });
  });

  it('switches to timeline view and renders connectors/remarks conditionally', async () => {
    mockGetAllUsers.mockResolvedValue({ data: [] });
    render(<StatusHistory ticketId="T-103" />);

    fireEvent.click(screen.getByRole('button', { name: 'timeline-view' }));

    expect(await screen.findByTestId('timeline')).toBeInTheDocument();
    expect(screen.getAllByTestId('connector')).toHaveLength(2);
    expect(screen.getByText('assigned')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });
});
