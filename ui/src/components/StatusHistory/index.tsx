import React, { useContext, useEffect, useMemo, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getStatusHistory, previewStatusTimestamp, StatusTimestampUpdate, updateStatusTimestamp } from '../../services/StatusHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import { useTranslation } from 'react-i18next';
import { getAllUsers } from '../../services/UserService';
import HistoryReportDownloadMenu, { HistoryReportColumn } from '../History/HistoryReportDownloadMenu';
import { DevModeContext } from '../../context/DevModeContext';
import { TicketSla } from '../../types';

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

interface StatusTimestampSlaPreview {
    currentSla: TicketSla | null;
    newSla: TicketSla | null;
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const { apiHandler: previewApiHandler, pending: previewing } = useApi<StatusTimestampSlaPreview>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
    const { t } = useTranslation();
    const { devMode } = useContext(DevModeContext);
    const [editing, setEditing] = useState<HistoryEntry | null>(null);
    const [timestamp, setTimestamp] = useState('');
    const [minutes, setMinutes] = useState('');
    const [slaPreview, setSlaPreview] = useState<StatusTimestampSlaPreview | null>(null);
    const [previewedUpdate, setPreviewedUpdate] = useState<StatusTimestampUpdate | null>(null);

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
                        setSlaPreview(null);
                        setPreviewedUpdate(null);
                    }}>
                        <EditCalendarOutlinedIcon fontSize="small" />
                    </Button>
                </Tooltip>
            ),
        }] : []),
    ];

    const saveTimestamp = async () => {
        if (!editing || !previewedUpdate) return;
        const updated = await apiHandler(() => updateStatusTimestamp(editing.id, previewedUpdate));
        if (updated) {
            setEditing(null);
            reload();
        }
    };

    const previewTimestamp = async (payload: StatusTimestampUpdate) => {
        if (!editing) return;
        const preview = await previewApiHandler(() => previewStatusTimestamp(editing.id, payload));
        if (preview) {
            setSlaPreview(preview);
            setPreviewedUpdate(payload);
        }
    };

    const slaMetrics: Array<{ key: keyof TicketSla; label: string; date?: boolean }> = [
        { key: 'actualDueAt', label: t('Original Due Date'), date: true },
        { key: 'dueAtAfterEscalation', label: t('Due Date After Escalation'), date: true },
        { key: 'dueAt', label: t('Current Due Date'), date: true },
        { key: 'timeTillDueDate', label: t('Time Till Due Date (mins)') },
        { key: 'workingTimeLeftMinutes', label: t('Working Time Left (mins)') },
        { key: 'responseTimeMinutes', label: t('Response Time (mins)') },
        { key: 'resolutionTimeMinutes', label: t('Resolution Time (mins)') },
        { key: 'idleTimeMinutes', label: t('Idle Time (mins)') },
        { key: 'elapsedTimeMinutes', label: t('Elapsed Time (mins)') },
        { key: 'breachedByMinutes', label: t('Breached By (mins)') },
    ];

    const formatSlaValue = (sla: TicketSla | null, key: keyof TicketSla, date?: boolean) => {
        const value = sla?.[key];
        if (value === null || value === undefined || value === '') return '-';
        return date ? new Date(String(value)).toLocaleString() : String(value);
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
            {devMode && editing && <Dialog open onClose={() => setEditing(null)} fullWidth maxWidth={slaPreview ? 'lg' : 'xs'}>
                <DialogTitle>{t('Edit status timestamp')}</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
                    <TextField
                        label={t('Timestamp')}
                        type="datetime-local"
                        value={timestamp}
                        onChange={(event) => {
                            setTimestamp(event.target.value);
                            setSlaPreview(null);
                            setPreviewedUpdate(null);
                        }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Button variant="contained" disabled={!timestamp || previewing} onClick={() => previewTimestamp({
                        timestamp: timestamp.length === 16 ? `${timestamp}:00` : timestamp,
                    })}>
                        {previewing && <CircularProgress size={18} sx={{ mr: 1 }} />}
                        {t('Update time directly')}
                    </Button>
                    <TextField
                        label={t('Business minutes to add')}
                        type="number"
                        value={minutes}
                        onChange={(event) => {
                            setMinutes(event.target.value);
                            setSlaPreview(null);
                            setPreviewedUpdate(null);
                        }}
                        slotProps={{ htmlInput: { min: 0 } }}
                        helperText={t('Business hours and holidays are applied automatically.')}
                    />
                    <Button variant="contained" disabled={minutes === '' || Number(minutes) < 0 || previewing} onClick={() => previewTimestamp({
                        addMinutes: Number(minutes),
                    })}>
                        {previewing && <CircularProgress size={18} sx={{ mr: 1 }} />}
                        {t('Add business minutes')}
                    </Button>
                    {slaPreview && <Box sx={{ mt: 1 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>{t('SLA change preview')}</Typography>
                        <Table size="small" aria-label={t('SLA change preview')}>
                            <TableHead><TableRow>
                                <TableCell>{t('SLA metric')}</TableCell>
                                <TableCell sx={{ width: '38%' }}>{t('Current SLA data')}</TableCell>
                                <TableCell sx={{ width: '38%' }}>{t('New SLA data')}</TableCell>
                            </TableRow></TableHead>
                            <TableBody>{slaMetrics.map(({ key, label, date }) => {
                                const current = formatSlaValue(slaPreview.currentSla, key, date);
                                const next = formatSlaValue(slaPreview.newSla, key, date);
                                const changed = current !== next;
                                return <TableRow key={key}>
                                    <TableCell>{label}</TableCell>
                                    <TableCell>{current}</TableCell>
                                    <TableCell sx={changed ? { bgcolor: 'warning.light', fontWeight: 700 } : undefined}>{next}</TableCell>
                                </TableRow>;
                            })}</TableBody>
                        </Table>
                    </Box>}
                </DialogContent>
                <DialogActions>
                    {slaPreview ? <>
                        <Button variant="contained" onClick={saveTimestamp}>{t('Update new time')}</Button>
                        <Button onClick={() => {
                            setSlaPreview(null);
                            setPreviewedUpdate(null);
                        }}>{t('Cancel update')}</Button>
                    </> : <Button onClick={() => setEditing(null)}>{t('Cancel')}</Button>}
                </DialogActions>
            </Dialog>}
        </div>
    );
};

export default StatusHistory;
