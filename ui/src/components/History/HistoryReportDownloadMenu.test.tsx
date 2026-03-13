import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockJsonToSheet = jest.fn();
const mockBookNew = jest.fn();
const mockBookAppendSheet = jest.fn();
const mockWriteFile = jest.fn();
const mockAutoTable = jest.fn();
const mockSetFontSize = jest.fn();
const mockText = jest.fn();
const mockSave = jest.fn();

jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: (...args: unknown[]) => mockJsonToSheet(...args),
    book_new: (...args: unknown[]) => mockBookNew(...args),
    book_append_sheet: (...args: unknown[]) => mockBookAppendSheet(...args),
  },
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}), { virtual: true });

jest.mock('jspdf-autotable', () => (...args: unknown[]) => mockAutoTable(...args), { virtual: true });

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    setFontSize: (...args: unknown[]) => mockSetFontSize(...args),
    text: (...args: unknown[]) => mockText(...args),
    save: (...args: unknown[]) => mockSave(...args),
  })),
}), { virtual: true });

import HistoryReportDownloadMenu, { HistoryReportColumn } from './HistoryReportDownloadMenu';

type ReportRow = {
  id: number;
  name: string;
};

const columns: HistoryReportColumn<ReportRow>[] = [
  { key: 'id', header: 'ID', getValue: (row) => String(row.id) },
  { key: 'name', header: 'Name', getValue: (row) => row.name },
];

const rows: ReportRow[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

describe('HistoryReportDownloadMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJsonToSheet.mockReturnValue({});
    mockBookNew.mockReturnValue({ workbook: true });
  });

  it('toggles the dropdown menu visibility', () => {
    const { container } = renderWithTheme(
      <HistoryReportDownloadMenu title="History Report" fileBaseName="history_report" rows={rows} columns={columns} />,
    );

    const menu = container.querySelector('.dropdown-menu');
    expect(menu).not.toHaveClass('show');

    fireEvent.click(screen.getByLabelText('Download Report'));
    expect(menu).toHaveClass('show');

    fireEvent.click(screen.getByLabelText('Download Report'));
    expect(menu).not.toHaveClass('show');
  });

  it('downloads excel report with transformed rows and closes menu', () => {
    const { container } = renderWithTheme(
      <HistoryReportDownloadMenu title="History Report" fileBaseName="history_report" rows={rows} columns={columns} />,
    );

    fireEvent.click(screen.getByLabelText('Download Report'));
    fireEvent.click(screen.getByRole('button', { name: 'Download Excel' }));

    expect(mockJsonToSheet).toHaveBeenCalledWith([{ ID: '1', Name: 'Alice' }, { ID: '2', Name: 'Bob' }]);
    expect(mockBookAppendSheet).toHaveBeenCalledWith({ workbook: true }, {}, 'History Report');
    expect(mockWriteFile).toHaveBeenCalledWith({ workbook: true }, 'history_report.xlsx');
    expect(container.querySelector('.dropdown-menu')).not.toHaveClass('show');
  });

  it('downloads pdf report with table data and closes menu', () => {
    const { container } = renderWithTheme(
      <HistoryReportDownloadMenu title="History Report" fileBaseName="history_report" rows={rows} columns={columns} />,
    );

    fireEvent.click(screen.getByLabelText('Download Report'));
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));

    expect(mockSetFontSize).toHaveBeenCalledWith(12);
    expect(mockText).toHaveBeenCalledWith('History Report', 14, 14);
    expect(mockAutoTable).toHaveBeenCalledWith(expect.any(Object), {
      startY: 20,
      head: [['ID', 'Name']],
      body: [['1', 'Alice'], ['2', 'Bob']],
    });
    expect(mockSave).toHaveBeenCalledWith('history_report.pdf');
    expect(container.querySelector('.dropdown-menu')).not.toHaveClass('show');
  });
});
