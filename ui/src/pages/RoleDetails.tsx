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
    const { data: rolesData, pending: rolesApiPending, success: rolesApiSucsess, apiHandler: rolesApiHandler } = useApi<any>();
    const [perm, setPerm] = useState<any>(null);
    const [modifiedPermissions, setModifiedPermissions] = useState<any | null>(null);
    const isPermissionsModified = modifiedPermissions !== null;
    const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const { showMessage } = useSnackbar();
    const { devMode } = useContext(DevModeContext);
    const [openJson, setOpenJson] = useState(false);
    const [editing, setEditing] = useState(false);
    const [roleName, setRoleName] = useState('');
    const navigate = useNavigate();

    
    useEffect(() => {
        if (roleId) {
            apiHandler(() => getRolePermission(roleId));
            rolesApiHandler(() => getAllRoles());
            actionsApiHandler(() => getStatusActions());
        }
    }, [roleId]);
    
    useEffect(() => {
        if (rolesData && rolesApiSucsess) {
            setRoleName(rolesData.filter((r: any) => r.roleId === parseInt(roleId ?? ""))[0]?.role || '');
        }
    }, [rolesApiSucsess])

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

    const handleSubmit = (submitPerm = isPermissionsModified ? modifiedPermissions : perm) => {
        if (roleId) {
            updateRolePermission(roleId, submitPerm).then(() => {
                const user = getCurrentUserDetails();
                const allowedStatusActionIds = selectedActionIds.join('|');
                updateRole(roleId, { updatedBy: user?.userId, allowedStatusActionIds }).then(() => {
                    showMessage('Permissions updated successfully', 'success');
                    loadPermissions();
                    setPerm(submitPerm);
                    setModifiedPermissions(null);
                });
            });
        }
    };

    const handleJsonEdit = (json: any) => {
        setModifiedPermissions(json);
        setOpenJson(false);
        handleSubmit(json);
    }

    const handlePermissionChange = (p: any) => {
        setModifiedPermissions(p);
    };

    const cancelPermissionChanges = () => {
        setModifiedPermissions(null);
    };

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

            {devMode && <Chip label="JSON" size="small" onClick={() => setOpenJson(true)} sx={{ mb: 1 }} />}
            {perm && (
                <>
                    <h5>Permissions</h5>
                    <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', padding: 8 }}>
                        <PermissionTree data={isPermissionsModified ? modifiedPermissions : perm} onChange={handlePermissionChange} />
                    </div>
                </>
            )}
            <div className="mt-3">
                <Button variant="contained" onClick={() => handleSubmit()} className="me-2">Save</Button>
                <Button variant="outlined" onClick={cancelPermissionChanges} disabled={!isPermissionsModified}>Cancel</Button>
            </div>
            {devMode && (
                <JsonEditModal open={openJson} data={isPermissionsModified ? modifiedPermissions : perm} onCancel={() => setOpenJson(false)} onSubmit={handleJsonEdit} />
            )}
        </div>
    );
};

export default RoleDetails;
