import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

const mockAddRole = jest.fn(() => Promise.resolve());
const mockLoadPermissions = jest.fn(() => Promise.resolve());
const mockGetAllPermissions = jest.fn(() => Promise.resolve({ roles: { Admin: {} } }));
const mockGetAllRoles = jest.fn(() => Promise.resolve([{ roleId: '1', role: 'Admin', description: 'Desc', createdOn: '2024-01-01' }]));
const mockDeleteRole = jest.fn(() => Promise.resolve());
const mockDeleteRoles = jest.fn(() => Promise.resolve());
const mockGetStatusActions = jest.fn(() => Promise.resolve([{ id: 1, action: 'Approve' }]));
const mockUseApi = jest.fn();

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../services/RoleService', () => ({
  addRole: (...args: unknown[]) => mockAddRole(...args),
  getAllPermissions: () => mockGetAllPermissions(),
  loadPermissions: (...args: unknown[]) => mockLoadPermissions(...args),
  getAllRoles: () => mockGetAllRoles(),
  deleteRole: (...args: unknown[]) => mockDeleteRole(...args),
  deleteRoles: (...args: unknown[]) => mockDeleteRoles(...args),
}));

jest.mock('../../services/StatusService', () => ({
  getStatusActions: () => mockGetStatusActions(),
}));

jest.mock('../../components/UI/ViewToggle', () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <button data-testid="view-toggle" onClick={() => onChange(value === 'table' ? 'grid' : 'table')}>
      toggle
    </button>
  ),
}));

let capturedTableProps: any = null;

jest.mock('../../components/UI/GenericTable', () => ({
  __esModule: true,
  default: (props: any) => {
    capturedTableProps = props;
    return <div data-testid="roles-table">Table</div>;
  },
}));

jest.mock('../../components/UI/IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ onClick, icon }: { onClick: () => void; icon: string }) => (
    <button onClick={onClick}>{icon}</button>
  ),
}));

jest.mock('../../context/DevModeContext', () => {
  const ReactModule = require('react');
  return {
    DevModeContext: ReactModule.createContext({ devMode: false }),
  };
});

jest.mock('../CreateRole', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel }: { onSubmit: (payload: any) => void; onCancel: () => void }) => (
    <div>
      <button data-testid="create-role-submit" onClick={() => onSubmit({ role: 'NewRole' })}>Submit Create</button>
      <button data-testid="create-role-cancel" onClick={onCancel}>Cancel Create</button>
    </div>
  ),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

const navigateMock = jest.fn();
const useNavigateMock = jest.requireMock('react-router-dom').useNavigate as jest.Mock;
useNavigateMock.mockReturnValue(navigateMock);

import RoleMaster from '../RoleMaster';

describe('RoleMaster', () => {
  const originalConfirm = window.confirm;

  beforeEach(() => {
    mockAddRole.mockClear();
    mockLoadPermissions.mockClear();
    mockGetAllPermissions.mockClear();
    mockGetAllRoles.mockClear();
    mockDeleteRole.mockClear();
    mockDeleteRoles.mockClear();
    mockGetStatusActions.mockClear();
    capturedTableProps = null;
    navigateMock.mockClear();
    window.confirm = jest.fn(() => true);
    mockUseApi.mockReset();

    mockAddRole.mockResolvedValue(undefined);
    mockLoadPermissions.mockResolvedValue(undefined);
    mockDeleteRole.mockResolvedValue(undefined);
    mockDeleteRoles.mockResolvedValue(undefined);
    mockGetAllPermissions.mockResolvedValue({ roles: { Admin: {} } });
    mockGetAllRoles.mockResolvedValue([{ roleId: '1', role: 'Admin', description: 'Desc', createdOn: '2024-01-01' }]);
    mockGetStatusActions.mockResolvedValue([{ id: 1, action: 'Approve' }]);

    mockUseApi
      .mockImplementationOnce(() => ({
        data: [{ roleId: '1', role: 'Admin', description: 'Desc', createdOn: '2024-01-01' }],
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementationOnce(() => ({
        data: { roles: { Admin: {} } },
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementationOnce(() => ({
        data: [{ id: 1, action: 'Approve' }],
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementation(() => ({
        data: null,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }));
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it('creates a role when create flow is submitted', async () => {
    const { getByText, getByTestId } = render(<RoleMaster />);

    await act(async () => {
      fireEvent.click(getByText('Create Role'));
    });

    await act(async () => {
      fireEvent.click(getByTestId('create-role-submit'));
    });

    await waitFor(() => {
      expect(mockAddRole).toHaveBeenCalledWith({ role: 'NewRole' });
      expect(mockGetAllRoles).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes selected roles', async () => {
    const { getByText } = render(<RoleMaster />);
    expect(capturedTableProps).not.toBeNull();
    await act(async () => {
      capturedTableProps.rowSelection.onChange(['1']);
    });

    await act(async () => {
      fireEvent.click(getByText('Delete Selected'));
    });

    await waitFor(() => {
      expect(mockDeleteRoles).toHaveBeenCalledWith(['1'], false);
    });
  });
});
