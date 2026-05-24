import React from 'react';
import { Box, CircularProgress, Tooltip, Typography } from '@mui/material';
import type { ColumnsType } from 'antd/es/table';
import GenericTable from '../components/UI/GenericTable';
import { useApi } from '../hooks/useApi';
import { getReportDownloadUrl, getReportRequests } from '../services/TicketService';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import { formatDateTimeWithRelative } from '../utils/Utils';
import Title from '../components/Title';

type ReportRequestRow = {
  requestId: string;
  reportCode?: string;
  status?: string;
  outputFormat?: string;
  requestedAt?: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  fileName?: string;
  downloadPath?: string;
  requestedByDetails?: {
    userId?: string;
    username?: string;
    name?: string;
  };
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

  const renderDateCell = React.useCallback((value?: string) => {
    if (!value) return '-';
    const { formatted, relative } = formatDateTimeWithRelative(value);
    return (
      <Box>
        <Typography variant="body2">{formatted}</Typography>
        {relative ? <Typography variant="caption" color="text.secondary">{relative}</Typography> : null}
      </Box>
    );
  }, []);

  const columns = React.useMemo<ColumnsType<ReportRequestRow>>(
    () => [
      { title: 'Report', dataIndex: 'reportCode', key: 'reportCode', render: (value) => value || '-' },
      { title: 'Format', dataIndex: 'outputFormat', key: 'outputFormat', render: (value) => value || '-' },
      {
        title: 'Requested By',
        key: 'requestedBy',
        render: (_, row) => {
          const name = row.requestedByDetails?.name || '-';
          const username = row.requestedByDetails?.username;
          if (!username || name === '-') return name;
          return <Tooltip title={username}><span>{name}</span></Tooltip>;
        },
      },
      { title: 'Requested At', dataIndex: 'requestedAt', key: 'requestedAt', render: (value) => renderDateCell(value) },
      {
        title: 'Completed At',
        key: 'doneAt',
        render: (_, row) => renderDateCell(row.completedAt || row.failedAt),
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, row) => {
          if (row.status === 'QUEUED' || row.status === 'IN_PROGRESS') {
            return <CircularProgress size={18} />;
          }

          if (row.status === 'FAILED') {
            return <CustomIconButton icon="error" size="small" disabled aria-label="Failed" sx={{ color: "error.main" }} />;
          }

          if (row.downloadPath && row.status === 'COMPLETED') {
            return (
              <CustomIconButton
                icon="download"
                size="small"
                component="a"
                href={getReportDownloadUrl(row.downloadPath)}
                aria-label="Download"
              />
            );
          }

          return '-';
        },
      },
    ],
    [renderDateCell],
  );

  return (
    <div className='d-flex w-100'>
      <div flex-grow-1>
        <Title textKey="Downloads" />
        <div className='d-flex justify-content-end'>
          <CustomIconButton icon="replay" onClick={load} disabled={pending} aria-label="Refresh" />
        </div>
        <GenericTable
          rowKey="requestId"
          dataSource={rows}
          columns={columns}
          loading={pending}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </div>
    </div>
  );
};

export default Downloads;
