import React, { useMemo, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import GenericTable from './UI/GenericTable';
import { useApi } from '../hooks/useApi';
import { getTicketHistory } from '../services/TicketService';

type TicketHistoryEntry = {
  historyId: number;
  displayLabel?: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedOn?: string;
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

const TicketHistory: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  const { data, apiHandler } = useApi<TicketHistoryEntry[]>();
  const [selected, setSelected] = useState<TicketHistoryEntry | null>(null);

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
          <Typography variant="body2">{row.changedBy || '-'}</Typography>
          <Typography variant="caption">{formatDateTime(row.changedOn)}</Typography>
        </Box>
      ),
    },
    { title: 'What Changed', dataIndex: 'displayLabel', key: 'displayLabel', width: '15%', render: (v: string) => v || '-' },
    {
      title: 'Change',
      key: 'change',
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
  ];

  return (
    <>
      <GenericTable rowKey={(row: TicketHistoryEntry) => row.historyId} dataSource={rows} columns={columns as any} pagination={false} />
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>History Change Detail</DialogTitle>
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
    </>
  );
};

export default TicketHistory;
