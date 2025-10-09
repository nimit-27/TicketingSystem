import React from 'react';
import { render } from '@testing-library/react';

import { NotificationProvider, useNotificationContext } from '../NotificationContext';
import { useNotifications } from '../../hooks/useNotifications';

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

describe('NotificationContext', () => {
  const TestConsumer: React.FC<{ onValue: (value: unknown) => void }> = ({ onValue }) => {
    const value = useNotificationContext();
    React.useEffect(() => {
      onValue(value);
    }, [onValue, value]);
    return null;
  };

  beforeEach(() => {
    (useNotifications as jest.Mock).mockReset();
  });

  it('provides notifications hook value to consumers', () => {
    const hookValue = { notifications: [], addNotification: jest.fn(), removeNotification: jest.fn() };
    (useNotifications as jest.Mock).mockReturnValue(hookValue);
    const onValue = jest.fn();

    render(
      <NotificationProvider>
        <TestConsumer onValue={onValue} />
      </NotificationProvider>
    );

    expect(useNotifications).toHaveBeenCalled();
    expect(onValue).toHaveBeenCalledWith(hookValue);
  });

  it('throws when hook is used outside provider', () => {
    const TestComponent = () => {
      useNotificationContext();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useNotificationContext must be used within a NotificationProvider'
    );
  });
});
