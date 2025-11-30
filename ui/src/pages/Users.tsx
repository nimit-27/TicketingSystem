import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ViewToggle from '../components/UI/ViewToggle';
import { useApi } from '../hooks/useApi';
import HelpdeskUsersTable from '../components/Users/HelpdeskUsersTable';
import RequesterUsersTable from '../components/Users/RequesterUsersTable';
import { searchHelpdeskUsers, searchRequesterUsers } from '../services/UserService';
import { HelpdeskUser, RequesterUser, UserProfileType } from '../types/users';
import { checkAccessMaster } from '../utils/permissions';
import GenericInput from '../components/UI/Input/GenericInput';
import DropdownController from '../components/UI/Dropdown/DropdownController';
import { DropdownOption } from '../components/UI/Dropdown/GenericDropdown';
import PaginationControls from '../components/PaginationControls';
import { useDebounce } from '../hooks/useDebounce';
import { getAllRoles } from '../services/RoleService';
import { getStakeholders } from '../services/StakeholderService';
import { PaginatedResponse } from '../types/pagination';

const Users: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<UserProfileType>('requester');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [stakeholderFilter, setStakeholderFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const { data: requesterUsers = { items: [] } as PaginatedResponse<RequesterUser>, apiHandler: requesterHandler, pending: requesterPending } = useApi<PaginatedResponse<RequesterUser>>();
  const { data: helpdeskUsers = { items: [] } as PaginatedResponse<HelpdeskUser>, apiHandler: helpdeskHandler, pending: helpdeskPending } = useApi<PaginatedResponse<HelpdeskUser>>();
  const { data: rolesResponse = [], apiHandler: rolesHandler } = useApi<any>();
  const { data: stakeholdersResponse = [], apiHandler: stakeholdersHandler } = useApi<any>();

  const canViewUsers = useMemo(() => checkAccessMaster(['Users']), []);

  const normalizedRole = roleFilter === 'All' ? undefined : roleFilter;
  const normalizedStakeholder = stakeholderFilter === 'All' ? undefined : stakeholderFilter;

  const loadHelpdeskUsers = useCallback(() => {
    return helpdeskHandler(() =>
      searchHelpdeskUsers(debouncedSearch, normalizedRole, normalizedStakeholder, page - 1, pageSize),
    );
  }, [debouncedSearch, helpdeskHandler, normalizedRole, normalizedStakeholder, page, pageSize]);

  const loadRequesterUsers = useCallback(() => {
    return requesterHandler(() =>
      searchRequesterUsers(debouncedSearch, normalizedRole, normalizedStakeholder, page - 1, pageSize),
    );
  }, [debouncedSearch, normalizedRole, normalizedStakeholder, page, pageSize, requesterHandler]);

  useEffect(() => {
    rolesHandler(() => getAllRoles());
    stakeholdersHandler(() => getStakeholders());
  }, [rolesHandler, stakeholdersHandler]);

  useEffect(() => {
    setPage(1);
  }, [viewMode]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const executeSearch = viewMode === 'requester' ? loadRequesterUsers : loadHelpdeskUsers;
    executeSearch().then((res: any) => {
      const payload: PaginatedResponse<RequesterUser | HelpdeskUser> = res?.data ?? res ?? {};
      setTotalPages(payload.totalPages ?? 0);
      setTotalCount(payload.totalElements ?? 0);
    });
  }, [loadHelpdeskUsers, loadRequesterUsers, viewMode]);

  const handleViewProfile = (type: UserProfileType, id: string) => {
    navigate(`/users/${type}/${id}`);
  };

  const roleOptions: DropdownOption[] = useMemo(
    () => [{ label: t('All'), value: 'All' }, ...((rolesResponse?.data ?? rolesResponse ?? []).map((r: any) => ({
      label: r.role,
      value: String(r.roleId ?? r.role),
    })) as DropdownOption[])],
    [rolesResponse, t],
  );

  const stakeholderOptions: DropdownOption[] = useMemo(
    () => [{ label: t('All'), value: 'All' }, ...((stakeholdersResponse?.data ?? stakeholdersResponse ?? []).map((s: any) => ({
      label: s.description,
      value: String(s.id),
    })) as DropdownOption[])],
    [stakeholdersResponse, t],
  );

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

      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <GenericInput
          placeholder={t('Search by name, email or phone')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <DropdownController
          label={t('Role')}
          options={roleOptions}
          value={roleFilter}
          onChange={(value) => {
            setRoleFilter(String(value));
            setPage(1);
          }}
        />
        <DropdownController
          label={t('Stakeholder')}
          options={stakeholderOptions}
          value={stakeholderFilter}
          onChange={(value) => {
            setStakeholderFilter(String(value));
            setPage(1);
          }}
        />
      </div>

      {viewMode === 'requester' ? (
        <RequesterUsersTable
          users={requesterUsers?.items ?? []}
          loading={requesterPending}
          onViewProfile={user => handleViewProfile('requester', user.requesterUserId)}
        />
      ) : (
        <HelpdeskUsersTable
          users={helpdeskUsers?.items ?? []}
          loading={helpdeskPending}
          onViewProfile={user => handleViewProfile('helpdesk', user.userId)}
        />
      )}

      <div className="d-flex justify-content-end mt-3">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onChange={(_, value) => setPage(value)}
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
};

export default Users;
