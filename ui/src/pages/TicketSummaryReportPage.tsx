import React from "react";
import ReportPageLayout from "../components/MISReports/ReportPageLayout";
import TicketSummaryReport from "../components/MISReports/TicketSummaryReport";

const TicketSummaryReportPage: React.FC = () => {
    return (
        <ReportPageLayout title="Ticket Summary Report">
            {(params) => <TicketSummaryReport params={params} />}
        </ReportPageLayout>
    );
};

export default TicketSummaryReportPage;
