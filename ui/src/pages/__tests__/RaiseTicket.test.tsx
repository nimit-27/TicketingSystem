import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockAddTicket = jest.fn(() => Promise.resolve({ id: 'T-100' }));
const mockAddAttachments = jest.fn(() => Promise.resolve());
const mockApiHandler = jest.fn((fn: () => Promise<any>) => Promise.resolve(fn()));

let mockFormValues: Record<string, any>;

jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({}),
}), { virtual: true });

jest.mock('react-hook-form', () => ({
  useForm: () => {
    mockFormValues = mockFormValues || {
      isMaster: false,
      masterId: null,
      subject: 'Issue',
    };
    return {
      register: jest.fn(),
      handleSubmit: (fn: (values: any) => void) => (event?: any) => {
        event?.preventDefault?.();
        return fn(mockFormValues);
      },
      control: {},
      setValue: (name: string, value: any) => {
        mockFormValues[name] = value;
      },
      getValues: () => mockFormValues,
      formState: { errors: {}, isValid: true },
      resetField: (name: string) => {
        delete mockFormValues[name];
      },
    };
  },
  useWatch: ({ name }: { name: string }) => mockFormValues?.[name],
}));

jest.mock('../../components/RaiseTicket/RequestDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="request-details" />,
}));

jest.mock('../../components/RaiseTicket/RequestorDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="requestor-details" />,
}));

jest.mock('../../components/RaiseTicket/TicketDetails', () => ({
  __esModule: true,
  default: ({ setAttachments }: { setAttachments: (files: File[]) => void }) => (
    <button data-testid="add-attachment" onClick={() => setAttachments([new File(['x'], 'test.txt')])}>
      Attach
    </button>
  ),
}));

jest.mock('../../components/RaiseTicket/SuccessfulModal', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => <div data-testid="success-modal">{open ? 'open' : 'closed'}</div>,
}));

jest.mock('../../components/RaiseTicket/LinkToMasterTicketModal', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    open ? <button data-testid="close-link-modal" onClick={onClose}>Close</button> : null
  ),
}));

jest.mock('../../components/RaiseTicket/AssignMasterTicketModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess }: any) => (
    open ? (
      <div>
        <button data-testid="assign-master-close" onClick={onClose}>Close Assign</button>
        <button data-testid="assign-master-success" onClick={() => { onSuccess?.(); onClose(); }}>Mark Master</button>
      </div>
    ) : null
  ),
}));

jest.mock('../../components/UI/Button', () => ({
  __esModule: true,
  default: ({ textKey, children, onClick, type }: any) => (
    <button type={type} onClick={onClick}>{textKey || children}</button>
  ),
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: () => ({ data: null, pending: false, error: null, success: false, apiHandler: mockApiHandler }),
}));

jest.mock('../../services/TicketService', () => ({
  addTicket: (...args: unknown[]) => mockAddTicket(...args),
  addAttachments: (...args: unknown[]) => mockAddAttachments(...args),
}));

jest.mock('../../context/DevModeContext', () => {
  const ReactModule = require('react');
  return {
    DevModeContext: ReactModule.createContext({ devMode: false }),
  };
});

jest.mock('../../utils/permissions', () => ({
  checkAccessMaster: () => true,
}));

jest.mock('../../components/UI/IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ onClick, icon }: { onClick: () => void; icon: string }) => (
    <button data-testid={`icon-${icon}`} onClick={onClick}>{icon}</button>
  ),
}));

import RaiseTicket from '../RaiseTicket';

describe('RaiseTicket', () => {
  beforeEach(() => {
    mockFormValues = {
      isMaster: false,
      masterId: null,
      subject: 'Issue subject',
    };
    mockAddTicket.mockClear();
    mockAddAttachments.mockClear();
    mockApiHandler.mockClear();
    mockAddTicket.mockResolvedValue({ id: 'T-100' });
    mockAddAttachments.mockResolvedValue(undefined);
    mockApiHandler.mockImplementation((fn: () => Promise<any>) => Promise.resolve(fn()));
  });

  it('submits ticket and opens success modal', async () => {
    const { getByText, getByTestId } = renderWithTheme(<RaiseTicket />);

    fireEvent.click(getByTestId('add-attachment'));
    fireEvent.click(getByText('Submit Ticket'));

    await waitFor(() => {
      expect(mockAddTicket).toHaveBeenCalled();
      expect(mockAddAttachments).toHaveBeenCalledWith('T-100', expect.any(Array));
      expect(getByTestId('success-modal')).toHaveTextContent('open');
    });
  });

  it('opens link to master ticket modal', () => {
    const { getByText, getByTestId } = renderWithTheme(<RaiseTicket />);
    fireEvent.click(getByText('Link to a Master Ticket'));
    fireEvent.click(getByTestId('close-link-modal'));
  });

  it('allows assigning the ticket as master through the modal', () => {
    mockFormValues.ticketId = 'T-200';
    const { getByText, getByTestId } = renderWithTheme(<RaiseTicket />);

    fireEvent.click(getByText('Assign this ticket as Master'));
    fireEvent.click(getByTestId('assign-master-success'));

    expect(mockFormValues.isMaster).toBe(true);
  });

  it('hides link button for master tickets', () => {
    mockFormValues.isMaster = true;
    const { queryByText } = renderWithTheme(<RaiseTicket />);

    expect(queryByText('Link to a Master Ticket')).toBeNull();
    expect(queryByText('Assign this ticket as Master')).toBeNull();
  });
});
