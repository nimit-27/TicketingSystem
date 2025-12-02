import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchCustomerSatisfactionReport } from "../../services/ReportService";
import { CustomerSatisfactionReportProps, MISReportRequestParams } from "../../types/reports";

interface CustomerSatisfactionReportPropsWithParams {
    params?: MISReportRequestParams;
}

const CustomerSatisfactionReport: React.FC<CustomerSatisfactionReportPropsWithParams> = ({ params }) => {
    const { data, pending, apiHandler } = useApi<CustomerSatisfactionReportProps>();

    useEffect(() => {
        apiHandler(() =>
            fetchCustomerSatisfactionReport({
                fromDate: params?.fromDate,
                toDate: params?.toDate,
                scope: params?.scope,
                userId: params?.userId,
            }),
        );
    }, [apiHandler, params?.fromDate, params?.scope, params?.toDate, params?.userId]);

    const chartOptions = useMemo(() => {
        if (!data) {
            return {};
        }

        const metrics = [
            { name: "Overall", value: data.overallSatisfactionAverage },
            { name: "Resolution", value: data.resolutionEffectivenessAverage },
            { name: "Communication", value: data.communicationSupportAverage },
            { name: "Timeliness", value: data.timelinessAverage },
        ];

        return {
            tooltip: {
                trigger: "axis",
            },
            xAxis: {
                type: "category",
                data: metrics.map(metric => metric.name),
            },
            yAxis: {
                type: "value",
                min: 0,
                max: 5,
            },
            series: [
                {
                    type: "bar",
                    data: metrics.map(metric => Number(metric.value.toFixed(2))),
                    itemStyle: {
                        color: "#f57c00",
                    },
                },
            ],
        };
    }, [data]);

    const priorityBreakdown = useMemo(() => data?.priorityBreakdown ?? [], [data]);
    const ratingHeaders = useMemo(() => {
        const ratingSet = new Set<string>();
        priorityBreakdown.forEach((stat) => {
            Object.keys(stat.ratingCounts ?? {}).forEach((rating) => ratingSet.add(rating));
        });
        return Array.from(ratingSet);
    }, [priorityBreakdown]);

    const ticketTotals = useMemo(
        () =>
            priorityBreakdown.reduce(
                (acc, stat) => {
                    return {
                        tickets: acc.tickets + (stat.ticketCount ?? 0),
                        breached: acc.breached + (stat.breachedTickets ?? 0),
                    };
                },
                { tickets: 0, breached: 0 },
            ),
        [priorityBreakdown],
    );

    return (
        <CustomFieldset title="Customer Satisfaction" variant="bordered">
            {pending && (
                <Typography variant="body2" fontStyle="italic">
                    Gathering feedback trends...
                </Typography>
            )}

            {!pending && data && (
                <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexWrap="wrap" gap={4}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Feedback Responses
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.totalResponses}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Composite Satisfaction Score
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {data.compositeScore.toFixed(2)} / 5
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Tickets Represented
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {ticketTotals.tickets}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Breached: {ticketTotals.breached}
                            </Typography>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Average Ratings by Dimension
                        </Typography>
                        <ReactECharts option={chartOptions} style={{ height: 280 }} />
                    </Box>

                    {priorityBreakdown.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Satisfaction Breakdown by Priority and Category/Subcategory
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                {priorityBreakdown.map((stat) => (
                                    <Box
                                        key={`${stat.priority}-${stat.category}-${stat.subcategory}`}
                                        border={1}
                                        borderColor="divider"
                                        borderRadius={1}
                                        p={2}
                                        bgcolor="background.paper"
                                    >
                                        <Typography variant="subtitle2" gutterBottom>
                                            Priority: {stat.priority} — {stat.category} &gt; {stat.subcategory || "N/A"}
                                        </Typography>
                                        <Box component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
                                            <Box component="thead">
                                                <Box component="tr">
                                                    <Box component="th" align="left" sx={{ py: 1, pr: 2 }}>
                                                        Category &amp; Subcategory
                                                    </Box>
                                                    <Box component="th" align="right" sx={{ py: 1, pr: 2 }}>
                                                        Ticket Count
                                                    </Box>
                                                    <Box component="th" align="right" sx={{ py: 1, pr: 2 }}>
                                                        Breached Tickets
                                                    </Box>
                                                    {ratingHeaders.map((rating) => (
                                                        <Box key={rating} component="th" align="right" sx={{ py: 1, pr: 2 }}>
                                                            {rating}
                                                        </Box>
                                                    ))}
                                                    <Box component="th" align="right" sx={{ py: 1 }}>
                                                        Total Responses
                                                    </Box>
                                                </Box>
                                            </Box>
                                                <Box component="tbody">
                                                    <Box component="tr" sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" } }}>
                                                        <Box component="td" align="left" sx={{ py: 1, pr: 2 }}>
                                                            {stat.category} &gt; {stat.subcategory || "N/A"}
                                                        </Box>
                                                        <Box component="td" align="right" sx={{ py: 1, pr: 2 }}>
                                                            {stat.ticketCount ?? 0}
                                                        </Box>
                                                        <Box component="td" align="right" sx={{ py: 1, pr: 2 }}>
                                                            {stat.breachedTickets ?? 0}
                                                        </Box>
                                                        {ratingHeaders.map((rating) => (
                                                            <Box key={rating} component="td" align="right" sx={{ py: 1, pr: 2 }}>
                                                                {stat.ratingCounts?.[rating] ?? 0}
                                                            </Box>
                                                        ))}
                                                    <Box component="td" align="right" sx={{ py: 1 }}>
                                                        {stat.totalResponses}
                                                    </Box>
                                                </Box>
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

export default CustomerSatisfactionReport;
