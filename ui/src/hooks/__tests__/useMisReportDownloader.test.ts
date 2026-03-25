import { act, renderHook, waitFor } from '@testing-library/react';
const mockPdfSave = jest.fn();
const mockPdfText = jest.fn();
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    text: (...args: any[]) => mockPdfText(...args),
    setFontSize: jest.fn(),
    save: (...args: any[]) => mockPdfSave(...args),
    lastAutoTable: { finalY: 40 },
  })),
}), { virtual: true });
jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}), { virtual: true });

jest.mock('xlsx', () => {
  const mock = {
    utils: {
      book_new: jest.fn(() => ({})),
      aoa_to_sheet: jest.fn(() => ({ '!ref': 'A1:B2' })),
      book_append_sheet: jest.fn(),
    },
    writeFile: jest.fn(),
  };
  return { __esModule: true, default: mock, ...mock };
}, { virtual: true });

import { useMisReportDownloader } from '../useMisReportDownloader';
import {
  fetchCustomerSatisfactionReport,
  fetchProblemManagementReport,
  fetchTicketResolutionTimeReport,
  fetchTicketSummaryReport,
} from '../../services/ReportService';
import { useSnackbar } from '../../context/SnackbarContext';
import { getCurrentUserDetails } from '../../config/config';
import { extractApiPayload } from '../../utils/misReports';
import * as XLSX from 'xlsx';

jest.mock('../../services/ReportService');
jest.mock('../../context/SnackbarContext');
jest.mock('../../config/config');
jest.mock('../../utils/misReports', () => {
  const actual = jest.requireActual('../../utils/misReports');
  return {
    ...actual,
    extractApiPayload: jest.fn(),
    calculateColumnWidths: jest.fn(() => [{ wch: 12 }]),
    applyThinBorders: jest.fn(),
    formatDateInput: jest.fn(() => '2025-01-31'),
  };
});

describe('useMisReportDownloader', () => {
  const showMessage = jest.fn();
  const mockRequestParams = {
    fromDate: '2025-01-01',
    toDate: '2025-01-31',
    scope: 'all' as const,
    userId: 'u-1',
  };
  const sampleRange = {
    startDate: new Date('2025-01-01T00:00:00Z'),
    endDate: new Date('2025-01-31T00:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSnackbar as jest.Mock).mockReturnValue({ showMessage });
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ username: 'qa.user', userId: 'u-1' });
    (extractApiPayload as jest.Mock).mockImplementation((response) => response);
    (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
    (XLSX.utils.aoa_to_sheet as jest.Mock).mockImplementation(() => ({ '!ref': 'A1:B2' }));
    (XLSX.utils.book_append_sheet as jest.Mock).mockImplementation(() => undefined);
    (XLSX.writeFile as jest.Mock).mockImplementation(() => undefined);
  });

  it('downloads excel successfully and builds workbook sheets', async () => {
    (fetchTicketSummaryReport as jest.Mock).mockResolvedValue({
      totalTickets: 10,
      openTickets: 4,
      closedTickets: 6,
      statusCounts: { Escalated: 2 },
      modeCounts: { Email: 5 },
    });
    (fetchTicketResolutionTimeReport as jest.Mock).mockResolvedValue({
      categoryStats: [{ categoryName: 'Infra', subcategoryName: 'Network', averageResolutionTime: 11, medianResolutionTime: 9, closedTickets: 3 }],
      categoryPriorityStats: [{ categoryName: 'Infra', priority: 'P1', averageResolutionTime: 8, medianResolutionTime: 7, closedTickets: 2 }],
      priorityStats: [{ priority: 'P2', averageResolutionTime: 15, medianResolutionTime: 13, closedTickets: 1 }],
    });
    (fetchCustomerSatisfactionReport as jest.Mock).mockResolvedValue({
      overallStats: [{ any: true }],
      totalResponses: 9,
      averageRating: 4.6,
      positivePercentage: 88,
      categoryStats: [{ categoryName: 'Infra', subcategoryName: 'Network', averageRating: 4.5, responses: 3 }],
      ticketStats: [{ ticketNumber: 'T-1', rating: 5, feedback: 'Good', ratingCounts: { '1': 0, '2': 0, '3': 0, '4': 1, '5': 3 }, totalResponses: 4 }],
    });
    (fetchProblemManagementReport as jest.Mock).mockResolvedValue({
      categoryStats: [{ category: 'Legacy Cat', subcategory: 'Legacy Sub', ticketCount: 5 }],
    });

    const { result } = renderHook(() => useMisReportDownloader(mockRequestParams));

    await act(async () => {
      await result.current.handleDownload('excel', 'monthly', sampleRange);
    });

    expect(fetchTicketSummaryReport).toHaveBeenCalledWith(mockRequestParams);
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(4);
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), expect.stringContaining('mis-reports-monthly-2025-01-31.xlsx'));
    expect(showMessage).toHaveBeenCalledWith('MIS reports downloaded successfully.', 'success');
    expect(result.current.downloading).toBe(false);
  });

  it('downloads pdf successfully', async () => {
    (fetchTicketSummaryReport as jest.Mock).mockResolvedValue({ totalTickets: 1, openTickets: 1, closedTickets: 0, statusCounts: {}, modeCounts: {} });
    (fetchTicketResolutionTimeReport as jest.Mock).mockResolvedValue({ averageResolutionHours: 2, resolvedTicketCount: 1, categoryStats: [] });
    (fetchCustomerSatisfactionReport as jest.Mock).mockResolvedValue({ totalResponses: 1, overallSatisfactionAverage: 4, resolutionEffectivenessAverage: 4, communicationSupportAverage: 4, timelinessAverage: 4, compositeScore: 4, categoryStats: [] });
    (fetchProblemManagementReport as jest.Mock).mockResolvedValue({ categoryStats: [] });

    const { result } = renderHook(() => useMisReportDownloader(mockRequestParams));

    await act(async () => {
      await result.current.handleDownload('pdf', 'daily', sampleRange);
    });

    expect(fetchTicketSummaryReport).toHaveBeenCalledWith(mockRequestParams);
    expect(showMessage).toHaveBeenCalledWith('MIS reports downloaded successfully.', 'success');
  });

  it('shows an error when any report payload is missing', async () => {
    (fetchTicketSummaryReport as jest.Mock).mockResolvedValue(null);
    (fetchTicketResolutionTimeReport as jest.Mock).mockResolvedValue({});
    (fetchCustomerSatisfactionReport as jest.Mock).mockResolvedValue({});
    (fetchProblemManagementReport as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useMisReportDownloader({ ...mockRequestParams, fromDate: undefined, toDate: undefined }));

    await act(async () => {
      await result.current.handleDownload('excel', 'weekly', sampleRange);
    });

    expect(showMessage).toHaveBeenCalledWith('Incomplete data received for MIS reports.', 'error');
    expect(XLSX.writeFile).not.toHaveBeenCalled();
    expect(result.current.downloading).toBe(false);
  });

  it('shows a fallback error message for non-Error rejection', async () => {
    (fetchTicketSummaryReport as jest.Mock).mockRejectedValue('boom');
    (fetchTicketResolutionTimeReport as jest.Mock).mockResolvedValue({});
    (fetchCustomerSatisfactionReport as jest.Mock).mockResolvedValue({});
    (fetchProblemManagementReport as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useMisReportDownloader(mockRequestParams));

    await act(async () => {
      await result.current.handleDownload('excel', 'daily', sampleRange);
    });

    await waitFor(() => {
      expect(showMessage).toHaveBeenCalledWith('Failed to download MIS reports.', 'error');
    });
  });

  it('notifies that report will be emailed', () => {
    const { result } = renderHook(() => useMisReportDownloader(mockRequestParams));

    act(() => {
      result.current.handleEmail('half-yearly', sampleRange);
    });

    expect(showMessage).toHaveBeenCalledWith(expect.stringContaining('Half-Yearly report for'), 'success');
  });
});
