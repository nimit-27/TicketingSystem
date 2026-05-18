import React from 'react';
import { Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { getReportRequests } from '../services/TicketService';

type ReportRequestRow = {
  requestId: number;
  reportCode?: string;
  status?: string;
  outputFormat?: string;
  requestedAt?: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  fileName?: string;
  downloadPath?: string;
};

const statusColor = (status?: string): 'default' | 'warning' | 'success' | 'error' => {
  if (status === 'QUEUED' || status === 'IN_PROGRESS') return 'warning';
  if (status === 'COMPLETED') return 'success';
  if (status === 'FAILED') return 'error';
  return 'default';
};

const Downloads: React.FC = () => {
  const [rows, setRows] = React.useState<ReportRequestRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReportRequests();
      setRows(response?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Downloads</Typography>
        <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Request ID</TableCell>
              <TableCell>Report</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Completed/Failed</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.requestId}>
                <TableCell>{row.requestId}</TableCell>
                <TableCell>{row.reportCode || '-'}</TableCell>
                <TableCell>{row.outputFormat || '-'}</TableCell>
                <TableCell><Chip label={row.status || 'UNKNOWN'} color={statusColor(row.status)} size="small" /></TableCell>
                <TableCell>{row.requestedAt || '-'}</TableCell>
                <TableCell>{row.completedAt || row.failedAt || '-'}</TableCell>
                <TableCell>{row.fileName || '-'}</TableCell>
                <TableCell>
                  {row.downloadPath && row.status === 'COMPLETED' ? (
                    <Button size="small" variant="contained" onClick={() => window.open(row.downloadPath, '_blank')}>Download</Button>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Downloads;
