import React, { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { HelpdeskUser } from '../../types/users';

interface HelpdeskUsersTableProps {
  users: HelpdeskUser[];
  loading?: boolean;
  onViewProfile: (user: HelpdeskUser) => void;
}

const HelpdeskUsersTable: React.FC<HelpdeskUsersTableProps> = ({ users, loading = false, onViewProfile }) => {
  const { t } = useTranslation();

  const columns: ColumnsType<HelpdeskUser> = useMemo(() => [
    { title: t('User ID'), dataIndex: 'userId', key: 'userId' },
    { title: t('Name'), dataIndex: 'name', key: 'name' },
    { title: t('Email ID'), dataIndex: 'emailId', key: 'emailId' },
    { title: t('Mobile No.'), dataIndex: 'mobileNo', key: 'mobileNo' },
    { title: t('Office'), dataIndex: 'office', key: 'office' },
    { title: t('Username'), dataIndex: 'username', key: 'username' },
    { title: t('Roles'), dataIndex: 'roles', key: 'roles' },
    { title: t('Stakeholder'), dataIndex: 'stakeholder', key: 'stakeholder' },
    {
      title: t('Levels'),
      dataIndex: 'levels',
      key: 'levels',
      render: (value?: string[]) => (value && value.length ? value.join(', ') : '-'),
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <CustomIconButton
          size="small"
          icon="visibility"
          onClick={() => onViewProfile(record)}
        />
      ),
    },
  ], [onViewProfile, t]);

  return (
    <GenericTable
      rowKey="userId"
      columns={columns}
      dataSource={users}
      loading={loading}
      pagination={false}
    />
  );
};

export default HelpdeskUsersTable;
