import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Autocomplete, Chip, Button } from '@mui/material';
import PermissionsModal from '../components/Permissions/PermissionsModal';
import { getCurrentUserDetails } from '../config/config';
import CancelAndSubmitButtons from '../components/UI/Button/CancelAndSubmitButtons';

interface CreateRoleProps {
    roles: string[];
    permissions: any;
    permissionOptions: { label: string; value: string }[];
    statusActions: any[];
    parameterOptions: { label: string; value: string }[];
    onSubmit: (payload: any) => void;
    onCancel: () => void;
}

const CreateRole: React.FC<CreateRoleProps> = ({ roles, permissions, permissionOptions, statusActions, parameterOptions, onSubmit, onCancel }) => {
    const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = useForm({
        defaultValues: {
            role: '',
            description: '',
            permissionsList: [] as string[],
            actionIds: [] as string[],
            parameterIds: [] as string[]
        }
    });

    const [openCustom, setOpenCustom] = useState(false);
    const [prevPerms, setPrevPerms] = useState<string[]>([]);
    const [customPerm, setCustomPerm] = useState<any>(null);

    const selectedPerms = watch('permissionsList');
    const selectedActionIds = watch('actionIds');
    const selectedParameterIds = watch('parameterIds');

    const handlePermChange = (val: any) => {
        const value = Array.isArray(val) ? val : [val];
        if (value.includes('Custom')) {
            if (!selectedPerms.includes('Custom')) {
                setPrevPerms(selectedPerms);
                setOpenCustom(true);
            }
            setValue('permissionsList', ['Custom']);
        } else {
            setCustomPerm(null);
            setValue('permissionsList', value);
        }
    };

    const handleCustomClose = () => {
        setOpenCustom(false);
        if (selectedPerms.includes('Custom')) {
            setValue('permissionsList', prevPerms);
        }
    };

    const submit = (data: any) => {
        const list = data.permissionsList.filter((p: string) => p !== 'Custom');
        const user = getCurrentUserDetails();
        const allowedStatusActionIds = selectedActionIds.join('|');
        const parameterMaster = selectedParameterIds.join('|');
        const payload = {
            role: data.role,
            description: data.description,
            permissions: customPerm || null,
            permissionsList: list,
            allowedStatusActionIds,
            parameterMaster,
            createdBy: user?.name,
            updatedBy: user?.name
        };
        onSubmit(payload);
        reset();
        setCustomPerm(null);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="mb-3">
            <div className="d-flex mb-2">
                <TextField
                    label="Role name"
                    className="me-2 w-50"
                    {...register('role', { required: 'Role is required' })}
                    error={!!errors.role}
                    helperText={errors.role?.message as string}
                />
                <Controller
                    name="permissionsList"
                    control={control}
                    rules={{ required: 'Select at least one permission' }}
                    render={({ field }) => (
                        <Autocomplete
                            multiple={!field.value.includes('Custom')}
                            disableCloseOnSelect={!field.value.includes('Custom')}
                            options={["Custom", ...permissionOptions]}
                            value={field.value}
                            onChange={(_, val) => {
                                const normalized = (Array.isArray(val) ? val : [val]).map((item: any) =>
                                    typeof item === 'string' ? item : item.value
                                );
                                handlePermChange(normalized);
                            }}
                            className="w-50"
                            getOptionLabel={(option: any) => {
                                if (typeof option === 'string') return option;
                                return option.label;
                            }}
                            isOptionEqualToValue={(option: any, value: any) => {
                                if (typeof option === 'string' || typeof value === 'string') return option === value;
                                return option.value === value.value;
                            }}
                            renderTags={(value, getTagProps) =>
                                value.length === 0 ? (
                                    <em className="ms-1" style={{ color: '#888' }}>No selection</em>
                                ) : (
                                    value.map((option, index) => (
                                        <Chip
                                            label={typeof option === 'string'
                                                ? (permissionOptions.find((perm) => perm.value === option)?.label || option)
                                                : option.label}
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                )
                            }
                            renderOption={(props, option) => (
                                <li {...props} style={{ fontStyle: option === 'Custom' ? 'italic' : 'normal' }}>
                                    {typeof option === 'string' ? option : option.label}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Permissions"
                                    error={!!errors.permissionsList}
                                    helperText={errors.permissionsList?.message as string}
                                />
                            )}
                        />
                    )}
                />
            </div>
            <TextField
                label="Description"
                multiline
                rows={3}
                className="w-50 mb-2"
                {...register('description', { required: 'Description is required' })}
                error={!!errors.description}
                helperText={errors.description?.message as string}
            />
            <Controller
                name="actionIds"
                control={control}
                render={({ field }) => (
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={statusActions || []}
                        value={(statusActions || []).filter((a: any) => field.value.includes(String(a.id)))}
                        onChange={(_, val) => field.onChange(val.map((a: any) => String(a.id)))}
                        className="w-50 mb-2"
                        getOptionLabel={(option: any) =>
                            `${option.action} (${option.currentStatusName || option.currentStatus} → ${option.nextStatusName || option.nextStatus})`
                        }
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={`${option.action} (${option.currentStatusName || option.currentStatus} → ${option.nextStatusName || option.nextStatus})`}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Status Actions" />}
                    />
                )}
            />
            <Controller
                name="parameterIds"
                control={control}
                render={({ field }) => (
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={parameterOptions || []}
                        value={(parameterOptions || []).filter((p: any) => field.value.includes(String(p.value)))}
                        onChange={(_, val) => field.onChange(val.map((p: any) => String(p.value)))}
                        className="w-50 mb-2"
                        getOptionLabel={(option: any) => option.label}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip label={option.label} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Parameters" />}
                    />
                )}
            />
            <CancelAndSubmitButtons handleCancel={onCancel} typeSubmit />

            <PermissionsModal
                open={openCustom}
                roles={roles}
                permissions={permissions}
                title="Custom Permissions"
                onClose={handleCustomClose}
                onSubmit={(perm) => {
                    setCustomPerm(perm);
                    if (!selectedPerms.includes('Custom')) setValue('permissionsList', ['Custom']);
                    setOpenCustom(false);
                }}
            />
        </form>
    );
};

export default CreateRole;
