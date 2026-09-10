import React, { useContext, useEffect, useMemo, useState } from 'react';
import GenericTable from '../UI/GenericTable';
import ViewToggle from '../UI/ViewToggle';
import { useApi } from '../../hooks/useApi';
import { getStatusHistory, previewStatusTimestamp, updateStatusTimestamp } from '../../services/StatusHistoryService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, TextField, Tooltip } from '@mui/material';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { useTranslation } from 'react-i18next';
import { getAllUsers } from '../../services/UserService';
import HistoryReportDownloadMenu, { HistoryReportColumn } from '../History/HistoryReportDownloadMenu';
import { DevModeContext } from '../../context/DevModeContext';
import SlaDetails from '../TicketView/SlaDetails';
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

const StatusHistory: React.FC<StatusHistoryProps> = ({ ticketId }) => {
    const { data, apiHandler } = useApi<any>();
    const [view, setView] = useState<'table' | 'timeline'>('table');
    const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
    const [editing, setEditing] = useState<HistoryEntry | null>(null);
    const [directTimestamp, setDirectTimestamp] = useState('');
    const [minutes, setMinutes] = useState('');
    const [editError, setEditError] = useState('');
    const [saving, setSaving] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewSla, setPreviewSla] = useState<TicketSla | null>(null);
    const [previewTimestamp, setPreviewTimestamp] = useState('');
    const [editMode, setEditMode] = useState<'direct' | 'minutes'>('direct');
    const { devMode } = useContext(DevModeContext);
    const { t } = useTranslation();

    useEffect(() => {
        apiHandler(() => getStatusHistory(ticketId));
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

    const openEditor = (entry: HistoryEntry) => {
        setEditing(entry);
        setDirectTimestamp(entry.timestamp?.slice(0, 16) || '');
        setMinutes('');
        setEditError('');
        setPreviewSla(null);
        setPreviewTimestamp('');
        setEditMode('direct');
    };

    useEffect(() => {
        if (!editing || !devMode) return;
        const payload = editMode === 'direct'
            ? (directTimestamp ? { timestamp: directTimestamp } : null)
            : (minutes && Number(minutes) >= 0 ? { addMinutes: Number(minutes) } : null);
        if (!payload) {
            setPreviewSla(null);
            setPreviewTimestamp('');
            return;
        }
        const timer = window.setTimeout(async () => {
            setPreviewing(true);
            setEditError('');
            try {
                const response = await previewStatusTimestamp(editing.id, payload);
                const raw = response?.data?.body ?? response?.data;
                const preview = raw?.data ?? raw;
                setPreviewSla(preview?.sla ?? null);
                setPreviewTimestamp(preview?.history?.timestamp ?? '');
            } catch (error: any) {
                setPreviewSla(null);
                setPreviewTimestamp('');
                setEditError(error?.response?.data?.message || error?.message || 'Could not preview the timestamp.');
            } finally {
                setPreviewing(false);
            }
        }, 400);
        return () => window.clearTimeout(timer);
    }, [editing, devMode, editMode, directTimestamp, minutes]);

    const saveTimestamp = async (mode: 'direct' | 'minutes') => {
        if (!editing) return;
        const payload = mode === 'direct'
            ? { timestamp: directTimestamp }
            : { addMinutes: Number(minutes) };
        if ((mode === 'direct' && !directTimestamp) || (mode === 'minutes' && (!minutes || Number(minutes) < 0))) {
            setEditError('Enter a valid timestamp or a non-negative number of minutes.');
            return;
        }
        setSaving(true);
        setEditError('');
        try {
            await updateStatusTimestamp(editing.id, payload);
            setEditing(null);
            await apiHandler(() => getStatusHistory(ticketId));
        } catch (error: any) {
            setEditError(error?.response?.data?.message || error?.message || 'Could not update the timestamp.');
        } finally {
            setSaving(false);
        }
    };

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
            key: 'editTimestamp',
            render: (_: unknown, record: HistoryEntry) => (
                <Tooltip title={t('Edit status timestamp')}>
                    <IconButton aria-label={`Edit timestamp ${record.id}`} size="small" onClick={() => openEditor(record)}>
                        <EditCalendarIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        }] : []),
    ];

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
            {devMode && (
                <Dialog open={Boolean(editing)} onClose={() => !saving && setEditing(null)} fullWidth maxWidth="sm">
                    <DialogTitle>Edit status timestamp</DialogTitle>
                    <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
                        {editError && <Alert severity="error">{editError}</Alert>}
                        <TextField
                            label="Set date and time directly"
                            type="datetime-local"
                            value={directTimestamp}
                            onChange={(event) => {
                                setEditMode('direct');
                                setDirectTimestamp(event.target.value);
                            }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 60 }}
                        />
                        <Button variant="contained" disabled={saving || !directTimestamp} onClick={() => saveTimestamp('direct')}>
                            Set date and time
                        </Button>
                        <TextField
                            label="Business minutes to add"
                            type="number"
                            value={minutes}
                            onChange={(event) => {
                                setEditMode('minutes');
                                setMinutes(event.target.value);
                            }}
                            helperText="Skips closed hours and holidays."
                            inputProps={{ min: 0, step: 1 }}
                        />
                        <Button variant="contained" disabled={saving || !minutes} onClick={() => saveTimestamp('minutes')}>
                            Add business minutes
                        </Button>
                        {previewing && <Alert severity="info">Calculating SLA preview…</Alert>}
                        {previewSla && !previewing && (
                            <div>
                                <strong>SLA preview{previewTimestamp ? ` for ${new Date(previewTimestamp).toLocaleString()}` : ''}</strong>
                                <SlaDetails sla={previewSla} />
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={saving} onClick={() => setEditing(null)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
};

export default StatusHistory;
