import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
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
import { useApi } from "../../hooks/useApi";
import {
    fetchSlaPerformanceReport,
    notifyBreachedTicketAssignees,
} from "../../services/ReportService";
import { useSnackbar } from "../../context/SnackbarContext";
import { SlaPerformanceReportProps } from "../../types/reports";

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
    if (minutes < 60) {
        return `${formatNumber(minutes, 0)} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
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

const SlaPerformanceReport: React.FC = () => {
    const theme = useTheme();
    const { data, pending, apiHandler } = useApi<SlaPerformanceReportProps>();
    const { showMessage } = useSnackbar();
    const [notifying, setNotifying] = useState(false);

    const loadData = useCallback(() => {
        return apiHandler(() => fetchSlaPerformanceReport());
    }, [apiHandler]);

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

    const summaryMetrics = useMemo(() => {
        if (!data) {
            return [];
        }

        return [
            {
                label: "Tickets with SLA",
                value: formatNumber(data.totalTicketsWithSla),
            },
            {
                label: "On Track",
                value: formatNumber(data.totalOnTrackTickets),
            },
            {
                label: "Breached",
                value: formatNumber(data.totalBreachedTickets),
                highlight: true,
            },
            {
                label: "Resolved Within SLA",
                value: formatNumber(data.totalResolvedWithinSla),
            },
            {
                label: "Resolved After Breach",
                value: formatNumber(data.totalResolvedAfterBreach),
            },
            {
                label: "In Progress",
                value: formatNumber(data.totalInProgressTickets),
            },
        ];
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
        const categories = data.severityBreakdown?.map((item) => item.severity) ?? [];
        const onTrackSeries = data.severityBreakdown?.map(
            (item) => item.onTrack + item.resolvedWithinSla
        ) ?? [];
        const breachedSeries = data.severityBreakdown?.map(
            (item) => item.breached + item.resolvedAfterBreach
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
        const categories = data.breachTrend?.map((point) => point.date) ?? [];
        const dueSeries = data.breachTrend?.map((point) => point.dueCount) ?? [];
        const breachedSeries = data.breachTrend?.map((point) => point.breachedCount) ?? [];
        const resolvedSeries = data.breachTrend?.map((point) => point.resolvedCount) ?? [];

        return {
            tooltip: {
                trigger: "axis",
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
            xAxis: {
                type: "category",
                data: categories,
            },
            yAxis: {
                type: "value",
            },
            series: [
                {
                    name: "Due",
                    type: "line",
                    data: dueSeries,
                    smooth: true,
                },
                {
                    name: "Breached",
                    type: "line",
                    data: breachedSeries,
                    smooth: true,
                    itemStyle: {
                        color: theme.palette.error.main,
                    },
                },
                {
                    name: "Resolved",
                    type: "line",
                    data: resolvedSeries,
                    smooth: true,
                    itemStyle: {
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
                    <Grid container spacing={2}>
                        {summaryMetrics.map((metric) => (
                            <Grid item xs={12} sm={6} md={4} key={metric.label}>
                                <Paper
                                    elevation={metric.highlight ? 3 : 1}
                                    sx={{
                                        p: 2,
                                        borderLeft: metric.highlight
                                            ? `4px solid ${theme.palette.error.main}`
                                            : `4px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        {metric.label}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                                        {metric.value}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

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

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    SLA State Distribution
                                </Typography>
                                <ReactECharts option={statusPieOptions} style={{ height: 300 }} notMerge lazyUpdate />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    SLA by Severity
                                </Typography>
                                <ReactECharts option={severityBarOptions} style={{ height: 300 }} notMerge lazyUpdate />
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Breach & Resolution Trend
                        </Typography>
                        <ReactECharts option={trendLineOptions} style={{ height: 320 }} notMerge lazyUpdate />
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
                                {breachedTickets.map((ticket) => (
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
