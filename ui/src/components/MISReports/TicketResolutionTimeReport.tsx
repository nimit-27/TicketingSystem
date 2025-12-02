import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchTicketResolutionTimeReport } from "../../services/ReportService";
import {
    MISReportRequestParams,
    ResolutionCategoryPriorityStat,
    TicketResolutionTimeReportProps,
} from "../../types/reports";

interface TicketResolutionTimeReportProps {
    params?: MISReportRequestParams;
}

const TicketResolutionTimeReport: React.FC<TicketResolutionTimeReportProps> = ({ params }) => {
    const { data, pending, apiHandler } = useApi<TicketResolutionTimeReportProps>();

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

    const categoryPriorityGroups = useMemo(() => {
        const stats = data?.categoryPriorityStats ?? [];
        return stats.reduce<Record<string, ResolutionCategoryPriorityStat[]>>((acc, stat) => {
            const priority = stat.priority || "Unspecified";
            acc[priority] = acc[priority] ? [...acc[priority], stat] : [stat];
            return acc;
        }, {});
    }, [data]);

    const formatCategoryLabel = (stat: ResolutionCategoryPriorityStat) =>
        `${stat.categoryName ?? stat.category ?? "Unspecified"} > ${stat.subcategoryName ?? stat.subcategory ?? "N/A"}`;

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

                    {Object.keys(categoryPriorityGroups).length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Category &amp; Subcategory Breakdown by Priority
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                {Object.entries(categoryPriorityGroups).map(([priority, stats]) => (
                                    <Box
                                        key={priority}
                                        border={1}
                                        borderColor="divider"
                                        borderRadius={1}
                                        p={2}
                                        bgcolor="background.paper"
                                    >
                                        <Typography variant="subtitle2" gutterBottom>
                                            Priority: {priority}
                                        </Typography>
                                        <Box component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
                                            <Box component="thead">
                                                <Box component="tr">
                                                    <Box component="th" align="left" sx={{ py: 1, pr: 2 }}>
                                                        Category &gt; Subcategory
                                                    </Box>
                                                    <Box component="th" align="right" sx={{ py: 1, pr: 2 }}>
                                                        Avg Resolution (hrs)
                                                    </Box>
                                                    <Box component="th" align="right" sx={{ py: 1 }}>
                                                        Resolved Tickets
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box component="tbody">
                                                {stats.map((stat) => (
                                                    <Box
                                                        component="tr"
                                                        key={`${stat.categoryName ?? stat.category}-${stat.subcategoryName ?? stat.subcategory}`}
                                                        sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}
                                                    >
                                                        <Box component="td" align="left" sx={{ py: 1, pr: 2 }}>
                                                            {formatCategoryLabel(stat)}
                                                        </Box>
                                                        <Box component="td" align="right" sx={{ py: 1, pr: 2 }}>
                                                            {stat.averageResolutionHours.toFixed(2)}
                                                        </Box>
                                                        <Box component="td" align="right" sx={{ py: 1 }}>
                                                            {stat.resolvedTicketCount}
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
        </CustomFieldset>
    );
};

export default TicketResolutionTimeReport;
