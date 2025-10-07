import React from "react";
import { Box, Typography } from "@mui/material";
import TicketSummaryReport from "../components/MISReports/TicketSummaryReport";
import TicketResolutionTimeReport from "../components/MISReports/TicketResolutionTimeReport";
import CustomerSatisfactionReport from "../components/MISReports/CustomerSatisfactionReport";
import ProblemManagementReport from "../components/MISReports/ProblemManagementReport";

const MISReports: React.FC = () => {
    return (
        <Box display="flex" flexDirection="column" gap={3} p={2}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Management Information System Reports
            </Typography>

            <TicketSummaryReport />
            <TicketResolutionTimeReport />
            <CustomerSatisfactionReport />
            <ProblemManagementReport />
        </Box>
    );
};

export default MISReports;
