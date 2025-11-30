import React, { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomFieldset from '../components/CustomFieldset';
import { useApi } from '../hooks/useApi';
import { getHelpdeskUserDetails, getRequesterUserDetails } from '../services/UserService';
import { HelpdeskUser, RequesterUser, UserProfileType } from '../types/users';
import { checkAccessMaster } from '../utils/permissions';

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="d-flex justify-content-between py-2 border-bottom">
    <span className="fw-semibold">{label}</span>
    <span className="text-end ms-3" style={{ maxWidth: '65%' }}>
      {value ?? '-'}
    </span>
  </div>
);

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams<{ type: UserProfileType; userId: string }>();
  const profileType: UserProfileType = params.type === 'helpdesk' ? 'helpdesk' : 'requester';
  const userId = params.userId || '';

  const canViewProfile = useMemo(() => checkAccessMaster(['UserProfile']), []);

  const { data: requesterUser, apiHandler: requesterHandler, pending: requesterPending } = useApi<RequesterUser>();
  const { data: helpdeskUser, apiHandler: helpdeskHandler, pending: helpdeskPending } = useApi<HelpdeskUser>();

  useEffect(() => {
    if (!userId) return;
    if (profileType === 'requester') {
      requesterHandler(() => getRequesterUserDetails(userId));
    } else {
      helpdeskHandler(() => getHelpdeskUserDetails(userId));
    }
  }, [helpdeskHandler, profileType, requesterHandler, userId]);

  if (!canViewProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  const loading = profileType === 'requester' ? requesterPending : helpdeskPending;
  const profile = profileType === 'requester' ? requesterUser : helpdeskUser;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{t('User Profile')}</h3>
        <span className="badge bg-primary text-uppercase">{t(profileType === 'requester' ? 'Requester' : 'Helpdesk')}</span>
      </div>

      {loading && <div className="mb-3">{t('Loading...')}</div>}

      {!loading && !profile && (
        <div className="alert alert-warning" role="alert">
          {t('No data available')}
        </div>
      )}

      {profile && profileType === 'requester' && (
        <>
          <CustomFieldset title={t('Primary Details')}>
            <DetailRow label={t('User ID')} value={profile.requesterUserId} />
            <DetailRow label={t('Name')} value={profile.name} />
            <DetailRow label={t('Username')} value={profile.username} />
            <DetailRow label={t('Email ID')} value={profile.emailId} />
            <DetailRow label={t('Mobile No.')} value={profile.mobileNo} />
            <DetailRow label={t('Office')} value={profile.office} />
            <DetailRow label={t('Stakeholder')} value={profile.stakeholder} />
            <DetailRow label={t('Roles')} value={profile.roles} />
          </CustomFieldset>

          <CustomFieldset title={t('Additional Information')}>
            <DetailRow label={t('First Name')} value={profile.firstName} />
            <DetailRow label={t('Middle Name')} value={profile.middleName} />
            <DetailRow label={t('Last Name')} value={profile.lastName} />
            <DetailRow label={t('Date of Joining')} value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleString() : undefined} />
            <DetailRow label={t('Date of Retirement')} value={profile.dateOfRetirement ? new Date(profile.dateOfRetirement).toLocaleString() : undefined} />
            <DetailRow label={t('Office Type')} value={profile.officeType} />
            <DetailRow label={t('Office Code')} value={profile.officeCode} />
          </CustomFieldset>
        </>
      )}

      {profile && profileType === 'helpdesk' && (
        <>
          <CustomFieldset title={t('Primary Details')}>
            <DetailRow label={t('User ID')} value={profile.userId} />
            <DetailRow label={t('Name')} value={profile.name} />
            <DetailRow label={t('Username')} value={profile.username} />
            <DetailRow label={t('Email ID')} value={profile.emailId} />
            <DetailRow label={t('Mobile No.')} value={profile.mobileNo} />
            <DetailRow label={t('Office')} value={profile.office} />
            <DetailRow label={t('Stakeholder')} value={profile.stakeholder} />
            <DetailRow label={t('Roles')} value={profile.roles} />
          </CustomFieldset>

          <CustomFieldset title={t('Additional Information')}>
            <DetailRow label={t('Levels')} value={profile.levels?.join(', ')} />
          </CustomFieldset>
        </>
      )}
    </div>
  );
};

export default UserProfile;
