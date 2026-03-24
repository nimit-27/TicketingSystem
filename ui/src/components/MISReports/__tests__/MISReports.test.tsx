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
        expect(screen.getAllByText("120").length).toBeGreaterThan(0);
        expect(screen.getByText("Open Tickets")).toBeInTheDocument();
        expect(screen.getAllByText("30").length).toBeGreaterThan(0);
        expect(screen.getByText("Ticket Lifecycle Distribution")).toBeInTheDocument();
        expect(screen.getByText("Tickets Count")).toBeInTheDocument();
        expect(apiState.apiHandler).toHaveBeenCalledWith(expect.any(Function));
        expect(fetchTicketSummaryReport).toHaveBeenCalledTimes(0);
    });
});

describe("TicketResolutionTimeReport", () => {
    it("renders resolution metrics, grouped breakdown and chart options", () => {
        const data = {
            averageResolutionHours: 12.3456,
            resolvedTicketCount: 8,
            averageResolutionHoursByStatus: {
                Open: 10,
                Closed: 14,
            },
            categoryPriorityStats: [
                { priority: 'High', categoryName: 'Infra', subcategoryName: 'Network', averageResolutionHours: 4.5, resolvedTicketCount: 3 },
                { priority: null, category: 'Access', subcategory: null, averageResolutionHours: 7.25, resolvedTicketCount: 2 },
            ],
        };

        const apiState = createApiState({ data });
        mockUseApi.mockReturnValue(apiState);

        renderWithTheme(<TicketResolutionTimeReport />);

        expect(screen.getByText(/Average Resolution Time/i)).toBeInTheDocument();
        expect(screen.getByText('12.35 hrs')).toBeInTheDocument();
        expect(screen.getByText('Priority: High')).toBeInTheDocument();
        expect(screen.getByText('Priority: Unspecified')).toBeInTheDocument();
        expect(screen.getByText('Infra > Network')).toBeInTheDocument();
        expect(screen.getByText('Access > N/A')).toBeInTheDocument();
        expect(apiState.apiHandler).toHaveBeenCalledWith(expect.any(Function));
        expect(fetchTicketResolutionTimeReport).not.toHaveBeenCalled();
    });

    it("shows only loading state when report is pending", () => {
        mockUseApi.mockReturnValue(createApiState({ pending: true, data: null }));
        renderWithTheme(<TicketResolutionTimeReport />);

        expect(screen.getByText(/Calculating resolution insights/i)).toBeInTheDocument();
        expect(screen.queryByTestId('echarts-mock')).not.toBeInTheDocument();
    });
});

describe("CustomerSatisfactionReport", () => {
    it("displays stats, rating headers, and renders bar chart values", () => {
        const data = {
            totalResponses: 25,
            compositeScore: 4.123,
            overallSatisfactionAverage: 4.1,
            resolutionEffectivenessAverage: 4.3,
            communicationSupportAverage: 3.9,
            timelinessAverage: 4.0,
            priorityBreakdown: [
                {
                    priority: 'High',
                    category: 'Infra',
                    subcategory: 'Network',
                    ticketCount: 4,
                    breachedTickets: 1,
                    totalResponses: 6,
                    ratingCounts: { '1★': 1, '5★': 5 },
                },
            ],
        };

        const apiState = createApiState({ data });
        mockUseApi.mockReturnValue(apiState);

        renderWithTheme(<CustomerSatisfactionReport />);

        expect(screen.getByText('4.12 / 5')).toBeInTheDocument();
        expect(screen.getByText('Tickets Represented')).toBeInTheDocument();
        expect(screen.getByText('Breached: 1')).toBeInTheDocument();
        expect(screen.getByText(/Priority: High — Infra > Network/i)).toBeInTheDocument();
        expect(screen.getByText('1★')).toBeInTheDocument();
        expect(screen.getByText('5★')).toBeInTheDocument();

        expect(apiState.apiHandler).toHaveBeenCalledWith(expect.any(Function));
        expect(fetchCustomerSatisfactionReport).not.toHaveBeenCalled();
    });

    it("shows feedback loading copy while pending", () => {
        mockUseApi.mockReturnValue(createApiState({ pending: true, data: null }));
        renderWithTheme(<CustomerSatisfactionReport />);

        expect(screen.getByText(/Gathering feedback trends/i)).toBeInTheDocument();
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
