import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import { checkAccessMaster, checkMyTicketsColumnAccess } from '../../utils/permissions';
import { getStatusNameById, truncateWithLeadingEllipsis } from '../../utils/Utils';
import CustomIconButton, { IconComponent } from '../UI/IconButton/CustomIconButton';
import { Menu, MenuItem, ListItemIcon, Tooltip, Button } from '@mui/material';
import { TicketStatusWorkflow } from '../../types';
import RemarkComponent from '../UI/Remark/RemarkComponent';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import RequestorDetails from './RequestorDetails';
import PriorityIcon from '../UI/Icons/PriorityIcon';
import InfoIcon from '../UI/Icons/InfoIcon';
import { updateTicket } from '../../services/TicketService';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';
import { useNavigate } from 'react-router-dom';

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
    handleFeedback?: (ticketId: string, feedbackStatus: string) => void
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onIdClick, onRowClick, searchCurrentTicketsPaginatedApi, refreshingTicketId, statusWorkflows, onRecommendEscalation, showSeverityColumn = false, onRcaClick, permissionPathPrefix = 'myTickets', handleFeedback }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const { apiHandler: updateTicketApiHandler } = useApi<any>();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentTicketId, setCurrentTicketId] = useState<string>('');
    const [actions, setActions] = useState<TicketStatusWorkflow[]>([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState<{ action: TicketStatusWorkflow, ticketId: string } | null>(null);

    const excludeInActionMenu = ['Assign', 'Further Assign', 'Assign / Assign Further', 'Assign Further', 'On Hold (Pending with FCI)', 'On Hold (Pending with Requester)', 'On Hold (Pending with Service Provider)'];

    const currentUser = getCurrentUserDetails();
    const currentUsername = currentUser?.username?.toLowerCase();
    const userLevels = (currentUser?.levels || []).map(level => level.toLowerCase());
    const assignBackLevelKeywords = ['team lead', 'level 1', 'level 2', 'level 3', 'l1', 'l2', 'l3'];
    const canAssignBackByLevel = userLevels.some(level => assignBackLevelKeywords.includes(level));
    const FCI_STATUS_NAME = 'On Hold (Pending with FCI)';

    const priorityMap: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

    let allowAssignment = checkAccessMaster([permissionPathPrefix, 'ticketsTable', 'columns', 'assignee', 'allowAssignment']);

    const getAvailableActions = (statusId?: string) => {
        return (statusWorkflows[statusId || ''] || []).filter(a => {
            return !excludeInActionMenu.includes(a.action);
        });
    };

    const getAllAvailableActionsByCurrentStatus = (statusId: string) => {
        return statusWorkflows[statusId || ''] || []
    }

    const allowAssigneeChange = (statusId?: string) => {
        return Boolean(statusWorkflows[statusId || ''] && allowAssignment);
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
            case 'Start':
                return { icon: 'playArrow' };
            case 'Escalate':
                return { icon: 'arrowUpward' };
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
        const resumeAction = list.find(a => a.action === 'Resume');
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
                title: t('Requester'),
                key: 'requestorName',
                ellipsis: true,
                render: (_: any, record: TicketRow) =>
                    record.requestorName ? (
                        <Tooltip
                            title={<RequestorDetails email={record.requestorEmailId} phone={record.requestorMobileNo} />}
                            placement="top"
                            arrow
                            componentsProps={{ tooltip: { sx: { pointerEvents: 'auto' } } }}
                        >
                            <span>{record.requestorName}</span>
                        </Tooltip>
                    ) : '-' as any,
            },
            {
                title: t('Category'),
                dataIndex: 'category',
                key: 'category',
                width: '13%',
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
                title: t('Sub-Category'),
                dataIndex: 'subCategory',
                key: 'subCategory',
                width: '15%',
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
                render: (v: string, data: TicketRow) => <PriorityIcon level={priorityMap[data?.priorityId] || 0} priorityText={data?.priority} />
            },
            {
                title: t('Assignee'),
                key: 'assignee',
                width: '10%',
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
                width: 'auto',
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
                    const resumeAction = recordActions.find(a => a.action === 'Resume');
                    // const isFciOnHold = statusName === FCI_STATUS_NAME;
                    const showSubmit = Boolean(resumeAction && statusName === 'On Hold (Pending with Requester)');
                    // const canAssignBack = Boolean(isFciOnHold && resumeAction && (canAssignBackByLevel || record.assignedBy?.toLowerCase() === currentUsername));
                    const nonResumeActions = recordActions.filter(a => a.action !== 'Resume');
                    const showInlineActions = !showSubmit && nonResumeActions.length > 0 && nonResumeActions.length <= 2;
                    const showActionsMenu = !showSubmit && nonResumeActions.length > 2;
                    return (
                        <>
                            <VisibilityIcon
                                onClick={() => onRowClick(record.id)}
                                fontSize="small"
                                sx={{ color: 'grey.600', cursor: 'pointer' }}
                            />
                            {showSubmit && resumeAction && (
                                <Button size="small" onClick={() => handleActionClick(resumeAction, record.id)}>Submit</Button>
                            )}
                            {resumeAction && (
                                <Tooltip title="Assign Back" placement="top">
                                    <CustomIconButton
                                        size="small"
                                        // onClick={() => handleActionClick(resumeAction, record.id)}
                                        onClick={() => handleAssignBack(record.id, record.statusId, record.assignedTo)}
                                        icon="undo"
                                    />
                                </Tooltip>
                            )}
                            {showInlineActions && nonResumeActions.map(a => {
                                const { icon, className } = getActionIcon(a.action);
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
                            })}
                            {showActionsMenu && (
                                <CustomIconButton onClick={(event) => openMenu(event, record)} icon="moreVert" />
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
        [t, statusWorkflows, showSeverityColumn, priorityInfoContent]
    );

    return (
        <>
            <GenericTable
                className="tickets-table"
                dataSource={tickets}
                columns={columns as any}
                rowKey="id"
                pagination={false}
                rowClassName={(record: any) => record.id === refreshingTicketId ? 'refreshing-row' : ''}
                expandable={{ expandedRowRender, expandedRowKeys, expandIcon: () => null, showExpandColumn: false }}
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
        </>
    );
};

export default TicketsTable;
