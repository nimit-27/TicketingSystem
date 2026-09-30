import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Paper, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import GenericTable from "../UI/GenericTable";
import { TicketRow } from "../AllTickets/TicketsTable";
import { getMaxSlaResolutionMinutes, recalculateTicketSla, recalculateTicketSlas } from "../../services/TicketService";
import { useSnackbar } from "../../context/SnackbarContext";
import { useApi } from "../../hooks/useApi";

const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString() : "-";
const formatMinutes = (value?: number) => value == null ? "-" : `${Math.floor(Math.abs(value) / 60)}h ${Math.abs(value) % 60}m`;

export const getBreachIndicatorColor = (breachedByMinutes: number, maxResolutionMinutes: number) => {
  if (maxResolutionMinutes <= 0) return "rgb(255, 255, 255)";

  const minutesUntilBreach = Math.max(0, -breachedByMinutes);
  const range = maxResolutionMinutes / 10;
  const rangeIndex = Math.min(9, Math.floor(minutesUntilBreach / range));
  const redIntensity = Math.round(255 * ((9 - rangeIndex) / 9));
  const greenAndBlue = 255 - redIntensity;
  return `rgb(255, ${greenAndBlue}, ${greenAndBlue})`;
};

const SlaManagementTable: React.FC<{ tickets: TicketRow[]; refresh: () => void }> = ({ tickets, refresh }) => {
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const { apiHandler: getMaxSlaResolutionMinutesApiHandler } = useApi<number>();
  const { apiHandler: recalculateTicketSlaApiHandler } = useApi<unknown>();
  const { apiHandler: recalculateTicketSlasApiHandler } = useApi<unknown>();
  const [showColumns, setShowColumns] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [maxResolutionMinutes, setMaxResolutionMinutes] = useState(0);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    id: true, reportedDate: true, status: true, breachIn: true, dueAt: true, resolutionTime: true, action: true,
    subject: false, category: false, priority: false, assignee: false,
  });

  useEffect(() => {
    let active = true;
    getMaxSlaResolutionMinutesApiHandler(getMaxSlaResolutionMinutes).then((minutes) => {
      if (active && minutes != null) {
        setMaxResolutionMinutes(Math.max(0, Number(minutes) || 0));
      }
    });
    return () => { active = false; };
  }, [getMaxSlaResolutionMinutesApiHandler]);

  const recalculate = async (id: string) => {
    setBusyIds((ids) => [...ids, id]);
    try {
      await recalculateTicketSlaApiHandler(() => recalculateTicketSla(id));
      showMessage("SLA recalculated successfully", "success");
      refresh();
    } finally {
      setBusyIds((ids) => ids.filter((value) => value !== id));
    }
  };

  const recalculatePage = async () => {
    await recalculateTicketSlasApiHandler(() => recalculateTicketSlas(tickets.map(({ id }) => id)));
    showMessage("SLA recalculation started for this page", "success");
  };

  const columns = useMemo(() => [
    { key: "id", title: "Ticket ID", dataIndex: "id" },
    { key: "reportedDate", title: "Reported Date", render: (_: unknown, row: TicketRow) => formatDateTime(row.reportedDate) },
    { key: "status", title: "Status", render: (_: unknown, row: TicketRow) => row.statusLabel || "-" },
    { key: "breachIn", title: "Breach In", render: (_: unknown, row: TicketRow) => {
      const breachedByMinutes = row.sla?.breachedByMinutes;
      const label = breachedByMinutes != null && breachedByMinutes > 0
        ? `Breached by ${formatMinutes(breachedByMinutes)}`
        : formatMinutes(breachedByMinutes);
      return <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
        {breachedByMinutes != null && <Box
          component="span"
          aria-label={`Breach urgency: ${label}`}
          sx={{
            width: 14,
            height: 14,
            flex: "0 0 14px",
            bgcolor: getBreachIndicatorColor(breachedByMinutes, maxResolutionMinutes),
            border: "1px solid",
            borderColor: "grey.400",
          }}
        />}
        <span>{label}</span>
      </Box>;
    } },
    { key: "dueAt", title: "Due At", render: (_: unknown, row: TicketRow) => formatDateTime(row.sla?.dueAt) },
    { key: "resolutionTime", title: "Resolution Time", render: (_: unknown, row: TicketRow) => formatMinutes(row.sla?.resolutionTimeMinutes) },
    { key: "subject", title: "Subject", dataIndex: "subject" },
    { key: "category", title: "Module", dataIndex: "category" },
    { key: "priority", title: "Priority", dataIndex: "priority" },
    { key: "assignee", title: "Assignee", dataIndex: "assignedToName" },
    { key: "action", title: "Action", render: (_: unknown, row: TicketRow) => <>
      <Tooltip title="View ticket"><Button aria-label={`View ticket ${row.id}`} onClick={() => navigate(`/tickets/${row.id}`)}><VisibilityIcon /></Button></Tooltip>
      <Tooltip title="Recalculate SLA"><span><Button aria-label={`Recalculate SLA ${row.id}`} disabled={busyIds.includes(row.id)} onClick={() => recalculate(row.id)}><RefreshIcon /></Button></span></Tooltip>
    </> },
  ], [busyIds, maxResolutionMinutes, navigate]);

  return <>
    <div className="d-flex justify-content-between mb-2">
      <Button variant="outlined" onClick={() => setShowColumns((value) => !value)}>{showColumns ? "Hide Columns" : "Show Columns"}</Button>
      <Button variant="contained" startIcon={<RefreshIcon />} disabled={!tickets.length} onClick={recalculatePage}>Recalculate page</Button>
    </div>
    {showColumns && <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}><FormGroup row>{columns.map((column) =>
      <FormControlLabel key={column.key} control={<Checkbox checked={visible[column.key] !== false} onChange={() => setVisible((state) => ({ ...state, [column.key]: !state[column.key] }))} />} label={String(column.title)} />
    )}</FormGroup></Paper>}
    <GenericTable rowKey="id" pagination={false} dataSource={tickets} columns={columns.filter(({ key }) => visible[key]) as any} />
  </>;
};

export default SlaManagementTable;
