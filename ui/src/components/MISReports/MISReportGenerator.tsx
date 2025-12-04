import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { SelectChangeEvent } from "@mui/material/Select";
import {
    REPORT_PERIODS,
    ReportPeriod,
    ReportRange,
    calculatePeriodRange,
    getPeriodLabel,
} from "../../utils/reportPeriods";

export interface DownloadOption {
    value: string;
    label: string;
}

const DEFAULT_DOWNLOAD_OPTIONS: DownloadOption[] = [
    { value: "pdf", label: "Download as PDF" },
    { value: "excel", label: "Download as Excel" },
];

interface MISReportGeneratorProps {
    defaultPeriod?: ReportPeriod;
    downloadOptions?: DownloadOption[];
    onDownload: (option: string, period: ReportPeriod, range: ReportRange) => Promise<void> | void;
    onEmail: (period: ReportPeriod, range: ReportRange) => Promise<void> | void;
    busy?: boolean;
}

const formatRange = (range: ReportRange) => {
    const format = (date: Date) =>
        date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return `${format(range.startDate)} — ${format(range.endDate)}`;
};

const normalizeDateInput = (value: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const MISReportGenerator: React.FC<MISReportGeneratorProps> = ({
    defaultPeriod = "daily",
    downloadOptions = DEFAULT_DOWNLOAD_OPTIONS,
    onDownload,
    onEmail,
    busy = false,
}) => {
    const [open, setOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>(defaultPeriod);
    const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
    const [customFromDate, setCustomFromDate] = useState("");
    const [customToDate, setCustomToDate] = useState("");

    const presetRange = useMemo(() => calculatePeriodRange(selectedPeriod), [selectedPeriod]);

    const customRange: ReportRange | null = useMemo(() => {
        const start = normalizeDateInput(customFromDate);
        const end = normalizeDateInput(customToDate);

        if (!start || !end || start > end) {
            return null;
        }

        return { startDate: start, endDate: end };
    }, [customFromDate, customToDate]);

    const range = customRange ?? presetRange;

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setDownloadMenuAnchor(null);
    };

    const handlePeriodChange = (event: SelectChangeEvent<ReportPeriod>) => {
        setSelectedPeriod(event.target.value as ReportPeriod);
    };

    const handleEmail = async () => {
        await onEmail(selectedPeriod, range);
        handleClose();
    };

    const handleDownloadSelection = async (option: string) => {
        await onDownload(option, selectedPeriod, range);
        setDownloadMenuAnchor(null);
        handleClose();
    };

    return (
        <Box>
            <Button
                variant="contained"
                onClick={handleOpen}
                startIcon={<DownloadIcon />}
                disabled={busy}
            >
                {busy ? "Preparing..." : ""}
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Generate Report</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            select
                            fullWidth
                            label="Report Frequency"
                            value={selectedPeriod}
                            onChange={handlePeriodChange}
                            helperText="Select how frequently the report should be generated"
                        >
                            {REPORT_PERIODS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box display="flex" gap={2} flexWrap="wrap">
                            <TextField
                                id="mis-report-custom-from"
                                label="From Date"
                                type="date"
                                fullWidth
                                value={customFromDate}
                                onChange={(event) => setCustomFromDate(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                            />
                            <TextField
                                id="mis-report-custom-to"
                                label="To Date"
                                type="date"
                                fullWidth
                                value={customToDate}
                                onChange={(event) => setCustomToDate(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                error={Boolean(customRange === null && customFromDate && customToDate)}
                                helperText={
                                    customRange === null && customFromDate && customToDate
                                        ? "Please ensure From Date is not after To Date."
                                        : undefined
                                }
                            />
                        </Box>

                        <Box p={2} borderRadius={1} bgcolor="rgba(0,0,0,0.03)">
                            <Typography variant="subtitle2" gutterBottom>
                                Selected range
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {customRange
                                    ? `Custom range selected: ${formatRange(range)}`
                                    : `${getPeriodLabel(selectedPeriod)} report will cover ${formatRange(range)}.`}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EmailIcon />}
                        onClick={handleEmail}
                    >
                        Email
                    </Button>
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<ArrowDropDownIcon />}
                            startIcon={<DownloadIcon />}
                            onClick={(event) => setDownloadMenuAnchor(event.currentTarget)}
                        >
                            Download
                        </Button>
                        <Menu
                            anchorEl={downloadMenuAnchor}
                            open={Boolean(downloadMenuAnchor)}
                            onClose={() => setDownloadMenuAnchor(null)}
                        >
                            {downloadOptions.map((option) => (
                                <MenuItem key={option.value} onClick={() => handleDownloadSelection(option.value)}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MISReportGenerator;
