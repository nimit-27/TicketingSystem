import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "../UI/Icons/InfoIcon";
import {
  fetchSlaCalculationJobHistory,
  triggerSlaCalculationJob,
  updateTriggerJobPeriod,
} from "../../services/ReportService";
import { SlaCalculationJobOverview, SlaCalculationJobRun, TriggerJob, TriggerPeriod } from "../../types/slaJob";
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

type CronFields = {
  second: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

const cronRanges: Record<keyof CronFields, [number, number]> = {
  second: [0, 59],
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 7],
};

const parseCron = (cronExpression?: string | null): CronFields => {
  const parts = (cronExpression ?? "").split(" ");
  return {
    second: parts[0] ?? "0",
    minute: parts[1] ?? "0",
    hour: parts[2] ?? "*",
    dayOfMonth: parts[3] ?? "*",
    month: parts[4] ?? "*",
    dayOfWeek: parts[5] ?? "*",
  };
};

const isNumeric = (value: string) => /^\d+$/.test(value);

const validateCronToken = (token: string, [min, max]: [number, number]) => {
  const normalized = token.trim();
  if (!normalized) return "Required";
  if (normalized === "*") return "";

  if (normalized.startsWith("*/")) {
    const step = normalized.slice(2);
    if (!isNumeric(step)) return "Use */n format";
    const stepNum = Number(step);
    if (stepNum < 1 || stepNum > max) return `Step must be 1-${max}`;
    return "";
  }

  if (!isNumeric(normalized)) return "Only *, */n or number";
  const numeric = Number(normalized);
  if (numeric < min || numeric > max) return `Allowed range ${min}-${max}`;
  return "";
};

const getCronFieldErrors = (fields: CronFields) => {
  return {
    second: validateCronToken(fields.second, cronRanges.second),
    minute: validateCronToken(fields.minute, cronRanges.minute),
    hour: validateCronToken(fields.hour, cronRanges.hour),
    dayOfMonth: validateCronToken(fields.dayOfMonth, cronRanges.dayOfMonth),
    month: validateCronToken(fields.month, cronRanges.month),
    dayOfWeek: validateCronToken(fields.dayOfWeek, cronRanges.dayOfWeek),
  };
};

const SlaCalculationTrigger: React.FC<SlaCalculationTriggerProps> = ({
  buttonLabel = "Trigger SLA Calculation",
}) => {
  const { showMessage } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const { apiHandler: historyApiHandler, pending: loading } = useApi<SlaCalculationJobOverview>();
  const { apiHandler: triggerApiHandler } = useApi<SlaCalculationJobRun>();
  const { apiHandler: updateApiHandler } = useApi<TriggerJob>();
  const [triggering, setTriggering] = React.useState(false);
  const [overview, setOverview] = React.useState<SlaCalculationJobOverview | null>(null);
  const [selectedJobCode, setSelectedJobCode] = React.useState("sla_job");
  const [triggerPeriod, setTriggerPeriod] = React.useState<TriggerPeriod>("MANUAL");
  const [cronFields, setCronFields] = React.useState<CronFields>(parseCron("0 0 */4 * * *"));
  const [editingCron, setEditingCron] = React.useState(true);

  const cronFieldErrors = React.useMemo(() => getCronFieldErrors(cronFields), [cronFields]);
  const isCronValid = React.useMemo(
    () => Object.values(cronFieldErrors).every((message) => !message),
    [cronFieldErrors],
  );

  const selectedJob = React.useMemo(
    () => overview?.triggerJobs?.find((item) => item.triggerJobCode === selectedJobCode) ?? overview?.triggerJobs?.[0],
    [overview?.triggerJobs, selectedJobCode],
  );

  React.useEffect(() => {
    if (!selectedJob) return;
    setTriggerPeriod(selectedJob.triggerPeriod);
    setCronFields(parseCron(selectedJob.cronExpression));
    setEditingCron(!selectedJob.cronExpression);
  }, [selectedJob]);

  const slaJobActionInfoContent = (
    <Stack spacing={1}>
      <Typography variant="body2">
        <strong>Refresh:</strong> Reloads the latest SLA job overview and execution history from the server.
      </Typography>
      <Typography variant="body2">
        <strong>Trigger:</strong> Runs the currently selected job from the Job dropdown.
      </Typography>
      <Typography variant="body2">
        <strong>Trigger Period:</strong> Manual keeps ad-hoc trigger only, Periodic allows cron setup, Schedule is reserved for upcoming scheduled windows.
      </Typography>
      <Typography variant="body2">
        <strong>Cron examples:</strong> Every 4 hours: <code>0 0 */4 * * *</code> · Every 15 min: <code>0 */15 * * * *</code>
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
    if (!selectedJobCode && response.triggerJobs?.length) {
      setSelectedJobCode(response.triggerJobs[0].triggerJobCode);
    }
  }, [historyApiHandler, showMessage, selectedJobCode]);

  React.useEffect(() => {
    if (!open) return;

    loadOverview();
    const interval = window.setInterval(loadOverview, 10000);
    return () => window.clearInterval(interval);
  }, [open, loadOverview]);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const run = await triggerApiHandler(() => triggerSlaCalculationJob(selectedJobCode));
      if (!run) {
        showMessage("Failed to trigger SLA calculation job", "error");
        return;
      }
      if (run.runStatus === "RUNNING") {
        showMessage(`${selectedJob?.triggerJobName ?? "Selected"} has been triggered`, "success");
      } else {
        showMessage("An SLA job is already running. Showing latest status.", "info");
      }
      await loadOverview();
    } finally {
      setTriggering(false);
    }
  };

  const handleSubmitPeriod = async () => {
    if (!selectedJob) return;
    if (triggerPeriod === "PERIODIC" && !isCronValid) {
      showMessage("Please fix cron field errors before saving.", "error");
      return;
    }

    const cronExpression = `${cronFields.second} ${cronFields.minute} ${cronFields.hour} ${cronFields.dayOfMonth} ${cronFields.month} ${cronFields.dayOfWeek}`;
    const payload = {
      triggerPeriod,
      cronExpression: triggerPeriod === "PERIODIC" ? cronExpression : null,
    };

    const updated = await updateApiHandler(() => updateTriggerJobPeriod(selectedJob.triggerJobCode, payload));
    if (!updated) {
      showMessage("Unable to update trigger period", "error");
      return;
    }

    showMessage("Trigger period updated", "success");
    setEditingCron(false);
    await loadOverview();
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
              <Button onClick={handleTrigger} variant="contained" disabled={triggering || !!overview?.running}>
                {triggering ? "Triggering..." : "Trigger"}
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="Job"
                value={selectedJobCode}
                onChange={(event) => setSelectedJobCode(event.target.value)}
                disabled={triggering || !!overview?.running}
                size="small"
                sx={{ minWidth: 260 }}
              >
                {(overview?.triggerJobs ?? []).map((job) => (
                  <MenuItem key={job.triggerJobCode} value={job.triggerJobCode}>
                    {job.triggerJobName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Trigger Period"
                value={triggerPeriod}
                onChange={(event) => {
                  setTriggerPeriod(event.target.value as TriggerPeriod);
                  setEditingCron(true);
                }}
                size="small"
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="MANUAL">Manual</MenuItem>
                <MenuItem value="PERIODIC">Periodic</MenuItem>
                <MenuItem value="SCHEDULE">Schedule</MenuItem>
              </TextField>
            </Stack>

            {triggerPeriod === "PERIODIC" && (
              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "flex-start" }}>
                  {Object.entries(cronFields).map(([key, value]) => {
                    const fieldKey = key as keyof CronFields;
                    return (
                      <TextField
                        key={key}
                        label={key}
                        value={value}
                        size="small"
                        onChange={(event) => setCronFields((prev) => ({ ...prev, [fieldKey]: event.target.value }))}
                        disabled={!editingCron}
                        error={Boolean(cronFieldErrors[fieldKey])}
                        helperText={cronFieldErrors[fieldKey] || " "}
                      />
                    );
                  })}
                  {editingCron ? (
                    <Tooltip title={isCronValid ? "Save cron" : "Fix cron errors to save"}>
                      <span>
                        <IconButton color="primary" onClick={handleSubmitPeriod} disabled={!isCronValid}>
                          <CheckIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <IconButton color="primary" onClick={() => setEditingCron(true)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Use <code>*</code>, <code>*/n</code>, or exact number. Examples: every 4 hours <code>0 0 */4 * * *</code>, every 15 minutes <code>0 */15 * * * *</code>.
                </Typography>
              </Stack>
            )}

            {triggerPeriod === "SCHEDULE" && <Typography variant="body2">Coming soon!</Typography>}

            {triggerPeriod !== "PERIODIC" && (
              <Button variant="outlined" size="small" onClick={handleSubmitPeriod} sx={{ width: "fit-content" }}>
                Save Trigger Period
              </Button>
            )}
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
            <Chip label={`Running: ${selectedJob?.running ? "Yes" : "No"}`} color={selectedJob?.running ? "warning" : "success"} />
            <Chip label={`Next Run: ${formatDateTime(selectedJob?.nextScheduledAt)}`} />
            <Chip label={`Time till next run: ${selectedJob?.minutesUntilNextRun != null ? `${selectedJob.minutesUntilNextRun} min` : "-"}`} />
            <Chip label={`Cron: ${selectedJob?.cronExpression ?? "-"}`} />
            <Chip label={`Batch Size: ${selectedJob?.batchSize ?? "-"}`} />
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
