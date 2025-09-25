import React, { useEffect, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getStatusHistory } from '../../services/StatusHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Paper, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getStatuses } from '../../utils/Utils';

interface HistoryEntry {
    id: string;
    updatedBy: string;
    timestamp: string;
    previousStatus: string;
    currentStatus: string;
    remark?: string;
}

interface StatusHistoryProps {
    ticketId: string;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [statusMap, setStatusMap] = useState<Record<string, string>>({});

    useEffect(() => {
        apiHandler(() => getStatusHistory(ticketId));
    }, [ticketId]);

    useEffect(() => {
        getStatuses().then(list => {
            const map: Record<string, string> = {};
            list.forEach((s: any) => {
                map[s.statusId] = s.statusName;
            });
            setStatusMap(map);
        });
    }, []);

    const columns = [
        { title: t('Updated By'), dataIndex: 'updatedBy', key: 'updatedBy' },
        {
            title: t('Updated On'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (v: string) => new Date(v).toLocaleString(),
        },
        {
            title: t('Status'),
            dataIndex: 'currentStatus',
            key: 'currentStatus',
            render: (v: string) => {
                const statusLabel = statusMap[v] || v?.replace(/_/g, ' ');
                return statusLabel ? t(statusLabel) : '';
            }
        },
        { title: t('Remark'), dataIndex: 'remark', key: 'remark', render: (v: string) => v || '-' },
    ];

    const history = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : [];

    return (
        <div>
            <div className="d-flex justify-content-end mb-2">
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
                    {history.map((h, idx) => {
                        const timelineStatusLabel = statusMap[h?.currentStatus] || h?.currentStatus?.replace(/_/g, ' ');
                        return (
                            <TimelineItem key={h.id}>
                                <TimelineSeparator>
                                    <TimelineDot sx={{ bgcolor: idx === 0 ? 'warning.light' : undefined }} />
                                    {idx < history.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Paper elevation={2} sx={{ p: 1 }}>
                                        <strong>{timelineStatusLabel ? t(timelineStatusLabel) : ''}</strong>
                                        <div style={{ fontSize: 12 }}>
                                            {new Date(h.timestamp).toLocaleString()} - {h.updatedBy}
                                        </div>
                                        {h.remark && <div style={{ fontSize: 12 }}>{h.remark}</div>}
                                    </Paper>
                                </TimelineContent>
                            </TimelineItem>
                        );
                    })}
                </Timeline>
            )}
        </div>
    );
};

export default StatusHistory;
