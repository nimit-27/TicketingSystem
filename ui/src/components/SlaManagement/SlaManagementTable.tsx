import React, { useMemo, useState } from "react";
import { Button, Checkbox, FormControlLabel, FormGroup, Paper, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import GenericTable from "../UI/GenericTable";
import { TicketRow } from "../AllTickets/TicketsTable";
import { recalculateTicketSla, recalculateTicketSlas } from "../../services/TicketService";
import { useSnackbar } from "../../context/SnackbarContext";

const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString() : "-";
const formatMinutes = (value?: number) => value == null ? "-" : `${Math.floor(Math.abs(value) / 60)}h ${Math.abs(value) % 60}m`;

const SlaManagementTable: React.FC<{ tickets: TicketRow[]; refresh: () => void }> = ({ tickets, refresh }) => {
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const [showColumns, setShowColumns] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    id: true, reportedDate: true, status: true, breachIn: true, dueAt: true, resolutionTime: true, action: true,
    subject: false, category: false, priority: false, assignee: false,
  });

  const recalculate = async (id: string) => {
    setBusyIds((ids) => [...ids, id]);
    try {
      await recalculateTicketSla(id);
      showMessage("SLA recalculated successfully", "success");
      refresh();
    } catch {
      showMessage("Unable to recalculate SLA", "error");
    } finally {
      setBusyIds((ids) => ids.filter((value) => value !== id));
    }
  };

  const recalculatePage = async () => {
    try {
      await recalculateTicketSlas(tickets.map(({ id }) => id));
      showMessage("SLA recalculation started for this page", "success");
    } catch {
      showMessage("Unable to start SLA recalculation", "error");
    }
  };

  const columns = useMemo(() => [
    { key: "id", title: "Ticket ID", dataIndex: "id" },
    { key: "reportedDate", title: "Reported Date", render: (_: unknown, row: TicketRow) => formatDateTime(row.reportedDate) },
    { key: "status", title: "Status", render: (_: unknown, row: TicketRow) => row.statusLabel || "-" },
    { key: "breachIn", title: "Breach In", render: (_: unknown, row: TicketRow) => row.sla?.breachedByMinutes != null && row.sla.breachedByMinutes > 0 ? `Breached by ${formatMinutes(row.sla.breachedByMinutes)}` : formatMinutes(row.sla?.breachedByMinutes) },
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
  ], [busyIds, navigate]);

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
