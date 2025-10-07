import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketsList from '../TicketsList';
import type { TicketRow } from '../TicketsTable';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseApi = jest.fn();
jest.mock('../../../hooks/useApi', () => ({
    useApi: (...args: any[]) => mockUseApi(...args),
}));

const mockUseDebounce = jest.fn((value) => value);
jest.mock('../../../hooks/useDebounce', () => ({
    useDebounce: (...args: any[]) => mockUseDebounce(...args),
}));

const mockUseCategoryFilters = jest.fn();
jest.mock('../../../hooks/useCategoryFilters', () => ({
    useCategoryFilters: (...args: any[]) => mockUseCategoryFilters(...args),
}));

const mockSearchTicketsPaginated = jest.fn();
jest.mock('../../../services/TicketService', () => ({
    searchTicketsPaginated: (...args: any[]) => mockSearchTicketsPaginated(...args),
}));

const mockGetStatuses = jest.fn();
const mockSetStatusListInSession = jest.fn();
jest.mock('../../../utils/Utils', () => ({
    getStatuses: (...args: any[]) => mockGetStatuses(...args),
    setStatusList: (...args: any[]) => mockSetStatusListInSession(...args),
}));

const mockCheckMyTicketsAccess = jest.fn(() => true);
jest.mock('../../../utils/permissions', () => ({
    checkMyTicketsAccess: (...args: any[]) => mockCheckMyTicketsAccess(...args),
}));

const mockGetStatusWorkflowMappings = jest.fn();
const mockGetAllowedStatusListByRoles = jest.fn();
jest.mock('../../../services/StatusService', () => ({
    getStatusWorkflowMappings: (...args: any[]) => mockGetStatusWorkflowMappings(...args),
    getAllowedStatusListByRoles: (...args: any[]) => mockGetAllowedStatusListByRoles(...args),
}));

const mockGetCurrentUserDetails = jest.fn();
jest.mock('../../../config/config', () => ({
    getCurrentUserDetails: (...args: any[]) => mockGetCurrentUserDetails(...args),
}));

jest.mock('../../Title', () => ({ textKey }: { textKey: string }) => <h1>{textKey}</h1>);

const mockTicketsTable = jest.fn(() => <div data-testid="tickets-table" />);
jest.mock('../TicketsTable', () => ({
    __esModule: true,
    default: (props: any) => mockTicketsTable(props),
}));

const mockTicketCard = jest.fn(({ ticket }: { ticket: TicketRow }) => (
    <div data-testid="ticket-card">{ticket.subject}</div>
));
jest.mock('../TicketCard', () => ({
    __esModule: true,
    default: (props: any) => mockTicketCard(props),
}));

const mockViewTicket = jest.fn(() => <div data-testid="view-ticket" />);
jest.mock('../ViewTicket', () => ({
    __esModule: true,
    default: (props: any) => mockViewTicket(props),
}));

jest.mock('../../UI/ViewToggle', () => ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <div>
        <button data-testid="toggle-grid" onClick={() => onChange('grid')}>
            grid
        </button>
        <span data-testid="current-view">{value}</span>
    </div>
));

jest.mock('../../UI/Dropdown/DropdownController', () => ({ label, value, onChange, options }: any) => (
    <label>
        {label}
        <select data-testid={`dropdown-${label}`} value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </label>
));

jest.mock('../../PaginationControls', () => ({ page, onChange, pageSize, onPageSizeChange }: any) => (
    <div data-testid="pagination-controls">
        <button onClick={() => onChange({}, page + 1)}>Next</button>
        <button onClick={() => onPageSizeChange(pageSize + 5)}>Size</button>
    </div>
));

jest.mock('../../UI/Input/GenericInput', () => ({ value, onChange }: any) => (
    <input data-testid="tickets-search" value={value} onChange={onChange} />
));

const mockGetDateRangeApiParams = jest.fn(() => ({ fromDate: undefined, toDate: undefined }));
jest.mock('../../Filters/DateRangeFilter', () => ({
    __esModule: true,
    default: ({ onChange }: any) => (
        <button data-testid="date-range" onClick={() => onChange({ preset: 'TODAY' })}>
            date
        </button>
    ),
    getDateRangeApiParams: (...args: any[]) => mockGetDateRangeApiParams(...args),
}));

describe('TicketsList', () => {
    const mockTickets: TicketRow[] = [
        {
            id: 'INC-1',
            subject: 'Printer not working',
            category: 'IT',
            subCategory: 'Hardware',
            priority: 'High',
            priorityId: 'P1',
            isMaster: false,
        },
        {
            id: 'INC-2',
            subject: 'Login issue',
            category: 'IT',
            subCategory: 'Access',
            priority: 'Medium',
            priorityId: 'P2',
            isMaster: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseApi.mockReset();
        mockGetDateRangeApiParams.mockReturnValue({ fromDate: undefined, toDate: undefined });
        mockCheckMyTicketsAccess.mockReturnValue(true);

        mockUseCategoryFilters.mockReturnValue({
            categoryOptions: [
                { label: 'All', value: 'All' },
                { label: 'IT', value: 'IT' },
            ],
            subCategoryOptions: [
                { label: 'All', value: 'All' },
                { label: 'Hardware', value: 'Hardware' },
            ],
            loadSubCategories: jest.fn(),
        });

        mockGetCurrentUserDetails.mockReturnValue({
            levels: ['L1'],
            role: ['Agent'],
        });

        mockGetStatuses.mockResolvedValue([
            { statusId: 'OPEN', statusName: 'Open' },
            { statusId: 'CLOSED', statusName: 'Closed' },
        ]);
        mockSetStatusListInSession.mockResolvedValue(undefined);

        mockGetStatusWorkflowMappings.mockResolvedValue({
            OPEN: [],
        });

        mockGetAllowedStatusListByRoles.mockResolvedValue(['OPEN', 'CLOSED']);

        mockSearchTicketsPaginated.mockResolvedValue({ items: mockTickets, totalPages: 2 });

        mockUseDebounce.mockImplementation((value) => value);
    });

    const arrangeUseApiMocks = (overrides?: { data?: any; workflowData?: any; allowedData?: any }) => {
        const searchHandler = jest.fn(async (fn) => fn());
        const workflowHandler = jest.fn(async (fn) => fn());
        const allowedHandler = jest.fn(async (fn) => fn());

        const searchResponse = {
            data: overrides?.data ?? { items: mockTickets, totalPages: 2 },
            pending: false,
            apiHandler: searchHandler,
        };
        const workflowResponse = {
            data: overrides?.workflowData ?? { OPEN: [] },
            pending: false,
            apiHandler: workflowHandler,
        };
        const allowedResponse = {
            data: overrides?.allowedData ?? ['OPEN', 'CLOSED'],
            pending: false,
            apiHandler: allowedHandler,
        };

        const responses = [searchResponse, workflowResponse, allowedResponse];
        let callCount = 0;
        mockUseApi.mockImplementation(() => {
            const response = responses[callCount % responses.length];
            callCount += 1;
            return response;
        });

        return { searchHandler, workflowHandler, allowedHandler };
    };

    it('renders table view with fetched tickets and triggers initial search', async () => {
        const { searchHandler } = arrangeUseApiMocks();

        render(<TicketsList titleKey="tickets.title" />);

        await waitFor(() => expect(searchHandler).toHaveBeenCalled());
        await waitFor(() => expect(mockTicketsTable).toHaveBeenCalled());

        expect(screen.getByRole('heading', { name: 'tickets.title' })).toBeInTheDocument();

        const tableProps = mockTicketsTable.mock.calls[mockTicketsTable.mock.calls.length - 1][0];
        expect(tableProps.tickets).toEqual(mockTickets);
        expect(tableProps.permissionPathPrefix).toBe('myTickets');

        expect(mockSearchTicketsPaginated).toHaveBeenCalledWith(
            '',
            undefined,
            undefined,
            0,
            5,
            undefined,
            undefined,
            undefined,
            undefined,
            'reportedDate',
            'desc',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
        );
    });

    it('switches to grid view when view toggle is used', async () => {
        const { searchHandler } = arrangeUseApiMocks();

        render(<TicketsList titleKey="tickets.title" />);

        await waitFor(() => expect(searchHandler).toHaveBeenCalled());
        await waitFor(() => expect(mockTicketsTable).toHaveBeenCalled());

        fireEvent.click(screen.getByTestId('toggle-grid'));

        await waitFor(() => expect(mockTicketCard).toHaveBeenCalledTimes(mockTickets.length));
        expect(mockTicketCard).toHaveBeenCalledWith(
            expect.objectContaining({ ticket: expect.objectContaining({ id: 'INC-1' }) }),
        );
    });

    it('triggers a new search when the query changes', async () => {
        const { searchHandler } = arrangeUseApiMocks();

        render(<TicketsList titleKey="tickets.title" />);

        await waitFor(() => expect(searchHandler).toHaveBeenCalled());

        const searchInput = screen.getByTestId('tickets-search');
        fireEvent.change(searchInput, { target: { value: 'INC' } });

        await waitFor(() => {
            expect(mockSearchTicketsPaginated).toHaveBeenCalled();
            const lastCall = mockSearchTicketsPaginated.mock.calls[mockSearchTicketsPaginated.mock.calls.length - 1];
            expect(lastCall[0]).toBe('INC');
            expect(lastCall[3]).toBe(0);
            expect(lastCall[4]).toBe(5);
        });
    });
});
