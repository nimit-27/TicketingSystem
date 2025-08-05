import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import { checkMyTicketsColumnAccess } from '../../utils/permissions';
import { getStatusNameById } from '../../utils/Utils';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { Menu, MenuItem } from '@mui/material';
import { updateTicket } from '../../services/TicketService';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';
import { TicketStatusWorkflow } from '../../types';

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
    refreshingTicketId?: string | null;
    statusWorkflows: Record<string, TicketStatusWorkflow[]>;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onRowClick, searchCurrentTicketsPaginatedApi, refreshingTicketId, statusWorkflows }) => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentTicketId, setCurrentTicketId] = useState<string>('');
    const [actions, setActions] = useState<TicketStatusWorkflow[]>([]);
    const { apiHandler: updateTicketApiHandler } = useApi<any>();

    const openMenu = (event: React.MouseEvent, record: any) => {
        const list = statusWorkflows[record.statusId] || [];
        setActions(list);
        setCurrentTicketId(record.id);
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setCurrentTicketId('');
    };

    const handleActionClick = (wf: TicketStatusWorkflow) => {
        const payload = { status: { statusId: String(wf.nextStatus) }, assignedBy: getCurrentUserDetails()?.username } as any;
        updateTicketApiHandler(() => updateTicket(currentTicketId, payload)).then(() => {
            searchCurrentTicketsPaginatedApi(currentTicketId);
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
                    <div className="d-flex align-items-center">
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
                render: (_: any, record: TicketRow) => (
                    <AssigneeDropdown ticketId={record.id} assigneeName={record.assignedTo} searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi} />
                )
            },
            { title: t('Status'), dataIndex: 'statusId', key: 'statusId', render: (v: any) => getStatusNameById(v) || '-' },
            {
                title: t('Action'),
                key: 'action',
                render: (_: any, record: TicketRow) => <>
                    <VisibilityIcon onClick={() => onRowClick(record.id)} fontSize="small" sx={{ color: 'grey.600', cursor: 'pointer' }} />
                    <CustomIconButton onClick={(event) => openMenu(event, record)} icon='moreVert' />
                </>,
            },
        ].filter(col => col.key && checkMyTicketsColumnAccess(col.key.toString())),
        [t]
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
                    <MenuItem key={a.id} onClick={() => handleActionClick(a)}>{a.action}</MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default TicketsTable;
