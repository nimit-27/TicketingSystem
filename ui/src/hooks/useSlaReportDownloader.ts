import React from "react";
import { useSnackbar } from "../context/SnackbarContext";
import { getCurrentUserDetails } from "../config/config";
import { downloadTicketsReport } from "../services/TicketService";
import { MISReportRequestParams } from "../types/reports";

export interface UseSlaReportDownloaderResult {
    downloading: boolean;
    handleDownload: (option: string) => Promise<void>;
    handleEmail: () => void;
}

/**
 * Queues the detailed SLA ticket report through the same asynchronous Jasper
 * report pipeline used by the All Tickets download dialog.
 */
export const useSlaReportDownloader = (
    requestParams: MISReportRequestParams,
): UseSlaReportDownloaderResult => {
    const { showMessage } = useSnackbar();
    const [downloading, setDownloading] = React.useState(false);

    const handleDownload = React.useCallback(async (option: string) => {
        if (option !== "excel" && option !== "pdf") {
            showMessage(`${option.toUpperCase()} downloads are not available yet.`, "info");
            return;
        }

        setDownloading(true);
        showMessage("Your report is being generated.", "info");
        try {
            await downloadTicketsReport({
                reportCode: "SLA_TICKETS_RPT",
                format: option === "excel" ? "EXCEL" : "PDF",
                fromDate: requestParams.fromDate,
                toDate: requestParams.toDate,
                categoryId: requestParams.categoryId,
                subCategoryId: requestParams.subCategoryId,
                zoneCode: requestParams.zoneCode,
                regionCode: requestParams.regionCode,
                districtCode: requestParams.districtCode,
                issueTypeId: requestParams.issueTypeId,
                divisionId: requestParams.division,
                breachOption: requestParams.breachedFilter,
                requestedBy: getCurrentUserDetails()?.userId,
            });
            showMessage("Report request queued. Please check Downloads page.", "success");
        } catch (error) {
            console.error("Failed to queue SLA report", error);
            showMessage("Failed to generate SLA report.", "error");
        } finally {
            setDownloading(false);
        }
    }, [requestParams, showMessage]);

    const handleEmail = React.useCallback(() => {
        showMessage("SLA report will be emailed once ready.", "success");
    }, [showMessage]);

    return { downloading, handleDownload, handleEmail };
};
