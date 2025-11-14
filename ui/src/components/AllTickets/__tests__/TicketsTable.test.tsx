import React from 'react';
import { render, waitFor } from '@testing-library/react';
import TicketsTable, { TicketRow } from '../TicketsTable';

const mockJsPdfSave = jest.fn();
const mockJsPdfConstructor = jest.fn();
jest.mock('jspdf', () => ({
    __esModule: true,
    default: class {
        constructor(...args: any[]) {
            mockJsPdfConstructor(...args);
        }

        save = mockJsPdfSave
    }
}));

const mockAutoTable = jest.fn();
jest.mock('jspdf-autotable', () => ({
    __esModule: true,
    default: (...args: any[]) => mockAutoTable(...args),
}));

const mockJsonToSheet = jest.fn(() => ({}));
const mockBookNew = jest.fn(() => ({}));
const mockBookAppendSheet = jest.fn();
const mockWriteFile = jest.fn();
jest.mock('xlsx', () => ({
    __esModule: true,
    utils: {
        json_to_sheet: (...args: any[]) => mockJsonToSheet(...args),
        book_new: (...args: any[]) => mockBookNew(...args),
        book_append_sheet: (...args: any[]) => mockBookAppendSheet(...args),
    },
    writeFile: (...args: any[]) => mockWriteFile(...args),
}));

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
jest.mock('../../../utils/Utils', () => ({
    getStatusNameById: (...args: any[]) => mockGetStatusNameById(...args),
    truncateWithEllipsis: (...args: any[]) => mockTruncateWithEllipsis(...args),
    truncateWithLeadingEllipsis: (...args: any[]) => mockTruncateWithLeadingEllipsis(...args),
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
jest.mock('../../../services/TicketService', () => ({
    updateTicket: (...args: any[]) => mockUpdateTicket(...args),
}));

const mockGetCurrentUserDetails = jest.fn(() => ({ username: 'agent.user' }));
jest.mock('../../../config/config', () => ({
    getCurrentUserDetails: (...args: any[]) => mockGetCurrentUserDetails(...args),
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
    mockUseApi.mockImplementation(() => ({ apiHandler: jest.fn(async (fn) => fn()) }));
    mockNavigate.mockReset();
    mockCheckAccessMaster.mockImplementation(() => true);
    mockCheckMyTicketsColumnAccess.mockImplementation(() => true);
    mockJsPdfSave.mockClear();
    mockJsPdfConstructor.mockClear();
    mockAutoTable.mockClear();
    mockJsonToSheet.mockClear();
    mockBookNew.mockClear();
    mockBookAppendSheet.mockClear();
    mockWriteFile.mockClear();
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
                statusWorkflows={{ OPEN: [{ id: '1', action: 'Resolve', nextStatus: 'RESOLVED' }] as any }}
            />,
        );

        await waitFor(() => expect(mockGenericTable).toHaveBeenCalled());
        const tableProps = mockGenericTable.mock.calls[0][0];
        const assigneeColumn = tableProps.columns.find((col: any) => col.key === 'assignee');
        expect(assigneeColumn).toBeDefined();
        const renderedAssignee = assigneeColumn.render(null, tickets[0]);
        expect(React.isValidElement(renderedAssignee)).toBe(true);
        render(<>{renderedAssignee}</>);
        expect(mockAssigneeDropdown).toHaveBeenCalledWith(
            expect.objectContaining({ ticketId: 'INC-001', assigneeName: 'Agent One' }),
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
});
