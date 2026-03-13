import React from 'react';
import { act, render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as XLSX from 'xlsx';
import TicketsTable, { TicketRow } from '../TicketsTable';

const mockShowMessage = jest.fn();
jest.mock('../../../context/SnackbarContext', () => ({
    useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

const mockJsPdfSave = jest.fn();
const mockJsPdfText = jest.fn();
const mockJsPdfConstructor = jest.fn();
jest.mock('jspdf', () => ({
    __esModule: true,
    default: class {
        constructor(...args: any[]) {
            mockJsPdfConstructor(...args);
        }

        text = mockJsPdfText
        save = mockJsPdfSave
    }
}), { virtual: true });

const mockAutoTable = jest.fn();
jest.mock('jspdf-autotable', () => ({
    __esModule: true,
    default: (...args: any[]) => mockAutoTable(...args),
}), { virtual: true });

const mockWorksheet = { '!ref': 'A1:B2' } as any;
const mockAoaToSheet = jest.fn(() => mockWorksheet);
const mockBookNew = jest.fn(() => ({}));
const mockBookAppendSheet = jest.fn();
const mockWriteFile = jest.fn();
const mockDecodeRange = jest.fn(() => ({ s: { r: 0, c: 0 }, e: { r: 1, c: 1 } }));
const mockEncodeCell = jest.fn(({ r, c }: { r: number; c: number }) => `R${r}C${c}`);
jest.mock('xlsx', () => ({
    __esModule: true,
    utils: {
        aoa_to_sheet: (...args: any[]) => mockAoaToSheet(...args),
        json_to_sheet: (...args: any[]) => mockAoaToSheet(...args),
        book_new: (...args: any[]) => mockBookNew(...args),
        book_append_sheet: (...args: any[]) => mockBookAppendSheet(...args),
        decode_range: (...args: any[]) => mockDecodeRange(...args),
        encode_cell: (...args: any[]) => mockEncodeCell(...args),
    },
    writeFile: (...args: any[]) => mockWriteFile(...args),
    default: {
        utils: {
            aoa_to_sheet: (...args: any[]) => mockAoaToSheet(...args),
            json_to_sheet: (...args: any[]) => mockAoaToSheet(...args),
            book_new: (...args: any[]) => mockBookNew(...args),
            book_append_sheet: (...args: any[]) => mockBookAppendSheet(...args),
            decode_range: (...args: any[]) => mockDecodeRange(...args),
            encode_cell: (...args: any[]) => mockEncodeCell(...args),
        },
        writeFile: (...args: any[]) => mockWriteFile(...args),
    },
}), { virtual: true });

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}), { virtual: true });

const mockUseApi = jest.fn();
jest.mock('../../../hooks/useApi', () => ({
    useApi: (...args: any[]) => mockUseApi(...args),
}));

const mockCheckAccessMaster = jest.fn(() => true);
const mockCheckMyTicketsColumnAccess = jest.fn(() => true);
jest.mock('../../../utils/permissions', () => ({
    checkAccessMaster: (...args: any[]) => mockCheckAccessMaster(...args),
    checkMyTicketsColumnAccess: (...args: any[]) => mockCheckMyTicketsColumnAccess(...args),
}));

const mockGetStatusNameById = jest.fn(() => 'Open');
const mockTruncateWithEllipsis = jest.fn((value: string) => value);
const mockTruncateWithLeadingEllipsis = jest.fn((value: string) => value);
const mockGetDropdownOptions = jest.fn(() => []);
const mockGetDropdownOptionsWithExtraOption = jest.fn((items: any[] = [], labelKey: string, valueKey: string, extra: any) => [extra, ...items.map((i: any) => ({ label: i[labelKey], value: i[valueKey] }))]);
jest.mock('../../../utils/Utils', () => ({
    getStatusNameById: (...args: any[]) => mockGetStatusNameById(...args),
    truncateWithEllipsis: (...args: any[]) => mockTruncateWithEllipsis(...args),
    truncateWithLeadingEllipsis: (...args: any[]) => mockTruncateWithLeadingEllipsis(...args),
    getDropdownOptions: (...args: any[]) => mockGetDropdownOptions(...args),
    getDropdownOptionsWithExtraOption: (...args: any[]) => mockGetDropdownOptionsWithExtraOption(...args),
}));

const mockAssigneeDropdown = jest.fn(() => <div data-testid="assignee-dropdown" />);
jest.mock('../AssigneeDropdown', () => ({
    __esModule: true,
    default: (props: any) => mockAssigneeDropdown(props),
}));

const mockRemarkComponent = jest.fn(() => <div data-testid="remark-component" />);
jest.mock('../../UI/Remark/RemarkComponent', () => ({
    __esModule: true,
    default: (props: any) => mockRemarkComponent(props),
}));

const mockUserAvatar = jest.fn(({ name }: { name: string }) => <div data-testid="user-avatar">{name}</div>);
jest.mock('../../UI/UserAvatar/UserAvatar', () => ({
    __esModule: true,
    default: (props: any) => mockUserAvatar(props),
}));

const mockRequestorDetails = jest.fn(() => <div data-testid="requestor-details" />);
const mockDownloadTicketsDialog = jest.fn(() => <div data-testid="download-dialog" />);
jest.mock('../DownloadTicketsDialog', () => ({
    __esModule: true,
    default: (props: any) => mockDownloadTicketsDialog(props),
}));

jest.mock('../RequestorDetails', () => ({
    __esModule: true,
    default: (props: any) => mockRequestorDetails(props),
}));

const mockPriorityIcon = jest.fn(({ priorityText }: { priorityText: string }) => (
    <div data-testid="priority-icon">{priorityText}</div>
));
jest.mock('../../UI/Icons/PriorityIcon', () => ({
    __esModule: true,
    default: (props: any) => mockPriorityIcon(props),
}));

const mockCustomIconButton = jest.fn(({ icon, onClick, className }: any) => (
    <button data-testid={`custom-icon-${icon}`} onClick={onClick} className={className || ''} />
));
jest.mock('../../UI/IconButton/CustomIconButton', () => {
    const MockIconComponent = ({ icon, className }: any) => (
        <span data-testid={`icon-component-${icon}`} className={className} />
    );
    return {
        __esModule: true,
        default: (props: any) => mockCustomIconButton(props),
        IconComponent: MockIconComponent,
    };
});

const mockGenericTable = jest.fn((props: any) => <div data-testid="generic-table" />);
jest.mock('../../UI/GenericTable', () => ({
    __esModule: true,
    default: (props: any) => mockGenericTable(props),
}));

jest.mock('@mui/material', () => {
    const actual = jest.requireActual('@mui/material');
    return {
        ...actual,
        Tooltip: ({ children }: any) => <>{children}</>,
    };
});

const mockUpdateTicket = jest.fn();
const mockSearchTicketsForExport = jest.fn();
jest.mock('../../../services/TicketService', () => ({
    updateTicket: (...args: any[]) => mockUpdateTicket(...args),
    searchTicketsForExport: (...args: any[]) => mockSearchTicketsForExport(...args),
}));
const mockGetAllUsers = jest.fn();
jest.mock('../../../services/UserService', () => ({
    getAllUsers: (...args: any[]) => mockGetAllUsers(...args),
}));


const mockGetCurrentUserDetails = jest.fn(() => ({ username: 'agent.user' }));
jest.mock('../../../config/config', () => ({
    getCurrentUserDetails: (...args: any[]) => mockGetCurrentUserDetails(...args),
}));


const mockGetRegions = jest.fn();
const mockGetDistricts = jest.fn();
jest.mock('../../../services/LocationService', () => ({
    getRegions: (...args: any[]) => mockGetRegions(...args),
    getDistricts: (...args: any[]) => mockGetDistricts(...args),
}));
const tickets: TicketRow[] = [
    {
        id: 'INC-001',
        subject: 'Network outage',
        category: 'Infrastructure',
        subCategory: 'Network',
        priority: 'Critical',
        priorityId: 'P1',
        isMaster: true,
        requestorName: 'Jane Smith',
        requestorEmailId: 'jane@example.com',
        requestorMobileNo: '1234567890',
        statusId: 'OPEN',
        assignedTo: 'agent1',
        assignedToName: 'Agent One',
        feedbackStatus: 'PENDING',
        severity: 'High',
        severityId: 'S1',
        severityLabel: 'High',
    },
];

beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReset();
    mockDownloadTicketsDialog.mockClear();
    mockUseApi.mockImplementation(() => ({ apiHandler: jest.fn(async (fn) => fn()) }));
    mockNavigate.mockReset();
    mockCheckAccessMaster.mockImplementation(() => true);
    mockCheckMyTicketsColumnAccess.mockImplementation(() => true);
    mockJsPdfSave.mockClear();
    mockJsPdfText.mockClear();
    mockJsPdfConstructor.mockClear();
    mockAutoTable.mockClear();
    mockAoaToSheet.mockReset();
    mockAoaToSheet.mockImplementation(() => ({ '!ref': 'A1:A1' } as any));
    mockBookNew.mockClear();
    mockBookAppendSheet.mockClear();
    mockWriteFile.mockClear();
    mockSearchTicketsForExport.mockReset();
    mockSearchTicketsForExport.mockResolvedValue(tickets);
    mockGetAllUsers.mockReset();
    mockGetAllUsers.mockResolvedValue([]);
    mockGetRegions.mockReset();
    mockGetRegions.mockResolvedValue({ data: [] });
    mockGetDistricts.mockReset();
    mockGetDistricts.mockResolvedValue({ data: [] });
    mockShowMessage.mockReset();
    (XLSX as any).utils.aoa_to_sheet = mockAoaToSheet;
});

describe('TicketsTable', () => {
    it('passes rows to GenericTable and highlights refreshing ticket', async () => {
        render(
            <TicketsTable
                tickets={tickets}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                refreshingTicketId="INC-001"
                statusWorkflows={{ OPEN: [] }}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        const tableProps = mockGenericTable.mock.calls[0][0];
        expect(tableProps.dataSource).toEqual(tickets);
        expect(tableProps.rowClassName(tickets[0])).toBe('refreshing-row');
    });

    it('renders assignee dropdown when assignment is allowed', async () => {
        render(
            <TicketsTable
                tickets={tickets}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={{ OPEN: [{ id: '1', action: 'Assign', nextStatus: 2 }] as any }}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        expect(mockGetAllUsers).toHaveBeenCalled();
        const tableProps = mockGenericTable.mock.calls[0][0];
        const assigneeColumn = tableProps.columns.find((col: any) => col.key === 'assignee');
        expect(assigneeColumn).toBeDefined();
        const renderedAssignee = assigneeColumn.render(null, tickets[0]);
        expect(React.isValidElement(renderedAssignee)).toBe(true);
        render(<>{renderedAssignee}</>);
        expect(mockAssigneeDropdown).toHaveBeenCalledWith(
            expect.objectContaining({ ticketId: 'INC-001', assigneeName: 'Agent One', callViaApi: false, users: [] }),
        );
    });

    it('includes severity column when enabled', async () => {
        render(
            <TicketsTable
                tickets={tickets}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={{ OPEN: [] }}
                showSeverityColumn
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        const tableProps = mockGenericTable.mock.calls[0][0];
        const severityColumn = tableProps.columns.find((col: any) => col.key === 'severity');
        expect(severityColumn).toBeDefined();

        const rendered = render(<>{severityColumn.render(null, tickets[0])}</>);
        expect(rendered.getByText('High')).toBeInTheDocument();
    });

    it('renders RCA action button when rcaStatus is provided', async () => {
        const rcaTickets: TicketRow[] = [{ ...tickets[0], rcaStatus: 'PENDING' }];

        render(
            <TicketsTable
                tickets={rcaTickets}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={{ OPEN: [] }}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        const tableProps = mockGenericTable.mock.calls[0][0];
        const actionsColumn = tableProps.columns.find((col: any) => col.key === 'action');
        expect(actionsColumn).toBeDefined();
        const rendered = render(<>{actionsColumn.render(null, rcaTickets[0])}</>);
        expect(rendered.getByRole('button', { name: 'Submit RCA' })).toBeInTheDocument();
    });

    it('opens download dialog and passes export metadata', async () => {
        render(
            <TicketsTable
                tickets={tickets}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={{ OPEN: [] }}
                selectedCategory="Infrastructure"
                selectedSubCategory="Network"
                selectedZone="All"
                selectedRegion="All"
                selectedDistrict="All"
                selectedIssueType="All"
                selectedDivision="All"
                selectedAssignee="All"
                selectedStatusFilter="All"
                zoneOptions={[{ label: 'All', value: 'All' }]}
                issueTypeOptions={[{ label: 'All', value: 'All' }]}
                statusFilterOptions={[{ label: 'All', value: 'All' }]}
                divisionOptions={[{ label: 'All', value: 'All' }]}
            />,
        );

        await waitFor(() => expect(mockDownloadTicketsDialog).toHaveBeenCalled());

        const initialProps = mockDownloadTicketsDialog.mock.calls[0][0];
        expect(initialProps.open).toBe(false);

        await userEvent.click(screen.getByRole('button', { name: /Download/i }));

        const latestProps = mockDownloadTicketsDialog.mock.calls.at(-1)?.[0];
        expect(latestProps.open).toBe(true);
        expect(latestProps.initialFilters).toEqual(expect.objectContaining({
            category: 'Infrastructure',
            subCategory: 'Network',
        }));
        expect(latestProps.exportableColumns).toEqual(expect.arrayContaining([
            expect.objectContaining({ key: 'id', label: 'Ticket Id' }),
            expect.objectContaining({ key: 'status', label: 'Status' }),
        ]));
    });

    it('generates excel export with borders and a sanitized filename from selected filters', async () => {
        mockSearchTicketsForExport.mockResolvedValue({
            content: [{ ...tickets[0], createdOn: '2024-05-01T00:00:00.000Z', zoneName: 'North Zone' }],
        });

        render(
            <TicketsTable
                tickets={tickets}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={{ OPEN: [] }}
            />,
        );

        await waitFor(() => expect(mockDownloadTicketsDialog).toHaveBeenCalled());
        const dialogProps = mockDownloadTicketsDialog.mock.calls.at(-1)?.[0];

        await act(async () => {
            await dialogProps.onGenerate('excel', {
                fromDate: '2024-05-01',
                toDate: '2024-05-10',
                zoneLabel: 'North Zone!',
                selectedColumnKeys: ['id', 'createdDate', 'status'],
            });
        });

        await waitFor(() => expect(mockWriteFile).toHaveBeenCalled());
        expect(mockDecodeRange).toHaveBeenCalled();
        const [, fileName] = mockWriteFile.mock.calls[0];
        expect(fileName).toContain('tickets_01052024_10052024');
        expect(fileName).toContain('zone-north-zone');
        expect(fileName).toContain('.xlsx');
    });

    it('shows warning and does not export when date range is invalid', async () => {
        render(
            <TicketsTable
                tickets={tickets}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={{ OPEN: [] }}
            />,
        );

        await waitFor(() => expect(mockDownloadTicketsDialog).toHaveBeenCalled());
        const dialogProps = mockDownloadTicketsDialog.mock.calls.at(-1)?.[0];

        await act(async () => {
            await dialogProps.onGenerate('excel', {
                fromDate: '2024-05-15',
                toDate: '2024-05-10',
            });
        });

        expect(mockShowMessage).toHaveBeenCalledWith('Please select a valid date range.', 'warning');
        expect(mockWriteFile).not.toHaveBeenCalled();
        expect(mockJsPdfSave).not.toHaveBeenCalled();
    });

    it('opens action menu and excludes Resume for allowed assign-back users on FCI on-hold status', async () => {
        mockGetCurrentUserDetails.mockReturnValue({ username: 'agent.user', levels: ['L1'] });
        mockGetStatusNameById.mockReturnValue('On Hold (Pending with FCI)');

        render(
            <TicketsTable
                tickets={[{ ...tickets[0], statusId: 'ON_HOLD_FCI', assignedBy: 'someone.else' }]}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={{
                    ON_HOLD_FCI: [
                        { id: 'wf1', action: 'Resume', nextStatus: 2 },
                        { id: 'wf2', action: 'Resolve', nextStatus: 3 },
                        { id: 'wf3', action: 'Close', nextStatus: 4 },
                    ] as any,
                }}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        const tableProps = mockGenericTable.mock.calls.at(-1)?.[0];
        const actionsColumn = tableProps.columns.find((col: any) => col.key === 'action');

        render(<>{actionsColumn.render(null, { ...tickets[0], statusId: 'ON_HOLD_FCI', assignedBy: 'someone.else' })}</>);
        const moreVertCall = mockCustomIconButton.mock.calls.find((call) => call[0].icon === 'moreVert');
        expect(moreVertCall).toBeDefined();

        await act(async () => {
            moreVertCall?.[0].onClick({ currentTarget: document.createElement('button') });
        });

        await waitFor(() => {
            expect(screen.getByText('Resolve')).toBeInTheDocument();
            expect(screen.queryByText('Resume')).not.toBeInTheDocument();
        });
    });

    it('handles Assign Back via Resume icon and chooses next status based on assignee', async () => {
        const workflows = {
            ON_HOLD: [
                { id: 'wf1', action: 'Resume', nextStatus: 99 },
                { id: 'wf2', action: 'Reassign', nextStatus: 2 },
                { id: 'wf3', action: 'Resolve', nextStatus: 3 },
                { id: 'wf4', action: 'Reset Open', nextStatus: 1 },
            ] as any,
        };

        const { rerender } = render(
            <TicketsTable
                tickets={[{ ...tickets[0], statusId: 'ON_HOLD', assignedTo: 'agent1' }]}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={workflows}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        let tableProps = mockGenericTable.mock.calls.at(-1)?.[0];
        let actionsColumn = tableProps.columns.find((col: any) => col.key === 'action');
        const rowWithAssignee = { ...tickets[0], statusId: 'ON_HOLD', assignedTo: 'agent1' };

        render(<>{actionsColumn.render(null, rowWithAssignee)}</>);
        const firstUndoButtonCall = mockCustomIconButton.mock.calls.find((call) => call[0].icon === 'undo');
        expect(firstUndoButtonCall).toBeDefined();

        await act(async () => {
            firstUndoButtonCall?.[0].onClick();
        });

        await waitFor(() => {
            const latestProps = mockGenericTable.mock.calls.at(-1)?.[0];
            expect(latestProps.expandable.expandedRowKeys).toEqual(['INC-001']);
            const expandedContent = latestProps.expandable.expandedRowRender(rowWithAssignee);
            render(<>{expandedContent}</>);
            expect(mockRemarkComponent).toHaveBeenCalledWith(expect.objectContaining({ actionName: 'Reassign' }));
        });
        rerender(
            <TicketsTable
                tickets={[{ ...tickets[0], statusId: 'ON_HOLD', assignedTo: '' }]}
                onIdClick={jest.fn()}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                statusWorkflows={workflows}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        tableProps = mockGenericTable.mock.calls.at(-1)?.[0];
        actionsColumn = tableProps.columns.find((col: any) => col.key === 'action');
        const rowWithoutAssignee = { ...tickets[0], statusId: 'ON_HOLD', assignedTo: '' };

        render(<>{actionsColumn.render(null, rowWithoutAssignee)}</>);
        const undoCalls = mockCustomIconButton.mock.calls.filter((call) => call[0].icon === 'undo');
        const secondUndoButtonCall = undoCalls.at(-1);
        expect(secondUndoButtonCall).toBeDefined();

        await act(async () => {
            secondUndoButtonCall?.[0].onClick();
        });

        await waitFor(() => {
            const latestProps = mockGenericTable.mock.calls.at(-1)?.[0];
            const expandedContent = latestProps.expandable.expandedRowRender(rowWithoutAssignee);
            render(<>{expandedContent}</>);
            expect(mockRemarkComponent).toHaveBeenCalledWith(expect.objectContaining({ actionName: 'Reset Open' }));
        });
    });

    it('handles Recommend Escalation action by calling callback and opening ticket id', async () => {
        const onRecommendEscalation = jest.fn();
        const onIdClick = jest.fn();

        render(
            <TicketsTable
                tickets={[{ ...tickets[0], statusId: 'OPEN' }]}
                onIdClick={onIdClick}
                onRowClick={jest.fn()}
                searchCurrentTicketsPaginatedApi={jest.fn()}
                onRecommendEscalation={onRecommendEscalation}
                statusWorkflows={{ OPEN: [{ id: 'wf-esc', action: 'Recommend Escalation', nextStatus: 4 }] as any }}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        const tableProps = mockGenericTable.mock.calls.at(-1)?.[0];
        const actionsColumn = tableProps.columns.find((col: any) => col.key === 'action');

        render(<>{actionsColumn.render(null, { ...tickets[0], statusId: 'OPEN' })}</>);
        const recommendButtonCall = mockCustomIconButton.mock.calls.find((call) => call[0].icon === 'northEast');
        expect(recommendButtonCall).toBeDefined();

        await act(async () => {
            recommendButtonCall?.[0].onClick();
        });

        expect(onRecommendEscalation).toHaveBeenCalledWith('INC-001');
        expect(onIdClick).toHaveBeenCalledWith('INC-001');
    });
});
