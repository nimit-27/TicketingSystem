import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchProblemManagementReport } from "../../services/ReportService";
import { MISReportRequestParams, ProblemCategoryStat } from "../../types/reports";

interface ProblemManagementReportPropsWithParams {
    params?: MISReportRequestParams;
}

const ProblemManagementReport: React.FC<ProblemManagementReportPropsWithParams> = ({ params }) => {
    const { data, pending, apiHandler } = useApi<{ categoryStats?: ProblemCategoryStat[] }>();

    useEffect(() => {
        apiHandler(() =>
            fetchProblemManagementReport({
                fromDate: params?.fromDate,
                toDate: params?.toDate,
                scope: params?.scope,
                userId: params?.userId,
            }),
        );
    }, [apiHandler, params?.fromDate, params?.scope, params?.toDate, params?.userId]);

    const chartOptions = useMemo(() => {
        const stats = data?.categoryStats ?? [];
        const labels = stats.map((stat) => `${stat.category} > ${stat.subcategory || "N/A"}`);
        return {
            tooltip: {
                trigger: "axis",
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            xAxis: {
                type: "value",
            },
            yAxis: {
                type: "category",
                data: labels,
                axisLabel: {
                    formatter: (value: string) => (value?.length > 24 ? `${value.slice(0, 24)}…` : value),
                },
            },
            series: [
                {
                    name: "Total Tickets",
                    type: "bar",
                    data: stats.map((stat) => stat.ticketCount),
                    itemStyle: {
                        color: "#0288d1",
                    },
                },
                {
                    name: "Breached Tickets",
                    type: "bar",
                    data: stats.map((stat) => stat.breachedTickets ?? 0),
                    itemStyle: {
                        color: "#d32f2f",
                    },
                },
            ],
        };
    }, [data]);

    const topCategory = useMemo(() => {
        if (!data?.categoryStats?.length) {
            return null;
        }

        return data.categoryStats.reduce((prev, current) =>
            current.ticketCount > prev.ticketCount ? current : prev,
        );
    }, [data]);

    const totalBreachedTickets = useMemo(
        () => (data?.categoryStats ?? []).reduce((sum, stat) => sum + (stat.breachedTickets ?? 0), 0),
        [data],
    );

    return (
        <CustomFieldset title="Problem Management" variant="bordered">
            {pending && (
                <Typography variant="body2" fontStyle="italic">
                    Analysing recurring issues...
                </Typography>
            )}

            {!pending && data && (
                <Box display="flex" flexDirection="column" gap={2}>
                    {topCategory && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Most Reported Category/Subcategory
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                                {topCategory.category} &gt; {topCategory.subcategory || "N/A"} ({topCategory.ticketCount}
                                {" "}
                                tickets)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Breached: {topCategory.breachedTickets ?? 0}
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" gap={4} flexWrap="wrap">
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Breached Tickets
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>{totalBreachedTickets}</Typography>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Category/Subcategory Ticket Volume (with Breaches)
                        </Typography>
                        <ReactECharts option={chartOptions} style={{ height: 320 }} />
                    </Box>
                </Box>
            )}
        </CustomFieldset>
    );
};

export default ProblemManagementReport;
