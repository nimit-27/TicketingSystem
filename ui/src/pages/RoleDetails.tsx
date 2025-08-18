import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getRolePermission, updateRolePermission, updateRole, loadPermissions, renameRole, getAllRoles } from '../services/RoleService';
import { getStatusActions } from '../services/StatusService';
import { getCurrentUserDetails } from '../config/config';
import Title from '../components/Title';
import PermissionTree from '../components/Permissions/PermissionTree';
import JsonEditModal from '../components/Permissions/JsonEditModal';
import { Button, Chip, TextField, Autocomplete } from '@mui/material';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import { useSnackbar } from '../context/SnackbarContext';
import { DevModeContext } from '../context/DevModeContext';

const RoleDetails: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const { data, apiHandler } = useApi<any>();
    const { data: actions, apiHandler: actionsApiHandler } = useApi<any>();
    const { data: rolesData, apiHandler: rolesApiHandler } = useApi<any>();
    const [perm, setPerm] = useState<any>(null);
    const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const { showMessage } = useSnackbar();
    const { devMode } = useContext(DevModeContext);
    const [openJson, setOpenJson] = useState(false);
    const [editing, setEditing] = useState(false);
    const [roleName, setRoleName] = useState(roleId || '');
    const navigate = useNavigate();

    useEffect(() => {
        if (roleId) {
            apiHandler(() => getRolePermission(roleId));
            rolesApiHandler(() => getAllRoles());
            actionsApiHandler(() => getStatusActions());
            setRoleName(roleId);
        }
    }, [roleId]);

    useEffect(() => {
        if (rolesData && roleId) {
            const role = (rolesData as any[]).find(r => r.role === roleId);
            if (role) {
                if (role.allowedStatusActionIds) {
                    setSelectedActionIds(role.allowedStatusActionIds.split('|'));
                }
                if (role.description) {
                    setDescription(role.description);
                }
            }
        }
    }, [rolesData, roleId]);

    useEffect(() => {
        if (data) setPerm(data);
    }, [data]);

    function handleSubmit(this: any) {
        if (roleId) {
            updateRolePermission(roleId, this ?? perm).then(() => {
                const user = getCurrentUserDetails();
                const allowedStatusActionIds = selectedActionIds.join('|');
                updateRole(roleId, { updatedBy: user?.userId, allowedStatusActionIds }).then(() => {
                    showMessage('Permissions updated successfully', 'success');
                    loadPermissions();
                });
            });
        }
    };

    const handleJsonEdit = (json: any) => {
        setPerm(json);
        setOpenJson(false);
        handleSubmit.call(json);
    }

    const submitRename = () => {
        if (!roleId || !roleName || roleId === roleName) { setEditing(false); return; }
        const user = getCurrentUserDetails();
        renameRole(roleId, roleName, user?.username).then(() => {
            showMessage('Role updated successfully', 'success');
            navigate(`/role-master/${roleName}`);
        });
    };

    const cancelRename = () => {
        setRoleName(roleId || '');
        setEditing(false);
    };

    if (!roleId) return null;

    return (
        <div className="container">
            <div className="d-flex align-items-center mb-1">
                {editing ? (
                    <>
                        <TextField value={roleName} onChange={e => setRoleName(e.target.value)} size="small" className="me-2" />
                        <CustomIconButton icon="check" onClick={submitRename} style={{ minWidth: 0, padding: 2 }} />
                        <CustomIconButton icon="close" onClick={cancelRename} style={{ minWidth: 0, padding: 2 }} />
                    </>
                ) : (
                    <>
                        <Title textKey={`Role: ${roleName}`} />
                        <CustomIconButton icon="edit" onClick={() => setEditing(true)} style={{ minWidth: 0, padding: 2 }} />
                    </>
                )}
            </div>
            {description && <p className="text-muted mb-3">{description}</p>}
            {devMode && (
                <Chip label="JSON" size="small" onClick={() => setOpenJson(true)} sx={{ mb: 1 }} />
            )}
            <Autocomplete
                multiple
                disableCloseOnSelect
                options={actions || []}
                value={(actions || []).filter((a: any) => selectedActionIds.includes(String(a.id)))}
                onChange={(_, val) => setSelectedActionIds(val.map((a: any) => String(a.id)))}
                className="mb-3"
                getOptionLabel={(option: any) => option.action}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip label={option.action} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => <TextField {...params} label="Status Actions" />}
            />
            {perm && (
                <>
                    <h5>Permissions</h5>
                    <PermissionTree data={perm} onChange={setPerm} />
                </>
            )}
            <Button variant="contained" className="mt-3" onClick={handleSubmit}>Save</Button>
            {devMode && (
                <JsonEditModal open={openJson} data={perm} onCancel={() => setOpenJson(false)} onSubmit={handleJsonEdit} />
            )}
        </div>
    );
};

export default RoleDetails;
