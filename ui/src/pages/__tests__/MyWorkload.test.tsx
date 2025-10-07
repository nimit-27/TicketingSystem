import React from 'react';
import { render } from '@testing-library/react';
import MyWorkload from '../MyWorkload';
import * as configModule from '../../config/config';

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}), { virtual: true });

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
    return <div data-testid="tickets-list">My Workload List</div>;
  },
}));

describe('MyWorkload', () => {
  let getCurrentUserDetailsSpy: jest.SpiedFunction<typeof configModule.getCurrentUserDetails>;

  beforeEach(() => {
    ticketsListProps.length = 0;
    navigateMock.mockClear();
    getCurrentUserDetailsSpy = jest.spyOn(configModule, 'getCurrentUserDetails');
    getCurrentUserDetailsSpy.mockReturnValue({
      userId: 'user-1',
      username: 'tester',
      role: ['4', 'TEAM_LEAD'],
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds search overrides and filters tickets for team leads', () => {
    render(<MyWorkload />);
    expect(ticketsListProps.length).toBeGreaterThan(0);

    const latestProps = ticketsListProps[ticketsListProps.length - 1];

    const overrides = latestProps.buildSearchOverrides({} as any);
    expect(overrides).toEqual({ statusName: 'OPEN' });

    const transformed = latestProps.transformTickets([
      { id: '1', statusId: '1' },
      { id: '2', statusId: 'OPEN' },
      { id: '3', statusId: 'ESCALATED' },
      { id: '4', statusId: 'ASSIGNED' },
    ]);
    expect(transformed).toEqual([
      { id: '1', statusId: '1' },
      { id: '2', statusId: 'OPEN' },
    ]);
    latestProps.onRowClick('W-1');
    expect(navigateMock).toHaveBeenCalledWith('/tickets/W-1');
  });

  it('builds search overrides for IT managers', () => {
    getCurrentUserDetailsSpy.mockReturnValue({
      userId: 'user-1',
      username: 'tester',
      role: ['9'],
    });

    render(<MyWorkload />);
    expect(ticketsListProps.length).toBeGreaterThan(0);

    const latestProps = ticketsListProps[ticketsListProps.length - 1];

    const overrides = latestProps.buildSearchOverrides({} as any);
    expect(overrides).toEqual({ statusName: 'AWAITING_ESCALATION_APPROVAL' });

    const transformed = latestProps.transformTickets([
      { id: '1', statusId: '6' },
      { id: '2', statusId: 'AWAITING_ESCALATION_APPROVAL' },
      { id: '3', statusId: 'OPEN' },
    ]);

    expect(transformed).toEqual([
      { id: '1', statusId: '6' },
      { id: '2', statusId: 'AWAITING_ESCALATION_APPROVAL' },
    ]);
  });
});
