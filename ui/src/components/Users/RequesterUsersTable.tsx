import React, { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { RequesterUser } from '../../types/users';

interface RequesterUsersTableProps {
  users: RequesterUser[];
  loading?: boolean;
  onViewProfile: (user: RequesterUser) => void;
}

const RequesterUsersTable: React.FC<RequesterUsersTableProps> = ({ users, loading = false, onViewProfile }) => {
  const { t } = useTranslation();

  const columns: ColumnsType<RequesterUser> = useMemo(() => [
    { title: t('User ID'), dataIndex: 'requesterUserId', key: 'requesterUserId' },
    { title: t('Name'), dataIndex: 'name', key: 'name' },
    { title: t('First Name'), dataIndex: 'firstName', key: 'firstName' },
    { title: t('Middle Name'), dataIndex: 'middleName', key: 'middleName' },
    { title: t('Last Name'), dataIndex: 'lastName', key: 'lastName' },
    { title: t('Email ID'), dataIndex: 'emailId', key: 'emailId' },
    { title: t('Mobile No.'), dataIndex: 'mobileNo', key: 'mobileNo' },
    { title: t('Office'), dataIndex: 'office', key: 'office' },
    { title: t('Username'), dataIndex: 'username', key: 'username' },
    { title: t('Password'), dataIndex: 'password', key: 'password' },
    { title: t('Roles'), dataIndex: 'roles', key: 'roles' },
    { title: t('Stakeholder'), dataIndex: 'stakeholder', key: 'stakeholder' },
    {
      title: t('Date of Joining'),
      dataIndex: 'dateOfJoining',
      key: 'dateOfJoining',
      render: value => value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: t('Date of Retirement'),
      dataIndex: 'dateOfRetirement',
      key: 'dateOfRetirement',
      render: value => value ? new Date(value).toLocaleString() : '-',
    },
    { title: t('Office Type'), dataIndex: 'officeType', key: 'officeType' },
    { title: t('Office Code'), dataIndex: 'officeCode', key: 'officeCode' },
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
      rowKey="requesterUserId"
      columns={columns}
      dataSource={users}
      loading={loading}
      pagination={false}
    />
  );
};

export default RequesterUsersTable;
