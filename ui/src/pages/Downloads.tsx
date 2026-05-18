import React from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import type { ColumnsType } from 'antd/es/table';
import GenericTable from '../components/UI/GenericTable';
import { useApi } from '../hooks/useApi';
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
  const { data, pending, apiHandler } = useApi<ReportRequestRow[]>();
  const rows = React.useMemo(() => data ?? [], [data]);

  const load = React.useCallback(async () => {
    await apiHandler(() => getReportRequests());
  }, [apiHandler]);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  const columns = React.useMemo<ColumnsType<ReportRequestRow>>(
    () => [
      { title: 'Request ID', dataIndex: 'requestId', key: 'requestId', width: 120 },
      { title: 'Report', dataIndex: 'reportCode', key: 'reportCode', render: (value) => value || '-' },
      { title: 'Format', dataIndex: 'outputFormat', key: 'outputFormat', render: (value) => value || '-' },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value) => <Chip label={value || 'UNKNOWN'} color={statusColor(value)} size="small" />,
      },
      { title: 'Requested At', dataIndex: 'requestedAt', key: 'requestedAt', render: (value) => value || '-' },
      {
        title: 'Completed/Failed',
        key: 'doneAt',
        render: (_, row) => row.completedAt || row.failedAt || '-',
      },
      { title: 'File', dataIndex: 'fileName', key: 'fileName', render: (value) => value || '-' },
      {
        title: 'Action',
        key: 'action',
        render: (_, row) => (row.downloadPath && row.status === 'COMPLETED'
          ? <Button size="small" variant="contained" onClick={() => window.open(row.downloadPath, '_blank')}>Download</Button>
          : '-'),
      },
    ],
    [],
  );

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Downloads</Typography>
        <Button variant="outlined" onClick={load} disabled={pending}>Refresh</Button>
      </Box>
      <GenericTable
        rowKey="requestId"
        dataSource={rows}
        columns={columns}
        loading={pending}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Box>
  );
};

export default Downloads;
