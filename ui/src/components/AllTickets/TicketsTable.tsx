import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import { checkMyTicketsColumnAccess } from '../../utils/permissions';
import { getStatusNameById } from '../../utils/Utils';
import CustomIconButton, { IconComponent } from '../UI/IconButton/CustomIconButton';
import { Menu, MenuItem, IconButton, ListItemIcon, Tooltip } from '@mui/material';
import { updateTicket } from '../../services/TicketService';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';
import { TicketStatusWorkflow } from '../../types';
import UserAvatar from '../UI/UserAvatar/UserAvatar';

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
    const { apiHandler: updateTicketApiHandler } = useApi<any>();

    const disallowed = ['Assign', 'Further Assign', 'Assign / Assign Further'];

    const getAvailableActions = (statusId?: string) =>
        (statusWorkflows[statusId || ''] || []).filter(a => !disallowed.includes(a.action));

    const allowAssigneeChange = (statusId?: string) =>
        (statusWorkflows[statusId || ''] || []).some(a => disallowed.includes(a.action));

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'Assign':
                return <IconComponent icon="personAddAlt" fontSize="small" />;
            case 'Resolve':
                return <IconComponent icon="check" fontSize="small" />;
            case 'Cancel/ Reject':
                return <IconComponent icon="close" fontSize="small" />;
            case 'On Hold (Pending with Requester)':
            case 'On Hold (Pending with Service Provider)':
            case 'On Hold (Pending with FCI)':
                return <IconComponent icon="pause" fontSize="small" />;
            case 'Approve Escalation':
                return <IconComponent icon="moving" fontSize="small" />;
            case 'Recommend Escalation':
                return <IconComponent icon="northEast" fontSize="small" />;
            case 'Close':
                return <IconComponent icon="doneAll" fontSize="small" className='text-success' />;
            case 'Reopen':
                return <IconComponent icon="replay" fontSize="small" />;
            case 'Start':
                return <IconComponent icon="playArrow" fontSize="small" />;
            case 'Escalate':
                return <IconComponent icon="arrowUpward" fontSize="small" />;
            default:
                return <IconComponent icon="done" fontSize="small" />;
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

    const handleActionClick = (wf: TicketStatusWorkflow, ticketId?: string) => {
        const id = ticketId || currentTicketId;
        const payload = { status: { statusId: String(wf.nextStatus) }, assignedBy: getCurrentUserDetails()?.username } as any;
        updateTicketApiHandler(() => updateTicket(id, payload)).then(() => {
            searchCurrentTicketsPaginatedApi(id);
        });
        handleClose();
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
                render: (_: any, record: TicketRow) => record.requestorName || '-',
            },
            {
                title: t('Email'),
                key: 'email',
                render: (_: any, record: TicketRow) => record.requestorEmailId || '-',
            },
            {
                title: t('Mobile'),
                key: 'mobile',
                render: (_: any, record: TicketRow) => record.requestorMobileNo || '-',
            },
            { title: t('Category'), dataIndex: 'category', key: 'category' },
            { title: t('Sub-Category'), dataIndex: 'subCategory', key: 'subCategory' },
            { title: t('Priority'), dataIndex: 'priority', key: 'priority' },
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
                    return record.assignedTo ? <UserAvatar name={record.assignedTo} /> : '-';
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
                                recordActions.map(a => (
                                    <Tooltip key={a.id} title={a.action} placement="top">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleActionClick(a, record.id)}
                                        >
                                            {getActionIcon(a.action)}
                                        </IconButton>
                                    </Tooltip>
                                ))
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
            />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {actions.map(a => (
                    <MenuItem key={a.id} onClick={() => handleActionClick(a)}>
                        <ListItemIcon>
                            {getActionIcon(a.action)}
                        </ListItemIcon>
                        {a.action}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default TicketsTable;
