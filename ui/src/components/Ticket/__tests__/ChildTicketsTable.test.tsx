import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ChildTicketsTable from '../ChildTicketsTable';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, vars) => key.replace('{{id}}', vars?.id || '') }),
}));

jest.mock('../../../utils/Utils', () => ({
  truncateWithEllipsis: (value) => value,
  getStatusNameById: jest.fn((id) => (id === '1' ? 'Open' : '')),
}));

jest.mock('../../UI/IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ onClick, disabled, 'aria-label': ariaLabel, icon }) => (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {icon}
    </button>
  ),
}));

jest.mock('../../UI/GenericTable', () => ({
  __esModule: true,
  default: ({ dataSource, columns, locale }) => (
    <div>
      {dataSource.length === 0 ? <div>{locale.emptyText}</div> : null}
      {dataSource.map((record) => (
        <div key={record.id} data-testid={`row-${record.id}`}>
          {columns.map((column) => (
            <div key={column.key}>{column.render?.(record[column.dataIndex], record) ?? record[column.dataIndex]}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe('ChildTicketsTable', () => {
  const tickets = [
    { id: 'TK-1', subject: 'Issue 1', category: 'Infra', subCategory: 'Network', statusId: '1', assignedToName: 'Alex' },
    { id: 'TK-2', subject: '', category: 'App', statusId: '', statusLabel: 'Pending', assignedTo: 'user2' },
  ] as any;

  it('renders table content and triggers view/unlink actions including keyboard', () => {
    const onView = jest.fn();
    const onUnlink = jest.fn();

    render(<ChildTicketsTable tickets={tickets} loading={false} onView={onView} onUnlink={onUnlink} unlinkingId="TK-2" />);

    expect(screen.getByTestId('row-TK-1')).toHaveTextContent('Infra > Network');
    expect(screen.getByTestId('row-TK-2')).toHaveTextContent('Pending');
    expect(screen.getByLabelText('Unlink ticket TK-2')).toBeDisabled();

    const ticketIdBtn = screen.getAllByRole('button').find((el) => el.textContent === 'TK-1');
    fireEvent.click(ticketIdBtn!);
    fireEvent.keyDown(ticketIdBtn!, { key: 'Enter' });

    expect(onView).toHaveBeenCalledWith('TK-1');

    fireEvent.click(screen.getByLabelText('Unlink ticket TK-1'));
    expect(onUnlink).toHaveBeenCalledWith('TK-1');
  });

  it('renders empty state', () => {
    render(<ChildTicketsTable tickets={[]} loading={false} onView={jest.fn()} onUnlink={jest.fn()} />);
    expect(screen.getByText('No child tickets linked yet.')).toBeInTheDocument();
  });
});
