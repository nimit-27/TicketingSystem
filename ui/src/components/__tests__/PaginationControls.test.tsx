import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginationControls from '../PaginationControls';
import { renderWithTheme } from '../../test/testUtils';

jest.mock('../../i18n', () => ({}), { virtual: true });
jest.mock('i18next', () => {
  const fake = {
    use: () => fake,
    init: () => undefined,
  };
  return fake;
}, { virtual: true });
jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({}),
}), { virtual: true });

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `t:${key}`,
  }),
}), { virtual: true });

describe('PaginationControls', () => {
  it('renders pagination with the provided class name', () => {
    const { container } = renderWithTheme(
      <PaginationControls page={1} totalPages={3} onChange={jest.fn()} className="custom-class" />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass('d-flex', 'align-items-center');
    expect(wrapper.className).toContain('custom-class');
  });

  it('shows the page size controls when pageSize and handler are provided', () => {
    renderWithTheme(
      <PaginationControls
        page={2}
        totalPages={5}
        onChange={jest.fn()}
        pageSize={10}
        onPageSizeChange={jest.fn()}
        pageSizeLabel="items"
      />,
    );

    expect(screen.getByText('items')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(10);
  });

  it('calls onPageSizeChange when the input value changes to a valid number', () => {
    const onPageSizeChange = jest.fn();

    renderWithTheme(
      <PaginationControls
        page={1}
        totalPages={2}
        onChange={jest.fn()}
        pageSize={15}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });

    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('does not call onPageSizeChange for invalid page size values', () => {
    const onPageSizeChange = jest.fn();

    renderWithTheme(
      <PaginationControls
        page={1}
        totalPages={2}
        onChange={jest.fn()}
        pageSize={10}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '0' } });

    expect(onPageSizeChange).not.toHaveBeenCalled();
  });

  it('uses the increment and decrement buttons to adjust the page size', async () => {
    const onPageSizeChange = jest.fn();

    renderWithTheme(
      <PaginationControls
        page={1}
        totalPages={2}
        onChange={jest.fn()}
        pageSize={5}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    const label = screen.getByText('/ page');
    const controlsContainer = label.closest('div');
    expect(controlsContainer).not.toBeNull();

    const buttons = controlsContainer!.querySelectorAll('button');
    expect(buttons).toHaveLength(2);

    await userEvent.click(buttons[0]);
    expect(onPageSizeChange).toHaveBeenCalledWith(4);

    await userEvent.click(buttons[1]);
    expect(onPageSizeChange).toHaveBeenCalledWith(6);
  });
});
