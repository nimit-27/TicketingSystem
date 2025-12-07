import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TicketCard, { TicketCardData } from '../TicketCard';

type TicketStatusWorkflow = {
    id: string;
    action: string;
    nextStatus: string;
};

const mockAssigneeDropdown = jest.fn((props: any) => (
    <span data-testid="assignee-dropdown">Assignee Dropdown for {props.assigneeName}</span>
));
jest.mock('../AssigneeDropdown', () => ({
    __esModule: true,
    default: (props: any) => mockAssigneeDropdown(props),
}));

const mockCustomIconButton = jest.fn(({ icon, onClick }: any) => (
    <button type="button" data-testid={`custom-icon-${icon}`} onClick={onClick}>
        {icon}
    </button>
));
const mockIconComponent = jest.fn(({ icon }: any) => <span data-testid={`icon-${icon}`}>{icon}</span>);
jest.mock('../../UI/IconButton/CustomIconButton', () => ({
    __esModule: true,
    default: (props: any) => mockCustomIconButton(props),
    IconComponent: (props: any) => mockIconComponent(props),
}));

const mockRemarkComponent = jest.fn(({ actionName, onSubmit, onCancel }: any) => (
    <span>
        <span>{actionName}</span>
        <button type="button" data-testid="remark-submit" onClick={() => onSubmit('remark')}>
            submit
        </button>
        <button type="button" onClick={onCancel}>
            cancel
        </button>
    </span>
));
jest.mock('../../UI/Remark/RemarkComponent', () => ({
    __esModule: true,
    default: (props: any) => mockRemarkComponent(props),
}));

jest.mock('../../UI/Icons/MasterIcon', () => () => <span data-testid="master-icon">Master</span>);
jest.mock('../../UI/UserAvatar/UserAvatar', () => ({ name }: any) => <span data-testid="user-avatar">{name}</span>);
jest.mock('../../UI/Icons/PriorityIcon', () => ({ priorityText }: any) => (
    <span data-testid="priority-icon">{priorityText}</span>
));

const mockUseApi = jest.fn();
jest.mock('../../../hooks/useApi', () => ({
    useApi: (...args: any[]) => mockUseApi(...args),
}));

jest.mock('@mui/icons-material/Visibility', () => (props: any) => (
    <svg data-testid="visibility-icon" {...props} />
));

const mockUpdateTicket = jest.fn(() => Promise.resolve({}));
jest.mock('../../../services/TicketService', () => ({
    updateTicket: (...args: any[]) => mockUpdateTicket(...args),
}));

const mockGetCurrentUserDetails = jest.fn(() => ({ username: 'agent.user' }));
jest.mock('../../../config/config', () => ({
    getCurrentUserDetails: (...args: any[]) => mockGetCurrentUserDetails(...args),
}));

const mockGetStatusNameById = jest.fn(() => 'In Progress');
const mockGetStatusColorById = jest.fn(() => '#000');
const mockTruncateWithEllipsis = jest.fn((value: string) => value);
jest.mock('../../../utils/Utils', () => ({
    getStatusNameById: (...args: any[]) => mockGetStatusNameById(...args),
    getStatusColorById: (...args: any[]) => mockGetStatusColorById(...args),
    truncateWithEllipsis: (...args: any[]) => mockTruncateWithEllipsis(...args),
}));

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockUseNavigate,
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('TicketCard', () => {
    const ticket: TicketCardData = {
        id: 'INC-100',
        subject: 'Printer not working',
        description: 'The office printer is jammed',
        category: 'IT',
        subCategory: 'Hardware',
        priority: 'P1',
        isMaster: true,
        userId: 'user-123',
        requestorName: 'John Doe',
        assignedTo: 'agent1',
        assignedToName: 'Agent One',
        statusId: 'open',
    };

    const searchCurrentTicketsPaginatedApi = jest.fn();
    const updateTicketApiHandler = jest.fn((callback: any) => Promise.resolve(callback()));

    beforeEach(() => {
        jest.clearAllMocks();
        updateTicketApiHandler.mockImplementation((callback: any) => Promise.resolve(callback()));
        mockUseApi.mockReturnValue({ apiHandler: updateTicketApiHandler });
        mockUpdateTicket.mockResolvedValue({});
        mockGetCurrentUserDetails.mockReturnValue({ username: 'agent.user' });
        searchCurrentTicketsPaginatedApi.mockClear();
    });

    it('shows assignee dropdown when assign action is available', () => {
        const workflows: Record<string, TicketStatusWorkflow[]> = {
            open: [
                { id: '1', action: 'Assign', nextStatus: '2' },
                { id: '2', action: 'Resolve', nextStatus: '3' },
            ],
        };

        render(
            <TicketCard
                ticket={ticket}
                priorityConfig={{}}
                statusWorkflows={workflows}
                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
            />
        );

        expect(mockAssigneeDropdown).toHaveBeenCalledTimes(1);
        const assigneeProps = mockAssigneeDropdown.mock.calls[0][0];
        expect(assigneeProps).toMatchObject({
            ticketId: 'INC-100',
            assigneeName: 'Agent One',
            requestorId: 'user-123',
        });
    });

    it('renders menu button when more than two actions are available', async () => {
        const workflows: Record<string, TicketStatusWorkflow[]> = {
            open: [
                { id: '1', action: 'Resolve', nextStatus: '2' },
                { id: '2', action: 'Cancel/ Reject', nextStatus: '3' },
                { id: '3', action: 'Close', nextStatus: '4' },
            ],
        };

        const { container } = render(
            <TicketCard
                ticket={ticket}
                priorityConfig={{}}
                statusWorkflows={workflows}
                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
            />
        );

        fireEvent.mouseEnter(container.firstChild as HTMLElement);
        await waitFor(() => {
            expect(mockCustomIconButton).toHaveBeenCalledWith(expect.objectContaining({ icon: 'moreVert' }));
        });
    });

    it('submits remark when action is chosen', async () => {
        const workflows: Record<string, TicketStatusWorkflow[]> = {
            open: [
                { id: '1', action: 'Resolve', nextStatus: '2' },
            ],
        };

        const { container } = render(
            <TicketCard
                ticket={ticket}
                priorityConfig={{}}
                statusWorkflows={workflows}
                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
            />
        );

        fireEvent.mouseEnter(container.firstChild as HTMLElement);
        await waitFor(() => {
            expect(mockCustomIconButton).toHaveBeenCalledWith(expect.objectContaining({ icon: 'check' }));
        });
        const actionCall = mockCustomIconButton.mock.calls.find(([props]) => props.icon === 'check');
        expect(actionCall).toBeDefined();
        const actionProps = actionCall![0];
        await act(async () => {
            actionProps.onClick?.({ stopPropagation: jest.fn() } as any);
        });
        await waitFor(() => {
            expect(mockRemarkComponent).toHaveBeenCalledWith(expect.objectContaining({ actionName: 'Resolve' }));
        });
        const remarkCall = mockRemarkComponent.mock.calls.find(([props]) => props.actionName === 'Resolve');
        expect(remarkCall).toBeDefined();
        remarkCall![0].onSubmit('remark');

        await waitFor(() => {
            expect(mockUpdateTicket).toHaveBeenCalled();
        });

        expect(mockUpdateTicket).toHaveBeenCalledWith('INC-100', expect.objectContaining({
            status: { statusId: '2' },
            remark: 'remark',
            updatedBy: 'agent.user',
        }));
        expect(searchCurrentTicketsPaginatedApi).toHaveBeenCalledWith('INC-100');
        expect(mockRemarkComponent).toHaveBeenCalledWith(expect.objectContaining({ actionName: 'Resolve' }));
    });

    it('navigates to ticket details when visibility icon is clicked', async () => {
        const workflows: Record<string, TicketStatusWorkflow[]> = { open: [] };
        const { container } = render(
            <TicketCard
                ticket={ticket}
                priorityConfig={{}}
                statusWorkflows={workflows}
                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
            />,
        );

        fireEvent.mouseEnter(container.firstChild as HTMLElement);
        const visibilityButton = await screen.findByTestId('visibility-icon');
        fireEvent.click(visibilityButton);

        expect(mockUseNavigate).toHaveBeenCalledWith('/tickets/INC-100');
    });
});
