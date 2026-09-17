import React, { useContext, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import GenericTable from './UI/GenericTable';
import { useApi } from '../hooks/useApi';
import { getTicketHistory, previewTicketHistoryTimestamp, TicketHistoryTimestampPreview, TicketHistoryTimestampUpdate, undoTicketHistoryTimestamp, updateTicketHistoryTimestamp } from '../services/TicketService';
import { DevModeContext } from '../context/DevModeContext';
import { TicketSla } from '../types';

type TicketHistoryEntry = {
  ticketHistoryId: number;
  displayLabel?: string;
  oldValue?: string;
  newValue?: string;
  updatedBy?: string;
  updatedOn?: string;
  updatedOnUtc?: string;
  originalTimestamp?: string;
  updatedTimestamp?: string;
  remarks?: string;
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const datePart = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = date.toLocaleTimeString();
  return `${datePart}, ${timePart}`;
};

const truncate = (value?: string, max = 30) => {
  if (!value) return '-';
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const shiftLocalTimestamp = (value: string, minutes: number) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const slaMetrics: Array<{ key: keyof TicketSla; label: string; date?: boolean }> = [
  { key: 'actualDueAt', label: 'Original Due Date', date: true },
  { key: 'dueAtAfterEscalation', label: 'Due Date After Escalation', date: true },
  { key: 'dueAt', label: 'Current Due Date', date: true },
  { key: 'timeTillDueDate', label: 'Time Till Due Date (mins)' },
  { key: 'workingTimeLeftMinutes', label: 'Working Time Left (mins)' },
  { key: 'responseTimeMinutes', label: 'Response Time (mins)' },
  { key: 'resolutionTimeMinutes', label: 'Resolution Time (mins)' },
  { key: 'idleTimeMinutes', label: 'Idle Time (mins)' },
  { key: 'elapsedTimeMinutes', label: 'Elapsed Time (mins)' },
  { key: 'breachedByMinutes', label: 'Breached By (mins)' },
];

const formatSlaValue = (sla: TicketSla | null | undefined, key: keyof TicketSla, date?: boolean) => {
  const value = sla?.[key];
  if (value === null || value === undefined || value === '') return '-';
  return date ? formatDateTime(String(value)) : String(value);
};

const TicketHistory: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const { data, apiHandler } = useApi<TicketHistoryEntry[]>();
  const [selected, setSelected] = useState<TicketHistoryEntry | null>(null);
  const [editing, setEditing] = useState<TicketHistoryEntry | null>(null);
  const [timestamp, setTimestamp] = useState('');
  const [minutes, setMinutes] = useState('');
  const [preview, setPreview] = useState<TicketHistoryTimestampPreview | null>(null);
  const [limits, setLimits] = useState<TicketHistoryTimestampPreview | null>(null);
  const [previewedUpdate, setPreviewedUpdate] = useState<TicketHistoryTimestampUpdate | null>(null);
  const { apiHandler: previewApiHandler, pending: previewing } = useApi<TicketHistoryTimestampPreview>();
  const { devMode } = useContext(DevModeContext);

  const previewAtLimit = async (value: string) => {
    if (!editing) return;
    setTimestamp(value.slice(0, 16));
    setMinutes('');
    const update = { timestamp: value };
    const result = await previewApiHandler(() => previewTicketHistoryTimestamp(editing.ticketHistoryId, update));
    if (result) { setPreview(result); setLimits(result); setPreviewedUpdate(update); }
  };

  const reload = () => apiHandler(() => getTicketHistory(ticketId));

  React.useEffect(() => {
    if (!ticketId) return;
    void apiHandler(() => getTicketHistory(ticketId));
  }, [ticketId, apiHandler]);

  const rows = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const columns = [
    {
      title: 'Updated By / On',
      key: 'updatedByOn',
      width: '15%',
      render: (_: unknown, row: TicketHistoryEntry) => (
        <Box sx={{ color: 'text.secondary' }}>
          <Typography variant="body2">{row.updatedBy || '-'}</Typography>
          <Typography variant="caption">{formatDateTime(row.updatedOnUtc || row.updatedOn)}</Typography>
        </Box>
      ),
    },
    { title: 'What Updated', dataIndex: 'displayLabel', key: 'displayLabel', width: '15%', render: (v: string) => v || '-' },
    {
      title: 'Update',
      key: 'update',
      width: '40%',
      render: (_: unknown, row: TicketHistoryEntry) => {
        const oldText = row.oldValue || '-';
        const newText = row.newValue || '-';
        const hasLong = (row.oldValue?.length || 0) > 30 || (row.newValue?.length || 0) > 30;
        return (
          <Box sx={{ cursor: hasLong ? 'pointer' : 'default' }} onClick={() => hasLong && setSelected(row)}>
            {truncate(oldText)} {'->'} {truncate(newText)}
          </Box>
        );
      },
    },
    { title: 'Remark', dataIndex: 'remarks', key: 'remarks', width: '30%', render: (v: string) => v || '-' },
    ...(devMode ? [{
      title: 'Edit Time',
      key: 'editTime',
      render: (_: unknown, row: TicketHistoryEntry) => <>
        <Tooltip title="Edit ticket history timestamp">
          <Button size="small" aria-label={`Edit ticket history timestamp ${row.ticketHistoryId}`} onClick={async () => {
            setEditing(row);
            const value = row.updatedTimestamp || row.updatedOn;
            setTimestamp(value ? value.slice(0, 16) : '');
            setMinutes('');
            setPreview(null);
            setLimits(null);
            setPreviewedUpdate(null);
            if (value) {
              const current = { timestamp: value.length === 16 ? `${value}:00` : value };
              const result = await previewApiHandler(() => previewTicketHistoryTimestamp(row.ticketHistoryId, current));
              if (result) { setPreview(result); setLimits(result); }
            }
          }}><EditCalendarOutlinedIcon fontSize="small" /></Button>
        </Tooltip>
        {row.updatedTimestamp && <Tooltip title="Restore original timestamp">
          <Button size="small" aria-label={`Undo ticket history timestamp ${row.ticketHistoryId}`} onClick={async () => {
            const undone = await apiHandler(() => undoTicketHistoryTimestamp(row.ticketHistoryId));
            if (undone) void reload();
          }}><UndoOutlinedIcon fontSize="small" /></Button>
        </Tooltip>}
      </>,
    }] : []),
  ];

  return (
    <>
      <GenericTable rowKey={(row: TicketHistoryEntry) => row.ticketHistoryId} dataSource={rows} columns={columns as any} pagination={false} />
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>History Update Detail</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Old Value</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selected?.oldValue || '-'}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">New Value</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selected?.newValue || '-'}</Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {devMode && editing && <Dialog open onClose={() => setEditing(null)} fullWidth maxWidth={previewedUpdate && (preview?.currentSla || preview?.newSla) ? 'lg' : 'xs'}>
        <DialogTitle>Edit ticket history timestamp</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <TextField fullWidth label="Timestamp" type="datetime-local" value={timestamp}
            onChange={(event) => {
              setTimestamp(event.target.value);
              setPreview(null);
              setPreviewedUpdate(null);
            }} slotProps={{
              inputLabel: { shrink: true },
              htmlInput: {
                min: limits?.minimumTimestamp?.slice(0, 16),
                max: limits?.maximumTimestamp?.slice(0, 16),
              },
            }} />
          <Button sx={{ mt: 1 }} fullWidth variant="outlined" disabled={!timestamp || previewing} onClick={async () => {
            const update = { timestamp: timestamp.length === 16 ? `${timestamp}:00` : timestamp };
            const result = await previewApiHandler(() => previewTicketHistoryTimestamp(editing.ticketHistoryId, update));
            if (result) { setPreview(result); setLimits(result); setPreviewedUpdate(update); }
          }}>Preview timestamp</Button>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button fullWidth variant="outlined" disabled={!limits?.minimumTimestamp || previewing} onClick={() => {
              void previewAtLimit(shiftLocalTimestamp(limits!.minimumTimestamp!, 10));
            }}>Minimize lower limit</Button>
            <Button fullWidth variant="outlined" disabled={!limits?.maximumTimestamp || previewing} onClick={() => {
              void previewAtLimit(shiftLocalTimestamp(limits!.maximumTimestamp!, -10));
            }}>Maximize upper limit</Button>
          </Box>
          <TextField fullWidth sx={{ mt: 2 }} label="Business minutes to add or subtract" type="number"
            value={minutes} onChange={(event) => {
              setMinutes(event.target.value);
              setPreview(null);
              setPreviewedUpdate(null);
            }} helperText="Use a negative value to subtract business time."
            slotProps={{ htmlInput: { min: limits?.minimumBusinessMinutes, max: limits?.maximumBusinessMinutes } }} />
          <Button sx={{ mt: 1 }} fullWidth variant="outlined" disabled={minutes === '' || !Number.isFinite(Number(minutes)) || previewing} onClick={async () => {
            const update = { addMinutes: Number(minutes) };
            const result = await previewApiHandler(() => previewTicketHistoryTimestamp(editing.ticketHistoryId, update));
            if (result) { setPreview(result); setLimits(result); setPreviewedUpdate(update); }
          }}>Calculate business time</Button>
          {limits && <Box sx={{ mt: 2 }}>
            {preview && <Typography variant="body2"><strong>Final calculated time:</strong> {formatDateTime(preview.calculatedTimestamp)}</Typography>}
            <Typography variant="caption" display="block">Minimum time: {limits.minimumTimestamp ? formatDateTime(limits.minimumTimestamp) : 'No limit'}</Typography>
            <Typography variant="caption" display="block">Maximum time: {limits.maximumTimestamp ? formatDateTime(limits.maximumTimestamp) : 'No limit'}</Typography>
            <Typography variant="caption" display="block">Minimum business minutes: {limits.minimumBusinessMinutes ?? 'No limit'}</Typography>
            <Typography variant="caption" display="block">Maximum business minutes: {limits.maximumBusinessMinutes ?? 'No limit'}</Typography>
          </Box>}
          {previewedUpdate && preview && (preview.currentSla || preview.newSla) && <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>SLA change preview</Typography>
            <Table size="small" aria-label="SLA change preview">
              <TableHead><TableRow>
                <TableCell>SLA metric</TableCell>
                <TableCell sx={{ width: '38%' }}>Current SLA data</TableCell>
                <TableCell sx={{ width: '38%' }}>New SLA data</TableCell>
              </TableRow></TableHead>
              <TableBody>{slaMetrics.map(({ key, label, date }) => {
                const current = formatSlaValue(preview.currentSla, key, date);
                const next = formatSlaValue(preview.newSla, key, date);
                return <TableRow key={key}>
                  <TableCell>{label}</TableCell>
                  <TableCell>{current}</TableCell>
                  <TableCell sx={current !== next ? { bgcolor: 'warning.light', fontWeight: 700 } : undefined}>{next}</TableCell>
                </TableRow>;
              })}</TableBody>
            </Table>
          </Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" disabled={!previewedUpdate} onClick={async () => {
            const updated = await apiHandler(() => updateTicketHistoryTimestamp(editing.ticketHistoryId, previewedUpdate!));
            if (updated) {
              setEditing(null);
              void reload();
            }
          }}>Save</Button>
        </DialogActions>
      </Dialog>}
    </>
  );
};

export default TicketHistory;
