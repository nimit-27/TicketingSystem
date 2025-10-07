import React from 'react';
import { render } from '@testing-library/react';
import MyWorkload from '../MyWorkload';

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
    role: ['4', 'TEAM_LEAD'],
  }),
}));

const ticketsListProps: any[] = [];

jest.mock('../../components/AllTickets/TicketsList', () => ({
  __esModule: true,
  default: (props: any) => {
    ticketsListProps.push(props);
    return <div data-testid="tickets-list">My Workload List</div>;
  },
}));

describe('MyWorkload', () => {
  beforeEach(() => {
    ticketsListProps.length = 0;
    navigateMock.mockClear();
  });

  it('builds search overrides and filters tickets based on roles', () => {
    render(<MyWorkload />);
    expect(ticketsListProps.length).toBeGreaterThan(0);

    const latestProps = ticketsListProps[ticketsListProps.length - 1];

    const overrides = latestProps.buildSearchOverrides({} as any);
    expect(overrides).toEqual({ assignedTo: 'tester' });

    const transformed = latestProps.transformTickets([
      { id: '1', statusId: '1' },
      { id: '2', statusId: 'OPEN' },
      { id: '3', statusId: 'ESCALATED' },
      { id: '4', statusId: 'ASSIGNED' },
    ]);
    expect(transformed).toEqual([
      { id: '1', statusId: '1' },
      { id: '2', statusId: 'OPEN' },
      { id: '4', statusId: 'ASSIGNED' },
    ]);
    latestProps.onRowClick('W-1');
    expect(navigateMock).toHaveBeenCalledWith('/tickets/W-1');
  });
});
