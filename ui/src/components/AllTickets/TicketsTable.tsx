import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';

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
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onRowClick }) => {
    const { t } = useTranslation();
    const columns = useMemo(
        () => [
            {
                title: t('Ticket Id'),
                dataIndex: 'id',
                key: 'id',
                render: (_: any, record: TicketRow) => (
                    <div className="d-flex align-items-center">
                        {record.id}
                        {record.isMaster && <MasterIcon />}
                    </div>
                ),
            },
            {
                title: t('Requestor Name'),
                key: 'name',
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
                    <AssigneeDropdown ticketId={record.id} assigneeName={record.assignedTo} />
                )
            },
            { title: t('Status'), dataIndex: 'status', key: 'status', render: (v: any) => v || '-' },
            {
                title: t('Action'),
                key: 'action',
                render: () => <VisibilityIcon fontSize="small" sx={{ color: 'grey.600', cursor: 'pointer' }} />,
            },
        ],
        [t]
    );

    return (
        <GenericTable
            dataSource={tickets}
            columns={columns as any}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({ onClick: () => onRowClick(record.id) })}
        />
    );
};

export default TicketsTable;
