import React, { useEffect, useMemo, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getAssignmentHistory } from '../../services/AssignmentHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import HistoryReportDownloadMenu, { HistoryReportColumn } from '../History/HistoryReportDownloadMenu';

interface HistoryEntry {
    id: string;
    assignedBy: string;
    assignedTo: string;
    timestamp: string;
    remark?: string;
}

interface AssignmentHistoryProps {
    ticketId: string;
}

const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const { t } = useTranslation();

    useEffect(() => {
        apiHandler(() => getAssignmentHistory(ticketId));
    }, [ticketId]);

    const columns = [
        { title: t('Assigned By'), dataIndex: 'assignedBy', key: 'assignedBy' },
        { title: t('Assigned To'), dataIndex: 'assignedTo', key: 'assignedTo' },
        {
            title: t('Assigned On'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (v: string) => new Date(v).toLocaleString(),
        },
        { title: t('Remark'), dataIndex: 'remark', key: 'remark', render: (v: string) => v || '-' },
    ];

    const history = useMemo(() => (Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : []), [data]);

    const reportColumns: HistoryReportColumn<HistoryEntry>[] = [
        { key: 'assignedBy', header: t('Assigned By'), getValue: (row) => row.assignedBy || '-' },
        { key: 'assignedTo', header: t('Assigned To'), getValue: (row) => row.assignedTo || '-' },
        { key: 'timestamp', header: t('Assigned On'), getValue: (row) => row.timestamp ? new Date(row.timestamp).toLocaleString() : '-' },
        { key: 'remark', header: t('Remark'), getValue: (row) => row.remark || '-' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                <HistoryReportDownloadMenu
                    title={`Ticket ${ticketId} - ${t('Assignment History')}`}
                    fileBaseName={`${ticketId}-assignment-history`}
                    rows={history}
                    columns={reportColumns}
                />
                <ViewToggle
                    value={view}
                    onChange={setView}
                    options={[
                        { icon: 'table', value: 'table' },
                        { icon: 'timeline', value: 'timeline' }
                    ]}
                />
            </div>
            {view === 'table' ? (
                <GenericTable
                    dataSource={history}
                    columns={columns as any}
                    rowKey="id"
                    pagination={false}
                    rowClassName={(_, idx) => (idx === 0 ? 'latest-row' : '')}
                />
            ) : (
                <Timeline>
                    {history.map((h, idx) => (
                        <TimelineItem key={h.id}>
                            <TimelineSeparator>
                                <TimelineDot sx={{ bgcolor: idx === 0 ? 'warning.light' : undefined }} />
                                {idx < history.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                                <Paper elevation={2} sx={{ p: 1 }}>
                                    <strong>{h.assignedTo}</strong>
                                    <div style={{ fontSize: 12 }}>
                                        {new Date(h.timestamp).toLocaleString()} - {h.assignedBy}
                                    </div>
                                    {h.remark && <div style={{ fontSize: 12 }}>{h.remark}</div>}
                                </Paper>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            )}
        </div>
    );
};

export default AssignmentHistory;
