import React from 'react';
import { render } from '@testing-library/react';
import HelpdeskUsersTable from '../HelpdeskUsersTable';

const mockGenericTable = jest.fn(() => null);

jest.mock('../../UI/GenericTable', () => ({
  __esModule: true,
  default: (props: any) => mockGenericTable(props),
}));

describe('HelpdeskUsersTable', () => {
  const user = {
    userId: 'U1',
    name: 'Alice',
    emailId: 'a@example.com',
    mobileNo: '9999999999',
    office: 'HQ',
    username: 'alice',
    roles: 'HELPDESK',
    stakeholder: 'Support',
    levels: ['L1', 'L2'],
  } as any;

  beforeEach(() => {
    mockGenericTable.mockClear();
  });

  it('passes table props and formats levels fallback', () => {
    render(<HelpdeskUsersTable users={[user]} loading onViewProfile={jest.fn()} />);

    const props = mockGenericTable.mock.calls[0][0];
    expect(props.rowKey).toBe('userId');
    expect(props.loading).toBe(true);
    expect(props.pagination).toBe(false);

    const levelsColumn = props.columns.find((c: any) => c.key === 'levels');
    expect(levelsColumn.render(['L1', 'L2'])).toBe('L1, L2');
    expect(levelsColumn.render([])).toBe('-');
  });

  it('handles actions for view and reset button disabled/enabled states', () => {
    const onViewProfile = jest.fn();
    const onResetPassword = jest.fn();

    render(
      <HelpdeskUsersTable
        users={[user]}
        onViewProfile={onViewProfile}
        onResetPassword={onResetPassword}
        resettingUserId="U1"
      />,
    );

    const props = mockGenericTable.mock.calls[0][0];
    const actionsColumn = props.columns.find((c: any) => c.key === 'actions');
    const actionNode = actionsColumn.render(undefined, user);
    const buttons = React.Children.toArray(actionNode.props.children);

    buttons[0].props.onClick();
    expect(onViewProfile).toHaveBeenCalledWith(user);

    expect(buttons[1].props.disabled).toBe(true);

    render(
      <HelpdeskUsersTable
        users={[user]}
        onViewProfile={onViewProfile}
        onResetPassword={onResetPassword}
        resettingUserId="other"
      />,
    );

    const nextActions = mockGenericTable.mock.calls[1][0].columns.find((c: any) => c.key === 'actions');
    const nextButtons = React.Children.toArray(nextActions.render(undefined, user).props.children);
    expect(nextButtons[1].props.disabled).toBe(false);
    nextButtons[1].props.onClick();
    expect(onResetPassword).toHaveBeenCalledWith(user);
  });
});
