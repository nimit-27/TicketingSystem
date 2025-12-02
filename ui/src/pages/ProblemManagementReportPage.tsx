import React from "react";
import ReportPageLayout from "../components/MISReports/ReportPageLayout";
import ProblemManagementReport from "../components/MISReports/ProblemManagementReport";

const ProblemManagementReportPage: React.FC = () => {
    return (
        <ReportPageLayout
            title="Problem Management Report"
            description="Track recurring issues with ticket and breach counts for each category and subcategory."
        >
            {(params) => <ProblemManagementReport params={params} />}
        </ReportPageLayout>
    );
};

export default ProblemManagementReportPage;
