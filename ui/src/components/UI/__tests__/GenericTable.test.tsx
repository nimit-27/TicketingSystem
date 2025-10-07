import { screen } from '@testing-library/react';
import GenericTable from '../GenericTable';
import { createTestTheme, renderWithTheme } from '../../../test/testUtils';

const dataSource = [
  { key: '1', name: 'Alice', age: 30 },
];

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
];

describe('GenericTable', () => {
  it('applies theme aware styling in light mode', () => {
    const { container } = renderWithTheme(
      <GenericTable dataSource={dataSource} columns={columns} pagination={false} />,
    );

    const styledElement = container.querySelector('[style*="--table-header-bg"]');
    expect(styledElement).toBeInTheDocument();
  });

  it('uses the dark theme modifier class when palette mode is dark', () => {
    const darkTheme = createTestTheme({ palette: { mode: 'dark', success: { main: '#4caf50', dark: '#357a38' } } });
    const { container } = renderWithTheme(
      <GenericTable dataSource={dataSource} columns={columns} pagination={false} className="custom" />,
      { theme: darkTheme },
    );

    expect(container.querySelector('.table-dark-theme')).toBeInTheDocument();
  });

  it('renders provided data rows', () => {
    renderWithTheme(
      <GenericTable dataSource={dataSource} columns={columns} pagination={false} />,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
