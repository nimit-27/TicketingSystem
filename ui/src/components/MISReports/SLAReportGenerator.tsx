import React, { useState } from "react";
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
    Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export interface DownloadOption {
    value: string;
    label: string;
}

const DEFAULT_DOWNLOAD_OPTIONS: DownloadOption[] = [
    { value: "pdf", label: "Download as PDF" },
    { value: "excel", label: "Download as Excel" },
];

interface SLAReportGeneratorProps {
    downloadOptions?: DownloadOption[];
    onDownload: (option: string) => Promise<void> | void;
    onEmail: () => Promise<void> | void;
    busy?: boolean;
    filterControls?: React.ReactNode;
}

const SLAReportGenerator: React.FC<SLAReportGeneratorProps> = ({
    downloadOptions = DEFAULT_DOWNLOAD_OPTIONS,
    onDownload,
    onEmail,
    busy = false,
    filterControls,
}) => {
    const [open, setOpen] = useState(false);
    const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setDownloadMenuAnchor(null);
    };

    const handleEmail = async () => {
        await onEmail();
        handleClose();
    };

    const handleDownloadSelection = async (option: string) => {
        await onDownload(option);
        setDownloadMenuAnchor(null);
        handleClose();
    };

    return (
        <Box>
            <Button variant="contained" onClick={handleOpen} startIcon={<DownloadIcon />} disabled={busy}>
                {busy ? "Preparing..." : "Download"}
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Generate SLA Report</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        {filterControls && (
                            <Box p={2} borderRadius={1} bgcolor="rgba(0,0,0,0.03)">
                                <Typography variant="subtitle2" gutterBottom>
                                    SLA Filters
                                </Typography>
                                {filterControls}
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button variant="outlined" color="primary" startIcon={<EmailIcon />} onClick={handleEmail}>
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

export default SLAReportGenerator;
