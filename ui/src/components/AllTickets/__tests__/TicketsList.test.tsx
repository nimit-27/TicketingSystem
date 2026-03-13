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
    getDropdownOptions: (items: any[] = [], labelKey: string, valueKey: string) =>
        items.map((item) => ({ label: item?.[labelKey], value: item?.[valueKey] })),
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


const mockGetZones = jest.fn();
const mockGetRegions = jest.fn();
const mockGetDistricts = jest.fn();
jest.mock('../../../services/LocationService', () => ({
    getZones: (...args: any[]) => mockGetZones(...args),
    getRegions: (...args: any[]) => mockGetRegions(...args),
    getDistricts: (...args: any[]) => mockGetDistricts(...args),
}));

const mockGetIssueTypes = jest.fn();
jest.mock('../../../services/IssueTypeService', () => ({
    getIssueTypes: (...args: any[]) => mockGetIssueTypes(...args),
}));

const mockGetDivisions = jest.fn();
jest.mock('../../../services/DivisionService', () => ({
    getDivisions: (...args: any[]) => mockGetDivisions(...args),
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


jest.mock('../AssigneeFilterDropdown', () => () => <div data-testid="assignee-filter" />);

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
            resetSubCategories: jest.fn(),
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
        mockGetZones.mockResolvedValue([]);
        mockGetRegions.mockResolvedValue([]);
        mockGetDistricts.mockResolvedValue([]);
        mockGetIssueTypes.mockResolvedValue([]);
        mockGetDivisions.mockResolvedValue([]);
    });

    const arrangeUseApiMocks = (overrides?: { data?: any; workflowData?: any; allowedData?: any; zonesData?: any; regionsData?: any; districtsData?: any; issueTypesData?: any; divisionsData?: any }) => {
        const searchHandler = jest.fn(async (fn) => fn());
        const workflowHandler = jest.fn(async (fn) => fn());
        const allowedHandler = jest.fn(async (fn) => fn());
        const noopHandler = jest.fn(async (fn) => fn());

        const allowedResponse = {
            data: overrides?.allowedData ?? ['OPEN', 'CLOSED'],
            pending: false,
            success: true,
            apiHandler: allowedHandler,
        };
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

        const responses = [
            allowedResponse,
            searchResponse,
            workflowResponse,
            { data: overrides?.zonesData ?? [], pending: false, apiHandler: noopHandler },
            { data: overrides?.regionsData ?? [], pending: false, apiHandler: noopHandler },
            { data: overrides?.districtsData ?? [], pending: false, apiHandler: noopHandler },
            { data: overrides?.issueTypesData ?? [], pending: false, apiHandler: noopHandler },
            { data: overrides?.divisionsData ?? [], pending: false, apiHandler: noopHandler },
        ];
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

        expect(mockSearchTicketsPaginated).toHaveBeenCalled();
        const firstCall = mockSearchTicketsPaginated.mock.calls[0];
        expect(firstCall[0]).toBe('');
        expect(firstCall[3]).toBe(0);
        expect(firstCall[4]).toBe(20);
        expect(firstCall[9]).toBe('reportedDate');
        expect(firstCall[10]).toBe('desc');
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
            expect(lastCall[4]).toBe(20);
        });
    });

    it('fetches the next page when pagination changes', async () => {
        const { searchHandler } = arrangeUseApiMocks();

        render(<TicketsList titleKey="tickets.title" />);

        await waitFor(() => expect(searchHandler).toHaveBeenCalled());

        const pagination = screen.getByTestId('pagination-controls');
        fireEvent.click(pagination.querySelectorAll('button')[0]);

        await waitFor(() => {
            expect(mockSearchTicketsPaginated.mock.calls.some((call) => call[3] === 1)).toBe(true);
        });
    });

    it('resets filters and reapplies default user location values', async () => {
        const loadSubCategories = jest.fn();
        const resetSubCategories = jest.fn();
        mockUseCategoryFilters.mockReturnValue({
            categoryOptions: [
                { label: 'All', value: 'All' },
                { label: 'IT', value: 'IT' },
            ],
            subCategoryOptions: [
                { label: 'All', value: 'All' },
                { label: 'Hardware', value: 'Hardware' },
            ],
            loadSubCategories,
            resetSubCategories,
        });
        mockGetCurrentUserDetails.mockReturnValue({
            levels: ['L1', 'L2'],
            role: ['Agent'],
            zoneCode: 'Z1',
            officeType: 'RO',
            officeCode: 'R1',
        });

        arrangeUseApiMocks({
            zonesData: [{ zoneCode: 'Z1', zoneName: 'Zone 1' }],
            regionsData: [{ regionCode: 'R1', regionName: 'Region 1', hrmsRegCode: 'HR1' }],
            districtsData: [{ districtCode: 'D1', districtName: 'District 1' }],
            issueTypesData: [{ issueTypeId: 'ISS-1', issueTypeLabel: 'Hardware' }],
            divisionsData: [{ divisionId: 'DIV-1', divisionName: 'Division One' }],
        });
        render(<TicketsList titleKey="tickets.title" allowAll={true} />);

        await waitFor(() => expect(mockSearchTicketsPaginated).toHaveBeenCalled());

        fireEvent.change(screen.getByTestId('tickets-search'), { target: { value: 'INC-2' } });
        fireEvent.change(screen.getByTestId('dropdown-Status'), { target: { value: 'OPEN' } });
        fireEvent.change(screen.getByTestId('dropdown-Module'), { target: { value: 'IT' } });
        fireEvent.change(screen.getByTestId('dropdown-Sub Module'), { target: { value: 'Hardware' } });
        fireEvent.change(screen.getByTestId('dropdown-Zone'), { target: { value: 'Z2' } });
        fireEvent.change(screen.getByTestId('dropdown-Region'), { target: { value: 'R2' } });
        fireEvent.change(screen.getByTestId('dropdown-District'), { target: { value: 'D2' } });
        fireEvent.change(screen.getByTestId('dropdown-Issue Type'), { target: { value: 'ISS-2' } });
        fireEvent.change(screen.getByTestId('dropdown-Division'), { target: { value: 'DIV-2' } });
        fireEvent.change(screen.getByTestId('dropdown-Date Parameter'), { target: { value: 'last_modified' } });

        fireEvent.click(screen.getByText('L1'));
        fireEvent.click(screen.getByText('Master'));
        fireEvent.click(screen.getByText('Reset Filters'));

        await waitFor(() => {
            const lastCall = mockSearchTicketsPaginated.mock.calls[mockSearchTicketsPaginated.mock.calls.length - 1];
            expect(lastCall[0]).toBe('');
            expect(lastCall[1]).toBeUndefined();
            expect(lastCall[2]).toBeUndefined();
            expect(lastCall[3]).toBe(0);
            expect(lastCall[13]).toBe('reported_date');
            expect(lastCall[18]).toBe('Z1');
            expect(lastCall[19]).toBe('R1');
            expect(lastCall[20]).toBeUndefined();
            expect(lastCall[21]).toBeUndefined();
            expect(lastCall[22]).toBeUndefined();
        });

        expect(resetSubCategories).toHaveBeenCalled();
        expect(loadSubCategories).toHaveBeenCalled();
    });

    it('updates issue type and geographic filters through handlers', async () => {
        mockGetZones.mockResolvedValue({ data: [{ zoneCode: 'Z1', zoneName: 'Zone 1' }] });
        mockGetRegions.mockResolvedValue({ data: [{ regionCode: 'R1', regionName: 'Region 1', hrmsRegCode: 'HR1' }] });
        mockGetDistricts.mockResolvedValue({ data: [{ districtCode: 'D1', districtName: 'District 1' }] });
        mockGetIssueTypes.mockResolvedValue({ data: [{ issueTypeId: 'ISS-1', issueTypeLabel: 'Hardware' }] });
        mockGetDivisions.mockResolvedValue({ data: [{ divisionId: 'DIV-1', divisionName: 'Division One' }] });

        arrangeUseApiMocks({
            zonesData: [{ zoneCode: 'Z1', zoneName: 'Zone 1' }],
            regionsData: [{ regionCode: 'R1', regionName: 'Region 1', hrmsRegCode: 'HR1' }],
            districtsData: [{ districtCode: 'D1', districtName: 'District 1' }],
            issueTypesData: [{ issueTypeId: 'ISS-1', issueTypeLabel: 'Hardware' }],
            divisionsData: [{ divisionId: 'DIV-1', divisionName: 'Division One' }],
        });
        render(<TicketsList titleKey="tickets.title" allowAll={true} />);

        await waitFor(() => expect(mockGetZones).toHaveBeenCalled());
        await waitFor(() => expect(mockSearchTicketsPaginated).toHaveBeenCalled());

        fireEvent.change(screen.getByTestId('dropdown-Zone'), { target: { value: 'Z1' } });
        await waitFor(() => expect(mockGetRegions).toHaveBeenCalledWith('Z1'));

        fireEvent.change(screen.getByTestId('dropdown-Region'), { target: { value: 'R1' } });
        await waitFor(() => expect(mockGetDistricts).toHaveBeenCalledWith('HR1'));

        fireEvent.change(screen.getByTestId('dropdown-District'), { target: { value: 'D1' } });
        fireEvent.change(screen.getByTestId('dropdown-Issue Type'), { target: { value: 'ISS-1' } });
        fireEvent.change(screen.getByTestId('dropdown-Division'), { target: { value: 'DIV-1' } });

        await waitFor(() => {
            const lastCall = mockSearchTicketsPaginated.mock.calls[mockSearchTicketsPaginated.mock.calls.length - 1];
            expect(lastCall[18]).toBe('Z1');
            expect(lastCall[19]).toBe('R1');
            expect(lastCall[20]).toBe('D1');
            expect(lastCall[21]).toBe('ISS-1');
            expect(lastCall[22]).toBe('DIV-1');
        });
    });

    it('loads statuses directly when restrictStatusesToAllowed is false and avoids allowed-status api gate', async () => {
        const { allowedHandler } = arrangeUseApiMocks();

        render(<TicketsList titleKey="tickets.title" allowAll={false} restrictStatusesToAllowed={false} />);

        await waitFor(() => expect(mockGetStatuses).toHaveBeenCalled());
        await waitFor(() => expect(mockSearchTicketsPaginated).toHaveBeenCalled());
        expect(allowedHandler).not.toHaveBeenCalled();
    });
});
