import React from 'react';
import { render } from '@testing-library/react';
import MyTickets from '../MyTickets';

jest.mock('react-router-dom', () => {
  const navigate = jest.fn();
  return {
    useNavigate: () => navigate,
    __navigateMock: navigate,
  };
});

const navigateMock = jest.requireMock('react-router-dom').__navigateMock as jest.Mock;

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: () => ({
    userId: 'user-1',
    username: 'tester',
    role: ['4', '5', '9'],
  }),
}));

const ticketsListProps: any[] = [];

jest.mock('../../components/AllTickets/TicketsList', () => ({
  __esModule: true,
  default: (props: any) => {
    ticketsListProps.push(props);
    return <div data-testid="tickets-list">My Tickets List</div>;
  },
}));

describe('MyTickets', () => {
  beforeEach(() => {
    ticketsListProps.length = 0;
    navigateMock.mockClear();
  });

  it('builds search overrides and transforms tickets using user roles', () => {
    render(<MyTickets />);
    expect(ticketsListProps.length).toBeGreaterThan(0);

    const latestProps = ticketsListProps[ticketsListProps.length - 1];

    const overrides = latestProps.buildSearchOverrides({} as any);
    expect(overrides).toMatchObject({ requestorId: 'user-1', createdBy: 'tester' });

    const transformed = latestProps.transformTickets([
      { id: '1', statusId: '1' },
      { id: '2', statusId: '6' },
      { id: '3', statusId: '3', createdBy: 'tester' },
      { id: '4', statusId: '4', requestorId: 'user-1' },
      { id: '5', statusId: '5', createdBy: 'another-user' },
    ]);
    expect(transformed).toEqual([
      { id: '3', statusId: '3', createdBy: 'tester' },
      { id: '4', statusId: '4', requestorId: 'user-1' },
    ]);
    latestProps.onRowClick('T-1');
    expect(navigateMock).toHaveBeenCalledWith('/tickets/T-1');
  });
});
