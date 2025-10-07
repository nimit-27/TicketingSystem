import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchProblemManagementReport } from "../../services/ReportService";
import { ProblemManagementReport } from "../../types/reports";

const ProblemManagementReport: React.FC = () => {
    const { data, pending, apiHandler } = useApi<ProblemManagementReport>();

    useEffect(() => {
        apiHandler(() => fetchProblemManagementReport());
    }, [apiHandler]);

    const chartOptions = useMemo(() => {
        const stats = data?.categoryStats ?? [];
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
                data: stats.map(stat => stat.category),
                axisLabel: {
                    formatter: (value: string) => value?.length > 18 ? `${value.slice(0, 18)}…` : value,
                },
            },
            series: [
                {
                    type: "bar",
                    data: stats.map(stat => stat.ticketCount),
                    itemStyle: {
                        color: "#0288d1",
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
            current.ticketCount > prev.ticketCount ? current : prev
        );
    }, [data]);

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
                                Most Reported Category
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                                {topCategory.category} ({topCategory.ticketCount} tickets)
                            </Typography>
                        </Box>
                    )}

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Category-wise Ticket Volume
                        </Typography>
                        <ReactECharts option={chartOptions} style={{ height: 320 }} />
                    </Box>
                </Box>
            )}
        </CustomFieldset>
    );
};

export default ProblemManagementReport;
