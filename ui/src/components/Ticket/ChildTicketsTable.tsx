import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tooltip } from '@mui/material';
import GenericTable from '../UI/GenericTable';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { TicketRow } from '../AllTickets/TicketsTable';
import { getStatusNameById, truncateWithEllipsis } from '../../utils/Utils';

interface ChildTicketsTableProps {
  tickets: TicketRow[];
  loading: boolean;
  unlinkingId?: string | null;
  onView: (id: string) => void;
  onUnlink: (id: string) => void;
}

const ChildTicketsTable: React.FC<ChildTicketsTableProps> = ({
  tickets,
  loading,
  unlinkingId,
  onView,
  onUnlink,
}) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        title: t('Ticket Id'),
        dataIndex: 'id',
        key: 'id',
        ellipsis: true,
        render: (_: unknown, record: TicketRow) => (
          <Tooltip title={record.id} placement="top">
            <span
              role="button"
              tabIndex={0}
              onClick={() => onView(record.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onView(record.id);
                }
              }}
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            >
              {truncateWithEllipsis(record.id, 10)}
            </span>
          </Tooltip>
        ),
      },
      {
        title: t('Subject'),
        dataIndex: 'subject',
        key: 'subject',
        ellipsis: true,
        render: (value: string) => (
          <Tooltip title={value} placement="top">
            <span>{truncateWithEllipsis(value ?? '-', 40)}</span>
          </Tooltip>
        ),
      },
      {
        title: t('Category'),
        dataIndex: 'category',
        key: 'category',
        ellipsis: true,
        render: (_: unknown, record: TicketRow) => (
          <span>{record.category && record.subCategory ? `${record.category} > ${record.subCategory}` : record.category || '-'}</span>
        ),
      },
      {
        title: t('Status'),
        dataIndex: 'statusId',
        key: 'status',
        ellipsis: true,
        render: (_: unknown, record: TicketRow) => {
          const statusName = record.statusId ? getStatusNameById(record.statusId) : null;
          return <span>{statusName || record.statusLabel || '-'}</span>;
        },
      },
      {
        title: t('Assigned To'),
        dataIndex: 'assignedToName',
        key: 'assignedTo',
        ellipsis: true,
        render: (_: unknown, record: TicketRow) => (
          <span>{record.assignedToName || record.assignedTo || '-'}</span>
        ),
      },
      {
        title: t('Actions'),
        key: 'actions',
        width: 120,
        render: (_: unknown, record: TicketRow) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('View')}>
              <span>
                <CustomIconButton
                  icon="visibility"
                  size="small"
                  onClick={() => onView(record.id)}
                  aria-label={t('View ticket {{id}}', { id: record.id })}
                />
              </span>
            </Tooltip>
            <Tooltip title={t('Unlink')}>
              <span>
                <CustomIconButton
                  icon="linkOff"
                  size="small"
                  onClick={() => onUnlink(record.id)}
                  disabled={unlinkingId === record.id}
                  aria-label={t('Unlink ticket {{id}}', { id: record.id })}
                />
              </span>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [onUnlink, onView, t, unlinkingId]
  );

  return (
    <GenericTable
      className="tickets-table"
      dataSource={tickets}
      columns={columns as any}
      rowKey="id"
      pagination={false}
      loading={loading}
      locale={{ emptyText: t('No child tickets linked yet.') }}
    />
  );
};

export default ChildTicketsTable;
