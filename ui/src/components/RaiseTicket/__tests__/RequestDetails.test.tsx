import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeModeContext } from '../../../context/ThemeContext';

const mockSetValue = jest.fn();
const mockUseWatch = jest.fn();

jest.mock('react-hook-form', () => ({
  useWatch: (args: any) => mockUseWatch(args),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => ({
    palette: {
      primary: { main: '#111' },
      secondary: { main: '#222' },
      sidebar: { background: '#0f0', border: '', text: '' },
    },
  }),
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
    render(<RequestDetails {...baseProps} />);

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

    render(<RequestDetails {...baseProps} />);

    mockSetValue.mockClear();

    fireEvent.click(screen.getByText('call'));

    expect(mockSetValue).toHaveBeenCalledWith('mode', 'Call');
  });

  it('renders request mode radio buttons when layout is 2', () => {
    render(
      <ThemeModeContext.Provider value={{ mode: 'light', toggle: jest.fn(), layout: 2, toggleLayout: jest.fn() }}>
        <RequestDetails {...baseProps} />
      </ThemeModeContext.Provider>
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

    render(
      <ThemeModeContext.Provider value={{ mode: 'light', toggle: jest.fn(), layout: 2, toggleLayout: jest.fn() }}>
        <RequestDetails {...baseProps} />
      </ThemeModeContext.Provider>
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

    render(<RequestDetails {...baseProps} />);

    expect(screen.queryByText('Request Mode')).not.toBeInTheDocument();
  });
});
