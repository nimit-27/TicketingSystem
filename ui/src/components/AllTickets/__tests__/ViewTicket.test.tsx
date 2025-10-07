import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ViewTicket from '../ViewTicket';

const mockUseApi = jest.fn();
jest.mock('../../../hooks/useApi', () => ({
    useApi: (...args: any[]) => mockUseApi(...args),
}));

const mockGetTicket = jest.fn(() => Promise.resolve({ data: {} }));
const mockUpdateTicket = jest.fn(() => Promise.resolve({}));
jest.mock('../../../services/TicketService', () => ({
    getTicket: (...args: any[]) => mockGetTicket(...args),
    updateTicket: (...args: any[]) => mockUpdateTicket(...args),
}));

const mockGetCurrentUserDetails = jest.fn(() => ({ username: 'agent.user' }));
jest.mock('../../../config/config', () => ({
    getCurrentUserDetails: (...args: any[]) => mockGetCurrentUserDetails(...args),
}));

const mockGetPriorities = jest.fn(() => Promise.resolve({ data: [] }));
const mockGetSeverities = jest.fn(() => Promise.resolve({ data: [] }));
jest.mock('../../../services/PriorityService', () => ({
    getPriorities: (...args: any[]) => mockGetPriorities(...args),
}));
jest.mock('../../../services/SeverityService', () => ({
    getSeverities: (...args: any[]) => mockGetSeverities(...args),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockTicketView = jest.fn(() => <div data-testid="ticket-view" />);
jest.mock('../../TicketView/TicketView', () => ({
    __esModule: true,
    default: (props: any) => mockTicketView(props),
}));

const flushPromises = async () => {
    await act(async () => {
        await Promise.resolve();
    });
};

describe('ViewTicket', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseApi.mockReset();
        mockGetPriorities.mockResolvedValue({ data: [] });
        mockGetSeverities.mockResolvedValue({ data: [] });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('returns null when not open', () => {
        mockUseApi.mockReturnValue({ data: null, apiHandler: jest.fn() });

        const { container } = render(
            <ViewTicket ticketId="INC-1" open={false} onClose={jest.fn()} />
        );

        expect(container.firstChild).toBeNull();
    });

    it('fetches ticket data when opened with ticketId', async () => {
        const ticketData = {
            subject: 'Printer not working',
            description: 'Printer is jammed',
            priority: 'P1',
            severity: 'S1',
            recommendedSeverity: 'S2',
            requestorName: 'John Doe',
            reportedDate: '2024-01-01T00:00:00Z',
            updatedBy: 'agent.user',
            lastModified: '2024-01-02T00:00:00Z',
        };

        const getTicketHandler = jest.fn((callback: any) => callback());
        const updateTicketHandler = jest.fn();
        const primaryReturn = { data: ticketData, apiHandler: getTicketHandler };
        const secondaryReturn = { data: null, apiHandler: updateTicketHandler };
        let callCount = 0;
        mockUseApi.mockImplementation(() => (callCount++ % 2 === 0 ? primaryReturn : secondaryReturn));

        render(
            <ViewTicket
                ticketId="INC-1"
                open
                onClose={jest.fn()}
                focusRecommendSeverity
                onRecommendSeverityFocusHandled={jest.fn()}
            />
        );

        await flushPromises();
        await flushPromises();

        await waitFor(() => {
            expect(mockGetTicket).toHaveBeenCalledWith('INC-1');
        });
        await waitFor(() => {
            expect(mockGetPriorities).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(mockGetSeverities).toHaveBeenCalled();
        });
        await flushPromises();
        expect(mockTicketView).toHaveBeenCalledWith(expect.objectContaining({
            ticketId: 'INC-1',
            focusRecommendSeverity: true,
        }));
    });

    it('calls onClose when close button clicked', () => {
        const getTicketHandler = jest.fn();
        const updateTicketHandler = jest.fn();
        const primaryReturn = { data: {}, apiHandler: getTicketHandler };
        const secondaryReturn = { data: null, apiHandler: updateTicketHandler };
        let callCount = 0;
        mockUseApi.mockImplementation(() => (callCount++ % 2 === 0 ? primaryReturn : secondaryReturn));

        const onClose = jest.fn();

        render(<ViewTicket ticketId="INC-1" open onClose={onClose} />);

        const closeButton = screen.getAllByRole('button')[0];
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalled();
    });

    it('navigates to ticket view when visibility icon clicked', () => {
        const getTicketHandler = jest.fn();
        const updateTicketHandler = jest.fn();
        const primaryReturn = { data: { id: 'INC-1' }, apiHandler: getTicketHandler };
        const secondaryReturn = { data: null, apiHandler: updateTicketHandler };
        let callCount = 0;
        mockUseApi.mockImplementation(() => (callCount++ % 2 === 0 ? primaryReturn : secondaryReturn));

        render(<ViewTicket ticketId="INC-1" open onClose={jest.fn()} />);

        const buttons = screen.getAllByRole('button');
        const viewButton = buttons[1];
        fireEvent.click(viewButton);

        expect(mockNavigate).toHaveBeenCalledWith('/tickets/INC-1');
    });
});
