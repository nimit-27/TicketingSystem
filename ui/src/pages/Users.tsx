import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ViewToggle from '../components/UI/ViewToggle';
import { useApi } from '../hooks/useApi';
import HelpdeskUsersTable from '../components/Users/HelpdeskUsersTable';
import RequesterUsersTable from '../components/Users/RequesterUsersTable';
import { appointRequesterAsRno, getRequesterOfficeTypes, searchHelpdeskUsers, searchRequesterUsers } from '../services/UserService';
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
import { useSnackbar } from '../context/SnackbarContext';
import { getDistricts, getRegions, getZones } from '../services/LocationService';
import { resetUserPassword } from '../services/UserService';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import SuccessModal from '../components/UI/SuccessModal';

const Users: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<UserProfileType>('requester');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [officeCodeSearch, setOfficeCodeSearch] = useState('');
  const debouncedOfficeCode = useDebounce(officeCodeSearch, 400);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [stakeholderFilter, setStakeholderFilter] = useState<string>('All');
  const [officeTypeFilter, setOfficeTypeFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activeAppointmentUserId, setActiveAppointmentUserId] = useState<string | null>(null);
  const [passwordResetTarget, setPasswordResetTarget] = useState<{ id: string; name?: string } | null>(null);
  const [passwordResetConfirmed, setPasswordResetConfirmed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [resetSuccessModalOpen, setResetSuccessModalOpen] = useState(false);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);

  const { showMessage } = useSnackbar();
  const { data: requesterUsers = { items: [] } as any, apiHandler: requesterHandler, pending: requesterPending } = useApi<PaginatedResponse<RequesterUser>>();
  const { data: helpdeskUsers = { items: [] } as any, apiHandler: helpdeskHandler, pending: helpdeskPending } = useApi<PaginatedResponse<HelpdeskUser>>();
  // const { data: requesterUsers = { items: [] } as PaginatedResponse<RequesterUser>, apiHandler: requesterHandler, pending: requesterPending } = useApi<PaginatedResponse<RequesterUser>>();
  // const { data: helpdeskUsers = { items: [] } as PaginatedResponse<HelpdeskUser>, apiHandler: helpdeskHandler, pending: helpdeskPending } = useApi<PaginatedResponse<HelpdeskUser>>();
  const { data: rolesResponse = [], apiHandler: rolesHandler } = useApi<any>();
  const { data: stakeholdersResponse = [], apiHandler: stakeholdersHandler } = useApi<any>();
  const { data: officeTypesResponse = [], apiHandler: officeTypesHandler } = useApi<string[]>();
  const { data: zonesResponse = [], apiHandler: zonesHandler } = useApi<any>();
  const { data: regionsResponse = [], apiHandler: regionsHandler } = useApi<any>();
  const { data: districtsResponse = [], apiHandler: districtsHandler } = useApi<any>();
  const { apiHandler: appointmentHandler } = useApi<any>();
  const { apiHandler: resetPasswordHandler, pending: resettingPassword } = useApi<any>();

  const canViewUsers = useMemo(() => checkAccessMaster(['Users']), []);

  const normalizedRole = roleFilter === 'All' ? undefined : roleFilter;
  const normalizedStakeholder = stakeholderFilter === 'All' ? undefined : stakeholderFilter;
  const normalizedOfficeType = officeTypeFilter === 'All' ? undefined : officeTypeFilter;
  const normalizedZone = zoneFilter === 'All' ? undefined : zoneFilter;
  const normalizedRegion = regionFilter === 'All' ? undefined : regionFilter;
  const normalizedDistrict = districtFilter === 'All' ? undefined : districtFilter;
  const normalizedOfficeCode = debouncedOfficeCode.trim() === '' ? undefined : debouncedOfficeCode;

  const loadHelpdeskUsers = useCallback(() => {
    return helpdeskHandler(() =>
      searchHelpdeskUsers(debouncedSearch, normalizedRole, normalizedStakeholder, page - 1, pageSize),
    );
  }, [debouncedSearch, helpdeskHandler, normalizedRole, normalizedStakeholder, page, pageSize]);

  const loadRequesterUsers = useCallback(() => {
    return requesterHandler(() =>
      searchRequesterUsers(
        debouncedSearch,
        normalizedRole,
        normalizedStakeholder,
        normalizedOfficeCode,
        normalizedOfficeType,
        normalizedZone,
        normalizedRegion,
        normalizedDistrict,
        page - 1,
        pageSize,
      ),
    );
  }, [debouncedSearch, normalizedDistrict, normalizedOfficeCode, normalizedOfficeType, normalizedRegion, normalizedRole, normalizedStakeholder, normalizedZone, page, pageSize, requesterHandler]);

  useEffect(() => {
    rolesHandler(() => getAllRoles());
    stakeholdersHandler(() => getStakeholders());
    officeTypesHandler(() => getRequesterOfficeTypes());
    zonesHandler(() => getZones());
    regionsHandler(() => getRegions());
    districtsHandler(() => getDistricts());
  }, [districtsHandler, officeTypesHandler, regionsHandler, rolesHandler, stakeholdersHandler, zonesHandler]);

  useEffect(() => {
    setPage(1);
  }, [viewMode]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedOfficeCode, roleFilter, stakeholderFilter, officeTypeFilter, zoneFilter, regionFilter, districtFilter]);

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

  const handleAppointRno = useCallback(async (user: RequesterUser) => {
    if (!user?.requesterUserId) return;

    setActiveAppointmentUserId(user.requesterUserId);
    try {
      const response = await appointmentHandler(() => appointRequesterAsRno(user.requesterUserId));
      if (response) {
        showMessage(t('User appointed as Regional Nodal Officer'), 'success');
        loadRequesterUsers();
      }
    } finally {
      setActiveAppointmentUserId(null);
    }
  }, [appointmentHandler, loadRequesterUsers, showMessage, t]);

  const openResetPasswordModal = useCallback((userId: string, name?: string) => {
    setPasswordResetTarget({ id: userId, name });
    setPasswordResetConfirmed(false);
    setPasswordInput('');
  }, []);

  const closeResetPasswordModal = useCallback(() => {
    setPasswordResetTarget(null);
    setPasswordResetConfirmed(false);
    setPasswordInput('');
  }, []);

  const handleConfirmReset = useCallback(() => {
    setPasswordResetConfirmed(true);
  }, []);

  const handleSubmitPasswordReset = useCallback(async () => {
    if (!passwordResetTarget?.id || !passwordInput.trim()) {
      return;
    }

    setResettingUserId(passwordResetTarget.id);
    try {
      const response = await resetPasswordHandler(() => resetUserPassword(passwordResetTarget.id, { newPassword: passwordInput.trim() }));
      if (response !== null) {
        showMessage(t('Password reset successfully'), 'success');
        setResetSuccessModalOpen(true);
        closeResetPasswordModal();
      }
    } finally {
      setResettingUserId(null);
    }
  }, [closeResetPasswordModal, passwordInput, passwordResetTarget, resetPasswordHandler, showMessage, t]);

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

  const officeTypeOptions: DropdownOption[] = useMemo(
    () => [{ label: t('All'), value: 'All' }, ...(((officeTypesResponse ?? []) as string[]).map((type: string) => ({
      label: type,
      value: type,
    })) as DropdownOption[])],
    [officeTypesResponse, t],
  );

  const zoneOptions: DropdownOption[] = useMemo(
    () => [{ label: t('All'), value: 'All' }, ...((zonesResponse?.data ?? zonesResponse ?? []).map((z: any) => ({
      label: z.zoneName ? `${z.zoneName} (${z.zoneCode})` : z.zoneCode,
      value: String(z.zoneCode),
    })) as DropdownOption[])],
    [t, zonesResponse],
  );

  const regionOptions: DropdownOption[] = useMemo(
    () => [{ label: t('All'), value: 'All' }, ...((regionsResponse?.data ?? regionsResponse ?? []).map((r: any) => ({
      label: r.regionName ? `${r.regionName} (${r.regionCode})` : r.regionCode,
      value: String(r.regionCode),
    })) as DropdownOption[])],
    [regionsResponse, t],
  );

  const districtOptions: DropdownOption[] = useMemo(
    () => [{ label: t('All'), value: 'All' }, ...((districtsResponse?.data ?? districtsResponse ?? []).map((d: any) => ({
      label: d.districtName ? `${d.districtName} (${d.districtCode})` : d.districtCode,
      value: String(d.districtCode),
    })) as DropdownOption[])],
    [districtsResponse, t],
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
        {viewMode === 'requester' && (
          <GenericInput
            placeholder={t('Search by office code')}
            value={officeCodeSearch}
            onChange={(e) => setOfficeCodeSearch(e.target.value)}
            style={{ minWidth: 200 }}
          />
        )}
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
        {viewMode === 'requester' && (
          <>
            <DropdownController
              label={t('Office Type')}
              options={officeTypeOptions}
              value={officeTypeFilter}
              onChange={(value) => {
                setOfficeTypeFilter(String(value));
                setPage(1);
              }}
            />
            <DropdownController
              label={t('Zone Code')}
              options={zoneOptions}
              value={zoneFilter}
              onChange={(value) => {
                setZoneFilter(String(value));
                setPage(1);
              }}
            />
            <DropdownController
              label={t('Region Code')}
              options={regionOptions}
              value={regionFilter}
              onChange={(value) => {
                setRegionFilter(String(value));
                setPage(1);
              }}
            />
            <DropdownController
              label={t('District Code')}
              options={districtOptions}
              value={districtFilter}
              onChange={(value) => {
                setDistrictFilter(String(value));
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {viewMode === 'requester' ? (
        <RequesterUsersTable
          users={requesterUsers?.items ?? []}
          loading={requesterPending}
          appointingUserId={activeAppointmentUserId}
          onAppointRno={handleAppointRno}
          onViewProfile={user => handleViewProfile('requester', user.requesterUserId)}
          onResetPassword={(user) => openResetPasswordModal(user.requesterUserId, user.name)}
          resettingUserId={resettingUserId}
        />
      ) : (
        <HelpdeskUsersTable
          users={helpdeskUsers?.items ?? []}
          loading={helpdeskPending}
          onViewProfile={user => handleViewProfile('helpdesk', user.userId)}
          onResetPassword={(user) => openResetPasswordModal(user.userId, user.name)}
          resettingUserId={resettingUserId}
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

      <Dialog open={Boolean(passwordResetTarget)} onClose={closeResetPasswordModal} fullWidth maxWidth="xs">
        <DialogTitle>{t('Reset Password')}</DialogTitle>
        <DialogContent className="pt-2">
          <p className="mb-2">
            {t('Are you sure you want to reset the password for {{name}}?', { name: passwordResetTarget?.name || t('this user') })}
          </p>
          {passwordResetConfirmed && (
            <TextField
              fullWidth
              type="password"
              label={t('New Password')}
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              margin="dense"
              autoFocus
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResetPasswordModal} disabled={resettingPassword}>{t('Cancel')}</Button>
          {!passwordResetConfirmed ? (
            <Button variant="contained" onClick={handleConfirmReset}>{t('Yes')}</Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmitPasswordReset}
              disabled={resettingPassword || passwordInput.trim() === ''}
              startIcon={resettingPassword ? <CircularProgress size={16} /> : null}
            >
              {resettingPassword ? t('Submitting...') : t('Submit')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <SuccessModal
        open={resetSuccessModalOpen}
        title={t('Password reset successfully')}
        subtext={t('The password has been updated for the selected user.')}
        onClose={() => setResetSuccessModalOpen(false)}
      />
    </div>
  );
};

export default Users;
