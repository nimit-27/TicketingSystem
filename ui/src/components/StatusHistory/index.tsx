import React, { useContext, useEffect, useMemo, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getStatusHistory, updateStatusTimestamp } from '../../services/StatusHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField, Tooltip } from '@mui/material';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import { useTranslation } from 'react-i18next';
import { getAllUsers } from '../../services/UserService';
import HistoryReportDownloadMenu, { HistoryReportColumn } from '../History/HistoryReportDownloadMenu';
import { DevModeContext } from '../../context/DevModeContext';

interface HistoryEntry {
    id: string;
    updatedBy: string;
    timestamp: string;
    previousStatus: string;
    currentStatus: string;
    statusName?: string;
    label?: string;
    remark?: string;
}

interface HistoryWithNameEntry extends HistoryEntry {
    updatedByName: string;
}

interface StatusHistoryProps {
    ticketId: string;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
    const { t } = useTranslation();
    const { devMode } = useContext(DevModeContext);
    const [editing, setEditing] = useState<HistoryEntry | null>(null);
    const [timestamp, setTimestamp] = useState('');
    const [minutes, setMinutes] = useState('');

    const reload = () => apiHandler(() => getStatusHistory(ticketId));

    useEffect(() => {
        reload();
    }, [ticketId]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await getAllUsers();
                const users = Array.isArray(response?.data) ? response.data : [];
                const nameMap = users.reduce((acc: Record<string, string>, user: any) => {
                    const username = user?.username;
                    const name = user?.name;
                    if (username) {
                        acc[username] = name || username;
                    }
                    return acc;
                }, {});
                setUserNameMap(nameMap);
            } catch {
                setUserNameMap({});
            }
        };

        loadUsers();
    }, []);

    const history = useMemo(() => (Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : []), [data]);

    const historyWithNames = useMemo<HistoryWithNameEntry[]>(() => history.map((item: HistoryEntry) => ({
        ...item,
        updatedByName: userNameMap[item.updatedBy] || '-',
    })), [history, userNameMap]);

    const columns = [
        { title: t('Updated By'), dataIndex: 'updatedBy', key: 'updatedBy' },
        { title: t('Updated By Name'), dataIndex: 'updatedByName', key: 'updatedByName' },
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
            render: (_: string, record: HistoryEntry) => {
                const statusLabel = record.label || record.statusName || record.currentStatus?.replace(/_/g, ' ');
                return statusLabel ? t(statusLabel) : '';
            }
        },
        { title: t('Remark'), dataIndex: 'remark', key: 'remark', render: (v: string) => v || '-' },
        ...(devMode ? [{
            title: t('Edit Time'),
            key: 'editTime',
            render: (_: unknown, record: HistoryEntry) => (
                <Tooltip title={t('Edit status timestamp')}>
                    <Button aria-label={`Edit timestamp ${record.id}`} size="small" onClick={() => {
                        setEditing(record);
                        setTimestamp(record.timestamp ? record.timestamp.slice(0, 16) : '');
                        setMinutes('');
                    }}>
                        <EditCalendarOutlinedIcon fontSize="small" />
                    </Button>
                </Tooltip>
            ),
        }] : []),
    ];

    const saveTimestamp = async (useMinutes: boolean) => {
        if (!editing) return;
        const payload = useMinutes
            ? { addMinutes: Number(minutes) }
            : { timestamp: timestamp.length === 16 ? `${timestamp}:00` : timestamp };
        const updated = await apiHandler(() => updateStatusTimestamp(editing.id, payload));
        if (updated) {
            setEditing(null);
            reload();
        }
    };

    const reportColumns: HistoryReportColumn<HistoryWithNameEntry>[] = [
        { key: 'updatedBy', header: t('Updated By'), getValue: (row) => row.updatedBy || '-' },
        { key: 'updatedByName', header: t('Updated By Name'), getValue: (row) => row.updatedByName || '-' },
        { key: 'timestamp', header: t('Updated On'), getValue: (row) => row.timestamp ? new Date(row.timestamp).toLocaleString() : '-' },
        {
            key: 'status',
            header: t('Status'),
            getValue: (row) => row.label || row.statusName || row.currentStatus?.replace(/_/g, ' ') || '-',
        },
        { key: 'remark', header: t('Remark'), getValue: (row) => row.remark || '-' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
                <HistoryReportDownloadMenu
                    title={`Ticket ${ticketId} - ${t('Status History')}`}
                    fileBaseName={`${ticketId}-status-history`}
                    rows={historyWithNames}
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
                    dataSource={historyWithNames}
                    columns={columns as any}
                    rowKey="id"
                    pagination={false}
                    rowClassName={(_, idx) => (idx === 0 ? 'latest-row' : '')}
                />
            ) : (
                <Timeline>
                    {history.map((h, idx) => {
                        const timelineStatusLabel = h.label || h.statusName || h.currentStatus?.replace(/_/g, ' ');
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
            {devMode && editing && <Dialog open onClose={() => setEditing(null)} fullWidth maxWidth="xs">
                <DialogTitle>{t('Edit status timestamp')}</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
                    <TextField
                        label={t('Timestamp')}
                        type="datetime-local"
                        value={timestamp}
                        onChange={(event) => setTimestamp(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Button variant="contained" disabled={!timestamp} onClick={() => saveTimestamp(false)}>
                        {t('Update time directly')}
                    </Button>
                    <TextField
                        label={t('Business minutes to add')}
                        type="number"
                        value={minutes}
                        onChange={(event) => setMinutes(event.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }}
                        helperText={t('Business hours and holidays are applied automatically.')}
                    />
                    <Button variant="contained" disabled={minutes === '' || Number(minutes) < 0} onClick={() => saveTimestamp(true)}>
                        {t('Add business minutes')}
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditing(null)}>{t('Cancel')}</Button>
                </DialogActions>
            </Dialog>}
        </div>
    );
};

export default StatusHistory;
