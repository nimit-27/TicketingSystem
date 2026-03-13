import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import UserDetailsCard from '../UserDetailsCard';

jest.mock('../UI/UserAvatar/UserAvatar', () => ({ name }: { name: string }) => (
  <div data-testid="user-avatar">{name}</div>
));

describe('UserDetailsCard', () => {
  it('renders user identity fields and copies values when enabled', () => {
    const onCopy = jest.fn();

    render(
      <UserDetailsCard
        name="Jane Doe"
        username="jdoe"
        email="jane@example.com"
        phone="1234567890"
        onCopy={onCopy}
      />,
    );

    expect(screen.getByTestId('user-avatar')).toHaveTextContent('Jane Doe');

    fireEvent.click(screen.getAllByText('Jane Doe')[1]);
    fireEvent.click(screen.getByText('jdoe'));
    fireEvent.click(screen.getByText('jane@example.com'));
    fireEvent.click(screen.getByText('1234567890'));

    expect(onCopy).toHaveBeenNthCalledWith(1, 'name', 'Jane Doe');
    expect(onCopy).toHaveBeenNthCalledWith(2, 'username', 'jdoe');
    expect(onCopy).toHaveBeenNthCalledWith(3, 'email', 'jane@example.com');
    expect(onCopy).toHaveBeenNthCalledWith(4, 'phone', '1234567890');
  });

  it('renders copy success messages and hides disabled sections', () => {
    render(
      <UserDetailsCard
        name="Jane Doe"
        username="jdoe"
        email="jane@example.com"
        phone="1234567890"
        showUsername={false}
        showPhone={false}
        copiedField="email"
      />,
    );

    expect(screen.queryByText('jdoe')).not.toBeInTheDocument();
    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();
    expect(screen.getByText('Email copied')).toBeInTheDocument();
    expect(screen.queryByText('Name copied')).not.toBeInTheDocument();
  });

  it('filters empty details and does not copy when no callback/value is present', () => {
    const onCopy = jest.fn();

    render(
      <UserDetailsCard
        username="agent.1"
        details={[
          { label: 'Role', value: 'L1 Support' },
          { label: 'Office', value: '' },
          { label: 'Region', value: null },
        ]}
        onCopy={onCopy}
      />,
    );

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('L1 Support')).toBeInTheDocument();
    expect(screen.queryByText('Office')).not.toBeInTheDocument();
    expect(screen.queryByText('Region')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText('agent.1')[1]);
    expect(onCopy).toHaveBeenCalledWith('username', 'agent.1');

    expect(screen.queryByText('|')).not.toBeInTheDocument();
  });
});
