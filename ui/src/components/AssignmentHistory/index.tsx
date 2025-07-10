import React, { useEffect, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getAssignmentHistory } from '../../services/AssignmentHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Paper, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HistoryEntry {
    id: number;
    assignedBy: string;
    assignedTo: string;
    timestamp: string;
}

interface AssignmentHistoryProps {
    ticketId: number;
}

const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                                    <strong>{h.assignedTo}</strong>
                                    <div style={{ fontSize: 12 }}>
                                        {new Date(h.timestamp).toLocaleString()} - {h.assignedBy}
                                    </div>
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
