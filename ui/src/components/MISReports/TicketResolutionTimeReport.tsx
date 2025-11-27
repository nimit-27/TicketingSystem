import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchTicketResolutionTimeReport } from "../../services/ReportService";
import { MISReportRequestParams } from "../../types/reports";
import { TicketResolutionTimeReportProps } from "../../types/reports";

interface TicketResolutionTimeReportProps {
    params?: MISReportRequestParams;
}

const TicketResolutionTimeReport: React.FC<TicketResolutionTimeReportProps> = ({ params }) => {
    // const { data, pending, apiHandler } = useApi<TicketResolutionTimeReportProps>();
    const { data, pending, apiHandler } = useApi<any>();

    useEffect(() => {
        apiHandler(() =>
            fetchTicketResolutionTimeReport({
                fromDate: params?.fromDate,
                toDate: params?.toDate,
                scope: params?.scope,
                userId: params?.userId,
            }),
        );
    }, [apiHandler, params?.fromDate, params?.scope, params?.toDate, params?.userId]);

    const chartOptions = useMemo(() => {
        const entries = Object.entries(data?.averageResolutionHoursByStatus ?? {});
        return {
            tooltip: {
                trigger: "axis",
            },
            xAxis: {
                type: "category",
                data: entries.map(([status]) => status),
            },
            yAxis: {
                type: "value",
                name: "Hours",
            },
            series: [
                {
                    name: "Average Resolution Time",
                    type: "line",
                    smooth: true,
                    areaStyle: {},
                    data: entries.map(([, value]) => value),
                    itemStyle: {
                        color: "#2e7d32",
                    },
                },
            ],
        };
    }, [data]);

    return (
        <CustomFieldset title="Ticket Resolution Time" variant="bordered">
            {pending && (
                <Typography variant="body2" fontStyle="italic">
                    Calculating resolution insights...
                </Typography>
            )}

            {!pending && data && (
                <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexWrap="wrap" gap={4}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Average Resolution Time
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.averageResolutionHours.toFixed(2)} hrs
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Resolved Tickets Considered
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.resolvedTicketCount}
                            </Typography>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Average Resolution Hours by Status
                        </Typography>
                        <ReactECharts option={chartOptions} style={{ height: 280 }} />
                    </Box>
                </Box>
            )}
        </CustomFieldset>
    );
};

export default TicketResolutionTimeReport;
