import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react';

const mockUsers = [
  { UserId: '1', name: 'Alice', emailId: 'alice@example.com', mobileNo: '123', office: 'Manager' },
  { UserId: '2', name: 'Bob', emailId: 'bob@example.com', mobileNo: '456', office: 'Lead' },
];

const mockGetAllUsers = jest.fn(() => Promise.resolve(mockUsers));
const mockAddUser = jest.fn(() => Promise.resolve({ message: 'Added' }));
const mockDeleteUser = jest.fn(() => Promise.resolve());
const mockUseApi = jest.fn();
const mockShowMessage = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

jest.mock('../../services/UserService', () => ({
  getAllUsers: () => mockGetAllUsers(),
  addUser: (...args: unknown[]) => mockAddUser(...args),
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
}));

jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock('../../components/UI/GenericTable', () => ({
  __esModule: true,
  default: ({ dataSource }: { dataSource: any[] }) => (
    <div data-testid="table">{dataSource.map((item) => item.name).join(',')}</div>
  ),
}));

jest.mock('../../components/UI/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, type }: { children: React.ReactNode; onClick?: () => void; type?: string }) => (
    <button type={type as 'button' | 'submit' | 'reset' | undefined} onClick={onClick}>{children}</button>
  ),
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({}),
}), { virtual: true });

import EscalationMaster from '../EscalationMaster';
import { renderWithTheme } from '../../test/testUtils';

describe('EscalationMaster', () => {
  beforeEach(() => {
    mockGetAllUsers.mockClear();
    mockAddUser.mockClear();
    mockDeleteUser.mockClear();
    mockShowMessage.mockClear();
    mockUseApi.mockReset();

    mockAddUser.mockResolvedValue({ message: 'Added' });
    mockDeleteUser.mockResolvedValue(undefined);

    mockUseApi
      .mockImplementationOnce(() => ({
        data: mockUsers,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementationOnce(() => ({
        data: null,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementation(() => ({
        data: null,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }));
  });

  it('submits new user details and refreshes list', async () => {
    const { getByLabelText, getByText } = renderWithTheme(<EscalationMaster />);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'Charlie' } });
    fireEvent.change(getByLabelText('Email ID'), { target: { value: 'charlie@example.com' } });
    fireEvent.change(getByLabelText('Phone Number'), { target: { value: '789' } });

    await act(async () => {
      fireEvent.click(getByText('Submit'));
    });

    await waitFor(() => {
      expect(mockAddUser).toHaveBeenCalledWith({
        name: 'Charlie',
        emailId: 'charlie@example.com',
        mobileNo: '789',
      });
      expect(mockShowMessage).toHaveBeenCalledWith('Added', 'success');
    });
  });

  it('filters users based on search query', () => {
    const { getByLabelText, getByTestId } = renderWithTheme(<EscalationMaster />);
    fireEvent.change(getByLabelText('Search'), { target: { value: 'Alice' } });
    expect(getByTestId('table')).toHaveTextContent('Alice');
  });
});
