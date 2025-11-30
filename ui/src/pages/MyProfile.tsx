import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, CardContent, Grid, TextField, Typography, Chip } from '@mui/material';
import { getCurrentUserDetails } from '../config/config';
import { useApi } from '../hooks/useApi';
import { getUserDetails, updateUser } from '../services/UserService';
import { setUserDetails } from '../utils/Utils';

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

const MyProfile: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUserDetails();
  const userId = currentUser?.userId;

  const [formState, setFormState] = useState({
    name: '',
    emailId: '',
    mobileNo: '',
    username: '',
  });

  const { data: profileData, pending, apiHandler: loadProfile } = useApi<any>();
  const { pending: saving, apiHandler: saveProfile } = useApi<any>();

  useEffect(() => {
    if (userId) {
      loadProfile(() => getUserDetails(userId));
    }
  }, [loadProfile, userId]);

  useEffect(() => {
    const payload: ProfilePayload | undefined = profileData?.data ?? profileData;
    if (payload) {
      setFormState({
        name: payload.name ?? '',
        emailId: payload.emailId ?? '',
        mobileNo: payload.mobileNo ?? '',
        username: payload.username ?? '',
      });
    }
  }, [profileData]);

  const roleBadges = useMemo(() => {
    const payload: ProfilePayload | undefined = profileData?.data ?? profileData;
    const roles = payload?.roleNames ?? payload?.roles?.split(',') ?? [];
    return roles.map((role) => role.trim()).filter(Boolean);
  }, [profileData]);

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async () => {
    const payload: ProfilePayload | undefined = profileData?.data ?? profileData;
    if (!payload) return;

    await saveProfile(() =>
      updateUser(userId, {
        ...payload,
        name: formState.name,
        emailId: formState.emailId,
        mobileNo: formState.mobileNo,
        username: formState.username,
      }),
    );

    setUserDetails({
      ...currentUser,
      name: formState.name,
      email: formState.emailId,
      phone: formState.mobileNo,
      username: formState.username,
    } as any);

    alert(t('Profile updated successfully'));
  };

  const payload: ProfilePayload | undefined = profileData?.data ?? profileData;

  return (
    <div className="container mt-4">
      <Typography variant="h5" className="mb-3">{t('My Profile')}</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label={t('Name')}
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                fullWidth
                disabled={pending}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label={t('Email ID')}
                value={formState.emailId}
                onChange={(e) => setFormState((prev) => ({ ...prev, emailId: e.target.value }))}
                fullWidth
                disabled={pending}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label={t('Mobile No.')}
                value={formState.mobileNo}
                onChange={(e) => setFormState((prev) => ({ ...prev, mobileNo: e.target.value }))}
                fullWidth
                disabled={pending}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label={t('Username')}
                value={formState.username}
                onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
                fullWidth
                disabled={pending}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label={t('User ID')} value={payload?.userId ?? ''} fullWidth disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField label={t('Stakeholder')} value={payload?.stakeholder ?? ''} fullWidth disabled />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>{t('Roles')}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {roleBadges.length ? roleBadges.map((role) => <Chip key={role} label={role} />) : <Typography>{t('No roles')}</Typography>}
              </Box>
            </Grid>
          </Grid>
          <Box className="d-flex justify-content-end mt-3">
            <Button variant="contained" onClick={handleSave} disabled={pending || saving}>
              {saving ? t('Saving...') : t('Save Changes')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;
