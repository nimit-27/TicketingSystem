import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChildTicketsList from '../ChildTicketsList';
import { useApi } from '../../../hooks/useApi';
import { getChildTickets, unlinkTicketFromMaster } from '../../../services/TicketService';
import { getCurrentUserDetails } from '../../../config/config';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../hooks/useApi', () => ({
  useApi: jest.fn(),
}));

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: jest.fn(() => ({ username: 'test-user', userId: 'user-1' })),
}));

jest.mock('../../../services/TicketService', () => ({
  getChildTickets: jest.fn(),
  unlinkTicketFromMaster: jest.fn(),
}));

jest.mock('../../Ticket/ChildTicketsTable', () => ({
  tickets,
  loading,
  unlinkingId,
  onView,
  onUnlink,
}: any) => (
  <div>
    <div data-testid="loading-state">{loading ? 'loading' : 'loaded'}</div>
    <div data-testid="unlinking-id">{unlinkingId || 'none'}</div>
    <button type="button" onClick={() => onView?.('child-1')}>view</button>
    <button type="button" onClick={() => onUnlink?.('child-1')}>unlink</button>
    <span data-testid="tickets-count">{Array.isArray(tickets) ? tickets.length : 0}</span>
  </div>
));

const useApiMock = useApi as jest.MockedFunction<typeof useApi>;
const getChildTicketsMock = getChildTickets as jest.Mock;
const unlinkTicketFromMasterMock = unlinkTicketFromMaster as jest.Mock;
const getCurrentUserDetailsMock = getCurrentUserDetails as jest.Mock;

let consoleLogSpy: jest.SpyInstance;

describe('ChildTicketsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useApiMock.mockReset();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    (window as any).confirm = jest.fn(() => true);

    const fetchHandler = jest.fn((callback: () => Promise<any>) => Promise.resolve(callback()));
    const unlinkHandler = jest.fn((callback: () => Promise<any>) => Promise.resolve(callback()));

    useApiMock.mockImplementation(() => ({ data: null, pending: false, success: false, error: null, apiHandler: (cb: () => Promise<any>) => Promise.resolve(cb()) } as any));

    useApiMock.mockImplementationOnce(() => ({
      data: [{ id: 'child-1' }],
      pending: false,
      success: true,
      error: null,
      apiHandler: fetchHandler,
    }) as any);

    useApiMock.mockImplementationOnce(() => ({
      data: null,
      pending: false,
      success: false,
      error: null,
      apiHandler: unlinkHandler,
    }) as any);

    getCurrentUserDetailsMock.mockReturnValue({ username: 'test-user', userId: 'user-1' });
    getChildTicketsMock.mockResolvedValue([{ id: 'child-1' }]);
    unlinkTicketFromMasterMock.mockResolvedValue({});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('fetches child tickets on mount and renders table', async () => {
    render(<ChildTicketsList parentId="parent-123" />);

    await waitFor(() => expect(getChildTicketsMock).toHaveBeenCalledWith('parent-123'));

    expect(screen.getByTestId('tickets-count')).toHaveTextContent('1');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
  });

  it('navigates when view is triggered', async () => {
    render(<ChildTicketsList parentId="parent-456" />);

    fireEvent.click(screen.getByText('view'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tickets/child-1');
    });
  });

  it('calls unlink API when unlink is confirmed', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ChildTicketsList parentId="parent-789" />);

    fireEvent.click(screen.getByText('unlink'));

    await waitFor(() => {
      expect(unlinkTicketFromMasterMock).toHaveBeenCalledWith('child-1', 'test-user');
    });
    expect(screen.getByTestId('unlinking-id')).toHaveTextContent('child-1');
    confirmSpy.mockRestore();
  });
});
