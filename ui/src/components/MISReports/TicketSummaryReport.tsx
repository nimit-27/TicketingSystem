import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchTicketSummaryReport } from "../../services/ReportService";
import { MISReportRequestParams } from "../../types/reports";
// import { TicketSummaryReport } from "../../types/reports";

interface TicketSummaryReportProps {
    params?: MISReportRequestParams;
}

const TicketSummaryReport: React.FC<TicketSummaryReportProps> = ({ params }) => {
    // const { data, pending, apiHandler } = useApi<TicketSummaryReport>();
    const { data, pending, apiHandler } = useApi<any>();

    const normalizedParams = useMemo(
        () => ({
            fromDate: params?.fromDate,
            toDate: params?.toDate,
            scope: params?.scope,
            userId: params?.userId,
        }),
        [params?.fromDate, params?.scope, params?.toDate, params?.userId],
    );

    useEffect(() => {
        apiHandler(() => fetchTicketSummaryReport(normalizedParams));
    }, [apiHandler, normalizedParams]);

    const statusChartOptions = useMemo(() => {
        const entries = Object.entries(data?.statusCounts ?? {});
        return {
            tooltip: {
                trigger: "item",
            },
            legend: {
                top: "bottom",
            },
            series: [
                {
                    name: "Status",
                    type: "pie",
                    radius: ["40%", "70%"],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: "#fff",
                        borderWidth: 2,
                    },
                    label: {
                        show: false,
                        position: "center",
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 16,
                            fontWeight: "bold",
                        },
                    },
                    labelLine: {
                        show: false,
                    },
                    data: entries.map(([name, value]) => ({ name, value })),
                },
            ],
        };
    }, [data]);

    const modeChartOptions = useMemo(() => {
        const entries = Object.entries(data?.modeCounts ?? {});
        return {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
            },
            xAxis: {
                type: "category",
                data: entries.map(([name]) => name),
            },
            yAxis: {
                type: "value",
            },
            series: [
                {
                    name: "Tickets",
                    type: "bar",
                    data: entries.map(([, value]) => value),
                    itemStyle: {
                        color: "#1976d2",
                    },
                },
            ],
        };
    }, [data]);

    return (
        <CustomFieldset title="Ticket Summary Report" variant="bordered">
            {pending && (
                <Typography variant="body2" fontStyle="italic">
                    Loading ticket summary...
                </Typography>
            )}

            {!pending && data && (
                <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexWrap="wrap" gap={4}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Tickets
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.totalTickets}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Open Tickets
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.openTickets}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Closed Tickets
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.closedTickets}
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" flexWrap="wrap" gap={4}>
                        <Box flex={1} minWidth={280}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Ticket Status Distribution
                            </Typography>
                            <ReactECharts option={statusChartOptions} style={{ height: 280 }} />
                        </Box>
                        <Box flex={1} minWidth={280}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Mode of Receipt
                            </Typography>
                            <ReactECharts option={modeChartOptions} style={{ height: 280 }} />
                        </Box>
                    </Box>
                </Box>
            )}
        </CustomFieldset>
    );
};

export default TicketSummaryReport;
