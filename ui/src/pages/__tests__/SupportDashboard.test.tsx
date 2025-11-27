import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../test/testUtils";

import SupportDashboard from "../SupportDashboard";
import { getUserDetails } from "../../utils/Utils";

const mockApiHandler = jest.fn((fn: () => Promise<any>) => fn());
const mockUseApi = jest.fn();
const mockGetUserDetails = getUserDetails as jest.Mock;

jest.mock("../../hooks/useApi", () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

const mockFetchSupportDashboardSummary = jest.fn(() => Promise.resolve({}));

jest.mock("../../services/ReportService", () => ({
  fetchSupportDashboardSummary: (...args: unknown[]) => mockFetchSupportDashboardSummary.apply(null, args),
}));

jest.mock("../../utils/permissions", () => ({
  checkSidebarAccess: jest.fn(() => true),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../utils/Utils", () => ({
  getUserDetails: jest.fn(() => ({ role: [] })),
}));

jest.mock(
  "recharts",
  () => {
    const Chart: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
    return {
      ResponsiveContainer: Chart,
      PieChart: Chart,
      Pie: Chart,
      Cell: Chart,
      Legend: Chart,
      Tooltip: Chart,
      BarChart: Chart,
      XAxis: Chart,
      YAxis: Chart,
      CartesianGrid: Chart,
      Bar: Chart,
      LineChart: Chart,
      Line: Chart,
    };
  },
  { virtual: true },
);

describe("SupportDashboard", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2024-01-08T00:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReturnValue({
      data: null,
      pending: false,
      error: null,
      success: false,
      apiHandler: mockApiHandler,
    });
    mockApiHandler.mockImplementation((fn: () => Promise<any>) => fn());
    mockGetUserDetails.mockReturnValue({ role: [] });
  });

  it("requests dashboard data on mount with default filters", async () => {
    renderWithTheme(<SupportDashboard />);

    await waitFor(() => expect(mockApiHandler).toHaveBeenCalled());
    expect(mockFetchSupportDashboardSummary).toHaveBeenCalledWith({
      timeScale: "DAILY",
      timeRange: "LAST_7_DAYS",
      fromDate: "2024-01-02",
      toDate: "2024-01-08",
    });
  });

  it("renders summary metrics from the API response", async () => {
    const summaryResponse = {
      allTickets: {
        pendingForAcknowledgement: 2,
        severityCounts: { S1: 1, S2: 3, S3: 0, S4: 0 },
        totalTickets: 9,
      },
      myWorkload: null,
    };

    mockUseApi.mockReturnValue({
      data: summaryResponse,
      pending: false,
      error: null,
      success: true,
      apiHandler: mockApiHandler,
    });

    const { findByText } = renderWithTheme(<SupportDashboard />);

    expect(await findByText("supportDashboard.metrics.overallTickets")).toBeInTheDocument();
    expect(await findByText("9")).toBeInTheDocument();
    expect(await findByText("Critical")).toBeInTheDocument();
    expect(await findByText("01")).toBeInTheDocument();
  });

  it("shows an error message when custom month range is invalid", async () => {
    renderWithTheme(<SupportDashboard initialTimeScale="MONTHLY" initialTimeRange="CUSTOM_MONTH_RANGE" />);

    fireEvent.change(await screen.findByLabelText("supportDashboard.filters.range.startYear"), {
      target: { value: "" },
    });

    expect(await screen.findByText("supportDashboard.filters.range.customRangeError")).toBeInTheDocument();
    expect(mockFetchSupportDashboardSummary).toHaveBeenCalled();
  });
});
