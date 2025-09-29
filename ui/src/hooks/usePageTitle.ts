import { useEffect, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import { useNotificationContext } from '../context/NotificationContext';

interface RouteTitle {
  path: string;
  title: string;
  end?: boolean;
}

const DEFAULT_TITLE = 'Ticketing System';

const ROUTE_TITLES: RouteTitle[] = [
  { path: '/tickets/:ticketId/feedback', title: 'Ticket Feedback' },
  { path: '/tickets/:ticketId', title: 'Ticket Details' },
  { path: '/create-ticket', title: 'Raise Ticket' },
  { path: '/tickets', title: 'All Tickets' },
  { path: '/my-tickets', title: 'My Tickets' },
  { path: '/root-cause-analysis', title: 'Root Cause Analysis' },
  { path: '/faq/new', title: 'New FAQ' },
  { path: '/faq', title: 'FAQ' },
  { path: '/knowledge-base', title: 'Knowledge Base' },
  { path: '/categories-master', title: 'Categories Master' },
  { path: '/escalation-master', title: 'Escalation Master' },
  { path: '/role-master/:roleId', title: 'Role Details' },
  { path: '/role-master', title: 'Role Master' },
];

const deriveTitle = (pathname: string): string => {
  for (const route of ROUTE_TITLES) {
    const match = matchPath({ path: route.path, end: route.end ?? true }, pathname);
    if (match) {
      return route.title;
    }
  }

  // Attempt a loose match for paths that may extend beyond the configured routes.
  for (const route of ROUTE_TITLES) {
    const match = matchPath({ path: route.path, end: false }, pathname);
    if (match) {
      return route.title;
    }
  }

  return DEFAULT_TITLE;
};

export const usePageTitle = () => {
  const location = useLocation();
  const { unreadCount } = useNotificationContext();

  const baseTitle = useMemo(() => deriveTitle(location.pathname), [location.pathname]);

  useEffect(() => {
    const title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
    document.title = title;
  }, [baseTitle, unreadCount]);
};
