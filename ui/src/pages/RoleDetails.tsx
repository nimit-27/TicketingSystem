import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { updateRolePermission, updateRole, loadPermissions, renameRole, getAllRoles } from '../services/RoleService';
import { getStatusActions } from '../services/StatusService';
import { getCurrentUserDetails } from '../config/config';
import Title from '../components/Title';
import PermissionTree from '../components/Permissions/PermissionTree';
import JsonEditModal from '../components/Permissions/JsonEditModal';
import { Button, Chip, TextField, Autocomplete, Menu, MenuItem, CircularProgress } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import { useSnackbar } from '../context/SnackbarContext';
import { DevModeContext } from '../context/DevModeContext';

const RoleDetails: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();

    const navigate = useNavigate();

    const { devMode } = useContext(DevModeContext);

    const { showMessage } = useSnackbar();

    const location = useLocation();

    let roleData = location?.state as any;

    const { data: actions, apiHandler: actionsApiHandler } = useApi<any>();
    const { data: rolesData, pending: rolesApiPending, success: rolesApiSucsess, apiHandler: rolesApiHandler } = useApi<any>();

    const [perm, setPerm] = useState<any>(roleData?.permissions || null);
    const [modifiedPermissions, setModifiedPermissions] = useState<any | null>(null);
    const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [openJson, setOpenJson] = useState(false);
    const [editing, setEditing] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [roleMenuAnchorEl, setRoleMenuAnchorEl] = useState<null | HTMLElement>(null);

    const resolvedRoleName = (roleName || roleData?.role || '').toString();
    const isMasterRole = resolvedRoleName.toLowerCase() === 'master';
    const canEditStructure = devMode && isMasterRole;

    const isPermissionsModified = modifiedPermissions !== null;

    
    useEffect(() => {
        if (roleId) {
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
            const role = (rolesData as any[]).find(r => String(r.roleId) === roleId || r.role === roleId);
            if (role) {
                if (role.allowedStatusActionIds) {
                    setSelectedActionIds(role.allowedStatusActionIds.split('|'));
                }
                if (role.description) {
                    setDescription(role.description);
                }
                // if (role.permissions) {
                //     setPerm(role.permissions);
                // }
            }
        }
    }, [rolesData, roleId]);

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

    const availableRoles = Array.isArray(rolesData) ? rolesData : [];
    const isRoleMenuOpen = Boolean(roleMenuAnchorEl);

    const handleTitleClick = (event: React.MouseEvent<HTMLHeadingElement>) => {
        setRoleMenuAnchorEl(event.currentTarget);
    };

    const handleRoleMenuClose = () => {
        setRoleMenuAnchorEl(null);
    };

    const handleRoleSelection = (role: any) => {
        handleRoleMenuClose();
        if (!role) return;
        const target = role.roleId ?? role.role;
        if (!target) return;
        navigate(`/role-master/${target}`, { state: role });
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
                        <Title
                            textKey={`Role: ${roleName}`}
                            onClick={handleTitleClick}
                            rightContent={rolesApiPending ? <CircularProgress size={20} /> : <KeyboardArrowDownIcon />}
                        />
                        <CustomIconButton icon="edit" onClick={() => setEditing(true)} style={{ minWidth: 0, padding: 2 }} />
                    </>
                )}
            </div>
            <Menu
                anchorEl={roleMenuAnchorEl}
                open={isRoleMenuOpen}
                onClose={handleRoleMenuClose}
            >
                {rolesApiPending && (
                    <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Loading roles...
                    </MenuItem>
                )}
                {!rolesApiPending && availableRoles.map((role: any) => (
                    <MenuItem
                        key={role.roleId ?? role.role}
                        selected={String(role.roleId ?? role.role) === roleId}
                        onClick={() => handleRoleSelection(role)}
                    >
                        {role.role}
                    </MenuItem>
                ))}
                {!rolesApiPending && !availableRoles.length && (
                    <MenuItem disabled>No roles available</MenuItem>
                )}
            </Menu>
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

            {canEditStructure && <Chip label="JSON" size="small" onClick={() => setOpenJson(true)} sx={{ mb: 1 }} />}
            {perm && (
                <>
                    <h5>Permissions</h5>
                    <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', padding: 8 }}>
                        <PermissionTree
                            data={isPermissionsModified ? modifiedPermissions : perm}
                            onChange={handlePermissionChange}
                            allowStructureEdit={canEditStructure}
                            defaultShowForNewNodes={isMasterRole}
                        />
                    </div>
                </>
            )}
            <div className="mt-3">
                <Button variant="contained" onClick={() => handleSubmit()} className="me-2">Save</Button>
                <Button variant="outlined" onClick={cancelPermissionChanges} disabled={!isPermissionsModified}>Cancel</Button>
            </div>
            {canEditStructure && (
                <JsonEditModal open={openJson} data={isPermissionsModified ? modifiedPermissions : perm} onCancel={() => setOpenJson(false)} onSubmit={handleJsonEdit} />
            )}
        </div>
    );
};

export default RoleDetails;
