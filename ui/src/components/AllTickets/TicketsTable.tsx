import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import { checkMyTicketsColumnAccess } from '../../utils/permissions';
import { getStatusNameById } from '../../utils/Utils';

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
    status?: string;
    assignedTo?: string;
}

interface TicketsTableProps {
    tickets: TicketRow[];
    onRowClick: (id: string) => void;
    searchTicketsPaginatedApi: () => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onRowClick, searchTicketsPaginatedApi }) => {
    const { t } = useTranslation();
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
                    <AssigneeDropdown ticketId={record.id} assigneeName={record.assignedTo} searchTicketsPaginatedApi={searchTicketsPaginatedApi} />
                )
            },
            { title: t('Status'), dataIndex: 'statusId', key: 'statusId', render: (v: any) => getStatusNameById(v) || '-' },
            {
                title: t('Action'),
                key: 'action',
                render: (_: any, record: TicketRow) => <VisibilityIcon onClick={() => onRowClick(record.id)} fontSize="small" sx={{ color: 'grey.600', cursor: 'pointer' }} />,
            },
        ].filter(col => col.key && checkMyTicketsColumnAccess(col.key.toString())),
        [t]
    );

    return (
        <GenericTable
            dataSource={tickets}
            columns={columns as any}
            rowKey="id"
            pagination={false}
        />
    );
};

export default TicketsTable;
