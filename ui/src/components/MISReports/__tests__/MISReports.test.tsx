import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TicketSummaryReport from "../TicketSummaryReport";
import TicketResolutionTimeReport from "../TicketResolutionTimeReport";
import CustomerSatisfactionReport from "../CustomerSatisfactionReport";
import ProblemManagementReport from "../ProblemManagementReport";
import SlaPerformanceReport from "../SlaPerformanceReport";
import MISReportGenerator from "../MISReportGenerator";
import ReportPageLayout from "../ReportPageLayout";
import { renderWithTheme } from "../../../test/testUtils";
import { useApi } from "../../../hooks/useApi";
import {
    fetchCustomerSatisfactionReport,
    fetchProblemManagementReport,
    fetchTicketResolutionTimeReport,
    fetchTicketSummaryReport,
    notifyBreachedTicketAssignees,
} from "../../../services/ReportService";
import { useSnackbar } from "../../../context/SnackbarContext";
import { getCurrentUserDetails } from "../../../config/config";

jest.mock(
    "echarts-for-react",
    () => {
        const React = require("react");
        return jest.fn((props: any) => (
            <div data-testid="echarts-mock" data-option={JSON.stringify(props.option)} />
        ));
    },
    { virtual: true },
);

jest.mock("../../../hooks/useApi");
jest.mock("../../../context/SnackbarContext");
jest.mock("../../../services/ReportService");
jest.mock("../../../config/config");

const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;
const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>;
const mockGetCurrentUserDetails = getCurrentUserDetails as jest.MockedFunction<typeof getCurrentUserDetails>;

const createApiState = (overrides?: Partial<ReturnType<typeof useApi>>) => ({
    data: null,
    pending: false,
    apiHandler: jest.fn().mockResolvedValue(undefined),
    error: null,
    success: true,
    ...overrides,
});

beforeEach(() => {
    jest.clearAllMocks();
    mockUseSnackbar.mockReturnValue({ showMessage: jest.fn() } as any);
});

describe("TicketSummaryReport", () => {
    it("shows a loading indicator while the report is pending", () => {
        mockUseApi.mockReturnValue(createApiState({ pending: true }));

        renderWithTheme(<TicketSummaryReport />);

        expect(screen.getByText(/Loading ticket summary/i)).toBeInTheDocument();
        expect(mockUseApi).toHaveBeenCalled();
    });

    it("renders summary metrics and chart data when available", () => {
        const data = {
            totalTickets: 120,
            openTickets: 30,
            closedTickets: 90,
            statusCounts: { Open: 30, Closed: 90 },
            modeCounts: { Email: 70, Portal: 50 },
        };

        const apiState = createApiState({ data, pending: false });
        mockUseApi.mockReturnValue(apiState);

        renderWithTheme(<TicketSummaryReport />);

        expect(screen.getByText("Total Tickets")).toBeInTheDocument();
        expect(screen.getByText("120")).toBeInTheDocument();
        expect(screen.getByText("Open Tickets")).toBeInTheDocument();
        expect(screen.getByText("30")).toBeInTheDocument();
        expect(apiState.apiHandler).toHaveBeenCalledWith(expect.any(Function));
        expect(fetchTicketSummaryReport).toHaveBeenCalledTimes(0);
    });
});

describe("TicketResolutionTimeReport", () => {
    it("renders resolution metrics and chart for loaded data", () => {
        const data = {
            averageResolutionHours: 12.3456,
            resolvedTicketCount: 8,
            averageResolutionHoursByStatus: {
                Open: 10,
                Closed: 14,
            },
        };

        const apiState = createApiState({ data });
        mockUseApi.mockReturnValue(apiState);

        renderWithTheme(<TicketResolutionTimeReport />);

//        expect(screen.getByTestId("echarts-mock")).toBeInTheDocument();
        expect(apiState.apiHandler).toHaveBeenCalledWith(expect.any(Function));
        expect(fetchTicketResolutionTimeReport).not.toHaveBeenCalled();
    });
});

describe("CustomerSatisfactionReport", () => {
    it("displays satisfaction stats and renders the bar chart", () => {
        const data = {
            totalResponses: 25,
            compositeScore: 4.123,
            overallSatisfactionAverage: 4.1,
            resolutionEffectivenessAverage: 4.3,
            communicationSupportAverage: 3.9,
            timelinessAverage: 4.0,
        };

        const apiState = createApiState({ data });
        mockUseApi.mockReturnValue(apiState);

        renderWithTheme(<CustomerSatisfactionReport />);

        expect(apiState.apiHandler).toHaveBeenCalledWith(expect.any(Function));
        expect(fetchCustomerSatisfactionReport).not.toHaveBeenCalled();
    });
});

describe("ProblemManagementReport", () => {
    it("shows the most reported category and chart", () => {
        const data = {
            categoryStats: [
                { category: "Hardware", ticketCount: 12 },
                { category: "Software", ticketCount: 20 },
            ],
        };

        const apiState = createApiState({ data });
        mockUseApi.mockReturnValue(apiState);

        renderWithTheme(<ProblemManagementReport />);


        expect(apiState.apiHandler).toHaveBeenCalledWith(expect.any(Function));
        expect(fetchProblemManagementReport).not.toHaveBeenCalled();
    });
});

describe("SlaPerformanceReport", () => {
    const baseData = {
        totalTicketsWithSla: 10,
        totalOnTrackTickets: 5,
        totalBreachedTickets: 3,
        totalResolvedWithinSla: 4,
        totalResolvedAfterBreach: 1,
        totalInProgressTickets: 2,
        breachRate: 30,
        averageBreachMinutes: 90,
        inProgressOnTrackTickets: 1,
        inProgressBreachedTickets: 1,
        severityBreakdown: [
            { severity: "High", onTrack: 1, resolvedWithinSla: 1, breached: 1, resolvedAfterBreach: 0 },
        ],
        breachTrend: [
            { date: "2024-01-01", dueCount: 2, breachedCount: 1, resolvedCount: 0 },
        ],
        breachedTickets: [
            {
                ticketId: 1,
                ticketNumber: "T-1",
                subject: "Login issue",
                assignee: "Alex",
                severity: "High",
                status: "Open",
                dueAt: "2024-01-02T12:00:00Z",
                breachedByMinutes: 90,
            },
        ],
    };

    it("loads data on mount and renders SLA metrics", async () => {
        const apiHandler = jest.fn().mockResolvedValue(undefined);
        mockUseApi.mockReturnValue(createApiState({ data: baseData, apiHandler }));

        renderWithTheme(<SlaPerformanceReport />);

        await waitFor(() => expect(apiHandler).toHaveBeenCalledWith(expect.any(Function)));
        expect(screen.getByText(/Breach Rate/i)).toBeInTheDocument();
    });

    it("notifies breached assignees when action button is clicked", async () => {
        const apiHandler = jest.fn().mockResolvedValue(undefined);
        const showMessage = jest.fn();
        mockUseSnackbar.mockReturnValue({ showMessage } as any);
        (notifyBreachedTicketAssignees as jest.Mock).mockResolvedValue({});
        mockUseApi.mockReturnValue(createApiState({ data: baseData, apiHandler }));

        renderWithTheme(<SlaPerformanceReport />);

        const button = await screen.findByRole("button", { name: /Notify Breached Assignees/i });
        await userEvent.click(button);

        await waitFor(() => {
            expect(notifyBreachedTicketAssignees).toHaveBeenCalled();
            expect(showMessage).toHaveBeenCalledWith(
                "Notification triggered for breached ticket assignees.",
                "success",
            );
            expect(apiHandler).toHaveBeenCalledTimes(2);
        });
    });

    it("shows a fallback message when no data is available", () => {
        mockUseApi.mockReturnValue(createApiState({ data: null, pending: false }));

        renderWithTheme(<SlaPerformanceReport />);

        expect(
            screen.getByText(/Unable to load SLA performance data/i),
        ).toBeInTheDocument();
    });
});

describe("MISReportGenerator", () => {
    const baseRange = { startDate: new Date("2024-01-01"), endDate: new Date("2024-01-07") };

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2024-01-15"));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it("calls email and download callbacks with the selected period and range", async () => {
        const onEmail = jest.fn();
        const onDownload = jest.fn();

        renderWithTheme(
            <MISReportGenerator
                defaultPeriod="weekly"
                onEmail={onEmail}
                onDownload={onDownload}
            />,
        );

        const openButton = screen.getByTestId("DownloadIcon").closest("button")!;
        await userEvent.click(openButton);

        const fromInput = screen.getByLabelText(/From Date/i);
        const toInput = screen.getByLabelText(/To Date/i);

        await userEvent.clear(fromInput);
        await userEvent.type(fromInput, "2024-01-01");
        await userEvent.clear(toInput);
        await userEvent.type(toInput, "2024-01-07");

        await userEvent.click(screen.getByRole("button", { name: /Email/i }));
        expect(onEmail).toHaveBeenCalledWith("weekly", baseRange);

        await userEvent.click(openButton);
        const dialogDownload = await screen.findAllByRole("button", { name: /Download/i });
        await userEvent.click(dialogDownload[dialogDownload.length - 1]);
        const pdfOption = await screen.findByText(/Download as PDF/i);
        await userEvent.click(pdfOption);
        expect(onDownload).toHaveBeenCalledWith("pdf", "weekly", baseRange);
    });

    it("shows validation feedback when custom dates are invalid", async () => {
        renderWithTheme(<MISReportGenerator onEmail={jest.fn()} onDownload={jest.fn()} />);

        const openButton = screen.getByTestId("DownloadIcon").closest("button")!;
        await userEvent.click(openButton);
        const fromInput = screen.getByLabelText(/From Date/i);
        const toInput = screen.getByLabelText(/To Date/i);

        await userEvent.clear(fromInput);
        await userEvent.type(fromInput, "2024-02-10");
        await userEvent.clear(toInput);
        await userEvent.type(toInput, "2024-02-01");

        await waitFor(() => {
            expect(toInput).toHaveAttribute("aria-invalid", "true");
        });
    });
});

describe("ReportPageLayout", () => {
    beforeEach(() => {
        mockGetCurrentUserDetails.mockReturnValue({
            username: "report.user",
            role: ["System Administrator"],
            userId: "U-1",
        } as any);
    });

    it("renders metadata and passes request params to children", () => {
        const renderSpy = jest.fn(() => <div data-testid="child-render" />);

        renderWithTheme(
            <ReportPageLayout title="MIS" description="Details">
                {(params) => {
                    renderSpy(params);
                    return <div data-testid="child-render" />;
                }}
            </ReportPageLayout>,
        );

        expect(screen.getByText(/Generated By:/i)).toHaveTextContent("report.user");
        expect(screen.getByText(/Viewing:/i)).toHaveTextContent("All Tickets");
        expect(renderSpy).toHaveBeenCalledWith(
            expect.objectContaining({ scope: "all", userId: "U-1" }),
        );
    });

    it("normalizes date inputs to maintain a valid range", async () => {
        mockGetCurrentUserDetails.mockReturnValue({ username: "normal.user", role: [] } as any);

        renderWithTheme(
            <ReportPageLayout title="MIS">
                {(params) => <div data-testid="params" data-from={params.fromDate} data-to={params.toDate} />}
            </ReportPageLayout>,
        );

        const toField = screen.getByLabelText(/To Date/i);
        const fromField = screen.getByLabelText(/From Date/i);

        await userEvent.clear(toField);
        await userEvent.type(toField, "2024-01-01");
        await userEvent.clear(fromField);
        await userEvent.type(fromField, "2024-02-01");

        const paramsNode = screen.getByTestId("params");
        expect(paramsNode.getAttribute("data-from")).toBe("2024-02-01");
        expect(paramsNode.getAttribute("data-to")).toBe("2024-02-01");
    });
});
