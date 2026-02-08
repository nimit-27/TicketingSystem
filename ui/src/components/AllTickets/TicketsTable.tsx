import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import { checkAccessMaster, checkMyTicketsColumnAccess } from '../../utils/permissions';
import { getStatusNameById, truncateWithLeadingEllipsis } from '../../utils/Utils';
import CustomIconButton, { IconComponent } from '../UI/IconButton/CustomIconButton';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    Tooltip,
    Button,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { TicketStatusWorkflow } from '../../types';
import RemarkComponent from '../UI/Remark/RemarkComponent';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import RequestorDetails from './RequestorDetails';
import PriorityIcon from '../UI/Icons/PriorityIcon';
import InfoIcon from '../UI/Icons/InfoIcon';
import { searchTicketsForExport, updateTicket } from '../../services/TicketService';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSnackbar } from '../../context/SnackbarContext';

export interface TicketRow {
    id: string;
    subject: string;
    category: string;
    subCategory: string;
    priority: string;
    priorityId: string;
    isMaster: boolean;
    userId?: string;
    requestorName?: string;
    requestorEmailId?: string;
    requestorMobileNo?: string;
    statusId?: string;
    statusLabel?: string;
    assignedTo?: string;
    assignedToName?: string;
    assignedBy?: string;
    feedbackStatus?: 'PENDING' | 'PROVIDED' | 'NOT_PROVIDED';
    breachedByMinutes?: number;
    severity?: string;
    severityId?: string;
    severityLabel?: string;
    issueTypeId?: string;
    issueTypeLabel?: string;
    zoneName?: string;
    zoneCode?: string;
    districtName?: string;
    regionName?: string;
    rcaStatus?: 'NOT_APPLICABLE' | 'PENDING' | 'SUBMITTED';
}

interface TicketsTableProps {
    tickets: TicketRow[];
    onRowClick: (id: string) => void;
    searchCurrentTicketsPaginatedApi: (id: string) => void;
    onIdClick: (id: string) => void;
    refreshingTicketId?: string | null;
    statusWorkflows: Record<string, TicketStatusWorkflow[]>;
    onRecommendEscalation?: (id: string) => void;
    showSeverityColumn?: boolean;
    onRcaClick?: (id: string, status?: TicketRow['rcaStatus']) => void;
    permissionPathPrefix?: string;
    handleFeedback?: (ticketId: string, feedbackStatus: string) => void;
    issueTypeFilterLabel?: string;
}

const applyThinBorders = (worksheet: XLSX.WorkSheet) => {
    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref'] as string) : null;
    if (!range) return;

    const borderStyle = { style: 'thin', color: { auto: 1 } } as XLSX.BorderStyleSpec;

    for (let row = range.s.r; row <= range.e.r; row += 1) {
        for (let col = range.s.c; col <= range.e.c; col += 1) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = (worksheet[cellAddress] || { t: 's', v: '' }) as XLSX.CellObject;
            cell.s = {
                ...(cell.s || {}),
                border: {
                    top: borderStyle,
                    bottom: borderStyle,
                    left: borderStyle,
                    right: borderStyle,
                },
            } as XLSX.CellStyle;
            worksheet[cellAddress] = cell;
        }
    }
};

const formatDisplayDate = (value: string | number | Date | null | undefined) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatInputDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDateRangeForSelection = (year: number, month?: number) => {
    if (month) {
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 0);
        return { from: formatInputDate(from), to: formatInputDate(to) };
    }
    const from = new Date(year, 0, 1);
    const to = new Date(year, 12, 0);
    return { from: formatInputDate(from), to: formatInputDate(to) };
};

const normalizeDownloadTickets = (payload: any): TicketRow[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as TicketRow[];
    if (Array.isArray(payload.items)) return payload.items as TicketRow[];
    if (Array.isArray(payload.content)) return payload.content as TicketRow[];
    if (Array.isArray(payload.data)) return payload.data as TicketRow[];
    return [];
};

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onIdClick, onRowClick, searchCurrentTicketsPaginatedApi, refreshingTicketId, statusWorkflows, onRecommendEscalation, showSeverityColumn = false, onRcaClick, permissionPathPrefix = 'myTickets', handleFeedback, issueTypeFilterLabel }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const { showMessage } = useSnackbar();

    const { apiHandler: updateTicketApiHandler } = useApi<any>();
    const { apiHandler: downloadTicketsApiHandler, pending: downloadingTickets } = useApi<any>();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [generateMenuAnchor, setGenerateMenuAnchor] = useState<null | HTMLElement>(null);
    const [currentTicketId, setCurrentTicketId] = useState<string>('');
    const [actions, setActions] = useState<TicketStatusWorkflow[]>([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState<{ action: TicketStatusWorkflow, ticketId: string } | null>(null);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const today = new Date();
    const [downloadYear, setDownloadYear] = useState<number | ''>(today.getFullYear());
    const [downloadMonth, setDownloadMonth] = useState<number | ''>(today.getMonth() + 1);
    const [downloadFromDate, setDownloadFromDate] = useState('');
    const [downloadToDate, setDownloadToDate] = useState('');

    const excludeInActionMenu = ['Assign', 'Further Assign', 'Assign / Assign Further', 'Assign Further', 'On Hold (Pending with FCI)', 'On Hold (Pending with Requester)', 'On Hold (Pending with Service Provider)'];

    const currentUser = getCurrentUserDetails();
    const currentUsername = currentUser?.username?.toLowerCase();
    const userLevels = (currentUser?.levels || []).map(level => level.toLowerCase());
    const assignBackLevelKeywords = ['team lead', 'level 1', 'level 2', 'level 3', 'l1', 'l2', 'l3'];
    const canAssignBackByLevel = userLevels.some(level => assignBackLevelKeywords.includes(level));
    const FCI_STATUS_NAME = 'On Hold (Pending with FCI)';

    const priorityMap: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear() + 1;
        return Array.from({ length: 12 }, (_, index) => currentYear - index);
    }, []);
    const monthOptions = useMemo(
        () => ([
            { value: 1, label: t('January') },
            { value: 2, label: t('February') },
            { value: 3, label: t('March') },
            { value: 4, label: t('April') },
            { value: 5, label: t('May') },
            { value: 6, label: t('June') },
            { value: 7, label: t('July') },
            { value: 8, label: t('August') },
            { value: 9, label: t('September') },
            { value: 10, label: t('October') },
            { value: 11, label: t('November') },
            { value: 12, label: t('December') },
        ]),
        [t],
    );

    let allowAssignment = checkAccessMaster([permissionPathPrefix, 'ticketsTable', 'columns', 'assignee', 'allowAssignment']);

    useEffect(() => {
        if (!downloadYear) {
            setDownloadFromDate('');
            setDownloadToDate('');
            return;
        }
        const range = getDateRangeForSelection(downloadYear, downloadMonth || undefined);
        setDownloadFromDate(range.from);
        setDownloadToDate(range.to);
    }, [downloadYear, downloadMonth]);

    const getAvailableActions = (statusId?: string) => {
        return (statusWorkflows[statusId || ''] || []).filter(a => {
            return !excludeInActionMenu.includes(a.action);
        });
    };

    const getAllAvailableActionsByCurrentStatus = (statusId: string) => {
        return statusWorkflows[statusId || ''] || []
    }

    // Allows assignment based on:
    // 1. Role's permission
    // 2. If atleast one of the status' nextStatus is '2' (Assign)
    const allowAssigneeChange = (statusId?: string): boolean => {
        let isAtleastOneNextStatusAssign: boolean = !!statusWorkflows[statusId || '']?.some(item => item.nextStatus == 2)
        return isAtleastOneNextStatusAssign && allowAssignment;
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'Assign':
                return { icon: 'personAddAlt' };
            case 'Resolve':
                return { icon: 'check', className: 'icon-blue' };
            case 'Cancel/ Reject':
                return { icon: 'close', className: 'icon-red' };
            case 'On Hold (Pending with Requester)':
            case 'On Hold (Pending with Service Provider)':
            case 'On Hold (Pending with FCI)':
                return { icon: 'pause', className: 'icon-yellow' };
            case 'Approve Escalation':
                return { icon: 'moving' };
            case 'Recommend Escalation':
                return { icon: 'northEast' };
            case 'Close':
                return { icon: 'doneAll', className: 'icon-green' };
            case 'Reopen':
                return { icon: 'replay' };
            case 'Restore':
                return { icon: 'restore', className: 'icon-green' };
            case 'Start':
                return { icon: 'playArrow' };
            case 'Escalate':
                return { icon: 'arrowUpward' };
            case 'Resume':
                return { icon: 'undo' };
            default:
                return { icon: 'done', className: 'icon-green' };
        }
    };

    const handleAssignBack = (ticketId: string, statusId?: string, assignee?: string) => {
        const recordActions = getAvailableActions(statusId);
        if (assignee) {
            // STATUS WORKFLOW: ON HOLD-> ASSIGNED
            let assignBackToAssigneeAction = recordActions.find(a => a.nextStatus === 2) as TicketStatusWorkflow
            handleActionClick(assignBackToAssigneeAction, ticketId)
        } else {
            // STATUS WORKFLOW: ON HOLD -> OPEN
            let assignBackToOpenAction = recordActions.find(a => a.nextStatus === 1) as TicketStatusWorkflow
            handleActionClick(assignBackToOpenAction, ticketId)
        }
    }

    const onIdClickRca = (id: string, state: any) => navigate(`/root-cause-analysis/${id}`, { state });

    const openMenu = (event: React.MouseEvent, record: TicketRow) => {
        const statusName = getStatusNameById(record.statusId || '') || '';
        const list = getAvailableActions(record.statusId);
        const resumeAction = list.filter(a => a.action === 'Resume')
        const isFciOnHold = statusName === FCI_STATUS_NAME;
        const allowAssignBack = Boolean(isFciOnHold && resumeAction && (canAssignBackByLevel || record.assignedBy?.toLowerCase() === currentUsername));
        const filteredActions = allowAssignBack ? list.filter(a => a.action !== 'Resume') : list;
        setActions(filteredActions);
        setCurrentTicketId(record.id);
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setCurrentTicketId('');
    };

    const handleGenerateMenuClose = () => setGenerateMenuAnchor(null);
    const handleDownloadDialogOpen = () => setDownloadDialogOpen(true);
    const handleDownloadDialogClose = () => {
        setDownloadDialogOpen(false);
        setGenerateMenuAnchor(null);
    };

    const handleActionClick = (wf: TicketStatusWorkflow, ticketId: string) => {
        if (wf.action === 'Recommend Escalation') {
            onRecommendEscalation?.(ticketId);
            onIdClick(ticketId)
            return;
        }
        setSelectedAction({ action: wf, ticketId });
        setCurrentTicketId(ticketId);
        setExpandedRowKeys([ticketId]);
        handleClose();
    };

    const cancelAction = () => {
        setExpandedRowKeys([]);
        setSelectedAction(null);
        setCurrentTicketId('');
    };

    const exportColumns = useMemo(() => {
        const columns = [
            {
                key: 'id',
                label: t('Ticket Id'),
                getValue: (record: TicketRow) => record.id,
            },
            {
                key: 'requester',
                label: t('Requestor'),
                getValue: (record: TicketRow) => record.requestorName || '-',
            },
            {
                key: 'category',
                label: t('Module'),
                getValue: (record: TicketRow) => record.category || '-',
            },
            {
                key: 'subCategory',
                label: t('Sub Module'),
                getValue: (record: TicketRow) => record.subCategory || '-',
            },
            {
                key: 'issueType',
                label: t('Issue Type'),
                getValue: (record: TicketRow) => record.issueTypeLabel || record.issueTypeId || '-',
            },
            {
                key: 'zoneName',
                label: t('Zone Name'),
                getValue: (record: TicketRow) => record.zoneName || record.zoneCode || '-',
            },
            {
                key: 'districtName',
                label: t('District Name'),
                getValue: (record: TicketRow) => record.districtName || '-',
            },
            {
                key: 'regionName',
                label: t('Region Name'),
                getValue: (record: TicketRow) => record.regionName || '-',
            },
            showSeverityColumn && {
                key: 'severity',
                label: t('Severity'),
                getValue: (record: TicketRow) => record.severity || record.severityLabel || '-',
            },
            {
                key: 'priority',
                label: t('Priority'),
                getValue: (record: TicketRow) => record.priority || '-',
            },
            {
                key: 'assignee',
                label: t('Assignee'),
                getValue: (record: TicketRow) => record.assignedToName || record.assignedTo || '-',
            },
            {
                key: 'status',
                label: t('Status'),
                getValue: (record: TicketRow) => record.statusLabel || getStatusNameById(record.statusId || '') || '-',
            },
        ].filter(Boolean) as { key: string, label: string, getValue: (record: TicketRow) => string }[];
        return columns;
    }, [t, showSeverityColumn]);

    const buildExportMatrix = (ticketsToExport: TicketRow[]) =>
        ticketsToExport.map(ticket => exportColumns.map(col => col.getValue(ticket)));

    const downloadAsExcel = (ticketsToExport: TicketRow[], range?: { from?: string; to?: string }) => {
        const exportRows = buildExportMatrix(ticketsToExport);
        const headers = exportColumns.map(col => col.label);
        const dateRangeFrom = range?.from || ticketsToExport[0]?.reportedDate || ticketsToExport[0]?.createdOn || null;
        const dateRangeTo = range?.to || ticketsToExport[ticketsToExport.length - 1]?.reportedDate || ticketsToExport[ticketsToExport.length - 1]?.createdOn || dateRangeFrom;
        const issueTypes = Array.from(new Set(
            ticketsToExport
                .map(ticket => ticket.issueTypeLabel || ticket.issueTypeId)
                .filter((value): value is string => Boolean(value && value.trim())),
        ));
        const issueTypeFilterValue = issueTypeFilterLabel || (issueTypes.length === 1 ? issueTypes[0] : t('All'));
        const metadata: (string | number)[][] = [
            ['Tickets Report'],
            ['Report Type', 'Ticket List'],
            ['Issue Type Filter', issueTypeFilterValue],
            ['Date Range From', formatDisplayDate(dateRangeFrom ?? null)],
            ['Date Range To', formatDisplayDate(dateRangeTo ?? null)],
            ['Generated By', currentUser?.username || currentUser?.userId || 'Unknown User'],
            ['Generated On', formatDisplayDate(new Date())],
            [],
            headers,
            ...exportRows,
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(metadata);
        applyThinBorders(worksheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
        XLSX.writeFile(workbook, 'tickets.xlsx');
    };

    const downloadAsPdf = (ticketsToExport: TicketRow[]) => {
        const doc = new jsPDF('l', 'pt');
        const issueTypes = Array.from(new Set(
            ticketsToExport
                .map(ticket => ticket.issueTypeLabel || ticket.issueTypeId)
                .filter((value): value is string => Boolean(value && value.trim())),
        ));
        const issueTypeFilterValue = issueTypeFilterLabel || (issueTypes.length === 1 ? issueTypes[0] : t('All'));
        doc.text(`${t('Issue Type Filter')}: ${issueTypeFilterValue}`, 40, 24);
        autoTable(doc, {
            head: [exportColumns.map(col => col.label)],
            body: buildExportMatrix(ticketsToExport),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [52, 71, 103] },
            startY: 36,
        });
        doc.save('tickets.pdf');
    };

    const handleGenerateSelection = async (format: 'pdf' | 'excel') => {
        if (!downloadFromDate || !downloadToDate) {
            showMessage(t('Please select a valid date range.'), 'warning');
            return;
        }
        const payload = await downloadTicketsApiHandler(() => searchTicketsForExport(downloadFromDate, downloadToDate));
        const ticketsToExport = normalizeDownloadTickets(payload);
        if (!ticketsToExport.length) {
            showMessage(t('No data available'), 'info');
            return;
        }
        if (format === 'excel') {
            downloadAsExcel(ticketsToExport, { from: downloadFromDate, to: downloadToDate });
        } else {
            downloadAsPdf(ticketsToExport);
        }
        handleDownloadDialogClose();
    };


    const expandedRowRender = (record: TicketRow) => {
        if (!selectedAction || record.id !== selectedAction.ticketId) return null;
        return (
            <>
                <RemarkComponent
                    actionName={selectedAction.action.action}
                    onCancel={cancelAction}
                    onSubmit={(remark) => {
                        const reqPayload = {
                            status: { statusId: String(selectedAction.action.nextStatus) },
                            remark,
                            assignedBy: getCurrentUserDetails()?.username,
                            updatedBy: getCurrentUserDetails()?.username,
                        } as any;
                        updateTicketApiHandler(() => updateTicket(record.id, reqPayload)).then(() => {
                            searchCurrentTicketsPaginatedApi(record.id);
                            cancelAction();
                            if (selectedAction.action.action === 'Close') {
                                navigate(`/tickets/${record.id}/feedback`);
                            }
                        });
                    }}
                />
            </>
        );
    };

    const priorityInfoContent = useMemo(
        () => (
            <div>
                {[
                    'P1 | Urgent (Impacting 100% users)',
                    'P2 | High (Impacting more than 50% users)',
                    'P3 | Medium (Impacting 25% to 50% users)',
                    'P4 | Low (Impacting single user)',
                ].map(priority => (
                    <div key={priority}>{t(priority)}</div>
                ))}
            </div>
        ),
        [t]
    );

    const columns = useMemo(
        () => [
            {
                title: t('Ticket Id'),
                dataIndex: 'id',
                key: 'ticketId',
                width: '12%',
                ellipsis: true,
                render: (_: any, record: TicketRow) => (
                    <Tooltip title={record.id} placement="top" >
                        <div className="d-flex align-items-center" onClick={() => onIdClick(record.id)} style={{ cursor: 'pointer' }}>
                            {/* <div className="d-flex align-items-center" onClick={() => onIdClickRca(record.id, { rcaStatus: record.rcaStatus })} style={{ cursor: 'pointer' }}> */}
                            {truncateWithLeadingEllipsis(record.id, 10)}
                            {record.isMaster && <MasterIcon />}
                            {(record.breachedByMinutes ?? 0) > 0 && (
                                <CustomIconButton icon="runningWithErrors" color='error' />
                            )}
                        </div>
                    </Tooltip>
                ),
            },
            {
                title: t('Requestor'),
                key: 'requestorName',
                width: '15%',
                ellipsis: true,
                render: (_: any, record: TicketRow) =>
                    record.requestorName ? (
                        <Tooltip
                            title={<RequestorDetails email={record.requestorEmailId} phone={record.requestorMobileNo} username={record.userId} />}
                            placement="top"
                            arrow
                            componentsProps={{ tooltip: { sx: { pointerEvents: 'auto' } } }}
                        >
                            <span>{record.requestorName}</span>
                        </Tooltip>
                    ) : '-' as any,
            },
            {
                title: t('Module'),
                dataIndex: 'category',
                key: 'category',
                width: '15%',
                ellipsis: true,
                render: (value: string) => {
                    const category = value || '';
                    return (
                        <Tooltip title={category} placement="top">
                            <span>{category}</span>
                        </Tooltip>
                    );
                }
            },
            {
                title: t('Sub Module'),
                dataIndex: 'subCategory',
                key: 'subCategory',
                width: '17%',
                ellipsis: true,
                render: (value: string) => {
                    const subCategory = value || '';
                    return (
                        <Tooltip title={subCategory} placement="top">
                            <span>{subCategory}</span>
                        </Tooltip>
                    );
                }
            },
            showSeverityColumn
            && {
                title: t('Severity'),
                dataIndex: 'severity',
                key: 'severity',
                width: '10%',
                ellipsis: true,
                render: (_: any, record: TicketRow) => {
                    const display = record.severity || record.severityLabel || record.severityId || '-';
                    const label = record.severityLabel && record.severityLabel !== display ? record.severityLabel : undefined;
                    return label ? (
                        <Tooltip title={label} placement="top">
                            <span>{display}</span>
                        </Tooltip>
                    ) : (display || '-');
                }
            },
            {
                title: (
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {t('Priority')}
                        <InfoIcon content={priorityInfoContent} />
                    </span>
                ),
                dataIndex: 'priority',
                key: 'priority',
                width: '9%',
                ellipsis: true,
                render: (v: string, data: TicketRow) => <PriorityIcon level={priorityMap[data?.priorityId] || 0} priorityText={data?.priority} />
            },
            {
                title: t('Assignee'),
                key: 'assignee',
                width: '10%',
                ellipsis: true,
                render: (_: any, record: TicketRow) => {
                    if (allowAssigneeChange(record.statusId)) {
                        return (
                            <AssigneeDropdown
                                ticketId={record.id}
                                assigneeName={record.assignedToName || record.assignedTo}
                                requestorId={record.userId}
                                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                                getAllAvailableActionsByCurrentStatus={getAllAvailableActionsByCurrentStatus}
                            />
                        );
                    }
                    const displayName = record.assignedToName || record.assignedTo || '';
                    return displayName
                        ? <Tooltip title={displayName}>
                            <span><UserAvatar name={displayName} /></span>
                        </Tooltip>
                        : <Tooltip title={""}>
                            <span><UserAvatar name={""} /></span>
                        </Tooltip>;
                }
            },
            {
                title: t('Status'),
                dataIndex: 'statusLabel',
                key: 'statusLabel',
                width: '11%',
                ellipsis: true,
                render: (_: any, record: TicketRow) => {
                    const statusName = record?.statusId ? getStatusNameById(record.statusId) : '';
                    const translatedStatusName = statusName ? t(statusName) : '';
                    const translatedLabel = record.statusLabel ? t(record.statusLabel) : (translatedStatusName || record.statusLabel || '');
                    return (
                        <Tooltip title={translatedStatusName || translatedLabel}>
                            <>{translatedLabel}</>
                        </Tooltip>
                    );
                }
            },
            {
                title: t('Actions'),
                key: 'action',
                width: '9%',
                ellipsis: true,
                render: (_: any, record: TicketRow) => {
                    if (record.rcaStatus) {
                        const isSubmitted = record.rcaStatus === 'SUBMITTED';
                        const label = isSubmitted ? t('View RCA') : t('Submit RCA');
                        const handleClick = () => {
                            if (onRcaClick) {
                                onRcaClick(record.id, record.rcaStatus);
                                return;
                            }
                            onRowClick(record.id);
                        };
                        return (
                            <Button size="small" onClick={handleClick}>
                                {label}
                            </Button>
                        );
                    }
                    const recordActions = getAvailableActions(record.statusId);
                    const statusName = getStatusNameById(record.statusId || '') || '';
                    const resumeAction = recordActions.find(a => a.action === 'Resume')
                    const showSubmit = Boolean(resumeAction && statusName === 'On Hold (Pending with Requester)');
                    // const canAssignBack = Boolean(isFciOnHold && resumeAction && (canAssignBackByLevel || record.assignedBy?.toLowerCase() === currentUsername));
                    const showActionsMenu = recordActions.length > 2;
                    const seen = new Set()
                    return (
                        <>
                            <Tooltip key="view-ticket" title="View Ticket" placement="top">
                                <CustomIconButton
                                    size="small"
                                    onClick={() => onRowClick(record.id)}
                                    icon="visibility"
                                />
                                {/* <VisibilityIcon
                                    onClick={() => onRowClick(record.id)}
                                    fontSize="small"
                                    sx={{ color: 'grey.600', cursor: 'pointer' }}
                                /> */}
                            </Tooltip>
                            {recordActions
                                .filter(item => !seen.has(item.action) && seen.add(item.action))
                                .map(a => {
                                    // {showInlineActions && nonResumeActions.map(a => {
                                    const { icon, className } = getActionIcon(a.action);
                                    if (a.action === "Resume") {
                                        return (
                                            <Tooltip title="Assign Back" placement="top">
                                                <CustomIconButton
                                                    size="small"
                                                    onClick={() => handleAssignBack(record.id, record.statusId, record.assignedTo)}
                                                    icon="undo"
                                                />
                                            </Tooltip>
                                        )
                                    } else {
                                        console.log({ a })
                                        return (
                                            <Tooltip key={a.id} title={a.action} placement="top">
                                                <CustomIconButton
                                                    size="small"
                                                    onClick={() => handleActionClick(a, record.id)}
                                                    icon={icon}
                                                    className={`${className}`}
                                                />
                                            </Tooltip>
                                        );
                                    }
                                })}
                            {showActionsMenu && (
                                <Tooltip key="more" title="More" placement="top">
                                    <CustomIconButton onClick={(event) => openMenu(event, record)} icon="moreVert" />
                                </Tooltip>
                            )}
                            {record.statusLabel?.toLowerCase() === 'closed' && record.feedbackStatus !== 'NOT_PROVIDED' && (
                                <>
                                    <Tooltip title={record.feedbackStatus === 'PROVIDED' ? 'View Feedback' : 'Provide Feedback'} placement="top">
                                        <CustomIconButton
                                            size="small"
                                            icon={record.feedbackStatus === 'PROVIDED' ? 'grading' : 'rateReview'}
                                            className='p-0'
                                            // onClick={() => navigate(`/tickets/${record.feedbackStatus === 'PROVIDED' ? record.id : ' '}/feedback`, { state: { feedbackStatus: record.feedbackStatus } })}
                                            onClick={() => handleFeedback && handleFeedback(record.id, record.feedbackStatus ?? '')}
                                        />
                                    </Tooltip>
                                </>
                            )}
                        </>
                    );
                }
            },
        ].filter((col): col is any => {
            if (!col || !col.key) {
                return false;
            }
            return checkMyTicketsColumnAccess(String(col.key), permissionPathPrefix);
        }),
        [
            allowAssignment,
            canAssignBackByLevel,
            currentUsername,
            getAllAvailableActionsByCurrentStatus,
            getAvailableActions,
            handleActionClick,
            handleAssignBack,
            handleFeedback,
            onIdClick,
            onRecommendEscalation,
            onRcaClick,
            onRowClick,
            permissionPathPrefix,
            priorityInfoContent,
            searchCurrentTicketsPaginatedApi,
            showSeverityColumn,
            statusWorkflows,
            t,
        ]
    );

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div />
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon fontSize="small" />}
                    onClick={handleDownloadDialogOpen}
                >
                    {t('Download')}
                </Button>
            </div>
            <GenericTable
                className="tickets-table"
                dataSource={tickets}
                columns={columns as any}
                rowKey="id"
                pagination={false}
                rowClassName={(record: any) => record.id === refreshingTicketId ? 'refreshing-row' : ''}
                expandable={{ expandedRowRender, expandedRowKeys, expandIcon: () => null, showExpandColumn: false }}
            // scroll={{ y: '30vh' }}
            />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {actions.map(a => {
                    const { icon, className } = getActionIcon(a.action);
                    return (
                        <MenuItem key={a.id} onClick={() => handleActionClick(a, currentTicketId)}>
                            <ListItemIcon>
                                <IconComponent icon={icon} className={className} />
                            </ListItemIcon>
                            {a.action}
                        </MenuItem>
                    );
                })}
            </Menu>
            <Dialog open={downloadDialogOpen} onClose={handleDownloadDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>{t('Download Tickets')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-year-label">{t('Year')}</InputLabel>
                                <Select
                                    labelId="download-year-label"
                                    label={t('Year')}
                                    value={downloadYear}
                                    onChange={(event) => setDownloadYear(event.target.value === '' ? '' : Number(event.target.value))}
                                >
                                    {yearOptions.map(year => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-month-label">{t('Month')}</InputLabel>
                                <Select
                                    labelId="download-month-label"
                                    label={t('Month')}
                                    value={downloadMonth}
                                    onChange={(event) => setDownloadMonth(event.target.value === '' ? '' : Number(event.target.value))}
                                >
                                    <MenuItem value="">
                                        {t('All')}
                                    </MenuItem>
                                    {monthOptions.map(month => (
                                        <MenuItem key={month.value} value={month.value}>
                                            {month.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label={t('From Date')}
                                type="date"
                                size="small"
                                fullWidth
                                value={downloadFromDate}
                                InputLabelProps={{ shrink: true }}
                                onChange={(event) => setDownloadFromDate(event.target.value)}
                            />
                            <TextField
                                label={t('To Date')}
                                type="date"
                                size="small"
                                fullWidth
                                value={downloadToDate}
                                InputLabelProps={{ shrink: true }}
                                onChange={(event) => setDownloadToDate(event.target.value)}
                            />
                        </Stack>
                        <Button
                            variant="contained"
                            onClick={(event) => setGenerateMenuAnchor(event.currentTarget)}
                            disabled={downloadingTickets}
                            startIcon={<DownloadIcon fontSize="small" />}
                        >
                            {t('Generate')}
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDownloadDialogClose}>{t('Cancel')}</Button>
                </DialogActions>
            </Dialog>
            <Menu anchorEl={generateMenuAnchor} open={Boolean(generateMenuAnchor)} onClose={handleGenerateMenuClose}>
                <MenuItem onClick={() => handleGenerateSelection('pdf')}>
                    <ListItemIcon>
                        <PictureAsPdfIcon fontSize="small" />
                    </ListItemIcon>
                    {t('As PDF')}
                </MenuItem>
                <MenuItem onClick={() => handleGenerateSelection('excel')}>
                    <ListItemIcon>
                        <GridOnIcon fontSize="small" />
                    </ListItemIcon>
                    {t('As Excel')}
                </MenuItem>
                {!downloadFromDate || !downloadToDate ? (
                    <>
                        <Divider />
                        <MenuItem disabled>{t('Select a date range')}</MenuItem>
                    </>
                ) : null}
            </Menu>
        </>
    );
};

export default TicketsTable;
