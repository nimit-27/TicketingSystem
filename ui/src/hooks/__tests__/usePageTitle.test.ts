jest.mock('react-router-dom');

jest.mock('../../context/NotificationContext', () => ({
  useNotificationContext: jest.fn(),
}));

import { renderHook } from '@testing-library/react';

import { usePageTitle } from '../usePageTitle';
import { useLocation, matchPath } from 'react-router-dom';
import { useNotificationContext } from '../../context/NotificationContext';

describe('usePageTitle', () => {
  const applyMatchImplementation = () => {
    (matchPath as jest.Mock).mockImplementation(
      (options: { path: string; end?: boolean }, pathname: string) => {
        const { path, end = true } = options;
        const pattern = path
          .split('/')
          .map(segment => (segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
          .join('/');
        const regex = new RegExp(`^${pattern}${end ? '$' : ''}`);
        return regex.test(pathname) ? { params: {} } : null;
      }
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    applyMatchImplementation();
    document.title = 'Initial Title';
  });

  it('sets the page title based on the current route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/tickets/123' });
    (useNotificationContext as jest.Mock).mockReturnValue({ unreadCount: 0 } as any);

    renderHook(() => usePageTitle());

    expect(document.title).toBe('Ticket Details');
    expect(matchPath).toHaveBeenCalled();
  });

  it('prefixes the title with the unread count when present', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/faq' });
    (useNotificationContext as jest.Mock).mockReturnValue({ unreadCount: 3 } as any);

    renderHook(() => usePageTitle());

    expect(document.title).toBe('(3) Frequently Asked Questions');
  });

  it('falls back to the default title when no route matches', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/not-a-route' });
    (useNotificationContext as jest.Mock).mockReturnValue({ unreadCount: 0 } as any);

    renderHook(() => usePageTitle());

    expect(document.title).toBe('Ticketing System');
  });
});
