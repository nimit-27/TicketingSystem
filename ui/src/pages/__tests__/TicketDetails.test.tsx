import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TicketDetails from '../TicketDetails';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ticketId: 'T-123' }),
}));

jest.mock('../../components/TicketView/TicketView', () => ({
  __esModule: true,
  default: ({ ticketId }: { ticketId: string }) => <div data-testid="ticket-view">Ticket {ticketId}</div>,
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
  it('renders TicketView and toggles history sidebar state', () => {
    const { getByTestId } = render(<TicketDetails />);

    expect(getByTestId('ticket-view')).toHaveTextContent('Ticket T-123');

    fireEvent.click(getByTestId('history-toggle'));
    fireEvent.click(getByTestId('history-toggle'));
  });
});
