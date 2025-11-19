import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockUpdateRolePermission = jest.fn(() => Promise.resolve());
const mockUpdateRole = jest.fn(() => Promise.resolve());
const mockRenameRole = jest.fn(() => Promise.resolve());
const mockLoadPermissions = jest.fn(() => Promise.resolve());
const mockGetAllRoles = jest.fn(() => Promise.resolve([
  { roleId: 1, role: 'Admin', allowedStatusActionIds: '1|2', description: 'Administrator' },
  { roleId: 2, role: 'Agent', allowedStatusActionIds: '1', description: 'Agent' },
]));
const mockGetStatusActions = jest.fn(() => Promise.resolve([{ id: 1, action: 'Approve' }]));
const mockShowMessage = jest.fn();
const mockUseApi = jest.fn();

const actionsData = [{ id: 1, action: 'Approve' }];
const rolesApiResponse = [
  { roleId: 1, role: 'Admin', allowedStatusActionIds: '1|2', description: 'Administrator', permissions: { dashboard: true } },
  { roleId: 2, role: 'Agent', allowedStatusActionIds: '1', description: 'Agent', permissions: { dashboard: false } },
];

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
  let mockRoleId = '1';
  let mockLocationState: any = { permissions: { dashboard: true }, role: 'Admin' };

  const navigate = jest.fn((path?: string, options?: any) => {
    if (typeof path === 'string') {
      const match = path.match(/\/role-master\/(.+)$/);
      if (match) {
        mockRoleId = match[1];
      }
    }
    if (options?.state) {
      mockLocationState = options.state;
    }
  });

  return {
    useParams: () => ({ roleId: mockRoleId }),
    useNavigate: () => navigate,
    useLocation: () => ({ state: mockLocationState }),
    __navigateMock: navigate,
    __resetRouter: () => {
      mockRoleId = '1';
      mockLocationState = { permissions: { dashboard: true }, role: 'Admin' };
    },
  };
});

const routerDomMock = jest.requireMock('react-router-dom');
const navigateMock = routerDomMock.__navigateMock as jest.Mock;
const resetRouterMock = routerDomMock.__resetRouter as () => void;

import RoleDetails from '../RoleDetails';

describe('RoleDetails', () => {
  beforeEach(() => {
    mockUpdateRolePermission.mockClear();
    mockUpdateRole.mockClear();
    mockRenameRole.mockClear();
    mockLoadPermissions.mockClear();
    mockShowMessage.mockClear();
    navigateMock.mockClear();
    resetRouterMock();
    mockAutocompleteCounter = 0;
    mockUseApi.mockReset();
    mockUpdateRolePermission.mockResolvedValue(undefined);
    mockUpdateRole.mockResolvedValue(undefined);
    mockRenameRole.mockResolvedValue(undefined);
    mockLoadPermissions.mockResolvedValue(undefined);

    mockUseApi.mockImplementation(() => {
      const callIndex = mockUseApi.mock.calls.length;
      if (callIndex % 2 === 1) {
        return {
          data: actionsData,
          apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
        };
      }
      return {
        data: rolesApiResponse,
        pending: false,
        success: true,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      };
    });
  });

  it('saves permissions and status actions', async () => {
    const { getByText } = renderWithTheme(<RoleDetails />);

    fireEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockUpdateRolePermission).toHaveBeenCalled();
      expect(mockUpdateRole).toHaveBeenCalledWith('1', expect.objectContaining({ allowedStatusActionIds: expect.any(String) }));
      expect(mockShowMessage).toHaveBeenCalledWith('Permissions updated successfully', 'success');
    });
  });

  it('allows renaming the role', () => {
    const { getByTestId, getByDisplayValue } = renderWithTheme(<RoleDetails />);
    fireEvent.click(getByTestId('icon-edit'));
    fireEvent.change(getByDisplayValue('Admin'), { target: { value: 'Admin Updated' } });
    fireEvent.click(getByTestId('icon-check'));
    expect(mockRenameRole).toHaveBeenCalledWith('1', 'Admin Updated', 'user.one');
  });

  it('allows selecting other roles from the title menu', async () => {
    renderWithTheme(<RoleDetails />);

    fireEvent.click(screen.getByText('Role: Admin'));

    const targetMenuItem = await waitFor(() => screen.getByRole('menuitem', { name: 'Agent' }));

    fireEvent.click(targetMenuItem);

    expect(navigateMock).toHaveBeenCalledWith('/role-master/2', { state: expect.objectContaining({ role: 'Agent' }) });
  });

  it('updates the displayed role data when a new role is selected', async () => {
    renderWithTheme(<RoleDetails />);

    fireEvent.click(screen.getByText('Role: Admin'));

    const targetMenuItem = await waitFor(() => screen.getByRole('menuitem', { name: 'Agent' }));

    fireEvent.click(targetMenuItem);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Role: Agent' })).toBeInTheDocument();
    });

    const autocomplete = screen.getByRole('listbox') as HTMLSelectElement;
    expect(Array.from(autocomplete.selectedOptions).map(option => option.value)).toEqual(['1']);

    expect(screen.getByText('Agent', { selector: 'p' })).toBeInTheDocument();
  });
});
