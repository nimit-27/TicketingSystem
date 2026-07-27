import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TicketDetails from '../TicketDetails';

const mockCheckAccessMaster = jest.fn(() => true);

jest.mock('../../utils/permissions', () => ({
  checkAccessMaster: (keys: string[]) => mockCheckAccessMaster(keys),
}));

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ticketId: 'T-123' }),
}));

jest.mock('../../components/TicketView/TicketView', () => ({
  __esModule: true,
  default: ({ ticketId, showHistory }: { ticketId: string; showHistory: boolean }) => (
    <div data-testid="ticket-view" data-show-history={showHistory}>Ticket {ticketId}</div>
  ),
}));

jest.mock('../../components/TicketView/HistorySidebar', () => ({
  __esModule: true,
  default: ({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) => (
    <button data-testid="history-toggle" onClick={() => setOpen(!open)}>
      {open ? 'Close' : 'Open'}
    </button>
  ),
}));

describe('TicketDetails', () => {
  beforeEach(() => {
    mockCheckAccessMaster.mockReturnValue(true);
  });

  it('renders TicketView and toggles history sidebar state', () => {
    const { getByTestId } = render(<TicketDetails />);

    expect(getByTestId('ticket-view')).toHaveTextContent('Ticket T-123');
    expect(getByTestId('ticket-view')).toHaveAttribute('data-show-history', 'true');
    expect(mockCheckAccessMaster).toHaveBeenCalledWith(['ticketView', 'showHistory']);

    fireEvent.click(getByTestId('history-toggle'));
    fireEvent.click(getByTestId('history-toggle'));
  });
});
