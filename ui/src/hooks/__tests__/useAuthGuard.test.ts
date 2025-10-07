jest.mock('../../utils/Utils', () => ({
  getUserDetails: jest.fn(),
  getUserPermissions: jest.fn(),
}));

jest.mock('react-router-dom');

import { act, renderHook } from '@testing-library/react';

import { useAuthGuard } from '../useAuthGuard';
import { getUserDetails, getUserPermissions } from '../../utils/Utils';
import { useNavigate } from 'react-router-dom';

describe('useAuthGuard', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not redirect when user and permissions exist', () => {
    (getUserDetails as jest.Mock).mockReturnValue({ userId: '1' });
    (getUserPermissions as jest.Mock).mockReturnValue(['READ']);

    const addListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeListenerSpy = jest.spyOn(window, 'removeEventListener');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useAuthGuard());

    expect(navigate).not.toHaveBeenCalled();
    expect(addListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(removeListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

    addListenerSpy.mockRestore();
    removeListenerSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('redirects to the login page when user data is missing', () => {
    (getUserDetails as jest.Mock).mockReturnValue({});
    (getUserPermissions as jest.Mock).mockReturnValue(null);

    renderHook(() => useAuthGuard());

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
