import React, { useEffect, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getStatusHistory } from '../../services/StatusHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Paper, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HistoryEntry {
    id: number;
    updatedBy: string;
    timestamp: string;
    previousStatus: string;
    currentStatus: string;
}

interface StatusHistoryProps {
    ticketId: number;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        apiHandler(() => getStatusHistory(ticketId));
    }, [ticketId]);

    const columns = [
        { title: t('Updated By'), dataIndex: 'updatedBy', key: 'updatedBy' },
        {
            title: t('Timestamp'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (v: string) => new Date(v).toLocaleString(),
        },
        {
            title: t('Previous Status'),
            dataIndex: 'previousStatus',
            key: 'previousStatus',
            render: (v: string) => v?.replace(/_/g, ' ')
        },
        {
            title: t('Current Status'),
            dataIndex: 'currentStatus',
            key: 'currentStatus',
            render: (v: string) => v?.replace(/_/g, ' ')
        },
    ];

    const history = Array.isArray(data) ? data : [];

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
                <GenericTable dataSource={history} columns={columns as any} rowKey="id" pagination={false} />
            ) : (
                <Timeline>
                    {history.map((h, idx) => (
                        <TimelineItem key={h.id}>
                            <TimelineSeparator>
                                <TimelineDot />
                                {idx < history.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                                <Paper elevation={2} sx={{ p: 1 }}>
                                    <strong>{h.currentStatus.replace(/_/g, ' ')}</strong>
                                    <div style={{ fontSize: 12 }}>
                                        {new Date(h.timestamp).toLocaleString()} - {h.updatedBy}
                                    </div>
                                    <div style={{ fontSize: 12 }}>{t('Previous Status')}: {h.previousStatus.replace(/_/g, ' ')}</div>
                                </Paper>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            )}
        </div>
    );
};

export default StatusHistory;
