import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Autocomplete, Chip, Button } from '@mui/material';
import PermissionsModal from '../components/Permissions/PermissionsModal';
import { getCurrentUserDetails } from '../config/config';

interface CreateRoleProps {
    roles: string[];
    permissions: any;
    statusActions: any[];
    onSubmit: (payload: any) => void;
    onCancel: () => void;
}

const CreateRole: React.FC<CreateRoleProps> = ({ roles, permissions, statusActions, onSubmit, onCancel }) => {
    const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = useForm({
        defaultValues: {
            role: '',
            description: '',
            permissionsList: [] as string[],
            actionIds: [] as string[]
        }
    });

    const [openCustom, setOpenCustom] = useState(false);
    const [prevPerms, setPrevPerms] = useState<string[]>([]);
    const [customPerm, setCustomPerm] = useState<any>(null);

    const selectedPerms = watch('permissionsList');
    const selectedActionIds = watch('actionIds');

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
        const payload = {
            role: data.role,
            description: data.description,
            permissions: customPerm || null,
            permissionsList: list,
            allowedStatusActionIds,
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
                            options={["Custom", ...roles]}
                            value={field.value}
                            onChange={(_, val) => handlePermChange(val)}
                            className="w-50"
                            renderTags={(value, getTagProps) =>
                                value.length === 0 ? (
                                    <em className="ms-1" style={{ color: '#888' }}>No selection</em>
                                ) : (
                                    value.map((option, index) => (
                                        <Chip label={option} {...getTagProps({ index })} />
                                    ))
                                )
                            }
                            renderOption={(props, option) => (
                                <li {...props} style={{ fontStyle: option === 'Custom' ? 'italic' : 'normal' }}>{option}</li>
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
                        getOptionLabel={(option: any) => option.action}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip label={option.action} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Status Actions" />}
                    />
                )}
            />
            <div>
                <Button type="submit" variant="contained" className="me-2">Submit</Button>
                <Button variant="outlined" onClick={onCancel}>Cancel</Button>
            </div>
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
