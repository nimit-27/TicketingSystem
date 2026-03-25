import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import CustomMetricCard, { MetricCardData } from "../Dashboard/CustomMetricCard";
import { useApi } from "../../hooks/useApi";
import {
    fetchSlaPerformanceReport,
    notifyBreachedTicketAssignees,
} from "../../services/ReportService";
import { useSnackbar } from "../../context/SnackbarContext";
import { MISReportRequestParams, SlaPerformanceReportProps as SlaPerformanceReportPropsDto } from "../../types/reports";

const formatNumber = (value: number | undefined | null, fractionDigits = 0) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return "0";
    }

    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits,
    }).format(value);
};

const formatDuration = (minutes: number | undefined | null) => {
    if (!minutes || Number.isNaN(minutes) || minutes <= 0) {
        return "-";
    }
    const roundedMinutes = Math.floor(minutes);
    if (roundedMinutes < 60) {
        return `${roundedMinutes} mins`;
    }
    const hours = Math.floor(roundedMinutes / 60);
    const remaining = roundedMinutes % 60;
    if (remaining === 0) {
        return `${hours} hrs`;
    }
    return `${hours}h ${remaining}m`;
};

const formatDateTime = (value: string | null | undefined) => {
    if (!value) {
        return "-";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleString();
};

interface SlaPerformanceReportProps {
    params?: MISReportRequestParams;
}

const SlaPerformanceReport: React.FC<SlaPerformanceReportProps> = ({ params }) => {
    const theme = useTheme();
    const { data, pending, apiHandler } = useApi<SlaPerformanceReportPropsDto>();
    const { showMessage } = useSnackbar();
    const [notifying, setNotifying] = useState(false);

    const normalizedParams = useMemo(
        () => ({
            fromDate: params?.fromDate,
            toDate: params?.toDate,
            categoryId: params?.categoryId,
            subCategoryId: params?.subCategoryId,
            zoneCode: params?.zoneCode,
            regionCode: params?.regionCode,
            districtCode: params?.districtCode,
            issueTypeId: params?.issueTypeId,
            division: params?.division,
            assignedTo: params?.assignedTo,
            breachedFilter: params?.breachedFilter,
        }),
        [
            params?.assignedTo,
            params?.breachedFilter,
            params?.categoryId,
            params?.districtCode,
            params?.division,
            params?.fromDate,
            params?.issueTypeId,
            params?.regionCode,
            params?.scope,
            params?.subCategoryId,
            params?.toDate,
            params?.userId,
            params?.zoneCode,
        ],
        [params?.categoryId, params?.fromDate, params?.subCategoryId, params?.toDate],
    );

    const loadData = useCallback(() => {
        return apiHandler(() => fetchSlaPerformanceReport(normalizedParams));
    }, [apiHandler, normalizedParams]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleNotifyAssignees = useCallback(async () => {
        if (!data || data.totalBreachedTickets === 0) {
            showMessage("No breached tickets available for notification.", "info");
            return;
        }

        setNotifying(true);
        try {
            await notifyBreachedTicketAssignees();
            showMessage("Notification triggered for breached ticket assignees.", "success");
            await loadData();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.apiError?.message ||
                error?.message ||
                "Failed to trigger notifications.";
            showMessage(message, "error");
        } finally {
            setNotifying(false);
        }
    }, [data, loadData, showMessage]);

    const ticketHierarchyCardData = useMemo<MetricCardData | null>(() => {
        if (!data) {
            return null;
        }

        const breachedTotal =
            (data.breachedResolvedTickets ?? 0) + (data.breachedClosedTickets ?? 0) + (data.breachedInProgressTickets ?? 0);
        const notBreachedTotal =
            (data.notBreachedResolvedTickets ?? 0) + (data.notBreachedClosedTickets ?? 0) + (data.notBreachedInProgressTickets ?? 0);
        const total = breachedTotal + notBreachedTotal;

        return {
            title: { text: "Total Tickets" },
            metricValue: { text: String(total) },
            backgroundColor: "background.paper",
            children: [
                {
                    title: { text: "Breached" },
                    metricValue: { text: String(breachedTotal), textColor: "error.main" },
                    backgroundColor: "background.default",
                    children: [
                        { title: { text: "Resolved" }, metricValue: { text: String(data.breachedResolvedTickets ?? 0) }, backgroundColor: "background.paper" },
                        { title: { text: "Closed" }, metricValue: { text: String(data.breachedClosedTickets ?? 0) }, backgroundColor: "background.paper" },
                        { title: { text: "In Progress" }, metricValue: { text: String(data.breachedInProgressTickets ?? 0) }, backgroundColor: "background.paper" },
                    ],
                },
                {
                    title: { text: "Not Breached" },
                    metricValue: { text: String(notBreachedTotal), textColor: "success.main" },
                    backgroundColor: "background.default",
                    children: [
                        { title: { text: "Resolved" }, metricValue: { text: String(data.notBreachedResolvedTickets ?? 0) }, backgroundColor: "background.paper" },
                        { title: { text: "Closed" }, metricValue: { text: String(data.notBreachedClosedTickets ?? 0) }, backgroundColor: "background.paper" },
                        { title: { text: "In Progress" }, metricValue: { text: String(data.notBreachedInProgressTickets ?? 0) }, backgroundColor: "background.paper" },
                    ],
                },
            ],
        };
    }, [data]);

    const statusPieOptions = useMemo(() => {
        if (!data) {
            return {};
        }
        const pieSeries = [
            {
                name: "SLA State",
                value: data.totalOnTrackTickets,
                label: "On Track",
            },
            {
                name: "SLA State",
                value: data.inProgressBreachedTickets,
                label: "In Progress (Breached)",
            },
            {
                name: "SLA State",
                value: data.totalResolvedAfterBreach,
                label: "Resolved After Breach",
            },
            {
                name: "SLA State",
                value: data.totalResolvedWithinSla,
                label: "Resolved Within SLA",
            },
        ].filter((item) => item.value > 0);

        return {
            tooltip: {
                trigger: "item",
                formatter: "{b}: {c} ({d}%)",
            },
            legend: {
                orient: "horizontal",
                bottom: 0,
            },
            series: [
                {
                    type: "pie",
                    radius: ["40%", "70%"],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: theme.palette.background.paper,
                        borderWidth: 2,
                    },
                    label: {
                        show: false,
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 16,
                            fontWeight: "bold",
                        },
                    },
                    data: pieSeries.map((item) => ({
                        name: item.label,
                        value: item.value,
                    })),
                },
            ],
        };
    }, [data, theme.palette.background.paper]);

    const severityBarOptions = useMemo(() => {
        if (!data) {
            return {};
        }
        const categories = data.severityBreakdown?.map((item: any) => item.severity) ?? [];
        const onTrackSeries = data.severityBreakdown?.map(
            (item: any) => item.onTrack + item.resolvedWithinSla
        ) ?? [];
        const breachedSeries = data.severityBreakdown?.map(
            (item: any) => item.breached + item.resolvedAfterBreach
        ) ?? [];

        return {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
            },
            legend: {
                top: 0,
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            xAxis: [
                {
                    type: "category",
                    data: categories,
                    axisLabel: {
                        interval: 0,
                        rotate: categories.length > 4 ? 20 : 0,
                    },
                },
            ],
            yAxis: [
                {
                    type: "value",
                },
            ],
            series: [
                {
                    name: "On Track / Met",
                    type: "bar",
                    stack: "total",
                    emphasis: {
                        focus: "series",
                    },
                    itemStyle: {
                        color: theme.palette.success.main,
                    },
                    data: onTrackSeries,
                },
                {
                    name: "Breached",
                    type: "bar",
                    stack: "total",
                    emphasis: {
                        focus: "series",
                    },
                    itemStyle: {
                        color: theme.palette.error.main,
                    },
                    data: breachedSeries,
                },
            ],
        };
    }, [data, theme.palette.error.main, theme.palette.success.main]);

    const trendLineOptions = useMemo(() => {
        if (!data) {
            return {};
        }
        const categories = data.breachTrend?.map((point: any) => point.date) ?? [];
        const breachedSeries = data.breachTrend?.map((point: any) => point.breachedCount) ?? [];
        const resolvedSeries = data.breachTrend?.map((point: any) => point.resolvedCount) ?? [];

        return {
            tooltip: {
                trigger: "axis",
            },
            legend: {
                top: 0,
            },
            grid: {
                left: 36,
                right: 20,
                top: 40,
                bottom: 32,
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: categories,
                axisTick: { show: false },
            },
            yAxis: {
                type: "value",
            },
            series: [
                {
                    name: "Breached",
                    type: "line",
                    data: breachedSeries,
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 8,
                    lineStyle: {
                        color: theme.palette.error.main,
                        width: 2,
                    },
                    itemStyle: {
                        color: theme.palette.error.main,
                    },
                    areaStyle: {
                        opacity: 0.1,
                        color: theme.palette.error.main,
                    },
                },
                {
                    name: "Resolved",
                    type: "line",
                    data: resolvedSeries,
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 8,
                    lineStyle: {
                        color: theme.palette.info.main,
                        width: 2,
                    },
                    itemStyle: {
                        color: theme.palette.info.main,
                    },
                    areaStyle: {
                        opacity: 0.1,
                        color: theme.palette.info.main,
                    },
                },
            ],
        };
    }, [data, theme.palette.error.main, theme.palette.info.main]);

    const breachedTickets = useMemo(() => {
        if (!data?.breachedTickets) {
            return [];
        }
        return data.breachedTickets.slice(0, 8);
    }, [data]);

    const actionElement = (
        <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={handleNotifyAssignees}
            disabled={notifying || pending}
        >
            {notifying ? "Sending..." : "Notify Breached Assignees"}
        </Button>
    );

    return (
        <CustomFieldset title="SLA Performance Overview" variant="bordered" actionElement={actionElement}>
            {pending && (
                <Box display="flex" alignItems="center" gap={1} py={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading SLA performance...</Typography>
                </Box>
            )}

            {!pending && data && (
                <Box display="flex" flexDirection="column" gap={3}>
                    <Box sx={{ width: "100%" }}>
                        {ticketHierarchyCardData ? <CustomMetricCard {...ticketHierarchyCardData} /> : null}
                    </Box>

                    <Box display="flex" flexWrap="wrap" gap={3} alignItems="center">
                        <Chip
                            color={data.totalBreachedTickets > 0 ? "error" : "success"}
                            label={`Breach Rate: ${formatNumber(data.breachRate, 1)}%`}
                        />
                        <Chip
                            color="info"
                            label={`Average Breach: ${formatDuration(data.averageBreachMinutes)}`}
                        />
                        <Typography variant="body2" color="text.secondary">
                            In-progress tickets on track: {formatNumber(data.inProgressOnTrackTickets)} | Breached:
                            {" "}
                            {formatNumber(data.inProgressBreachedTickets)}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                            gap: 3,
                            width: "100%",
                        }}
                    >
                        <Box sx={{ width: "100%" }}>
                            <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    SLA State Distribution
                                </Typography>
                                <ReactECharts option={statusPieOptions} style={{ height: 300, width: "100%" }} notMerge lazyUpdate />
                            </Paper>
                        </Box>
                        <Box sx={{ width: "100%" }}>
                            <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    SLA by Severity
                                </Typography>
                                <ReactECharts option={severityBarOptions} style={{ height: 300, width: "100%" }} notMerge lazyUpdate />
                            </Paper>
                        </Box>
                    </Box>

                    <Paper elevation={1} sx={{ p: 2, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Breach & Resolution Trend
                        </Typography>
                        <ReactECharts option={trendLineOptions} style={{ height: 320, width: "100%", maxWidth: "100%" }} notMerge lazyUpdate />
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Top Breached Tickets
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Showing up to 8 most recent breached records
                            </Typography>
                        </Box>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ticket</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Assignee</TableCell>
                                    <TableCell>Severity</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Due At</TableCell>
                                    <TableCell align="right">Breached By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {breachedTickets.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Typography variant="body2" color="text.secondary">
                                                No breached tickets identified.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {breachedTickets.map((ticket: any) => (
                                    <TableRow key={`${ticket.ticketId}-${ticket.dueAt}`}>
                                        <TableCell>{ticket.ticketNumber ?? "-"}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {ticket.subject ?? "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{ticket.assignee ?? "-"}</TableCell>
                                        <TableCell>{ticket.severity ?? "-"}</TableCell>
                                        <TableCell>{ticket.status ?? "-"}</TableCell>
                                        <TableCell>{formatDateTime(ticket.dueAt)}</TableCell>
                                        <TableCell align="right">
                                            {formatDuration(ticket.breachedByMinutes ?? 0)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>
            )}

            {!pending && !data && (
                <Box py={2}>
                    <Typography variant="body2" color="text.secondary">
                        Unable to load SLA performance data.
                    </Typography>
                </Box>
            )}
        </CustomFieldset>
    );
};

export default SlaPerformanceReport;
