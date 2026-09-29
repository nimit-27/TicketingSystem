import React from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import { getCurrentUserDetails } from "../../config/config";
import { useSnackbar } from "../../context/SnackbarContext";
import { downloadTicketsReport } from "../../services/TicketService";
import { MISReportRequestParams, SupportDashboardTimeScale } from "../../types/reports";

interface Props { reportCode: string; reportName: string; params?: MISReportRequestParams; interval: SupportDashboardTimeScale; }

const SectionReportDownload: React.FC<Props> = ({ reportCode, reportName, params = {}, interval }) => {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const [busy, setBusy] = React.useState(false);
    const navigate = useNavigate();
    const { showMessage } = useSnackbar();

    const queue = async (format: "PDF" | "EXCEL") => {
        setAnchor(null);
        setBusy(true);
        try {
            await downloadTicketsReport({ reportCode, format, ...params, interval, requestedBy: getCurrentUserDetails()?.userId });
            showMessage(`${reportName} queued. Track it on the Downloads page.`, "success");
            navigate("/downloads");
        } catch {
            showMessage(`Unable to queue ${reportName}.`, "error");
        } finally { setBusy(false); }
    };

    return <>
        <Tooltip title={`Download ${reportName}`}><span><IconButton aria-label={`Download ${reportName}`} disabled={busy} onClick={(event) => setAnchor(event.currentTarget)}><DownloadIcon /></IconButton></span></Tooltip>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => queue("PDF")}>PDF</MenuItem>
            <MenuItem onClick={() => queue("EXCEL")}>Excel</MenuItem>
        </Menu>
    </>;
};

export default SectionReportDownload;
