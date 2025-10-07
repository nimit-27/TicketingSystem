import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

const mockSubmit = jest.fn();
const mockCancel = jest.fn();
const mockSetCustomPerm = jest.fn();

let mockAutocompleteCounter = 0;

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Autocomplete: ({ options = [], value, onChange, multiple = false, renderInput }: any) => {
      const instanceId = mockAutocompleteCounter++;
      const normalizeOption = (option: any) => {
        if (typeof option === 'string') {
          return option;
        }
        if (option?.id != null) {
          return String(option.id);
        }
        if (option?.action) {
          return option.action;
        }
        return String(option);
      };

      const normalizedValue = multiple
        ? (Array.isArray(value) ? value : []).map((item: any) => normalizeOption(item))
        : normalizeOption(value ?? '');

      const handleChange = (event: any) => {
        const rawValues = multiple
          ? Array.from(event.target.selectedOptions || [])
          : [event.target.value];
        const selectedValues = multiple
          ? rawValues.map((opt: any) => opt.value ?? opt)
          : rawValues[0];
        const mapToOption = (val: string) => options.find((opt: any) => normalizeOption(opt) === val) ?? val;
        const payload = multiple
          ? (selectedValues as string[]).map((val: string) => mapToOption(val))
          : mapToOption(selectedValues as string);
        onChange?.(event, payload);
      };

      return (
        <div data-testid={`autocomplete-${instanceId}`}>
          {renderInput?.({ InputProps: {}, inputProps: {}, InputLabelProps: {} })}
          <select multiple={multiple} value={normalizedValue} onChange={handleChange}>
            {options.map((option: any) => {
              const optValue = normalizeOption(option);
              return (
                <option key={optValue} value={optValue}>
                  {optValue}
                </option>
              );
            })}
          </select>
        </div>
      );
    },
  };
});

jest.mock('../../components/Permissions/PermissionsModal', () => ({
  __esModule: true,
  default: ({ open, onSubmit }: any) => (
    <div data-testid="permissions-modal">
      {open && (
        <button onClick={() => {
          onSubmit({ custom: true });
          mockSetCustomPerm();
        }}>Save Custom</button>
      )}
    </div>
  ),
}));

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: () => ({ name: 'Tester' }),
}));

import CreateRole from '../CreateRole';

describe('CreateRole', () => {
  beforeEach(() => {
    mockSubmit.mockClear();
    mockCancel.mockClear();
    mockSetCustomPerm.mockClear();
    mockAutocompleteCounter = 0;
  });

  it('submits role details with selected permissions', async () => {
    const { getByLabelText, getByText, getAllByTestId } = render(
      <CreateRole
        roles={['Admin']}
        permissions={{}}
        statusActions={[]}
        onSubmit={mockSubmit}
        onCancel={mockCancel}
      />
    );

    await act(async () => {
      fireEvent.change(getByLabelText('Role name'), { target: { value: 'Supervisor' } });
      fireEvent.change(getByLabelText('Description'), { target: { value: 'Handles escalations' } });
    });

    const permissionsSelect = getAllByTestId(/^autocomplete-/)[0].querySelector('select')!;
    await act(async () => {
      fireEvent.change(permissionsSelect, {
        target: {
          value: 'Admin',
        },
      } as any);
    });

    await act(async () => {
      fireEvent.click(getByText('Submit'));
    });

    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      role: 'Supervisor',
      description: 'Handles escalations',
      permissionsList: ['Admin'],
    }));
  });

  it('triggers cancel handler on cancel click', () => {
    const { getByText } = render(
      <CreateRole roles={[]} permissions={{}} statusActions={[]} onSubmit={mockSubmit} onCancel={mockCancel} />
    );
    fireEvent.click(getByText('Cancel'));
    expect(mockCancel).toHaveBeenCalled();
  });
});
