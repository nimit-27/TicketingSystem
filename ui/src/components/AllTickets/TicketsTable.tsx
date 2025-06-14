import React, { useMemo } from 'react';
import { Table } from 'antd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';

interface Employee {
    name?: string;
    emailId?: string;
    mobileNo?: string;
}

export interface TicketRow {
    id: number;
    subject: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    employee?: Employee;
    status?: string;
}

interface TicketsTableProps {
    tickets: TicketRow[];
    onRowClick: (id: number) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onRowClick }) => {
    const columns = useMemo(
        () => [
            {
                title: 'Ticket Id',
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
                title: 'Requestor Name',
                key: 'name',
                render: (_: any, record: TicketRow) => record.employee?.name || '-',
            },
            {
                title: 'Email',
                key: 'email',
                render: (_: any, record: TicketRow) => record.employee?.emailId || '-',
            },
            {
                title: 'Mobile',
                key: 'mobile',
                render: (_: any, record: TicketRow) => record.employee?.mobileNo || '-',
            },
            { title: 'Category', dataIndex: 'category', key: 'category' },
            { title: 'Sub-Category', dataIndex: 'subCategory', key: 'subCategory' },
            { title: 'Priority', dataIndex: 'priority', key: 'priority' },
            { title: 'Status', dataIndex: 'status', key: 'status', render: (v: any) => v || '-' },
            {
                title: 'Action',
                key: 'action',
                render: () => <VisibilityIcon fontSize="small" sx={{ color: 'grey.600', cursor: 'pointer' }} />,
            },
        ],
        []
    );

    return (
        <Table
            dataSource={tickets}
            columns={columns as any}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({ onClick: () => onRowClick(record.id) })}
        />
    );
};

export default TicketsTable;
