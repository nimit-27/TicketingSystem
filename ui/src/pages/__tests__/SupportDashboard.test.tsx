import React from "react";
import { fireEvent, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../test/testUtils";

import SupportDashboard from "../SupportDashboard";

const mockApiHandler = jest.fn((fn: () => Promise<any>) => fn());
const mockUseApi = jest.fn();

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

jest.mock("recharts", () => {
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
});

describe("SupportDashboard", () => {
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
  });

  it("requests dashboard data on mount with default filters", async () => {
    renderWithTheme(<SupportDashboard />);

    await waitFor(() => expect(mockApiHandler).toHaveBeenCalled());
    expect(mockFetchSupportDashboardSummary).toHaveBeenCalledWith({
      timeScale: "DAILY",
      timeRange: "LAST_7_DAYS",
    });
  });

  it("renders summary metrics from the API response", () => {
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

    const { getByText } = renderWithTheme(<SupportDashboard />);

    expect(getByText("supportDashboard.metrics.overallTickets")).toBeInTheDocument();
    expect(getByText("9")).toBeInTheDocument();
    expect(getByText("Critical")).toBeInTheDocument();
    expect(getByText("01")).toBeInTheDocument();
  });

  it("shows an error message when custom month range is invalid", async () => {
    const { getByLabelText, findByText, getByText } = renderWithTheme(<SupportDashboard />);

    // fireEvent.change(getByLabelText("supportDashboard.filters.interval.label"), {
    //   target: { value: "MONTHLY" },
    // });
    fireEvent.click(getByText("MONTHLY"));

    fireEvent.change(getByLabelText("supportDashboard.filters.range.label"), {
      target: { value: "CUSTOM_MONTH_RANGE" },
    });

    fireEvent.change(getByLabelText("supportDashboard.filters.range.startYear"), {
      target: { value: "" },
    });

    expect(await findByText("supportDashboard.filters.range.customRangeError")).toBeInTheDocument();
    expect(mockFetchSupportDashboardSummary).toHaveBeenCalled();
  });
});
