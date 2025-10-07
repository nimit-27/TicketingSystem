import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdvancedAssignmentOptionsDialog from '../AdvancedAssignmentOptionsDialog';

const mockUpdateTicket = jest.fn(() => Promise.resolve({}));
jest.mock('../../../services/TicketService', () => ({
    updateTicket: (...args: any[]) => mockUpdateTicket(...args),
}));

const mockGetCurrentUserDetails = jest.fn(() => ({ username: 'agent.user' }));
jest.mock('../../../config/config', () => ({
    getCurrentUserDetails: (...args: any[]) => mockGetCurrentUserDetails(...args),
}));

const mockRemarkComponent = jest.fn(({ actionName, onSubmit, onCancel }: any) => (
    <div>
        <span>{actionName}</span>
        <button type="button" data-testid={`submit-${actionName}`} onClick={() => onSubmit('test remark')}>
            submit
        </button>
        <button type="button" onClick={onCancel}>
            cancel
        </button>
    </div>
));
jest.mock('../../UI/Remark/RemarkComponent', () => ({
    __esModule: true,
    default: (props: any) => mockRemarkComponent(props),
}));

jest.mock('../../UI/CustomTabsComponent', () => {
    const React = require('react');
    const MockTabs = ({ tabs, currentTab, onTabChange }: any) => {
        const [active, setActive] = React.useState(currentTab ?? tabs[0]?.key);
        React.useEffect(() => {
            if (currentTab) setActive(currentTab);
        }, [currentTab]);
        const handleClick = (key: string) => {
            setActive(key);
            onTabChange?.(key);
        };
        const activeTab = tabs.find((t: any) => t.key === active);
        return (
            <div>
                {tabs.map((tab: any) => (
                    <button key={tab.key} type="button" onClick={() => handleClick(tab.key)}>
                        {tab.tabTitle}
                    </button>
                ))}
                <div data-testid={`tab-content-${active}`}>{activeTab?.tabComponent}</div>
            </div>
        );
    };
    return {
        __esModule: true,
        default: MockTabs,
    };
});

describe('AdvancedAssignmentOptionsDialog', () => {
    const defaultProps = {
        open: true,
        onClose: jest.fn(),
        ticketId: 'INC-1',
        requestorId: 'user-1',
        canRequester: false,
        canRno: false,
        levels: [
            { levelId: 'L1', levelName: 'Level 1' },
            { levelId: 'L2', levelName: 'Level 2' },
        ],
        users: [
            { userId: '1', username: 'john', name: 'John Doe', roles: '3', levels: ['L1'] },
            { userId: '2', username: 'mary', name: 'Mary Jane', roles: '9', levels: ['L2'] },
        ],
        rnoUsers: [
            { userId: 'r1', username: 'rno', name: 'Rno User', roles: '16', levels: [] },
        ],
        updateTicketApiHandler: jest.fn(() => Promise.resolve()),
        searchCurrentTicketsPaginatedApi: jest.fn(),
        onAssigned: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        defaultProps.updateTicketApiHandler.mockImplementation((callback: any) => Promise.resolve(callback()));
        defaultProps.searchCurrentTicketsPaginatedApi.mockClear();
        defaultProps.onAssigned.mockClear();
        defaultProps.onClose.mockClear();
        mockGetCurrentUserDetails.mockReturnValue({ username: 'agent.user' });
        mockUpdateTicket.mockResolvedValue({});
    });

    it('renders available tabs based on permissions', () => {
        render(
            <AdvancedAssignmentOptionsDialog
                {...defaultProps}
                canRequester
                canRno
            />
        );

        expect(screen.getByText('Assign User')).toBeInTheDocument();
        expect(screen.getByText('Requester')).toBeInTheDocument();
        expect(screen.getByText('Regional Nodal Officer')).toBeInTheDocument();
    });

    it('assigns selected user and refreshes tickets', async () => {
        render(<AdvancedAssignmentOptionsDialog {...defaultProps} />);

        fireEvent.click(screen.getByText('John Doe'));
        await waitFor(() => {
            expect(mockRemarkComponent).toHaveBeenCalledWith(expect.objectContaining({ actionName: 'Assign' }));
        });
        const assignCall = mockRemarkComponent.mock.calls.find(([props]) => props.actionName === 'Assign');
        expect(assignCall).toBeDefined();
        const assignProps = assignCall![0];
        assignProps.onSubmit('test remark');

        await waitFor(() => {
            expect(defaultProps.updateTicketApiHandler).toHaveBeenCalled();
        });

        expect(mockUpdateTicket).toHaveBeenCalledWith('INC-1', expect.objectContaining({
            assignedTo: 'john',
            assignedToLevel: 'L1',
            levelId: 'L1',
            remark: expect.any(String),
        }));
        expect(defaultProps.searchCurrentTicketsPaginatedApi).toHaveBeenCalledWith('INC-1');
        expect(defaultProps.onAssigned).toHaveBeenCalledWith('John Doe');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('assigns to requester when requester tab used', async () => {
        render(
            <AdvancedAssignmentOptionsDialog
                {...defaultProps}
                canRequester
            />
        );

        fireEvent.click(screen.getByText('Requester'));
        await waitFor(() => {
            expect(mockRemarkComponent).toHaveBeenCalledWith(expect.objectContaining({ actionName: 'Assign to Requester' }));
        });
        const requesterCall = mockRemarkComponent.mock.calls.find(([props]) => props.actionName === 'Assign to Requester');
        expect(requesterCall).toBeDefined();
        const requesterProps = requesterCall![0];
        requesterProps.onSubmit('test remark');

        await waitFor(() => {
            expect(defaultProps.updateTicketApiHandler).toHaveBeenCalled();
        });

        expect(mockUpdateTicket).toHaveBeenCalledWith('INC-1', expect.objectContaining({
            assignedTo: 'user-1',
            status: { statusId: '3' },
        }));
        expect(defaultProps.searchCurrentTicketsPaginatedApi).toHaveBeenCalledWith('INC-1');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('assigns to regional nodal officer when RNO tab used', async () => {
        render(
            <AdvancedAssignmentOptionsDialog
                {...defaultProps}
                canRno
            />
        );

        fireEvent.click(screen.getByText('Regional Nodal Officer'));
        fireEvent.click(screen.getByText('Rno User'));
        await waitFor(() => {
            expect(mockRemarkComponent).toHaveBeenCalledWith(expect.objectContaining({ actionName: 'Assign' }));
        });
        const rnoCall = mockRemarkComponent.mock.calls.filter(([props]) => props.actionName === 'Assign').pop();
        expect(rnoCall).toBeDefined();
        const rnoProps = rnoCall![0];
        rnoProps.onSubmit('test remark');

        await waitFor(() => {
            expect(defaultProps.updateTicketApiHandler).toHaveBeenCalled();
        });

        expect(mockUpdateTicket).toHaveBeenCalledWith('INC-1', expect.objectContaining({
            assignedTo: 'rno',
            status: { statusId: '5' },
        }));
        expect(defaultProps.searchCurrentTicketsPaginatedApi).toHaveBeenCalledWith('INC-1');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
