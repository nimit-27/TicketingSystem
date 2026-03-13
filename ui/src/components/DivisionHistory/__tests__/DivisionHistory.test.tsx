import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DivisionHistory from '../index';
import { useApi } from '../../../hooks/useApi';
import { getDivisionHistory } from '../../../services/DivisionHistoryService';

jest.mock('@mui/lab', () => ({
  Timeline: ({ children }) => <div>{children}</div>,
  TimelineItem: ({ children }) => <div>{children}</div>,
  TimelineSeparator: ({ children }) => <div>{children}</div>,
  TimelineDot: () => <span>dot</span>,
  TimelineConnector: () => <span>connector</span>,
  TimelineContent: ({ children }) => <div>{children}</div>,
}), { virtual: true });

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../../hooks/useApi', () => ({ useApi: jest.fn() }));
jest.mock('../../../services/DivisionHistoryService', () => ({ getDivisionHistory: jest.fn() }));

jest.mock('../../History/HistoryReportDownloadMenu', () => ({
  __esModule: true,
  default: ({ title, rows }) => <div data-testid="download-menu">{title}:{rows.length}</div>,
}));

jest.mock('../../UI/ViewToggle', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <button type="button" onClick={() => onChange(value === 'table' ? 'timeline' : 'table')}>
      toggle-view
    </button>
  ),
}));

jest.mock('../../UI/GenericTable', () => ({
  __esModule: true,
  default: ({ dataSource, columns, rowClassName, locale }) => (
    <div>
      <div data-testid="row-class">{rowClassName(dataSource[0], 0)}</div>
      {dataSource.length === 0 ? <div>{locale?.emptyText}</div> : null}
      {dataSource.map((record) => (
        <div key={record.id} data-testid={`row-${record.id}`}>
          {columns.map((column) => (
            <span key={column.key}>{column.render?.(record[column.dataIndex], record) ?? record[column.dataIndex]}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe('DivisionHistory', () => {
  it('fetches history and renders sorted table data with fallback values', () => {
    const apiHandler = jest.fn((fn) => fn());
    (useApi).mockReturnValue({
      data: [
        { id: '2', previousDivision: '', currentDivision: '', divisionName: 'Fallback', updatedBy: '', timestamp: '2024-01-01T00:00:00Z', remark: '' },
        { id: '1', previousDivision: 'Old', currentDivision: 'New', updatedBy: 'Agent', timestamp: '2024-01-02T00:00:00Z', remark: 'Moved' },
      ],
      apiHandler,
    });

    render(<DivisionHistory ticketId="TK-1" />);

    expect(apiHandler).toHaveBeenCalled();
    expect(getDivisionHistory).toHaveBeenCalledWith('TK-1');
    expect(screen.getByTestId('download-menu')).toHaveTextContent('Ticket TK-1 - Division History:2');
    expect(screen.getByTestId('row-class')).toHaveTextContent('latest-row');
    expect(screen.getByTestId('row-1')).toHaveTextContent('Old');
    expect(screen.getByTestId('row-2')).toHaveTextContent('Fallback');
    expect(screen.getByTestId('row-2')).toHaveTextContent('-');
  });

  it('switches to timeline view', () => {
    (useApi).mockReturnValue({
      data: [{ id: '1', currentDivision: 'Ops', updatedBy: 'Admin', timestamp: '2024-01-02T00:00:00Z' }],
      apiHandler: jest.fn(),
    });

    render(<DivisionHistory ticketId="TK-2" />);

    fireEvent.click(screen.getByRole('button', { name: 'toggle-view' }));

    expect(screen.getByText('Ops')).toBeInTheDocument();
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
  });
});
