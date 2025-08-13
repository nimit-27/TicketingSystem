import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import { checkMyTicketsColumnAccess } from '../../utils/permissions';
import { getStatusNameById } from '../../utils/Utils';
import CustomIconButton, { IconComponent } from '../UI/IconButton/CustomIconButton';
import { Menu, MenuItem, ListItemIcon, Tooltip } from '@mui/material';
import { TicketStatusWorkflow } from '../../types';
import ActionRemarkComponent from './ActionRemarkComponent';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import RequestorDetails from './RequestorDetails';
import PriorityBar from './PriorityBar';

export interface TicketRow {
    id: string;
    subject: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    requestorName?: string;
    requestorEmailId?: string;
    requestorMobileNo?: string;
    statusId?: string;
    assignedTo?: string;
}

interface TicketsTableProps {
    tickets: TicketRow[];
    onRowClick: (id: string) => void;
    searchCurrentTicketsPaginatedApi: (id: string) => void;
    onIdClick: (id: string) => void;
    refreshingTicketId?: string | null;
    statusWorkflows: Record<string, TicketStatusWorkflow[]>;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onIdClick, onRowClick, searchCurrentTicketsPaginatedApi, refreshingTicketId, statusWorkflows }) => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentTicketId, setCurrentTicketId] = useState<string>('');
    const [actions, setActions] = useState<TicketStatusWorkflow[]>([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [selectedAction, setSelectedAction] = useState<TicketStatusWorkflow | null>(null);

    const disallowed = ['Assign', 'Further Assign', 'Assign / Assign Further'];

    const priorityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };

    const getAvailableActions = (statusId?: string) =>
        (statusWorkflows[statusId || ''] || []).filter(a => !disallowed.includes(a.action));

    const allowAssigneeChange = (statusId?: string) =>
        (statusWorkflows[statusId || ''] || []).some(a => disallowed.includes(a.action));

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

    const openMenu = (event: React.MouseEvent, record: any) => {
        const list = getAvailableActions(record.statusId);
        setActions(list);
        setCurrentTicketId(record.id);
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setCurrentTicketId('');
    };

    const handleActionClick = (wf: TicketStatusWorkflow, ticketId: string) => {
        setSelectedAction(wf);
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
        if (record.id !== currentTicketId || !selectedAction) return null;
        return (
            <ActionRemarkComponent
                ticket={record}
                actionName={selectedAction.action}
                payload={{ status: { statusId: String(selectedAction.nextStatus) } }}
                onCancel={cancelAction}
                onSuccess={() => searchCurrentTicketsPaginatedApi(record.id)}
            />
        );
    };

    const columns = useMemo(
        () => [
            {
                title: t('Ticket Id'),
                dataIndex: 'id',
                key: 'ticketId',
                render: (_: any, record: TicketRow) => (
                    <div className="d-flex align-items-center" onClick={() => onIdClick(record.id)} style={{ cursor: 'pointer' }}>
                        {record.id}
                        {record.isMaster && <MasterIcon />}
                    </div>
                ),
            },
            {
                title: t('Requestor Name'),
                key: 'requestorName',
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
                    ) : (
                        '-' as any
                    ),
            },
            { title: t('Category'), dataIndex: 'category', key: 'category' },
            { title: t('Sub-Category'), dataIndex: 'subCategory', key: 'subCategory' },
            { title: t('Priority'), dataIndex: 'priority', key: 'priority', render: (v: string) => <PriorityBar value={priorityMap[v] || 0} /> },
            {
                title: t('Assignee'),
                key: 'assignee',
                render: (_: any, record: TicketRow) => {
                    if (allowAssigneeChange(record.statusId)) {
                        return (
                            <AssigneeDropdown
                                ticketId={record.id}
                                assigneeName={record.assignedTo}
                                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                            />
                        );
                    }
                    return record.assignedTo ? (
                        <Tooltip title={record.assignedTo}>
                            <span><UserAvatar name={record.assignedTo} /></span>
                        </Tooltip>
                    ) : '-';
                }
            },
            { title: t('Status'), dataIndex: 'statusId', key: 'statusId', render: (v: any) => getStatusNameById(v) || '-' },
            {
                title: t('Action'),
                key: 'action',
                render: (_: any, record: TicketRow) => {
                    const recordActions = getAvailableActions(record.statusId);
                    return (
                        <>
                            <VisibilityIcon
                                onClick={() => onRowClick(record.id)}
                                fontSize="small"
                                sx={{ color: 'grey.600', cursor: 'pointer' }}
                            />
                            {recordActions.length <= 2 ? (
                                recordActions.map(a => {
                                    const { icon, className } = getActionIcon(a.action);
                                    return (
                                        <Tooltip key={a.id} title={a.action} placement="top">
                                            <CustomIconButton
                                                size="small"
                                                onClick={() => handleActionClick(a, record.id)}
                                                icon={icon}
                                                className={className}
                                            />
                                        </Tooltip>
                                    );
                                })
                            ) : (
                                <CustomIconButton onClick={(event) => openMenu(event, record)} icon='moreVert' />
                            )}
                        </>
                    );
                }
            },
        ].filter(col => col.key && checkMyTicketsColumnAccess(col.key.toString())),
        [t, statusWorkflows]
    );

    return (
        <>
            <GenericTable
                dataSource={tickets}
                columns={columns as any}
                rowKey="id"
                pagination={false}
                rowClassName={(record: any) => record.id === refreshingTicketId ? 'refreshing-row' : ''}
                expandable={{ expandedRowRender, expandedRowKeys, expandIcon: () => null }}
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
