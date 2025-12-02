import React from "react";
import ReportPageLayout from "../components/MISReports/ReportPageLayout";
import TicketResolutionTimeReport from "../components/MISReports/TicketResolutionTimeReport";

const TicketResolutionTimeReportPage: React.FC = () => {
    return (
        <ReportPageLayout title="Ticket Resolution Time Report">
            {(params) => <TicketResolutionTimeReport params={params} />}
        </ReportPageLayout>
    );
};

export default TicketResolutionTimeReportPage;
