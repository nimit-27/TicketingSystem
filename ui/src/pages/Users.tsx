import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ViewToggle from '../components/UI/ViewToggle';
import { useApi } from '../hooks/useApi';
import HelpdeskUsersTable from '../components/Users/HelpdeskUsersTable';
import RequesterUsersTable from '../components/Users/RequesterUsersTable';
import { getHelpdeskUsers, getRequesterUsers } from '../services/UserService';
import { HelpdeskUser, RequesterUser, UserProfileType } from '../types/users';
import { checkAccessMaster } from '../utils/permissions';

const Users: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<UserProfileType>('requester');

  const { data: requesterUsers = [], apiHandler: requesterHandler, pending: requesterPending } = useApi<RequesterUser[]>();
  const { data: helpdeskUsers = [], apiHandler: helpdeskHandler, pending: helpdeskPending } = useApi<HelpdeskUser[]>();

  const canViewUsers = useMemo(() => checkAccessMaster(['Users']), []);

  useEffect(() => {
    requesterHandler(() => getRequesterUsers());
    helpdeskHandler(() => getHelpdeskUsers());
  }, [helpdeskHandler, requesterHandler]);

  const handleViewProfile = (type: UserProfileType, id: string) => {
    navigate(`/users/${type}/${id}`);
  };

  if (!canViewUsers) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">{t('Users')}</h3>
        <ViewToggle
          value={viewMode}
          onChange={(value: UserProfileType) => setViewMode(value)}
          options={[
            { label: t('Requester'), value: 'requester' },
            { label: t('Helpdesk'), value: 'helpdesk' },
          ]}
        />
      </div>

      {viewMode === 'requester' ? (
        <RequesterUsersTable
          users={requesterUsers}
          loading={requesterPending}
          onViewProfile={user => handleViewProfile('requester', user.requesterUserId)}
        />
      ) : (
        <HelpdeskUsersTable
          users={helpdeskUsers}
          loading={helpdeskPending}
          onViewProfile={user => handleViewProfile('helpdesk', user.userId)}
        />
      )}
    </div>
  );
};

export default Users;
