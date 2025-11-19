import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { ThemeModeContext } from '../../../context/ThemeContext';
import { renderWithTheme } from '../../../test/testUtils';

const mockSetValue = jest.fn();
const mockUseWatch = jest.fn();

jest.mock('react-hook-form', () => ({
  useWatch: (args: any) => mockUseWatch(args),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../utils/permissions', () => ({
  checkFieldAccess: jest.fn(() => true),
  getFieldChildren: jest.fn(() => ({
    self: { show: true },
    call: { show: true },
    email: { show: true },
  })),
}));

jest.mock('../../UI/IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ icon, onClick }: { icon: string; onClick: () => void }) => (
    <button onClick={onClick}>{icon}</button>
  ),
}));

const RequestDetails = require('../RequestDetails').default;

const renderWithContext = (
  ui: React.ReactElement,
  contextValue: React.ContextType<typeof ThemeModeContext> = {
    mode: 'light',
    toggle: jest.fn(),
    layout: 1,
    toggleLayout: jest.fn(),
  },
) =>
  renderWithTheme(
    <ThemeModeContext.Provider value={contextValue}>
      {ui}
    </ThemeModeContext.Provider>,
  );

describe('RequestDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWatch.mockImplementation(({ name, defaultValue }: { name: string; defaultValue?: any }) => {
      if (name === 'mode') {
        return defaultValue ?? 'Self';
      }
      return '';
    });
    const permissions = jest.requireMock('../../../utils/permissions');
    permissions.checkFieldAccess.mockReturnValue(true);
    permissions.getFieldChildren.mockReturnValue({
      self: { show: true },
      call: { show: true },
      email: { show: true },
    });
  });

  const baseProps = {
    register: jest.fn(),
    control: {},
    errors: {},
    setValue: mockSetValue,
    disableAll: false,
    isFieldSetDisabled: false,
    createMode: true,
  } as any;

  it('renders request mode icon buttons when access is allowed in layout 1', () => {
    renderWithContext(<RequestDetails {...baseProps} />);

    expect(screen.getByText('Request Mode')).toBeInTheDocument();
    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.getByText('call')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('calls setValue when selecting a different mode in layout 1', () => {
    mockUseWatch.mockImplementation(({ name }: { name: string }) => {
      if (name === 'mode') {
        return 'Self';
      }
      return '';
    });

    renderWithContext(<RequestDetails {...baseProps} />);

    mockSetValue.mockClear();

    fireEvent.click(screen.getByText('call'));

    expect(mockSetValue).toHaveBeenCalledWith('mode', 'Call');
  });

  it('renders request mode radio buttons when layout is 2', () => {
    renderWithContext(
      <RequestDetails {...baseProps} />,
      { mode: 'light', toggle: jest.fn(), layout: 2, toggleLayout: jest.fn() },
    );

    expect(screen.getByText('Request Mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Self')).toBeInTheDocument();
    expect(screen.getByLabelText('Call')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('calls setValue when selecting a different mode in layout 2', () => {
    mockUseWatch.mockImplementation(({ name }: { name: string }) => {
      if (name === 'mode') {
        return 'Self';
      }
      return '';
    });

    renderWithContext(
      <RequestDetails {...baseProps} />,
      { mode: 'light', toggle: jest.fn(), layout: 2, toggleLayout: jest.fn() },
    );

    mockSetValue.mockClear();

    fireEvent.click(screen.getByLabelText('Call'));

    expect(mockSetValue).toHaveBeenCalledWith('mode', 'Call');
  });

  it('does not render request mode selector when only self is allowed', () => {
    const permissions = jest.requireMock('../../../utils/permissions');
    permissions.getFieldChildren.mockReturnValueOnce({
      self: { show: true },
      call: { show: false },
      email: { show: false },
    });

    renderWithContext(<RequestDetails {...baseProps} />);

    expect(screen.queryByText('Request Mode')).not.toBeInTheDocument();
  });
});
