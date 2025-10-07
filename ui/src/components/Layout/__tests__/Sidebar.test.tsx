import React from 'react';
import { screen } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { renderWithTheme } from '../../../test/testUtils';
import * as permissions from '../../../utils/permissions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (value: string) => `t:${value}` }),
}));

describe('Sidebar', () => {
  const checkSidebarAccessSpy = jest.spyOn(permissions, 'checkSidebarAccess');

  beforeEach(() => {
    checkSidebarAccessSpy.mockReset();
  });

  afterAll(() => {
    checkSidebarAccessSpy.mockRestore();
  });

  it('renders translated menu items when expanded', () => {
    checkSidebarAccessSpy.mockReturnValue(true);

    renderWithTheme(<Sidebar collapsed={false} />);

    expect(screen.getByText('t:All Tickets')).toBeInTheDocument();
    expect(screen.getByText('t:Root Cause Analysis')).toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    checkSidebarAccessSpy.mockReturnValue(true);

    renderWithTheme(<Sidebar collapsed />);

    expect(screen.queryByText('t:All Tickets')).not.toBeInTheDocument();
    expect(screen.queryByText('t:Raise Ticket')).not.toBeInTheDocument();
  });

  it('only renders menu items with sidebar access', () => {
    checkSidebarAccessSpy.mockImplementation((key: string) => key === 'myTickets');

    renderWithTheme(<Sidebar collapsed={false} />);

    expect(screen.getByText('t:My Tickets')).toBeInTheDocument();
    expect(screen.queryByText('t:All Tickets')).not.toBeInTheDocument();
  });
});
