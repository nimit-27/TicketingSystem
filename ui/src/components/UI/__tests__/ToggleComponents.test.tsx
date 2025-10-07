import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RadioToggleGroup from '../RadioToggleGroup';
import ViewToggle from '../ViewToggle';
import { renderWithTheme } from '../../../test/testUtils';

describe('Toggle components', () => {
  const options = [
    { value: 'grid', label: 'Grid', icon: 'grid' },
    { value: 'list', label: 'List', icon: 'table' },
  ];

  it('renders radio options with icons and triggers onChange', async () => {
    const onChange = jest.fn();
    renderWithTheme(
      <RadioToggleGroup value="grid" onChange={onChange} options={options} />,
    );

    const listOption = screen.getByRole('radio', { name: 'List' });
    await userEvent.click(listOption);

    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('renders as a ToggleButtonGroup when radio prop is false', async () => {
    const onChange = jest.fn();
    renderWithTheme(
      <ViewToggle value="grid" onChange={onChange} options={options} />, 
    );

    const listButton = screen.getByRole('button', { name: 'List' });
    await userEvent.click(listButton);

    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('delegates to RadioToggleGroup when radio is true', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <ViewToggle value="grid" onChange={onChange} options={options} radio />,
    );

    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });
});
