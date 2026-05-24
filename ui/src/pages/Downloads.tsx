import React from 'react';
import { Box, Button, Chip, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import type { ColumnsType } from 'antd/es/table';
import GenericTable from '../components/UI/GenericTable';
import { useApi } from '../hooks/useApi';
import { getReportDownloadUrl, getReportRequests } from '../services/TicketService';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import { formatDateTimeWithRelative } from '../utils/Utils';
import Title from '../components/Title';

type ReportFilter = {
  key?: string;
  label?: string;
  value?: unknown;
  is_all?: boolean;
};

type FiltersPayload = {
  filters?: ReportFilter[];
  fromDate?: string;
  toDate?: string;
};

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
  filters_json?: string | FiltersPayload;
  requestedByDetails?: {
    userId?: string;
    username?: string;
    name?: string;
  };
};

const Downloads: React.FC = () => {
  const { data, pending, apiHandler } = useApi<ReportRequestRow[]>();
  const rows = React.useMemo(() => data ?? [], [data]);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

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

  const parseFilters = React.useCallback((payload?: string | FiltersPayload): FiltersPayload => {
    if (!payload) return {};
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload) as FiltersPayload;
      } catch (_) {
        return {};
      }
    }
    return payload;
  }, []);

  const renderFilterValue = React.useCallback((value: unknown) => {
    if (Array.isArray(value)) {
      const values = value.map(String).filter(Boolean);
      if (!values.length) return '-';
      return (
        <Stack direction="row" spacing={0} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {values.map((item, idx) => (
            <Typography
              key={`${item}-${idx}`}
              variant="body2"
              sx={{
                fontWeight: 600,
                px: 0.75,
                borderLeft: idx === 0 ? 'none' : '1px solid',
                borderColor: 'success.light',
              }}
            >
              {item}
            </Typography>
          ))}
        </Stack>
      );
    }
    if (value === null || value === undefined || value === '') return '-';
    return <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(value)}</Typography>;
  }, []);

  const renderFilterChip = React.useCallback((label: string, value: unknown, key: string) => (
    <Chip
      key={key}
      variant="filled"
      sx={{
        backgroundColor: '#e8f5e9',
        color: 'success.dark',
        border: '1px solid',
        borderColor: 'success.light',
        borderRadius: 2,
        height: 'auto',
        maxWidth: 250,
        '& .MuiChip-label': {
          display: 'block',
          whiteSpace: 'normal',
          py: 0.75,
        },
      }}
      label={
        <Box>
          <Typography variant="caption" sx={{ display: 'block', color: 'success.dark', opacity: 0.9 }}>
            {label}
          </Typography>
          {renderFilterValue(value)}
        </Box>
      }
    />
  ), [renderFilterValue]);

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
        title: 'From Date',
        key: 'fromDate',
        render: (_, row) => {
          const filters = parseFilters(row.filters_json);
          return renderDateCell(filters.fromDate);
        },
      },
      {
        title: 'To Date',
        key: 'toDate',
        render: (_, row) => {
          const filters = parseFilters(row.filters_json);
          return renderDateCell(filters.toDate);
        },
      },
      {
        title: 'Other Filters',
        key: 'otherFilters',
        render: (_, row) => {
          const filters = parseFilters(row.filters_json);
          const chips = (filters.filters ?? []).filter((f) => f.is_all === false && f.key !== 'fromDate' && f.key !== 'toDate');
          if (!chips.length) return '-';

          const expanded = !!expandedRows[row.requestId];
          const visible = expanded ? chips : chips.slice(0, 3);
          return (
            <Box sx={{ maxWidth: 360 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {visible.map((filter, index) => renderFilterChip(filter.label || filter.key || 'Filter', filter.value, `${row.requestId}-${filter.key || index}`))}
              </Stack>
              {chips.length > 3 ? (
                <Button
                  size="small"
                  sx={{ mt: 0.5, px: 0, minWidth: 'auto' }}
                  onClick={() => setExpandedRows((prev) => ({ ...prev, [row.requestId]: !expanded }))}
                >
                  {expanded ? 'less...' : 'more...'}
                </Button>
              ) : null}
            </Box>
          );
        },
      },
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
            return <CustomIconButton icon="error" size="small" disabled aria-label="Failed" sx={{ color: 'error.main' }} />;
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
    [expandedRows, parseFilters, renderDateCell, renderFilterChip],
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
