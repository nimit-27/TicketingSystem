import React from 'react';
import { Box, Button, Chip, CircularProgress, Divider, Tooltip, Typography } from '@mui/material';
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
  filtersJson?: string;
};
type FilterItem = { key?: string; label?: string; value?: string | string[]; display_value?: string | string[]; is_all?: boolean };
type ParsedFilters = { fromDate?: string; toDate?: string; otherFilters: FilterItem[] };

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
  const [expandedFilters, setExpandedFilters] = React.useState<Record<string, boolean>>({});

  const parseFilters = React.useCallback((filtersJson?: string): ParsedFilters => {
    if (!filtersJson) return { otherFilters: [] };
    try {
      const parsed = typeof filtersJson === 'string' ? JSON.parse(filtersJson) : filtersJson;
      const filters: FilterItem[] = Array.isArray(parsed?.filters) ? parsed.filters : [];
      const visible = filters.filter((item) => !item?.is_all);
      const fromDate = visible.find((item) => item?.key === 'fromDate')?.display_value as string | undefined;
      const toDate = visible.find((item) => item?.key === 'toDate')?.display_value as string | undefined;
      return {
        fromDate,
        toDate,
        otherFilters: visible.filter((item) => item?.key !== 'fromDate' && item?.key !== 'toDate'),
      };
    } catch {
      return { otherFilters: [] };
    }
  }, []);

  const renderFilterChip = React.useCallback((filter: FilterItem, index: number) => {
    const displayValues = Array.isArray(filter.display_value) ? filter.display_value : String(filter.display_value ?? '').split(',').map(v => v.trim()).filter(Boolean);
    return (
      <Chip
        key={`${filter.key}-${index}`}
        sx={{ bgcolor: '#e8f5e9', height: 'auto', '& .MuiChip-label': { py: 0.75 } }}
        label={(
          <Box>
            <Typography variant="caption" sx={{ fontSize: 10, lineHeight: 1.1 }}>{filter.label || filter.key}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {displayValues.map((value, valueIndex) => (
                <React.Fragment key={`${value}-${valueIndex}`}>
                  {valueIndex > 0 && <Divider orientation="vertical" flexItem />}
                  <Typography variant="body2">{value}</Typography>
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}
      />
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
        title: 'From Date',
        key: 'fromDate',
        render: (_, row) => renderDateCell(parseFilters(row.filtersJson).fromDate),
      },
      {
        title: 'To Date',
        key: 'toDate',
        render: (_, row) => renderDateCell(parseFilters(row.filtersJson).toDate),
      },
      {
        title: 'Other Filters',
        key: 'otherFilters',
        width: 360,
        render: (_, row) => {
          const filters = parseFilters(row.filtersJson).otherFilters;
          if (!filters.length) return '-';
          const expanded = expandedFilters[row.requestId];
          const visibleFilters = expanded ? filters : filters.slice(0, 3);
          return (
            <Box sx={{ maxWidth: 340 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {visibleFilters.map(renderFilterChip)}
              </Box>
              {filters.length > 3 && (
                <Button size="small" onClick={() => setExpandedFilters((prev) => ({ ...prev, [row.requestId]: !expanded }))}>
                  {expanded ? 'less...' : 'more...'}
                </Button>
              )}
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
    [expandedFilters, parseFilters, renderDateCell, renderFilterChip],
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
