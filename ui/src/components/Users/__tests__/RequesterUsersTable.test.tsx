import React from 'react';
import { render } from '@testing-library/react';
import RequesterUsersTable from '../RequesterUsersTable';

const mockGenericTable = jest.fn(() => null);

jest.mock('../../UI/GenericTable', () => ({
  __esModule: true,
  default: (props: any) => mockGenericTable(props),
}));

describe('RequesterUsersTable', () => {
  const user = {
    requesterUserId: 'R1',
    name: 'Requester',
    emailId: 'r@example.com',
    mobileNo: '999',
    office: 'Office',
    username: 'requester',
    officeType: 'RO',
    officeCode: '001',
    roleIds: [],
  } as any;

  beforeEach(() => {
    mockGenericTable.mockClear();
  });

  const getActions = () => {
    const props = mockGenericTable.mock.calls.at(-1)[0];
    return props.columns.find((c: any) => c.key === 'actions');
  };

  it('passes table props and handles view/reset actions', () => {
    const onViewProfile = jest.fn();
    const onResetPassword = jest.fn();

    render(<RequesterUsersTable users={[user]} loading onViewProfile={onViewProfile} onResetPassword={onResetPassword} />);

    const props = mockGenericTable.mock.calls[0][0];
    expect(props.rowKey).toBe('requesterUserId');
    expect(props.loading).toBe(true);
    expect(props.pagination).toBe(false);

    const buttons = React.Children.toArray(getActions().render(undefined, user).props.children);
    buttons[0].props.onClick();
    buttons[1].props.onClick();
    expect(onViewProfile).toHaveBeenCalledWith(user);
    expect(onResetPassword).toHaveBeenCalledWith(user);
  });

  it('hides appoint button for non-RO offices', () => {
    render(<RequesterUsersTable users={[{ ...user, officeType: 'HO' }]} onViewProfile={jest.fn()} />);

    const buttons = React.Children.toArray(getActions().render(undefined, { ...user, officeType: 'HO' }).props.children);
    expect(buttons).toHaveLength(2);
  });

  it('disables appoint button when already RNO, appointing, or missing handler', () => {
    render(<RequesterUsersTable users={[{ ...user, roleIds: ['4'] }]} onViewProfile={jest.fn()} onAppointRno={jest.fn()} />);
    let buttons = React.Children.toArray(getActions().render(undefined, { ...user, roleIds: ['4'] }).props.children);
    expect(buttons[2].props.disabled).toBe(true);
    expect(buttons[2].props.title).toBe('Already appointed as RNO');

    render(<RequesterUsersTable users={[user]} onViewProfile={jest.fn()} onAppointRno={jest.fn()} appointingUserId="R1" />);
    buttons = React.Children.toArray(getActions().render(undefined, user).props.children);
    expect(buttons[2].props.disabled).toBe(true);

    render(<RequesterUsersTable users={[user]} onViewProfile={jest.fn()} />);
    buttons = React.Children.toArray(getActions().render(undefined, user).props.children);
    expect(buttons[2].props.disabled).toBe(true);
  });

  it('enables appoint when eligible and handles reset disabled state', () => {
    const onAppointRno = jest.fn();

    render(
      <RequesterUsersTable
        users={[user]}
        onViewProfile={jest.fn()}
        onAppointRno={onAppointRno}
        onResetPassword={jest.fn()}
        resettingUserId="R1"
      />,
    );
    let buttons = React.Children.toArray(getActions().render(undefined, user).props.children);
    expect(buttons[1].props.disabled).toBe(true);

    render(<RequesterUsersTable users={[user]} onViewProfile={jest.fn()} onAppointRno={onAppointRno} />);
    buttons = React.Children.toArray(getActions().render(undefined, user).props.children);
    expect(buttons[2].props.disabled).toBe(false);
    expect(buttons[2].props.title).toBe('Appoint as RNO');
    buttons[2].props.onClick();
    expect(onAppointRno).toHaveBeenCalledWith(user);
  });
});
