import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PermissionsModal from '../PermissionsModal';

const mockPermissionTree = jest.fn(({ data, onChange }: { data: any; onChange: (value: any) => void }) => (
  <div data-testid="permission-tree">
    <button type="button" onClick={() => onChange({ mutated: true })}>
      Update permissions
    </button>
    <span data-testid="tree-data">{JSON.stringify(data)}</span>
  </div>
));

jest.mock('../PermissionTree', () => ({
  __esModule: true,
  default: (props: any) => mockPermissionTree(props),
}));

jest.mock('../../UI/Dropdown/GenericDropdown', () => ({
  __esModule: true,
  default: ({ label, value, onChange, options }: any) => (
    <label>
      {label}
      <select aria-label={label} value={value} onChange={(event) => onChange({ target: { value: event.target.value } })}>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

describe('PermissionsModal', () => {
  const roles = ['Admin', 'User'];
  const permissions = {
    Admin: {
      sidebar: { show: true, metadata: { name: 'Admin Sidebar' }, children: null },
    },
    User: {
      sidebar: { show: false, metadata: { name: 'User Sidebar' }, children: null },
    },
  };

  beforeEach(() => {
    mockPermissionTree.mockClear();
  });

  it('renders the modal with the default role permissions', async () => {
    render(
      <PermissionsModal
        open
        roles={roles}
        permissions={permissions}
        defaultRole="Admin"
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        title="Edit permissions"
      />
    );

    await waitFor(() => expect(mockPermissionTree).toHaveBeenCalled());

    expect(screen.getByText('Edit permissions')).toBeInTheDocument();
    const firstCall = mockPermissionTree.mock.calls[0][0];
    expect(firstCall.data).toEqual(permissions.Admin);
    expect(firstCall.data).not.toBe(permissions.Admin);
  });

  it('switches the displayed permissions when selecting a different role', async () => {
    render(
      <PermissionsModal
        open
        roles={roles}
        permissions={permissions}
        defaultRole="Admin"
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    await waitFor(() => expect(mockPermissionTree).toHaveBeenCalled());
    mockPermissionTree.mockClear();

    await userEvent.selectOptions(screen.getByLabelText('Select Base Permissions'), 'User');

    await waitFor(() => expect(mockPermissionTree).toHaveBeenCalled());
    const props = mockPermissionTree.mock.calls[mockPermissionTree.mock.calls.length - 1][0];
    expect(props.data).toEqual(permissions.User);
    expect(props.data).not.toBe(permissions.User);
  });

  it('submits updated permissions emitted by the tree', async () => {
    const handleSubmit = jest.fn();

    render(
      <PermissionsModal
        open
        roles={roles}
        permissions={permissions}
        defaultRole="Admin"
        onClose={jest.fn()}
        onSubmit={handleSubmit}
      />
    );

    await waitFor(() => expect(mockPermissionTree).toHaveBeenCalled());
    const latestProps = mockPermissionTree.mock.calls[mockPermissionTree.mock.calls.length - 1][0];
    latestProps.onChange({ mutated: true });
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({ mutated: true });
  });

  it('invokes close handler when cancel button is pressed', async () => {
    const handleClose = jest.fn();

    render(
      <PermissionsModal
        open
        roles={roles}
        permissions={permissions}
        defaultRole="Admin"
        onClose={handleClose}
        onSubmit={jest.fn()}
      />
    );

    await waitFor(() => expect(mockPermissionTree).toHaveBeenCalled());
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(handleClose).toHaveBeenCalled();
  });
});
