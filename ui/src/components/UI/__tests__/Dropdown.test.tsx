import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import GenericDropdown from '../Dropdown/GenericDropdown';
import DropdownController from '../Dropdown/DropdownController';
import GenericDropdownController from '../Dropdown/GenericDropdownController';
import { renderWithTheme } from '../../../test/testUtils';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}), { virtual: true });

describe('GenericDropdown', () => {
  const options = [
    { label: 'Option One', value: 'one' },
    { label: 'Option Two', value: 'two' },
  ];

  const openMenu = async () => {
    const trigger = screen.getByRole('combobox');
    fireEvent.mouseDown(trigger);
  };

  it('renders translated label and options', async () => {
    renderWithTheme(
      <GenericDropdown label="dropdown.label" value="one" onChange={jest.fn()} options={options} />,
    );

    expect(screen.getAllByText('dropdown.label')[0]).toBeInTheDocument();

    await openMenu();

    expect(await screen.findByRole('option', { name: 'Option One' })).toBeInTheDocument();
  });

  it('shows a fallback menu item when no options are provided', async () => {
    renderWithTheme(
      <GenericDropdown label="dropdown.empty" value="" onChange={jest.fn()} options={[]} />, 
    );

    await openMenu();

    expect(await screen.findByText('No options available')).toBeInTheDocument();
  });
});

describe('DropdownController', () => {
  const options = [
    { label: 'First', value: 'first' },
    { label: 'Second', value: 'second' },
  ];

  it('maps the selected option back to the provided callback', async () => {
    const handleChange = jest.fn();
    renderWithTheme(
      <DropdownController value="first" onChange={handleChange} options={options} label="controller" />,
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Second' }));

    expect(handleChange).toHaveBeenCalledWith('second');
  });
});

describe('GenericDropdownController', () => {
  const options = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
  ];

  const FormWrapper = ({ onExternalChange }: { onExternalChange?: () => void }) => {
    const { control, trigger } = useForm({
      defaultValues: { status: '' },
      mode: 'onBlur',
    });

    return (
      <div>
        <GenericDropdownController
          name="status"
          control={control}
          rules={{ required: 'Status is required' }}
          onChange={onExternalChange}
          label="status"
          options={options}
        />
        <button type="button" onClick={() => trigger('status')}>
          validate
        </button>
      </div>
    );
  };

  it('propagates selections to react-hook-form and external handlers', async () => {
    const onExternalChange = jest.fn();
    renderWithTheme(<FormWrapper onExternalChange={onExternalChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(onExternalChange).toHaveBeenCalled();
  });

  it('displays validation messages returned by react-hook-form', async () => {
    renderWithTheme(<FormWrapper />);

    await userEvent.click(screen.getByRole('button', { name: 'validate' }));

    await waitFor(() => {
      expect(screen.getByText('Status is required')).toBeInTheDocument();
    });
  });
});
