import React, { useEffect, useMemo, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getDivisionHistory } from '../../services/DivisionHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import HistoryReportDownloadMenu, { HistoryReportColumn } from '../History/HistoryReportDownloadMenu';

interface HistoryEntry {
    id: string;
    previousDivision?: string;
    currentDivision?: string;
    divisionName?: string;
    updatedBy?: string;
    timestamp: string;
    remark?: string;
}

interface DivisionHistoryProps {
    ticketId: string;
}

const resolveDivisionName = (entry: HistoryEntry, key: 'current' | 'previous') => {
    if (key === 'current') {
        return entry.currentDivision || entry.divisionName || '-';
    }
    return entry.previousDivision || '-';
};

const DivisionHistory: React.FC<DivisionHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const { t } = useTranslation();

    useEffect(() => {
        apiHandler(() => getDivisionHistory(ticketId));
    }, [apiHandler, ticketId]);

    const history = useMemo(() => (Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : []), [data]);

    const columns = [
        { title: t('Previous Division'), dataIndex: 'previousDivision', key: 'previousDivision', render: (_: string, record: HistoryEntry) => resolveDivisionName(record, 'previous') },
        { title: t('Current Division'), dataIndex: 'currentDivision', key: 'currentDivision', render: (_: string, record: HistoryEntry) => resolveDivisionName(record, 'current') },
        { title: t('Updated By'), dataIndex: 'updatedBy', key: 'updatedBy', render: (v: string) => v || '-' },
        {
            title: t('Updated On'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (v: string) => new Date(v).toLocaleString(),
        },
        { title: t('Remark'), dataIndex: 'remark', key: 'remark', render: (v: string) => v || '-' },
    ];

    const reportColumns: HistoryReportColumn<HistoryEntry>[] = [
        { key: 'previousDivision', header: t('Previous Division'), getValue: (row) => resolveDivisionName(row, 'previous') },
        { key: 'currentDivision', header: t('Current Division'), getValue: (row) => resolveDivisionName(row, 'current') },
        { key: 'updatedBy', header: t('Updated By'), getValue: (row) => row.updatedBy || '-' },
        { key: 'timestamp', header: t('Updated On'), getValue: (row) => row.timestamp ? new Date(row.timestamp).toLocaleString() : '-' },
        { key: 'remark', header: t('Remark'), getValue: (row) => row.remark || '-' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                <HistoryReportDownloadMenu
                    title={`Ticket ${ticketId} - ${t('Division History')}`}
                    fileBaseName={`${ticketId}-division-history`}
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
                                    <strong>{resolveDivisionName(h, 'current')}</strong>
                                    <div style={{ fontSize: 12 }}>
                                        {new Date(h.timestamp).toLocaleString()} - {h.updatedBy || '-'}
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

export default DivisionHistory;
