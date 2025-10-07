import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SidebarLayout from '../SidebarLayout';
import { renderWithTheme } from '../../../test/testUtils';
import React from 'react';

const mockUseMediaQuery = jest.fn();

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: (query: unknown) => mockUseMediaQuery(query),
  };
});

jest.mock('@mui/material/Drawer', () => ({ open, children }: { open: boolean; children: React.ReactNode }) => (
  <div data-testid="drawer" data-open={open}>
    {open ? children : null}
  </div>
));

jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">content</div>,
}));

jest.mock('../Header', () => ({
  __esModule: true,
  default: ({ collapsed, toggleSidebar }: { collapsed: boolean; toggleSidebar: () => void }) => (
    <div data-testid="header" data-collapsed={collapsed}>
      <button type="button" onClick={toggleSidebar}>
        toggle
      </button>
    </div>
  ),
}));

jest.mock('../Sidebar', () => ({
  __esModule: true,
  default: ({ collapsed }: { collapsed: boolean }) => (
    <div data-testid="sidebar" data-collapsed={collapsed} />
  ),
}));

jest.mock('../../../hooks/useAuthGuard', () => ({
  useAuthGuard: jest.fn(),
}));

jest.mock('../../../hooks/usePageTitle', () => ({
  usePageTitle: jest.fn(),
}));

const renderLayout = () => renderWithTheme(<SidebarLayout />);

describe('SidebarLayout', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset();
  });

  it('toggles the desktop sidebar collapse state', async () => {
    mockUseMediaQuery.mockReturnValue(false);

    renderLayout();

    const header = screen.getByTestId('header');
    expect(header).toHaveAttribute('data-collapsed', 'false');

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(header).toHaveAttribute('data-collapsed', 'true');
  });

  it('opens a temporary drawer on mobile and toggles collapsed state accordingly', async () => {
    mockUseMediaQuery.mockReturnValue(true);

    renderLayout();

    const header = screen.getByTestId('header');
    expect(header).toHaveAttribute('data-collapsed', 'true');

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveAttribute('data-open', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('header')).toHaveAttribute('data-collapsed', 'false');
  });
});
