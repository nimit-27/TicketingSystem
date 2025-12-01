import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import Title from '../components/Title';
import { useApi } from '../hooks/useApi';
import { getAllRoles } from '../services/RoleService';
import { getStakeholders } from '../services/StakeholderService';
import { getAllLevels } from '../services/LevelService';
import { createUser, CreateUserPayload } from '../services/UserService';
import { useSnackbar } from '../context/SnackbarContext';

type RoleResponse = {
  roleId?: number | string;
  role?: string;
  isDeleted?: boolean;
};

type StakeholderResponse = {
  id?: number | string;
  description?: string;
};

type LevelResponse = {
  levelId?: string;
  levelName?: string;
};

interface AddUserFormValues {
  username: string;
  name: string;
  emailId: string;
  mobileNo: string;
  office: string;
  roleIds: string[];
  stakeholderIds: string[];
  levelIds: string[];
}

const defaultValues: AddUserFormValues = {
  username: '',
  name: '',
  emailId: '',
  mobileNo: '',
  office: '',
  roleIds: [],
  stakeholderIds: [],
  levelIds: [],
};

const DEFAULT_PASSWORD = 'AnnaDarpan@123';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddUserFormValues>({ defaultValues });

  const {
    data: rolesData,
    pending: rolesPending,
    apiHandler: fetchRoles,
  // } = useApi<RoleResponse[]>();
  } = useApi<any>();
  const {
    data: stakeholdersData,
    pending: stakeholdersPending,
    apiHandler: fetchStakeholders,
  } = useApi<StakeholderResponse[]>();
  const {
    data: levelsData,
    pending: levelsPending,
    apiHandler: fetchLevels,
  } = useApi<LevelResponse[]>();
  const {
    pending: creatingUser,
    apiHandler: createUserHandler,
  } = useApi<any>();

  useEffect(() => {
    fetchRoles(() => getAllRoles());
    fetchStakeholders(() => getStakeholders());
    fetchLevels(() => getAllLevels());
  }, [fetchRoles, fetchStakeholders, fetchLevels]);

  const roleOptions = useMemo(() => {
    if (!Array.isArray(rolesData)) return [] as { value: string; label: string }[];
    return rolesData
      .filter((role) => !(role?.isDeleted ?? false))
      .map((role) => ({
        value: String(role?.roleId ?? role?.role ?? ''),
        label: role?.role ?? String(role?.roleId ?? ''),
      }))
      .filter((option) => option.value && option.label);
  }, [rolesData]);

  const stakeholderOptions = useMemo(() => {
    if (!Array.isArray(stakeholdersData)) return [] as { value: string; label: string }[];
    return stakeholdersData
      .map((stakeholder) => ({
        value: stakeholder?.id != null ? String(stakeholder.id) : '',
        label: stakeholder?.description ?? '',
      }))
      .filter((option) => option.value && option.label);
  }, [stakeholdersData]);

  const levelOptions = useMemo(() => {
    if (!Array.isArray(levelsData)) return [] as { value: string; label: string }[];
    return levelsData
      .map((level) => ({
        value: level?.levelId ?? '',
        label: level?.levelName ?? level?.levelId ?? '',
      }))
      .filter((option) => option.value && option.label);
  }, [levelsData]);

  const roleLabelMap = useMemo(() => new Map(roleOptions.map((option) => [option.value, option.label])), [roleOptions]);
  const stakeholderLabelMap = useMemo(
    () => new Map(stakeholderOptions.map((option) => [option.value, option.label])),
    [stakeholderOptions]
  );
  const levelLabelMap = useMemo(() => new Map(levelOptions.map((option) => [option.value, option.label])), [levelOptions]);

  const renderSelection = useCallback(
    (selected: unknown, labelMap: Map<string, string>) => {
      const values = Array.isArray(selected) ? (selected as string[]) : [];
      if (!values.length) {
        return t('No selection');
      }
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {values.map((value) => (
            <Chip key={value} size="small" label={labelMap.get(value) ?? value} />
          ))}
        </Box>
      );
    },
    [t]
  );

  const onSubmit = useCallback(
    (values: AddUserFormValues) => {
      const payload: CreateUserPayload = {
        username: values.username.trim(),
        name: values.name.trim(),
        emailId: values.emailId.trim(),
        mobileNo: values.mobileNo.trim(),
        office: values.office.trim(),
        password: DEFAULT_PASSWORD,
        roleIds: values.roleIds,
        stakeholderIds: values.stakeholderIds,
        levelIds: values.levelIds,
      };

      return createUserHandler(() => createUser(payload)).then((createdUser: any) => {
        const displayName = createdUser?.name || createdUser?.username || payload.name || payload.username;
        showMessage(t('User {{name}} created successfully', { name: displayName }), 'success');
        reset(defaultValues);
      });
    },
    [createUserHandler, reset, showMessage, t]
  );

  const handleCancel = useCallback(() => {
    reset(defaultValues);
    if (window.history.length > 1) {
      navigate(-1);
    }
  }, [navigate, reset]);

  const isLoadingOptions = useMemo(
    () => rolesPending || stakeholdersPending || levelsPending,
    [rolesPending, stakeholdersPending, levelsPending]
  );

  return (
    <div className="container">
      <Title textKey="Add New User" />
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {t('Provide complete details to create a new user account.')}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>
            {/* <Grid item xs={12} md={6}> */}
            <div className=''>
              <TextField
                label={t('Username')}
                fullWidth
                {...register('username', {
                  required: t('Username is required'),
                  minLength: { value: 3, message: t('Username must be at least 3 characters') },
                })}
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
                autoComplete="username"
              />
            </div>
            <div className=''>
              <TextField
                label={t('Name')}
                fullWidth
                {...register('name', {
                  required: t('Name is required'),
                  minLength: { value: 2, message: t('Name must be at least 2 characters') },
                })}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            </div>
            <div className=''>
              <TextField
                label={t('Email ID')}
                type="email"
                fullWidth
                {...register('emailId', {
                  required: t('Email is required'),
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: t('Enter a valid email address'),
                  },
                })}
                error={Boolean(errors.emailId)}
                helperText={errors.emailId?.message}
                autoComplete="email"
              />
            </div>
            <div className=''>
              <TextField
                label={t('Mobile No.')}
                type="tel"
                fullWidth
                {...register('mobileNo', {
                  required: t('Mobile number is required'),
                  pattern: {
                    value: /^[0-9+\-() ]{7,20}$/,
                    message: t('Enter a valid mobile number'),
                  },
                })}
                error={Boolean(errors.mobileNo)}
                helperText={errors.mobileNo?.message}
                autoComplete="tel"
              />
            </div>
            <div className=''>
              <TextField
                label={t('Office')}
                fullWidth
                {...register('office', {
                  required: t('Office is required'),
                })}
                error={Boolean(errors.office)}
                helperText={errors.office?.message}
              />
            </div>
            <div className=''>
              <Controller
                control={control}
                name="roleIds"
                rules={{
                  validate: (value) => (value?.length ? true : t('Please select at least one role')),
                }}
                render={({ field }) => (
                  <TextField
                    select
                    label={t('Roles')}
                    fullWidth
                    SelectProps={{
                      multiple: true,
                      value: field.value ?? [],
                      onChange: (event) => field.onChange(event.target.value as string[]),
                      renderValue: (selected) => renderSelection(selected, roleLabelMap),
                    }}
                    value={field.value ?? []}
                    onBlur={field.onBlur}
                    error={Boolean(errors.roleIds)}
                    helperText={errors.roleIds?.message}
                    disabled={isLoadingOptions}
                  >
                    {roleOptions.length ? (
                      roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        {t('No options available')}
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />
            </div>
            <div className=''>
              <Controller
                control={control}
                name="levelIds"
                rules={{
                  validate: (value) => (value?.length ? true : t('Please select at least one level')),
                }}
                render={({ field }) => (
                  <TextField
                    select
                    label={t('Levels')}
                    fullWidth
                    SelectProps={{
                      multiple: true,
                      value: field.value ?? [],
                      onChange: (event) => field.onChange(event.target.value as string[]),
                      renderValue: (selected) => renderSelection(selected, levelLabelMap),
                    }}
                    value={field.value ?? []}
                    onBlur={field.onBlur}
                    error={Boolean(errors.levelIds)}
                    helperText={errors.levelIds?.message}
                    disabled={isLoadingOptions}
                  >
                    {levelOptions.length ? (
                      levelOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        {t('No options available')}
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />
            </div>
            <div className=''>
              <Controller
                control={control}
                name="stakeholderIds"
                rules={{
                  validate: (value) => (value?.length ? true : t('Please select at least one stakeholder')),
                }}
                render={({ field }) => (
                  <TextField
                    select
                    label={t('Stakeholder')}
                    fullWidth
                    SelectProps={{
                      multiple: true,
                      value: field.value ?? [],
                      onChange: (event) => field.onChange(event.target.value as string[]),
                      renderValue: (selected) => renderSelection(selected, stakeholderLabelMap),
                    }}
                    value={field.value ?? []}
                    onBlur={field.onBlur}
                    error={Boolean(errors.stakeholderIds)}
                    helperText={errors.stakeholderIds?.message}
                    disabled={isLoadingOptions}
                  >
                    {stakeholderOptions.length ? (
                      stakeholderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        {t('No options available')}
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />
            </div>
          </Grid>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={handleCancel} disabled={creatingUser}>
              {t('Cancel')}
            </Button>
            <Button variant="contained" type="submit" disabled={creatingUser || isLoadingOptions}>
              {creatingUser ? <CircularProgress size={20} color="inherit" /> : t('Submit')}
            </Button>
          </Stack>
        </form>
      </Card>
    </div>
  );
};

export default AddUser;

