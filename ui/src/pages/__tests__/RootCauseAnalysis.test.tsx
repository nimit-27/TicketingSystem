import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockGetTickets = jest.fn(() => Promise.resolve({ items: [{ id: '1', severity: 'S1', severityLabel: 'Critical', rcaStatus: 'PENDING' }], totalPages: 2 }));
const mockGetWorkflow = jest.fn(() => Promise.resolve({}));
const mockUseApi = jest.fn();
const mockCategoryFilters = {
  categoryOptions: ['All', 'Category1'],
  subCategoryOptions: ['All'],
  loadSubCategories: jest.fn(),
};

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../services/RootCauseAnalysisService', () => ({
  getRootCauseAnalysisTickets: (...args: unknown[]) => mockGetTickets(...args),
}));

jest.mock('../../services/StatusService', () => ({
  getStatusWorkflowMappings: (...args: unknown[]) => mockGetWorkflow(...args),
}));

jest.mock('../../hooks/useCategoryFilters', () => ({
  useCategoryFilters: () => mockCategoryFilters,
}));

let capturedTicketsProps: any = null;

jest.mock('../../components/AllTickets/TicketsTable', () => ({
  __esModule: true,
  default: (props: any) => {
    capturedTicketsProps = props;
    return <div data-testid="tickets-table">Tickets</div>;
  },
}));

jest.mock('../../components/PaginationControls', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (e: unknown, value: number) => void }) => (
    <button data-testid="pagination" onClick={() => onChange({}, 2)}>Next</button>
  ),
}));

jest.mock('../../components/Filters/DateRangeFilter', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (v: any) => void }) => (
    <button data-testid="date-range" onClick={() => onChange({ preset: 'LAST_7_DAYS' })}>DateRange</button>
  ),
  getDateRangeApiParams: () => ({ fromDate: undefined, toDate: undefined }),
}));

jest.mock('../../components/UI/Dropdown/DropdownController', () => ({
  __esModule: true,
  default: ({ label, onChange }: { label: string; onChange: (v: string) => void }) => (
    <button data-testid={`dropdown-${label}`} onClick={() => onChange('All')}>{label}</button>
  ),
}));

jest.mock('react-router-dom', () => {
  const navigate = jest.fn();
  return {
    useNavigate: () => navigate,
    __navigateMock: navigate,
  };
});

const navigateMock = jest.requireMock('react-router-dom').__navigateMock as jest.Mock;

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: () => ({ username: 'tester', userId: 'tester', role: ['AGENT'] }),
}));

import RootCauseAnalysis from '../RootCauseAnalysis';

describe('RootCauseAnalysis', () => {
  beforeEach(() => {
    mockGetTickets.mockClear();
    mockGetWorkflow.mockClear();
    navigateMock.mockClear();
    mockCategoryFilters.loadSubCategories.mockClear();
    capturedTicketsProps = null;
    mockUseApi.mockReset();

    mockUseApi
      .mockImplementationOnce(() => ({
        data: { items: [{ id: '1', severity: 'S1', severityLabel: 'Critical', rcaStatus: 'PENDING' }], totalPages: 2 },
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementationOnce(() => ({
        data: {},
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementation(() => ({
        data: null,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }));
  });

  it('fetches tickets and renders table with normalized severity', async () => {
    const { getByTestId } = renderWithTheme(<RootCauseAnalysis />);

    await waitFor(() => {
      expect(mockGetTickets).toHaveBeenCalled();
      expect(capturedTicketsProps.tickets[0]).toMatchObject({ severity: 'Critical', severityLabel: 'Critical' });
    });

    fireEvent.click(getByTestId('tickets-table'));
    capturedTicketsProps.onRowClick('1');
    expect(navigateMock).toHaveBeenCalledWith('/root-cause-analysis/1');
  });
});
