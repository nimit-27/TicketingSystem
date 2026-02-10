import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentHistory from '../index';
import { renderWithTheme } from '../../../test/testUtils';

const mockUseApi = jest.fn();
const mockGetAssignmentHistory = jest.fn();

jest.mock('../../../hooks/useApi', () => ({
  useApi: () => mockUseApi(),
}));

jest.mock('../../../services/AssignmentHistoryService', () => ({
  getAssignmentHistory: (...args: unknown[]) => mockGetAssignmentHistory(...args),
}));

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
  })),
}), { virtual: true });

jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}), { virtual: true });

jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}), { virtual: true });

jest.mock('@mui/lab', () => ({
  Timeline: ({ children }: any) => <div data-testid="timeline">{children}</div>,
  TimelineItem: ({ children }: any) => <div data-testid="timeline-item">{children}</div>,
  TimelineSeparator: ({ children }: any) => <div>{children}</div>,
  TimelineDot: ({ children }: any) => <div>{children}</div>,
  TimelineConnector: ({ children }: any) => <div>{children}</div>,
  TimelineContent: ({ children }: any) => <div>{children}</div>,
}), { virtual: true });

jest.mock('../../UI/GenericTable', () => ({
  __esModule: true,
  default: ({ dataSource, columns, rowClassName }: any) => (
    <table data-testid="generic-table">
      <tbody>
        {dataSource.map((row: any, index: number) => (
          <tr key={row.id} data-rowclass={rowClassName ? rowClassName(row, index) : ''}>
            {columns.map((column: any) => {
              const value = column.dataIndex ? row[column.dataIndex] : undefined;
              return (
                <td key={column.key || column.dataIndex}>
                  {column.render ? column.render(value, row) : value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

jest.mock('../../UI/ViewToggle', () => ({
  __esModule: true,
  default: ({ value, onChange, options }: any) => (
    <div>
      {options.map((option: any) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.value}
        </button>
      ))}
      <span data-testid="current-view">{value}</span>
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AssignmentHistory', () => {
  const mockHistory = [
    {
      id: '1',
      assignedBy: 'Manager A',
      assignedTo: 'Agent A',
      timestamp: '2023-01-01T10:00:00.000Z',
      remark: 'Oldest remark',
    },
    {
      id: '2',
      assignedBy: 'Manager B',
      assignedTo: 'Agent B',
      timestamp: '2023-02-01T12:00:00.000Z',
      remark: 'Latest remark',
    },
  ];

  let apiHandlerMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReset();

    apiHandlerMock = jest.fn((fn: () => Promise<unknown>) => fn());

    mockGetAssignmentHistory.mockResolvedValue(mockHistory);

    mockUseApi.mockReturnValue({
      data: mockHistory,
      apiHandler: apiHandlerMock,
      success: true,
      pending: false,
      error: null,
    });
  });

  it('renders table view with sorted history and triggers API call', async () => {
    renderWithTheme(<AssignmentHistory ticketId="INC-1" />);

    await waitFor(() => expect(apiHandlerMock).toHaveBeenCalled());

    const handler = apiHandlerMock.mock.calls[0][0];
    await handler();

    expect(mockGetAssignmentHistory).toHaveBeenCalledWith('INC-1');

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Agent B');
    expect(rows[0]).toHaveAttribute('data-rowclass', 'latest-row');
  });

  it('switches to timeline view when selected', async () => {
    renderWithTheme(<AssignmentHistory ticketId="INC-2" />);

    const timelineButton = screen.getByRole('button', { name: 'timeline' });
    await userEvent.click(timelineButton);

    expect(screen.getByTestId('current-view')).toHaveTextContent('timeline');
    expect(screen.queryByTestId('generic-table')).not.toBeInTheDocument();
    expect(screen.getByText('Latest remark')).toBeInTheDocument();
  });
});
