import React from "react";
import ReportPageLayout from "../components/MISReports/ReportPageLayout";
import CustomerSatisfactionReport from "../components/MISReports/CustomerSatisfactionReport";

const CustomerSatisfactionReportPage: React.FC = () => {
    return (
        <ReportPageLayout
            title="Customer Satisfaction Report"
            description="Analyze satisfaction scores, ticket counts, and breaches by priority and category/subcategory."
        >
            {(params) => <CustomerSatisfactionReport params={params} />}
        </ReportPageLayout>
    );
};

export default CustomerSatisfactionReportPage;
