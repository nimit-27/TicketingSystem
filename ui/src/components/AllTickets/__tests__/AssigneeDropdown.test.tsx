import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssigneeDropdown from '../AssigneeDropdown';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseApi = jest.fn();
jest.mock('../../../hooks/useApi', () => ({
    useApi: (...args: any[]) => mockUseApi(...args),
}));

const mockGetAllLevels = jest.fn();
const mockGetAllUsers = jest.fn();
const mockGetAllUsersByLevel = jest.fn();
const mockUpdateTicket = jest.fn();

jest.mock('../../../services/LevelService', () => ({
    getAllLevels: (...args: any[]) => mockGetAllLevels(...args),
    getAllUsersByLevel: (...args: any[]) => mockGetAllUsersByLevel(...args),
}));

jest.mock('../../../services/UserService', () => ({
    getAllUsers: (...args: any[]) => mockGetAllUsers(...args),
}));

jest.mock('../../../services/TicketService', () => ({
    updateTicket: (...args: any[]) => mockUpdateTicket(...args),
}));

const mockGetCurrentUserDetails = jest.fn();
jest.mock('../../../config/config', () => ({
    getCurrentUserDetails: (...args: any[]) => mockGetCurrentUserDetails(...args),
}));

const mockRemarkComponent = jest.fn(({ onSubmit, onCancel }: any) => (
    <div data-testid="remark-component">
        <button onClick={() => onSubmit('Reassigning ticket')}>submit-remark</button>
        <button onClick={onCancel}>cancel-remark</button>
    </div>
));
jest.mock('../../UI/Remark/RemarkComponent', () => ({
    __esModule: true,
    default: (props: any) => mockRemarkComponent(props),
}));

const mockAdvancedDialog = jest.fn(({ open }: any) => (open ? <div data-testid="advanced-dialog" /> : null));
jest.mock('../AdvancedAssignmentOptionsDialog', () => ({
    __esModule: true,
    default: (props: any) => mockAdvancedDialog(props),
}));

jest.mock('@mui/material', () => {
    const actual = jest.requireActual('@mui/material');
    return {
        ...actual,
        Menu: ({ open, children }: any) => (open ? <div data-testid="assignee-menu">{children}</div> : null),
        Tooltip: ({ children }: any) => <>{children}</>,
        IconButton: ({ onClick, children }: any) => (
            <button data-testid="assignee-trigger" onClick={onClick}>
                {children}
            </button>
        ),
        Button: ({ onClick, children }: any) => (
            <button onClick={onClick}>{children}</button>
        ),
        Chip: ({ label, onClick }: any) => (
            <button data-testid={`chip-${label}`} onClick={onClick}>
                {label}
            </button>
        ),
        ListItemButton: ({ children, onClick }: any) => (
            <div data-testid="assignee-option" onClick={onClick}>
                {children}
            </div>
        ),
    };
});

const mockUserAvatar = jest.fn(({ name, onClick }: any) => (
    <button data-testid="assignee-trigger" onClick={onClick}>
        {name || 'assign'}
    </button>
));
jest.mock('../../UI/UserAvatar/UserAvatar', () => ({
    __esModule: true,
    default: (props: any) => mockUserAvatar(props),
}));

jest.mock('@mui/icons-material/PersonAddAlt', () => () => <span data-testid="add-icon" />);

describe('AssigneeDropdown', () => {
    const mockLevels = [
        { levelId: 'L1', levelName: 'Level 1' },
        { levelId: 'L2', levelName: 'Level 2' },
    ];

    const mockUsers = [
        { userId: '1', username: 'agent.one', name: 'Agent One', roles: '3|8', levels: ['L1', 'L2'] },
        { userId: '2', username: 'agent.two', name: 'Agent Two', roles: '9', levels: ['L1'] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseApi.mockReset();

        const levelsHandler = jest.fn(async (fn) => fn());
        const usersByLevelHandler = jest.fn(async (fn) => fn());
        const allUsersHandler = jest.fn(async (fn) => fn());
        const updateHandler = jest.fn(async (fn) => fn());

        const responses = [
            { data: mockLevels, apiHandler: levelsHandler },
            { data: [], apiHandler: usersByLevelHandler },
            { data: mockUsers, apiHandler: allUsersHandler },
            { apiHandler: updateHandler },
        ];
        let callCount = 0;
        mockUseApi.mockImplementation(() => {
            const response = responses[callCount % responses.length];
            callCount += 1;
            return response;
        });

        mockGetAllLevels.mockResolvedValue(mockLevels);
        mockGetAllUsers.mockResolvedValue(mockUsers);
        mockGetAllUsersByLevel.mockResolvedValue(mockUsers);
        mockUpdateTicket.mockResolvedValue({});

        mockGetCurrentUserDetails.mockReturnValue({
            username: 'current.user',
            allowedStatusActionIds: ['4', '16'],
        });
    });

    it('loads initial data and displays available users when opened', async () => {
        render(<AssigneeDropdown ticketId="INC-100" />);

        await waitFor(() => expect(mockGetAllLevels).toHaveBeenCalled());
        expect(mockGetAllUsers).toHaveBeenCalled();

        const triggerButtons = screen.getAllByTestId('assignee-trigger');
        fireEvent.click(triggerButtons[0]);

        const menu = await screen.findByTestId('assignee-menu');
        expect(menu).toBeInTheDocument();
        expect(screen.getAllByText('Agent One').length).toBeGreaterThan(0);
    });

    it('submits an assignment with remark and notifies callbacks', async () => {
        const onAssigned = jest.fn();
        const searchCurrentTicketsPaginatedApi = jest.fn();

        render(
            <AssigneeDropdown
                ticketId="INC-101"
                onAssigned={onAssigned}
                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
            />,
        );

        const triggerButtons = screen.getAllByTestId('assignee-trigger');
        fireEvent.click(triggerButtons[0]);

        const options = await screen.findAllByTestId('assignee-option');
        fireEvent.click(options[0]);
        await waitFor(() => expect(mockRemarkComponent).toHaveBeenCalled());
        const remarkProps = mockRemarkComponent.mock.calls[0][0];
        remarkProps.onSubmit('Reassigning ticket');

        await waitFor(() => expect(mockUpdateTicket).toHaveBeenCalledWith('INC-101', expect.any(Object)));

        const payload = mockUpdateTicket.mock.calls[0][1];
        expect(payload).toMatchObject({
            assignedTo: 'agent.one',
            assignedToLevel: 'L1',
            levelId: 'L1',
        });

        expect(searchCurrentTicketsPaginatedApi).toHaveBeenCalledWith('INC-101');
        expect(onAssigned).toHaveBeenCalledWith('Agent One');
    });

    it('opens advanced options dialog with assign to FCI permission', async () => {
        render(<AssigneeDropdown ticketId="INC-200" />);

        const triggerButtons = screen.getAllByTestId('assignee-trigger');
        fireEvent.click(triggerButtons[0]);

        fireEvent.click(screen.getByText('Advanced Options'));

        await waitFor(() => expect(mockAdvancedDialog).toHaveBeenLastCalledWith(expect.objectContaining({ open: true, canAssignToFci: true })));
    });
});
