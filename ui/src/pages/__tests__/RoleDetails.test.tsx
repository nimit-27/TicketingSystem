import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

const mockUpdateRolePermission = jest.fn(() => Promise.resolve());
const mockUpdateRole = jest.fn(() => Promise.resolve());
const mockRenameRole = jest.fn(() => Promise.resolve());
const mockLoadPermissions = jest.fn(() => Promise.resolve());
const mockGetAllRoles = jest.fn(() => Promise.resolve([{ roleId: 1, role: 'Admin', allowedStatusActionIds: '1|2', description: 'Administrator' }]));
const mockGetStatusActions = jest.fn(() => Promise.resolve([{ id: 1, action: 'Approve' }]));
const mockShowMessage = jest.fn();
const mockUseApi = jest.fn();

let mockAutocompleteCounter = 0;

jest.mock('@mui/material/Autocomplete', () => ({
  __esModule: true,
  default: ({ options = [], value, onChange, renderInput }: any) => {
    const instanceId = mockAutocompleteCounter++;
    const normalize = (option: any) => {
      if (typeof option === 'string') return option;
      if (option?.id != null) return String(option.id);
      if (option?.action) return option.action;
      return String(option ?? '');
    };
    const normalizedValue = Array.isArray(value) ? value.map((v: any) => normalize(v)) : normalize(value);
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = Array.from(event.target.selectedOptions || []).map(opt => opt.value);
      const mapped = selected.map(val => options.find((opt: any) => normalize(opt) === val) ?? val);
      onChange?.(event, mapped);
    };
    return (
      <div data-testid={`autocomplete-${instanceId}`}>
        {renderInput?.({ InputProps: {}, inputProps: {}, InputLabelProps: {} })}
        <select multiple value={normalizedValue} onChange={handleChange}>
          {options.map((opt: any) => {
            const val = normalize(opt);
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>
      </div>
    );
  },
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../services/RoleService', () => ({
  updateRolePermission: (...args: unknown[]) => mockUpdateRolePermission(...args),
  updateRole: (...args: unknown[]) => mockUpdateRole(...args),
  loadPermissions: (...args: unknown[]) => mockLoadPermissions(...args),
  renameRole: (...args: unknown[]) => mockRenameRole(...args),
  getAllRoles: () => mockGetAllRoles(),
}));

jest.mock('../../services/StatusService', () => ({
  getStatusActions: () => mockGetStatusActions(),
}));

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: () => ({ userId: 'u1', username: 'user.one' }),
}));

jest.mock('../../components/Permissions/PermissionTree', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (p: any) => void }) => (
    <button data-testid="permission-tree" onClick={() => onChange({ updated: true })}>Tree</button>
  ),
}));

jest.mock('../../components/Permissions/JsonEditModal', () => ({
  __esModule: true,
  default: ({ open, onSubmit, onCancel }: any) => (
    open ? (
      <div>
        <button onClick={() => onSubmit({ json: true })}>Submit JSON</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('../../components/UI/IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ onClick, icon }: { onClick: () => void; icon: string }) => (
    <button data-testid={`icon-${icon}`} onClick={onClick}>{icon}</button>
  ),
}));

jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock('../../context/DevModeContext', () => {
  const ReactModule = require('react');
  return {
    DevModeContext: ReactModule.createContext({ devMode: true }),
  };
});

jest.mock('react-router-dom', () => {
  const navigate = jest.fn();
  return {
    useParams: () => ({ roleId: '1' }),
    useNavigate: () => navigate,
    useLocation: () => ({ state: { permissions: { dashboard: true }, role: 'Admin' } }),
    __navigateMock: navigate,
  };
});

const navigateMock = jest.requireMock('react-router-dom').__navigateMock as jest.Mock;

import RoleDetails from '../RoleDetails';

describe('RoleDetails', () => {
  beforeEach(() => {
    mockUpdateRolePermission.mockClear();
    mockUpdateRole.mockClear();
    mockRenameRole.mockClear();
    mockLoadPermissions.mockClear();
    mockShowMessage.mockClear();
    navigateMock.mockClear();
    mockAutocompleteCounter = 0;
    mockUseApi.mockReset();
    mockUpdateRolePermission.mockResolvedValue(undefined);
    mockUpdateRole.mockResolvedValue(undefined);
    mockRenameRole.mockResolvedValue(undefined);
    mockLoadPermissions.mockResolvedValue(undefined);

    mockUseApi
      .mockImplementationOnce(() => ({
        data: [{ id: 1, action: 'Approve' }],
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementationOnce(() => ({
        data: [{ roleId: 1, role: 'Admin', allowedStatusActionIds: '1|2', description: 'Administrator', permissions: { dashboard: true } }],
        pending: false,
        success: true,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }))
      .mockImplementation(() => ({
        data: null,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      }));
  });

  it('saves permissions and status actions', async () => {
    const { getByText } = render(<RoleDetails />);

    fireEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockUpdateRolePermission).toHaveBeenCalled();
      expect(mockUpdateRole).toHaveBeenCalledWith('1', expect.objectContaining({ allowedStatusActionIds: expect.any(String) }));
      expect(mockShowMessage).toHaveBeenCalledWith('Permissions updated successfully', 'success');
    });
  });

  it('allows renaming the role', () => {
    const { getByTestId, getByDisplayValue } = render(<RoleDetails />);
    fireEvent.click(getByTestId('icon-edit'));
    fireEvent.change(getByDisplayValue('Admin'), { target: { value: 'Admin Updated' } });
    fireEvent.click(getByTestId('icon-check'));
    expect(mockRenameRole).toHaveBeenCalledWith('1', 'Admin Updated', 'user.one');
  });
});
