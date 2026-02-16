import React from "react";
import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { SlaCalculationJobRun } from "../../types/slaJob";

interface SlaJobHistoryTableProps {
  history: SlaCalculationJobRun[];
}

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

const SlaJobHistoryTable: React.FC<SlaJobHistoryTableProps> = ({ history }) => {
  return (
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
          {history.map((run) => (
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
          {history.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} align="center">
                No SLA job runs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SlaJobHistoryTable;
