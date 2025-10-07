import React from 'react';
import { render } from '@testing-library/react';
import Histories from '../Histories';

const tabsProps: any[] = [];

jest.mock('../../components/UI/CustomTabsComponent', () => ({
  __esModule: true,
  default: (props: any) => {
    tabsProps.push(props);
    return <div data-testid="tabs">Tabs</div>;
  },
}));

jest.mock('../../components/StatusHistory', () => ({
  __esModule: true,
  default: ({ ticketId }: { ticketId: string }) => <div>Status {ticketId}</div>,
}));

jest.mock('../../components/AssignmentHistory', () => ({
  __esModule: true,
  default: ({ ticketId }: { ticketId: string }) => <div>Assignment {ticketId}</div>,
}));

describe('Histories', () => {
  it('renders tabs with status and assignment history', () => {
    render(<Histories ticketId="T-1" currentTab="status" onTabChange={jest.fn()} />);

    expect(tabsProps[0].tabs).toHaveLength(2);
    expect(tabsProps[0].tabs[0].tabTitle).toBe('Status History');
    expect(tabsProps[0].tabs[1].tabTitle).toBe('Assignment History');
  });
});
