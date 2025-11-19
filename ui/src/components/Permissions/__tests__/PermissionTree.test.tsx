import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PermissionTree from '../PermissionTree';
import { DevModeContext } from '../../../context/DevModeContext';
import { renderWithTheme } from '../../../test/testUtils';

jest.mock('../JsonEditModal', () => ({
  __esModule: true,
  default: ({ open, onSubmit, onCancel }: { open: boolean; onSubmit: (value: any) => void; onCancel: () => void }) => (
    open ? (
      <div data-testid="json-edit-modal">
        <button type="button" onClick={() => onSubmit({ show: false })}>
          Save JSON
        </button>
        <button type="button" onClick={onCancel}>
          Close JSON
        </button>
      </div>
    ) : null
  ),
}));

const devModeValue = {
  devMode: true,
  toggleDevMode: jest.fn(),
  jwtBypass: false,
  toggleJwtBypass: jest.fn(),
  setJwtBypass: jest.fn(),
};

const renderWithContext = (ui: React.ReactNode, value = { ...devModeValue, devMode: false }) =>
  renderWithTheme(
    <DevModeContext.Provider value={value as any}>
      {ui}
    </DevModeContext.Provider>,
  );

const findCheckboxForLabel = (label: string): HTMLInputElement => {
  const textEl = screen.getByText(label);
  let current: HTMLElement | null = textEl.parentElement as HTMLElement | null;
  while (current && !current.querySelector('input[type="checkbox"]')) {
    current = current.parentElement as HTMLElement | null;
  }
  if (!current) {
    throw new Error(`Checkbox for ${label} not found`);
  }
  return current.querySelector('input[type="checkbox"]') as HTMLInputElement;
};

describe('PermissionTree', () => {
  it('toggles show state for a node', async () => {
    const initialData = {
      sidebar: { show: true, metadata: { name: 'Sidebar' }, children: null },
    };

    const Wrapper = () => {
      const [data, setData] = React.useState(initialData);
      return (
        <PermissionTree
          data={data}
          onChange={setData}
        />
      );
    };

    renderWithContext(<Wrapper />);

    const checkboxBefore = findCheckboxForLabel('Sidebar');
    expect(checkboxBefore).toBeChecked();

    await userEvent.click(checkboxBefore);

    await waitFor(() => expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked());
  });

  it('allows adding a child node when structure editing is enabled in dev mode', async () => {
    const initialData = {
      pages: { show: false, metadata: { name: 'Pages' }, children: null },
    };

    const Wrapper = () => {
      const [data, setData] = React.useState(initialData);
      return (
        <PermissionTree
          data={data}
          onChange={setData}
          allowStructureEdit
          defaultShowForNewNodes
        />
      );
    };

    renderWithContext(<Wrapper />, devModeValue);

    const addButton = screen.getByLabelText('Add child attribute');
    await userEvent.click(addButton);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'New Child');

    const confirmButton = screen.getByTestId('CheckIcon').closest('button');
    await userEvent.click(confirmButton!);

    await waitFor(() => expect(screen.getByText('New Child')).toBeInTheDocument());

    const newChildCheckbox = findCheckboxForLabel('New Child');
    expect(newChildCheckbox).toBeChecked();
  });

  it('cycles all children visibility via the chip', async () => {
    const initialData = {
      pages: {
        show: true,
        metadata: { name: 'Pages' },
        children: {
          dashboard: { show: true, metadata: { name: 'Dashboard' }, children: null },
          reports: { show: false, metadata: { name: 'Reports' }, children: null },
        },
      },
    };

    const Wrapper = () => {
      const [data, setData] = React.useState(initialData);
      return (
        <PermissionTree
          data={data}
          onChange={setData}
          allowStructureEdit
        />
      );
    };

    renderWithContext(<Wrapper />);

    const chip = screen.getByRole('button', { name: /all children/i });

    expect(findCheckboxForLabel('Dashboard')).toBeChecked();
    expect(findCheckboxForLabel('Reports')).not.toBeChecked();

    await userEvent.click(chip);
    await waitFor(() => {
      expect(findCheckboxForLabel('Dashboard')).toBeChecked();
      expect(findCheckboxForLabel('Reports')).toBeChecked();
    });

    await userEvent.click(chip);
    await waitFor(() => {
      expect(findCheckboxForLabel('Dashboard')).not.toBeChecked();
      expect(findCheckboxForLabel('Reports')).not.toBeChecked();
    });

    await userEvent.click(chip);
    await waitFor(() => {
      expect(findCheckboxForLabel('Dashboard')).toBeChecked();
      expect(findCheckboxForLabel('Reports')).not.toBeChecked();
    });
  });

  it('opens the json editor and applies submitted changes', async () => {
    const handleChange = jest.fn();
    const data = {
      pages: {
        show: true,
        metadata: { name: 'Pages' },
        children: null,
      },
    };

    renderWithContext(
      <PermissionTree
        data={data}
        onChange={handleChange}
        allowStructureEdit
      />, devModeValue
    );

    const editJsonButton = screen.getAllByLabelText('Edit JSON').find(el => el.tagName === 'BUTTON') as HTMLElement;
    await userEvent.click(editJsonButton);

    expect(screen.getByTestId('json-edit-modal')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /save json/i }));

    expect(handleChange).toHaveBeenCalledWith({
      pages: { show: false },
    });
    await waitFor(() => expect(screen.queryByTestId('json-edit-modal')).not.toBeInTheDocument());
  });
});
