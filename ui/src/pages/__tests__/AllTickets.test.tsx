import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import AllTickets from '../AllTickets';

jest.mock('react-router-dom', () => {
  const navigate = jest.fn();
  return {
    useNavigate: () => navigate,
    __navigateMock: navigate,
  };
});

const navigateMock = jest.requireMock('react-router-dom').__navigateMock as jest.Mock;

const ticketsListProps: any[] = [];

jest.mock('../../components/AllTickets/TicketsList', () => ({
  __esModule: true,
  default: (props: any) => {
    ticketsListProps.push(props);
    return (
      <div
        data-testid="tickets-list"
        onClick={() => props.getViewTicketProps('ticket-1').onRecommendSeverityFocusHandled()}
      >
        TicketsList Mock
      </div>
    );
  },
}));

describe('AllTickets', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    ticketsListProps.length = 0;
  });

  it('renders TicketsList with expected props and handles navigation', () => {
    const { getByTestId } = render(<AllTickets />);

    const latest = () => ticketsListProps.at(-1);

    expect(getByTestId('tickets-list')).toBeInTheDocument();
    expect(latest().titleKey).toBe('All Tickets');
    expect(latest().permissionPathPrefix).toBe('allTickets');

    latest().onRowClick('123');
    expect(navigateMock).toHaveBeenCalledWith('/tickets/123');

    act(() => {
      latest().tableOptions.onRecommendEscalation('ticket-1');
    });
    expect(latest().getViewTicketProps('ticket-1').focusRecommendSeverity).toBe(true);

    fireEvent.click(getByTestId('tickets-list'));
    expect(latest().getViewTicketProps('ticket-1').focusRecommendSeverity).toBe(false);
  });
});
