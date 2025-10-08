import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

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

  it('renders mode toggle buttons when access is allowed', () => {
    render(<RequestDetails {...baseProps} />);

    expect(screen.getByText('Request Mode')).toBeInTheDocument();
    expect(screen.getByText('Self')).toBeInTheDocument();
    expect(screen.getByText('Call')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('calls setValue when clicking on a different mode', () => {
    mockUseWatch.mockImplementation(({ name }: { name: string }) => {
      if (name === 'mode') {
        return 'Self';
      }
      return '';
    });

    render(<RequestDetails {...baseProps} />);

    fireEvent.click(screen.getByText('call'));

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
