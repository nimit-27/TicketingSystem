import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadTicketsDialog from '../DownloadTicketsDialog';
import { useApi } from '../../../hooks/useApi';
import { useCategoryFilters } from '../../../hooks/useCategoryFilters';
import { getDivisions } from '../../../services/DivisionService';
import { searchTicketsPaginated } from '../../../services/TicketService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../hooks/useApi');
jest.mock('../../../hooks/useCategoryFilters');
jest.mock('../../../services/DivisionService');
jest.mock('../../../services/TicketService');

jest.mock('../DownloadFiltersScreen', () => ({
  __esModule: true,
  default: (props: any) => (
    <div>
      <button onClick={() => props.onZoneChange('Z1')}>Set Zone</button>
      <button onClick={() => props.onCategoryChange('C1')}>Set Category</button>
      <button onClick={() => props.onSubCategoryChange('SC1')}>Set SubCategory</button>
      <button onClick={() => props.onIssueTypeChange('IT1')}>Set Issue Type</button>
      <button onClick={() => props.onDivisionChange('D1')}>Set Division</button>
      <button onClick={() => props.onStatusChange('OPEN')}>Set Status</button>
      <button onClick={() => props.onOpenColumns()}>Open Columns</button>
      <div data-testid="estimated-count">{props.estimatedCount ?? '-'}</div>
    </div>
  ),
}));

jest.mock('../DownloadColumnsScreen', () => ({
  __esModule: true,
  default: (props: any) => (
    <div>
      <button onClick={() => props.onToggleColumn('id')}>Toggle Id</button>
      <button onClick={() => props.onBack()}>Back</button>
    </div>
  ),
}));

const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;
const mockUseCategoryFilters = useCategoryFilters as jest.MockedFunction<typeof useCategoryFilters>;

const baseProps = {
  open: true,
  zoneOptions: [{ label: 'All', value: 'All' }, { label: 'North', value: 'Z1' }],
  issueTypeOptions: [{ label: 'All', value: 'All' }, { label: 'Electrical', value: 'IT1' }],
  statusOptions: [{ label: 'All', value: 'All' }, { label: 'Open', value: 'OPEN' }],
  divisionOptions: [{ label: 'All', value: 'All' }, { label: 'Ops', value: 'D1' }],
  initialFilters: {
    category: 'All',
    subCategory: 'All',
    zone: 'All',
    region: 'All',
    district: 'All',
    issueType: 'All',
    division: 'All',
    assignee: 'All',
    status: 'All',
    reportFormat: 'All',
  },
  exportableColumns: [
    { key: 'id', label: 'Ticket Id' },
    { key: 'subject', label: 'Subject' },
  ],
  onClose: jest.fn(),
  onGenerate: jest.fn(),
};

describe('DownloadTicketsDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCategoryFilters.mockReturnValue({
      categoryOptions: [{ label: 'All', value: 'All' }, { label: 'Infra', value: 'C1' }],
      subCategoryOptions: [{ label: 'All', value: 'All' }, { label: 'Router', value: 'SC1' }],
      loadSubCategories: jest.fn(),
      resetSubCategories: jest.fn(),
    } as any);

    mockUseApi.mockImplementation(() => ({
      data: [],
      pending: false,
      success: false,
      apiHandler: jest.fn(async (fn) => fn()),
    } as any));

    (getDivisions as jest.Mock).mockResolvedValue({ data: [{ divisionName: 'Ops', divisionId: 'D1' }] });
    (searchTicketsPaginated as jest.Mock).mockResolvedValue({ totalElements: 42 });
  });

  it('generates report with selected filters and selected columns', async () => {
    render(<DownloadTicketsDialog {...baseProps} />);

    await userEvent.click(screen.getByText('Set Zone'));
    await userEvent.click(screen.getByText('Set Category'));
    await userEvent.click(screen.getByText('Set SubCategory'));
    await userEvent.click(screen.getByText('Set Issue Type'));
    await userEvent.click(screen.getByText('Set Division'));
    await userEvent.click(screen.getByText('Set Status'));

    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    await userEvent.click(screen.getByText('As Excel'));

    await waitFor(() => {
      expect(baseProps.onGenerate).toHaveBeenCalledWith('excel', expect.objectContaining({
        zoneCode: 'Z1',
        zoneLabel: 'North',
        categoryId: 'C1',
        subCategoryId: 'SC1',
        issueTypeId: 'IT1',
        statusId: 'OPEN',
        selectedColumnKeys: ['id', 'subject'],
      }));
    });
  });

  it('updates selected columns and triggers estimate call for valid dates', async () => {
    render(<DownloadTicketsDialog {...baseProps} />);

    await waitFor(() => expect(getDivisions).toHaveBeenCalled());
    await waitFor(() => expect(searchTicketsPaginated).toHaveBeenCalled());

    await userEvent.click(screen.getByText('Open Columns'));
    await userEvent.click(screen.getByText('Toggle Id'));
    await userEvent.click(screen.getByText('Back'));

    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    await userEvent.click(screen.getByText('As PDF'));

    await waitFor(() => {
      expect(baseProps.onGenerate).toHaveBeenCalledWith('pdf', expect.objectContaining({ selectedColumnKeys: ['subject'] }));
    });
  });
});
