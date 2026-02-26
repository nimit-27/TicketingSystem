import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from '@mui/material';
import { TicketStatusWorkflow } from '../../types';
import RemarkComponent from '../UI/Remark/RemarkComponent';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import RequestorDetails from './RequestorDetails';
import PriorityIcon from '../UI/Icons/PriorityIcon';
import InfoIcon from '../UI/Icons/InfoIcon';
import { searchTicketsForExport, updateTicket } from '../../services/TicketService';
import { getAllUsers } from '../../services/UserService';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSnackbar } from '../../context/SnackbarContext';
import { DropdownOption } from '../UI/Dropdown/GenericDropdown';
import DownloadTicketsDialog, { DownloadDialogInitialFilters, DownloadFilters } from './DownloadTicketsDialog';

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
    createdOn?: string;
    reportedDate?: string;
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
    zoneOptions?: DropdownOption[];
    issueTypeOptions?: DropdownOption[];
    selectedZone?: string;
    selectedRegion?: string;
    selectedDistrict?: string;
    selectedIssueType?: string;
    selectedCategory?: string;
    selectedSubCategory?: string;
    selectedAssignee?: string;
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

const formatExportCreatedDate = (value: string | number | Date | null | undefined) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const formatDateForFilename = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';

    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = String(parsed.getFullYear());
    return `${day}${month}${year}`;
};

const sanitizeFilenamePart = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const normalizeDownloadTickets = (payload: any): TicketRow[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as TicketRow[];
    if (Array.isArray(payload.items)) return payload.items as TicketRow[];
    if (Array.isArray(payload.content)) return payload.content as TicketRow[];
    if (Array.isArray(payload.data)) return payload.data as TicketRow[];
    return [];
};

const getDateRangeDays = (fromDate?: string, toDate?: string): number | null => {
    if (!fromDate || !toDate) return null;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diffInMs = end.getTime() - start.getTime();
    if (diffInMs < 0) return null;
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
};

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onIdClick, onRowClick, searchCurrentTicketsPaginatedApi, refreshingTicketId, statusWorkflows, onRecommendEscalation, showSeverityColumn = false, onRcaClick, permissionPathPrefix = 'myTickets', handleFeedback, issueTypeFilterLabel, zoneOptions = [], issueTypeOptions = [], selectedZone = 'All', selectedRegion = 'All', selectedDistrict = 'All', selectedIssueType = 'All', selectedCategory = 'All', selectedSubCategory = 'All', selectedAssignee = 'All' }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const { showMessage } = useSnackbar();

    const { apiHandler: updateTicketApiHandler } = useApi<any>();
    const { data: allUsersData, apiHandler: getAllUsersApiHandler } = useApi<any>();
    const { apiHandler: downloadTicketsApiHandler, pending: downloadingTickets } = useApi<any>();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentTicketId, setCurrentTicketId] = useState<string>('');
    const [actions, setActions] = useState<TicketStatusWorkflow[]>([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState<{ action: TicketStatusWorkflow, ticketId: string } | null>(null);
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [exportGenerationState, setExportGenerationState] = useState<'idle' | 'generating' | 'error'>('idle');
    const [lastExportRequest, setLastExportRequest] = useState<{ format: 'pdf' | 'excel', filters: DownloadFilters } | null>(null);
    const exportAbortRef = useRef<AbortController | null>(null);

    const excludeInActionMenu = ['Assign', 'Further Assign', 'Assign / Assign Further', 'Assign Further', 'On Hold (Pending with FCI)', 'On Hold (Pending with Requester)', 'On Hold (Pending with Service Provider)'];

    const currentUser = getCurrentUserDetails();
    const currentUsername = currentUser?.username?.toLowerCase();
    const userLevels = (currentUser?.levels || []).map(level => level.toLowerCase());
    const assignBackLevelKeywords = ['team lead', 'level 1', 'level 2', 'level 3', 'l1', 'l2', 'l3'];
    const canAssignBackByLevel = userLevels.some(level => assignBackLevelKeywords.includes(level));
    const FCI_STATUS_NAME = 'On Hold (Pending with FCI)';

    const priorityMap: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

    useEffect(() => {
        getAllUsersApiHandler(() => getAllUsers());
    }, [getAllUsersApiHandler]);
    let allowAssignment = checkAccessMaster([permissionPathPrefix, 'ticketsTable', 'columns', 'assignee', 'allowAssignment']);

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

    const handleDownloadDialogOpen = () => setDownloadDialogOpen(true);
    const handleDownloadDialogClose = () => {
        setDownloadDialogOpen(false);
    };

    const downloadDialogInitialFilters = useMemo<DownloadDialogInitialFilters>(
        () => ({
            category: selectedCategory,
            subCategory: selectedSubCategory,
            zone: selectedZone,
            region: selectedRegion,
            district: selectedDistrict,
            issueType: selectedIssueType,
            assignee: selectedAssignee,
        }),
        [selectedAssignee, selectedCategory, selectedDistrict, selectedIssueType, selectedRegion, selectedSubCategory, selectedZone],
    );

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
                key: 'createdDate',
                label: t('Created Date'),
                getValue: (record: TicketRow) => formatExportCreatedDate(record.createdOn || record.reportedDate),
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

    const buildFilterSummary = (filters: DownloadFilters) => {
        const selectedFilters = [
            { key: t('Module'), value: filters.categoryLabel },
            { key: t('Sub Module'), value: filters.subCategoryLabel },
            { key: t('Zone'), value: filters.zoneLabel },
            { key: t('Region'), value: filters.regionLabel },
            { key: t('District'), value: filters.districtLabel },
            { key: t('Issue Type'), value: filters.issueTypeLabel || issueTypeFilterLabel },
            { key: t('Assignee'), value: filters.assignedToLabel },
        ].filter((entry) => Boolean(entry.value));

        return selectedFilters;
    };

    const buildExportFilename = (filters: DownloadFilters) => {
        const from = formatDateForFilename(filters.fromDate);
        const to = formatDateForFilename(filters.toDate);
        const baseName = `tickets_${from}_${to}`;
        const filterSuffix = buildFilterSummary(filters)
            .map((entry) => `${sanitizeFilenamePart(entry.key)}-${sanitizeFilenamePart(entry.value as string)}`)
            .filter(Boolean)
            .join('_');

        return filterSuffix ? `${baseName}_${filterSuffix}` : baseName;
    };

    const downloadAsExcel = (ticketsToExport: TicketRow[], filters: DownloadFilters) => {
        const exportRows = buildExportMatrix(ticketsToExport);
        const headers = exportColumns.map(col => col.label);
        const selectedFilters = buildFilterSummary(filters);
        const fileName = buildExportFilename(filters);

        const metadata: (string | number)[][] = [
            ['Tickets Report'],
            ['Report Type', 'Ticket List'],
            ['From Date', formatDisplayDate(filters.fromDate)],
            ['To Date', formatDisplayDate(filters.toDate)],
            ['Requested By', currentUser?.username || currentUser?.userId || 'Unknown User'],
            ['Generated On', formatDisplayDate(new Date())],
            ['Total Tickets', ticketsToExport.length],
            ...selectedFilters.map((entry) => [entry.key, entry.value as string]),
            [],
            headers,
            ...exportRows,
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(metadata);
        applyThinBorders(worksheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const downloadAsPdf = (ticketsToExport: TicketRow[], filters: DownloadFilters) => {
        const doc = new jsPDF('l', 'pt');
        const requestedBy = currentUser?.username || currentUser?.userId || 'Unknown User';
        const selectedFilters = buildFilterSummary(filters);
        const fileName = buildExportFilename(filters);

        doc.setFontSize(14);
        doc.text(t('Tickets Report'), 40, 26);
        doc.setFontSize(10);
        doc.text(`${t('From Date')}: ${formatDisplayDate(filters.fromDate)}`, 40, 44);
        doc.text(`${t('To Date')}: ${formatDisplayDate(filters.toDate)}`, 220, 44);
        doc.text(`${t('Requested By')}: ${requestedBy}`, 400, 44);
        doc.text(`${t('Total Tickets')}: ${ticketsToExport.length}`, 40, 60);

        let currentY = 76;
        if (selectedFilters.length) {
            doc.text(`${t('Selected Filters')}:`, 40, currentY);
            currentY += 14;
            selectedFilters.forEach((entry) => {
                doc.text(`• ${entry.key}: ${entry.value}`, 52, currentY);
                currentY += 14;
            });
        }

        autoTable(doc, {
            head: [exportColumns.map(col => col.label)],
            body: buildExportMatrix(ticketsToExport),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [52, 71, 103] },
            startY: currentY + 6,
        });
        doc.save(`${fileName}.pdf`);
    };

    const cancelExportGeneration = () => {
        if (exportAbortRef.current) {
            exportAbortRef.current.abort();
            exportAbortRef.current = null;
        }
        setExportGenerationState('idle');
        showMessage(t('Export cancelled.'), 'info');
    };

    const handleGenerateSelection = async (format: 'pdf' | 'excel', filters: DownloadFilters) => {
        if (!filters.fromDate || !filters.toDate) {
            showMessage(t('Please select a valid date range.'), 'warning');
            return;
        }

        const selectedRangeDays = getDateRangeDays(filters.fromDate, filters.toDate);
        if (!selectedRangeDays) {
            showMessage(t('Please select a valid date range.'), 'warning');
            return;
        }

        if (selectedRangeDays > 31) {
            showMessage(t('Large date range selected. It may take some time to download this data.'), 'info');
        }

        setLastExportRequest({ format, filters });
        setExportGenerationState('generating');
        showMessage(t('Your report is being generated.'), 'info');

        const controller = new AbortController();
        exportAbortRef.current = controller;

        try {
            const response = await downloadTicketsApiHandler(() => searchTicketsForExport({
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                categoryId: filters.categoryId,
                subCategoryId: filters.subCategoryId,
                zoneCode: filters.zoneCode,
                regionCode: filters.regionCode,
                districtCode: filters.districtCode,
                issueTypeId: filters.issueTypeId,
                assignedTo: filters.assignedTo,
                signal: controller.signal,
            }));

            if (controller.signal.aborted) {
                return;
            }

            if (response === null) {
                setExportGenerationState('error');
                showMessage(t('Export failed. Range may be too large; narrow filters or request async report.'), 'error');
                return;
            }

            const ticketsToExport = normalizeDownloadTickets(response);
            if (!ticketsToExport.length) {
                showMessage(t('No data available'), 'info');
                setExportGenerationState('idle');
                return;
            }

            if (format === 'excel') {
                downloadAsExcel(ticketsToExport, filters);
            } else {
                downloadAsPdf(ticketsToExport, filters);
            }

            setExportGenerationState('idle');
            showMessage(t('Report generated successfully.'), 'success');
            handleDownloadDialogClose();
        } catch (error: any) {
            if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
                return;
            }
            setExportGenerationState('error');
            const statusCode = error?.response?.status;
            const message = statusCode === 504
                ? t('Request timed out. Range too large; narrow filters or request async report.')
                : t('Export failed. Range may be too large; narrow filters or request async report.');
            showMessage(message, 'error');
        } finally {
            exportAbortRef.current = null;
        }
    };

    const retryLastExport = () => {
        if (lastExportRequest) {
            handleGenerateSelection(lastExportRequest.format, lastExportRequest.filters);
        }
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
                                users={allUsersData || []}
                                callViaApi={false}
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
            <DownloadTicketsDialog
                open={downloadDialogOpen}
                loading={downloadingTickets || exportGenerationState === 'generating'}
                generationState={exportGenerationState}
                onCancelExport={cancelExportGeneration}
                onRetryExport={retryLastExport}
                zoneOptions={zoneOptions}
                issueTypeOptions={issueTypeOptions}
                initialFilters={downloadDialogInitialFilters}
                onClose={handleDownloadDialogClose}
                onGenerate={handleGenerateSelection}
            />
        </>
    );
};

export default TicketsTable;
