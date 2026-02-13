import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoIcon from "../UI/Icons/InfoIcon";
import {
  fetchSlaCalculationJobHistory,
  triggerSlaCalculationForAllTickets,
  triggerSlaCalculationJob,
} from "../../services/ReportService";
import { SlaCalculationJobOverview, SlaCalculationJobRun } from "../../types/slaJob";
import { useSnackbar } from "../../context/SnackbarContext";
import { useApi } from "../../hooks/useApi";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatDuration = (durationMs?: number | null) => {
  if (durationMs == null) return "-";
  if (durationMs < 1000) return `${durationMs} ms`;
  const seconds = Math.round(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const statusColor = (status?: string) => {
  if (!status) return "default" as const;
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "COMPLETED_WITH_ERRORS":
      return "warning" as const;
    case "FAILED":
      return "error" as const;
    case "RUNNING":
      return "info" as const;
    default:
      return "default" as const;
  }
};

interface SlaCalculationTriggerProps {
  buttonLabel?: string;
}

const SlaCalculationTrigger: React.FC<SlaCalculationTriggerProps> = ({
  buttonLabel = "Trigger SLA Calculation",
}) => {
  const { showMessage } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const { apiHandler: historyApiHandler, pending: loading } = useApi<SlaCalculationJobOverview>();
  const { apiHandler: triggerApiHandler } = useApi<SlaCalculationJobRun>();
  const [triggering, setTriggering] = React.useState(false);
  const [overview, setOverview] = React.useState<SlaCalculationJobOverview | null>(null);

  const slaJobActionInfoContent = (
    <Stack spacing={1}>
      <Typography variant="body2">
        <strong>Refresh:</strong> Reloads the latest SLA job overview and execution history from the server.
      </Typography>
      <Typography variant="body2">
        <strong>Trigger Active Tickets:</strong> Starts SLA recalculation only for currently active tickets.
      </Typography>
      <Typography variant="body2">
        <strong>Recalculate All Tickets:</strong> Starts a full SLA recalculation for every ticket in the system.
      </Typography>
    </Stack>
  );

  const loadOverview = React.useCallback(async () => {
    const response = await historyApiHandler(() => fetchSlaCalculationJobHistory(25));
    if (!response) {
      showMessage("Unable to load SLA job history", "error");
      return;
    }
    setOverview(response);
  }, [historyApiHandler, showMessage]);

  React.useEffect(() => {
    if (!open) return;

    loadOverview();
    const interval = window.setInterval(loadOverview, 10000);
    return () => window.clearInterval(interval);
  }, [open, loadOverview]);

  const handleTriggerActiveOnly = async () => {
    setTriggering(true);
    try {
      const run = await triggerApiHandler(() => triggerSlaCalculationJob());
      if (!run) {
        showMessage("Failed to trigger SLA calculation job", "error");
        return;
      }
      if (run.runStatus === "RUNNING") {
        showMessage("SLA calculation job has been triggered", "success");
      } else {
        showMessage("An SLA job is already running. Showing latest status.", "info");
      }
      await loadOverview();
    } finally {
      setTriggering(false);
    }
  };

  const handleTriggerAllTickets = async () => {
    setTriggering(true);
    try {
      const run = await triggerApiHandler(() => triggerSlaCalculationForAllTickets());
      if (!run) {
        showMessage("Failed to trigger full SLA recalculation", "error");
        return;
      }
      if (run.runStatus === "RUNNING") {
        showMessage("Full SLA recalculation has been triggered for all tickets", "success");
      } else {
        showMessage("An SLA job is already running. Showing latest status.", "info");
      }
      await loadOverview();
    } finally {
      setTriggering(false);
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)} startIcon={<PlayArrowIcon />}>
        {buttonLabel}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6">SLA Calculation Job</Typography>
              <InfoIcon content={slaJobActionInfoContent} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button onClick={loadOverview} variant="outlined" startIcon={<RefreshIcon />} disabled={loading}>
                Refresh
              </Button>
              <Button onClick={handleTriggerActiveOnly} variant="contained" disabled={triggering || !!overview?.running}>
                {triggering ? "Triggering..." : "Trigger Active Tickets"}
              </Button>
              <Button onClick={handleTriggerAllTickets} color="warning" variant="outlined" disabled={triggering || !!overview?.running}>
                {triggering ? "Triggering..." : "Recalculate All Tickets"}
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
            <Chip label={`Running: ${overview?.running ? "Yes" : "No"}`} color={overview?.running ? "warning" : "success"} />
            <Chip label={`Next Run: ${formatDateTime(overview?.nextScheduledAt)}`} />
            <Chip label={`Time till next run: ${overview?.minutesUntilNextRun != null ? `${overview.minutesUntilNextRun} min` : "-"}`} />
            <Chip label={`Cron: ${overview?.cronExpression ?? "-"}`} />
            <Chip label={`Batch Size: ${overview?.batchSize ?? "-"}`} />
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Started At</TableCell>
                    <TableCell>Completed At</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Trigger</TableCell>
                    <TableCell>Scope</TableCell>
                    <TableCell>Triggered By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Processed</TableCell>
                    <TableCell align="right">Succeeded</TableCell>
                    <TableCell align="right">Failed</TableCell>
                    <TableCell>Error Summary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(overview?.history ?? []).map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                      <TableCell>{formatDateTime(run.completedAt)}</TableCell>
                      <TableCell>{formatDuration(run.durationMs)}</TableCell>
                      <TableCell>{run.triggerType}</TableCell>
                      <TableCell>{run.scope}</TableCell>
                      <TableCell>{run.triggeredBy ?? "-"}</TableCell>
                      <TableCell>
                        <Chip size="small" label={run.runStatus} color={statusColor(run.runStatus)} />
                      </TableCell>
                      <TableCell align="right">{run.totalCandidateTickets ?? "-"}</TableCell>
                      <TableCell align="right">{run.processedTickets ?? "-"}</TableCell>
                      <TableCell align="right">{run.succeededTickets ?? "-"}</TableCell>
                      <TableCell align="right">{run.failedTickets ?? "-"}</TableCell>
                      <TableCell>{run.errorSummary ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(overview?.history?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} align="center">No SLA job runs found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlaCalculationTrigger;
