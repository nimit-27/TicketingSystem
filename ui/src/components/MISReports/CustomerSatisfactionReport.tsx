import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchCustomerSatisfactionReport } from "../../services/ReportService";
import { MISReportRequestParams } from "../../types/reports";

interface CustomerSatisfactionReportPropsWithParams {
    params?: MISReportRequestParams;
}

const CustomerSatisfactionReport: React.FC<CustomerSatisfactionReportPropsWithParams> = ({ params }) => {
    // const { data, pending, apiHandler } = useApi<CustomerSatisfactionReport>();
    const { data, pending, apiHandler } = useApi<any>();

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
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Average Ratings by Dimension
                        </Typography>
                        <ReactECharts option={chartOptions} style={{ height: 280 }} />
                    </Box>
                </Box>
            )}
        </CustomFieldset>
    );
};

export default CustomerSatisfactionReport;
