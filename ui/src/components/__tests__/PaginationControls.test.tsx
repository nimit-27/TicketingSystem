import React from 'react';
import { screen } from '@testing-library/react';
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

  it('shows the page size controls when pageSize and handler are provided', async () => {
    renderWithTheme(
      <PaginationControls
        page={2}
        totalPages={5}
        onChange={jest.fn()}
        pageSize={10}
        onPageSizeChange={jest.fn()}
        pageSizeLabel="Items per page"
      />,
    );

    const select = screen.getByLabelText('Items per page');
    expect(select).toBeInTheDocument();
    await userEvent.click(select);
    expect(screen.getAllByRole('option')).not.toHaveLength(0);
  });

  it('calls onPageSizeChange when the selection changes', async () => {
    const onPageSizeChange = jest.fn();

    renderWithTheme(
      <PaginationControls
        page={1}
        totalPages={2}
        onChange={jest.fn()}
        pageSize={5}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[5, 10]}
      />,
    );

    const select = screen.getByLabelText('Rows per page');
    await userEvent.click(select);
    await userEvent.click(screen.getByRole('option', { name: '10' }));

    expect(onPageSizeChange).toHaveBeenCalledWith(10);
  });

  it('invokes onChange when navigation buttons are pressed', async () => {
    const onChange = jest.fn();

    renderWithTheme(
      <PaginationControls page={2} totalPages={5} onChange={onChange} />,
    );

    const nextButton = screen.getByLabelText('next page');
    await userEvent.click(nextButton);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 3);

    const previousButton = screen.getByLabelText('previous page');
    await userEvent.click(previousButton);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 1);
  });

  it('renders the range label when page size is available', () => {
    renderWithTheme(
      <PaginationControls
        page={2}
        totalPages={5}
        onChange={jest.fn()}
        pageSize={10}
        onPageSizeChange={jest.fn()}
        totalCount={42}
      />,
    );

    expect(screen.getByText('11–20 of 42')).toBeInTheDocument();
  });

  it('disables navigation buttons on boundary pages', () => {
    renderWithTheme(
      <PaginationControls page={1} totalPages={1} onChange={jest.fn()} />,
    );

    expect(screen.getByLabelText('first page')).toBeDisabled();
    expect(screen.getByLabelText('previous page')).toBeDisabled();
    expect(screen.getByLabelText('next page')).toBeDisabled();
    expect(screen.getByLabelText('last page')).toBeDisabled();
  });
});
