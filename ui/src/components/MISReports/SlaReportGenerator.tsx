import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getCurrentUserDetails } from "../../config/config";
import { downloadTicketsReport } from "../../services/TicketService";
import { showMessage } from "../../utils/Utils";

const SlaReportGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [format, setFormat] = React.useState<"PDF" | "EXCEL">("EXCEL");
    const [filters, setFilters] = React.useState({
        fromDate: "",
        toDate: "",
        breachedOnFromDate: "",
        breachedOnToDate: "",
    });

    const update = (key: keyof typeof filters) => (event: React.ChangeEvent<HTMLInputElement>) =>
        setFilters((current) => ({ ...current, [key]: event.target.value }));

    const generate = async () => {
        if ((filters.fromDate && filters.toDate && filters.fromDate > filters.toDate)
            || (filters.breachedOnFromDate && filters.breachedOnToDate && filters.breachedOnFromDate > filters.breachedOnToDate)) {
            showMessage("From date cannot be after to date.", "warning");
            return;
        }
        setBusy(true);
        try {
            await downloadTicketsReport({
                reportCode: "SLA_SUMMARY_RPT",
                format,
                ...filters,
                requestedBy: getCurrentUserDetails()?.userId,
            });
            showMessage("SLA report request queued. Track it on the Downloads page.", "success");
            setOpen(false);
            navigate("/downloads");
        } catch (error) {
            showMessage("Unable to queue the SLA report.", "error");
        } finally {
            setBusy(false);
        }
    };

    return <>
        <Button variant="contained" onClick={() => setOpen(true)}>Generate SLA Report</Button>
        <Dialog open={open} onClose={() => !busy && setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Generate SLA Report</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField label="Created From" type="date" value={filters.fromDate} onChange={update("fromDate")} InputLabelProps={{ shrink: true }} />
                    <TextField label="Created To" type="date" value={filters.toDate} onChange={update("toDate")} InputLabelProps={{ shrink: true }} />
                    <TextField label="Breached On From" type="date" value={filters.breachedOnFromDate} onChange={update("breachedOnFromDate")} InputLabelProps={{ shrink: true }} />
                    <TextField label="Breached On To" type="date" value={filters.breachedOnToDate} onChange={update("breachedOnToDate")} InputLabelProps={{ shrink: true }} />
                    <TextField select label="Format" value={format} onChange={(event) => setFormat(event.target.value as "PDF" | "EXCEL")}>
                        <MenuItem value="EXCEL">Excel</MenuItem><MenuItem value="PDF">PDF</MenuItem>
                    </TextField>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={busy} variant="contained" onClick={generate}>{busy ? "Generating…" : "Generate"}</Button>
            </DialogActions>
        </Dialog>
    </>;
};

export default SlaReportGenerator;
