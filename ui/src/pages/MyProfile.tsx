import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomFieldset from '../components/CustomFieldset';
import { getCurrentUserDetails } from '../config/config';
import { useApi } from '../hooks/useApi';
import { getUserDetails } from '../services/UserService';

interface ProfilePayload {
  userId: string;
  username?: string;
  name?: string;
  emailId?: string;
  mobileNo?: string;
  office?: string;
  roles?: string;
  roleNames?: string[];
  stakeholder?: string;
  stakeholderId?: string;
}

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="d-flex justify-content-between py-2 border-bottom">
    <span className="fw-semibold">{label}</span>
    <span className="text-end ms-3" style={{ maxWidth: '65%' }}>
      {value ?? '-'}
    </span>
  </div>
);

const MyProfile: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUserDetails();
  const userId = currentUser?.userId;

  const { data: profileData, pending, apiHandler: loadProfile } = useApi<ProfilePayload>();

  useEffect(() => {
    if (userId) {
      loadProfile(() => getUserDetails(userId));
    }
  }, [loadProfile, userId]);

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  const payload: ProfilePayload | undefined = profileData?.data ?? profileData;

  const roleDisplay = useMemo(() => {
    const roles = payload?.roleNames ?? payload?.roles?.split(',') ?? [];
    return roles.map((role) => role.trim()).filter(Boolean).join(', ');
  }, [payload]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{t('My Profile')}</h3>
        {payload?.stakeholder && <span className="badge bg-primary text-uppercase">{payload.stakeholder}</span>}
      </div>

      {pending && <div className="mb-3">{t('Loading...')}</div>}

      {!pending && !payload && (
        <div className="alert alert-warning" role="alert">
          {t('No data available')}
        </div>
      )}

      {payload && (
        <>
          <CustomFieldset title={t('Primary Details')}>
            <DetailRow label={t('User ID')} value={payload.userId} />
            <DetailRow label={t('Name')} value={payload.name} />
            <DetailRow label={t('Username')} value={payload.username} />
            <DetailRow label={t('Email ID')} value={payload.emailId} />
            <DetailRow label={t('Mobile No.')} value={payload.mobileNo} />
            <DetailRow label={t('Office')} value={payload.office} />
            <DetailRow label={t('Stakeholder')} value={payload.stakeholder} />
            <DetailRow label={t('Roles')} value={roleDisplay} />
          </CustomFieldset>

          <CustomFieldset title={t('Additional Information')}>
            <DetailRow label={t('Stakeholder ID')} value={payload.stakeholderId} />
          </CustomFieldset>
        </>
      )}
    </div>
  );
};

export default MyProfile;
